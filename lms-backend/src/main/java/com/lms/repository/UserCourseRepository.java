package com.lms.repository;

import com.lms.model.User;
import com.lms.model.Course;
import com.lms.model.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {

    Optional<UserCourse> findByUserAndCourse(User user, Course course);
    List<UserCourse> findByCourse(Course course);

}
