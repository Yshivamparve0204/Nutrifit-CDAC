import api from "../api/axios";
import { useEffect, useState } from "react";

export default function BmiPage() {
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedBmi, setAnimatedBmi] = useState(0);

  useEffect(() => {
    api.get("/profile")
      .then(res => {
        setP(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🎯 BMI COUNT-UP ANIMATION (jQuery-style)
  useEffect(() => {
    if (!p?.bmi) return;

    let start = 0;
    const end = parseFloat(p.bmi.toFixed(2));
    const duration = 900;
    const stepTime = 15;
    const increment = end / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedBmi(end);
        clearInterval(timer);
      } else {
        setAnimatedBmi(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [p]);

  if (loading)
    return <div className="text-center fw-semibold mt-5">Loading BMI Report...</div>;

  if (!p) {
    return (
      <div className="alert alert-warning text-center mt-5">
        Profile not found. Please complete your profile first.
      </div>
    );
  }

  const bmiColor =
    p.weightCategory === "low" ? "bmi-low"
    : p.weightCategory === "normal" ? "bmi-normal"
    : "bmi-high";

  return (
    <div className="container py-2">

      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">

          <div className="card bmi-card-sm">

            {/* HEADER */}
            <div className="bmi-header-sm">
              📊 BMI REPORT
            </div>

            <div className="card-body py-3">

              {/* BMI CIRCLE */}
              <div className="text-center mb-2">
                <div className={`bmi-circle-sm ${bmiColor}`}>
                  <div>
                    <div className="bmi-value-sm">{animatedBmi.toFixed(2)}</div>
                    <div className="bmi-label-sm">BMI</div>
                  </div>
                </div>

                <span className={`badge mt-2 px-2 py-1 ${
                  p.weightCategory === "low"
                    ? "bg-warning"
                    : p.weightCategory === "normal"
                    ? "bg-success"
                    : "bg-danger"
                }`}>
                  {p.weightCategory?.toUpperCase()}
                </span>
              </div>

              {/* STAT GRID */}
              <div className="row g-2">

                <div className="col-6 col-md-4">
                  <div className="bmi-stat-sm"><span>Age</span><b>{p.age}</b></div>
                </div>

                <div className="col-6 col-md-4">
                  <div className="bmi-stat-sm"><span>Gender</span><b>{p.gender}</b></div>
                </div>

                <div className="col-6 col-md-4">
                  <div className="bmi-stat-sm"><span>Height</span><b>{p.height} cm</b></div>
                </div>

                <div className="col-6 col-md-4">
                  <div className="bmi-stat-sm"><span>Weight</span><b>{p.weight} kg</b></div>
                </div>

                <div className="col-6 col-md-4">
                  <div className="bmi-stat-sm"><span>Activity</span><b>{p.activityLevel}</b></div>
                </div>

                <div className="col-6 col-md-4">
                  <div className="bmi-stat-sm"><span>Goal</span><b>{p.goal}</b></div>
                </div>

                <div className="col-12">
                  <div className="bmi-stat-sm"><span>Food Preference</span><b>{p.foodPreference}</b></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* 🎨 SMALL + ANIMATED BMI UI */}
      {/* ===================== */}
      <style>{`
        .bmi-card-sm {
          border:0;
          border-radius:14px;
          box-shadow:0 4px 14px rgba(0,0,0,.08);
          overflow:hidden;
        }

        .bmi-header-sm {
          background:linear-gradient(45deg,#2563eb,#3b82f6);
          color:white;
          font-weight:700;
          text-align:center;
          padding:8px;
          letter-spacing:1px;
          font-size:14px;
        }

        .bmi-circle-sm {
          width:95px;
          height:95px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          margin:auto;
          animation:pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow:0 0 0 0 rgba(0,0,0,.15); }
          70% { box-shadow:0 0 0 10px rgba(0,0,0,0); }
          100% { box-shadow:0 0 0 0 rgba(0,0,0,0); }
        }

        .bmi-low { background:#fef3c7; color:#92400e; }
        .bmi-normal { background:#dcfce7; color:#065f46; }
        .bmi-high { background:#fee2e2; color:#991b1b; }

        .bmi-value-sm {
          font-size:24px;
          font-weight:800;
          line-height:1;
        }

        .bmi-label-sm {
          font-size:10px;
          letter-spacing:2px;
        }

        .bmi-stat-sm {
          background:#f1f5f9;
          border-radius:10px;
          padding:8px;
          text-align:center;
          height:100%;
        }

        .bmi-stat-sm span {
          display:block;
          font-size:10px;
          color:#6b7280;
        }

        .bmi-stat-sm b {
          font-size:13px;
          color:#111827;
        }
      `}</style>
    </div>
  );
}