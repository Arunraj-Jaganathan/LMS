import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./individualCourses.css";

function IndividualCourses() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [visibleVideos, setVisibleVideos] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showTrialPopup, setShowTrialPopup] = useState(false);
  const [showPurchaseSuccessPopup, setShowPurchaseSuccessPopup] = useState(false);
  const [showPurchaseErrorPopup, setShowPurchaseErrorPopup] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
    onConfirm: null,
  });

  const scrollContainerRef = useRef(null);
  const videosPerLoad = 4;
  const BASE_URL = "http://localhost:8080";

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAdmin = role === "ROLE_ADMIN";

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, []);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${BASE_URL}/courses/course/${id}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch course details");

      const data = await res.json();

      const finalData = {
        ...data,
        purchased: !!data.purchased,
        trialActive: !!data.trialActive,
        trialExpired: !!data.trialExpired,
      };

      setCourse(finalData);

      if (
        (finalData.purchased || finalData.trialActive) &&
        Array.isArray(finalData.videos) &&
        finalData.videos.length > 0
      ) {
        setVisibleVideos(finalData.videos.slice(0, videosPerLoad));
        setCurrentVideoId(finalData.videos[0].video_id);
      } else {
        setVisibleVideos([]);
      }
    } catch (err) {
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !course?.videos) return;

    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      const currentLength = visibleVideos.length;
      const moreVideos = course.videos.slice(currentLength, currentLength + videosPerLoad);

      if (moreVideos.length > 0) {
        setVisibleVideos((prev) => [...prev, ...moreVideos]);
      }
    }
  };

  const startTrial = async () => {
    if (!token) {
      setShowLoginPopup(true);
      setTimeout(() => setShowLoginPopup(false), 2000);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/courses/${id}/start-trial`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();

      if (!res.ok) {
        console.warn("Trial error:", text);
        setShowPurchaseErrorPopup(true);
        setTimeout(() => setShowPurchaseErrorPopup(false), 2000);
        return;
      }

      await fetchCourse();
      setShowTrialPopup(true);
      setTimeout(() => setShowTrialPopup(false), 2000);
    } catch (error) {
      console.error("Error starting trial:", error);
      setShowPurchaseErrorPopup(true);
      setTimeout(() => setShowPurchaseErrorPopup(false), 2000);
    }
  };

  const handlePayment = async () => {
    if (!token) {
      setShowLoginPopup(true);
      setTimeout(() => setShowLoginPopup(false), 2000);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: course.course_price }),
      });

      if (!res.ok) {
        setShowPurchaseErrorPopup(true);
        setTimeout(() => setShowPurchaseErrorPopup(false), 2000);
        return;
      }

      const data = await res.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "IQMath Technologies",
        description: `Purchase: ${course.course_name}`,
        order_id: data.id,

        handler: async function (response) {
          const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              courseId: id,
            }),
          });

          if (verifyRes.ok) {
            setShowPurchaseSuccessPopup(true);
            setTimeout(() => setShowPurchaseSuccessPopup(false), 2000);
            await fetchCourse();
          } else {
            setShowPurchaseErrorPopup(true);
            setTimeout(() => setShowPurchaseErrorPopup(false), 2000);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setShowPurchaseErrorPopup(true);
      setTimeout(() => setShowPurchaseErrorPopup(false), 2000);
    }
  };

  const handleDeleteCourse = async () => {
    setPopup({
      show: true,
      type: "confirm",
      message: "Are you sure you want to delete this course?",
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/courses/delete/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            setPopup({
              show: true,
              type: "success",
              message: "Course deleted successfully!",
              onConfirm: null,
            });
            navigate("/courses");
          } else {
            setPopup({
              show: true,
              type: "error",
              message: "Failed to delete course.",
              onConfirm: null,
            });
          }
        } catch (err) {
          console.error("Delete error:", err);
          setPopup({
            show: true,
            type: "error",
            message: "Error deleting course.",
            onConfirm: null,
          });
        }
      },
    });
  };

  if (loading) return <p>Loading course details...</p>;
  if (!course) return <p>Course not found.</p>;

  const {
    course_name,
    course_description,
    course_thumbnail,
    course_price,
    course_duration,
    notesList,
    purchased,
    trialActive,
    trialExpired,
  } = course;

  return (
    <div className="individual-course-page">
      <div className="course-header">
        <div className="course-info">
          <h1>{course_name}</h1>
          <p>{course_description}</p>
        </div>

        <div className="course-card2">
          <img src={`${BASE_URL}/thumbnails/${course_thumbnail}`} alt={course_name} />

          <div className="course-card-footer">
            {purchased ? (
              <>
                <h4>{course_duration} of duration</h4>
                <h4 className="purchased-banner">✅ PURCHASED</h4>
              </>
            ) : trialActive ? (
              <>
                <h3>₹{course_price}</h3>
                <h4>Course Duration: {course_duration}</h4>
                <h4 className="trial-banner">🕒 Trial Activated</h4>
                <button className="buy-btn" onClick={handlePayment}>Buy Now</button>
              </>
            ) : trialExpired ? (
              <>
                <h3>₹{course_price}</h3>
                <h4>{course_duration} of duration</h4>
                <h4 className="expired-banner">⚠️ Your trial has expired</h4>
                <button className="buy-btn" onClick={handlePayment}>Buy Now</button>
              </>
            ) : (
              <>
                <h3>₹{course_price}</h3>
                <h4>{course_duration} of duration</h4>

                <button className="buy-btn" onClick={handlePayment}>Buy Now</button>

                <button className="trial-btn" onClick={startTrial}>
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>

        {isAdmin && (
          <>
            <button
              className="update-course-btn"
              onClick={() => navigate(`/adminops/updatecourse/${id}`)}
            >
              Update Course
            </button>

            <button
              className="delete-course-btn"
              onClick={handleDeleteCourse}
              style={{ backgroundColor: "red", marginLeft: "10px" }}
            >
              Delete Course
            </button>
          </>
        )}
      </div>

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className="unique-login-popup-overlay">
          <div className="unique-login-popup-box">
            <div className="unique-login-popup-icon">🔐</div>
            <h3 className="unique-login-popup-title">Please Login</h3>
            <p className="unique-login-popup-text">You must be logged in to continue.</p>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
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
                    setPopup({ show: false, type: "", message: "", onConfirm: null })
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*  VIDEOS */}
      <div className="videos-section">
        <h2>Course Videos</h2>

        {!purchased && trialExpired ? (
          <div className="locked-section">
            <p>🔒 Your trial has expired. Buy now to access videos.</p>
          </div>
        ) : !purchased && !trialActive ? (
          <div className="locked-section">
            <p>🔒 Buy or start trial to access videos.</p>
          </div>
        ) : (
          <div className="videos-block">
            <div
              className="videos-scroll"
              ref={scrollContainerRef}
              onScroll={handleScroll}
            >
              {visibleVideos.length > 0 ? (
                visibleVideos.map((video) => (
                  <div
                    key={video.video_id}
                    className={`video-card ${currentVideoId === video.video_id ? "active" : ""}`}
                    onClick={() => setCurrentVideoId(video.video_id)}
                  >
                    {video.fileName ? (
                      <video
                        src={`${BASE_URL}/videos/${video.fileName}`}
                        poster={`${BASE_URL}/video-thumbnails/${video.thumbnail}`}
                        controls
                      />
                    ) : (
                      <div className="video-placeholder"></div>
                    )}
                    <p>{video.title}</p>
                  </div>
                ))
              ) : (
                <p>No videos available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NOTES */}
      <div className="notes-section">
        <h2>Course Notes</h2>

        {!purchased && trialExpired ? (
          <div className="locked-section">
            <p>🔒 Your trial has expired. Buy now to access notes.</p>
          </div>
        ) : !purchased && !trialActive ? (
          <div className="locked-section">
            <p>🔒 Buy or start trial to access notes.</p>
          </div>
        ) : (
          <div className="notes-block">
            {Array.isArray(notesList) && notesList.length > 0 ? (
              notesList.map((note) => (
                <a
                  key={note.id}
                  href={`${BASE_URL}/notes/${note.fileName}`}
                  download
                  className="note-row"
                >
                  <span className="note-icon">📄</span>
                  <span className="note-title">{note.title}</span>
                </a>
              ))
            ) : (
              <p>No notes available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualCourses;
