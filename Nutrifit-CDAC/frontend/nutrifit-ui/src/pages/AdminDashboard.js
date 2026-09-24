import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Chart from "chart.js/auto";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [data, setData] = useState(null);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") navigate("/login");
    else loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data || []);
  };

  const loadDetails = async (id) => {
    const res = await api.get("/admin/users/" + id);
    setData(res.data);

    setTimeout(() => {
      drawChart(res.data?.progressHistory || []);
    }, 200);
  };

  const drawChart = (history) => {
    if (!history || history.length === 0) return;

    const labels = history.map(x => x.date.split("T")[0]);
    const weights = history.map(x => x.weight);
    const bmis = history.map(x => x.bmi);

    if (chart) chart.destroy();

    const ctx = document.getElementById("adminProgressChart");
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Weight (kg)",
            data: weights,
            tension: 0.4,
            borderWidth: 3,
            fill: true
          },
          {
            label: "BMI",
            data: bmis,
            tension: 0.4,
            borderDash: [6, 6],
            borderWidth: 2
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    setChart(newChart);
  };

  const latest = data?.progressHistory?.length
    ? data.progressHistory[data.progressHistory.length - 1]
    : null;

  const noDisease = (data?.healthIssues || []).length === 0;

  // ✅ UPDATED: Delete User function (fixed 405 issue)
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user and all related data?")) return;

    try {
      // Using full Axios config ensures headers are sent correctly
      const res = await api({
        method: "delete",
        url: "/admin/users/" + id,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      console.log("Delete response:", res);
      alert("User deleted successfully!");
      setData(null); // clear selected user
      loadUsers();   // reload users list
    } catch (error) {
      console.error("Delete error:", error.response || error);
      alert("Failed to delete user: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container-fluid px-3 py-2 admin-bg">

      <h4 className="fw-bold text-primary mb-3">🛡 NutriFit Admin Dashboard</h4>

      <div className="row g-2 align-items-stretch">

        {/* USERS */}
        <div className="col-xl-2 col-md-3 d-flex">
          <div className="card admin-card w-100">
            <div className="card-header admin-header-dark">👥 Users</div>
            <div className="card-body p-2 user-scroll">
              {users.map(u => (
                <div key={u.userId} className="user-tile" onClick={() => loadDetails(u.userId)}>
                  <div className="fw-semibold">{u.name}</div>
                  <small className="text-muted">{u.email}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="col-xl-10 col-md-9">

          {!data && <div className="alert alert-info">Select a user to view full dashboard</div>}

          {data && (
            <>
              {/* ================= DELETE USER BUTTON ================= */}
              <div className="mb-2 text-end">
                <button
                  className="btn btn-danger"
                  onClick={() => deleteUser(data.user.userId)}
                >
                  Delete User
                </button>
              </div>

              <div className="row g-2 mb-2 align-items-stretch">

                {/* PROFILE */}
                <div className="col-md-3 d-flex">
                  <div className="card admin-card w-100 profile-card">
                    <div className="profile-top">
                      <div className="avatar">{data.user?.name?.charAt(0)}</div>
                      <div>
                        <div className="fw-bold">{data.user?.name}</div>
                        <small>{data.user?.email}</small>
                      </div>
                    </div>

                    <div className="profile-stats">
                      <div><span>Age</span><b>{data.profile?.age}</b></div>
                      <div><span>Height</span><b>{data.profile?.height} cm</b></div>
                      <div><span>Weight</span><b>{data.profile?.weight} kg</b></div>
                      <div><span>BMI</span><b>{data.profile?.bmi}</b></div>
                    </div>
                  </div>
                </div>

                {/* HEALTH */}
                <div className="col-md-3 d-flex">
                  <div className={`card admin-card w-100 health-card ${noDisease ? "health-ok" : "health-bad"}`}>
                    <div className="card-header admin-header-danger">❤️ Health Conditions</div>
                    <div className="card-body text-center">

                      {noDisease ? (
                        <div className="healthy-box-green">
                          ✅ Healthy <br />
                          <small>No disease detected</small>
                        </div>
                      ) : (
                        <div className="disease-grid">
                          {data.healthIssues.map((h, i) => (
                            <div key={i} className="disease-chip-red">
                              🩺 {h.name}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* GOAL */}
                <div className="col-md-3 d-flex">
                  <div className="card admin-card w-100 goal-card">
                    <div className="card-header admin-header-success">🎯 Goal & Status</div>
                    <div className="card-body small">

                      <div className="mb-2">
                        <div className="fw-bold mb-1">Current Goal</div>

                        {data.activeGoal ? (
                          <div className="status-grid mb-2">
                            <div><span>Type</span><b>{data.activeGoal.goalType}</b></div>
                            <div><span>Target</span><b>{data.activeGoal.targetValue}</b></div>

                            <div className="status-center-box">
                              <span>Status</span>
                              <b className={
                                data.activeGoal.status === "completed"
                                  ? "text-success"
                                  : "text-warning"
                              }>
                                {data.activeGoal.status}
                              </b>
                            </div>
                          </div>
                        ) : <span className="text-muted">No goal</span>}
                      </div>

                      <div>
                        <div className="fw-bold mb-1">Body Status</div>
                        {latest && (
                          <div className="status-grid">
                            <div><span>Weight</span><b>{latest.weight} kg</b></div>
                            <div><span>BMI</span><b>{latest.bmi}</b></div>
                            <div><span>Category</span><b>{latest.weightCategory}</b></div>
                            <div><span>Date</span><b>{latest.date.split("T")[0]}</b></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GRAPH */}
                <div className="col-md-3 d-flex">
                  <div className="card admin-card w-100 progress-animate">
                    <div className="card-header admin-header-info">📈 Progress</div>
                    <div className="card-body" style={{ height: 200 }}>
                      <canvas id="adminProgressChart"></canvas>
                    </div>
                  </div>
                </div>

              </div>

              {/* WORKOUT */}
              <div className="card admin-card mb-2">
                <div className="card-header admin-header-dark">🏋️ Workout Plan</div>
                <div className="table-responsive corporate-table">
                  <table className="table table-hover table-bordered table-sm m-0">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Workout</th>
                        <th>Type</th>
                        <th>Intensity</th>
                        <th>Minutes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.workoutPlan || []).map((w, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{w.dayName}</td>
                          <td>{w.workoutName}</td>
                          <td>{w.workoutType}</td>
                          <td><span className="badge bg-info">{w.intensity}</span></td>
                          <td>{w.durationMinutes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DIET */}
              <div className="card admin-card">
                <div className="card-header admin-header-warning">🥗 Diet Plan</div>
                <div className="table-responsive corporate-table">
                  <table className="table table-hover table-bordered table-sm m-0">
                    <thead>
                      <tr>
                        <th>Meal</th>
                        <th>Food</th>
                        <th>Calories</th>
                        <th>Protein</th>
                        <th>Carbs</th>
                        <th>Fat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.dietPlan || []).map((d, i) => (
                        <tr key={i}>
                          <td className="fw-bold text-capitalize">{d.mealType}</td>
                          <td>{d.foodName}</td>
                          <td>{d.calories}</td>
                          <td>{d.protein}</td>
                          <td>{d.carbs}</td>
                          <td>{d.fat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .admin-bg { background:#f4f7fb; min-height:100vh; }
        .admin-card { border:0; border-radius:16px; box-shadow:0 6px 18px rgba(0,0,0,.08); overflow:hidden; }

        .admin-header-dark { background:#111827; color:white; font-weight:600; }
        .admin-header-danger { background:linear-gradient(45deg,#dc2626,#ef4444); color:white; font-weight:600; }
        .admin-header-success { background:linear-gradient(45deg,#059669,#10b981); color:white; font-weight:600; }
        .admin-header-info { background:linear-gradient(45deg,#0891b2,#06b6d4); color:white; font-weight:600; }
        .admin-header-warning { background:linear-gradient(45deg,#f59e0b,#fbbf24); color:#111; font-weight:600; }

        .profile-top { display:flex; gap:10px; align-items:center; background:#2563eb; color:white; padding:12px; }
        .avatar { width:42px; height:42px; border-radius:50%; background:white; color:#2563eb; font-weight:800; display:flex; align-items:center; justify-content:center; }

        .profile-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:12px; }
        .profile-stats div { background:#f1f5f9; border-radius:10px; padding:8px; text-align:center; }
        .profile-stats span { font-size:11px; color:#6b7280; display:block; }

        .healthy-box-green { background:#ecfdf5; border-radius:12px; padding:20px; color:#065f46; font-weight:700; }
        .disease-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .disease-chip-red { background:#fee2e2; color:#991b1b; border-radius:12px; padding:8px; font-weight:600; text-align:center; }

        .status-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
        .status-grid div { background:#f1f5f9; border-radius:10px; padding:6px; text-align:center; }
        .status-grid span { font-size:11px; color:#6b7280; display:block; }

        .status-center-box { display:flex; flex-direction:column; justify-content:center; align-items:center; }

        .progress-animate { animation:fadeUp .6s ease; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to { opacity:1; transform:translateY(0); }
        }

        .corporate-table thead th { background:#f1f5f9; position:sticky; top:0; z-index:1; }
        .corporate-table tbody tr:hover { background:#eef4ff; }

        .user-scroll { max-height:85vh; overflow:auto; }
        .user-tile { padding:8px; border-radius:10px; border:1px solid #e5e7eb; margin-bottom:6px; cursor:pointer; background:white; }
        .user-tile:hover { background:#eef4ff; border-left:4px solid #2563eb; }
      `}</style>

    </div>
  );
}
