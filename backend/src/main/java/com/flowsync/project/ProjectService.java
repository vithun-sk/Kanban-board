package com.flowsync.project;

import com.flowsync.exception.BadRequestException;
import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.message.ConversationDto;
import com.flowsync.message.ProjectConversationService;
import com.flowsync.task.TaskRepository;
import com.flowsync.task.TaskStatus;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Set<String> ALLOWED_MEMBER_ROLES =
            Set.of("Owner", "Admin", "Developer", "Designer", "QA", "Member");

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectConversationService projectConversationService;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            ProjectConversationService projectConversationService
    ) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.projectConversationService = projectConversationService;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getAccessibleProjects(String userId) {
        List<Project> projects = projectRepository.findAccessibleProjects(userId);
        return projects.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(String projectId, String userId) {
        Project project = projectRepository.findByIdWithMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectAccess(project, userId);
        return toDto(project);
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, String userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        String projectId = UUID.randomUUID().toString();
        Project project = new Project(
                projectId,
                request.getName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : "",
                request.getStatus(),
                request.getVisibility(),
                request.getColor(),
                request.getStartDate(),
                request.getEffectiveDueDate(),
                creator
        );

        ProjectMember ownerMember = new ProjectMember(
                UUID.randomUUID().toString(),
                project,
                creator,
                "Owner"
        );
        project.getMembers().add(ownerMember);

        if (request.getMemberIds() != null) {
            for (String memberId : request.getMemberIds()) {
                if (!memberId.equals(userId)) {
                    userRepository.findById(memberId).ifPresent(user -> {
                        ProjectMember pm = new ProjectMember(UUID.randomUUID().toString(), project, user, "Member");
                        project.getMembers().add(pm);
                    });
                }
            }
        }

        Project saved = projectRepository.save(project);
        return toDto(saved);
    }

    @Transactional
    public ProjectDto updateProject(String projectId, UpdateProjectRequest request, String userId) {
        Project project = projectRepository.findByIdWithMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectModification(project, userId);

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getVisibility() != null) {
            project.setVisibility(request.getVisibility());
        }
        if (request.getColor() != null) {
            project.setColor(request.getColor());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEffectiveDueDate() != null) {
            project.setDueDate(request.getEffectiveDueDate());
        }

        Project saved = projectRepository.save(project);
        return toDto(saved);
    }

    @Transactional
    public void deleteProject(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectModification(project, userId);
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDto> getProjectMembers(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectAccess(project, userId);
        return memberRepository.findByProjectId(projectId).stream()
                .map(ProjectMemberDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberDto addProjectMember(String projectId, AddMemberRequest request, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectModification(project, userId);

        User targetUser = resolveRegisteredUser(request);

        if (targetUser.getId().equals(project.getCreatedBy().getId())) {
            throw new BadRequestException("The project owner is already a member of this project.");
        }

        if (memberRepository.existsByProjectIdAndUserId(projectId, targetUser.getId())) {
            throw new BadRequestException(targetUser.getName() + " is already a member of this project.");
        }

        ProjectMember member = new ProjectMember(
                UUID.randomUUID().toString(),
                project,
                targetUser,
                normalizeRole(request.getRole(), project, userId)
        );
        ProjectMember saved = memberRepository.save(member);
        projectConversationService.addParticipant(projectId, targetUser.getId());
        return ProjectMemberDto.fromEntity(saved);
    }

    /**
     * Resolves the target member from an existing FlowSync account only.
     * Unknown emails or user ids are rejected instead of creating an account.
     */
    private User resolveRegisteredUser(AddMemberRequest request) {
        String requestedUserId = request.getUserId() != null ? request.getUserId().trim() : "";
        String requestedEmail = request.getEmail() != null ? request.getEmail().trim() : "";

        if (requestedUserId.isEmpty() && requestedEmail.isEmpty()) {
            throw new BadRequestException("Provide the email address or user id of a registered FlowSync account.");
        }

        if (!requestedEmail.isEmpty()) {
            if (!EMAIL_PATTERN.matcher(requestedEmail).matches()) {
                throw new BadRequestException("Enter a valid email address.");
            }
            String normalizedEmail = requestedEmail.toLowerCase(Locale.ROOT);
            return userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new BadRequestException(
                            "No registered FlowSync account found for '" + normalizedEmail
                                    + "'. The person must create an account before joining a project."));
        }

        return userRepository.findById(requestedUserId)
                .orElseThrow(() -> new BadRequestException(
                        "No registered FlowSync account found for user id '" + requestedUserId + "'."));
    }

    private String normalizeRole(String requestedRole, Project project, String actingUserId) {
        String role = requestedRole != null && !requestedRole.isBlank() ? requestedRole.trim() : "Member";
        if (!ALLOWED_MEMBER_ROLES.contains(role)) {
            throw new BadRequestException("Role must be one of: " + String.join(", ", ALLOWED_MEMBER_ROLES) + ".");
        }
        if ("Owner".equals(role) && !project.getCreatedBy().getId().equals(actingUserId)) {
            throw new ForbiddenException("Only the project owner can assign the Owner role.");
        }
        return role;
    }

    @Transactional
    public ProjectMemberDto updateMemberRole(String projectId, String memberId, UpdateMemberRoleRequest request, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectModification(project, userId);

        ProjectMember pm = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Project membership not found."));

        if (!pm.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Membership does not belong to this project.");
        }

        pm.setRole(request.getRole());
        ProjectMember saved = memberRepository.save(pm);
        return ProjectMemberDto.fromEntity(saved);
    }

    @Transactional
    public void removeProjectMember(String projectId, String memberId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        validateProjectModification(project, userId);

        ProjectMember pm = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Project membership not found."));

        if (!pm.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Membership does not belong to this project.");
        }

        String removedUserId = pm.getUser().getId();

        if (removedUserId.equals(project.getCreatedBy().getId())) {
            throw new BadRequestException("Cannot remove project creator.");
        }

        // Only the project membership row is deleted. The user account and every other
        // project membership of that user stay untouched.
        memberRepository.delete(pm);
        projectConversationService.removeParticipant(projectId, removedUserId);
    }

    @Transactional(readOnly = true)
    public ConversationDto getProjectConversation(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        validateProjectAccess(project, userId);
        return projectConversationService.getOrCreateProjectConversation(projectId, userId);
    }

    @Transactional
    public ConversationDto openProjectConversation(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        validateProjectAccess(project, userId);
        return projectConversationService.getOrCreateProjectConversation(projectId, userId);
    }

    public void validateProjectAccess(Project project, String userId) {
        if (project.getCreatedBy().getId().equals(userId)) return;
        boolean isMember = memberRepository.existsByProjectIdAndUserId(project.getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have permission to access this project.");
        }
    }

    private void validateProjectModification(Project project, String userId) {
        if (project.getCreatedBy().getId().equals(userId)) return;
        ProjectMember pm = memberRepository.findByProjectIdAndUserId(project.getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have permission to modify this project."));
        if (!"Owner".equalsIgnoreCase(pm.getRole()) && !"Admin".equalsIgnoreCase(pm.getRole())) {
            throw new ForbiddenException("Only project owners or administrators can perform this action.");
        }
    }

    private ProjectDto toDto(Project project) {
        int totalTasks = taskRepository.countByProjectId(project.getId());
        int completedTasks = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE);
        return ProjectDto.fromEntity(project, totalTasks, completedTasks);
    }
}
