package com.example.KLTN.Repository;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletsRepository extends JpaRepository<WalletsEntity, Long> {
    WalletsEntity findByUser(UsersEntity usersEntity);
}
