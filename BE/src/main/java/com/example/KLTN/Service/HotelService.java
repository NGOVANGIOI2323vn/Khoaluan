package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.RoomsEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.HotelRepository;
import com.example.KLTN.Repository.RoomsRepository;
import com.example.KLTN.Service.Impl.HotelServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.HotelFilterRequest;
import com.example.KLTN.dto.HotelPageResponse;
import com.example.KLTN.dto.hotelDto;
import com.example.KLTN.dto.roomsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.KLTN.dto.updateHotelDto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HotelService implements HotelServiceImpl {

    private final UserService userService;
    private final HttpResponseUtil httpResponseUtil;
    private final Image image;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final RoomsRepository roomsRepository;

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
            hotel.setDeleted(false);

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
                roomEntity.setDeleted(false);
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
            if (hotel.getStatus().equals(HotelEntity.Status.pending)) {
                return httpResponseUtil.notFound("Hotel Chưa được phép kinh doanh");
            }

            hotel.setName(dto.getName());
            hotel.setDescription(dto.getDescription());
            hotel.setAddress(dto.getAddress());
            hotel.setPhone(dto.getPhone());
            if (hotelImage != null) {
                String image1 = image.updateFile(hotel.getImage(), hotelImage);
                hotel.setImage(image1);
            }
            this.saveHotel(hotel);
            return httpResponseUtil.ok("Update Hotel", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi update ", e);
        }
    }// ====================================================================================//

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
        List<HotelEntity> hotels = hotelRepository.findAllHotelsNotPending(HotelEntity.Status.pending);
        // Set minPrice cho mỗi hotel
        if (!hotels.isEmpty()) {
            List<Long> hotelIds = hotels.stream()
                    .map(HotelEntity::getId)
                    .toList();
            List<Object[]> priceResults = hotelRepository.findMinPricesByHotelIds(hotelIds);
            Map<Long, Double> priceMap = new HashMap<>();
            for (Object[] result : priceResults) {
                try {
                    if (result != null && result.length >= 2) {
                        Long hotelId = ((Number) result[0]).longValue();
                        Double minPrice = ((Number) result[1]).doubleValue();
                        if (hotelId != null && minPrice != null && minPrice > 0) {
                            priceMap.put(hotelId, minPrice);
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Error parsing price result: " + ex.getMessage());
                }
            }
            for (HotelEntity hotel : hotels) {
                Double minPrice = priceMap.get(hotel.getId());
                if (minPrice != null) {
                    hotel.setMinPrice(minPrice);
                }
            }
        }
        return hotels;
    }

    public ResponseEntity<Apireponsi<HotelEntity>> getHotelById(Long id) {
        try {
            HotelEntity hotel = this.findHotelById(id);
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            // Set minPrice cho hotel
            Double minPrice = hotelRepository.findMinPriceByHotelId(hotel.getId());
            if (minPrice != null && minPrice > 0) {
                hotel.setMinPrice(minPrice);
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

    @Transactional
    public ResponseEntity<Apireponsi<HotelEntity>> softDeleteHotel(Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return httpResponseUtil.badRequest("User not authenticated");
            }
            String username = auth.getName();
            UsersEntity owner = userService.FindByUsername(username);
            if (owner == null) {
                return httpResponseUtil.notFound("Owner not found");
            }
            HotelEntity hotel = this.findHotelById(id);
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            if (hotel.getOwner() == null || !hotel.getOwner().getId().equals(owner.getId())) {
                return httpResponseUtil.badRequest("Bạn không có quyền xóa khách sạn này");
            }
            hotel.setDeleted(true);
            List<RoomsEntity> hotelRooms = hotel.getRooms();
            if (hotelRooms == null || hotelRooms.isEmpty()) {
                hotelRooms = roomsRepository.findActiveRoomsByHotelId(hotel.getId());
                hotel.setRooms(hotelRooms);
            }
            if (hotelRooms != null) {
                hotelRooms.forEach(room -> room.setDeleted(true));
            }
            this.saveHotel(hotel);
            return httpResponseUtil.ok("Xóa khách sạn thành công", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Không thể xóa khách sạn", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<HotelPageResponse>> findHotelsWithFilters(HotelFilterRequest filterRequest) {
        try {
            // Validate và set defaults
            int page = filterRequest.getPage() != null && filterRequest.getPage() >= 0 ? filterRequest.getPage() : 0;
            int size = filterRequest.getSize() != null && filterRequest.getSize() > 0 ? filterRequest.getSize() : 8;
            
            // Nếu có price filter, cần filter trước khi paginate
            List<HotelEntity> allHotels;
            if (filterRequest.getMinPrice() != null || filterRequest.getMaxPrice() != null || 
                (filterRequest.getSortBy() != null && 
                 (filterRequest.getSortBy().equals("price_high") || filterRequest.getSortBy().equals("price_low")))) {
                // Lấy tất cả hotels trước (không paginate)
                Pageable allPageable = PageRequest.of(0, Integer.MAX_VALUE);
                Page<HotelEntity> allHotelPage = hotelRepository.findHotelsWithFilters(
                    HotelEntity.Status.pending,
                    filterRequest.getMinRating(),
                    filterRequest.getMaxRating(),
                    filterRequest.getCity(),
                    filterRequest.getSearch(),
                    allPageable
                );
                allHotels = allHotelPage.getContent();
                
                // Filter theo check-in/check-out và số phòng nếu có
                if (filterRequest.getCheckIn() != null && filterRequest.getCheckOut() != null) {
                    allHotels = filterHotelsByAvailability(allHotels, filterRequest.getCheckIn(), 
                                                          filterRequest.getCheckOut(), filterRequest.getNumberOfRooms());
                }
                
                // Load tất cả giá một lần bằng batch query để tránh N+1 query
                Map<Long, Double> priceMap = new HashMap<>();
                if (!allHotels.isEmpty()) {
                    try {
                        List<Long> hotelIds = allHotels.stream()
                                .map(HotelEntity::getId)
                                .toList();
                        List<Object[]> priceResults = hotelRepository.findMinPricesByHotelIds(hotelIds);
                        for (Object[] result : priceResults) {
                            try {
                                // result[0] is hotel_id (Long), result[1] is min_price (Double)
                                if (result == null || result.length < 2) {
                                    System.err.println("Invalid result array: " + (result == null ? "null" : "length=" + result.length));
                                    continue;
                                }
                                
                                Object hotelIdObj = result[0];
                                Object priceObj = result[1];
                                
                                Long hotelId = null;
                                if (hotelIdObj instanceof Number) {
                                    hotelId = ((Number) hotelIdObj).longValue();
                                } else if (hotelIdObj instanceof Long) {
                                    hotelId = (Long) hotelIdObj;
                                } else {
                                    System.err.println("Unexpected hotelId type: " + (hotelIdObj != null ? hotelIdObj.getClass().getName() : "null"));
                                }
                                
                                Double minPrice = null;
                                if (priceObj instanceof Number) {
                                    minPrice = ((Number) priceObj).doubleValue();
                                } else if (priceObj instanceof Double) {
                                    minPrice = (Double) priceObj;
                                } else {
                                    System.err.println("Unexpected price type: " + (priceObj != null ? priceObj.getClass().getName() : "null"));
                                }
                                
                                if (hotelId != null && minPrice != null && minPrice > 0) {
                                    priceMap.put(hotelId, minPrice);
                                }
                            } catch (Exception ex) {
                                System.err.println("Error parsing price result: " + ex.getMessage());
                                ex.printStackTrace();
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error loading prices in batch: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                // Filter by price
                if (filterRequest.getMinPrice() != null || filterRequest.getMaxPrice() != null) {
                    allHotels = filterByPrice(allHotels, filterRequest.getMinPrice(), filterRequest.getMaxPrice(), priceMap);
                }
                
                // Sort by price nếu cần
                if (filterRequest.getSortBy() != null && 
                    (filterRequest.getSortBy().equals("price_high") || filterRequest.getSortBy().equals("price_low"))) {
                    // Chỉ sort hotels có giá trong priceMap
                    allHotels = sortByPrice(allHotels, filterRequest.getSortBy(), priceMap);
                } else {
                    // Sort theo sortBy khác
                    Sort sort = createSort(filterRequest.getSortBy());
                    allHotels.sort((h1, h2) -> {
                        if (sort.getOrderFor("rating") != null && sort.getOrderFor("rating").isDescending()) {
                            return Integer.compare(h2.getRating(), h1.getRating());
                        } else if (sort.getOrderFor("id") != null && sort.getOrderFor("id").isDescending()) {
                            return Long.compare(h2.getId(), h1.getId());
                        }
                        return 0;
                    });
                }
                
                // Paginate manually
                int start = page * size;
                int end = Math.min(start + size, allHotels.size());
                List<HotelEntity> paginatedHotels = start < allHotels.size() 
                    ? allHotels.subList(start, end) 
                    : new ArrayList<>();
                
                // Set minPrice cho mỗi hotel trong paginated list
                for (HotelEntity hotel : paginatedHotels) {
                    Double minPrice = priceMap.get(hotel.getId());
                    if (minPrice != null) {
                        hotel.setMinPrice(minPrice);
                    }
                }
                
                int totalPages = allHotels.size() > 0 ? (int) Math.ceil((double) allHotels.size() / size) : 0;
                
                HotelPageResponse response = new HotelPageResponse(
                    paginatedHotels,
                    totalPages,
                    (long) allHotels.size(),
                    page,
                    size,
                    page < totalPages - 1,
                    page > 0
                );
                
                return httpResponseUtil.ok("Danh sách khách sạn", response);
            } else {
                // Không có price filter, sử dụng pagination thông thường
                Sort sort = createSort(filterRequest.getSortBy());
                Pageable pageable = PageRequest.of(page, size, sort);
                
                Page<HotelEntity> hotelPage = hotelRepository.findHotelsWithFilters(
                    HotelEntity.Status.pending,
                    filterRequest.getMinRating(),
                    filterRequest.getMaxRating(),
                    filterRequest.getCity(),
                    filterRequest.getSearch(),
                    pageable
                );
                
                // Filter theo check-in/check-out và số phòng nếu có
                List<HotelEntity> hotels = hotelPage.getContent();
                if (filterRequest.getCheckIn() != null && filterRequest.getCheckOut() != null) {
                    hotels = filterHotelsByAvailability(hotels, filterRequest.getCheckIn(), 
                                                        filterRequest.getCheckOut(), filterRequest.getNumberOfRooms());
                }
                
                // Load minPrice cho các hotels trong page
                if (!hotels.isEmpty()) {
                    List<Long> hotelIds = hotels.stream()
                            .map(HotelEntity::getId)
                            .toList();
                    List<Object[]> priceResults = hotelRepository.findMinPricesByHotelIds(hotelIds);
                    Map<Long, Double> priceMap = new HashMap<>();
                    for (Object[] result : priceResults) {
                        try {
                            if (result != null && result.length >= 2) {
                                Long hotelId = ((Number) result[0]).longValue();
                                Double minPrice = ((Number) result[1]).doubleValue();
                                if (hotelId != null && minPrice != null && minPrice > 0) {
                                    priceMap.put(hotelId, minPrice);
                                }
                            }
                        } catch (Exception ex) {
                            System.err.println("Error parsing price result: " + ex.getMessage());
                        }
                    }
                    // Set minPrice cho mỗi hotel
                    for (HotelEntity hotel : hotels) {
                        Double minPrice = priceMap.get(hotel.getId());
                        if (minPrice != null) {
                            hotel.setMinPrice(minPrice);
                        }
                    }
                }
                
                HotelPageResponse response = new HotelPageResponse(
                    hotels,
                    hotelPage.getTotalPages(),
                    hotelPage.getTotalElements(),
                    page,
                    size,
                    hotelPage.hasNext(),
                    hotelPage.hasPrevious()
                );
                
                return httpResponseUtil.ok("Danh sách khách sạn", response);
            }
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy danh sách khách sạn", e);
        }
    }
    
    private Sort createSort(String sortBy) {
        if (sortBy == null || sortBy.isEmpty() || sortBy.equals("recommended")) {
            // Mặc định: rating cao nhất
            return Sort.by(Sort.Direction.DESC, "rating");
        }
        
        switch (sortBy) {
            case "top_rated":
            case "most_stars":
                return Sort.by(Sort.Direction.DESC, "rating");
            case "price_high":
            case "price_low":
                // Sẽ sort sau khi filter by price
                return Sort.by(Sort.Direction.DESC, "rating");
            case "newest":
                return Sort.by(Sort.Direction.DESC, "id");
            default:
                return Sort.by(Sort.Direction.DESC, "rating");
        }
    }
    
    private List<HotelEntity> filterByPrice(List<HotelEntity> hotels, Double minPrice, Double maxPrice, Map<Long, Double> priceMap) {
        List<HotelEntity> filtered = new ArrayList<>();
        for (HotelEntity hotel : hotels) {
            Double minHotelPrice = priceMap.get(hotel.getId());
            // Nếu hotel không có rooms hoặc không có giá, bỏ qua
            if (minHotelPrice == null) {
                continue;
            }
            
            boolean matches = true;
            if (minPrice != null && minHotelPrice < minPrice) {
                matches = false;
            }
            if (maxPrice != null && minHotelPrice > maxPrice) {
                matches = false;
            }
            
            if (matches) {
                filtered.add(hotel);
            }
        }
        return filtered;
    }
    
    private List<HotelEntity> sortByPrice(List<HotelEntity> hotels, String sortBy, Map<Long, Double> priceMap) {
        // Tách hotels có giá và không có giá
        List<HotelEntity> hotelsWithPrice = new ArrayList<>();
        List<HotelEntity> hotelsWithoutPrice = new ArrayList<>();
        
        for (HotelEntity hotel : hotels) {
            if (priceMap.containsKey(hotel.getId())) {
                hotelsWithPrice.add(hotel);
            } else {
                hotelsWithoutPrice.add(hotel);
            }
        }
        
        // Sort hotels có giá
        hotelsWithPrice.sort((h1, h2) -> {
            Double price1 = priceMap.get(h1.getId());
            Double price2 = priceMap.get(h2.getId());
            
            if (price1 == null || price2 == null) return 0;
            
            if (sortBy.equals("price_high")) {
                return price2.compareTo(price1);
            } else {
                return price1.compareTo(price2);
            }
        });
        
        // Kết hợp: hotels có giá trước, hotels không có giá sau
        List<HotelEntity> sorted = new ArrayList<>(hotelsWithPrice);
        sorted.addAll(hotelsWithoutPrice);
        
        return sorted;
    }
    
    // Filter hotels theo availability (check-in/check-out và số phòng)
    private List<HotelEntity> filterHotelsByAvailability(List<HotelEntity> hotels, 
                                                          java.time.LocalDate checkIn, 
                                                          java.time.LocalDate checkOut, 
                                                          Integer numberOfRooms) {
        if (checkIn == null || checkOut == null || checkIn.isAfter(checkOut)) {
            return hotels; // Invalid dates, return all hotels
        }

        // Không check checkIn.isBefore(LocalDate.now()) vì có thể book trong tương lai

        // Lấy danh sách room IDs đã bị book trong khoảng thời gian
        List<Long> bookedRoomIds = bookingRepository.findBookedRoomIdsInDateRange(checkIn, checkOut);

        List<HotelEntity> filtered = new ArrayList<>();
        for (HotelEntity hotel : hotels) {
            // Đếm số phòng available của hotel
            List<RoomsEntity> allRooms = roomsRepository.findActiveRoomsByHotelId(hotel.getId());
            List<RoomsEntity> availableRooms = allRooms.stream()
                    .filter(room -> room.getStatus() == RoomsEntity.Status.AVAILABLE)
                    .filter(room -> !bookedRoomIds.contains(room.getId()))
                    .toList();
            
            int requiredRooms = (numberOfRooms != null && numberOfRooms > 0) ? numberOfRooms : 1;
            if (availableRooms.size() >= requiredRooms) {
                filtered.add(hotel);
            }
        }

        return filtered;
    }
    
    // Lấy hotels của owner hiện tại
    public ResponseEntity<Apireponsi<List<HotelEntity>>> getMyHotels() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return httpResponseUtil.badRequest("User not authenticated");
            }
            
            String username = auth.getName();
            UsersEntity owner = userService.FindByUsername(username);
            if (owner == null) {
                return httpResponseUtil.notFound("Owner not found");
            }
            
            List<HotelEntity> hotels = hotelRepository.findByOwnerId(owner.getId());
            
            // Set minPrice cho mỗi hotel
            if (!hotels.isEmpty()) {
                List<Long> hotelIds = hotels.stream()
                        .map(HotelEntity::getId)
                        .toList();
                List<Object[]> priceResults = hotelRepository.findMinPricesByHotelIds(hotelIds);
                Map<Long, Double> priceMap = new HashMap<>();
                for (Object[] result : priceResults) {
                    try {
                        if (result != null && result.length >= 2) {
                            Long hotelId = ((Number) result[0]).longValue();
                            Double minPrice = ((Number) result[1]).doubleValue();
                            if (hotelId != null && minPrice != null && minPrice > 0) {
                                priceMap.put(hotelId, minPrice);
                            }
                        }
                    } catch (Exception ex) {
                        System.err.println("Error parsing price result: " + ex.getMessage());
                    }
                }
                for (HotelEntity hotel : hotels) {
                    Double minPrice = priceMap.get(hotel.getId());
                    if (minPrice != null) {
                        hotel.setMinPrice(minPrice);
                    }
                }
            }
            
            return httpResponseUtil.ok("Get my hotels success", hotels);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting my hotels", e);
        }
    }
}
