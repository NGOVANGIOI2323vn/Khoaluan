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
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã OTP xác thực tài khoản - Hotels Booking");
            message.setText("Xin chào!\n\nMã OTP của bạn là: " + otp + "\n\nMã này có hiệu lực trong 5 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai.\n\nTrân trọng,\nHotels Booking Team");
            message.setFrom("ngovangioi2424vn@gmail.com");
            this.mailSender.send(message);
        } catch (Exception e) {
            System.err.println("ERROR sending OTP to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
