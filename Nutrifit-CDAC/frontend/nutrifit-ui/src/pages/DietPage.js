import api from "../api/axios";
import { useEffect, useState } from "react";

export default function DietPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/diet/daily-plan")
      .then(res => {
        setList(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const mealOrder = {
    breakfast: 1,
    snack: 2,
    lunch: 3,
    snack2: 4,
    dinner: 5
  };

  if (loading) {
    return (
      <div className="text-center fw-bold mt-4">
        ⏳ Loading your diet plan...
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-3">
      <div className="col-md-10">

        <div className="card shadow border-0">
          <div className="card-header bg-success text-white fw-bold text-center fs-5">
            🥗 Your Daily Diet Plan
          </div>

          <div className="card-body">

            {list.length === 0 && (
              <div className="alert alert-info text-center fw-semibold">
                No diet plan matched your profile yet.
                <br />
                Please update your profile and health conditions.
              </div>
            )}

            {[...list]
              .sort((a, b) => mealOrder[a.mealType] - mealOrder[b.mealType])
              .map((d, i) => (
                <div key={i} className="card mb-3 border-start border-4 border-success shadow-sm">
                  <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="fw-bold text-success text-capitalize mb-0">
                        🍽 {d.mealType}
                      </h5>
                      <span className="badge bg-success-subtle text-success">
                        {d.calories} kcal
                      </span>
                    </div>

                    <h6 className="fw-bold">{d.foodName}</h6>

                    <div className="row mt-2 small">
                      <div className="col-md-3">🥩 Protein: {d.protein} g</div>
                      <div className="col-md-3">🍚 Carbs: {d.carbs} g</div>
                      <div className="col-md-3">🥑 Fat: {d.fat} g</div>
                      <div className="col-md-3">🧂 Sodium: {d.sodiumContent} mg</div>
                    </div>

                    <div className="small text-muted mt-2">
                      GI Level: {d.glycemicIndex}
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