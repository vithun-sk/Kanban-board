package com.flowsync.notification;

import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<NotificationDto> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Cannot access notifications belonging to another user.");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationDto.fromEntity(saved);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void dismissNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Cannot dismiss notifications belonging to another user.");
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public NotificationDto createNotification(String userId, String title, String message, String type, String relatedType, String relatedId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Notification notification = new Notification(
                UUID.randomUUID().toString(),
                user,
                title,
                message,
                type,
                relatedType,
                relatedId
        );
        Notification saved = notificationRepository.save(notification);
        return NotificationDto.fromEntity(saved);
    }
}
