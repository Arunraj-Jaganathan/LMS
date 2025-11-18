import { useState, useEffect } from "react";
import Courses from "../Courses";

function CourseHelper() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/courses/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => setCourses(data))
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setError("Unable to load courses. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="course-title-main">
        <h2>Loading courses...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="course-title-main">
        <h2 style={{ color: "red" }}>{error}</h2>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="course-title-main">
        <h2>No courses available right now</h2>
      </section>
    );
  }

  return (
    <>
      <section className="course-title-main">
        <h2>Courses</h2>
      </section>

      <section className="courses-container">
        {courses.map((course) => {
          const thumbnailUrl = course.course_thumbnail
            ? `http://localhost:8080/thumbnails/${course.course_thumbnail}`
            : "/default-course.jpg"; // fallback image

          return (
            <Courses
              key={course.course_id}
              id={course.course_id}
              name={course.course_name}
              description={course.course_description}
              price={course.course_price}
              duration={course.course_duration}
              thumbnail={thumbnailUrl}
            />
          );
        })}
      </section>
    </>
  );
}

export default CourseHelper;
