package com.example.KLTN.Controller.Vnpay;

import com.example.KLTN.Service.TransactitonsService;
import com.example.KLTN.Service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
public class VnpayController {

    @Autowired
    private VnpayService vnPayService;
    @Autowired
    private TransactitonsService transactitonsService;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(HttpServletRequest request,
                                           @RequestParam long amount,
                                           @RequestParam String orderInfo,
                                           @RequestParam String orderType) {
        try {
            String paymentUrl = vnPayService.createRedirectUrl(request, amount, orderInfo, orderType);
            return ResponseEntity.ok(Map.of("url", paymentUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal Server Error",
                "message", e.getMessage() != null ? e.getMessage() : "Error creating payment URL"
            ));
        }
    }

    @GetMapping("/return")
    public org.springframework.web.servlet.ModelAndView vnpayReturn(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterMap().forEach((k, v) -> paramMap.put(k, v[0]));
        String responseCode = paramMap.get("vnp_ResponseCode");
        
        // Build redirect URL với query params
        StringBuilder redirectUrl = new StringBuilder(frontendUrl + "/vnpay/callback");
        boolean firstParam = true;
        for (Map.Entry<String, String> entry : paramMap.entrySet()) {
            if (firstParam) {
                redirectUrl.append("?");
                firstParam = false;
            } else {
                redirectUrl.append("&");
            }
            redirectUrl.append(entry.getKey()).append("=").append(entry.getValue());
        }
        
        if (!paramMap.containsKey("vnp_SecureHash")) {
            transactitonsService.failedPayment(request);
            return new org.springframework.web.servlet.ModelAndView("redirect:" + redirectUrl.toString());
        }
        
        boolean valid = vnPayService.validateReturn(paramMap);
        if (valid && "00".equals(responseCode)) {
            transactitonsService.SucseccPayment(request);
        } else {
            transactitonsService.failedPayment(request);
        }
        
        // Redirect về frontend với tất cả params
        return new org.springframework.web.servlet.ModelAndView("redirect:" + redirectUrl.toString());
    }


}
