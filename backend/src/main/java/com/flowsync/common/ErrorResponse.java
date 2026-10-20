package com.flowsync.common;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {
    private boolean success;
    private String error;
    private int status;
    private Map<String, String> details;
    private Instant timestamp;

    public ErrorResponse() {
        this.success = false;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(int status, String error) {
        this.success = false;
        this.status = status;
        this.error = error;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(int status, String error, Map<String, String> details) {
        this.success = false;
        this.status = status;
        this.error = error;
        this.details = details;
        this.timestamp = Instant.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
