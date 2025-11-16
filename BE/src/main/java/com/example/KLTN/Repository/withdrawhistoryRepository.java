package com.example.KLTN.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.KLTN.Entity.withDrawHistoryEntity;
@Repository
public interface withdrawhistoryRepository extends JpaRepository<withDrawHistoryEntity,Long> {

}
