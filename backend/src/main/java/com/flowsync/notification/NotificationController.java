package com.flowsync.notification;

import com.flowsync.common.ApiResponse;
import com.flowsync.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> list = notificationService.getUserNotifications(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markRead(
            @PathVariable String notificationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        NotificationDto updated = notificationService.markAsRead(notificationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read.", updated));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read.", null));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> dismissNotification(
            @PathVariable String notificationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        notificationService.dismissNotification(notificationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification dismissed.", null));
    }
}
