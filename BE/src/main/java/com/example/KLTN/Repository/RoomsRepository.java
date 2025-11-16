package com.example.KLTN.Repository;

import com.example.KLTN.Entity.RoomsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomsRepository extends JpaRepository<RoomsEntity,Long> {
}
