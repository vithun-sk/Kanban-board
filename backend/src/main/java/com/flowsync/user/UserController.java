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
}
