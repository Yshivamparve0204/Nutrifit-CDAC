import { useEffect, useState } from "react";
import api from "../api/axios";

export default function GoalPage() {
  const [goalType, setGoalType] = useState("weight_loss");
  const [targetValue, setTargetValue] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goal, setGoal] = useState(null);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    loadGoal();
    loadLatestProgress();
  }, []);

  const loadGoal = async () => {
    const res = await api.get("/goals/my");
    setGoal(res.data);
  };

  const loadLatestProgress = async () => {
    const res = await api.get("/progress/latest");
    setLatest(res.data);
  };

  const setGoalHandler = async () => {
    // Validate that selected date is today or in the future
    const today = new Date().toISOString().split("T")[0];
    if (endDate < today) {
      alert("⚠ Please select a valid date (today or future date only).");
      return;
    }

    await api.post("/goals/set", {
      goalType,
      targetValue,
      endDate
    });

    alert("Goal set successfully");
    loadGoal();
  };

  const resetAllHandler = async () => {
    if (!window.confirm("This will delete all your goal and progress history. Continue?"))
      return;

    await api.delete("/goals/reset");
    setGoal(null);
    setLatest(null);
    alert("All data cleared. You can start fresh.");
  };

  // Today's date in YYYY-MM-DD format for min attribute
  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="container py-3">

      <h4 className="fw-bold mb-3 text-primary">🎯 My Goal</h4>

      <div className="row g-3 align-items-stretch">

        {/* SET GOAL */}
        <div className="col-xl-4">
          <div className="card goal-form-card h-100">
            <div className="goal-header">🎯 Set Your Goal</div>

            <div className="card-body d-flex flex-column justify-content-between">

              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Goal Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={goalType}
                    onChange={e => setGoalType(e.target.value)}
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fitness">Stay Fit</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Target Weight</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Enter target weight"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Target Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={todayDate} // Prevent past date selection
                  />
                </div>
              </div>

              <button
                className="btn btn-primary fw-bold goal-btn mt-auto"
                onClick={setGoalHandler}
              >
                🎯 Set / Update Goal
              </button>
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="col-xl-8">

          {/* CURRENT GOAL */}
          {goal && (
            <div className="card goal-corporate-card mb-3">
              <div className="goal-header-success">📌 Current Goal</div>

              <div className="card-body">
                <div className="row g-3 align-items-stretch">

                  <div className="col-md-4">
                    <div className="goal-kpi">
                      <span>Goal Type</span>
                      <h5>{goal.goalType}</h5>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="goal-kpi">
                      <span>Target Weight</span>
                      <h4>{goal.targetValue} kg</h4>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="goal-kpi">
                      <span>Status</span>
                      <h5>
                        <span className={`badge px-3 py-2 ${
                          goal.status === "completed"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}>
                          {goal.status}
                        </span>
                      </h5>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* BODY STATUS */}
          {latest && (
            <div className="card goal-corporate-card">
              <div className="goal-header-info">📊 Current Body Status</div>

              <div className="card-body">
                <div className="row g-3 align-items-stretch">

                  <div className="col-md-3 col-6">
                    <div className="body-kpi">
                      <span>Weight</span>
                      <h5>{latest.weight} kg</h5>
                    </div>
                  </div>

                  <div className="col-md-3 col-6">
                    <div className="body-kpi">
                      <span>BMI</span>
                      <h5>{latest.bmi}</h5>
                    </div>
                  </div>

                  <div className="col-md-3 col-6">
                    <div className="body-kpi">
                      <span>Category</span>
                      <h6>{latest.weightCategory}</h6>
                    </div>
                  </div>

                  <div className="col-md-3 col-6">
                    <div className="body-kpi">
                      <span>Last Update</span>
                      <h6>{latest.date.split("T")[0]}</h6>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RESET ZONE */}
      <div className="danger-zone mt-4">
        <div className="danger-box">
          <div>
            <h6 className="fw-bold mb-1 text-danger">⚠ Danger Zone</h6>
            <small className="text-muted">
              Resetting will permanently remove all your goal and progress history.
            </small>
          </div>

          <button
            className="btn btn-outline-danger fw-bold px-4"
            onClick={resetAllHandler}
          >
            ❌ Reset All Data
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* 🎨 ENTERPRISE GOAL UI */}
      {/* ===================== */}
      <style>{`
        .goal-form-card, .goal-corporate-card {
          border:0;
          border-radius:18px;
          box-shadow:0 8px 22px rgba(0,0,0,.08);
          overflow:hidden;
        }

        .goal-header {
          background:linear-gradient(45deg,#2563eb,#3b82f6);
          color:white;
          font-weight:700;
          padding:14px;
          text-align:center;
        }

        .goal-header-success {
          background:linear-gradient(45deg,#059669,#10b981);
          color:white;
          font-weight:700;
          padding:12px 14px;
        }

        .goal-header-info {
          background:linear-gradient(45deg,#0891b2,#06b6d4);
          color:white;
          font-weight:700;
          padding:12px 14px;
        }

        .goal-btn {
          padding:10px;
          border-radius:12px;
          font-size:14px;
        }

        .goal-kpi {
          background:#f8fafc;
          border-radius:16px;
          padding:22px 14px;
          text-align:center;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:center;
        }

        .goal-kpi span {
          font-size:11px;
          color:#6b7280;
          letter-spacing:.5px;
        }

        .goal-kpi h4, .goal-kpi h5 {
          margin:6px 0 0;
          font-weight:700;
          color:#111827;
        }

        .body-kpi {
          background:#f1f5f9;
          border-radius:16px;
          padding:22px 10px;
          text-align:center;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:center;
        }

        .body-kpi span {
          font-size:11px;
          color:#6b7280;
        }

        .body-kpi h5, .body-kpi h6 {
          margin:6px 0 0;
          font-weight:700;
          color:#111827;
        }

        .danger-zone {
          margin-top:10px;
        }

        .danger-box {
          background:#fef2f2;
          border:1px solid #fecaca;
          border-radius:16px;
          padding:14px 16px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          box-shadow:0 4px 12px rgba(0,0,0,.05);
        }
      `}</style>
    </div>
  );
}
