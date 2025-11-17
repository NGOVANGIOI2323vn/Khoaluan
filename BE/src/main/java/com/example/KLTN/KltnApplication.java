package com.example.KLTN;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KltnApplication {
    public static void main(String[] args) {
        SpringApplication.run(KltnApplication.class, args);

    }
}