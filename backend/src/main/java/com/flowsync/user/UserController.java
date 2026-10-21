package com.flowsync.user;

import com.flowsync.common.ApiResponse;
import com.flowsync.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserDto profile = userService.getUserProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUserProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserDto updated = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully.", updated));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully.", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/by-email")
    public ResponseEntity<ApiResponse<UserDto>> getUserByEmail(@RequestParam String email) {
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @DeleteMapping("/{userId}/memberships")
    public ResponseEntity<ApiResponse<Void>> removeProjectMemberships(
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        userService.removeProjectMemberships(userId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project memberships removed.", null));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateRole(
            @PathVariable String userId,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UserDto updated = userService.updateRole(userId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Role updated successfully.", updated));
    }
}
