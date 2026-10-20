package com.flowsync.user;

public class UserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String title;
    private String initials;

    public UserDto() {
    }

    public UserDto(String id, String name, String email, String role, String title) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.title = title;
        this.initials = calculateInitials(name);
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getTitle());
    }

    private static String calculateInitials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.initials = calculateInitials(name);
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }
}
