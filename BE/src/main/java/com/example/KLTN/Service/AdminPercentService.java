package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.adminPercentEntity;
import com.example.KLTN.Repository.AdminPercentRepository;
import com.example.KLTN.Service.Impl.AdminPercentServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminPercentService implements AdminPercentServiceImpl {
    @Override
    public adminPercentEntity findAdminPercentById(Long id) {
        return adminPercentRepository.findById(id).orElse(null);
    }

    @Override
    public ResponseEntity<Apireponsi<adminPercentEntity>> create(double percent) {
        try {
            adminPercentEntity percent1 = new adminPercentEntity();
            if (percent < 0 || percent > 1) {
                return httpResponseUtil.badRequest("Dữ liệu truyền sai");
            }
            percent1.setAdminPercent(percent);
            this.saveAdminPercent(percent1);
            return httpResponseUtil.created("Create Thành công cho percent", percent1);
        } catch (Exception e) {
            return httpResponseUtil.error("Create error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<adminPercentEntity>> updateAdminPercent(Long id, double percent) {
        try {

            adminPercentEntity percent1 = adminPercentRepository.findById(id).orElse(null);
            if (percent1 == null) {
                return httpResponseUtil.notFound("null percent1");
            }
            if (percent < 0 || percent > 1) {
                return httpResponseUtil.badRequest("Dữ liệu truyền sai");
            }
            percent1.setAdminPercent(percent);
            this.saveAdminPercent(percent1);
            return httpResponseUtil.created("Update Thành công cho percent", percent1);
        } catch (Exception e) {
            return httpResponseUtil.error("Error", e);
        }
    }

    private final AdminPercentRepository adminPercentRepository;
    private final HttpResponseUtil httpResponseUtil;

    @Override
    public void saveAdminPercent(adminPercentEntity adminPercentEntity) {
        adminPercentRepository.save(adminPercentEntity);
    }

}
