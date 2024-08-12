import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import { toast } from "react-toastify";
import "./login.css";
import { auth, db } from "../../firebase";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          sendOtp();
        },
      }
    );
  }, []);

  const validatePhone = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phone.match(phoneRegex)) {
      setPhoneError("Please enter a valid phone number.");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateOtp = () => {
    const otpRegex = /^\d{6}$/;
    if (!otp.match(otpRegex)) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return false;
    }
    setOtpError("");
    return true;
  };

  const sendOtp = () => {
    // if (!validatePhone()) return;
    const phonNum = "+91" + phone;
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phonNum, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setIsOtpSent(true);
        toast.success("OTP sent successfully!");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const verifyOtp = () => {
    if (!validateOtp()) return;

    const confirmationResult = window.confirmationResult;
    confirmationResult
      .confirm(otp)
      .then((result) => {
        saveUserToFirestore(result.user);
        toast.success("Logged in successfully!");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        saveUserToFirestore(result.user);
        toast.success("Logged in successfully with Google!");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const saveUserToFirestore = async (user) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        phone: user.phoneNumber || null,
        email: user.email || null,
      });
      console.log("User data saved successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone number"
        disabled={isOtpSent}
      />
      {phoneError && <p className="error-message">{phoneError}</p>}
      {isOtpSent && (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          {otpError && <p className="error-message">{otpError}</p>}
        </>
      )}
      {!isOtpSent ? (
        <button onClick={sendOtp} id="send-otp">
          Send OTP
        </button>
      ) : (
        <button onClick={verifyOtp}>Verify OTP</button>
      )}
      <div className="google-login">
        <button onClick={loginWithGoogle} className="google-login-button">
          Login with Google
        </button>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
