package com.example.fitsforkip.data.model;

import android.os.Parcel;
import android.os.Parcelable;

public class Equipment implements Parcelable {
    private int equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String dateUse;
    private String origin;
    private int yom;
    private String qrcode;
    private int stageId;
    private String stageName;
    private int lineId;
    private String lineName;
    private boolean isActive;
    private String issue;

    public Equipment() {
    }

    protected Equipment(Parcel in) {
        equipmentId = in.readInt();
        equipmentCode = in.readString();
        equipmentName = in.readString();
        dateUse = in.readString();
        origin = in.readString();
        yom = in.readInt();
        qrcode = in.readString();
        stageId = in.readInt();
        stageName = in.readString();
        lineId = in.readInt();
        lineName = in.readString();
        isActive = in.readByte() != 0;
        issue = in.readString();
    }

    public static final Creator<Equipment> CREATOR = new Creator<Equipment>() {
        @Override
        public Equipment createFromParcel(Parcel in) {
            return new Equipment(in);
        }

        @Override
        public Equipment[] newArray(int size) {
            return new Equipment[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(equipmentId);
        dest.writeString(equipmentCode);
        dest.writeString(equipmentName);
        dest.writeString(dateUse);
        dest.writeString(origin);
        dest.writeInt(yom);
        dest.writeString(qrcode);
        dest.writeInt(stageId);
        dest.writeString(stageName);
        dest.writeInt(lineId);
        dest.writeString(lineName);
        dest.writeByte((byte) (isActive ? 1 : 0));
        dest.writeString(issue);
    }

    // Getters and setters
    public int getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(int equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getDateUse() {
        return dateUse;
    }

    public void setDateUse(String dateUse) {
        this.dateUse = dateUse;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public int getYom() {
        return yom;
    }

    public void setYom(int yom) {
        this.yom = yom;
    }

    public String getQrcode() {
        return qrcode;
    }

    public void setQrcode(String qrcode) {
        this.qrcode = qrcode;
    }

    public int getStageId() {
        return stageId;
    }

    public void setStageId(int stageId) {
        this.stageId = stageId;
    }

    public String getStageName() {
        return stageName;
    }

    public void setStageName(String stageName) {
        this.stageName = stageName;
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

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    // For compatibility with existing code
    public String getCode() {
        return equipmentCode;
    }

    public void setCode(String code) {
        this.equipmentCode = code;
    }

    public String getName() {
        return equipmentName;
    }

    public void setName(String name) {
        this.equipmentName = name;
    }

    public String getStage() {
        return stageName;
    }

    public void setStage(String stage) {
        this.stageName = stage;
    }

    public String getLine() {
        return lineName;
    }

    public void setLine(String line) {
        this.lineName = line;
    }
}
