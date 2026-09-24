import api from "../api/axios";
import { useEffect, useState } from "react";

export default function UserHealth() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api.get("/user/health/all").then(res => setList(res.data));
    api.get("/user/health").then(res => setSelected(res.data));
  }, []);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    await api.post("/user/health", selected);
    alert("✅ Health conditions saved successfully");
  };

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">

          <div className="card health-main-card">

            <div className="health-header">
              ❤️ Select Your Health Conditions
            </div>

            <div className="card-body">

              <p className="text-muted text-center mb-3">
                Choose conditions so we can generate safe workout & diet plans.
              </p>

              {/* HEALTH GRID */}
              <div className="row g-2 mb-3">

                {list.map(h => {
                  const isActive = selected.includes(h.healthConditionId);
                  return (
                    <div key={h.healthConditionId} className="col-md-4 col-6">
                      <div
                        className={`health-tile ${isActive ? "active" : ""}`}
                        onClick={() => toggle(h.healthConditionId)}
                      >
                        <div className="health-icon">
                          {isActive ? "✅" : "🩺"}
                        </div>
                        <div className="health-name">{h.name}</div>
                        <div className="health-check">
                          <input
                            type="checkbox"
                            checked={isActive}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* NO DISEASE UI */}
              {selected.length === 0 && (
                <div className="healthy-box-user mb-3">
                  💚 You have not selected any health condition
                </div>
              )}

              <button className="btn btn-success w-100 fw-semibold" onClick={save}>
                💾 Save Health Conditions
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* 🎨 CORPORATE HEALTH UI */}
      {/* ===================== */}
      <style>{`
        .health-main-card {
          border:0;
          border-radius:18px;
          box-shadow:0 6px 20px rgba(0,0,0,.08);
          overflow:hidden;
        }

        .health-header {
          background:linear-gradient(45deg,#dc2626,#ef4444);
          color:white;
          font-weight:700;
          text-align:center;
          padding:12px;
          letter-spacing:.5px;
        }

        .health-tile {
          background:white;
          border-radius:14px;
          padding:14px 10px;
          text-align:center;
          cursor:pointer;
          border:2px solid #e5e7eb;
          transition:.2s;
          height:100%;
          position:relative;
        }

        .health-tile:hover {
          transform:translateY(-2px);
          box-shadow:0 4px 12px rgba(0,0,0,.1);
        }

        .health-tile.active {
          border-color:#dc2626;
          background:#fee2e2;
        }

        .health-icon {
          font-size:28px;
          margin-bottom:6px;
        }

        .health-name {
          font-weight:700;
          color:#111827;
          font-size:14px;
        }

        .health-check {
          position:absolute;
          top:8px;
          right:10px;
        }

        .health-check input {
          accent-color:#dc2626;
          transform:scale(1.1);
        }

        .healthy-box-user {
          background:#ecfdf5;
          border-radius:12px;
          padding:10px;
          text-align:center;
          font-weight:600;
          color:#065f46;
        }
      `}</style>
    </div>
  );
}