package com.example.fitsforkip.data.model;

import android.os.Parcel;
import android.os.Parcelable;

import java.util.List;

public class MobileUserDTO implements Parcelable {
    private String id;
    private String fullName;
    private String employeeCode;
    private boolean isActive;
    private List<String> roles;

    public MobileUserDTO() {}

    protected MobileUserDTO(Parcel in) {
        id = in.readString();
        fullName = in.readString();
        employeeCode = in.readString();
        isActive = in.readByte() != 0;
        roles = in.createStringArrayList();
    }

    public static final Creator<MobileUserDTO> CREATOR = new Creator<MobileUserDTO>() {
        @Override
        public MobileUserDTO createFromParcel(Parcel in) {
            return new MobileUserDTO(in);
        }

        @Override
        public MobileUserDTO[] newArray(int size) {
            return new MobileUserDTO[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(id);
        dest.writeString(fullName);
        dest.writeString(employeeCode);
        dest.writeByte((byte) (isActive ? 1 : 0));
        dest.writeStringList(roles);
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
