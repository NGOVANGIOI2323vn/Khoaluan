package com.example.KLTN.Controller.Chat;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.HotelRepository;
import com.example.KLTN.Service.Impl.OpenAiService;
import com.example.KLTN.Service.UserService;
import com.example.KLTN.dto.ChatMessageDTO;
import com.example.KLTN.dto.ChatResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private OpenAiService openAiService;
    
    @Autowired
    private UserService userService;

    @Value("${openai.api.key:}")
    private String apiKey;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            return principal instanceof UserDetails ? ((UserDetails) principal).getUsername() : principal.toString();
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatMessageDTO request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Kiểm tra API key
        if (apiKey == null || apiKey.trim().isEmpty()) {
            ChatResponseDTO errorResponse = new ChatResponseDTO("Lỗi cấu hình: OpenAI API key chưa được thiết lập.", new ArrayList<>());
            return ResponseEntity.status(500).body(errorResponse);
        }
        
        String userQuestion = request.getMessage();
        String username = getCurrentUsername();
        
        // Chỉ tìm khách sạn nếu câu hỏi thực sự yêu cầu tìm/giới thiệu khách sạn
        List<HotelEntity> suggestedHotels = new ArrayList<>();
        if (isHotelSearchRequest(userQuestion)) {
            // Tăng limit lên 10 để đảm bảo có đủ khách sạn
            suggestedHotels = findRelevantHotels(userQuestion, 10);
        }
        
        // Nếu có suggestedHotels, chỉ gửi suggestedHotels vào prompt để AI chỉ nói về các khách sạn này
        // Nếu không có, lấy danh sách khách sạn tổng quát (giới hạn 15 khách sạn để tránh vượt quá token limit)
        List<HotelEntity> hotelsForPrompt;
        if (!suggestedHotels.isEmpty()) {
            // Nếu có suggestedHotels, chỉ dùng các khách sạn này để đảm bảo AI và cards hiển thị giống nhau
            hotelsForPrompt = suggestedHotels;
        } else {
            // Nếu không có suggestedHotels, lấy danh sách tổng quát
            hotelsForPrompt = hotelRepository.findAllHotelsNotPending(HotelEntity.Status.pending);
            if (hotelsForPrompt.size() > 15) {
                hotelsForPrompt = hotelsForPrompt.subList(0, 15);
            }
        }
        String hotelData = formatHotelData(hotelsForPrompt);
        
        // Lấy lịch sử booking nếu user đã đăng nhập (giới hạn 5 booking gần nhất)
        String bookingHistoryData = "Người dùng chưa đăng nhập hoặc chưa có lịch sử đặt phòng nào.";
        if (username != null) {
            var user = userService.FindByUsername(username);
            if (user != null) {
                List<BookingEntity> bookings = bookingRepository.findByUserOrderByBookingDateDesc(user);
                if (bookings.size() > 5) {
                    bookings = bookings.subList(0, 5);
                }
                bookingHistoryData = formatBookingHistory(bookings);
            }
        }

        // Nếu có suggestedHotels, CHỈ gửi suggestedHotels vào prompt để AI chỉ nói về chúng
        // Điều này đảm bảo AI và hotel cards nhất quán
        String hotelsForAI;
        if (!suggestedHotels.isEmpty()) {
            // Nếu có suggestedHotels, chỉ format các khách sạn này để AI chỉ nói về chúng
            hotelsForAI = formatHotelData(suggestedHotels);
        } else {
            // Nếu không có suggestedHotels, dùng danh sách tổng quát
            hotelsForAI = hotelData;
        }
        
        // Đếm số lượng khách sạn để thông báo cho AI
        int hotelCount = suggestedHotels.isEmpty() ? 
            (hotelsForPrompt != null ? hotelsForPrompt.size() : 0) : 
            suggestedHotels.size();
        
        String prompt = String.format(
                "Bạn là nhân viên tư vấn đặt phòng khách sạn. Nhiệm vụ: giới thiệu khách sạn, giúp chọn phù hợp, trả lời câu hỏi về đặt phòng. KHÔNG trả lời câu hỏi ngoài chủ đề đặt phòng.\n\n" +
                "QUY TẮC QUAN TRỌNG:\n" +
                "1. CHỈ được giới thiệu các khách sạn có trong danh sách KHÁCH SẠN bên dưới. TUYỆT ĐỐI KHÔNG được tự tạo ra tên khách sạn không có trong danh sách.\n" +
                "2. TRƯỚC KHI nói 'không có' hoặc 'không tìm thấy', BẮT BUỘC phải kiểm tra kỹ danh sách KHÁCH SẠN bên dưới. Nếu có khách sạn phù hợp trong danh sách, PHẢI giới thiệu chúng.\n" +
                "3. Nếu trong danh sách có %d khách sạn, bạn PHẢI giới thiệu các khách sạn đó nếu chúng phù hợp với yêu cầu. KHÔNG được nói 'không có' nếu trong danh sách có khách sạn phù hợp.\n" +
                "4. Bạn có thể liệt kê tên khách sạn trong câu trả lời, nhưng CHỈ được liệt kê các khách sạn có trong danh sách bên dưới.\n" +
                "5. Trả lời tự nhiên, có thể giới thiệu và liệt kê tên khách sạn phù hợp với yêu cầu của người dùng.\n" +
                "6. QUAN TRỌNG: Nếu bạn liệt kê nhiều khách sạn, hãy đảm bảo tất cả các khách sạn đó đều có trong danh sách bên dưới.\n" +
                "7. Nếu người dùng hỏi về khách sạn với tiêu chí cụ thể (ví dụ: 5 sao ở Đà Nẵng), hãy kiểm tra kỹ danh sách bên dưới. Nếu có khách sạn phù hợp, PHẢI giới thiệu chúng.\n" +
                "8. QUAN TRỌNG VỀ RATING: Rating được hiển thị dạng 'X sao (X⭐)' trong danh sách. Ví dụ: '5 sao (5⭐)' nghĩa là khách sạn 5 sao. Hãy kiểm tra kỹ rating trong danh sách trước khi nói về rating.\n" +
                "9. Nếu trong danh sách có khách sạn với rating phù hợp (ví dụ: có khách sạn '5 sao (5⭐)'), BẮT BUỘC phải giới thiệu chúng. KHÔNG được nói 'không có khách sạn 5 sao' nếu trong danh sách có khách sạn 5 sao.\n\n" +
                "%s\n\n" +
                "DANH SÁCH KHÁCH SẠN CÓ SẴN (TỔNG CỘNG %d KHÁCH SẠN - CHỈ ĐƯỢC GIỚI THIỆU CÁC KHÁCH SẠN NÀY, KHÔNG ĐƯỢC TỰ TẠO THÊM):\n%s\n\n" +
                "LỊCH SỬ ĐẶT PHÒNG:\n%s\n\n" +
                "HƯỚNG DẪN: Đăng nhập → Chọn khách sạn → Chọn phòng → Thanh toán → Nhận QR code.\n\n" +
                "CÂU HỎI: %s\n\n" +
                "LƯU Ý CUỐI CÙNG: Nếu trong danh sách trên có khách sạn phù hợp với yêu cầu của người dùng, BẮT BUỘC phải giới thiệu chúng. KHÔNG được nói 'không có' nếu trong danh sách có khách sạn phù hợp.",
                hotelCount,
                username != null ? "Người dùng đã đăng nhập." : "Người dùng chưa đăng nhập.",
                hotelCount,
                hotelsForAI, 
                bookingHistoryData, 
                userQuestion);

        String answer = openAiService.ask(prompt, apiKey);
        
        // Trả về response với message và danh sách khách sạn
        ChatResponseDTO response = new ChatResponseDTO(answer, suggestedHotels);
        return ResponseEntity.ok(response);
    }
    
    private List<HotelEntity> findRelevantHotels(String question, int limit) {
        // Extract keywords từ câu hỏi
        String lowerQuestion = question.toLowerCase();
        String searchKeyword = extractSearchKeyword(lowerQuestion);
        String city = extractCity(lowerQuestion);
        Integer rating = extractRating(lowerQuestion);
        
        // Tìm hotels phù hợp - status.pending nghĩa là lấy tất cả khách sạn KHÔNG phải pending (tức là success và fail)
        // Nhưng chúng ta chỉ muốn lấy success, nên cần filter thêm
        Pageable pageable = PageRequest.of(0, limit * 2); // Lấy nhiều hơn để filter sau
        var hotelPage = hotelRepository.findHotelsWithFilters(
            HotelEntity.Status.pending, // status <> pending nghĩa là lấy success và fail
            rating != null ? rating : null, // minRating - nếu có rating thì filter theo rating đó
            rating != null ? rating : null, // maxRating - nếu có rating thì filter theo rating đó
            city, // city
            searchKeyword.isEmpty() ? null : searchKeyword, // search
            pageable
        );
        
        List<HotelEntity> hotels = hotelPage.getContent();
        
        // Chỉ lấy khách sạn có status = success (đã được duyệt)
        hotels = hotels.stream()
                .filter(hotel -> hotel.getStatus() == HotelEntity.Status.success)
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
        
        // Nếu không tìm thấy với rating filter, thử tìm lại với rating filter nhưng không filter city/search
        // để đảm bảo tìm được khách sạn có rating đó
        if (hotels.isEmpty() && rating != null) {
            // Thử tìm chỉ với rating, không filter city
            pageable = PageRequest.of(0, limit * 2);
            hotelPage = hotelRepository.findHotelsWithFilters(
                HotelEntity.Status.pending,
                rating, // minRating
                rating, // maxRating
                null, // city - bỏ filter city
                null, // search - bỏ filter search
                pageable
            );
            hotels = hotelPage.getContent().stream()
                    .filter(hotel -> hotel.getStatus() == HotelEntity.Status.success)
                    .filter(hotel -> hotel.getRating() == rating) // Đảm bảo rating chính xác
                    .limit(limit)
                    .collect(java.util.stream.Collectors.toList());
            
            // Nếu vẫn không tìm thấy, thử tìm không có rating filter nhưng có city
            if (hotels.isEmpty() && city != null) {
                pageable = PageRequest.of(0, limit * 2);
                hotelPage = hotelRepository.findHotelsWithFilters(
                    HotelEntity.Status.pending,
                    null, // minRating
                    null, // maxRating
                    city, // city
                    null, // search
                    pageable
                );
                hotels = hotelPage.getContent().stream()
                        .filter(hotel -> hotel.getStatus() == HotelEntity.Status.success)
                        .filter(hotel -> hotel.getRating() == rating) // Filter rating manually
                        .limit(limit)
                        .collect(java.util.stream.Collectors.toList());
            }
        }
        
        // Nếu vẫn không tìm thấy, lấy hotels ngẫu nhiên theo city hoặc tất cả
        if (hotels.isEmpty()) {
            if (city != null) {
                pageable = PageRequest.of(0, limit * 2);
                hotelPage = hotelRepository.findHotelsWithFilters(
                    HotelEntity.Status.pending,
                    null, // minRating
                    null, // maxRating
                    city, // city
                    null, // search
                    pageable
                );
                hotels = hotelPage.getContent().stream()
                        .filter(hotel -> hotel.getStatus() == HotelEntity.Status.success)
                        .limit(limit)
                        .collect(java.util.stream.Collectors.toList());
            }
            
            if (hotels.isEmpty()) {
                hotels = hotelRepository.findAllHotelsNotPending(HotelEntity.Status.pending);
                hotels = hotels.stream()
                        .filter(hotel -> hotel.getStatus() == HotelEntity.Status.success)
                        .limit(limit)
                        .collect(java.util.stream.Collectors.toList());
            }
        }
        
        return hotels;
    }
    
    private Integer extractRating(String question) {
        // Tìm pattern "X sao" hoặc "X star" trong câu hỏi
        // Pattern: số + "sao" hoặc số + "star"
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*(?:sao|star)");
        java.util.regex.Matcher matcher = pattern.matcher(question);
        
        if (matcher.find()) {
            try {
                int rating = Integer.parseInt(matcher.group(1));
                // Rating hợp lệ từ 1-5
                if (rating >= 1 && rating <= 5) {
                    return rating;
                }
            } catch (NumberFormatException e) {
                // Ignore
            }
        }
        
        return null;
    }
    
    private String extractSearchKeyword(String question) {
        // Loại bỏ các từ không cần thiết
        List<String> stopWords = Arrays.asList("tìm", "cho", "tôi", "muốn", "cần", "khách sạn", "phòng", "ở", "tại", "gần", "với", "có", "là", "gì", "nào", "đâu");
        String[] words = question.split("\\s+");
        List<String> keywords = new ArrayList<>();
        
        for (String word : words) {
            word = word.replaceAll("[^a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", "");
            if (!word.isEmpty() && !stopWords.contains(word) && word.length() > 2) {
                keywords.add(word);
            }
        }
        
        return String.join(" ", keywords);
    }
    
    private String extractCity(String question) {
        // Danh sách các thành phố phổ biến với nhiều biến thể
        // Map: key = pattern trong câu hỏi, value = tên city chuẩn trong database
        java.util.Map<String, String> cityMap = new java.util.HashMap<>();
        cityMap.put("hà nội", "Hà Nội");
        cityMap.put("ha noi", "Hà Nội");
        cityMap.put("hanoi", "Hà Nội");
        cityMap.put("hồ chí minh", "Hồ Chí Minh");
        cityMap.put("ho chi minh", "Hồ Chí Minh");
        cityMap.put("hcm", "Hồ Chí Minh");
        cityMap.put("sài gòn", "Hồ Chí Minh");
        cityMap.put("sai gon", "Hồ Chí Minh");
        cityMap.put("đà nẵng", "Đà Nẵng");
        cityMap.put("da nang", "Đà Nẵng");
        cityMap.put("danang", "Đà Nẵng");
        cityMap.put("nha trang", "Nha Trang");
        cityMap.put("hội an", "Hội An");
        cityMap.put("hoi an", "Hội An");
        cityMap.put("huế", "Huế");
        cityMap.put("hue", "Huế");
        cityMap.put("phú quốc", "Phú Quốc");
        cityMap.put("phu quoc", "Phú Quốc");
        cityMap.put("vũng tàu", "Vũng Tàu");
        cityMap.put("vung tau", "Vũng Tàu");
        cityMap.put("đà lạt", "Đà Lạt");
        cityMap.put("da lat", "Đà Lạt");
        cityMap.put("dalat", "Đà Lạt");
        
        String lowerQuestion = question.toLowerCase();
        for (java.util.Map.Entry<String, String> entry : cityMap.entrySet()) {
            if (lowerQuestion.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        return null;
    }
    
    private boolean isHotelSearchRequest(String question) {
        if (question == null || question.trim().isEmpty()) {
            return false;
        }
        
        String lowerQuestion = question.toLowerCase().trim();
        
        // Các từ khóa cho thấy người dùng muốn tìm khách sạn
        List<String> searchKeywords = Arrays.asList(
            "tìm", "tìm kiếm", "giới thiệu", "cho tôi", "muốn", "cần",
            "khách sạn", "hotel", "phòng", "room", "đặt phòng", "booking",
            "ở", "tại", "gần", "với", "có", "nào", "đâu",
            "giá", "rẻ", "đắt", "tốt", "đẹp", "gần biển", "gần trung tâm",
            "hà nội", "hồ chí minh", "đà nẵng", "nha trang", "hội an", "huế", "phú quốc"
        );
        
        // Các từ khóa cho thấy chỉ là câu chào hỏi hoặc câu hỏi chung chung
        List<String> greetingKeywords = Arrays.asList(
            "xin chào", "hello", "hi", "chào", "bạn", "mình", "có thể",
            "giúp", "gì", "không", "ạ", "nhé", "nhỉ"
        );
        
        // Nếu chỉ có từ chào hỏi mà không có từ tìm kiếm -> không phải yêu cầu tìm khách sạn
        boolean hasSearchKeyword = searchKeywords.stream().anyMatch(lowerQuestion::contains);
        boolean onlyGreeting = greetingKeywords.stream().anyMatch(lowerQuestion::contains) && 
                              !hasSearchKeyword && 
                              lowerQuestion.length() < 50; // Câu ngắn chỉ có chào hỏi
        
        // Nếu câu hỏi quá ngắn và chỉ có chào hỏi -> không phải yêu cầu tìm khách sạn
        if (onlyGreeting || (lowerQuestion.length() < 30 && !hasSearchKeyword)) {
            return false;
        }
        
        return hasSearchKeyword;
    }

    private String formatBookingHistory(List<BookingEntity> bookings) {
        if (bookings == null || bookings.isEmpty()) {
            return "Người dùng chưa có lịch sử đặt phòng nào.";
        }
        
        return bookings.stream().map(booking -> {
            if (booking == null || booking.getHotel() == null || booking.getRooms() == null) {
                return "- Thông tin đặt phòng không đầy đủ.";
            }

            String status = switch (booking.getStatus()) {
                case PENDING -> "Chờ thanh toán";
                case PAID -> "Đã thanh toán";
                case FAILED -> "Thanh toán thất bại";
                case REFUNDED -> "Đã hoàn tiền";
            };

            // Format ngắn gọn hơn để tiết kiệm tokens
            return String.format("Mã %d: %s - Phòng %s (%s) - %s đến %s - %s VND - %s",
                    booking.getId(),
                    booking.getHotel().getName(),
                    booking.getRooms().getNumber(),
                    booking.getRooms().getType(),
                    booking.getCheckInDate(),
                    booking.getCheckOutDate(),
                    booking.getTotalPrice(),
                    status
            );
        }).collect(Collectors.joining("\n\n"));
    }

    private String formatHotelData(List<HotelEntity> hotels) {
        if (hotels == null || hotels.isEmpty()) {
            return "Hiện tại chưa có khách sạn nào trong hệ thống.";
        }
        
        return hotels.stream().map(hotel -> {
            if (hotel == null) {
                return "- Thông tin khách sạn không đầy đủ.";
            }
            
            // Giới hạn số lượng phòng (chỉ lấy 5 phòng đầu tiên để tiết kiệm tokens)
            String roomsInfo = "";
            if (hotel.getRooms() != null && !hotel.getRooms().isEmpty()) {
                List<?> availableRooms = hotel.getRooms().stream()
                        .filter(room -> room != null && !room.isDeleted())
                        .limit(5)
                        .collect(Collectors.toList());
                
                if (availableRooms.isEmpty()) {
                    roomsInfo = "    Chưa có phòng khả dụng";
                } else {
                    roomsInfo = availableRooms.stream()
                            .map(room -> {
                                try {
                                    var r = (com.example.KLTN.Entity.RoomsEntity) room;
                                    double finalPrice = r.getPrice() * (1 - (r.getDiscountPercent() != null ? r.getDiscountPercent() : 0));
                                    return String.format("Phòng %s (%s): %.0f VND/đêm - %s",
                                            r.getNumber(),
                                            r.getType(),
                                            finalPrice,
                                            r.getStatus());
                                } catch (Exception e) {
                                    return "Phòng không hợp lệ";
                                }
                            })
                            .collect(Collectors.joining(", "));
                    
                    // Thêm thông tin nếu còn nhiều phòng hơn
                    long totalRooms = hotel.getRooms().stream()
                            .filter(room -> room != null && !room.isDeleted())
                            .count();
                    if (totalRooms > 5) {
                        roomsInfo += String.format(" (và %d phòng khác)", totalRooms - 5);
                    }
                }
            } else {
                roomsInfo = "Chưa có thông tin phòng";
            }

            // Rút gọn mô tả (chỉ lấy 100 ký tự đầu)
            String description = hotel.getDescription() != null ? hotel.getDescription() : "";
            if (description.length() > 100) {
                description = description.substring(0, 100) + "...";
            }

            // Format ngắn gọn hơn - hiển thị rating rõ ràng
            return String.format("%s | %s, %s | %d sao (%d⭐) | Phòng: %s",
                    hotel.getName(),
                    hotel.getAddress(),
                    hotel.getCity() != null ? hotel.getCity() : "N/A",
                    hotel.getRating(),
                    hotel.getRating(),
                    roomsInfo);
        }).collect(Collectors.joining("\n"));
    }

}

