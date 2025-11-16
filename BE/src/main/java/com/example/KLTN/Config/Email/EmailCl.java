package com.example.KLTN.Config.Email;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;


@Component
public class EmailCl {
  private final JavaMailSender mailSender;

    EmailCl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    public void sendOTP(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP is: " + otp);
        message.setFrom("ngovangioi2424vn@gmail.com");
        this.mailSender.send(message);
    }
}
