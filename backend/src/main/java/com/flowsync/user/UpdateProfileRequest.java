package com.flowsync.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Name cannot be blank.")
    @Size(max = 100, message = "Name must be at most 100 characters.")
    private String name;

    @NotBlank(message = "Email cannot be blank.")
    @Email(message = "Email must be valid.")
    private String email;

    @Size(max = 100, message = "Title must be at most 100 characters.")
    private String title;

    public UpdateProfileRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
