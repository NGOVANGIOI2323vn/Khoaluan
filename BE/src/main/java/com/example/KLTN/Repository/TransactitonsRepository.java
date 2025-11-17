package com.example.KLTN.Repository;

import com.example.KLTN.Entity.TransactitonsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactitonsRepository extends JpaRepository<TransactitonsEntity, Long> {

    TransactitonsEntity findByVnpTxnRef(String vnpTxnRef);
}
