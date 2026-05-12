"use client";
import { useRouter } from "next/navigation";
import { logoutServer } from "../actions";
import { useAppStore } from "../store";

export const Header = ({ children }: { children: React.ReactNode }) => {
  const { clearStore, user } = useAppStore();
  const router = useRouter();

  const logOut = async () => {
    clearStore();
    await logoutServer();
    router.push("/");
  };

  const menuItems = [
    { label: "Panel principal", href: "/dashboard" },
    { label: "Usuarios", href: "/dashboard" },
    { label: "Materias", href: "/dashboard" },
    { label: "Inscripciones", href: "/dashboard" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      <div style={{ width: "220px", background: "#0d1f35", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "#185FA5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" /></svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>Plataforma</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Inscripciones</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "1rem 0", flex: 1 }}>
          <div style={{ padding: "4px 12px 8px", fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Menú</div>
          {menuItems.map((item) => (
            <div key={item.label} onClick={() => router.push(item.href)} style={{ padding: "10px 16px", fontSize: "13px", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }}></div>
              {item.label}
            </div>
          ))}
        </div>
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={logOut} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.7)", fontSize: "13px", cursor: "pointer" }}>
            Cerrar sesión
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f5f7fa" }}>
        <div style={{ padding: "1rem 1.5rem", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Panel de control</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 500 }}>
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{user?.nombre || "Usuario"}</div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>{user?.rol || "alumno"}</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
