package com.flowsync.invitation;

import com.flowsync.exception.ConflictException;
import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.message.ProjectConversationService;
import com.flowsync.project.Project;
import com.flowsync.project.ProjectMember;
import com.flowsync.project.ProjectMemberRepository;
import com.flowsync.project.ProjectRepository;
import com.flowsync.project.ProjectService;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectInvitationService {

    private final ProjectInvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectConversationService projectConversationService;
    private final ProjectService projectService;

    public ProjectInvitationService(
            ProjectInvitationRepository invitationRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            UserRepository userRepository,
            ProjectConversationService projectConversationService,
            ProjectService projectService
    ) {
        this.invitationRepository = invitationRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.projectConversationService = projectConversationService;
        this.projectService = projectService;
    }

    @Transactional
    public ProjectInvitationDto sendInvitation(
            String projectId, CreateProjectInvitationRequest request, String inviterId
    ) {
        Project project = projectRepository.findByIdForUpdate(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        validateLeader(project, inviterId);

        User invitee = userRepository.findById(request.getInviteeId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Registered user not found."));

        if (memberRepository.findByProjectIdAndUserIdForUpdate(projectId, invitee.getId()).isPresent()
                || project.getCreatedBy().getId().equals(invitee.getId())) {
            throw new ConflictException("This user is already a member of the project.");
        }
        if (invitationRepository.existsByProjectIdAndInviteeIdAndStatus(
                projectId, invitee.getId(), InvitationStatus.PENDING)) {
            throw new ConflictException("A pending invitation already exists for this user.");
        }

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        ProjectInvitation invitation = invitationRepository.save(
                new ProjectInvitation(UUID.randomUUID().toString(), project, inviter, invitee));
        return ProjectInvitationDto.fromEntity(invitation);
    }

    @Transactional(readOnly = true)
    public List<ProjectInvitationDto> getIncomingInvitations(String userId) {
        return invitationRepository.findByInviteeIdOrderByCreatedAtDesc(userId).stream()
                .map(ProjectInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectInvitationDto> getProjectInvitations(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        validateLeader(project, userId);
        return invitationRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(ProjectInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectInvitationDto accept(String invitationId, String userId) {
        ProjectInvitation invitation = getLockedInvitation(invitationId);
        validateRecipient(invitation, userId);
        validatePending(invitation);

        Project project = invitation.getProject();
        claimTransition(invitation, InvitationStatus.ACCEPTED);
        if (memberRepository.findByProjectIdAndUserIdForUpdate(project.getId(), userId).isPresent()
                || project.getCreatedBy().getId().equals(userId)) {
            throw new ConflictException("You are already a member of this project.");
        }

        memberRepository.save(new ProjectMember(
                UUID.randomUUID().toString(), project, invitation.getInvitee(), "Member"));
        projectConversationService.addParticipant(project.getId(), userId);
        return persistTransition(invitation);
    }

    @Transactional
    public ProjectInvitationDto decline(String invitationId, String userId) {
        ProjectInvitation invitation = getLockedInvitation(invitationId);
        validateRecipient(invitation, userId);
        validatePending(invitation);
        claimTransition(invitation, InvitationStatus.DECLINED);
        return persistTransition(invitation);
    }

    @Transactional
    public ProjectInvitationDto cancel(String projectId, String invitationId, String userId) {
        Project project = projectRepository.findByIdForUpdate(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        validateLeader(project, userId);
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));
        if (!invitation.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Invitation not found for this project.");
        }
        if (!invitation.getInviter().getId().equals(userId)) {
            throw new ForbiddenException("Only the user who sent the invitation can cancel it.");
        }
        validatePending(invitation);
        claimTransition(invitation, InvitationStatus.CANCELLED);
        return persistTransition(invitation);
    }

    private ProjectInvitation getLockedInvitation(String invitationId) {
        ProjectInvitation found = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));
        projectRepository.findByIdForUpdate(found.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        return found;
    }

    private void validateLeader(Project project, String userId) {
        projectService.validateProjectLeader(project, userId);
    }

    private void validateRecipient(ProjectInvitation invitation, String userId) {
        if (!invitation.getInvitee().getId().equals(userId)) {
            throw new ForbiddenException("This invitation belongs to another user.");
        }
    }

    private void validatePending(ProjectInvitation invitation) {
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("This invitation is no longer pending.");
        }
    }

    private void claimTransition(
            ProjectInvitation invitation, InvitationStatus nextStatus
    ) {
        int updated = invitationRepository.transitionPending(
                invitation.getId(), InvitationStatus.PENDING, nextStatus);
        if (updated != 1) {
            throw new ConflictException("This invitation is no longer pending.");
        }
        invitation.setStatus(nextStatus);
    }

    private ProjectInvitationDto persistTransition(ProjectInvitation invitation) {
        return ProjectInvitationDto.fromEntity(invitationRepository.save(invitation));
    }
}
