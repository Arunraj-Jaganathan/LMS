package com.lms.controller;

import com.lms.service.CourseContentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/courses/content")
public class CourseContentController {

    private final CourseContentService contentService;

    public CourseContentController(CourseContentService contentService) {
        this.contentService = contentService;
    }

    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addVideo(@RequestParam Long course_id,
                                      @RequestParam String title,
                                      @RequestParam("file") MultipartFile file,
                                      @RequestParam("thumbnail") MultipartFile thumbnail) {

        String res = contentService.addVideo(course_id, title, file, thumbnail);
        return ResponseEntity.ok().body(res);
    }

    @PutMapping(value = "/video/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateVideo(@PathVariable Long id,
                                         @RequestParam(required = false) String title,
                                         @RequestParam(required = false) MultipartFile file,
                                         @RequestParam(required = false) MultipartFile thumbnail) {

        String res = contentService.updateVideo(id, title, file, thumbnail);
        return ResponseEntity.ok().body(res);
    }

    @DeleteMapping("/video/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        contentService.deleteVideo(id);
        return ResponseEntity.ok("Video deleted");
    }

    @PostMapping(value = "/note", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addNote(@RequestParam Long course_id,
                                     @RequestParam String title,
                                     @RequestParam("file") MultipartFile file) {

        String res = contentService.addNote(course_id, title, file);
        return ResponseEntity.ok(res);
    }

    // Update note
    @PutMapping(value = "/note/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateNote(@PathVariable Long id,
                                        @RequestParam(required = false) String title,
                                        @RequestParam(required = false) MultipartFile file) {

        String res = contentService.updateNote(id, title, file);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/note/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        contentService.deleteNote(id);
        return ResponseEntity.ok("Note deleted");
    }
}
