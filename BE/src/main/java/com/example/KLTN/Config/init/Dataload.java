package com.example.KLTN.Config.init;

import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Service.RoleService;
import com.example.KLTN.Service.UserService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class  Dataload implements ApplicationRunner {

    private final RoleService roleService;
    private final UserService userService;
    private final JwtUtill jwtUtill;

    public Dataload(RoleService roleService, UserService userService, JwtUtill jwtUtill) {
        this.roleService = roleService;
        this.userService = userService;
        this.jwtUtill = jwtUtill;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!roleService.existByRolename("ADMIN")
                && !roleService.existByRolename("OWNER")
                && !roleService.existByRolename("USER")) {
            RoleEntity role1 = new RoleEntity();
            role1.setName("ADMIN");
            roleService.SaveRole(role1);
            RoleEntity role2 = new RoleEntity();
            role2.setName("OWNER");
            roleService.SaveRole(role2);
            RoleEntity role3 = new RoleEntity();
            role3.setName("USER");
            roleService.SaveRole(role3);
        }
        // Always update admin password to ensure it's correct
        UsersEntity admin = userService.FindByUsername("admin");
        if (admin == null) {
            // Create admin if doesn't exist
            RoleEntity role = roleService.finByRolename("ADMIN");
            admin = new UsersEntity();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setVerified(true);
            admin.setPassword(jwtUtill.passwordEncoder().encode("123456"));
            admin.setRole(role);
            admin.setPhone("0123456789");
            userService.SaveUser(admin);
        } else {
            // Update password to ensure it matches current encoder
            admin.setPassword(jwtUtill.passwordEncoder().encode("123456"));
            userService.SaveUser(admin);
        }
    }
}



