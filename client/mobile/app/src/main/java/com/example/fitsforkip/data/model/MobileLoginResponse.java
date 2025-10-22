package com.example.fitsforkip.data.model;

import java.util.Date;

public class MobileLoginResponse {
    private String token;
    private Date expiration;
    private MobileUserDTO user;
    private MobileLineDTO line;

    public MobileLoginResponse() {}

    // Getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Date getExpiration() {
        return expiration;
    }

    public void setExpiration(Date expiration) {
        this.expiration = expiration;
    }

    public MobileUserDTO getUser() {
        return user;
    }

    public void setUser(MobileUserDTO user) {
        this.user = user;
    }

    public MobileLineDTO getLine() {
        return line;
    }

    public void setLine(MobileLineDTO line) {
        this.line = line;
    }
}
