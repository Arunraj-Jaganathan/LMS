package com.lms.controller;

import com.lms.model.Course;
import com.lms.model.User;
import com.lms.model.UserCourse;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserCourseRepository;
import com.lms.repository.UserRepository;
import com.lms.security.JwtUtil;
import com.lms.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final UserCourseRepository userCourseRepository;
    private final JwtUtil jwtUtil;
    private final CourseService courseService;

    public CourseController(CourseRepository courseRepository,
                            UserRepository userRepository,
                            UserCourseRepository userCourseRepository,
                            JwtUtil jwtUtil, CourseService courseService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.userCourseRepository = userCourseRepository;
        this.jwtUtil = jwtUtil;
        this.courseService = courseService;
    }

    @GetMapping("/course/{id}")
    public ResponseEntity<?> getCourseById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            boolean purchased = false;
            boolean trialActive = false;
            boolean trialExpired = false;
            boolean isAdmin = false;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);

                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getRole() != null) {
                    isAdmin = "ROLE_ADMIN".equals(user.getRole().getName());
                }

                Optional<UserCourse> ucOpt = userCourseRepository.findByUserAndCourse(user, course);

                if (ucOpt.isPresent()) {
                    UserCourse uc = ucOpt.get();

                    // PURCHASED?
                    purchased = uc.isPurchased();

                    // TRIAL LOGIC (trialUsed REMOVED)
                    if (uc.getTrialStartDate() != null) {

                        LocalDateTime expiry = uc.getTrialStartDate().plusMinutes(1);

                        if (LocalDateTime.now().isBefore(expiry)) {
                            trialActive = true;   // still active
                        } else {
                            trialExpired = true;  // expired
                        }
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("course_id", course.getCourse_id());
            response.put("course_name", course.getCourse_name());
            response.put("course_description", course.getCourse_description());
            response.put("course_price", course.getCourse_price());
            response.put("course_duration", course.getCourse_duration());
            response.put("course_thumbnail", course.getCourse_thumbnail());
            response.put("notesList", course.getNotesList());
            response.put("videos", course.getVideos());
            response.put("purchased", purchased);
            response.put("trialActive", trialActive);
            response.put("trialExpired", trialExpired);
            response.put("isAdmin", isAdmin);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @PostMapping(value = "/add", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addCourse(
            @RequestParam String course_name,
            @RequestParam String course_description,
            @RequestParam Double course_price,
            @RequestParam String course_duration,
            @RequestParam("file") MultipartFile file) {

        Course saved = courseService.addCourse(course_name, course_description, course_price, course_duration, file);

        return ResponseEntity.ok(Map.of(
                "message", "Course added successfully!",
                "id", saved.getCourse_id()
        ));
    }

    @PutMapping(value = "/update/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestParam String course_name,
            @RequestParam String course_description,
            @RequestParam Double course_price,
            @RequestParam String course_duration,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Course updated = courseService.updateCourse(id, course_name, course_description, course_price, course_duration, file);
            return ResponseEntity.ok(Map.of("message", "Course updated successfully", "id", updated.getCourse_id()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourseById(id);
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/start-trial")
    public ResponseEntity<?> startTrial(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing or invalid token"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            Optional<UserCourse> opt = userCourseRepository.findByUserAndCourse(user, course);

            UserCourse uc = opt.orElseGet(() -> {
                UserCourse newUC = new UserCourse();
                newUC.setUser(user);
                newUC.setCourse(course);
                return newUC;
            });

            // Already purchased?
            if (uc.isPurchased()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Course already purchased"));
            }

            if (uc.getTrialStartDate() != null) {

                LocalDateTime expiry = uc.getTrialStartDate().plusDays(3);

                if (LocalDateTime.now().isBefore(expiry)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Trial already active"));
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Trial expired — cannot restart"));
                }
            }

            uc.setTrialStarted(true);
            uc.setTrialStartDate(LocalDateTime.now());

            userCourseRepository.save(uc);

            return ResponseEntity.ok(Map.of(
                    "message", "Trial started successfully",
                    "trialActive", true,
                    "expiry", uc.getTrialStartDate().plusDays(3).toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
