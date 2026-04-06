import { useEffect, useState } from "react";
import { supabase } from "../supabaseclient";

function MyTasks() {
  const [postedTasks, setPostedTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [otpInputs, setOtpInputs] = useState({});

  const fetchTasks = async () => {
    try {
      const storedUser = localStorage.getItem("worklinkUser");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) {
        setMessage("Please login first");
        setLoading(false);
        return;
      }

      const { data: postedData, error: postedError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      const { data: acceptedData, error: acceptedError } = await supabase
        .from("tasks")
        .select("*")
        .eq("accepted_by", user.id)
        .order("id", { ascending: false });

      if (postedError || acceptedError) {
        setMessage(postedError?.message || acceptedError?.message);
      } else {
        setPostedTasks(postedData || []);
        setAcceptedTasks(acceptedData || []);
      }
    } catch (error) {
      setMessage("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const generateOtp = async (taskId) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          otp_code: otp,
          otp_status: "generated",
          status: "otp_generated",
        })
        .eq("id", taskId)
        .eq("status", "assigned");

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(`OTP generated successfully: ${otp}`);
        fetchTasks();
      }
    } catch (error) {
      setMessage("Error generating OTP");
    }
  };

  const verifyOtp = async (task) => {
    const enteredOtp = otpInputs[task.id];

    if (!enteredOtp) {
      setMessage("Please enter OTP");
      return;
    }

    if (enteredOtp !== task.otp_code) {
      setMessage("Invalid OTP");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "in_progress",
          otp_status: "verified",
        })
        .eq("id", task.id)
        .eq("status", "otp_generated");

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("OTP verified. Work can now start.");
        setOtpInputs((prev) => ({ ...prev, [task.id]: "" }));
        fetchTasks();
      }
    } catch (error) {
      setMessage("Error verifying OTP");
    }
  };

  const completeTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "completed",
        })
        .eq("id", taskId)
        .eq("status", "in_progress");

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Task completed successfully");
        fetchTasks();
      }
    } catch (error) {
      setMessage("Error completing task");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={pageStyle}>
      <div style={wrapperStyle}>
        <div style={headerCard}>
          <h1 style={{ margin: 0 }}>My Tasks</h1>
          <p style={subText}>
            Manage posted tasks, accepted work, OTP verification, and work
            progress.
          </p>
        </div>

        {message && <div style={successBox}>{message}</div>}

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <>
            <SectionTitle text="Tasks Posted By You" />
            {postedTasks.length === 0 ? (
              <EmptyCard text="No posted tasks found." />
            ) : (
              <TaskGrid>
                {postedTasks.map((task) => (
                  <TaskCard key={task.id} task={task}>
                    {task.status === "assigned" &&
                      task.otp_status !== "generated" && (
                        <button
                          onClick={() => generateOtp(task.id)}
                          style={blueButton}
                        >
                          Generate Start OTP
                        </button>
                      )}

                    {task.status === "otp_generated" && (
                      <div style={otpBox}>Start OTP: {task.otp_code}</div>
                    )}

                    {task.status === "in_progress" && (
                      <div style={progressBox}>Work is currently in progress</div>
                    )}

                    {task.status === "completed" && (
                      <button disabled style={disabledButton}>
                        Task Completed
                      </button>
                    )}
                  </TaskCard>
                ))}
              </TaskGrid>
            )}

            <SectionTitle text="Tasks Accepted By You" />
            {acceptedTasks.length === 0 ? (
              <EmptyCard text="No accepted tasks found." />
            ) : (
              <TaskGrid>
                {acceptedTasks.map((task) => (
                  <TaskCard key={task.id} task={task}>
                    {task.status === "otp_generated" && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter start OTP"
                          value={otpInputs[task.id] || ""}
                          onChange={(e) =>
                            setOtpInputs((prev) => ({
                              ...prev,
                              [task.id]: e.target.value,
                            }))
                          }
                          style={otpInput}
                        />
                        <button
                          onClick={() => verifyOtp(task)}
                          style={greenButton}
                        >
                          Verify OTP & Start Work
                        </button>
                      </>
                    )}

                    {task.status === "assigned" && (
                      <button disabled style={disabledButton}>
                        Waiting for Start OTP
                      </button>
                    )}

                    {task.status === "in_progress" && (
                      <button
                        onClick={() => completeTask(task.id)}
                        style={greenButton}
                      >
                        Mark Task Completed
                      </button>
                    )}

                    {task.status === "completed" && (
                      <button disabled style={disabledButton}>
                        Task Completed
                      </button>
                    )}
                  </TaskCard>
                ))}
              </TaskGrid>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ text }) {
  return (
    <h2 style={{ color: "#111827", marginTop: "30px", marginBottom: "14px" }}>
      {text}
    </h2>
  );
}

function EmptyCard({ text }) {
  return <div style={emptyCard}>{text}</div>;
}

function TaskGrid({ children }) {
  return <div style={gridStyle}>{children}</div>;
}

function TaskCard({ task, children }) {
  return (
    <div style={taskCard}>
      <h3 style={{ marginTop: 0 }}>{task.title}</h3>
      <p style={descText}>{task.description}</p>

      <div style={infoGrid}>
        <InfoItem label="Budget" value={`₹${task.budget}`} />
        <InfoItem label="Location" value={task.location} />
        <InfoItem label="Contact" value={task.contact} />
        <div style={infoItem}>
          <span style={infoLabel}>Status</span>
          <span style={getStatusBadge(task.status)}>{task.status}</span>
        </div>
      </div>

      {children}
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
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
  marginBottom: "22px",
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

const emptyCard = {
  background: "white",
  padding: "22px",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  color: "#6b7280",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
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

const otpBox = {
  marginTop: "14px",
  padding: "12px",
  background: "#fff3cd",
  color: "#664d03",
  borderRadius: "12px",
  fontWeight: "bold",
};

const progressBox = {
  marginTop: "14px",
  padding: "12px",
  background: "#cff4fc",
  color: "#055160",
  borderRadius: "12px",
  fontWeight: "bold",
};

const blueButton = {
  marginTop: "14px",
  width: "100%",
  padding: "12px",
  background: "#0d6efd",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const greenButton = {
  marginTop: "14px",
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
  marginTop: "14px",
  width: "100%",
  padding: "12px",
  background: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "not-allowed",
  fontWeight: "bold",
};

const otpInput = {
  width: "100%",
  padding: "12px",
  marginTop: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
  background: "#f9fafb",
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

export default MyTasks;