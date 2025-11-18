import React, { useState } from "react";
import axios from "axios";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/contact/send", formData);

      // Success popup
      setPopup({
        show: true,
        message: "✅ Message sent successfully!",
        type: "success",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => {
        setPopup({ show: false, message: "", type: "" });
      }, 2000);
    } catch (error) {
      console.error(error);
      // Error popup
      setPopup({
        show: true,
        message: "❌ Failed to send message!",
        type: "error",
      });

      setTimeout(() => {
        setPopup({ show: false, message: "", type: "" });
      }, 2000);
    }
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p className="contact-subtitle">
        We'd love to hear from you! Please fill out the form below.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="subject">Subject</label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Enter subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Write your message..."
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-primary">
          Send Message
        </button>
      </form>

      {/* Popup Toast */}
      {popup.show && (
        <div className={`popup-toast ${popup.type}`}>
          {popup.message}
          <span
            className="close-btn"
            onClick={() => setPopup({ show: false, message: "", type: "" })}
          >
            ✖
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
