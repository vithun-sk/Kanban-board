package com.flowsync.security;

import java.security.Principal;

/**
 * Principal attached to an authenticated STOMP session. The name is the FlowSync user id
 * so authorization checks can be performed on the server for every frame.
 */
public class StompPrincipal implements Principal {

    private final String id;
    private final String name;
    private final String email;

    public StompPrincipal(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return id;
    }

    public String getDisplayName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
