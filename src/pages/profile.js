import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Profile() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const storedUser =
    localStorage.getItem("worklinkUser") || localStorage.getItem("user");

  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("worklinkUser");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div style={noUserPage}>
        <div style={noUserCard}>
          <h2>No user found</h2>
          <button onClick={() => navigate("/login")} style={primaryButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={{ margin: 0 }}>My Profile</h2>

        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={menuIconBtn}>
            ⋮
          </button>

          {menuOpen && (
            <div style={menuBox}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                style={menuButton}
              >
                Settings
              </button>

              <button
                onClick={handleLogout}
                style={{ ...menuButton, color: "#dc3545" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div style={{ padding: "40px 24px" }}>
        <div style={profileCard}>
          <div style={profileTop}>
            <div style={avatarCircle}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h1 style={{ margin: 0 }}>{user.name}</h1>
            <p style={{ margin: "8px 0 0 0", opacity: 0.95 }}>
              WorkLink User Profile
            </p>
          </div>

          <div style={{ padding: "28px" }}>
            <InfoField label="Name" value={user.name} />
            <InfoField label="Email" value={user.email} />
            <InfoField label="Mobile" value={user.mobile} />
            <InfoField label="User ID" value={user.id} />

            <button
              onClick={() => navigate("/dashboard")}
              style={backBtn}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div style={fieldBox}>
      <strong>{label}</strong>
      <p style={fieldText}>{value}</p>
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
  position: "relative",
};

const profileCard = {
  maxWidth: "760px",
  margin: "0 auto",
  background: "white",
  borderRadius: "24px",
  boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const profileTop = {
  background: "linear-gradient(135deg, #0d6efd, #4dabf7)",
  color: "white",
  padding: "30px",
  textAlign: "center",
};

const avatarCircle = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  background: "white",
  color: "#0d6efd",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "36px",
  fontWeight: "bold",
  marginBottom: "14px",
};

const fieldBox = {
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "14px",
};

const fieldText = {
  margin: "8px 0 0 0",
  color: "#374151",
  fontSize: "15px",
};

const menuIconBtn = {
  width: "46px",
  height: "46px",
  borderRadius: "12px",
  border: "none",
  background: "white",
  color: "#0d6efd",
  fontSize: "24px",
  cursor: "pointer",
  fontWeight: "bold",
};

const menuBox = {
  position: "absolute",
  right: 0,
  top: "54px",
  width: "170px",
  background: "white",
  borderRadius: "14px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  overflow: "hidden",
  zIndex: 10,
};

const menuButton = {
  width: "100%",
  padding: "12px 14px",
  border: "none",
  background: "white",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "14px",
  borderBottom: "1px solid #eee",
};

const backBtn = {
  marginTop: "18px",
  padding: "12px 20px",
  border: "none",
  borderRadius: "12px",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const noUserPage = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Arial, sans-serif",
  background: "#f5f7fb",
};

const noUserCard = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const primaryButton = {
  marginTop: "10px",
  padding: "10px 16px",
  border: "none",
  borderRadius: "10px",
  background: "#0d6efd",
  color: "white",
  cursor: "pointer",
};

export default Profile;