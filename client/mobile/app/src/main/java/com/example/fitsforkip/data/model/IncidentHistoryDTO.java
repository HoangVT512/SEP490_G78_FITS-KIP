package com.example.fitsforkip.data.model;

import java.util.Date;
import java.util.List;

public class IncidentHistoryDTO {
    private int incidentId;
    private int equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private Integer lineId;
    private String lineName;
    private Date startTime;
    private Date endTime;
    private Double duration;
    private Integer typeId;
    private String typeName;
    private String reason;
    private String solution;
    private String issue;
    private List<String> imageUrls;
    private Date createdDate;
    private boolean isTechSupport;

    public IncidentHistoryDTO() {}

    // Getters and setters
    public int getIncidentId() { return incidentId; }
    public void setIncidentId(int incidentId) { this.incidentId = incidentId; }

    public int getEquipmentId() { return equipmentId; }
    public void setEquipmentId(int equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }

    public Integer getLineId() { return lineId; }
    public void setLineId(Integer lineId) { this.lineId = lineId; }

    public String getLineName() { return lineName; }
    public void setLineName(String lineName) { this.lineName = lineName; }

    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }

    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }

    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }

    public boolean isTechSupport() { return isTechSupport; }
    public void setTechSupport(boolean techSupport) { isTechSupport = techSupport; }
}
