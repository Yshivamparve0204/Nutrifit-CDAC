import api from "../api/axios";
import { useEffect, useState } from "react";

export default function AdminHealth() {
  const [list, setList] = useState([]);
  const [hc, setHc] = useState({ name: "", description: "" });

  const load = () => {
    api.get("/admin/health").then(res => setList(res.data));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post("/admin/health", hc);
    setHc({ name: "", description: "" });
    load();
  };

  const del = async (id) => {
    await api.delete("/admin/health/" + id);
    load();
  };

  return (
    <div className="container mt-4">
      <h3>Manage Health Conditions</h3>

      <input className="form-control mb-2" placeholder="Name"
        onChange={e => setHc({ ...hc, name: e.target.value })} />

      <input className="form-control mb-2" placeholder="Description"
        onChange={e => setHc({ ...hc, description: e.target.value })} />

      <button className="btn btn-success mb-3" onClick={save}>Add</button>

      <ul className="list-group">
        {list.map(h => (
          <li key={h.healthConditionId}
              className="list-group-item d-flex justify-content-between">
            {h.name}
            <button className="btn btn-sm btn-danger"
              onClick={() => del(h.healthConditionId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}