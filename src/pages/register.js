import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseclient";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: onlyDigits,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) {
      return { label: "", color: "#ccc", width: "0%" };
    }

    let score = 0;

    if (password.length >= 7) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;

    if (score <= 1) {
      return { label: "Weak", color: "#dc3545", width: "33%" };
    }

    if (score === 2 || score === 3) {
      return { label: "Medium", color: "#fd7e14", width: "66%" };
    }

    return { label: "Strong", color: "#198754", width: "100%" };
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.trim();
    const password = formData.password.trim();

    if (!name || !email || !mobile || !password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return false;
    }

    if (name.length < 3) {
      setMessage("Name must be at least 3 characters");
      setMessageType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address");
      setMessageType("error");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMessage("Enter a valid 10-digit mobile number");
      setMessageType("error");
      return false;
    }

    if (password.length <= 6) {
      setMessage("Password must be more than 6 characters");
      setMessageType("error");
      return false;
    }

    const strongPasswordRegex = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{7,}$/;

    if (!strongPasswordRegex.test(password)) {
      setMessage(
        "Password must include at least 1 number and 1 special character"
      );
      setMessageType("error");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setMessage("");
    setMessageType("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = formData.email.trim().toLowerCase();
      const trimmedMobile = formData.mobile.trim();

      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id, email, mobile")
        .or(`email.eq.${trimmedEmail},mobile.eq.${trimmedMobile}`);

      if (checkError) {
        setMessage(checkError.message);
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        setMessage("User already registered with this email or mobile number");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("users").insert([
        {
          name: formData.name.trim(),
          email: trimmedEmail,
          mobile: trimmedMobile,
          password: formData.password.trim(),
        },
      ]);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("User registered successfully");
        setMessageType("success");

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      setMessage("Error connecting to Supabase");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "420px",
        margin: "50px auto",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>

      {message && (
        <div
          style={{
            background: messageType === "success" ? "#d1e7dd" : "#f8d7da",
            color: messageType === "success" ? "#0f5132" : "#842029",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      <input
        type="text"
        name="name"
        placeholder="Enter name"
        value={formData.name}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        type="email"
        name="email"
        placeholder="Enter email"
        value={formData.email}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        type="text"
        name="mobile"
        placeholder="Enter 10-digit mobile number"
        value={formData.mobile}
        onChange={handleChange}
        style={inputStyle}
        maxLength={10}
      />

      <input
        type="password"
        name="password"
        placeholder="Enter password"
        value={formData.password}
        onChange={handleChange}
        style={inputStyle}
      />

      <div style={{ marginTop: "4px", marginBottom: "10px" }}>
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#e9ecef",
            borderRadius: "999px",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: passwordStrength.width,
              height: "100%",
              background: passwordStrength.color,
              borderRadius: "999px",
              transition: "all 0.3s ease",
            }}
          ></div>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "bold",
            color: passwordStrength.color,
          }}
        >
          {passwordStrength.label &&
            `Password Strength: ${passwordStrength.label}`}
        </p>
      </div>

      <p style={hintText}>
        Password must be more than 6 characters and include at least 1 number
        and 1 special character.
      </p>

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#6c757d" : "#198754",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {loading && (
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid white",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          ></span>
        )}
        {loading ? "Registering..." : "Register"}
      </button>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const hintText = {
  fontSize: "13px",
  color: "#6b7280",
  marginTop: "4px",
  marginBottom: "14px",
};

export default Register;