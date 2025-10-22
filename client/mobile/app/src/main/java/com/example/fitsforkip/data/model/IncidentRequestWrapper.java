package com.example.fitsforkip.data.model;

import com.example.fitsforkip.data.model.CreateIncidentRequest;

public class IncidentRequestWrapper {
    private CreateIncidentRequest request;

    public IncidentRequestWrapper() {}

    public IncidentRequestWrapper(CreateIncidentRequest request) {
        this.request = request;
    }

    public CreateIncidentRequest getRequest() {
        return request;
    }

    public void setRequest(CreateIncidentRequest request) {
        this.request = request;
    }
}
