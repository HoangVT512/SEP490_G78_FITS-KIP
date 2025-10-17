package com.example.fitsforkip.data.model;

public class IncidentHistory {
    private String qrCode;
    private String equipmentCode;
    private String equipmentName;
    private String stage;
    private String line;
    private String issue;
    private String startTime;
    private String endTime;
    private String duration;
    private String issueType;
    private boolean synced;

    public IncidentHistory(String qrCode, String equipmentCode, String equipmentName, String stage, String line, String issue, String startTime, String endTime, String duration, String issueType, boolean synced) {
        this.qrCode = qrCode;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.stage = stage;
        this.line = line;
        this.issue = issue;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.issueType = issueType;
        this.synced = synced;
    }

    // Getters
    public String getQrCode() { return qrCode; }
    public String getEquipmentCode() { return equipmentCode; }
    public String getEquipmentName() { return equipmentName; }
    public String getStage() { return stage; }
    public String getLine() { return line; }
    public String getIssue() { return issue; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public String getDuration() { return duration; }
    public String getIssueType() { return issueType; }
    public boolean isSynced() { return synced; }

    // Setters
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public void setStage(String stage) { this.stage = stage; }
    public void setLine(String line) { this.line = line; }
    public void setIssue(String issue) { this.issue = issue; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public void setSynced(boolean synced) { this.synced = synced; }
}
