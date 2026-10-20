package com.flowsync.project;

import com.flowsync.common.ApiResponse;
import com.flowsync.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjects(@AuthenticationPrincipal UserPrincipal principal) {
        List<ProjectDto> projects = projectService.getAccessibleProjects(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(projects));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProjectRequest request
    ) {
        ProjectDto created = projectService.createProject(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created successfully.", created));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto>> getProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ProjectDto project = projectService.getProjectById(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(project));
    }

    @PatchMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto>> patchProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateProjectRequest request
    ) {
        ProjectDto updated = projectService.updateProject(projectId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully.", updated));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto>> putProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateProjectRequest request
    ) {
        ProjectDto updated = projectService.updateProject(projectId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully.", updated));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectService.deleteProject(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully.", null));
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberDto>>> getMembers(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ProjectMemberDto> members = projectService.getProjectMembers(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<ProjectMemberDto>> addMember(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddMemberRequest request
    ) {
        ProjectMemberDto added = projectService.addProjectMember(projectId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Member added successfully.", added));
    }

    @PatchMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponse<ProjectMemberDto>> updateMemberRole(
            @PathVariable String projectId,
            @PathVariable String memberId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateMemberRoleRequest request
    ) {
        ProjectMemberDto updated = projectService.updateMemberRole(projectId, memberId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Member role updated.", updated));
    }

    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable String projectId,
            @PathVariable String memberId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectService.removeProjectMember(projectId, memberId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Member removed.", null));
    }
}
