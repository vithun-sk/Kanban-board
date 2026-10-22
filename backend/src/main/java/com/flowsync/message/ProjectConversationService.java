package com.flowsync.message;

import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.project.Project;
import com.flowsync.project.ProjectMember;
import com.flowsync.project.ProjectMemberRepository;
import com.flowsync.project.ProjectRepository;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Owns the shared conversation of a project team. The conversation is created on demand
 * and its participant list always mirrors the project membership, so a member that is
 * removed from a project also loses access to the team channel.
 */
@Service
public class ProjectConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ProjectConversationService(
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConversationDto getOrCreateProjectConversation(String projectId, String userId) {
        Project project = projectRepository.findByIdForUpdate(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        requireProjectMember(project, userId);

        Conversation conversation = conversationRepository.findByProjectId(projectId)
                .orElseGet(() -> new Conversation(UUID.randomUUID().toString(), project.getName(), projectId));

        if (conversation.getTitle() == null || conversation.getTitle().isBlank()) {
            conversation.setTitle(project.getName());
        }

        syncParticipants(conversation, project);

        Conversation saved = conversationRepository.save(conversation);
        return ConversationDto.fromEntity(saved);
    }

    /**
     * Adds a user to the project team channel when they join a project.
     */
    @Transactional
    public void addParticipant(String projectId, String userId) {
        Conversation conversation = conversationRepository.findByProjectId(projectId).orElse(null);
        if (conversation == null) {
            return;
        }
        if (conversationMemberRepository.existsByConversationIdAndUserId(conversation.getId(), userId)) {
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        conversation.getMembers().add(new ConversationMember(UUID.randomUUID().toString(), conversation, user));
        conversationRepository.save(conversation);
    }

    /**
     * Removes a user from the project team channel when they leave a project.
     */
    @Transactional
    public void removeParticipant(String projectId, String userId) {
        Conversation conversation = conversationRepository.findByProjectId(projectId).orElse(null);
        if (conversation == null) {
            return;
        }
        List<ConversationMember> members = new ArrayList<>(conversation.getMembers());
        for (ConversationMember member : members) {
            if (member.getUser() != null && member.getUser().getId().equals(userId)) {
                conversation.getMembers().remove(member);
            }
        }
        conversationRepository.save(conversation);
    }

    @Transactional(readOnly = true)
    public void requireProjectMember(Project project, String userId) {
        if (!hasProjectAccess(project, userId)) {
            throw new ForbiddenException("You are not a member of this project.");
        }
    }

    @Transactional(readOnly = true)
    public boolean hasProjectAccess(String projectId, String userId) {
        return projectRepository.findById(projectId)
                .map(project -> hasProjectAccess(project, userId))
                .orElse(false);
    }

    private boolean hasProjectAccess(Project project, String userId) {
        return (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId))
                || projectMemberRepository.existsByProjectIdAndUserId(project.getId(), userId);
    }

    private void syncParticipants(Conversation conversation, Project project) {
        Set<String> allowed = new HashSet<>();
        if (project.getCreatedBy() != null) {
            allowed.add(project.getCreatedBy().getId());
        }
        for (ProjectMember projectMember : projectMemberRepository.findByProjectId(project.getId())) {
            allowed.add(projectMember.getUser().getId());
        }

        Set<String> current = new HashSet<>();
        List<ConversationMember> toRemove = new ArrayList<>();
        for (ConversationMember member : conversation.getMembers()) {
            if (member.getUser() == null) {
                continue;
            }
            String memberUserId = member.getUser().getId();
            current.add(memberUserId);
            if (!allowed.contains(memberUserId)) {
                toRemove.add(member);
            }
        }
        conversation.getMembers().removeAll(toRemove);

        for (String userId : allowed) {
            if (current.contains(userId)) {
                continue;
            }
            userRepository.findById(userId).ifPresent(user ->
                    conversation.getMembers().add(new ConversationMember(UUID.randomUUID().toString(), conversation, user)));
        }
    }
}
