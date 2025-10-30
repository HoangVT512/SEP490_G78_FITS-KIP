package com.example.fitsforkip.data.model;

import java.util.List;

public class CreateBulkIncidentRequest {
    private List<CreateIncidentRequest> incidents;

    public CreateBulkIncidentRequest() {}

    public CreateBulkIncidentRequest(List<CreateIncidentRequest> incidents) {
        this.incidents = incidents;
    }

    public List<CreateIncidentRequest> getIncidents() {
        return incidents;
    }

    public void setIncidents(List<CreateIncidentRequest> incidents) {
        this.incidents = incidents;
    }
}
