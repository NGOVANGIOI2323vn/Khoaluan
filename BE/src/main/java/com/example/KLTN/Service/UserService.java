package com.example.KLTN.Service;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.UserRepository;
import com.example.KLTN.Service.Impl.UserserviceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
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

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UsersEntity FindByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    private final UserRepository userRepository;

    @Override
    public void SaveUser(UsersEntity user) {
        userRepository.save(user);
    }

    @Override
    public boolean Exists(String username) {
        return userRepository.existsByUsername(username);
    }
}
