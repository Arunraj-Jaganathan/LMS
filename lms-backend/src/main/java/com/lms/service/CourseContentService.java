package com.lms.service;

import com.lms.model.Course;
import com.lms.model.Notes;
import com.lms.model.Video;
import com.lms.repository.CourseRepository;
import com.lms.repository.NotesRepository;
import com.lms.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class CourseContentService {

    private final CourseRepository courseRepository;
    private final VideoRepository videoRepository;
    private final NotesRepository notesRepository;

    public CourseContentService(CourseRepository courseRepository,
                                VideoRepository videoRepository,
                                NotesRepository notesRepository) {
        this.courseRepository = courseRepository;
        this.videoRepository = videoRepository;
        this.notesRepository = notesRepository;
    }

    @Transactional
    public String addVideo(Long courseId, String title, MultipartFile file, MultipartFile thumbnail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String base = System.getProperty("user.dir") + "/uploads/";
        String videoDir = base + "videos/";
        String thumbnailDir = base + "video-thumbnails/";

        try {
            Files.createDirectories(Paths.get(videoDir));
            Files.createDirectories(Paths.get(thumbnailDir));

            String videoName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path videoDest = Paths.get(videoDir, videoName);
            Files.copy(file.getInputStream(), videoDest, StandardCopyOption.REPLACE_EXISTING);

            String thumbName = UUID.randomUUID() + "_" + thumbnail.getOriginalFilename();
            Path thumbDest = Paths.get(thumbnailDir, thumbName);
            Files.copy(thumbnail.getInputStream(), thumbDest, StandardCopyOption.REPLACE_EXISTING);

            Video video = new Video(title, videoName, thumbName, course);
            Video saved = videoRepository.save(video);

            // keep bi-directional list consistent
            course.getVideos().add(saved);
            courseRepository.save(course);

            return "Video and thumbnail uploaded successfully!";
        } catch (IOException e) {
            e.printStackTrace();
            return "Failed to upload video or thumbnail!";
        }
    }

    @Transactional
    public String updateVideo(Long videoId, String title, MultipartFile file, MultipartFile thumbnail) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        String base = System.getProperty("user.dir") + "/uploads/";
        String videoDir = base + "videos/";
        String thumbnailDir = base + "video-thumbnails/";

        try {
            if (title != null && !title.isBlank()) {
                video.setTitle(title);
            }
            if (file != null && !file.isEmpty()) {
                // delete old
                if (video.getFileName() != null) Files.deleteIfExists(Paths.get(videoDir, video.getFileName()));
                String videoName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), Paths.get(videoDir, videoName), StandardCopyOption.REPLACE_EXISTING);
                video.setFileName(videoName);
            }
            if (thumbnail != null && !thumbnail.isEmpty()) {
                if (video.getThumbnail() != null) Files.deleteIfExists(Paths.get(thumbnailDir, video.getThumbnail()));
                String thumbName = UUID.randomUUID() + "_" + thumbnail.getOriginalFilename();
                Files.copy(thumbnail.getInputStream(), Paths.get(thumbnailDir, thumbName), StandardCopyOption.REPLACE_EXISTING);
                video.setThumbnail(thumbName);
            }

            videoRepository.save(video);
            return "Video updated successfully!";
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update video files");
        }
    }

    @Transactional
    public void deleteVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        String base = System.getProperty("user.dir") + "/uploads/";
        String videoDir = base + "videos/";
        String thumbnailDir = base + "video-thumbnails/";

        try {
            if (video.getFileName() != null) Files.deleteIfExists(Paths.get(videoDir, video.getFileName()));
            if (video.getThumbnail() != null) Files.deleteIfExists(Paths.get(thumbnailDir, video.getThumbnail()));
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        Course course = video.getCourse();
        if (course != null) {
            course.getVideos().removeIf(v -> v.getVideo_id().equals(videoId));
            courseRepository.save(course);
        }

        videoRepository.deleteById(videoId);
    }

    @Transactional
    public String addNote(Long courseId, String title, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String notesDir = System.getProperty("user.dir") + "/uploads/notes/";

        try {
            Files.createDirectories(Paths.get(notesDir));
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), Paths.get(notesDir, fileName), StandardCopyOption.REPLACE_EXISTING);

            Notes note = new Notes(title, fileName, course);
            Notes saved = notesRepository.save(note);

            course.getNotesList().add(saved);
            courseRepository.save(course);

            return "Note uploaded successfully!";
        } catch (IOException e) {
            e.printStackTrace();
            return "Failed to upload note!";
        }
    }

    @Transactional
    public String updateNote(Long noteId, String title, MultipartFile file) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        String notesDir = System.getProperty("user.dir") + "/uploads/notes/";

        try {
            if (title != null && !title.isBlank()) {
                note.setTitle(title);
            }
            if (file != null && !file.isEmpty()) {
                if (note.getFileName() != null) Files.deleteIfExists(Paths.get(notesDir, note.getFileName()));
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), Paths.get(notesDir, fileName), StandardCopyOption.REPLACE_EXISTING);
                note.setFileName(fileName);
            }
            notesRepository.save(note);
            return "Note updated successfully!";
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update note file");
        }
    }

    @Transactional
    public void deleteNote(Long noteId) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        String notesDir = System.getProperty("user.dir") + "/uploads/notes/";

        try {
            if (note.getFileName() != null) Files.deleteIfExists(Paths.get(notesDir, note.getFileName()));
        } catch (Exception e) {
            e.printStackTrace();
        }

        Course course = note.getCourse();
        if (course != null) {
            course.getNotesList().removeIf(n -> n.getId().equals(noteId));
            courseRepository.save(course);
        }

        notesRepository.deleteById(noteId);
    }
}
