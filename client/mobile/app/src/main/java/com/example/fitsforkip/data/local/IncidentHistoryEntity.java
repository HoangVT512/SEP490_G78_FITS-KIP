package com.example.fitsforkip.data.local;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.room.TypeConverters;

import java.util.Date;

@Entity(tableName = "incident_history")
@TypeConverters(DateConverter.class)
public class IncidentHistoryEntity {
    @PrimaryKey(autoGenerate = true)
    public int incidentId;

    public Integer equipmentId;
    public Date startTime;
    public Date endTime;
    public Double duration; // in minutes
    public Integer typeId;
    public String reason;
    public String solution;
    public String issue;
    public String status;
    public Date createdDate;
    public String reportedByUserId;
    public String assignedTo;
    public boolean isTechSupport;
    public boolean synced = false;

    // Constructors, getters, setters
    public IncidentHistoryEntity() {}

    public IncidentHistoryEntity(Integer equipmentId, Date startTime, Date endTime, Double duration, Integer typeId, String reason, String solution, String issue, String status, Date createdDate, String reportedByUserId, String assignedTo, boolean isTechSupport, boolean synced) {
        this.equipmentId = equipmentId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.typeId = typeId;
        this.reason = reason;
        this.solution = solution;
        this.issue = issue;
        this.status = status;
        this.createdDate = createdDate;
        this.reportedByUserId = reportedByUserId;
        this.assignedTo = assignedTo;
        this.isTechSupport = isTechSupport;
        this.synced = synced;
    }

    // Getters and setters
    public int getIncidentId() { return incidentId; }
    public void setIncidentId(int incidentId) { this.incidentId = incidentId; }

    public Integer getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Integer equipmentId) { this.equipmentId = equipmentId; }

    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }

    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }

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

    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }

    public String getReportedByUserId() { return reportedByUserId; }
    public void setReportedByUserId(String reportedByUserId) { this.reportedByUserId = reportedByUserId; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public boolean isTechSupport() { return isTechSupport; }
    public void setTechSupport(boolean techSupport) { isTechSupport = techSupport; }

    public boolean isSynced() { return synced; }
    public void setSynced(boolean synced) { this.synced = synced; }
}
