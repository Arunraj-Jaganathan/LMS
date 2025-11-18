package com.lms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "course")
@NoArgsConstructor
@Getter
@Setter
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long course_id;

    private String course_name;

    @Lob  // Allows long text storage
    @Column(columnDefinition = "TEXT")  // Explicitly store as TEXT in DB
    private String course_description;

    private Double course_price;
    private String course_duration;
    private String course_thumbnail;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Video> videos = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Notes> notesList = new ArrayList<>();


    public Course(String course_name, String course_description, Double course_price, String course_duration, String course_thumbnail) {
        this.course_name = course_name;
        this.course_description = course_description;
        this.course_price = course_price;
        this.course_duration = course_duration;
        this.course_thumbnail = course_thumbnail;
    }
}
