package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.dto.ChangePasswordRequestDTO;
import com.example.KLTN.dto.UpdateUserDTO;

public interface UserserviceImpl {
    void SaveUser(UsersEntity user);

    UsersEntity findById(Long id);

    boolean Exists(String username);

    UsersEntity FindByUsername(String username);

    Boolean ExistsEmail(String email);

    UsersEntity findByEmail(String email);

    void changePassword(String username, ChangePasswordRequestDTO request);

  public UsersEntity updateUserInfo(Long userId, UpdateUserDTO dto)
}
