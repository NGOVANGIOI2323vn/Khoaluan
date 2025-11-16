package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.RegisterUserDto;
import com.example.KLTN.dto.VerifyDTO;
import com.example.KLTN.dto.authRequesDTO;
import org.springframework.http.ResponseEntity;

public interface AuthServiceImpl {
    ResponseEntity<Apireponsi<UsersEntity>> registerUser(RegisterUserDto dto, String roleName);
    ResponseEntity<Apireponsi<String>> sendOtp(String email);
    ResponseEntity<Apireponsi<String>> verifyOtp(VerifyDTO dto);
    ResponseEntity<Apireponsi<String>> login(authRequesDTO dto);
    ResponseEntity<Apireponsi<String>> loginOAuth2Success(String token);

}
