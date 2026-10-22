package com.flowsync.message;

import com.flowsync.notification.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ProjectMessageNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(ProjectMessageNotificationListener.class);

    private final NotificationService notificationService;

    public ProjectMessageNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Order(Ordered.LOWEST_PRECEDENCE)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotifications(ProjectMessageNotificationEvent event) {
        for (String recipientId : event.recipientIds()) {
            try {
                notificationService.createNotification(
                        recipientId,
                        "New message in " + event.conversationTitle(),
                        event.senderName() + " sent a message in " + event.conversationTitle() + ".",
                        "message",
                        "project",
                        event.projectId()
                );
            } catch (RuntimeException ex) {
                log.error("Could not create project message notification for recipient {} in project {}.",
                        recipientId, event.projectId(), ex);
            }
        }
    }
}
