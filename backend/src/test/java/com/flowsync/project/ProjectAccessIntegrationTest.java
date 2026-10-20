package com.flowsync.project;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowsync.auth.AuthResponse;
import com.flowsync.auth.RegisterRequest;
import com.flowsync.task.CreateTaskRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String name, String email) throws Exception {
        RegisterRequest req = new RegisterRequest(name, email, "Password123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(json);
        return node.get("data").get("token").asText();
    }

    @Test
    void testProjectIsolationBetweenUsers() throws Exception {
        String tokenA = registerAndGetToken("User A", "usera@example.com");
        String tokenB = registerAndGetToken("User B", "userb@example.com");

        // User A creates project
        CreateProjectRequest projectReq = new CreateProjectRequest();
        projectReq.setName("User A Confidential Project");
        projectReq.setDescription("Project description");

        MvcResult createResult = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("User A Confidential Project"))
                .andReturn();

        String createJson = createResult.getResponse().getContentAsString();
        String projectId = objectMapper.readTree(createJson).get("data").get("id").asText();

        // User A can access project
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk());

        // User B CANNOT access User A's project (403 Forbidden)
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());

        // User B CANNOT delete User A's project
        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());

        // User A creates task
        CreateTaskRequest taskReq = new CreateTaskRequest();
        taskReq.setProjectId(projectId);
        taskReq.setTitle("Secure Task");

        MvcResult taskResult = mockMvc.perform(post("/api/v1/tasks")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String taskId = objectMapper.readTree(taskResult.getResponse().getContentAsString()).get("data").get("id").asText();

        // User B CANNOT access task
        mockMvc.perform(get("/api/v1/tasks/" + taskId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());
    }
}
