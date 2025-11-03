package com.example.fitsforkip.data.model;

import java.util.List;

public class BulkIncidentResponse {
    private int totalRequested;
    private int successCount;
    private int failureCount;
    private List<IncidentHistoryDTO> successfulIncidents;
    private List<BulkIncidentError> errors;

    public BulkIncidentResponse() {}

    public int getTotalRequested() {
        return totalRequested;
    }

    public void setTotalRequested(int totalRequested) {
        this.totalRequested = totalRequested;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<IncidentHistoryDTO> getSuccessfulIncidents() {
        return successfulIncidents;
    }

    public void setSuccessfulIncidents(List<IncidentHistoryDTO> successfulIncidents) {
        this.successfulIncidents = successfulIncidents;
    }

    public List<BulkIncidentError> getErrors() {
        return errors;
    }

    public void setErrors(List<BulkIncidentError> errors) {
        this.errors = errors;
    }
}
