import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Post Task",
      subtitle: "Create a task and publish it for nearby users.",
      emoji: "📝",
      path: "/post-task",
      gradient: "linear-gradient(135deg, #0d6efd, #4dabf7)",
    },
    {
      title: "Find Tasks",
      subtitle: "Browse local work opportunities and accept tasks.",
      emoji: "📍",
      path: "/find-tasks",
      gradient: "linear-gradient(135deg, #198754, #51cf66)",
    },
    {
      title: "My Tasks",
      subtitle: "Track posted tasks, accepted work, and OTP progress.",
      emoji: "📂",
      path: "/my-tasks",
      gradient: "linear-gradient(135deg, #fd7e14, #ffd43b)",
    },
  ];

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>WorkLink Dashboard</h2>
          <p style={headerSubText}>
            Smart local task management with secure task verification.
          </p>
        </div>

        <button onClick={() => navigate("/profile")} style={profileBtn}>
          👤
        </button>
      </header>

      <div style={{ padding: "32px 24px" }}>
        <div style={heroCard}>
          <h1 style={heroTitle}>Welcome to WorkLink</h1>
          <p style={heroText}>
            Post tasks, discover nearby work, manage your activity, and use OTP
            verification to confirm task start securely.
          </p>
        </div>

        <div style={gridStyle}>
          {cards.map((card) => (
            <div key={card.title} style={mainCard}>
              <div style={{ ...cardTop, background: card.gradient }}>
                <span style={{ fontSize: "34px" }}>{card.emoji}</span>
              </div>

              <div style={{ padding: "22px" }}>
                <h3 style={cardTitle}>{card.title}</h3>
                <p style={cardText}>{card.subtitle}</p>

                <button
                  onClick={() => navigate(card.path)}
                  style={primaryDarkButton}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
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
  boxShadow: "0 4px 18px rgba(13,110,253,0.25)",
};

const headerSubText = {
  margin: "6px 0 0 0",
  opacity: 0.95,
  fontSize: "14px",
};

const profileBtn = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  border: "none",
  background: "white",
  color: "#0d6efd",
  fontSize: "22px",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const heroCard = {
  background: "white",
  borderRadius: "22px",
  padding: "28px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  marginBottom: "28px",
};

const heroTitle = {
  marginTop: 0,
  marginBottom: "12px",
  color: "#111827",
};

const heroText = {
  color: "#6b7280",
  marginBottom: 0,
  fontSize: "16px",
  lineHeight: 1.6,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
};

const mainCard = {
  background: "white",
  borderRadius: "22px",
  overflow: "hidden",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const cardTop = {
  color: "white",
  padding: "22px",
};

const cardTitle = {
  marginTop: 0,
  marginBottom: "10px",
  color: "#111827",
};

const cardText = {
  color: "#6b7280",
  minHeight: "48px",
  lineHeight: 1.5,
};

const primaryDarkButton = {
  marginTop: "12px",
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "12px",
  background: "#111827",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Dashboard;