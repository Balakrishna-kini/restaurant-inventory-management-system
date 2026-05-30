package com.restaurant.inventory.repository;

import com.restaurant.inventory.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    boolean existsByMessageAndCreatedAtAfter(String message, java.time.LocalDateTime date);
}
