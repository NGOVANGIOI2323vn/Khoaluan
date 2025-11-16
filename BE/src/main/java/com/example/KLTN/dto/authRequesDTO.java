package com.example.KLTN.dto;

public class authRequesDTO {
    private String username;
    private String password;
    public authRequesDTO(String username, String password) {
        this.username = username;
        this.password = password;

    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
