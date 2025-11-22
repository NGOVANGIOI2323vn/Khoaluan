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
            suggestedHotels = findRelevantHotels(userQuestion, 5);
        }
        
        // Lấy danh sách khách sạn (giới hạn 15 khách sạn để tránh vượt quá token limit)
        List<HotelEntity> allHotels = hotelRepository.findAllHotelsNotPending(HotelEntity.Status.pending);
        if (allHotels.size() > 15) {
            allHotels = allHotels.subList(0, 15);
        }
        String hotelData = formatHotelData(allHotels);
        
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

        // Tạo prompt ngắn gọn hơn để tránh vượt quá token limit
        String prompt = String.format(
                "Bạn là nhân viên tư vấn đặt phòng khách sạn. Nhiệm vụ: giới thiệu khách sạn, giúp chọn phù hợp, trả lời câu hỏi về đặt phòng. KHÔNG trả lời câu hỏi ngoài chủ đề đặt phòng.\n\n" +
                "QUAN TRỌNG: Trả lời ngắn gọn, không liệt kê chi tiết phòng và giá. Chỉ giới thiệu khách sạn một cách tự nhiên. Thông tin chi tiết về giá và phòng sẽ được hiển thị ở card khách sạn bên dưới.\n\n" +
                "%s\n\n" +
                "KHÁCH SẠN:\n%s\n\n" +
                "LỊCH SỬ ĐẶT PHÒNG:\n%s\n\n" +
                "HƯỚNG DẪN: Đăng nhập → Chọn khách sạn → Chọn phòng → Thanh toán → Nhận QR code.\n\n" +
                "CÂU HỎI: %s",
                username != null ? "Người dùng đã đăng nhập." : "Người dùng chưa đăng nhập.",
                hotelData, 
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
        
        // Tìm hotels phù hợp
        Pageable pageable = PageRequest.of(0, limit);
        var hotelPage = hotelRepository.findHotelsWithFilters(
            HotelEntity.Status.pending,
            null, // minRating
            null, // maxRating
            city, // city
            searchKeyword.isEmpty() ? null : searchKeyword, // search
            pageable
        );
        
        List<HotelEntity> hotels = hotelPage.getContent();
        
        // Nếu không tìm thấy, lấy hotels ngẫu nhiên
        if (hotels.isEmpty()) {
            hotels = hotelRepository.findAllHotelsNotPending(HotelEntity.Status.pending);
            if (hotels.size() > limit) {
                hotels = hotels.subList(0, limit);
            }
        }
        
        return hotels;
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
        // Danh sách các thành phố phổ biến
        List<String> cities = Arrays.asList("hà nội", "hồ chí minh", "đà nẵng", "nha trang", "hội an", "huế", "phú quốc", "vũng tàu", "đà lạt");
        
        for (String city : cities) {
            if (question.contains(city)) {
                // Capitalize first letter of each word
                String[] words = city.split("\\s+");
                StringBuilder result = new StringBuilder();
                for (int i = 0; i < words.length; i++) {
                    if (i > 0) result.append(" ");
                    result.append(words[i].substring(0, 1).toUpperCase()).append(words[i].substring(1));
                }
                return result.toString();
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

            // Format ngắn gọn hơn
            return String.format("%s | %s, %s | %d⭐ | Phòng: %s",
                    hotel.getName(),
                    hotel.getAddress(),
                    hotel.getCity() != null ? hotel.getCity() : "N/A",
                    hotel.getRating(),
                    roomsInfo);
        }).collect(Collectors.joining("\n"));
    }

}

