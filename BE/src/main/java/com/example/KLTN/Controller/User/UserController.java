package com.example.KLTN.Controller.User;

import java.security.Security;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Service.UserService;
import com.example.KLTN.dto.UpdateUserDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateUserDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UsersEntity user = userService.FindByUsername(username);
        if (user == null) {
            return ResponseEntity.status(404).body("User không tồn tại");
        }

        UsersEntity updated = userService.updateUserInfo(user.getId(), dto);
        return ResponseEntity.ok(updated);
    }

}
