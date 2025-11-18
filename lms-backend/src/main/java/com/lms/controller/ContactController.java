package com.lms.controller;

import com.lms.model.ContactMessage;
import com.lms.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody ContactMessage message) {
        try {
            contactService.saveMessage(message);
            return ResponseEntity.ok("Message saved successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save message!");
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long id) {
        try {
            contactService.deleteMessage(id);
            return ResponseEntity.ok("Message deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to delete message!");
        }
    }
}
