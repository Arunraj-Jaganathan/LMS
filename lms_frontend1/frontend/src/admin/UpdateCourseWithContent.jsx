import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./UpdateCourseWithContent.css";

const BASE_URL = "http://localhost:8080";

export default function UpdateCourseWithContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbFile, setThumbFile] = useState(null);

  const [newVideo, setNewVideo] = useState({ title: "", file: null, thumbnail: null });
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [videoEdits, setVideoEdits] = useState({ title: "", file: null, thumbnail: null });

  const [newNote, setNewNote] = useState({ title: "", file: null });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteEdits, setNoteEdits] = useState({ title: "", file: null });

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Popup state & functions
  const [popup, setPopup] = useState({ show: false, type: "success", message: "", onConfirm: null });

  const showSuccess = (msg) => {
    setPopup({ show: true, type: "success", message: msg });
    setTimeout(() => setPopup((p) => ({ ...p, show: false })), 2000);
  };

  const showError = (msg) => {
    setPopup({ show: true, type: "error", message: msg });
    setTimeout(() => setPopup((p) => ({ ...p, show: false })), 2000);
  };

  const showConfirm = (msg, onConfirm) => {
    setPopup({ show: true, type: "confirm", message: msg, onConfirm });
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${BASE_URL}/courses/course/${id}`, { headers });
      console.log(res.data);
      setCourse(res.data);
    } catch (err) {
      showError("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseUpdate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("course_name", course.course_name);
      form.append("course_description", course.course_description);
      form.append("course_price", course.course_price);
      form.append("course_duration", course.course_duration);
      if (thumbFile) form.append("file", thumbFile);

      await api.put(`/courses/update/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Course updated successfully!");
      await loadCourse();
    } catch (err) {
      showError("Course update failed!");
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.file || !newVideo.thumbnail) {
      showError("Provide title, video file, and thumbnail.");
      return;
    }

    try {
      const form = new FormData();
      form.append("course_id", id);
      form.append("title", newVideo.title);
      form.append("file", newVideo.file);
      form.append("thumbnail", newVideo.thumbnail);

      const res = await api.post("/courses/content/video", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess(res.data || "Video uploaded!");
      setNewVideo({ title: "", file: null, thumbnail: null });
      await loadCourse();
    } catch {
      showError("Video upload failed!");
    }
  };

  const startEditVideo = (v) => {
    setEditingVideoId(v.video_id);
    setVideoEdits({ title: v.title, file: null, thumbnail: null });
  };

  const saveEditVideo = async (videoId) => {
    try {
      const form = new FormData();
      form.append("title", videoEdits.title);
      if (videoEdits.file) form.append("file", videoEdits.file);
      if (videoEdits.thumbnail) form.append("thumbnail", videoEdits.thumbnail);

      await api.put(`/courses/content/video/${videoId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Video updated!");
      setEditingVideoId(null);
      setVideoEdits({ title: "", file: null, thumbnail: null });
      await loadCourse();
    } catch {
      showError("Failed to update video!");
    }
  };

  const deleteVideo = (videoId) => {
    showConfirm("Delete this video?", async () => {
      try {
        await api.delete(`/courses/content/video/${videoId}`);
        showSuccess("Video deleted!");
        await loadCourse();
      } catch {
        showError("Failed to delete video!");
      }
    });
  };

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.file) {
      showError("Provide note title and file.");
      return;
    }

    try {
      const form = new FormData();
      form.append("course_id", id);
      form.append("title", newNote.title);
      form.append("file", newNote.file);

      const res = await api.post("/courses/content/note", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess(res.data || "Note uploaded!");
      setNewNote({ title: "", file: null });
      await loadCourse();
    } catch {
      showError("Note upload failed!");
    }
  };

  const startEditNote = (n) => {
    setEditingNoteId(n.id);
    setNoteEdits({ title: n.title, file: null });
  };

  const saveEditNote = async (noteId) => {
    try {
      const form = new FormData();
      form.append("title", noteEdits.title);
      if (noteEdits.file) form.append("file", noteEdits.file);

      await api.put(`/courses/content/note/${noteId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Note updated!");
      setEditingNoteId(null);
      setNoteEdits({ title: "", file: null });
      await loadCourse();
    } catch {
      showError("Failed to update note!");
    }
  };

  const deleteNote = (noteId) => {
    showConfirm("Delete this note?", async () => {
      try {
        await api.delete(`/courses/content/note/${noteId}`);
        showSuccess("Note deleted!");
        await loadCourse();
      } catch {
        showError("Failed to delete note!");
      }
    });
  };

  if (loading) return <div className="update-loading">Loading...</div>;
  if (!course) return <div className="update-loading">Course not found</div>;

  return (
    <div className="update-wrapper">
      {/* POPUP RENDER */}
      {popup.show && (
        <div className="course-popup-overlay">
          <div className={`course-popup-box ${popup.type}`}>
            <p>{popup.message}</p>
            {popup.type === "confirm" && (
              <div className="popup-actions">
                <button
                  className="confirm-btn"
                  onClick={() => {
                    const fn = popup.onConfirm;
                    setPopup({ ...popup, show: false });
                    if (fn) fn();
                  }}
                >
                  Yes, Delete
                </button>

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setPopup({
                      show: false,
                      type: "",
                      message: "",
                      onConfirm: null,
                    })
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <h1 className="update-title">Update Course</h1>
      {/* COURSE FORM */}
      <form className="update-course-form" onSubmit={handleCourseUpdate}>
        {/* Course details input fields */}
        <div className="update-field">
          <label htmlFor="courseName">Course Name</label>
          <input
            id="courseName"
            className="update-input"
            value={course.course_name}
            onChange={(e) => setCourse({ ...course, course_name: e.target.value })}
          />
        </div>

        <div className="update-field">
          <label htmlFor="courseDescription">Description</label>
          <textarea
            id="courseDescription"
            className="update-textarea"
            rows={4}
            value={course.course_description}
            onChange={(e) => setCourse({ ...course, course_description: e.target.value })}
          />
        </div>

        <div className="update-row">
          <div className="update-field">
            <label htmlFor="coursePrice">Price</label>
            <input
              id="coursePrice"
              className="update-input"
              value={course.course_price}
              onChange={(e) => setCourse({ ...course, course_price: e.target.value })}
              placeholder="Price"
            />
          </div>

          <div className="update-field">
            <label htmlFor="courseDuration">Duration</label>
            <input
              id="courseDuration"
              className="update-input"
              value={course.course_duration}
              onChange={(e) => setCourse({ ...course, course_duration: e.target.value })}
              placeholder="Duration"
            />
          </div>
        </div>

        <div className="update-field">
          <label htmlFor="courseThumbnail">Change Thumbnail</label>
          <input
            id="courseThumbnail"
            className="update-file"
            type="file"
            onChange={(e) => setThumbFile(e.target.files[0])}
          />
        </div>

        <button className="update-btn-save" type="submit">
          Save Course
        </button>
      </form>

      <hr className="update-divider" />

      {/* VIDEOS SECTION */}
      <section className="update-section">
        <h2>Videos</h2>
        <div className="update-box">
          <h4>Add Video</h4>
          <label htmlFor="newVideoTitle">Video Title</label>
          <input
            id="newVideoTitle"
            className="update-input"
            placeholder="Title"
            value={newVideo.title}
            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
          />

          <label htmlFor="newVideoFile">Video File</label>
          <input
            id="newVideoFile"
            className="update-file"
            type="file"
            accept="video/*"
            onChange={(e) => setNewVideo({ ...newVideo, file: e.target.files[0] })}
          />

          <label htmlFor="newVideoThumb">Video Thumbnail</label>
          <input
            id="newVideoThumb"
            className="update-file"
            type="file"
            accept="image/*"
            onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.files[0] })}
          />

          <button className="update-btn" type="button" onClick={handleAddVideo}>
            Add Video
          </button>
        </div>

        {course.videos?.length > 0 ? (
          course.videos.map((v) => (
            <div key={v.video_id} className="update-item">
              <div className="update-item-header">
                <strong>{v.title}</strong>

                <div>
                  <button
                    className="update-btn-small"
                    onClick={() => startEditVideo(v)}
                  >
                    Edit
                  </button>

                  <button
                    className="update-btn-delete"
                    onClick={() => deleteVideo(v.video_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingVideoId === v.video_id && (
                <div className="update-edit-box">
                  <label htmlFor={`editVideoTitle_${v.video_id}`}>Video Title</label>
                  <input
                    id={`editVideoTitle_${v.video_id}`}
                    className="update-input"
                    value={videoEdits.title}
                    onChange={(e) => setVideoEdits({ ...videoEdits, title: e.target.value })}
                  />

                  <label htmlFor={`editVideoFile_${v.video_id}`}>Replace Video File</label>
                  <input
                    id={`editVideoFile_${v.video_id}`}
                    className="update-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoEdits({ ...videoEdits, file: e.target.files[0] })}
                  />

                  <label htmlFor={`editVideoThumb_${v.video_id}`}>Replace Thumbnail</label>
                  <input
                    id={`editVideoThumb_${v.video_id}`}
                    className="update-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVideoEdits({ ...videoEdits, thumbnail: e.target.files[0] })}
                  />

                  <button
                    className="update-btn-small"
                    onClick={() => saveEditVideo(v.video_id)}
                  >
                    Save
                  </button>

                  <button
                    className="update-btn-cancel"
                    onClick={() => setEditingVideoId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No videos uploaded yet.</p>
        )}
      </section>

      <hr className="update-divider" />

      {/* NOTES SECTION */}
      <section className="update-section">
        <h2>Notes</h2>
        <div className="update-box">
          <h4>Add Note</h4>

          <label htmlFor="newNoteTitle">Note Title</label>
          <input
            id="newNoteTitle"
            className="update-input"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />

          <label htmlFor="newNoteFile">Note File</label>
          <input
            id="newNoteFile"
            className="update-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setNewNote({ ...newNote, file: e.target.files[0] })}
          />

          <button className="update-btn" onClick={handleAddNote}>
            Add Note
          </button>
        </div>

        {course.notesList?.length > 0 ? (
          course.notesList.map((n) => (
            <div key={n.id} className="update-item">
              <div className="update-item-header">
                <strong>{n.title}</strong>

                <div>
                  <button
                    className="update-btn-small"
                    onClick={() => startEditNote(n)}
                  >
                    Edit
                  </button>

                  <button
                    className="update-btn-delete"
                    onClick={() => deleteNote(n.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingNoteId === n.id && (
                <div className="update-edit-box">
                  <label htmlFor={`editNoteTitle_${n.id}`}>Note Title</label>
                  <input
                    id={`editNoteTitle_${n.id}`}
                    className="update-input"
                    value={noteEdits.title}
                    onChange={(e) => setNoteEdits({ ...noteEdits, title: e.target.value })}
                  />

                  <label htmlFor={`editNoteFile_${n.id}`}>Replace Note File</label>
                  <input
                    id={`editNoteFile_${n.id}`}
                    className="update-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNoteEdits({ ...noteEdits, file: e.target.files[0] })}
                  />

                  <button
                    className="update-btn-small"
                    onClick={() => saveEditNote(n.id)}
                  >
                    Save
                  </button>

                  <button
                    className="update-btn-cancel"
                    onClick={() => setEditingNoteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No notes uploaded yet.</p>
        )}
      </section>

      <button className="update-btn-back" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}

