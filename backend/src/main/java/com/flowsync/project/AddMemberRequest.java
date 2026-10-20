package com.flowsync.project;

import jakarta.validation.constraints.NotBlank;

public class AddMemberRequest {

    private String userId;

    private String email;

    @NotBlank(message = "Role is required.")
    private String role = "Member";

    public AddMemberRequest() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
