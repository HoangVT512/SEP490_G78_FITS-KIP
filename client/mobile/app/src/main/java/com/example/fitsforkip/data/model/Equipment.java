package com.example.fitsforkip.data.model;

import java.util.List;

public class Equipment {
    private String code;
    private String name;
    private String stage;
    private String line;
    private List<String> issues;

    public Equipment(String code, String name, String stage, String line, List<String> issues) {
        this.code = code;
        this.name = name;
        this.stage = stage;
        this.line = line;
        this.issues = issues;
    }

    // Getters
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getStage() { return stage; }
    public String getLine() { return line; }
    public List<String> getIssues() { return issues; }

    // Setters (nếu cần)
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setStage(String stage) { this.stage = stage; }
    public void setLine(String line) { this.line = line; }
    public void setIssues(List<String> issues) { this.issues = issues; }
}
