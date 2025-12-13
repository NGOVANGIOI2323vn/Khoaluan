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
            if (capacity == null || capacity < 0) {
                return httpResponseUtil.notFound("capacity invalid");
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
    private final UserService userService;
    private final com.example.KLTN.Repository.BookingRepository bookingRepository;

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
            if (imagedto == null || imagedto.isEmpty()) {
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
    
    // New method to update room image with URL
    public ResponseEntity<Apireponsi<RoomsEntity>> UpdateImageUrl(Long id, String imageUrl) {
        try {
            RoomsEntity rooms = this.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("rooms Null");
            }
            if (imageUrl == null || imageUrl.isEmpty()) {
                return httpResponseUtil.notFound("image URL Null");
            }
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
        return roomsRepository.findActiveRoomById(id).orElse(null);
    }

    @Override
    public void saveRooms(RoomsEntity rooms) {
        roomsRepository.save(rooms);
    }

    @Override
    public ResponseEntity<Apireponsi<List<RoomsEntity>>> getRoomsByHotelId(Long hotelId) {
        try {
            List<RoomsEntity> rooms = roomsRepository.findActiveRoomsByHotelId(hotelId);
            
            // Set booking count cho mỗi room
            for (RoomsEntity room : rooms) {
                Long bookingCount = bookingRepository.countBookingsByRoomId(room.getId());
                room.setBookingCount(bookingCount != null ? bookingCount : 0L);
            }
            
            return httpResponseUtil.ok("Get rooms by hotel ID success", rooms);
        } catch (Exception e) {
            return httpResponseUtil.error("Get rooms by hotel ID error", e);
        }
    }

    /**
     * Lấy danh sách phòng với pagination
     */
    public ResponseEntity<Apireponsi<com.example.KLTN.dto.PageResponse<RoomsEntity>>> getRoomsByHotelIdPaginated(Long hotelId, Integer page, Integer size) {
        try {
            int pageNumber = (page != null && page >= 0) ? page : 0;
            int pageSize = (size != null && size > 0) ? size : 10;
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                pageNumber, 
                pageSize, 
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "number")
            );
            
            org.springframework.data.domain.Page<RoomsEntity> roomPage = roomsRepository.findActiveRoomsByHotelId(hotelId, pageable);
            
            // Set booking count cho mỗi room
            for (RoomsEntity room : roomPage.getContent()) {
                Long bookingCount = bookingRepository.countBookingsByRoomId(room.getId());
                room.setBookingCount(bookingCount != null ? bookingCount : 0L);
            }
            
            com.example.KLTN.dto.PageResponse<RoomsEntity> pageResponse = new com.example.KLTN.dto.PageResponse<>(
                roomPage.getContent(),
                roomPage.getTotalPages(),
                roomPage.getTotalElements(),
                roomPage.getNumber(),
                roomPage.getSize(),
                roomPage.hasNext(),
                roomPage.hasPrevious()
            );
            
            return httpResponseUtil.ok("Get rooms by hotel ID success", pageResponse);
        } catch (Exception e) {
            return httpResponseUtil.error("Get rooms by hotel ID error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<RoomsEntity>> softDeleteRoom(Long id) {
        try {
            RoomsEntity room = this.findRoomById(id);
            if (room == null) {
                return httpResponseUtil.notFound("Room not found");
            }
            
            // Kiểm tra quyền: chỉ owner của hotel mới được xóa phòng
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return httpResponseUtil.badRequest("User not authenticated");
            }
            
            String username = auth.getName();
            com.example.KLTN.Entity.UsersEntity user = userService.FindByUsername(username);
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            
            HotelEntity hotel = room.getHotel();
            if (hotel == null || hotel.getOwner() == null || !hotel.getOwner().getId().equals(user.getId())) {
                return httpResponseUtil.badRequest("Bạn không có quyền xóa phòng này");
            }
            
            // Kiểm tra xem room có booking không (chỉ tính PENDING và PAID)
            Long bookingCount = bookingRepository.countBookingsByRoomId(room.getId());
            if (bookingCount != null && bookingCount > 0) {
                return httpResponseUtil.badRequest(
                    "Không thể xóa phòng này vì đã có " + bookingCount + 
                    " đặt phòng. Vui lòng đợi đến khi tất cả đặt phòng hoàn tất hoặc đã hủy."
                );
            }
            
            room.setDeleted(true);
            this.saveRooms(room);
            return httpResponseUtil.ok("Xóa phòng thành công", room);
        } catch (Exception e) {
            return httpResponseUtil.error("Error deleting room", e);
        }
    }
}
