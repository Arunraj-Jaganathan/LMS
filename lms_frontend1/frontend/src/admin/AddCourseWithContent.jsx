import React, { useState } from "react";
import axios from "axios";

const AddCourseWithContent = () => {
  const [course, setCourse] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);

  // Popup state
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const addVideo = () => {
    setVideos([...videos, { title: "", file: null, thumbnail: null }]);
  };

  const addNote = () => {
    setNotes([...notes, { title: "", file: null }]);
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...videos];
    newVideos[index][field] = value;
    setVideos(newVideos);
  };

  const handleNoteChange = (index, field, value) => {
    const newNotes = [...notes];
    newNotes[index][field] = value;
    setNotes(newNotes);
  };

  // Show popup function
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const courseForm = new FormData();
      courseForm.append("course_name", course.name);
      courseForm.append("course_description", course.description);
      courseForm.append("course_price", course.price);
      courseForm.append("course_duration", course.duration);
      courseForm.append("file", thumbnail);

      const courseRes = await axios.post(
        "http://localhost:8080/courses/add",
        courseForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const courseId = courseRes.data.id;

      for (const video of videos) {
        const videoForm = new FormData();
        videoForm.append("file", video.file);
        videoForm.append("thumbnail", video.thumbnail);

        await axios.post(
          `http://localhost:8080/courses/content/video?course_id=${courseId}&title=${encodeURIComponent(video.title)}`,
          videoForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      for (const note of notes) {
        const noteForm = new FormData();
        noteForm.append("file", note.file);

        await axios.post(
          `http://localhost:8080/courses/content/note?course_id=${courseId}&title=${encodeURIComponent(note.title)}`,
          noteForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      // Success popup
      showPopup("success", "✅ Course and all content uploaded successfully!");

      // Reset form
      setCourse({ name: "", description: "", price: "", duration: "" });
      setThumbnail(null);
      setVideos([]);
      setNotes([]);
    } catch (err) {
      console.error(err);
      showPopup("error", "❌ Failed to upload course and resources!");
    }
  };

  return (
    <div className="add-course-container">
      <h1>Add Full Course</h1>
      <form onSubmit={handleSubmit}>
        {/* COURSE DETAILS */}
        <div className="section">
          <h2>Course Details</h2>

          <label>Course Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter Course Name"
            value={course.name}
            onChange={handleChange}
            required
          />

          <label>Course Description</label>
          <textarea
            name="description"
            placeholder="Enter Course Description"
            value={course.description}
            onChange={handleChange}
            required
          />

          <label>Course Price (₹)</label>
          <input
            type="number"
            name="price"
            placeholder="Enter Price"
            value={course.price}
            onChange={handleChange}
            required
          />

          <label>Course Duration</label>
          <input
            type="text"
            name="duration"
            placeholder="e.g. 4 weeks"
            value={course.duration}
            onChange={handleChange}
            required
          />

          <label>Upload Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
            required
          />
        </div>

        {/* COURSE VIDEOS */}
        <div className="section">
          <h2>Course Videos</h2>
          {videos.map((video, index) => (
            <div key={index} className="nested-section">
              <h3>Video {index + 1}</h3>

              <label>Video Title</label>
              <input
                type="text"
                placeholder="Enter Video Title"
                value={video.title}
                onChange={(e) =>
                  handleVideoChange(index, "title", e.target.value)
                }
                required
              />

              <label>Upload Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  handleVideoChange(index, "file", e.target.files[0])
                }
                required
              />

              <label>Upload Video Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleVideoChange(index, "thumbnail", e.target.files[0])
                }
                required
              />
            </div>
          ))}

          <button type="button" className="btn-secondary" onClick={addVideo}>
            ➕ Add Another Video
          </button>
        </div>

        {/* COURSE NOTES */}
        <div className="section">
          <h2>Course Notes</h2>
          {notes.map((note, index) => (
            <div key={index} className="nested-section">
              <h3>Note {index + 1}</h3>

              <label>Note Title</label>
              <input
                type="text"
                placeholder="Enter Note Title"
                value={note.title}
                onChange={(e) =>
                  handleNoteChange(index, "title", e.target.value)
                }
                required
              />

              <label>Upload Note File (.pdf / .doc / .docx)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  handleNoteChange(index, "file", e.target.files[0])
                }
                required
              />
            </div>
          ))}

          <button type="button" className="btn-secondary" onClick={addNote}>
            ➕ Add Another Note
          </button>
        </div>

        {/* SUBMIT */}
        <button type="submit" className="btn-primary">
          Submit Course with All Resources
        </button>
      </form>

      {/* UNIQUE POPUP */}
      {popup.show && (
        <div className="course-popup-overlay">
          <div className={`course-popup-box ${popup.type}`}>
            <p>{popup.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourseWithContent;
