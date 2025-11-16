package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.UsersEntity;

public interface UserserviceImpl {
    void SaveUser(UsersEntity user);
UsersEntity findById(Long id);
    boolean Exists(String username);
    UsersEntity FindByUsername(String username);
    Boolean ExistsEmail(String email);
    UsersEntity findByEmail(String email);
}
