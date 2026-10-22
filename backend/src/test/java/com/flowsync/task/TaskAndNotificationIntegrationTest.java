package com.flowsync.task;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowsync.auth.RegisterRequest;
import com.flowsync.notification.NotificationService;
import com.flowsync.project.CreateProjectRequest;
import com.flowsync.project.UpdateProjectRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TaskAndNotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationService notificationService;

    private String registerAndGetToken(String name, String email) throws Exception {
        RegisterRequest req = new RegisterRequest(name, email, "Password123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("token").asText();
    }

    private String getUserIdFromToken(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    @Test
    void testTaskStatusTransitionAndCalendarQuery() throws Exception {
        String token = registerAndGetToken("Task Worker", "worker@example.com");

        // Create Project
        CreateProjectRequest projectReq = new CreateProjectRequest();
        projectReq.setName("Kanban Project");
        MvcResult projectRes = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String projectId = objectMapper.readTree(projectRes.getResponse().getContentAsString()).get("data").get("id").asText();

        // Create Task
        CreateTaskRequest taskReq = new CreateTaskRequest();
        taskReq.setProjectId(projectId);
        taskReq.setTitle("Kanban Task 1");
        taskReq.setStatus("To Do");
        taskReq.setPriority("High");
        taskReq.setLabels(List.of("Frontend", "UI"));

        MvcResult taskRes = mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("To Do"))
                .andReturn();

        String taskId = objectMapper.readTree(taskRes.getResponse().getContentAsString()).get("data").get("id").asText();

        // Update Status to In Progress
        UpdateTaskStatusRequest statusReq = new UpdateTaskStatusRequest("In Progress");
        mockMvc.perform(patch("/api/v1/tasks/" + taskId + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"));

        // Query Project Tasks
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // Delete Task
        mockMvc.perform(delete("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void explicitNullUpdatesClearAssigneeAndDatesAfterReload() throws Exception {
        String token = registerAndGetToken("Update Worker", "update-worker@example.com");
        String userId = getUserIdFromToken(token);

        CreateProjectRequest projectRequest = new CreateProjectRequest();
        projectRequest.setName("Date clearing project");
        projectRequest.setStartDate(LocalDate.of(2026, 1, 1));
        projectRequest.setDueDate(LocalDate.of(2026, 12, 31));
        MvcResult projectResult = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isCreated())
                .andReturn();
        String projectId = objectMapper.readTree(projectResult.getResponse().getContentAsString())
                .get("data").get("id").asText();

        UpdateProjectRequest clearProjectDates = new UpdateProjectRequest();
        clearProjectDates.setStartDate(null);
        clearProjectDates.setDueDate(null);
        mockMvc.perform(patch("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clearProjectDates)))
                .andExpect(status().isOk());

        JsonNode savedProject = objectMapper.readTree(mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("data");
        assertTrue(savedProject.get("startDate").isNull());
        assertTrue(savedProject.get("dueDate").isNull());

        CreateTaskRequest taskRequest = new CreateTaskRequest();
        taskRequest.setProjectId(projectId);
        taskRequest.setTitle("Task with assignment and dates");
        taskRequest.setAssigneeId(userId);
        taskRequest.setStartDate(LocalDate.of(2026, 2, 1));
        taskRequest.setDueDate(LocalDate.of(2026, 3, 1));
        MvcResult taskResult = mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                .andReturn();
        String taskId = objectMapper.readTree(taskResult.getResponse().getContentAsString())
                .get("data").get("id").asText();

        UpdateTaskRequest clearTaskFields = new UpdateTaskRequest();
        clearTaskFields.setAssigneeId(null);
        clearTaskFields.setStartDate(null);
        clearTaskFields.setDueDate(null);
        mockMvc.perform(patch("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clearTaskFields)))
                .andExpect(status().isOk());

        JsonNode savedTask = objectMapper.readTree(mockMvc.perform(get("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("data");
        assertTrue(savedTask.get("assigneeId").isNull());
        assertTrue(savedTask.get("startDate").isNull());
        assertTrue(savedTask.get("dueDate").isNull());
    }

    @Test
    void testNotificationsIsolationAndMarkAllRead() throws Exception {
        String token1 = registerAndGetToken("Notif User 1", "notif1@example.com");
        String userId1 = getUserIdFromToken(token1);

        String token2 = registerAndGetToken("Notif User 2", "notif2@example.com");

        // Create notification for User 1
        var notifDto = notificationService.createNotification(userId1, "Welcome", "Welcome to FlowSync", "system", null, null);

        // User 1 sees notification
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // User 2 DOES NOT see User 1's notification
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));

        // User 2 cannot mark User 1's notification as read (403 Forbidden)
        mockMvc.perform(patch("/api/v1/notifications/" + notifDto.getId() + "/read")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());

        // User 1 marks all read
        mockMvc.perform(post("/api/v1/notifications/read-all")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk());
    }
}
