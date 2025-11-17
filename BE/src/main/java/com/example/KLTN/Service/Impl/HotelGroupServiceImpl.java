package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.HotelGroupEntity;

import java.util.List;

public interface HotelGroupServiceImpl {
    void saveHotel(HotelGroupEntity hotelgroup);
    void DeleteHotelById(Long id);
    List<HotelGroupEntity> findAllHotelGroups();
    HotelGroupEntity findHotelGroupById(Long id);
}
