"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/src/store";
import { useRouter } from "next/navigation";
import { authHeaders, USERS_API, ACADEMIC_API } from "@/src/lib/api";
import "./inscripciones.css";

type Materia = { id: number; nombre: string; profesor_id: number | null };
type Alumno = { id: number; nombre: string; email?: string };
type Usuario = { id: number; nombre: string; rol?: string };

export default function PageInscripciones() {
  const { user } = useAppStore();
  const router = useRouter();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandida, setExpandida] = useState<number | null>(null);
  const [alumnosPorMateria, setAlumnosPorMateria] = useState<Record<number, Alumno[]>>({});
  const [cargandoAlumnos, setCargandoAlumnos] = useState<number | null>(null);

  useEffect(() => {
    if (user?.rol !== "admin") { router.push("/dashboard"); return; }
    const fetchData = async () => {
      const [materiasRes, usersRes] = await Promise.allSettled([
        fetch(`${ACADEMIC_API}/materias`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${USERS_API}/usuarios`, { headers: authHeaders() }).then(r => r.json()),
      ]);
      if (materiasRes.status === "fulfilled" && Array.isArray(materiasRes.value)) setMaterias(materiasRes.value);
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) setUsuarios(usersRes.value);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleMateria = async (materiaId: number) => {
    if (expandida === materiaId) { setExpandida(null); return; }
    setExpandida(materiaId);
    if (alumnosPorMateria[materiaId] !== undefined) return;
    setCargandoAlumnos(materiaId);
    try {
      const res = await fetch(`${ACADEMIC_API}/inscripciones/materias/${materiaId}/alumnos`, { headers: authHeaders() });
      const data = await res.json();
      const ids: number[] = Array.isArray(data) ? data.map((d: { user_id: number }) => d.user_id) : [];
      const alumnos = ids
        .map(id => usuarios.find(u => u.id === id))
        .filter((u): u is Usuario => !!u && u.rol === "alumno")
        .map(u => ({ id: u.id, nombre: u.nombre }));
      setAlumnosPorMateria(prev => ({ ...prev, [materiaId]: alumnos }));
    } catch {
      setAlumnosPorMateria(prev => ({ ...prev, [materiaId]: [] }));
    } finally {
      setCargandoAlumnos(null);
    }
  };

  const nombreProfesor = (id: number | null) =>
    id ? (usuarios.find(u => u.id === id)?.nombre ?? `ID: ${id}`) : "Sin asignar";

  return (
    <div className="inscripciones-container">
      <div className="inscripciones-header">
        <h1 className="inscripciones-title">Inscripciones</h1>
        <p className="inscripciones-subtitle">Alumnos inscriptos por materia</p>
      </div>

      <div className="inscripciones-card">
        <div className="inscripciones-card-header">
          <h2 className="inscripciones-card-title">Materias</h2>
        </div>
        {loading ? (
          <div className="inscripciones-loading">Cargando...</div>
        ) : materias.length === 0 ? (
          <div className="inscripciones-empty">No hay materias cargadas</div>
        ) : materias.map(m => (
          <div key={m.id}>
            <div onClick={() => toggleMateria(m.id)} className="materia-row">
              <div className="materia-info">
                <div className="materia-nombre">
                  {m.nombre}
                  {alumnosPorMateria[m.id] !== undefined && (
                    <span style={{ marginLeft: "8px", fontSize: "13px", color: "#6b7280" }}>
                      ({alumnosPorMateria[m.id].length})
                    </span>
                  )}
                </div>
                <div className="materia-profesor">Profesor: {nombreProfesor(m.profesor_id)}</div>
              </div>
              <div className="materia-actions">
                <span className="materia-icon">{expandida === m.id ? "▲" : "▼"}</span>
              </div>
            </div>
            {expandida === m.id && (
              <div className="materia-expanded">
                {cargandoAlumnos === m.id ? (
                  <div className="alumnos-loading">Cargando alumnos...</div>
                ) : alumnosPorMateria[m.id]?.length === 0 ? (
                  <div className="alumnos-empty">Sin alumnos inscriptos</div>
                ) : (
                  <div className="alumnos-list">
                    {alumnosPorMateria[m.id]?.map(a => (
                      <div key={a.id} className="alumno-row">
                        <div className="alumno-avatar">{a.nombre.charAt(0).toUpperCase()}</div>
                        {a.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}