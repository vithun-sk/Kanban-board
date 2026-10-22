package com.flowsync.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowsync.auth.RegisterRequest;
import com.flowsync.user.UpdateRoleRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers the team member removal persistence and the "registered accounts only" rule.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectMemberIntegrationTest {

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
        request.setDescription("Team project");

        MvcResult result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("id").asText();
    }

    private JsonNode getMembers(String token, String projectId) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
    }

    @Test
    void memberRemovalIsPersistedAndKeepsTheAccountIntact() throws Exception {
        String ownerToken = registerAndGetToken("Owner", "owner-remove@example.com");
        String memberToken = registerAndGetToken("Member", "member-remove@example.com");

        String projectId = createProject(ownerToken, "Removal project");

        // A member can only be added when the account exists.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "member-remove@example.com", "Member"))))
                .andExpect(status().isCreated());

        JsonNode members = getMembers(ownerToken, projectId);
        assertEquals(2, members.size());

        String membershipId = null;
        for (JsonNode member : members) {
            if ("member-remove@example.com".equals(member.get("email").asText())) {
                membershipId = member.get("id").asText();
            }
        }
        assertTrue(membershipId != null, "the added member must be listed");

        // Removing the member deletes the membership.
        mockMvc.perform(delete("/api/v1/projects/" + projectId + "/members/" + membershipId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk());

        // The membership is gone after a reload.
        JsonNode afterRemoval = getMembers(ownerToken, projectId);
        assertEquals(1, afterRemoval.size());
        assertEquals("owner-remove@example.com", afterRemoval.get(0).get("email").asText());

        // The project itself no longer lists the member.
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.memberList.length()").value(1));

        // The account of the removed member still exists and the member lost the project access.
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.email == 'member-remove@example.com')]").exists());

        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());

        // Removing the same membership again reports that it does not exist any more.
        mockMvc.perform(delete("/api/v1/projects/" + projectId + "/members/" + membershipId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void onlyRegisteredAccountsCanBeAddedToAProject() throws Exception {
        String ownerToken = registerAndGetToken("Owner", "owner-add@example.com");
        String projectId = createProject(ownerToken, "Validation project");

        // Unknown email, no account is created.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "ghost@example.com", "Member"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("No registered FlowSync account")));

        // Invalid email format.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "not-an-email", "Member"))))
                .andExpect(status().isBadRequest());

        // Unknown user id.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest("missing-user-id", null, "Member"))))
                .andExpect(status().isBadRequest());

        // Nothing was created by the rejected requests.
        assertEquals(1, getMembers(ownerToken, projectId).size());

        // The project owner cannot be added a second time.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "owner-add@example.com", "Member"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("already a member")));

        // A registered account can be added, the email is normalized.
        registerAndGetToken("Teammate", "teammate-add@example.com");
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "Teammate-Add@Example.com", "Member"))))
                .andExpect(status().isCreated());

        // The same account cannot be added twice.
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddMemberRequest(null, "teammate-add@example.com", "Member"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("already a member")));

        assertEquals(2, getMembers(ownerToken, projectId).size());
    }

    @Test
    void workspaceAdminCannotRemoveMembershipsFromProjectsTheyDoNotLead() throws Exception {
        String ownerToken = registerAndGetToken("Project Owner", "owner-admin-remove@example.com");
        String adminToken = registerAndGetToken("Workspace Admin", "workspace-admin-remove@example.com");
        String targetToken = registerAndGetToken("Target Member", "target-admin-remove@example.com");
        String adminId = objectMapper.readTree(mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("data").get("id").asText();
        mockMvc.perform(patch("/api/v1/users/" + adminId + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateRoleRequest("Admin"))))
                .andExpect(status().isOk());

        String firstProjectId = createProject(ownerToken, "First admin-removal project");
        String secondProjectId = createProject(ownerToken, "Second admin-removal project");
        for (String projectId : new String[]{firstProjectId, secondProjectId}) {
            mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                            .header("Authorization", "Bearer " + ownerToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new AddMemberRequest(null, "target-admin-remove@example.com", "Member"))))
                    .andExpect(status().isCreated());
        }

        String targetId = objectMapper.readTree(mockMvc.perform(get("/api/v1/auth/me")
                                .header("Authorization", "Bearer " + targetToken))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString()).get("data").get("id").asText();
        mockMvc.perform(delete("/api/v1/users/" + targetId + "/memberships")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());

        assertEquals(2, getMembers(ownerToken, firstProjectId).size());
        assertEquals(2, getMembers(ownerToken, secondProjectId).size());
    }

    @Test
    void ordinaryMemberCannotRemoveAnotherUsersMembership() throws Exception {
        String ownerToken = registerAndGetToken("Project Owner", "owner-member-remove@example.com");
        String ordinaryToken = registerAndGetToken("Ordinary Member", "ordinary-member-remove@example.com");
        String targetToken = registerAndGetToken("Target Member", "target-member-remove@example.com");
        String projectId = createProject(ownerToken, "Permission project");
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/members")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AddMemberRequest(null, "target-member-remove@example.com", "Member"))))
                .andExpect(status().isCreated());
        JsonNode projectMembers = getMembers(ownerToken, projectId);
        String membershipId = null;
        for (JsonNode membership : projectMembers) {
            if ("target-member-remove@example.com".equals(membership.get("email").asText())) {
                membershipId = membership.get("id").asText();
            }
        }
        assertTrue(membershipId != null);
        String targetId = objectMapper.readTree(mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + targetToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("data").get("id").asText();

        mockMvc.perform(delete("/api/v1/projects/" + projectId + "/members/" + membershipId)
                        .header("Authorization", "Bearer " + ordinaryToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/users/" + targetId + "/memberships")
                        .header("Authorization", "Bearer " + ordinaryToken))
                .andExpect(status().isForbidden());
        assertEquals(2, getMembers(ownerToken, projectId).size());
    }
}
