package com.example.fitsforkip.data.model;

public class MobileLoginRequest {
    private String employeeCode;
    private int lineId;

    public MobileLoginRequest() {}

    public MobileLoginRequest(String employeeCode, int lineId) {
        this.employeeCode = employeeCode;
        this.lineId = lineId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public int getLineId() {
        return lineId;
    }

    public void setLineId(int lineId) {
        this.lineId = lineId;
    }
}
