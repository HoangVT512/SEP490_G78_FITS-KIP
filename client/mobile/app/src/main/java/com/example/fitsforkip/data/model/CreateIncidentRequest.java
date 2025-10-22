package com.example.fitsforkip.data.model;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class CreateIncidentRequest {
    private int equipmentId;
    private String startTime;
    private String endTime;
    private double duration;
    private int typeId;
    private String reason;
    private String solution;
    private String issue;
    private String status;
    private String createdDate;
    private String reportedByUserId;
    private boolean isTechSupport;

    // Constructors
    public CreateIncidentRequest() {}

    public CreateIncidentRequest(int equipmentId, Date startTime, Date endTime, double duration, int typeId, String reason, String solution, String issue, String status, Date createdDate, String reportedByUserId, boolean isTechSupport) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
        this.equipmentId = equipmentId;
        this.startTime = sdf.format(startTime);
        this.endTime = sdf.format(endTime);
        this.duration = duration;
        this.typeId = typeId;
        this.reason = reason;
        this.solution = solution;
        this.issue = issue;
        this.status = status;
        this.createdDate = sdf.format(createdDate);
        this.reportedByUserId = reportedByUserId;
        this.isTechSupport = isTechSupport;
    }

    // Getters and setters
    public int getEquipmentId() { return equipmentId; }
    public void setEquipmentId(int equipmentId) { this.equipmentId = equipmentId; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }

    public int getTypeId() { return typeId; }
    public void setTypeId(int typeId) { this.typeId = typeId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public String getReportedByUserId() { return reportedByUserId; }
    public void setReportedByUserId(String reportedByUserId) { this.reportedByUserId = reportedByUserId; }

    public boolean isTechSupport() { return isTechSupport; }
    public void setTechSupport(boolean isTechSupport) { this.isTechSupport = isTechSupport; }
}
