package com.example.KLTN.Service;

import com.example.KLTN.Entity.UsersEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
//import javax.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VnpayService {

    @Value("${vnpay.tmnCode}") private String tmnCode;
    @Value("${vnpay.hashSecret}") private String hashSecret;
    @Value("${vnpay.url.pay}") private String vnpayPayUrl;
    @Value("${vnpay.version}") private String version;
    @Value("${vnpay.command}") private String command;
    @Value("${vnpay.currency}") private String currency;
    @Value("${vnpay.locale}") private String locale;
    @Value("${vnpay.returnUrl}") private String returnUrl;
    @Autowired
private UserService userService;
    public String createRedirectUrl(HttpServletRequest request, long amount, String orderInfo, String orderType) {
        try {
            // Validate config
            if (tmnCode == null || tmnCode.isEmpty()) {
                throw new RuntimeException("VNPay tmnCode is not configured");
            }
            if (hashSecret == null || hashSecret.isEmpty()) {
                throw new RuntimeException("VNPay hashSecret is not configured");
            }
            if (vnpayPayUrl == null || vnpayPayUrl.isEmpty()) {
                throw new RuntimeException("VNPay pay URL is not configured");
            }
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
                throw new RuntimeException("User not authenticated");
            }
            
            String name = authentication.getName();
            if (name == null || name.isEmpty()) {
                throw new RuntimeException("Cannot get username from authentication");
            }
            
            UsersEntity user = userService.FindByUsername(name);
            if (user == null) {
                throw new RuntimeException("User not found: " + name);
            }
            
            Long userId = user.getId();
            if (userId == null) {
                throw new RuntimeException("User ID is null");
            }
            
            // Nếu orderInfo đã có userId, không thêm lại
            String orderInfoWithUser = orderInfo;
            if (!orderInfo.contains("|userId:")) {
                orderInfoWithUser = orderInfo + "|userId:" + userId;
            }
            
            // Validate amount (amount đã là xu từ frontend, không cần nhân 100 nữa)
            if (amount <= 0) {
                throw new RuntimeException("Amount must be greater than 0");
            }
            
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", version);
            vnpParams.put("vnp_Command", command);
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", currency);
            vnpParams.put("vnp_TxnRef", String.valueOf(System.currentTimeMillis()));
            vnpParams.put("vnp_OrderInfo", orderInfoWithUser);
            vnpParams.put("vnp_OrderType", orderType);
            vnpParams.put("vnp_Locale", locale);
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
            String ipAddr = request.getRemoteAddr();
            if (ipAddr == null || ipAddr.isEmpty()) {
                ipAddr = "127.0.0.1";
            }
            vnpParams.put("vnp_IpAddr", ipAddr);
            
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (String fieldName : fieldNames) {
                String value = vnpParams.get(fieldName);
                if (value != null && !value.isEmpty()) {
                    hashData.append(fieldName).append('=')
                            .append(URLEncoder.encode(value, StandardCharsets.UTF_8))
                            .append('&');
                    query.append(fieldName).append('=')
                            .append(URLEncoder.encode(value, StandardCharsets.UTF_8))
                            .append('&');
                }
            }
            if (hashData.length() > 0) {
                hashData.deleteCharAt(hashData.length()-1);
            }
            if (query.length() > 0) {
                query.deleteCharAt(query.length()-1);
            }

            String secureHash = hmacSHA512(hashSecret, hashData.toString());
            query.append("&vnp_SecureHash=").append(secureHash);

            return vnpayPayUrl + "?" + query.toString();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error creating VNPay redirect URL: " + e.getMessage(), e);
        }
    }

    public boolean validateReturn(Map<String,String> params) {
        String secureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String value = params.get(fieldName);
            if (value != null && !value.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                        .append('&');
            }
        }
        if (hashData.length() > 0) hashData.deleteCharAt(hashData.length()-1);

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
