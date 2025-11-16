package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;

public interface WalletsServiceImpl {
    void SaveWallet(WalletsEntity wallet);

    WalletsEntity GetWallet(UsersEntity usersEntity);
}
