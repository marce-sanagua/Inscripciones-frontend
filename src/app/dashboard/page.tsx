"use client";
import { useEffect, useState } from "react";

type Usuario = {
  id: number;
  nombre: string;
};

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://users-api-rmm5.onrender.com/usuarios")
      .then(res => res.json())
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Panel principal</h1>
      <h2 className="dashboard-subtitle">Usuarios registrados</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="dashboard-grid">
          {usuarios.map((u) => (
            <div key={u.id} className="dashboard-card">
              <div className="dashboard-avatar">
                {u.nombre ? u.nombre.charAt(0) : "?"}
              </div>
              <div>
                <div className="dashboard-name">{u.nombre || "Sin nombre"}</div>
                <div className="dashboard-id">ID: {u.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}