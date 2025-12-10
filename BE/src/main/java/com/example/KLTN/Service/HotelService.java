package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.HotelImageEntity;
import com.example.KLTN.Entity.RoomsEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.HotelImageRepository;
import com.example.KLTN.Repository.HotelRepository;
import com.example.KLTN.Repository.RoomsRepository;
import com.example.KLTN.Service.Impl.HotelServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.HotelFilterRequest;
import com.example.KLTN.dto.HotelPageResponse;
import com.example.KLTN.dto.PageResponse;
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
    private final HotelImageRepository hotelImageRepository;
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

            // 2. Kiểm tra hình ảnh khách sạn (có thể là file hoặc URL từ Cloudinary)
            List<String> hotelImageUrls = new ArrayList<>();
            
            // Ưu tiên sử dụng imageUrls (danh sách nhiều ảnh)
            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                hotelImageUrls = dto.getImageUrls();
            } else if (dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
                // Fallback: sử dụng imageUrl cũ (1 ảnh)
                hotelImageUrls.add(dto.getImageUrl());
            } else if (hotelImage != null && !hotelImage.isEmpty()) {
                // Sử dụng file upload truyền thống
                String savedUrl = image.saveFile(hotelImage);
                hotelImageUrls.add(savedUrl);
            } else {
                return httpResponseUtil.badRequest("Hotel images are required (either files or URLs)");
            }
            
            // 3. Tạo HotelEntity
            HotelEntity hotel = new HotelEntity();
            hotel.setAddress(dto.getAddress());
            hotel.setName(dto.getName());
            hotel.setDescription(dto.getDescription());
            hotel.setOwner(owner);
            // Lưu ảnh đầu tiên vào trường image cũ (để backward compatibility)
            hotel.setImage(hotelImageUrls.isEmpty() ? null : hotelImageUrls.get(0));
            hotel.setPhone(dto.getPhone());
            hotel.setStatus(HotelEntity.Status.pending);
            hotel.setDeleted(false);
            // Set latitude and longitude if provided
            if (dto.getLatitude() != null && dto.getLongitude() != null) {
                hotel.setLatitude(dto.getLatitude());
                hotel.setLongitude(dto.getLongitude());
            }
            
            // Lưu hotel trước để có ID
            this.saveHotel(hotel);
            
            // 4. Tạo và lưu các HotelImageEntity
            List<HotelImageEntity> hotelImages = new ArrayList<>();
            for (int i = 0; i < hotelImageUrls.size(); i++) {
                HotelImageEntity hotelImageEntity = new HotelImageEntity();
                hotelImageEntity.setImageUrl(hotelImageUrls.get(i));
                hotelImageEntity.setHotel(hotel);
                hotelImageEntity.setDisplayOrder(i);
                hotelImageEntity.setDeleted(false);
                hotelImages.add(hotelImageEntity);
            }
            hotelImageRepository.saveAll(hotelImages);
            hotel.setImages(hotelImages);

            // 4. Xử lý danh sách phòng
            List<RoomsEntity> roomEntities = new ArrayList<>();

            if (dto.getRooms() == null || dto.getRooms().isEmpty()) {
                return httpResponseUtil.notFound("Danh sách phòng không được để trống");
            }

            // Kiểm tra số lượng ảnh phòng (có thể là file hoặc URL)
            boolean useImageUrls = dto.getRooms().stream().anyMatch(room -> room.getImageUrl() != null && !room.getImageUrl().isEmpty());
            boolean useImageFiles = roomsImage != null && !roomsImage.isEmpty();
            
            if (!useImageUrls && !useImageFiles) {
                return httpResponseUtil.badRequest("Room images are required (either files or URLs)");
            }
            
            if (useImageUrls && useImageFiles) {
                return httpResponseUtil.badRequest("Cannot use both image URLs and files at the same time");
            }
            
            if (useImageFiles && dto.getRooms().size() != roomsImage.size()) {
                return httpResponseUtil.badRequest("Số lượng phòng và ảnh phòng không khớp");
            }
            
            this.saveHotel(hotel);
            for (int i = 0; i < dto.getRooms().size(); i++) {
                roomsDto roomDto = dto.getRooms().get(i);
                String roomImageUrl = null;
                
                if (useImageUrls) {
                    // Sử dụng URL từ Cloudinary
                    roomImageUrl = roomDto.getImageUrl();
                    if (roomImageUrl == null || roomImageUrl.isEmpty()) {
                        return httpResponseUtil.badRequest("Room image URL is required for room " + (i + 1));
                    }
                } else {
                    // Sử dụng file upload truyền thống
                MultipartFile roomImage = roomsImage.get(i);
                    if (roomImage == null || roomImage.isEmpty()) {
                        return httpResponseUtil.badRequest("Room image file is required for room " + (i + 1));
                    }
                    roomImageUrl = image.saveFile(roomImage);
                }
                
                RoomsEntity roomEntity = new RoomsEntity();
                roomEntity.setHotel(hotel);
                roomEntity.setType(RoomsEntity.RoomType.STANDARD);
                roomEntity.setPrice(roomDto.getPrice());
                roomEntity.setStatus(RoomsEntity.Status.AVAILABLE);
                roomEntity.setNumber(roomDto.getNumber());
                roomEntity.setDiscountPercent(0.0);
                roomEntity.setImage(roomImageUrl);
                roomEntity.setCapacity(0);
                roomEntity.setDeleted(false);
                roomEntities.add(roomEntity);
            }
            hotel.setRooms(roomEntities);
            // 5. Lưu Hotel + Rooms (đã lưu ở trên)
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
            // Cập nhật latitude and longitude if provided
            if (dto.getLatitude() != null && dto.getLongitude() != null) {
                hotel.setLatitude(dto.getLatitude());
                hotel.setLongitude(dto.getLongitude());
            }
            
            // Cập nhật ảnh: ưu tiên imageUrls (nhiều ảnh), sau đó imageUrl (1 ảnh), cuối cùng là file
            List<String> newImageUrls = new ArrayList<>();
            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                newImageUrls = dto.getImageUrls();
            } else if (dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
                newImageUrls.add(dto.getImageUrl());
            } else if (hotelImage != null && !hotelImage.isEmpty()) {
                String savedUrl = image.updateFile(hotel.getImage(), hotelImage);
                newImageUrls.add(savedUrl);
            }
            
            // Nếu có ảnh mới, cập nhật danh sách ảnh
            if (!newImageUrls.isEmpty()) {
                // Xóa các ảnh cũ (soft delete)
                List<HotelImageEntity> oldImages = hotelImageRepository.findActiveImagesByHotelId(hotel.getId());
                for (HotelImageEntity oldImage : oldImages) {
                    oldImage.setDeleted(true);
                }
                hotelImageRepository.saveAll(oldImages);
                
                // Tạo các ảnh mới
                List<HotelImageEntity> newImages = new ArrayList<>();
                for (int i = 0; i < newImageUrls.size(); i++) {
                    HotelImageEntity hotelImageEntity = new HotelImageEntity();
                    hotelImageEntity.setImageUrl(newImageUrls.get(i));
                    hotelImageEntity.setHotel(hotel);
                    hotelImageEntity.setDisplayOrder(i);
                    hotelImageEntity.setDeleted(false);
                    newImages.add(hotelImageEntity);
            }
                hotelImageRepository.saveAll(newImages);
                hotel.setImages(newImages);
                
                // Cập nhật ảnh đầu tiên vào trường image cũ (backward compatibility)
                hotel.setImage(newImageUrls.get(0));
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
            // Load rooms cho hotel detail (rooms đã được set null trong list để giảm response size)
            List<RoomsEntity> rooms = roomsRepository.findActiveRoomsByHotelId(hotel.getId());
            hotel.setRooms(rooms);
            
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
                
                // Set minPrice và clear rooms để giảm response size
                for (HotelEntity hotel : paginatedHotels) {
                    Double minPrice = priceMap.get(hotel.getId());
                    if (minPrice != null) {
                        hotel.setMinPrice(minPrice);
                    }
                    // Clear rooms để giảm response size (rooms sẽ được load riêng khi cần)
                    hotel.setRooms(null);
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
                    // Set minPrice và clear rooms để giảm response size
                    for (HotelEntity hotel : hotels) {
                        Double minPrice = priceMap.get(hotel.getId());
                        if (minPrice != null) {
                            hotel.setMinPrice(minPrice);
                        }
                        // Clear rooms để giảm response size (rooms sẽ được load riêng khi cần)
                        hotel.setRooms(null);
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

    /**
     * Lấy hotels của owner với pagination
     */
    public ResponseEntity<Apireponsi<PageResponse<HotelEntity>>> getMyHotelsPaginated(Integer page, Integer size) {
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
            
            int pageNumber = (page != null && page >= 0) ? page : 0;
            int pageSize = (size != null && size > 0) ? size : 10;
            Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"));
            
            Page<HotelEntity> hotelPage = hotelRepository.findByOwnerId(owner.getId(), pageable);
            
            // Set minPrice cho mỗi hotel
            if (!hotelPage.getContent().isEmpty()) {
                List<Long> hotelIds = hotelPage.getContent().stream()
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
                for (HotelEntity hotel : hotelPage.getContent()) {
                    Double minPrice = priceMap.get(hotel.getId());
                    if (minPrice != null) {
                        hotel.setMinPrice(minPrice);
                    }
                }
            }
            
            PageResponse<HotelEntity> pageResponse = new PageResponse<>(
                hotelPage.getContent(),
                hotelPage.getTotalPages(),
                hotelPage.getTotalElements(),
                hotelPage.getNumber(),
                hotelPage.getSize(),
                hotelPage.hasNext(),
                hotelPage.hasPrevious()
            );
            
            return httpResponseUtil.ok("Get my hotels success", pageResponse);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting my hotels", e);
        }
    }

    /**
     * Lấy danh sách hotels đang chờ duyệt (pending) - chỉ admin
     */
    public ResponseEntity<Apireponsi<List<HotelEntity>>> getPendingHotels(String search) {
        try {
            List<HotelEntity> pendingHotels;
            if (search != null && !search.trim().isEmpty()) {
                pendingHotels = hotelRepository.findByStatusWithSearch(HotelEntity.Status.pending, search.trim());
            } else {
                pendingHotels = hotelRepository.findByStatus(HotelEntity.Status.pending);
            }
            // Set rooms to null để giảm response size
            pendingHotels.forEach(hotel -> hotel.setRooms(null));
            return httpResponseUtil.ok("Pending hotels retrieved successfully", pendingHotels);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting pending hotels", e);
        }
    }

    /**
     * Lấy danh sách hotels đang chờ duyệt với pagination - chỉ admin
     */
    public ResponseEntity<Apireponsi<PageResponse<HotelEntity>>> getPendingHotelsPaginated(String search, Integer page, Integer size) {
        try {
            int pageNumber = (page != null && page >= 0) ? page : 0;
            int pageSize = (size != null && size > 0) ? size : 10;
            Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"));
            
            String searchQuery = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
            Page<HotelEntity> hotelPage;
            
            if (searchQuery != null) {
                hotelPage = hotelRepository.findByStatusWithSearchPageable(HotelEntity.Status.pending, searchQuery, pageable);
            } else {
                hotelPage = hotelRepository.findByStatusPageable(HotelEntity.Status.pending, pageable);
            }
            
            // Set rooms to null để giảm response size
            hotelPage.getContent().forEach(hotel -> hotel.setRooms(null));
            
            PageResponse<HotelEntity> pageResponse = new PageResponse<>(
                hotelPage.getContent(),
                hotelPage.getTotalPages(),
                hotelPage.getTotalElements(),
                hotelPage.getNumber(),
                hotelPage.getSize(),
                hotelPage.hasNext(),
                hotelPage.hasPrevious()
            );
            
            return httpResponseUtil.ok("Pending hotels retrieved successfully", pageResponse);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting pending hotels", e);
        }
    }

    /**
     * Duyệt hotel (chuyển status từ pending -> success) - chỉ admin
     */
    @Transactional
    public ResponseEntity<Apireponsi<HotelEntity>> approveHotel(Long id) {
        try {
            HotelEntity hotel = hotelRepository.findById(id)
                .filter(h -> !h.isDeleted())
                .orElse(null);
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            if (hotel.getStatus() != HotelEntity.Status.pending) {
                return httpResponseUtil.badRequest("Hotel is not in pending status");
            }
            hotel.setStatus(HotelEntity.Status.success);
            hotelRepository.save(hotel);
            return httpResponseUtil.ok("Hotel approved successfully", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Error approving hotel", e);
        }
    }

    /**
     * Từ chối hotel (chuyển status từ pending -> fail) - chỉ admin
     */
    @Transactional
    public ResponseEntity<Apireponsi<HotelEntity>> rejectHotel(Long id) {
        try {
            HotelEntity hotel = hotelRepository.findById(id)
                .filter(h -> !h.isDeleted())
                .orElse(null);
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            if (hotel.getStatus() != HotelEntity.Status.pending) {
                return httpResponseUtil.badRequest("Hotel is not in pending status");
            }
            hotel.setStatus(HotelEntity.Status.fail);
            hotelRepository.save(hotel);
            return httpResponseUtil.ok("Hotel rejected successfully", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Error rejecting hotel", e);
        }
    }

    /**
     * Lấy tất cả hotels (bao gồm cả pending, success, fail) - chỉ admin
     */
    public ResponseEntity<Apireponsi<List<HotelEntity>>> getAllHotelsForAdmin(String search) {
        try {
            List<HotelEntity> allHotels;
            if (search != null && !search.trim().isEmpty()) {
                allHotels = hotelRepository.findAllNotDeletedWithSearch(search.trim());
            } else {
                allHotels = hotelRepository.findAllNotDeleted();
            }
            // Set rooms to null để giảm response size
            allHotels.forEach(hotel -> hotel.setRooms(null));
            return httpResponseUtil.ok("All hotels retrieved successfully", allHotels);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting all hotels", e);
        }
    }

    /**
     * Lấy tất cả hotels với pagination - chỉ admin
     */
    public ResponseEntity<Apireponsi<PageResponse<HotelEntity>>> getAllHotelsForAdminPaginated(String search, Integer page, Integer size) {
        try {
            int pageNumber = (page != null && page >= 0) ? page : 0;
            int pageSize = (size != null && size > 0) ? size : 10;
            Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"));
            
            String searchQuery = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
            Page<HotelEntity> hotelPage;
            
            if (searchQuery != null) {
                hotelPage = hotelRepository.findAllNotDeletedWithSearch(searchQuery, pageable);
            } else {
                hotelPage = hotelRepository.findAllNotDeleted(pageable);
            }
            
            // Set rooms to null để giảm response size
            hotelPage.getContent().forEach(hotel -> hotel.setRooms(null));
            
            PageResponse<HotelEntity> pageResponse = new PageResponse<>(
                hotelPage.getContent(),
                hotelPage.getTotalPages(),
                hotelPage.getTotalElements(),
                hotelPage.getNumber(),
                hotelPage.getSize(),
                hotelPage.hasNext(),
                hotelPage.hasPrevious()
            );
            
            return httpResponseUtil.ok("All hotels retrieved successfully", pageResponse);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting all hotels", e);
        }
    }

    /**
     * Admin tạo hotel mới - chỉ admin
     */
    @Transactional
    public ResponseEntity<Apireponsi<HotelEntity>> createHotelForAdmin(hotelDto dto, MultipartFile hotelImage, List<MultipartFile> roomsImage, Long ownerId) {
        try {
            // 1. Kiểm tra xác thực admin
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return httpResponseUtil.badRequest("User not authenticated");
            }

            // 2. Lấy owner (nếu có ownerId, nếu không thì để null - admin tự quản lý)
            UsersEntity owner = null;
            if (ownerId != null) {
                owner = userService.findById(ownerId);
                if (owner == null) {
                    return httpResponseUtil.notFound("Owner not found");
                }
            }

            // 3. Kiểm tra hình ảnh khách sạn
            List<String> hotelImageUrls = new ArrayList<>();
            
            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                hotelImageUrls = dto.getImageUrls();
            } else if (dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
                hotelImageUrls.add(dto.getImageUrl());
            } else if (hotelImage != null && !hotelImage.isEmpty()) {
                String savedUrl = image.saveFile(hotelImage);
                hotelImageUrls.add(savedUrl);
            } else {
                return httpResponseUtil.badRequest("Hotel images are required (either files or URLs)");
            }
            
            // 4. Tạo HotelEntity
            HotelEntity hotel = new HotelEntity();
            hotel.setAddress(dto.getAddress());
            hotel.setName(dto.getName());
            hotel.setDescription(dto.getDescription());
            hotel.setOwner(owner);
            hotel.setImage(hotelImageUrls.isEmpty() ? null : hotelImageUrls.get(0));
            hotel.setPhone(dto.getPhone());
            hotel.setStatus(HotelEntity.Status.success); // Admin tạo thì tự động approve
            hotel.setDeleted(false);
            // Set latitude and longitude if provided
            if (dto.getLatitude() != null && dto.getLongitude() != null) {
                hotel.setLatitude(dto.getLatitude());
                hotel.setLongitude(dto.getLongitude());
            }
            
            // Lưu hotel trước để có ID
            this.saveHotel(hotel);
            
            // 5. Tạo và lưu các HotelImageEntity
            List<HotelImageEntity> hotelImages = new ArrayList<>();
            for (int i = 0; i < hotelImageUrls.size(); i++) {
                HotelImageEntity hotelImageEntity = new HotelImageEntity();
                hotelImageEntity.setImageUrl(hotelImageUrls.get(i));
                hotelImageEntity.setHotel(hotel);
                hotelImageEntity.setDisplayOrder(i);
                hotelImageEntity.setDeleted(false);
                hotelImages.add(hotelImageEntity);
            }
            hotelImageRepository.saveAll(hotelImages);
            hotel.setImages(hotelImages);

            // 6. Xử lý danh sách phòng
            List<RoomsEntity> roomEntities = new ArrayList<>();

            if (dto.getRooms() == null || dto.getRooms().isEmpty()) {
                return httpResponseUtil.notFound("Danh sách phòng không được để trống");
            }

            boolean useImageUrls = dto.getRooms().stream().anyMatch(room -> room.getImageUrl() != null && !room.getImageUrl().isEmpty());
            boolean useImageFiles = roomsImage != null && !roomsImage.isEmpty();
            
            if (!useImageUrls && !useImageFiles) {
                return httpResponseUtil.badRequest("Room images are required (either files or URLs)");
            }

            for (int i = 0; i < dto.getRooms().size(); i++) {
                roomsDto roomDto = dto.getRooms().get(i);
                String roomImageUrl = null;
                
                if (useImageUrls) {
                    // Sử dụng URL từ Cloudinary
                    roomImageUrl = roomDto.getImageUrl();
                    if (roomImageUrl == null || roomImageUrl.isEmpty()) {
                        return httpResponseUtil.badRequest("Room image URL is required for room " + (i + 1));
                    }
                } else if (useImageFiles && i < roomsImage.size()) {
                    // Sử dụng file upload truyền thống
                    MultipartFile roomImage = roomsImage.get(i);
                    if (roomImage == null || roomImage.isEmpty()) {
                        return httpResponseUtil.badRequest("Room image file is required for room " + (i + 1));
                    }
                    roomImageUrl = image.saveFile(roomImage);
                } else {
                    return httpResponseUtil.badRequest("Room image is required for room " + (i + 1));
                }
                
                RoomsEntity room = new RoomsEntity();
                room.setHotel(hotel);
                room.setType(RoomsEntity.RoomType.STANDARD);
                room.setPrice(roomDto.getPrice());
                room.setStatus(RoomsEntity.Status.AVAILABLE);
                room.setNumber(roomDto.getNumber());
                room.setDiscountPercent(0.0);
                room.setImage(roomImageUrl);
                room.setCapacity(0);
                room.setDeleted(false);
                roomEntities.add(room);
            }

            roomsRepository.saveAll(roomEntities);
            hotel.setRooms(roomEntities);
            
            return httpResponseUtil.ok("Hotel created successfully by admin", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Error creating hotel", e);
        }
    }

    /**
     * Admin cập nhật hotel - chỉ admin
     */
    @Transactional
    public ResponseEntity<Apireponsi<HotelEntity>> updateHotelForAdmin(Long id, updateHotelDto dto, MultipartFile hotelImage, Long ownerId) {
        try {
            // Tìm hotel (bao gồm cả pending)
            HotelEntity hotel = hotelRepository.findById(id)
                .filter(h -> !h.isDeleted())
                .orElse(null);
            
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }

            // Cập nhật thông tin cơ bản
            hotel.setName(dto.getName());
            hotel.setDescription(dto.getDescription());
            hotel.setAddress(dto.getAddress());
            hotel.setPhone(dto.getPhone());
            // Cập nhật latitude and longitude if provided
            if (dto.getLatitude() != null && dto.getLongitude() != null) {
                hotel.setLatitude(dto.getLatitude());
                hotel.setLongitude(dto.getLongitude());
            }
            
            // Cập nhật owner nếu có
            if (ownerId != null) {
                UsersEntity owner = userService.findById(ownerId);
                if (owner == null) {
                    return httpResponseUtil.notFound("Owner not found");
                }
                hotel.setOwner(owner);
            }
            
            // Cập nhật ảnh
            List<String> newImageUrls = new ArrayList<>();
            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                newImageUrls = dto.getImageUrls();
            } else if (dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
                newImageUrls.add(dto.getImageUrl());
            } else if (hotelImage != null && !hotelImage.isEmpty()) {
                String savedUrl = image.updateFile(hotel.getImage(), hotelImage);
                newImageUrls.add(savedUrl);
            }
            
            // Nếu có ảnh mới, cập nhật danh sách ảnh
            if (!newImageUrls.isEmpty()) {
                // Xóa các ảnh cũ (soft delete)
                List<HotelImageEntity> oldImages = hotelImageRepository.findActiveImagesByHotelId(hotel.getId());
                for (HotelImageEntity oldImage : oldImages) {
                    oldImage.setDeleted(true);
                }
                hotelImageRepository.saveAll(oldImages);
                
                // Tạo các ảnh mới
                List<HotelImageEntity> newImages = new ArrayList<>();
                for (int i = 0; i < newImageUrls.size(); i++) {
                    HotelImageEntity hotelImageEntity = new HotelImageEntity();
                    hotelImageEntity.setImageUrl(newImageUrls.get(i));
                    hotelImageEntity.setHotel(hotel);
                    hotelImageEntity.setDisplayOrder(i);
                    hotelImageEntity.setDeleted(false);
                    newImages.add(hotelImageEntity);
                }
                hotelImageRepository.saveAll(newImages);
                hotel.setImages(newImages);
                
                // Cập nhật ảnh đầu tiên vào trường image cũ (backward compatibility)
                hotel.setImage(newImageUrls.get(0));
            }
            
            this.saveHotel(hotel);
            return httpResponseUtil.ok("Hotel updated successfully by admin", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Error updating hotel", e);
        }
    }

    /**
     * Admin xóa hotel (soft delete) - chỉ admin
     */
    @Transactional
    public ResponseEntity<Apireponsi<HotelEntity>> deleteHotelForAdmin(Long id) {
        try {
            // Tìm hotel (bao gồm cả pending)
            HotelEntity hotel = hotelRepository.findById(id)
                .filter(h -> !h.isDeleted())
                .orElse(null);
            
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
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
            return httpResponseUtil.ok("Hotel deleted successfully by admin", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Error deleting hotel", e);
        }
    }

    /**
     * Admin xem chi tiết hotel - chỉ admin (bao gồm cả pending)
     */
    public ResponseEntity<Apireponsi<HotelEntity>> getHotelByIdForAdmin(Long id) {
        try {
            HotelEntity hotel = hotelRepository.findById(id)
                .filter(h -> !h.isDeleted())
                .orElse(null);
            
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            
            // Load rooms cho hotel detail
            List<RoomsEntity> rooms = roomsRepository.findActiveRoomsByHotelId(hotel.getId());
            hotel.setRooms(rooms);
            
            // Set minPrice cho hotel
            Double minPrice = hotelRepository.findMinPriceByHotelId(hotel.getId());
            if (minPrice != null && minPrice > 0) {
                hotel.setMinPrice(minPrice);
            }
            
            return httpResponseUtil.ok("Hotel retrieved successfully", hotel);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting hotel", e);
        }
    }
}
