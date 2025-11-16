package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.RoleEntity;

public interface RoleServiceImpl {
    void SaveRole(RoleEntity role);
    RoleEntity finByRolename(String rolename);
    Boolean existByRolename(String rolename);


}
