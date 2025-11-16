package com.example.KLTN.Repository;

import com.example.KLTN.Entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolesRepository extends JpaRepository<RoleEntity,Long> {
    RoleEntity findByName(String name);

    Boolean existsByName(String name);
}
