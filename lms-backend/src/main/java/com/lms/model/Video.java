package com.lms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lms.model.Course;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity(name = "video")
@NoArgsConstructor
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long video_id;

    private String title;

    private String fileName;

    private String thumbnail; // Thumbnail image filename

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    public Video(String title, String fileName, String thumbnail, Course course) {
        this.title = title;
        this.fileName = fileName;
        this.thumbnail = thumbnail;
        this.course = course;
    }
}
