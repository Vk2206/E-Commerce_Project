package com.example.backend.controller;

import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Product;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{email}")
    public List<Order> getOrdersByCustomerEmail(@PathVariable String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> placeOrder(@RequestBody Order orderRequest) {
        if (orderRequest.getOrderItems() == null || orderRequest.getOrderItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Order items cannot be empty");
        }

        double totalAmount = 0.0;
        List<OrderItem> verifiedItems = new ArrayList<>();

        for (OrderItem item : orderRequest.getOrderItems()) {
            if (item.getProduct() == null || item.getProduct().getId() == null) {
                return ResponseEntity.badRequest().body("Invalid product in order items");
            }

            Product product = productRepository.findById(item.getProduct().getId())
                    .orElse(null);

            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Product not found with ID: " + item.getProduct().getId());
            }

            if (product.getStock() < item.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body("Insufficient stock for product: " + product.getName() + ". Available: " + product.getStock());
            }

            // Decrement stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            // Create OrderItem
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getPrice())
                    .build();

            verifiedItems.add(orderItem);
            totalAmount += product.getPrice() * item.getQuantity();
        }

        Order order = Order.builder()
                .customerName(orderRequest.getCustomerName())
                .customerEmail(orderRequest.getCustomerEmail())
                .customerAddress(orderRequest.getCustomerAddress())
                .customerCity(orderRequest.getCustomerCity())
                .customerZip(orderRequest.getCustomerZip())
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount)
                .status("PENDING")
                .orderItems(verifiedItems)
                .build();

        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(newStatus.toUpperCase());
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
