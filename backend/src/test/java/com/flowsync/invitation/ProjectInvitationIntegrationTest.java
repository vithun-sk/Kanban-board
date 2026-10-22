package com.flowsync.invitation;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectInvitationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String register(String name, String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest(name, email, "Password123!"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("token").asText();
    }

    private String userId(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    private String createProject(String token) throws Exception {
        CreateProjectRequest request = new CreateProjectRequest();
        request.setName("Invitation test project");
        MvcResult result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    private String send(String leaderToken, String projectId, String inviteeId, int statusCode)
            throws Exception {
        CreateProjectInvitationRequest request = new CreateProjectInvitationRequest();
        request.setInviteeId(inviteeId);
        MvcResult result = mockMvc.perform(post("/api/v1/projects/" + projectId + "/invitations")
                        .header("Authorization", "Bearer " + leaderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is(statusCode))
                .andReturn();
        if (statusCode != 201) return null;
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
    }

    private JsonNode incoming(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/invitations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
    }

    @Test
    void invitationLifecycleEnforcesRecipientAndProjectLeaderRules() throws Exception {
        String leaderToken = register("Invitation Leader", "invite-leader@example.com");
        String existingMemberToken = register("Existing Member", "invite-existing@example.com");
        String recipientToken = register("Invitation Recipient", "invite-recipient@example.com");
        String declinedToken = register("Declined Recipient", "invite-declined@example.com");
        String cancelledToken = register("Cancelled Recipient", "invite-cancelled@example.com");
        String attackerToken = register("Other Account", "invite-attacker@example.com");

        String projectId = createProject(leaderToken);
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + leaderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AddMemberRequest(null, "invite-existing@example.com", "Member"))))
                .andExpect(status().isCreated());

        String recipientId = userId(recipientToken);
        String declinedId = userId(declinedToken);
        String cancelledId = userId(cancelledToken);
        String existingId = userId(existingMemberToken);
        String invitationId = send(leaderToken, projectId, recipientId, 201);
        send(leaderToken, projectId, "unregistered-user-id", 404);
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/invitations")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].inviteeId").value(recipientId))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data[0].createdAt").exists());

        assertEquals("PENDING", incoming(recipientToken).get(0).get("status").asText());
        assertEquals(0, incoming(attackerToken).size());
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/invitations")
                        .header("Authorization", "Bearer " + existingMemberToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/invitations/"
                                + invitationId + "/cancel")
                        .header("Authorization", "Bearer " + existingMemberToken))
                .andExpect(status().isForbidden());

        send(leaderToken, projectId, recipientId, 409);
        send(leaderToken, projectId, existingId, 409);
        send(leaderToken, projectId, userId(leaderToken), 409);
        send(existingMemberToken, projectId, userId(attackerToken), 403);

        mockMvc.perform(post("/api/v1/invitations/" + invitationId + "/accept")
                        .header("Authorization", "Bearer " + attackerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/invitations/" + invitationId + "/accept")
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));
        mockMvc.perform(post("/api/v1/invitations/" + invitationId + "/accept")
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isConflict());

        String declinedInvitationId = send(leaderToken, projectId, declinedId, 201);
        mockMvc.perform(post("/api/v1/invitations/" + declinedInvitationId + "/decline")
                        .header("Authorization", "Bearer " + declinedToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DECLINED"));

        String cancelledInvitationId = send(leaderToken, projectId, cancelledId, 201);
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/invitations/"
                                + cancelledInvitationId + "/cancel")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
        mockMvc.perform(post("/api/v1/invitations/" + cancelledInvitationId + "/accept")
                        .header("Authorization", "Bearer " + cancelledToken))
                .andExpect(status().isConflict());

        JsonNode recipientInvitations = incoming(recipientToken);
        assertEquals("ACCEPTED", recipientInvitations.get(0).get("status").asText());
        assertEquals("DECLINED", incoming(declinedToken).get(0).get("status").asText());
        assertEquals("CANCELLED", incoming(cancelledToken).get(0).get("status").asText());

        mockMvc.perform(get("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));
    }
}
