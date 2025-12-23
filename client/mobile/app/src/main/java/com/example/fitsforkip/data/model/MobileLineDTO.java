package com.example.fitsforkip.data.model;

import android.os.Parcel;
import android.os.Parcelable;

public class MobileLineDTO implements Parcelable {
    private int lineId;
    private String lineName;
    private String lineCode;
    private int departmentId;
    private boolean isActive;

    public MobileLineDTO() {}

    protected MobileLineDTO(Parcel in) {
        lineId = in.readInt();
        lineName = in.readString();
        departmentId = in.readInt();
        isActive = in.readByte() != 0;
    }

    public static final Creator<MobileLineDTO> CREATOR = new Creator<MobileLineDTO>() {
        @Override
        public MobileLineDTO createFromParcel(Parcel in) {
            return new MobileLineDTO(in);
        }

        @Override
        public MobileLineDTO[] newArray(int size) {
            return new MobileLineDTO[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(lineId);
        dest.writeString(lineName);
        dest.writeInt(departmentId);
        dest.writeByte((byte) (isActive ? 1 : 0));
    }

    // Getters and setters
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

    public String getLineCode() {
        return lineCode;
    }
    public void setLineCode(String lineCode) {
        this.lineCode = lineCode;
    }

    public int getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(int departmentId) {
        this.departmentId = departmentId;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
