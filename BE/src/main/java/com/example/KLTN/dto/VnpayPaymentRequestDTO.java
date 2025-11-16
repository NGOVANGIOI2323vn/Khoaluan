package com.example.KLTN.dto;

public class VnpayPaymentRequestDTO {
    private long amount;          // VNĐ
    private String bankCode;      // Mã ngân hàng, có thể null
    private String orderInfo;     // Mô tả giao dịch

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }

    public String getOrderInfo() { return orderInfo; }
    public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }
}
