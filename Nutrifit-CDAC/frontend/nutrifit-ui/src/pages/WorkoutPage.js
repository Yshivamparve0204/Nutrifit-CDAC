import api from "../api/axios";
import { useEffect, useState } from "react";

export default function WorkoutPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/workout/weekly-plan")
      .then(res => {
        setList(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getBadge = (intensity) => {
    const i = intensity.toLowerCase();
    if (i === "low") return "bg-success";
    if (i === "moderate") return "bg-warning text-dark";
    return "bg-danger";
  };

  if (loading)
    return (
      <div className="text-center fw-bold mt-4">
        ⏳ Loading your workout plan...
      </div>
    );

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">

        <div className="card shadow border-0">
          <div className="card-header bg-warning fw-bold text-center fs-5">
            💪 Your Weekly Workout Plan (Mon – Sat)
          </div>

          <div className="card-body">

            {list.length === 0 && (
              <div className="alert alert-info text-center fw-semibold">
                No workout plan matched your profile yet.
                <br />
                Please update your profile and health conditions.
              </div>
            )}

            {list.map((w, i) => (
              <div key={i} className="card mb-3 border-start border-4 border-warning shadow-sm">
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold text-primary mb-0">📅 {w.dayName}</h5>
                    <span className={`badge ${getBadge(w.intensity)}`}>
                      {w.intensity.toUpperCase()}
                    </span>
                  </div>

                  <h6 className="fw-bold">{w.workoutName}</h6>

                  <div className="row mt-2">
                    <div className="col-md-4">🏃 Type: {w.workoutType}</div>
                    <div className="col-md-4">⏱ Time: {w.durationMinutes} min</div>
                    <div className="col-md-4">🔥 Intensity: {w.intensity}</div>
                  </div>

                  <div className="mt-2 small text-muted">
                    🛡 Health note: {w.healthSafe}
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}