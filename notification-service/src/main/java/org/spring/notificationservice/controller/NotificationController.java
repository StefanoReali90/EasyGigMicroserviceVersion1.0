package org.spring.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.notificationservice.entity.Notification;
import org.spring.notificationservice.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationRepository.countByUserIdAndReadStatusFalse(userId);
    }

    @PutMapping("/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setReadStatus(true);
            notificationRepository.save(n);
        });
    }

    @PutMapping("/user/{userId}/read-all")
    public void markAllAsRead(@PathVariable Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByTimestampDesc(userId);
        unread.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(unread);
    }
}
