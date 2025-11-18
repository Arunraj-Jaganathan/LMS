import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminContactList.css";

const BASE_URL = "http://localhost:8080";

export default function AdminContactList() {
  const [contacts, setContacts] = useState([]);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const res = await axios.get(`${BASE_URL}/contact/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContacts(res.data);
    } catch (err) {
      showPopup("error", "Failed to load contacts");
    }
  }

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });

    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 2000);
  };

  async function deleteContactNow() {
    try {
      await axios.delete(`${BASE_URL}/contact/delete/${confirmDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfirmDelete({ show: false, id: null });
      loadContacts();
      showPopup("success", "Contact deleted successfully!");
    } catch (err) {
      showPopup("error", "Failed to delete contact");
    }
  }

  return (
    <div className="admin-contact-container">
      <h1 className="admin-contact-title">Contact Messages</h1>

      {contacts.length === 0 ? (
        <p className="admin-no-contact">No messages found.</p>
      ) : (
        <div className="admin-contact-list">
          {contacts.map((msg) => (
            <div key={msg.id} className="admin-contact-card">
              <div className="admin-card-top">
                <h3 className="admin-card-subject">{msg.subject}</h3>

                <button
                  className="admin-delete-btn"
                  onClick={() =>
                    setConfirmDelete({ show: true, id: msg.id })
                  }
                >
                  Delete
                </button>
              </div>

              <p className="admin-card-line">
                <strong>Name:</strong> {msg.name}
              </p>
              <p className="admin-card-line">
                <strong>Email:</strong> {msg.email}
              </p>

              <p className="admin-card-message">{msg.message}</p>

              <div className="admin-card-time">
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleString()
                  : "Unknown time"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup (success / error) */}
      {popup.show && (
        <div className="admin-popup-overlay">
          <div className={`admin-popup-box admin-${popup.type}`}>
            <p>{popup.message}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {confirmDelete.show && (
        <div className="admin-popup-overlay">
          <div className="admin-popup-box admin-confirm-box">
            <p>Are you sure you want to delete this message?</p>

            <div className="admin-popup-actions">
              <button className="admin-confirm-btn" onClick={deleteContactNow}>
                Yes, Delete
              </button>

              <button
                className="admin-cancel-btn"
                onClick={() => setConfirmDelete({ show: false, id: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
