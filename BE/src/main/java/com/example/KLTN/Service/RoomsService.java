package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.RoomsEntity;
import com.example.KLTN.Repository.RoomsRepository;
import com.example.KLTN.Service.Impl.RoomsServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomsService implements RoomsServiceImpl {
    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> updatecapacity(Long id, Integer capacity) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (capacity >= 0) {
                return httpResponseUtil.notFound("capacity Null");
            }
            rooms.setCapacity(capacity);
            this.saveRooms(rooms);
            return httpResponseUtil.ok("Update capacity Rooms Success", rooms);
        } catch (Exception e) {
            return httpResponseUtil.error("Update capacity Error", e);
        }
    }

    private final HttpResponseUtil httpResponseUtil;
    private final RoomsRepository roomsRepository;
    private final Image image;
    private final HotelService hotelService;

    @Override
    public ResponseEntity<Apireponsi<HotelEntity>> updateAlldiscount_percent(Long id, double discount_percent) {
        try {
            HotelEntity hotelEntity = hotelService.findHotelById(id);
            if (hotelEntity == null) {
                return httpResponseUtil.notFound("hotelEntity is null");
            } if (hotelEntity.getStatus().equals(HotelEntity.Status.pending)) {
                return httpResponseUtil.notFound("Hotel Chưa được phép kinh doanh");
            }
            if (hotelEntity.getRooms() == null || hotelEntity.getRooms().isEmpty()) {
                return httpResponseUtil.notFound("Khách sạn này chưa có phòng nào");
            }
            if (discount_percent > 1 || discount_percent < 0) {
                return httpResponseUtil.notFound("discountercent data error ");
            }
            for (int i = 0; i < hotelEntity.getRooms().size(); i++) {
                hotelEntity.getRooms().get(i).setDiscountPercent(discount_percent);
            }
            hotelService.saveHotel(hotelEntity);
            return httpResponseUtil.ok("Update all discount_percent cho roooms Sucsess ", hotelEntity);
        } catch (Exception e) {
            return httpResponseUtil.error("Update discountpercentAll Error", e);
        }
    }


    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> UpdateImage(Long id, MultipartFile imagedto) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (image == null) {
                return httpResponseUtil.notFound("image Null");
            }
            String imageUrl = image.updateFile(rooms.getImage(), imagedto);
            rooms.setImage(imageUrl);
            this.saveRooms(rooms);
            return httpResponseUtil.ok("Update Image Rooms Success", rooms);
        } catch (Exception e) {
            return httpResponseUtil.error("UpdateImage Error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> UpdatePrice(Long id, double price) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (price <= 0) {
                return httpResponseUtil.notFound("price Null");
            }
            rooms.setPrice(price);
            this.saveRooms(rooms);
            return httpResponseUtil.ok("Update Price Rooms Success", rooms);
        } catch (Exception e) {
            return httpResponseUtil.error("Update Price Error", e);
        }
    }


    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> updatestatus(Long id, RoomsEntity.Status status) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (status == null) {
                return httpResponseUtil.notFound("status Null");
            }
            rooms.setStatus(status);
            this.saveRooms(rooms);
            return httpResponseUtil.ok("Update Status Rooms Success", rooms);

        } catch (Exception e) {
            return httpResponseUtil.error("Update Status Error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> updateType(Long id, RoomsEntity.RoomType type) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (type == null) {
                return httpResponseUtil.notFound("type Null");
            }
            rooms.setType(type);
            this.saveRooms(rooms);
            return httpResponseUtil.ok("Update type Rooms Success", rooms);

        } catch (Exception e) {
            return httpResponseUtil.error("Update type Error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> updatediscount_percent(Long id, double discount_percent) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (discount_percent > 1 || discount_percent < 0) {
                return httpResponseUtil.notFound("discountercent data error ");
            }
            rooms.setDiscountPercent(discount_percent);
            this.saveRooms(rooms);
            return httpResponseUtil.ok("Update discountpercent Success", rooms);

        } catch (Exception e) {
            return httpResponseUtil.error("Update discountpercent Error", e);
        }
    }

    @Override
    public List<RoomsEntity> findAllRooms() {
        return roomsRepository.findAll();
    }

    @Override
    public RoomsEntity findRoomById(Long id) {
        return roomsRepository.findById(id).orElse(null);
    }

    @Override
    public void saveRooms(RoomsEntity rooms) {
        roomsRepository.save(rooms);
    }
}
