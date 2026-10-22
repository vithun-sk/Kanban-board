package com.flowsync.message;

import java.util.List;

public record ProjectMessageNotificationEvent(
        List<String> recipientIds,
        String conversationTitle,
        String senderName,
        String projectId
) {
}
