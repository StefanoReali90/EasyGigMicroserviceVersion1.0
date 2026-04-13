package org.spring.notificationservice.repository;

import org.spring.notificationservice.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationLogRepository extends JpaRepository<NotificationLog,Long> {
}
