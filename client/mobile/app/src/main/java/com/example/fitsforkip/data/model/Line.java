package com.example.fitsforkip.data.model;

public class Line {
    private int lineId;
    private String lineName;

    public Line() {}

    public Line(int lineId, String lineName) {
        this.lineId = lineId;
        this.lineName = lineName;
    }

    public int getLineId() {
        return lineId;
    }

    public void setLineId(int lineId) {
        this.lineId = lineId;
    }

    public String getLineName() {
        return lineName;
    }

    public void setLineName(String lineName) {
        this.lineName = lineName;
    }

    // For compatibility with existing code
    public int getId() {
        return lineId;
    }

    public void setId(int id) {
        this.lineId = id;
    }

    public String getName() {
        return lineName;
    }

    public void setName(String name) {
        this.lineName = name;
    }
}
