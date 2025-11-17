package com.example.KLTN.Service;

import com.example.KLTN.Entity.HotelGroupEntity;
import com.example.KLTN.Repository.HotelGroupRepository;
import com.example.KLTN.Service.Impl.HotelGroupServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@RequiredArgsConstructor
@Service
public class HotelGroupService implements HotelGroupServiceImpl {
    private final HotelGroupRepository hotelGroupRepository;
    @Override
    public void saveHotel(HotelGroupEntity hotelGroup) {
        hotelGroupRepository.save(hotelGroup);
    }

    @Override
    public void DeleteHotelById(Long id) {
hotelGroupRepository.deleteById(id);
    }

    @Override
    public List<HotelGroupEntity> findAllHotelGroups() {
        return hotelGroupRepository.findAll();
    }

    @Override
    public HotelGroupEntity findHotelGroupById(Long id) {
        return hotelGroupRepository.findById(id).orElse(null);
    }
}
