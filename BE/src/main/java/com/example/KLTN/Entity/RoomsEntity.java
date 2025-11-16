package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Rooms")
@Data
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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
    private String Number;
    @Enumerated(EnumType.STRING)
    private RoomType type;
    @Enumerated(EnumType.STRING)
    private Status status;
    private Double price;
    private Integer capacity;
    private String image;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "hotel_id", nullable = false)
    private HotelEntity hotel;
}
