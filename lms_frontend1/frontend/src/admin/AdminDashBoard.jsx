import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Operations</h1>

      <div className="admin-grid">

        <Link to="/adminops/addcourse" className="admin-card">
          ➕ Add New Course
        </Link>

        <Link to="/adminops/contacts" className="admin-card">
          📩 View Recent Contacts
        </Link>

      </div>
    </div>
  );
}
