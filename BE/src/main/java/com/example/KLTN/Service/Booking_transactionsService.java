package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Entity.Booking_transactionsEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.Booking_transactionsRepository;
import com.example.KLTN.Service.Impl.Booking_transactionsServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.HotelRevenueDTO;
import com.example.KLTN.dto.RevenueSummaryDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Booking_transactionsService implements Booking_transactionsServiceImpl {
    @Override
    public Booking_transactionsEntity findById(Long id) {
        return booking_transactionsRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> setSatus(Long id) {
        try {
            Booking_transactionsEntity transactions = this.findById(id);
            if (transactions == null) {
                return httpResponseUtil.notFound("transactions not found");
            }
            if (!transactions.getStatus().equals(Booking_transactionsEntity.Status.PENDING)) {
                return httpResponseUtil.badRequest("Đã đuoợc xử lí ");
            }

            UsersEntity admin = userService.FindByUsername("admin");
            if (admin == null) {
                return httpResponseUtil.notFound("admin not found");
            }
            transactions.getBookingEntity().getHotel().getOwner().getWallet().
                    setBalance(transactions.getBookingEntity().getHotel().getOwner().getWallet().getBalance().
                            add(transactions.getUser_mount()));

            admin.getWallet().setBalance(admin.getWallet().getBalance().add(transactions.getAdmin_mount()));
            userService.SaveUser(admin);
            this.SaveBooking_transactions(transactions);
            transactions.setStatus(Booking_transactionsEntity.Status.APPROVED);
            return httpResponseUtil.ok("Transactions saved successfully", transactions);
        } catch (Exception e) {
            return httpResponseUtil.error("Error", e);
        }
    }

    private final Booking_transactionsRepository booking_transactionsRepository;
    private final HttpResponseUtil httpResponseUtil;
    private final AdminPercentService adminPercentService;
    private final UserService userService;

    @Override
    public void SaveBooking_transactions(Booking_transactionsEntity booking_transactionsEntity) {
        this.booking_transactionsRepository.save(booking_transactionsEntity);
    }

    @Override
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> findBooking_transactionsById(Long id) {
        try {
            Booking_transactionsEntity transaction = this.booking_transactionsRepository.findById(id).orElse(null);
            if (transaction == null) {
                return httpResponseUtil.notFound("Booking transactions not found");
            }
            return httpResponseUtil.created("create booking transactions successfully", transaction);
        } catch (Exception e) {
            return httpResponseUtil.error("Error", e);
        }

    }

    @Override
    public ResponseEntity<Apireponsi<List<Booking_transactionsEntity>>> findAllBooking_transactionsById() {
        try {
            List<Booking_transactionsEntity> list = this.booking_transactionsRepository.findAll();
            return httpResponseUtil.ok("find all booking transactions successfully", list);
        } catch (Exception e) {
            return httpResponseUtil.error("Error", e);

        }
    }

    @Override
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> Create(BookingEntity booking) {
        try {
            BigDecimal amouth = booking.getTotalPrice();
            double percentAdmin = adminPercentService.findAdminPercentById(Long.parseLong("1")).getAdminPercent();
            if (percentAdmin < 0 || percentAdmin > 1) {
                return httpResponseUtil.badRequest("Sai du lieu");
            }
            BigDecimal percentAdminBD = BigDecimal.valueOf(percentAdmin);
            BigDecimal amouthAdmin = amouth.multiply(percentAdminBD);
            BigDecimal amounthOwner = amouth.subtract(amouthAdmin);
            Booking_transactionsEntity transaction = new Booking_transactionsEntity();
            transaction.setAmount(amouth);
            transaction.setAdmin_mount(amouthAdmin);
            transaction.setUser_mount(amounthOwner);
            transaction.setStatus(Booking_transactionsEntity.Status.PENDING);
            transaction.setBookingEntity(booking);
            this.booking_transactionsRepository.save(transaction);
            return httpResponseUtil.created("create booking transactions successfully", transaction);

        } catch (Exception e) {
            return httpResponseUtil.error("Error", e);
        }
    }
    
    // Lấy transactions của owner hiện tại
    public ResponseEntity<Apireponsi<List<Booking_transactionsEntity>>> getMyTransactions() {
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
            
            List<Booking_transactionsEntity> transactions = booking_transactionsRepository.findByOwnerId(owner.getId());
            return httpResponseUtil.ok("Get my transactions success", transactions);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting my transactions", e);
        }
    }
    
    // Lấy doanh thu của owner (theo từng hotel)
    public ResponseEntity<Apireponsi<RevenueSummaryDTO>> getOwnerRevenue() {
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
            
            Long ownerId = owner.getId();
            
            // Tính tổng doanh thu đã duyệt
            BigDecimal totalRevenue = booking_transactionsRepository.getTotalRevenueByOwnerId(ownerId);
            if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
            
            // Tính doanh thu chờ duyệt
            BigDecimal pendingRevenue = booking_transactionsRepository.getPendingRevenueByOwnerId(ownerId);
            if (pendingRevenue == null) pendingRevenue = BigDecimal.ZERO;
            
            // Tính doanh thu theo từng hotel
            List<Object[]> approvedRevenues = booking_transactionsRepository.getRevenueByHotels(ownerId);
            List<Object[]> pendingRevenues = booking_transactionsRepository.getPendingRevenueByHotels(ownerId);
            
            // Tạo map để merge dữ liệu
            Map<Long, HotelRevenueDTO> hotelRevenueMap = new HashMap<>();
            
            // Xử lý approved revenues
            for (Object[] row : approvedRevenues) {
                Long hotelId = ((Number) row[0]).longValue();
                String hotelName = (String) row[1];
                BigDecimal revenue = (BigDecimal) row[2];
                Integer bookingCount = ((Number) row[3]).intValue();
                
                HotelRevenueDTO dto = new HotelRevenueDTO();
                dto.setHotelId(hotelId);
                dto.setHotelName(hotelName);
                dto.setTotalRevenue(revenue);
                dto.setApprovedBookings(bookingCount);
                dto.setPendingRevenue(BigDecimal.ZERO);
                dto.setTotalBookings(bookingCount);
                
                hotelRevenueMap.put(hotelId, dto);
            }
            
            // Xử lý pending revenues
            for (Object[] row : pendingRevenues) {
                Long hotelId = ((Number) row[0]).longValue();
                String hotelName = (String) row[1];
                BigDecimal pendingRev = (BigDecimal) row[2];
                Integer pendingCount = ((Number) row[3]).intValue();
                
                HotelRevenueDTO dto = hotelRevenueMap.getOrDefault(hotelId, new HotelRevenueDTO());
                if (dto.getHotelId() == null) {
                    dto.setHotelId(hotelId);
                    dto.setHotelName(hotelName);
                    dto.setTotalRevenue(BigDecimal.ZERO);
                    dto.setApprovedBookings(0);
                }
                dto.setPendingRevenue(pendingRev);
                dto.setTotalBookings((dto.getTotalBookings() != null ? dto.getTotalBookings() : 0) + pendingCount);
                
                hotelRevenueMap.put(hotelId, dto);
            }
            
            List<HotelRevenueDTO> hotelRevenues = new ArrayList<>(hotelRevenueMap.values());
            
            // Đếm tổng số transactions
            List<Booking_transactionsEntity> allTransactions = booking_transactionsRepository.findByOwnerId(ownerId);
            int totalTransactions = allTransactions.size();
            int approvedTransactions = (int) allTransactions.stream()
                .filter(t -> t.getStatus() == Booking_transactionsEntity.Status.APPROVED)
                .count();
            
            RevenueSummaryDTO summary = new RevenueSummaryDTO();
            summary.setTotalRevenue(totalRevenue);
            summary.setPendingRevenue(pendingRevenue);
            summary.setOwnerRevenue(totalRevenue);
            summary.setAdminRevenue(BigDecimal.ZERO); // Owner không cần admin revenue
            summary.setTotalTransactions(totalTransactions);
            summary.setApprovedTransactions(approvedTransactions);
            summary.setHotelRevenues(hotelRevenues);
            
            return httpResponseUtil.ok("Get owner revenue success", summary);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting owner revenue", e);
        }
    }
    
    // Lấy doanh thu tổng của admin
    public ResponseEntity<Apireponsi<RevenueSummaryDTO>> getAdminRevenue() {
        try {
            // Tính tổng doanh thu admin (từ Admin_mount)
            BigDecimal adminRevenue = booking_transactionsRepository.getTotalAdminRevenue();
            if (adminRevenue == null) adminRevenue = BigDecimal.ZERO;
            
            // Tính doanh thu chờ duyệt
            BigDecimal pendingAdminRevenue = booking_transactionsRepository.getPendingAdminRevenue();
            if (pendingAdminRevenue == null) pendingAdminRevenue = BigDecimal.ZERO;
            
            // Tính tổng doanh thu hệ thống
            BigDecimal totalSystemRevenue = booking_transactionsRepository.getTotalSystemRevenue();
            if (totalSystemRevenue == null) totalSystemRevenue = BigDecimal.ZERO;
            
            // Tính tổng doanh thu của owners (từ User_mount)
            BigDecimal ownerRevenue = totalSystemRevenue.subtract(adminRevenue);
            
            // Đếm transactions
            List<Booking_transactionsEntity> allTransactions = booking_transactionsRepository.findAll();
            int totalTransactions = allTransactions.size();
            int approvedTransactions = (int) allTransactions.stream()
                .filter(t -> t.getStatus() == Booking_transactionsEntity.Status.APPROVED)
                .count();
            
            RevenueSummaryDTO summary = new RevenueSummaryDTO();
            summary.setTotalRevenue(totalSystemRevenue);
            summary.setPendingRevenue(pendingAdminRevenue);
            summary.setAdminRevenue(adminRevenue);
            summary.setOwnerRevenue(ownerRevenue);
            summary.setTotalTransactions(totalTransactions);
            summary.setApprovedTransactions(approvedTransactions);
            summary.setHotelRevenues(new ArrayList<>()); // Admin không cần chi tiết theo hotel
            
            return httpResponseUtil.ok("Get admin revenue success", summary);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting admin revenue", e);
        }
    }
}
