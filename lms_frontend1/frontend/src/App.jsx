import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./home/NavBar";
import Herosection from "./home/HeroSection";
import CourseHelper from "./home/helper/CourseHelper";
import Footer from "./home/Footer";
import IndividualCourses from "./individualCourses/IndividualCourses";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import AdminDashboard from "./admin/AdminDashBoard";
import AdminContactList from "./admin/AdminContactList";

import AddCourseWithContent from "./admin/AddCourseWithContent";
import UpdateCourseWithContent from "./admin/UpdateCourseWithContent"; 

import ContactUs from "./others/ContactUs";
import AboutUs from "./home/AboutUs";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <>
              <Herosection />
              <CourseHelper />
              <AboutUs />
              <ContactUs />
              <Footer />
            </>
          }
        />

        <Route path="/courses" element={<CourseHelper />} />
        <Route path="/course/:id" element={<IndividualCourses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* CONTACT PAGE */}
        <Route path="/contact" element={<ContactUs />} />

        {/* ABOUT PAGE */}
        <Route path="/about" element={<AboutUs />} />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/adminops"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ADD COURSE */}
        <Route
          path="/adminops/addcourse"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <AddCourseWithContent />
            </PrivateRoute>
          }
        />

        {/* UPDATE COURSE */}
        <Route
          path="/adminops/updatecourse/:id"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <UpdateCourseWithContent />
            </PrivateRoute>
          }
        />

        {/* VIEW CONTACT MESSAGES */}
        <Route
          path="/adminops/contacts"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <AdminContactList />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
