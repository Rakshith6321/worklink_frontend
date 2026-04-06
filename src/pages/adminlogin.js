import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Replace this after Render deployment
  const BACKEND_URL = "https://worklink-emqe.onrender.com";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setMessage(data.message);
      setMessageType(response.ok ? "success" : "error");

      if (response.ok) {
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

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
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Admin Login</h2>

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
        type="email"
        name="email"
        placeholder="Enter admin email"
        value={formData.email}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        type="password"
        name="password"
        placeholder="Enter admin password"
        value={formData.password}
        onChange={handleChange}
        style={inputStyle}
      />

      <button
        onClick={handleAdminLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#6c757d" : "#212529",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Logging in..." : "Login as Admin"}
      </button>
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

export default AdminLogin;