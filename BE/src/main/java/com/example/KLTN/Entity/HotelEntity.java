package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@EqualsAndHashCode(exclude = {"owner", "rooms", "images"})
@Table(name = "hotel")
public class HotelEntity {
    public enum Status {
        pending,
        success,
        fail
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Status status;
    private String name;
    private String address;
    private String city; // Thành phố/Tỉnh
    private String phone;
    private String description;
    private String image;
    private int rating;
    @Column(nullable = false)
    private boolean deleted = false;
    @Column(nullable = false)
    private boolean locked = false; // Trạng thái khóa khách sạn
    private Double latitude; // Vĩ độ
    private Double longitude; // Kinh độ

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "bookings", "wallet", "role"})
    private UsersEntity owner;
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hotel"})
    private List<RoomsEntity> rooms;
    
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hotel"})
    @OrderBy("displayOrder ASC")
    private List<HotelImageEntity> images;

    // Transient field để lưu giá thấp nhất (không lưu vào DB)
    @Transient
    private Double minPrice;
    
    // Transient field để lưu số lượng booking (không lưu vào DB)
    @Transient
    private Long bookingCount;
    
    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }
    
    public Double getMinPrice() {
        return minPrice;
    }
    
    public void setBookingCount(Long bookingCount) {
        this.bookingCount = bookingCount;
    }
    
    public Long getBookingCount() {
        return bookingCount;
    }

    @PrePersist
    public void prePersist() {
        this.deleted = false;
        this.locked = false;
    }

}
