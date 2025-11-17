package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "bookings", "wallet", "role"})
    private UsersEntity owner;
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hotel"})
    private List<RoomsEntity> rooms;

    // Transient field để lưu giá thấp nhất (không lưu vào DB)
    @Transient
    private Double minPrice;
    
    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }
    
    public Double getMinPrice() {
        return minPrice;
    }

    @PrePersist
    public void prePersist() {
        this.deleted = false;
    }

}
