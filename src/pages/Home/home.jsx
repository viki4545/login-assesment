import React from "react";
import "./home.css";
import { auth } from "../../firebase.js";
import { toast } from "react-toastify";

const Home = () => {
  const logout = () => {
    auth
      .signOut()
      .then(() => {
        toast.success("Logged out successfully!");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className="home-container">
      <h2>Welcome to the Home Page</h2>
      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Home;
