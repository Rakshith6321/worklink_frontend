import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseclient";
import TaskMap from "../components/taskmap";

function FindTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(2);
  const [effectiveRadius, setEffectiveRadius] = useState(2);
  const expansionRef = useRef(null);

  const radiusOptions = [2, 5, 10];

  const getCurrentPosition = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchTasks = async () => {
    try {
      const currentLocation = await getCurrentPosition();
      setUserLocation(currentLocation);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("posted_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setTasks(data || []);
      }
    } catch {
      setMessage("Error loading tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const storedUser = localStorage.getItem("worklinkUser");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) {
        setMessage("Please login first");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          status: "assigned",
          accepted_by: user.id,
          otp_status: "not_generated",
        })
        .eq("id", taskId)
        .eq("status", "open");

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Task accepted successfully");
        fetchTasks();
      }
    } catch {
      setMessage("Error accepting task");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, );

  useEffect(() => {
    setEffectiveRadius(selectedRadius);
  }, [selectedRadius]);

  const visibleTasks = tasks
    .filter((task) => task.status !== "completed")
    .map((task) => {
      if (
        userLocation &&
        task.latitude != null &&
        task.longitude != null
      ) {
        const distance = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          task.latitude,
          task.longitude
        );
        return { ...task, distanceKm: distance };
      }
      return { ...task, distanceKm: null };
    })
    .filter((task) => {
      if (!userLocation) return true;
      if (task.distanceKm == null) return true;
      return task.distanceKm <= effectiveRadius;
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  useEffect(() => {
    if (expansionRef.current) {
      clearTimeout(expansionRef.current);
      expansionRef.current = null;
    }

    if (loading) return;
    if (visibleTasks.length > 0) return;
    if (effectiveRadius >= 10) return;

    expansionRef.current = setTimeout(() => {
      setEffectiveRadius((prev) => {
        if (prev < 5) return 5;
        if (prev < 10) return 10;
        return prev;
      });
    }, 60000);

    return () => {
      if (expansionRef.current) clearTimeout(expansionRef.current);
    };
  }, [visibleTasks.length, effectiveRadius, loading]);

  return (
    <div style={pageStyle}>
      <div style={wrapperStyle}>
        <div style={headerCard}>
          <h1 style={{ margin: 0 }}>Find Nearby Tasks</h1>
          <p style={subText}>
            Browse nearby tasks on the map. If no tasks are found, the radius expands automatically.
          </p>
        </div>

        {message && <div style={successBox}>{message}</div>}

        <div style={radiusCard}>
          <strong>Select Radius:</strong>
          <div style={radiusButtonRow}>
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => setSelectedRadius(radius)}
                style={{
                  ...radiusBtn,
                  background: selectedRadius === radius ? "#0d6efd" : "white",
                  color: selectedRadius === radius ? "white" : "#0d6efd",
                  border: "1px solid #0d6efd",
                }}
              >
                {radius} km
              </button>
            ))}
          </div>
          <p style={{ margin: "10px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
            Current active search radius: <strong>{effectiveRadius} km</strong>
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <TaskMap userLocation={userLocation} tasks={visibleTasks} />
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : visibleTasks.length === 0 ? (
          <div style={emptyCard}>
            No nearby tasks available right now. Search radius will expand automatically.
          </div>
        ) : (
          <div style={gridStyle}>
            {visibleTasks.map((task) => (
              <div key={task.id} style={taskCard}>
                <h3 style={{ marginTop: 0 }}>{task.title}</h3>
                <p style={descText}>{task.description}</p>

                <div style={infoGrid}>
                  <InfoItem label="Budget" value={`₹${task.budget}`} />
                  <InfoItem label="Location" value={task.location} />
                </div>

                {task.distanceKm != null && (
                  <div style={mapBox}>
                    📍 Distance: {task.distanceKm.toFixed(2)} km
                  </div>
                )}

                <div style={{ marginTop: "14px" }}>
                  <strong>Status: </strong>
                  <span style={getStatusBadge(task.status)}>{task.status}</span>
                </div>

                {task.status === "open" && (
                  <button
                    onClick={() => handleAcceptTask(task.id)}
                    style={greenButton}
                  >
                    Accept Task
                  </button>
                )}

                {task.status === "assigned" && (
                  <button disabled style={disabledButton}>
                    Already Assigned
                  </button>
                )}

                {task.status === "otp_generated" && (
                  <button disabled style={disabledButton}>
                    OTP Generated
                  </button>
                )}

                {task.status === "in_progress" && (
                  <button disabled style={disabledButton}>
                    Work In Progress
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={infoItem}>
      <span style={infoLabel}>{label}</span>
      <span style={infoValue}>{value}</span>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%)",
  padding: "40px 20px",
  fontFamily: "Arial, sans-serif",
};

const wrapperStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerCard = {
  background: "white",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
  marginBottom: "24px",
};

const subText = {
  color: "#6b7280",
  marginTop: "10px",
  marginBottom: 0,
};

const successBox = {
  background: "#d1e7dd",
  color: "#0f5132",
  padding: "12px",
  borderRadius: "12px",
  marginBottom: "18px",
  fontWeight: "bold",
};

const radiusCard = {
  background: "white",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  marginBottom: "20px",
};

const radiusButtonRow = {
  display: "flex",
  gap: "10px",
  marginTop: "12px",
  flexWrap: "wrap",
};

const radiusBtn = {
  padding: "10px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const emptyCard = {
  background: "white",
  padding: "26px",
  borderRadius: "18px",
  textAlign: "center",
  color: "#555",
  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "22px",
};

const taskCard = {
  background: "white",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
};

const descText = {
  color: "#4b5563",
  lineHeight: 1.5,
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "14px",
};

const infoItem = {
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  padding: "12px",
  borderRadius: "12px",
};

const infoLabel = {
  display: "block",
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "4px",
};

const infoValue = {
  fontWeight: "bold",
  color: "#111827",
};

const mapBox = {
  marginTop: "14px",
  background: "#eef2ff",
  color: "#3730a3",
  padding: "10px 12px",
  borderRadius: "12px",
  fontWeight: "bold",
  fontSize: "13px",
};

const greenButton = {
  marginTop: "16px",
  width: "100%",
  padding: "12px",
  background: "#198754",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const disabledButton = {
  marginTop: "16px",
  width: "100%",
  padding: "12px",
  background: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "not-allowed",
  fontWeight: "bold",
};

function getStatusBadge(status) {
  let bg = "#e7f1ff";
  let color = "#0d6efd";

  if (status === "assigned") {
    bg = "#fff3cd";
    color = "#b7791f";
  } else if (status === "otp_generated") {
    bg = "#f3e8ff";
    color = "#7c3aed";
  } else if (status === "in_progress") {
    bg = "#cff4fc";
    color = "#055160";
  } else if (status === "completed") {
    bg = "#d1e7dd";
    color = "#0f5132";
  }

  return {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: bg,
    color,
    fontWeight: "bold",
    fontSize: "13px",
    textTransform: "capitalize",
  };
}

export default FindTasks;