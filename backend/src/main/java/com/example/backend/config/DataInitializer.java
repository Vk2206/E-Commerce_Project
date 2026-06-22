package com.example.backend.config;

import com.example.backend.model.Product;
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = Product.builder()
                    .name("Minimalist Mechanical Keyboard")
                    .description("An elegant mechanical keyboard with custom tactile switches, premium aluminum body, and warm white backlighting. Designed for high productivity and minimalist workspaces.")
                    .price(129.99)
                    .imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80")
                    .category("Tech")
                    .rating(4.8)
                    .stock(15)
                    .build();

            Product p2 = Product.builder()
                    .name("Studio ANC Headphones")
                    .description("Over-ear wireless headphones with industry-leading Active Noise Cancellation. Crafted with memory foam cushions and wrapped in soft protein leather for all-day comfort.")
                    .price(199.99)
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80")
                    .category("Tech")
                    .rating(4.7)
                    .stock(10)
                    .build();

            Product p3 = Product.builder()
                    .name("Daypack Backpack")
                    .description("A weather-resistant commuter backpack made from vegan leather and durable canvas. Features a padded 16-inch laptop compartment and hidden pockets for security.")
                    .price(85.00)
                    .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80")
                    .category("Fashion")
                    .rating(4.5)
                    .stock(25)
                    .build();

            Product p4 = Product.builder()
                    .name("Scented Soy Candle")
                    .description("Hand-poured soy wax candle in a sleek ceramic vessel. Scented with natural essential oils of cedarwood, amber, and vanilla to create a calming home environment.")
                    .price(24.50)
                    .imageUrl("https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80")
                    .category("Home")
                    .rating(4.6)
                    .stock(50)
                    .build();

            Product p5 = Product.builder()
                    .name("Classic Linen Shirt")
                    .description("Breathable, relaxed-fit button-down shirt made from 100% organic linen. Pre-washed for extra softness and featuring a classic band collar.")
                    .price(59.00)
                    .imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80")
                    .category("Fashion")
                    .rating(4.4)
                    .stock(30)
                    .build();

            Product p6 = Product.builder()
                    .name("Walnut Monitor Stand")
                    .description("Ergonomic desk shelf handcrafted from solid American walnut and steel. Raises your screen to eye level while providing storage space underneath.")
                    .price(115.00)
                    .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80")
                    .category("Home")
                    .rating(4.9)
                    .stock(12)
                    .build();

            Product p7 = Product.builder()
                    .name("Minimalist Smart Watch")
                    .description("A sleek, lightweight smart watch featuring a high-definition always-on display, 7-day battery life, and complete health tracking sensors.")
                    .price(249.00)
                    .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80")
                    .category("Tech")
                    .rating(4.6)
                    .stock(8)
                    .build();

            Product p8 = Product.builder()
                    .name("Insulated Water Bottle")
                    .description("Double-walled, vacuum-insulated water bottle made from food-grade stainless steel. Keeps drinks cold for 24 hours or hot for 12 hours.")
                    .price(32.00)
                    .imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80")
                    .category("Fashion")
                    .rating(4.5)
                    .stock(40)
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8));
            System.out.println("--- Seeded database with 8 premium aesthetic products ---");
        }
    }
}
