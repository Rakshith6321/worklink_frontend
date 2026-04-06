import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseclient";

function PostTask() {
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    budget: "",
    location: "",
    contact: "",
  });

  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 10);
      setTaskData((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const useCurrentLocation = () => {
    setGettingLocation(true);
    setMessage("");
    setMessageType("");

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported on this device");
      setMessageType("error");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setMessage("Current location captured successfully");
        setMessageType("success");
        setGettingLocation(false);
      },
      () => {
        setMessage("Unable to fetch current location");
        setMessageType("error");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateForm = () => {
    const title = taskData.title.trim();
    const description = taskData.description.trim();
    const budget = taskData.budget.toString().trim();
    const location = taskData.location.trim();
    const contact = taskData.contact.trim();

    if (!title || !description || !budget || !location || !contact) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return false;
    }

    if (Number(budget) <= 0) {
      setMessage("Budget must be greater than 0");
      setMessageType("error");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(contact)) {
      setMessage("Enter a valid 10-digit mobile number");
      setMessageType("error");
      return false;
    }

    if (coords.latitude == null || coords.longitude == null) {
      setMessage("Please use your current location before posting");
      setMessageType("error");
      return false;
    }

    return true;
  };

  const handlePostTask = async () => {
    setMessage("");
    setMessageType("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const storedUser = localStorage.getItem("worklinkUser");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) {
        setMessage("Please login first");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("tasks").insert([
        {
          title: taskData.title.trim(),
          description: taskData.description.trim(),
          budget: Number(taskData.budget),
          location: taskData.location.trim(),
          contact: taskData.contact.trim(),
          status: "open",
          user_id: user.id,
          accepted_by: null,
          otp_code: null,
          otp_status: "not_generated",
          latitude: coords.latitude,
          longitude: coords.longitude,
          posted_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Task posted successfully");
        setMessageType("success");
        setTaskData({
          title: "",
          description: "",
          budget: "",
          location: "",
          contact: "",
        });
        setCoords({ latitude: null, longitude: null });

        setTimeout(() => {
          navigate("/my-tasks");
        }, 1000);
      }
    } catch {
      setMessage("Error connecting to Supabase");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={topBanner}>
          <h2 style={{ margin: 0 }}>Post a New Task</h2>
          <p style={bannerText}>
            Add task details so nearby users can view and accept it quickly.
          </p>
        </div>

        <div style={{ padding: "28px" }}>
          {message && (
            <div
              style={{
                ...messageBox,
                background: messageType === "success" ? "#d1e7dd" : "#f8d7da",
                color: messageType === "success" ? "#0f5132" : "#842029",
              }}
            >
              {message}
            </div>
          )}

          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={taskData.title}
            onChange={handleChange}
            style={inputStyle}
          />

          <textarea
            name="description"
            placeholder="Task description"
            value={taskData.description}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
          />

          <input
            type="number"
            name="budget"
            placeholder="Budget amount"
            value={taskData.budget}
            onChange={handleChange}
            style={inputStyle}
            min="1"
          />

          <input
            type="text"
            name="location"
            placeholder="Location / Area name"
            value={taskData.location}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="contact"
            placeholder="10-digit mobile number"
            value={taskData.contact}
            onChange={handleChange}
            style={inputStyle}
            maxLength={10}
          />

          <button
            onClick={useCurrentLocation}
            disabled={gettingLocation}
            style={{
              ...secondaryButton,
              width: "100%",
              marginBottom: "14px",
              background: gettingLocation ? "#adb5bd" : "#0d6efd",
              color: "white",
            }}
          >
            {gettingLocation ? "Getting Location..." : "Use My Current Location"}
          </button>

          {coords.latitude && coords.longitude && (
            <div
              style={{
                marginBottom: "14px",
                background: "#eef2ff",
                color: "#3730a3",
                padding: "10px 12px",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              Location captured: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button onClick={() => navigate("/dashboard")} style={secondaryButton}>
              Back
            </button>

            <button
              onClick={handlePostTask}
              disabled={loading}
              style={{
                ...primaryButton,
                background: loading ? "#6c757d" : "#111827",
              }}
            >
              {loading ? "Posting..." : "Post Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%)",
  fontFamily: "Arial, sans-serif",
  padding: "40px 20px",
};

const containerStyle = {
  maxWidth: "720px",
  margin: "0 auto",
  background: "white",
  borderRadius: "24px",
  boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const topBanner = {
  background: "linear-gradient(135deg, #0d6efd, #4dabf7)",
  color: "white",
  padding: "26px",
};

const bannerText = {
  margin: "8px 0 0 0",
  opacity: 0.95,
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
  background: "#f9fafb",
  fontSize: "15px",
};

const messageBox = {
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "16px",
  textAlign: "center",
  fontWeight: "bold",
};

const primaryButton = {
  flex: 1,
  padding: "14px",
  color: "white",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

const secondaryButton = {
  flex: 1,
  padding: "14px",
  background: "#e9ecef",
  color: "#111827",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

export default PostTask;