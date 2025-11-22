package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotel_images")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class HotelImageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imageUrl; // URL from Cloudinary

    @Column(nullable = false)
    private Integer displayOrder = 0; // Thứ tự hiển thị

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "images", "rooms", "owner"})
    private HotelEntity hotel;

    @Column(nullable = false)
    private boolean deleted = false;

    @PrePersist
    public void prePersist() {
        this.deleted = false;
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
    }
}

