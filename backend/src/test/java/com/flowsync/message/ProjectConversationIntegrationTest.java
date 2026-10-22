package com.flowsync.message;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowsync.auth.RegisterRequest;
import com.flowsync.project.AddMemberRequest;
import com.flowsync.project.CreateProjectRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers the project team conversation: creation, persistence, history and permissions.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectConversationIntegrationTest {

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
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("token").asText();
    }

    private String createProject(String token, String name) throws Exception {
        CreateProjectRequest request = new CreateProjectRequest();
        request.setName(name);
        request.setDescription("Messaging project");

        MvcResult result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("id").asText();
    }

    private String openConversation(String token, String projectId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/projects/" + projectId + "/conversation")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("id").asText();
    }

    private void sendMessage(String token, String conversationId, String body) throws Exception {
        mockMvc.perform(post("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendMessageRequest(body))))
                .andExpect(status().isCreated());
    }

    @Test
    void projectConversationStoresMessagesAndProtectsThem() throws Exception {
        String ownerToken = registerAndGetToken("Owner", "owner-msg@example.com");
        String memberToken = registerAndGetToken("Member", "member-msg@example.com");
        String outsiderToken = registerAndGetToken("Outsider", "outsider-msg@example.com");

        String projectId = createProject(ownerToken, "Chat project");

        // The team conversation is created on demand and is stable.
        String conversationId = openConversation(ownerToken, projectId);
        assertNotNull(conversationId);
        assertEquals(conversationId, openConversation(ownerToken, projectId));

        // Messages are persisted and returned in chronological order.
        sendMessage(ownerToken, conversationId, "First message");
        sendMessage(ownerToken, conversationId, "Second message");

        MvcResult history = mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode messages = objectMapper.readTree(history.getResponse().getContentAsString()).get("data");
        assertEquals(2, messages.size());
        assertEquals("First message", messages.get(0).get("body").asText());
        assertEquals("Second message", messages.get(1).get("body").asText());
        assertEquals("Owner", messages.get(0).get("senderName").asText());

        // The paginated endpoint reports the history metadata.
        mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages/page?page=0&size=1")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.hasOlder").value(true));

        // Blank and oversized messages are rejected.
        mockMvc.perform(post("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendMessageRequest("   "))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendMessageRequest("x".repeat(2001)))))
                .andExpect(status().isBadRequest());

        // A user that is not a project member cannot read or write the conversation.
        mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + outsiderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendMessageRequest("intruder"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/conversation")
                        .header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isForbidden());

        // Nothing of the rejected requests was stored.
        MvcResult after = mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andReturn();
        assertEquals(2, objectMapper.readTree(after.getResponse().getContentAsString()).get("data").size());
    }

    @Test
    void projectMembersShareTheConversationAndKeepAccessWhenAdded() throws Exception {
        String ownerToken = registerAndGetToken("Owner", "owner-sync@example.com");
        String memberToken = registerAndGetToken("Member", "member-sync@example.com");

        String projectId = createProject(ownerToken, "Sync project");
        String conversationId = openConversation(ownerToken, projectId);

        // A member that is added later can read and write the conversation.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "member-sync@example.com", "Member"))))
                .andExpect(status().isCreated());

        sendMessage(memberToken, conversationId, "Hello from the new member");
        mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].senderName").value("Member"));

        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].type").value("message"))
                .andExpect(jsonPath("$.data[0].relatedType").value("project"))
                .andExpect(jsonPath("$.data[0].relatedId").value(projectId))
                .andExpect(jsonPath("$.data[0].read").value(false));

        // Removing the member from the project also removes the conversation access.
        JsonNode members = objectMapper.readTree(mockMvc.perform(get("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("data");

        String membershipId = null;
        for (JsonNode member : members) {
            if ("member-sync@example.com".equals(member.get("email").asText())) {
                membershipId = member.get("id").asText();
            }
        }
        assertTrue(membershipId != null, "the added member must be listed");

        mockMvc.perform(delete("/api/v1/projects/" + projectId + "/members/" + membershipId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());

        // The messages themselves are still stored for the remaining members.
        mockMvc.perform(get("/api/v1/conversations/" + conversationId + "/messages")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }
}
