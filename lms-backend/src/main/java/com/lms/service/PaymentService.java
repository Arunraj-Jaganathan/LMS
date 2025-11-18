package com.lms.service;

import com.lms.model.Course;
import com.lms.model.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RazorpayClient razorpayClient;  // Injected from RazorpayConfig

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    // Create a Razorpay order — using injected RazorpayClient
    public Map<String, Object> createOrder(int amount) throws Exception {

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // Convert to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        Order order = razorpayClient.orders.create(orderRequest);

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", order.get("id"));
        orderData.put("amount", order.get("amount"));
        orderData.put("currency", order.get("currency"));
        orderData.put("status", order.get("status"));
        orderData.put("key", keyId); // Send key to frontend
        return orderData;
    }

    // Verify Razorpay payment signature
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hashBytes = mac.doFinal(data.getBytes());
            String expectedSignature =
                    new String(org.apache.commons.codec.binary.Hex.encodeHex(hashBytes));

            boolean match = expectedSignature.equalsIgnoreCase(signature);

            // Debug logs
            System.out.println("\n--- Razorpay Signature Verification ---");
            System.out.println("Data: " + data);
            System.out.println("Expected Signature: " + expectedSignature);
            System.out.println("Received Signature: " + signature);
            System.out.println("Match: " + match);
            System.out.println("--------------------------------------\n");

            return match;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Save user's purchased course
    public void saveUserPurchase(String username, Long courseId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        boolean exists = user.getPurchasedCourses().stream()
                .anyMatch(c -> c.getCourse_id().equals(courseId));

        if (!exists) {
            user.getPurchasedCourses().add(course);
            userRepository.save(user);
            System.out.println("✅ Course added: " + course.getCourse_name());
        } else {
            System.out.println("ℹ️ Course already purchased.");
        }
    }
}
