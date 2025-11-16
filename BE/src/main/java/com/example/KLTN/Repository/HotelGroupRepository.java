package com.example.KLTN.Repository;

import com.example.KLTN.Entity.HotelGroupEntity;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
@Registered
public interface HotelGroupRepository extends JpaRepository<HotelGroupEntity,Long> {
}
