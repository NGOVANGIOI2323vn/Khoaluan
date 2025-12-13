package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Rooms")
@Data
@EqualsAndHashCode(exclude = {"hotel"})
public class RoomsEntity {
    public enum RoomType {
        STANDARD,
        DELUXE,
        SUITE,
        SUPERIOR,
        EXECUTIVE,
        FAMILY,
        STUDIO
    }
    public enum Status {
        AVAILABLE,  // còn phòng
        BOOKED,// đã đặt
        MAINTENANCE // bảo trì
    }// Ngày kết thúc booking

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Min(value = 0, message = "Khuyến mãi không được âm")
    @Max(value = 1, message = "Khuyến mãi không được vượt quá 1")
    private Double discountPercent;
    @JsonProperty("Number")
    private String Number;
    @Enumerated(EnumType.STRING)
    private RoomType type;
    @Enumerated(EnumType.STRING)
    private Status status;
    private Double price;
    private Integer capacity;
    private String image;
    @Column(nullable = false)
    private boolean deleted = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "rooms", "owner"})
    @JoinColumn(name = "hotel_id", nullable = false)
    private HotelEntity hotel;

    // Transient field để lưu số lượng booking (không lưu vào DB)
    @Transient
    private Long bookingCount;

    public void setBookingCount(Long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public Long getBookingCount() {
        return bookingCount;
    }

    @PrePersist
    public void prePersist() {
        this.deleted = false;
    }
}
