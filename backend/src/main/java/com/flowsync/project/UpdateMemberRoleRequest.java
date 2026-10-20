package com.flowsync.project;

import jakarta.validation.constraints.NotBlank;

public class UpdateMemberRoleRequest {

    @NotBlank(message = "Role is required.")
    private String role;

    public UpdateMemberRoleRequest() {
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
