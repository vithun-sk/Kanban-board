package com.flowsync.project;

import com.flowsync.exception.BadRequestException;
import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.task.TaskRepository;
import com.flowsync.task.TaskStatus;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            UserRepository userRepository,
            TaskRepository taskRepository
    ) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ProjectDto> getAccessibleProjects(String userId) {
        List<Project> projects = projectRepository.findAccessibleProjects(userId);
        return projects.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

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

        User targetUser;
        if (request.getUserId() != null && !request.getUserId().isBlank()) {
            targetUser = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        } else if (request.getEmail() != null && !request.getEmail().isBlank()) {
            targetUser = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("No registered user found with email: " + request.getEmail()));
        } else {
            throw new BadRequestException("Either userId or email is required to add a member.");
        }

        if (memberRepository.existsByProjectIdAndUserId(projectId, targetUser.getId())) {
            throw new BadRequestException("User is already a member of this project.");
        }

        ProjectMember member = new ProjectMember(
                UUID.randomUUID().toString(),
                project,
                targetUser,
                request.getRole() != null ? request.getRole() : "Member"
        );
        ProjectMember saved = memberRepository.save(member);
        return ProjectMemberDto.fromEntity(saved);
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

        if (pm.getUser().getId().equals(project.getCreatedBy().getId())) {
            throw new BadRequestException("Cannot remove project creator.");
        }

        memberRepository.delete(pm);
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
