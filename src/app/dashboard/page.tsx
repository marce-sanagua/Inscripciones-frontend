"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState([]);
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
    <div style={{ padding: "2rem", fontFamily: "Poppins, sans-serif", background: "linear-gradient(135deg, #0d1f35, #1a3a5c)", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "1.5rem" }}>Panel principal</h1>
      <h2 style={{ fontSize: "16px", marginBottom: "1rem", opacity: 0.7 }}>Usuarios registrados</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {usuarios.map((u: any) => (
            <div key={u.id} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                {u.nombre ? u.nombre.charAt(0) : "?"}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{u.nombre || "Sin nombre"}</div>
                <div style={{ fontSize: "12px", opacity: 0.5 }}>ID: {u.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}