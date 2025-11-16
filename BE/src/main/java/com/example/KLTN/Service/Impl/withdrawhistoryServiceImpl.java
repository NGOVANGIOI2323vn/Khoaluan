package com.example.KLTN.Service.Impl;
import com.example.KLTN.Entity.withDrawHistoryEntity;
import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;

import java.util.List;
import  com.example.KLTN.dto.withDrawDTO;
public interface withdrawhistoryServiceImpl {
 void   saveWithdraw(withDrawHistoryEntity withdraw);
 List<withDrawHistoryEntity> findAllWithdrawHistory();
 withDrawHistoryEntity findByid(Long id);
    ResponseEntity<Apireponsi<withDrawHistoryEntity>> createWithdraw(withDrawDTO dto);

    ResponseEntity<Apireponsi<withDrawHistoryEntity>> approveWithdraw(Long id);

    ResponseEntity<Apireponsi<withDrawHistoryEntity>> rejectWithdraw(Long id);
}
