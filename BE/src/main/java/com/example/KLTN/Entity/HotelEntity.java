package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
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
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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
    private String phone;
    private String description;
    private String image;
    private int rating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user")
    @JsonBackReference   // 👈 Đánh dấu đầu con — không serialize lại user
    private UsersEntity owner;
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<RoomsEntity> rooms;

}
