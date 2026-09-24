import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import $ from "jquery";
import Chart from "chart.js/auto";

export default function ProgressPage() {
  const [weight, setWeight] = useState("");
  const [latest, setLatest] = useState(null);

  const chartRef = useRef(null);   // ✅ store chart instance safely

  const loadLatest = useCallback(async () => {
    const res = await api.get("/progress/latest");
    setLatest(res.data);
  }, []);

  const loadGraph = useCallback(async () => {
    const res = await api.get("/progress/my");
    const data = res.data;
    if (!data || data.length === 0) return;

    const labels = data.map(x => x.date.split("T")[0]);
    const weights = data.map(x => x.weight);
    const bmis = data.map(x => x.bmi);

    // ✅ always destroy old chart first
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    $("#graphPanel").hide().fadeIn(700);

    const ctx = document.getElementById("progressChart");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Weight (kg)",
            data: weights,
            tension: 0.4,
            borderWidth: 3
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
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }, []);

  useEffect(() => {
    loadLatest();
    loadGraph();
  }, [loadLatest, loadGraph]);

  const saveProgress = async () => {
    if (!weight) return alert("Enter weight");

    await api.post("/progress/add?weight=" + weight);
    setWeight("");

    loadLatest();
    loadGraph();

    $(".kpi-card").addClass("pulse");
    setTimeout(() => $(".kpi-card").removeClass("pulse"), 600);
  };

  return (
    <div className="container py-3">

      <h4 className="fw-bold mb-3 text-primary">📈 Progress Tracker</h4>

      {/* ===== ROW 1 ===== */}
      <div className="row g-3 align-items-stretch mb-3">

        {/* PROGRESS TRACKER – 60% */}
        {latest && (
          <div className="col-lg-7">
            <div className="card corporate-card h-100 small-top-card">
              <div className="card-header corporate-header-info py-2">
                📊 Progress Tracker
              </div>

              <div className="card-body d-flex align-items-center py-3">
                <div className="row g-2 w-100">

                  <div className="col-md-3 col-6">
                    <div className="kpi-card">
                      <span>Weight</span>
                      <h5>{latest.weight} kg</h5>
                    </div>
                  </div>

                  <div className="col-md-3 col-6">
                    <div className="kpi-card">
                      <span>BMI</span>
                      <h5>{latest.bmi}</h5>
                    </div>
                  </div>

                  <div className="col-md-3 col-6">
                    <div className="kpi-card">
                      <span>Category</span>
                      <h6>{latest.weightCategory}</h6>
                    </div>
                  </div>

                  <div className="col-md-3 col-6">
                    <div className="kpi-card">
                      <span>Last Update</span>
                      <h6>{latest.date.split("T")[0]}</h6>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD PROGRESS – 40% */}
        <div className="col-lg-5">
          <div className="card corporate-card h-100 small-top-card">
            <div className="card-header corporate-header-primary py-2">
              ➕ Add Today’s Progress
            </div>

            <div className="card-body d-flex flex-column justify-content-center py-3">

              <label className="form-label fw-semibold small">
                Today’s Weight
              </label>

              <div className="input-group mb-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <button
                  className="btn btn-primary fw-bold px-4"
                  onClick={saveProgress}
                >
                  Save
                </button>
              </div>

              <small className="text-muted">
                Daily updates improve plan accuracy.
              </small>

            </div>
          </div>
        </div>

      </div>

      {/* ===== ROW 2: GRAPH ===== */}
      <div className="row">
        <div className="col-12">
          <div className="card corporate-card" id="graphPanel">
            <div className="card-header corporate-header-dark py-2">
              📈 Weight & BMI Progress Analytics
            </div>
            <div className="card-body" style={{ height: 360 }}>
              <canvas id="progressChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* 🎨 CORPORATE PROGRESS UI */}
      {/* ===================== */}
      <style>{`
        .corporate-card {
          border:0;
          border-radius:18px;
          box-shadow:0 6px 22px rgba(0,0,0,.08);
          overflow:hidden;
        }

        .small-top-card {
          min-height:170px;
        }

        .corporate-header-primary {
          background:linear-gradient(45deg,#2563eb,#3b82f6);
          color:white;
          font-weight:700;
        }

        .corporate-header-info {
          background:linear-gradient(45deg,#0891b2,#06b6d4);
          color:white;
          font-weight:700;
        }

        .corporate-header-dark {
          background:#0f172a;
          color:white;
          font-weight:700;
        }

        .kpi-card {
          background:#f1f5f9;
          border-radius:14px;
          padding:14px 8px;
          text-align:center;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:center;
          box-shadow:0 3px 10px rgba(0,0,0,.05);
        }

        .kpi-card span {
          font-size:11px;
          color:#6b7280;
        }

        .kpi-card h5,
        .kpi-card h6 {
          margin-top:4px;
          font-weight:800;
          color:#111827;
        }

        .pulse {
          animation:pulseAnim .6s;
        }

        @keyframes pulseAnim {
          0% { transform:scale(1); }
          50% { transform:scale(1.04); }
          100% { transform:scale(1); }
        }
      `}</style>
    </div>
  );
}