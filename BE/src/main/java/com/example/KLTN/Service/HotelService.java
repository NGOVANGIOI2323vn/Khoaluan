package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.RoomsEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.HotelRepository;
import com.example.KLTN.Service.Impl.HotelServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.hotelDto;
import com.example.KLTN.dto.roomsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.example.KLTN.dto.updateHotelDto;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelService implements HotelServiceImpl {

    private final UserService userService;
    private final HttpResponseUtil httpResponseUtil;
    private final Image image;

    @Override
    public ResponseEntity<Apireponsi<HotelEntity>> createHotel(hotelDto dto, MultipartFile hotelImage, List<MultipartFile> roomsImage) {
        try {
            // 1. Kiểm tra xác thực
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return httpResponseUtil.badRequest("User not authenticated");
            }

            String username = auth.getName();
            UsersEntity owner = userService.FindByUsername(username);

            // 2. Kiểm tra hình ảnh khách sạn
            if (hotelImage == null) {
                return httpResponseUtil.badRequest("Hotel image is null");
            }
            // 3. Tạo HotelEntity
            HotelEntity hotel = new HotelEntity();
            hotel.setAddress(dto.getAddress());
            hotel.setName(dto.getName());
            hotel.setDescription(dto.getDescription());
            hotel.setOwner(owner);
            hotel.setImage(image.saveFile(hotelImage));
            hotel.setPhone(dto.getPhone());
            hotel.setStatus(HotelEntity.Status.pending);

            // 4. Xử lý danh sách phòng
            List<RoomsEntity> roomEntities = new ArrayList<>();

            if (dto.getRooms() == null || dto.getRooms().isEmpty()) {
                return httpResponseUtil.notFound("Danh sách phòng không được để trống");
            }

            if (dto.getRooms().size() != roomsImage.size()) {
                return httpResponseUtil.badRequest("Số lượng phòng và ảnh phòng không khớp");
            }
            this.saveHotel(hotel);
            for (int i = 0; i < dto.getRooms().size(); i++) {
                roomsDto roomDto = dto.getRooms().get(i);
                MultipartFile roomImage = roomsImage.get(i);
                RoomsEntity roomEntity = new RoomsEntity();
                roomEntity.setHotel(hotel);
                roomEntity.setType(RoomsEntity.RoomType.STANDARD);
                roomEntity.setPrice(roomDto.getPrice());
                roomEntity.setStatus(RoomsEntity.Status.AVAILABLE);
                roomEntity.setNumber(roomDto.getNumber());
                roomEntity.setDiscountPercent(0.0);
                roomEntity.setImage(image.saveFile(roomImage));
                roomEntity.setCapacity(0);
                roomEntities.add(roomEntity);
            }
            hotel.setRooms(roomEntities);
            // 5. Lưu Hotel + Rooms
            this.saveHotel(hotel);

            return httpResponseUtil.created("Tạo khách sạn thành công", hotel);

        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi tạo khách sạn", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<List<HotelEntity>>> findAllHotel() {
        try {
            List<HotelEntity> hotels = this.findAllHotels();
            return httpResponseUtil.ok("Danh sách khách sạn", hotels);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy danh sách khách sạn", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<HotelEntity>> Updatehotel(Long id, updateHotelDto dto, MultipartFile hotelImage) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String name = auth.getName();
            UsersEntity owner = userService.FindByUsername(name);
            if (owner == null) {
                return httpResponseUtil.notFound("User not authenticated");
            }
            HotelEntity hotel = this.findHotelById(id);
            if (hotel == null) {
                return httpResponseUtil.notFound("null hotel");
            }
            if (hotelImage == null) {
                return httpResponseUtil.notFound("hotel image is null");
            }
            if (hotel.getStatus().equals(HotelEntity.Status.pending)) {
                return httpResponseUtil.notFound("Hotel Chưa được phép kinh doanh");
            }

            String image1 = image.updateFile(hotel.getImage(), hotelImage);
            hotel.setName(dto.getName());
            hotel.setDescription(dto.getDescription());
            hotel.setAddress(dto.getAddress());
            hotel.setPhone(dto.getPhone());
            hotel.setImage(image1);
            this.saveHotel(hotel);
            return httpResponseUtil.ok("Update Hotel", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi update ", e);
        }
    }// ====================================================================================//

    private final HotelRepository hotelRepository;

    @Override
    public void saveHotel(HotelEntity hotel) {
        hotelRepository.save(hotel);
    }

    @Override
    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    @Override
    public List<HotelEntity> findAllHotels() {
        return hotelRepository.findAllHotelsNotPending(HotelEntity.Status.pending);
    }

    public ResponseEntity<Apireponsi<HotelEntity>> getHotelById(Long id) {
        try {
            HotelEntity hotel = this.findHotelById(id);
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            return httpResponseUtil.ok("Hotel", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Erorr", e);
        }
    }

    @Override
    public HotelEntity findHotelById(Long id) {
        return hotelRepository.findByIdNotPending(id,HotelEntity.Status.pending);
    }
}
