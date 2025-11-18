package com.lms.controller;

import com.lms.model.Course;
import com.lms.model.User;
import com.lms.model.UserCourse;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserCourseRepository;
import com.lms.repository.UserRepository;
import com.lms.security.JwtUtil;
import com.lms.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;

    public PaymentController(PaymentService paymentService, JwtUtil jwtUtil,
                             UserRepository userRepository, CourseRepository courseRepository,
                             UserCourseRepository userCourseRepository) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.userCourseRepository = userCourseRepository;
    }

    // Create Razorpay order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) throws Exception {
        int amount = (int) Double.parseDouble(request.get("amount").toString());
        Map<String, Object> order = paymentService.createOrder(amount);
        return ResponseEntity.ok(order);
    }

    // Verify Razorpay payment and update DB
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, Object> data,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            String orderId = data.get("razorpayOrderId").toString();
            String paymentId = data.get("razorpayPaymentId").toString();
            String signature = data.get("razorpaySignature").toString();
            Long courseId = Long.parseLong(data.get("courseId").toString());

            boolean verified = paymentService.verifyPayment(orderId, paymentId, signature);

            if (!verified) {
                System.out.println("❌ Payment verification failed for orderId: " + orderId);
                return ResponseEntity.badRequest().body(Map.of("error", "Payment verification failed"));
            }

            // Save user-course mapping after verification
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            Optional<UserCourse> existingOpt = userCourseRepository.findByUserAndCourse(user, course);
            UserCourse uc = existingOpt.orElse(new UserCourse());
            uc.setUser(user);
            uc.setCourse(course);
            uc.setPurchased(true);
            uc.setTrialStarted(false);
            uc.setTrialStartDate(null);
            userCourseRepository.save(uc);

            System.out.println("Payment verified and course purchased for user: " + username);

            return ResponseEntity.ok(Map.of(
                    "msg", "Payment verified successfully and course purchased!",
                    "courseId", courseId,
                    "purchased", true
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Server error during payment verification"));
        }
    }
}
