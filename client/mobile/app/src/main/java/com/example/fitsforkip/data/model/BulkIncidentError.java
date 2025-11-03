package com.example.fitsforkip.data.model;

public class BulkIncidentError {
    private int index;
    private String errorMessage;
    private CreateIncidentRequest failedRequest;

    public BulkIncidentError() {}

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public CreateIncidentRequest getFailedRequest() {
        return failedRequest;
    }

    public void setFailedRequest(CreateIncidentRequest failedRequest) {
        this.failedRequest = failedRequest;
    }
}
