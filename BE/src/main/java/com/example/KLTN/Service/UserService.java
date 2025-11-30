package com.example.KLTN.Service;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.UserRepository;
import com.example.KLTN.Service.Impl.UserserviceImpl;
import com.example.KLTN.dto.ChangePasswordRequestDTO;
import com.example.KLTN.dto.UpdateUserDTO;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserserviceImpl {


    @Override
    public UsersEntity findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public UsersEntity findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Boolean ExistsEmail(String email) {
        return userRepository.existsByEmail(email);
    }

   

    @Override
    public UsersEntity FindByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void SaveUser(UsersEntity user) {
        userRepository.save(user);
    }

    @Override
    public boolean Exists(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public void changePassword(String username, ChangePasswordRequestDTO request) {
        // TODO Auto-generated method stub
       UsersEntity user = userRepository.findByUsername(username);

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        // Encode mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Lưu lại
        userRepository.save(user);
    }
     public UsersEntity updateUserInfo(Long userId, UpdateUserDTO dto) {

        UsersEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Cập nhật giá trị mới
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            user.setUsername(dto.getUsername());
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }

        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            user.setPhone(dto.getPhone());
        }

        return userRepository.save(user);
    }
}
    }
