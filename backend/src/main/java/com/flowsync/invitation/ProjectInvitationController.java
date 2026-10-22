package com.flowsync.invitation;

import com.flowsync.common.ApiResponse;
import com.flowsync.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ProjectInvitationController {

    private final ProjectInvitationService invitationService;

    public ProjectInvitationController(ProjectInvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping("/invitations")
    public ResponseEntity<ApiResponse<List<ProjectInvitationDto>>> getIncoming(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                invitationService.getIncomingInvitations(principal.getId())));
    }

    @GetMapping("/projects/{projectId}/invitations")
    public ResponseEntity<ApiResponse<List<ProjectInvitationDto>>> getProjectInvitations(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                invitationService.getProjectInvitations(projectId, principal.getId())));
    }

    @PostMapping("/projects/{projectId}/invitations")
    public ResponseEntity<ApiResponse<ProjectInvitationDto>> send(
            @PathVariable String projectId,
            @Valid @RequestBody CreateProjectInvitationRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ProjectInvitationDto invitation =
                invitationService.sendInvitation(projectId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Invitation sent.", invitation));
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<ApiResponse<ProjectInvitationDto>> accept(
            @PathVariable String invitationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Invitation accepted.",
                invitationService.accept(invitationId, principal.getId())));
    }

    @PostMapping("/invitations/{invitationId}/decline")
    public ResponseEntity<ApiResponse<ProjectInvitationDto>> decline(
            @PathVariable String invitationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Invitation declined.",
                invitationService.decline(invitationId, principal.getId())));
    }

    @PostMapping("/projects/{projectId}/invitations/{invitationId}/cancel")
    public ResponseEntity<ApiResponse<ProjectInvitationDto>> cancel(
            @PathVariable String projectId,
            @PathVariable String invitationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Invitation cancelled.",
                invitationService.cancel(projectId, invitationId, principal.getId())));
    }
}
