import { useEffect, useState } from "react";
import { supabase } from "../supabaseclient";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");

  const fetchAdminData = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("id", { ascending: false });

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("id", { ascending: false });

      if (usersError || tasksError) {
        setMessage(usersError?.message || tasksError?.message);
        return;
      }

      setUsers(usersData || []);
      setTasks(tasksData || []);
    } catch (error) {
      setMessage("Error fetching admin data");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Task deleted successfully");
        fetchAdminData();
      }
    } catch (error) {
      setMessage("Error deleting task");
    }
  };

  const handleLogout = () => {
    navigate("/admin-login");
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%)",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #111827, #374151)",
          color: "white",
          padding: "24px",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
            Monitor users and tasks across WorkLink.
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: "12px",
            background: "white",
            color: "#111827",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      {message && (
        <div
          style={{
            background: "#d1e7dd",
            color: "#0f5132",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Total Tasks" value={tasks.length} />
        <StatCard
          title="Open Tasks"
          value={tasks.filter((task) => task.status === "open").length}
        />
        <StatCard
          title="Completed Tasks"
          value={tasks.filter((task) => task.status === "completed").length}
        />
      </div>

      <h2 style={{ marginBottom: "14px" }}>Registered Users</h2>
      <div style={{ display: "grid", gap: "14px", marginBottom: "32px" }}>
        {users.length === 0 ? (
          <EmptyCard text="No users found." />
        ) : (
          users.map((user) => (
            <div key={user.id} style={cardStyle}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Mobile:</strong> {user.mobile}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
          ))
        )}
      </div>

      <h2 style={{ marginBottom: "14px" }}>All Tasks</h2>
      <div style={{ display: "grid", gap: "14px" }}>
        {tasks.length === 0 ? (
          <EmptyCard text="No tasks found." />
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={cardStyle}>
              <p><strong>Title:</strong> {task.title}</p>
              <p><strong>Description:</strong> {task.description}</p>
              <p><strong>Budget:</strong> ₹{task.budget}</p>
              <p><strong>Location:</strong> {task.location}</p>
              <p><strong>Contact:</strong> {task.contact}</p>
              <p><strong>Status:</strong> {task.status}</p>
              <p><strong>Posted By User ID:</strong> {task.user_id}</p>

              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{
                  marginTop: "10px",
                  padding: "10px 16px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Delete Task
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: "22px",
        borderRadius: "18px",
        boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#374151" }}>{title}</h3>
      <p
        style={{
          margin: 0,
          fontSize: "32px",
          fontWeight: "bold",
          color: "#0d6efd",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
        color: "#6b7280",
      }}
    >
      {text}
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
};

export default AdminDashboard;