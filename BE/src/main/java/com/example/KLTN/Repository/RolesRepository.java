package com.example.KLTN.Repository;

import com.example.KLTN.Entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolesRepository extends JpaRepository<RoleEntity,Long> {
    @Query("SELECT r FROM RoleEntity r WHERE r.name = :name")
    List<RoleEntity> findAllByName(@Param("name") String name);
    
    @Query("SELECT r FROM RoleEntity r WHERE r.name = :name")
    Optional<RoleEntity> findFirstByName(@Param("name") String name);
    
    // Keep old method for backward compatibility but use findFirst
    default RoleEntity findByName(String name) {
        return findFirstByName(name).orElse(null);
    }

    Boolean existsByName(String name);
}
