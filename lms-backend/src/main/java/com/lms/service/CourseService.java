package com.lms.service;

import com.lms.model.Course;
import com.lms.model.Notes;
import com.lms.model.Video;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserCourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;

    public CourseService(CourseRepository courseRepository, UserCourseRepository userCourseRepository) {
        this.courseRepository = courseRepository;
        this.userCourseRepository = userCourseRepository;
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course Not Found!"));
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course addCourse(String course_name,
                            String course_description,
                            Double course_price,
                            String course_duration,
                            MultipartFile file) {
        String uploadDir = System.getProperty("user.dir") + "/uploads/";

        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) directory.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

            Course course = new Course(
                    course_name,
                    course_description,
                    course_price,
                    course_duration,
                    fileName
            );

            return courseRepository.save(course);

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to upload course file: " + e.getMessage());
        }
    }

    public Course updateCourse(
            Long id,
            String name,
            String description,
            Double price,
            String duration,
            MultipartFile file) throws IOException {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setCourse_name(name);
        course.setCourse_description(description);
        course.setCourse_price(price);
        course.setCourse_duration(duration);

        // If file is provided, replace thumbnail safely
        if (file != null && !file.isEmpty()) {
            String uploads = System.getProperty("user.dir") + "/uploads/";
            // delete old
            if (course.getCourse_thumbnail() != null) {
                Path old = Paths.get(uploads, course.getCourse_thumbnail());
                Files.deleteIfExists(old);
            }
            // save new
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(uploads, filename);
            Files.createDirectories(dest.getParent());
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            course.setCourse_thumbnail(filename);
        }

        return courseRepository.save(course);
    }

    public void deleteCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Delete relations in user_courses
        userCourseRepository.deleteAll(userCourseRepository.findByCourse(course));

        // Delete files (thumbnail, notes, videos)
        String uploads = System.getProperty("user.dir") + "/uploads/";
        if (course.getCourse_thumbnail() != null) {
            File f = new File(uploads + course.getCourse_thumbnail());
            if (f.exists()) f.delete();
        }

        if (course.getNotesList() != null) {
            for (Notes note : course.getNotesList()) {
                File noteFile = new File(uploads + "notes/" + note.getFileName());
                if (noteFile.exists()) noteFile.delete();
            }
        }

        if (course.getVideos() != null) {
            for (Video video : course.getVideos()) {
                File videoFile = new File(uploads + "videos/" + video.getFileName());
                File thumbnailFile = new File(uploads + "video-thumbnails/" + video.getThumbnail());
                if (videoFile.exists()) videoFile.delete();
                if (thumbnailFile.exists()) thumbnailFile.delete();
            }
        }

        courseRepository.deleteById(id);
    }
}
