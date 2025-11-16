package com.example.KLTN.Controller.Vnpay;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Service.TransactitonsService;
import com.example.KLTN.Service.UserService;
import com.example.KLTN.Service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties;
import org.springframework.boot.autoconfigure.pulsar.PulsarProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
@CrossOrigin("*")
public class VnpayController {

    @Autowired
    private VnpayService vnPayService;
    @Autowired
    private TransactitonsService transactitonsService;
    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(HttpServletRequest request,
                                           @RequestParam long amount,
                                           @RequestParam String orderInfo,
                                           @RequestParam String orderType) {
        return ResponseEntity.ok(Map.of("url", vnPayService.createRedirectUrl(request, amount, orderInfo, orderType)));
    }

    @GetMapping("/return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterMap().forEach((k, v) -> paramMap.put(k, v[0]));
        String responseCode = paramMap.get("vnp_ResponseCode");
        if (!paramMap.containsKey("vnp_SecureHash")) {
            transactitonsService.failedPayment(request);
            return ResponseEntity.ok("User canceled payment.");
        }
        boolean valid = vnPayService.validateReturn(paramMap);
        if (valid && "00".equals(responseCode)) {
            transactitonsService.SucseccPayment(request);
            return ResponseEntity.ok("Thanh toán thành công!");
        } else if (valid) {
            transactitonsService.failedPayment(request);
            return ResponseEntity.ok("Giao dịch không thành công. Mã lỗi: " + responseCode);
        } else {
            transactitonsService.failedPayment(request);
            return ResponseEntity.badRequest().body("Invalid signature!");
        }
    }


}
