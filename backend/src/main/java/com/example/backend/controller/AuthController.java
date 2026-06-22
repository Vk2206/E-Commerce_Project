package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        email = email.toLowerCase().trim();

        // Admin authentication with auto-creation
        if ("admin@aura.com".equals(email)) {
            if ("admin123".equals(password)) {
                User admin = userRepository.findByEmail("admin@aura.com")
                        .orElseGet(() -> {
                            User newAdmin = User.builder()
                                    .email("admin@aura.com")
                                    .password("admin123")
                                    .name("System Admin")
                                    .role("ADMIN")
                                    .build();
                            return userRepository.save(newAdmin);
                        });
                return ResponseEntity.ok(admin);
            } else {
                return ResponseEntity.status(401).body("Invalid Admin Password");
            }
        }

        // Customer login / register
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // If they registered with a password, we verify it
            if (user.getPassword() != null && !user.getPassword().isEmpty() && !user.getPassword().equals(password)) {
                return ResponseEntity.status(401).body("Incorrect password");
            }
            return ResponseEntity.ok(user);
        } else {
            // Auto-register new customer
            User newCustomer = User.builder()
                    .email(email)
                    .password(password != null ? password : "")
                    .name(loginRequest.getName() != null && !loginRequest.getName().isEmpty() 
                            ? loginRequest.getName() 
                            : email.split("@")[0])
                    .role("CUSTOMER")
                    .build();
            User savedCustomer = userRepository.save(newCustomer);
            return ResponseEntity.ok(savedCustomer);
        }
    }
}
