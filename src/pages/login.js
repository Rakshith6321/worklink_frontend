import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseclient";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    loginInput: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const input = loginData.loginInput.trim().toLowerCase();
      const password = loginData.password;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`email.eq.${input},mobile.eq.${loginData.loginInput.trim()}`)
        .eq("password", password)
        .limit(1);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else if (!data || data.length === 0) {
        setMessage("Invalid credentials");
        setMessageType("error");
      } else {
        setMessage("Login successful");
        setMessageType("success");

        localStorage.setItem("worklinkUser", JSON.stringify(data[0]));

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      setMessage("Error connecting to Supabase");
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
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

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
        name="loginInput"
        placeholder="Enter email or mobile number"
        value={loginData.loginInput}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "12px",
          margin: "10px 0",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <input
        type="password"
        name="password"
        placeholder="Enter password"
        value={loginData.password}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "12px",
          margin: "10px 0",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#6c757d" : "#0d6efd",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          transition: "0.3s ease",
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
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          ></span>
        )}
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* ✅ ADDED REGISTER BUTTON (no UI disturbance) */}
      <button
        onClick={() => navigate("/register")}
        style={{
          width: "100%",
          padding: "12px",
          background: "#198754",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "10px",
          transition: "0.3s ease",
        }}
      >
        Register
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

export default Login;