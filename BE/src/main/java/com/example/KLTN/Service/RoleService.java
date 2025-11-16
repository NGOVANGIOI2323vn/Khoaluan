package com.example.KLTN.Service;

import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Repository.RolesRepository;
import com.example.KLTN.Service.Impl.RoleServiceImpl;
import org.springframework.stereotype.Service;


@Service
public class RoleService implements RoleServiceImpl {


    public RoleService(RolesRepository rolesRepository) {
        this.rolesRepository = rolesRepository;
    }

    @Override
    public Boolean existByRolename(String rolename) {
        return  rolesRepository.existsByName(rolename);
    }

    private final RolesRepository rolesRepository;

    @Override
    public RoleEntity finByRolename(String rolename) {
        return rolesRepository.findByName(rolename);
    }

    @Override
    public void SaveRole(RoleEntity role) {
        rolesRepository.save(role);
    }
}
