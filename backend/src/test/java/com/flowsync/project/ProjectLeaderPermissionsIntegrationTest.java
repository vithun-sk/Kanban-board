package com.flowsync.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowsync.auth.RegisterRequest;
import com.flowsync.task.CreateTaskRequest;
import com.flowsync.task.UpdateTaskRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectLeaderPermissionsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String name, String email) throws Exception {
        RegisterRequest request = new RegisterRequest(name, email, "Password123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("token").asText();
    }

    private String createProject(String token) throws Exception {
        CreateProjectRequest request = new CreateProjectRequest();
        request.setName("Leader permissions project");
        MvcResult result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    private JsonNode getMembers(String token, String projectId) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
    }

    private String getUserId(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    private String createTask(String token, String projectId, String title, String assigneeId) throws Exception {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setProjectId(projectId);
        request.setTitle(title);
        request.setAssigneeId(assigneeId);
        MvcResult result = mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    @Test
    void onlyProjectCreatorCanPerformPrivilegedProjectAndTaskOperations() throws Exception {
        String leaderToken = registerAndGetToken("Project Leader", "leader-permissions@example.com");
        String memberToken = registerAndGetToken("Project Admin Role", "project-admin-permissions@example.com");
        String targetToken = registerAndGetToken("Assigned Target", "target-permissions@example.com");
        String projectId = createProject(leaderToken);

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + leaderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AddMemberRequest(null, "project-admin-permissions@example.com", "Admin"))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + leaderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AddMemberRequest(null, "target-permissions@example.com", "Member"))))
                .andExpect(status().isCreated());

        JsonNode memberships = getMembers(leaderToken, projectId);
        String memberMembershipId = null;
        for (JsonNode membership : memberships) {
            if ("project-admin-permissions@example.com".equals(membership.get("email").asText())) {
                memberMembershipId = membership.get("id").asText();
            }
        }
        assertNotNull(memberMembershipId);
        String targetId = getUserId(targetToken);
        String assignedTaskId = createTask(leaderToken, projectId, "Assigned by leader", targetId);
        String unassignedTaskId = createTask(leaderToken, projectId, "Unassigned task", null);

        mockMvc.perform(patch("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Tampered project\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/projects/" + projectId + "/members/" + memberMembershipId)
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/users/" + getUserId(targetToken) + "/memberships")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskRequestJson(projectId, "Member assigned task", targetId)))
                .andExpect(status().isForbidden());

        UpdateTaskRequest assignRequest = new UpdateTaskRequest();
        assignRequest.setAssigneeId(targetId);
        mockMvc.perform(patch("/api/v1/tasks/" + assignedTaskId)
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isForbidden());

        UpdateTaskRequest unassignRequest = new UpdateTaskRequest();
        unassignRequest.setAssigneeId(null);
        mockMvc.perform(patch("/api/v1/tasks/" + assignedTaskId)
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unassignRequest)))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/tasks/" + unassignedTaskId)
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/v1/tasks/" + unassignedTaskId)
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Member can edit task details\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Member can edit task details"));

        mockMvc.perform(patch("/api/v1/tasks/" + unassignedTaskId)
                        .header("Authorization", "Bearer " + leaderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assigneeId").value(targetId));
        mockMvc.perform(delete("/api/v1/tasks/" + unassignedTaskId)
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk());
    }

    private String taskRequestJson(String projectId, String title, String assigneeId) throws Exception {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setProjectId(projectId);
        request.setTitle(title);
        request.setAssigneeId(assigneeId);
        return objectMapper.writeValueAsString(request);
    }
}
