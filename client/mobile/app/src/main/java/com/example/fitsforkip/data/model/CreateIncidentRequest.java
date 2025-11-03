package com.example.fitsforkip.data.model;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class CreateIncidentRequest {
    private Integer equipmentId;
    private Integer lineId;
    private String startTime;
    private String endTime;
    private Double duration;
    private Integer typeId;
    private String reason;
    private String solution;
    private String issue;
    private String status;
    private String createdDate;
    private String reportedByUserId;
    private boolean isTechSupport;
    private List<String> imageUrls;

    // Constructors
    public CreateIncidentRequest() {}

    public CreateIncidentRequest(Integer equipmentId, Integer lineId, Date startTime, Date endTime, Double duration, Integer typeId, String reason, String solution, String issue, String status, Date createdDate, String reportedByUserId, boolean isTechSupport, List<String> imageUrls) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
        this.equipmentId = equipmentId;
        this.lineId = lineId;
        this.startTime = startTime != null ? sdf.format(startTime) : null;
        this.endTime = endTime != null ? sdf.format(endTime) : null;
        this.duration = duration;
        this.typeId = typeId;
        this.reason = reason;
        this.solution = solution;
        this.issue = issue;
        this.status = status;
        this.createdDate = createdDate != null ? sdf.format(createdDate) : null;
        this.reportedByUserId = reportedByUserId;
        this.isTechSupport = isTechSupport;
        this.imageUrls = imageUrls;
    }

    // Getters and setters
    public Integer getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Integer equipmentId) { this.equipmentId = equipmentId; }

    public Integer getLineId() { return lineId; }
    public void setLineId(Integer lineId) { this.lineId = lineId; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

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
    public void setTechSupport(boolean techSupport) { isTechSupport = techSupport; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
