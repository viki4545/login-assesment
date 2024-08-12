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
auth.settings.appVerificationDisabledForTesting = true;

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified", response);
          },
          "expired-callback": () => {
            toast.error("reCAPTCHA expired, please try again.");
          },
        }
      );

      window.recaptchaVerifier.render().catch((error) => {
        console.error("reCAPTCHA render error:", error);
      });
    }
  }, []);

  const sendOtp = () => {
    const appVerifier = window.recaptchaVerifier;
    const phonNum = "+91" + phone;
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
      {isOtpSent && (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
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
