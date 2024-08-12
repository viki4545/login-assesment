import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home/home";
import Login from "./pages/Login/login";
import { auth } from "./firebase";
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="App">
        <Router>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Login />}
            />
            <Route
              path="/home"
              element={user ? <Home /> : <Navigate to="/" />}
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
