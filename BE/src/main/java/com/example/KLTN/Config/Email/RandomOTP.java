package com.example.KLTN.Config.Email;

import java.util.Random;

public class RandomOTP {
    public static String generateOTP(int length) {
        String chars = "0123456789";
        StringBuilder otp = new StringBuilder();
        Random rnd = new Random();
        for (int i = 0; i < length; i++) {
            otp.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return otp.toString();
    }

}
