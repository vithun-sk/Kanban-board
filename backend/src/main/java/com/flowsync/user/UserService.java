package com.flowsync.user;

import com.flowsync.exception.BadRequestException;
import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.message.ProjectConversationService;
import com.flowsync.project.Project;
import com.flowsync.project.ProjectMember;
import com.flowsync.project.ProjectMemberRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Set<String> ALLOWED_ROLES =
            Set.of("Owner", "Admin", "Developer", "Designer", "QA", "Member");

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectConversationService projectConversationService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ProjectMemberRepository projectMemberRepository,
            ProjectConversationService projectConversationService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.projectMemberRepository = projectMemberRepository;
        this.projectConversationService = projectConversationService;
    }

    public UserDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return UserDto.fromEntity(user);
    }

    /**
     * Looks up an existing account by email. Used by the frontend to verify that a
     * teammate is registered before they are added to a project. Unknown emails are
     * rejected instead of creating a new account.
     */
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        if (normalizedEmail.isEmpty()) {
            throw new BadRequestException("Email is required.");
        }
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new BadRequestException("Enter a valid email address.");
        }
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .map(UserDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No registered FlowSync account found for '" + normalizedEmail + "'."));
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        String requestedEmail = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(requestedEmail) && userRepository.existsByEmailIgnoreCase(requestedEmail)) {
            throw new BadRequestException("Email is already in use.");
        }

        user.setName(request.getName().trim());
        user.setEmail(requestedEmail);
        if (request.getTitle() != null) {
            user.setTitle(request.getTitle().trim());
        }

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Removes a user from the projects they belong to. The FlowSync account itself is
     * never deleted, and a user can only be removed from projects where the caller is the
     * project owner, a project admin, or the member themselves.
     */
    @Transactional
    public void removeProjectMemberships(String userId, String actingUserId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        List<ProjectMember> memberships = projectMemberRepository.findByUserId(userId);
        if (memberships.isEmpty()) {
            throw new BadRequestException("This user is not a member of any project.");
        }

        for (ProjectMember membership : memberships) {
            Project project = membership.getProject();
            if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(actingUserId)) {
                // the caller owns the project
            } else if (membership.getUser() != null && membership.getUser().getId().equals(actingUserId)) {
                // the caller removes themselves
            } else if (isProjectAdmin(project, actingUserId)) {
                // the caller administers the project
            } else {
                throw new ForbiddenException(
                        "You can only remove members from projects you own or administer.");
            }
        }

        for (ProjectMember membership : memberships) {
            String projectId = membership.getProject().getId();
            projectMemberRepository.delete(membership);
            projectConversationService.removeParticipant(projectId, userId);
        }
    }

    private boolean isProjectAdmin(Project project, String userId) {
        return projectMemberRepository.findByProjectIdAndUserId(project.getId(), userId)
                .map(membership -> "Owner".equalsIgnoreCase(membership.getRole())
                        || "Admin".equalsIgnoreCase(membership.getRole()))
                .orElse(false);
    }

    /**
     * Updates the workspace role of a member. Members can change their own role, and
     * administrators can change the role of anybody in the workspace.
     */
    @Transactional
    public UserDto updateRole(String userId, UpdateRoleRequest request, String actingUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!userId.equals(actingUserId)) {
            User actingUser = userRepository.findById(actingUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found."));
            if (!"Admin".equalsIgnoreCase(actingUser.getRole())) {
                throw new ForbiddenException("Only administrators can change the role of another member.");
            }
        }

        String role = request.getRole().trim();
        if (!ALLOWED_ROLES.contains(role)) {
            throw new BadRequestException("Role must be one of: " + String.join(", ", ALLOWED_ROLES) + ".");
        }

        user.setRole(role);
        return UserDto.fromEntity(userRepository.save(user));
    }
}
