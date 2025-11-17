package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.RoomsEntity;
import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomsServiceImpl {
    void saveRooms(RoomsEntity rooms);

    List<RoomsEntity> findAllRooms();

    RoomsEntity findRoomById(Long id);
    ResponseEntity<Apireponsi<RoomsEntity>> UpdateImage(Long id,MultipartFile imagedto);
    ResponseEntity<Apireponsi<RoomsEntity>> UpdatePrice(Long id,double price);
    ResponseEntity<Apireponsi<RoomsEntity>> updatestatus(Long id,RoomsEntity.Status status);
    ResponseEntity<Apireponsi<RoomsEntity>> updateType(Long id,RoomsEntity.RoomType type);
    ResponseEntity<Apireponsi<RoomsEntity>> updatediscount_percent(Long id,double discount_percent);
    ResponseEntity<Apireponsi<HotelEntity>> updateAlldiscount_percent(Long id, double discount_percent);
    ResponseEntity<Apireponsi<RoomsEntity>> updatecapacity(Long id, Integer capacity);
    ResponseEntity<Apireponsi<List<RoomsEntity>>> getRoomsByHotelId(Long hotelId);

}
