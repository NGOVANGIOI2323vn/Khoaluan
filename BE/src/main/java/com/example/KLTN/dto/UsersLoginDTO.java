package com.example.KLTN.dto;

import com.example.KLTN.Entity.UsersEntity;

public class UsersLoginDTO {
    private String token;
    private UsersEntity users;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UsersEntity getUsers() {
        return users;
    }

    public void setUsers(UsersEntity users) {
        this.users = users;
    }
}
