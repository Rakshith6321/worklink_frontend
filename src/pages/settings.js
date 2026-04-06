import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseclient";

function Settings() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("worklinkUser") ||
      localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    setUserId(user.id);
    setEmail(user.email || "");
    setFormData({
      name: user.name || "",
      mobile: user.mobile || "",
      password: user.password || "",
    });
  }, [navigate]);

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
    const mobile = formData.mobile.trim();
    const password = formData.password.trim();

    if (!name || !mobile || !password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return false;
    }

    if (name.length < 3) {
      setMessage("Name must be at least 3 characters");
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

  const handleSave = async () => {
    setMessage("");
    setMessageType("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!userId) {
        setMessage("User not found");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const trimmedName = formData.name.trim();
      const trimmedMobile = formData.mobile.trim();
      const trimmedPassword = formData.password.trim();

      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id, mobile")
        .eq("mobile", trimmedMobile)
        .neq("id", userId);

      if (checkError) {
        setMessage(checkError.message);
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        setMessage("This mobile number is already used by another account");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          name: trimmedName,
          mobile: trimmedMobile,
          password: trimmedPassword,
        })
        .eq("id", userId)
        .select();

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else if (data && data.length > 0) {
        const updatedUser = data[0];

        localStorage.setItem("worklinkUser", JSON.stringify(updatedUser));

        setMessage("Profile updated successfully");
        setMessageType("success");

        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        setMessage("No changes saved");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error updating profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={{ margin: 0 }}>Settings</h2>

        <button onClick={() => navigate("/profile")} style={backHeaderBtn}>
          Back
        </button>
      </header>

      <div style={{ padding: "40px 24px" }}>
        <div style={settingsCard}>
          <h1 style={{ marginTop: 0, marginBottom: "10px" }}>Account Settings</h1>
          <p style={subText}>
            Update your profile information with valid details only.
          </p>

          {message && (
            <div
              style={{
                ...messageBox,
                background:
                  messageType === "success" ? "#d1e7dd" : "#f8d7da",
                color: messageType === "success" ? "#0f5132" : "#842029",
              }}
            >
              {message}
            </div>
          )}

          <label style={labelStyle}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            style={inputStyle}
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            disabled
            style={{ ...inputStyle, background: "#e9ecef", cursor: "not-allowed" }}
          />

          <label style={labelStyle}>Mobile Number</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter 10-digit mobile number"
            style={inputStyle}
            maxLength={10}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password must contain number and special character"
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
            onClick={handleSave}
            disabled={loading}
            style={{
              ...saveButton,
              background: loading ? "#6c757d" : "#198754",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%)",
  fontFamily: "Arial, sans-serif",
};

const headerStyle = {
  background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
  color: "white",
  padding: "20px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const backHeaderBtn = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "10px",
  background: "white",
  color: "#0d6efd",
  cursor: "pointer",
  fontWeight: "bold",
};

const settingsCard = {
  maxWidth: "720px",
  margin: "0 auto",
  background: "white",
  borderRadius: "22px",
  boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  padding: "30px",
};

const subText = {
  color: "#6b7280",
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  marginTop: "10px",
  fontWeight: "bold",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  marginBottom: "10px",
  boxSizing: "border-box",
  background: "#f9fafb",
};

const hintText = {
  fontSize: "13px",
  color: "#6b7280",
  marginTop: "4px",
  marginBottom: "14px",
};

const messageBox = {
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "16px",
  textAlign: "center",
  fontWeight: "bold",
};

const saveButton = {
  width: "100%",
  marginTop: "8px",
  padding: "14px",
  color: "white",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

export default Settings;