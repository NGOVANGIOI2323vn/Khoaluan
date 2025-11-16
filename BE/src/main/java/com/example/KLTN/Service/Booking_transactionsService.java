package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Entity.Booking_transactionsEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.Booking_transactionsRepository;
import com.example.KLTN.Service.Impl.Booking_transactionsServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

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
}
