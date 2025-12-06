package com.example.KLTN.Repository;

import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends CrudRepository<UsersEntity, Long>, PagingAndSortingRepository<UsersEntity, Long> {
    boolean existsByUsername(String email);
    UsersEntity findByUsername(String email);
    Boolean existsByEmail(String email);
    UsersEntity findByEmail(String email);
    List<UsersEntity> findByRole(RoleEntity role);
    
    @Query("SELECT u FROM UsersEntity u WHERE u.role.name = :roleName")
    List<UsersEntity> findByRoleName(@Param("roleName") String roleName);
    
    @Query("SELECT u FROM UsersEntity u WHERE u.role.name = :roleName")
    Page<UsersEntity> findByRoleName(@Param("roleName") String roleName, Pageable pageable);
    
    Page<UsersEntity> findAll(Pageable pageable);
}
