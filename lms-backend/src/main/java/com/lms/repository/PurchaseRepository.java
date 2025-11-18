package com.lms.repository;

import com.lms.model.Purchase;
import com.lms.model.User;
import com.lms.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    Optional<Purchase> findByUserAndCourse(User user, Course course);
    boolean existsByUserAndCourse(User user, Course course);
}
