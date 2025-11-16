package com.example.KLTN.Repository;

import com.example.KLTN.Entity.UsersEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CrudRepository<UsersEntity, Long> {
    boolean existsByUsername(String email);
    UsersEntity findByUsername(String email);
    Boolean existsByEmail(String email);
    UsersEntity findByEmail(String email);
}
