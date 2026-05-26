"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/src/store";
import { toast } from "sonner";
import styles from "./materia.module.css";

type Material = { id: number; titulo: string; descripcion?: string; link?: string; tipo: string; created_at: string };
type Tarea = { id: number; titulo: string; descripcion?: string; fecha_entrega?: string; total_entregas: number; created_at: string };
type Calificacion = { id: number; user_id: number; nota: number; comentario?: string };
type Materia = { id: number; nombre: string; profesor_id: number | null };
type Usuario = { id: number; nombre: string; rol?: string; email?: string };

const ACADEMIC_API = "http://localhost:4000";
const USERS_API = "http://localhost:3001";

export default function DetalleMateria() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppStore();
  const router = useRouter();

  const [tab, setTab] = useState<"materiales" | "tareas" | "calificaciones">("materiales");
  const [materia, setMateria] = useState<Materia | null>(null);
  const [profesor, setProfesor] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alumnos, setAlumnos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // materiales
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [mostrarFormMat, setMostrarFormMat] = useState(false);
  const [guardandoMat, setGuardandoMat] = useState(false);
  const [formMat, setFormMat] = useState({ titulo: "", descripcion: "", link: "", tipo: "aviso" });
  const [eliminandoMat, setEliminandoMat] = useState<number | null>(null);

  // tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [guardandoTarea, setGuardandoTarea] = useState(false);
  const [formTarea, setFormTarea] = useState({ titulo: "", descripcion: "", fecha_entrega: "" });
  const [eliminandoTarea, setEliminandoTarea] = useState<number | null>(null);
  const [entregadas, setEntregadas] = useState<number[]>([]);
  const [marcando, setMarcando] = useState<number | null>(null);
  const [entregasPorTarea, setEntregasPorTarea] = useState<Record<number, number[]>>({});

  // calificaciones
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [notaForm, setNotaForm] = useState<Record<number, { nota: string; comentario: string }>>({});
  const [guardandoNota, setGuardandoNota] = useState<number | null>(null);

  const esProfesor = user?.rol === "profesor";
  const esAdmin = user?.rol === "admin";
  const esAlumno = !esProfesor && !esAdmin;
  const puedeEditar = esProfesor || esAdmin;

  useEffect(() => {
    const fetchData = async () => {
      const [materiaRes, materialesRes, usersRes, inscRes, tareasRes, califRes] = await Promise.allSettled([
        fetch(`${ACADEMIC_API}/materias/${id}`).then(r => r.json()),
        fetch(`${ACADEMIC_API}/materias/${id}/materiales`).then(r => r.json()),
        fetch(`${USERS_API}/usuarios`).then(r => r.json()),
        fetch(`${ACADEMIC_API}/inscripciones/materias/${id}/alumnos`).then(r => r.json()),
        fetch(`${ACADEMIC_API}/materias/${id}/tareas`).then(r => r.json()),
        fetch(`${ACADEMIC_API}/materias/${id}/calificaciones`).then(r => r.json()),
      ]);

      if (materiaRes.status === "fulfilled" && materiaRes.value?.id) {
        setMateria(materiaRes.value);
        if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
          const us: Usuario[] = usersRes.value;
          setUsuarios(us);
          const prof = us.find(u => u.id === materiaRes.value.profesor_id);
          if (prof) setProfesor(prof.nombre);
        }
      }
      if (materialesRes.status === "fulfilled" && Array.isArray(materialesRes.value)) setMateriales(materialesRes.value);
      if (inscRes.status === "fulfilled" && Array.isArray(inscRes.value)) setAlumnos(inscRes.value.map((i: { user_id: number }) => i.user_id));
      if (tareasRes.status === "fulfilled" && Array.isArray(tareasRes.value)) setTareas(tareasRes.value);
      if (califRes.status === "fulfilled" && Array.isArray(califRes.value)) setCalificaciones(califRes.value);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!esAlumno || !user?.id || tareas.length === 0) return;
    fetch(`${ACADEMIC_API}/materias/${id}/tareas/usuario/${user.id}/entregas`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEntregadas(data); })
      .catch(() => null);
  }, [tareas, esAlumno, user?.id]);

  // ── MATERIALES ──────────────────────────────────────────

  const publicarMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoMat(true);
    try {
      const res = await fetch(`${ACADEMIC_API}/materias/${id}/materiales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formMat),
      });
      const data = await res.json();
      if (!res.ok) { toast.warning(data.message || "Error"); return; }
      toast.success("Material publicado");
      setMateriales(prev => [{ id: data.id, ...formMat, created_at: new Date().toISOString() }, ...prev]);
      setFormMat({ titulo: "", descripcion: "", link: "", tipo: "aviso" });
      setMostrarFormMat(false);
    } catch { toast.warning("Error al conectar"); }
    finally { setGuardandoMat(false); }
  };

  const eliminarMaterial = async (matId: number) => {
    if (!confirm("¿Eliminar este material?")) return;
    setEliminandoMat(matId);
    try {
      await fetch(`${ACADEMIC_API}/materias/${id}/materiales/${matId}`, { method: "DELETE" });
      setMateriales(prev => prev.filter(m => m.id !== matId));
      toast.success("Eliminado");
    } catch { toast.warning("Error"); }
    finally { setEliminandoMat(null); }
  };

  // ── TAREAS ───────────────────────────────────────────────

  const crearTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoTarea(true);
    try {
      const res = await fetch(`${ACADEMIC_API}/materias/${id}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formTarea),
      });
      const data = await res.json();
      if (!res.ok) { toast.warning(data.message || "Error"); return; }
      toast.success("Tarea creada");
      setTareas(prev => [...prev, { id: data.id, ...formTarea, total_entregas: 0, created_at: new Date().toISOString() }]);
      setFormTarea({ titulo: "", descripcion: "", fecha_entrega: "" });
      setMostrarFormTarea(false);
    } catch { toast.warning("Error al conectar"); }
    finally { setGuardandoTarea(false); }
  };

  const eliminarTarea = async (tareaId: number) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    setEliminandoTarea(tareaId);
    try {
      await fetch(`${ACADEMIC_API}/materias/${id}/tareas/${tareaId}`, { method: "DELETE" });
      setTareas(prev => prev.filter(t => t.id !== tareaId));
      toast.success("Tarea eliminada");
    } catch { toast.warning("Error"); }
    finally { setEliminandoTarea(null); }
  };

  const toggleEntrega = async (tareaId: number) => {
    const yaEntrego = entregadas.includes(tareaId);
    setMarcando(tareaId);
    const endpoint = yaEntrego ? "desentregar" : "entregar";
    try {
      await fetch(`${ACADEMIC_API}/materias/${id}/tareas/${tareaId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user?.id }),
      });
      setEntregadas(prev => yaEntrego ? prev.filter(t => t !== tareaId) : [...prev, tareaId]);
      toast.success(yaEntrego ? "Marcada como pendiente" : "¡Tarea entregada!");
    } catch { toast.warning("Error"); }
    finally { setMarcando(null); }
  };

  const cargarEntregasTarea = async (tareaId: number) => {
    if (entregasPorTarea[tareaId] !== undefined) return;
    try {
      const res = await fetch(`${ACADEMIC_API}/materias/${id}/tareas/${tareaId}/entregas`);
      const data = await res.json();
      setEntregasPorTarea(prev => ({ ...prev, [tareaId]: Array.isArray(data) ? data.map((e: { user_id: number }) => e.user_id) : [] }));
    } catch { setEntregasPorTarea(prev => ({ ...prev, [tareaId]: [] })); }
  };

  // ── CALIFICACIONES ───────────────────────────────────────

  const guardarNota = async (alumnoId: number) => {
    const { nota, comentario } = notaForm[alumnoId] ?? {};
    if (!nota) { toast.warning("Ingresá una nota"); return; }
    setGuardandoNota(alumnoId);
    try {
      const res = await fetch(`${ACADEMIC_API}/materias/${id}/calificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: alumnoId, nota: Number(nota), comentario }),
      });
      if (!res.ok) { toast.warning("Error al guardar"); return; }
      toast.success("Nota guardada");
      setCalificaciones(prev => {
        const existe = prev.find(c => c.user_id === alumnoId);
        if (existe) return prev.map(c => c.user_id === alumnoId ? { ...c, nota: Number(nota), comentario } : c);
        return [...prev, { id: Date.now(), user_id: alumnoId, nota: Number(nota), comentario }];
      });
      setNotaForm(prev => ({ ...prev, [alumnoId]: { nota: "", comentario: "" } }));
    } catch { toast.warning("Error al conectar"); }
    finally { setGuardandoNota(null); }
  };

  const getNota = (alumnoId: number) => calificaciones.find(c => c.user_id === alumnoId);
  const miNota = calificaciones.find(c => c.user_id === user?.id);
  const nombreAlumno = (uid: number) => usuarios.find(u => u.id === uid)?.nombre ?? `ID: ${uid}`;

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!materia) return <div className={styles.loading}>Materia no encontrada</div>;

  return (
    <div className={styles.container}>
      <button type="button" onClick={() => router.back()} className={styles.backBtn}>← Volver</button>

      <div className={styles.header}>
        <div className={styles.headerIcon}>{materia.nombre.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className={styles.title}>{materia.nombre}</h1>
          {profesor && <p className={styles.subtitle}>Profesor/a: {profesor}</p>}
          {esAlumno && (
            <p className={styles.subtitle}>
              {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} inscripto{alumnos.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        {(["materiales", "tareas", "calificaciones"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}>
            {t === "materiales" ? "📋 Materiales" : t === "tareas" ? "📝 Tareas" : "🎯 Calificaciones"}
          </button>
        ))}
      </div>

      {/* ── TAB MATERIALES ── */}
      {tab === "materiales" && (
        <div>
          {puedeEditar && (
            <div className={styles.publishArea}>
              {!mostrarFormMat ? (
                <button type="button" onClick={() => setMostrarFormMat(true)} className={styles.btnPublish}>+ Publicar material</button>
              ) : (
                <form onSubmit={publicarMaterial} className={styles.form}>
                  <h3 className={styles.formTitle}>Nuevo material</h3>
                  <div className={styles.formRow}>
                    <select aria-label="Tipo" value={formMat.tipo} onChange={e => setFormMat(p => ({ ...p, tipo: e.target.value }))} className={styles.select}>
                      <option value="aviso">📢 Aviso</option>
                      <option value="link">🔗 Link</option>
                    </select>
                    <input type="text" placeholder="Título *" value={formMat.titulo} onChange={e => setFormMat(p => ({ ...p, titulo: e.target.value }))} required className={styles.input} />
                  </div>
                  <textarea placeholder="Descripción (opcional)" value={formMat.descripcion} onChange={e => setFormMat(p => ({ ...p, descripcion: e.target.value }))} className={styles.textarea} rows={3} />
                  {formMat.tipo === "link" && (
                    <input type="url" placeholder="https://..." value={formMat.link} onChange={e => setFormMat(p => ({ ...p, link: e.target.value }))} className={styles.input} />
                  )}
                  <div className={styles.formActions}>
                    <button type="submit" disabled={guardandoMat} className={styles.btnSave}>{guardandoMat ? "Publicando..." : "Publicar"}</button>
                    <button type="button" onClick={() => setMostrarFormMat(false)} className={styles.btnCancel}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          )}
          <div className={styles.feed}>
            <h2 className={styles.feedTitle}>Materiales</h2>
            {materiales.length === 0 ? (
              <div className={styles.empty}>{puedeEditar ? "Usá el botón de arriba para publicar materiales." : "El profesor todavía no publicó materiales."}</div>
            ) : materiales.map(m => (
              <div key={m.id} className={`${styles.card} ${m.tipo === "link" ? styles.cardLink : styles.cardAviso}`}>
                <div className={styles.cardTop}>
                  <span className={styles.cardBadge}>{m.tipo === "link" ? "🔗 Link" : "📢 Aviso"}</span>
                  <span className={styles.cardDate}>{new Date(m.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <h3 className={styles.cardTitle}>{m.titulo}</h3>
                {m.descripcion && <p className={styles.cardDesc}>{m.descripcion}</p>}
                {m.link && <a href={m.link} target="_blank" rel="noopener noreferrer" className={styles.cardLinkBtn}>Abrir enlace →</a>}
                {puedeEditar && (
                  <button type="button" onClick={() => eliminarMaterial(m.id)} disabled={eliminandoMat === m.id} className={styles.btnDelete}>
                    {eliminandoMat === m.id ? "..." : "Eliminar"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB TAREAS ── */}
      {tab === "tareas" && (
        <div>
          {puedeEditar && (
            <div className={styles.publishArea}>
              {!mostrarFormTarea ? (
                <button type="button" onClick={() => setMostrarFormTarea(true)} className={styles.btnPublish}>+ Nueva tarea</button>
              ) : (
                <form onSubmit={crearTarea} className={styles.form}>
                  <h3 className={styles.formTitle}>Nueva tarea</h3>
                  <input type="text" placeholder="Título *" value={formTarea.titulo} onChange={e => setFormTarea(p => ({ ...p, titulo: e.target.value }))} required className={styles.inputMb} />
                  <textarea placeholder="Descripción (opcional)" value={formTarea.descripcion} onChange={e => setFormTarea(p => ({ ...p, descripcion: e.target.value }))} className={styles.textarea} rows={3} />
                  <div className={styles.formRow}>
                    <label className={styles.dateLabel}>Fecha de entrega:</label>
                    <input type="date" aria-label="Fecha de entrega" value={formTarea.fecha_entrega} onChange={e => setFormTarea(p => ({ ...p, fecha_entrega: e.target.value }))} className={styles.input} />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" disabled={guardandoTarea} className={styles.btnSave}>{guardandoTarea ? "Creando..." : "Crear tarea"}</button>
                    <button type="button" onClick={() => setMostrarFormTarea(false)} className={styles.btnCancel}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          )}
          <div className={styles.feed}>
            <h2 className={styles.feedTitle}>Tareas</h2>
            {tareas.length === 0 ? (
              <div className={styles.empty}>{puedeEditar ? "Usá el botón de arriba para crear tareas." : "No hay tareas asignadas todavía."}</div>
            ) : tareas.map(t => {
              const entrego = entregadas.includes(t.id);
              const vencida = t.fecha_entrega ? new Date(t.fecha_entrega) < new Date() : false;
              return (
                <div key={t.id} className={`${styles.card} ${styles.cardTarea} ${vencida && !entrego && esAlumno ? styles.cardVencida : ""}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardBadge}>📝 Tarea</span>
                    <div className={styles.cardTopRight}>
                      {t.fecha_entrega && (
                        <span className={`${styles.fechaChip} ${vencida ? styles.fechaVencida : styles.fechaOk}`}>
                          Entrega: {new Date(t.fecha_entrega + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      {puedeEditar && (
                        <span className={styles.cardDate}>{t.total_entregas} entrega{t.total_entregas !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <h3 className={styles.cardTitle}>{t.titulo}</h3>
                  {t.descripcion && <p className={styles.cardDesc}>{t.descripcion}</p>}

                  {esAlumno && (
                    <button type="button" onClick={() => toggleEntrega(t.id)} disabled={marcando === t.id} className={entrego ? styles.btnEntregada : styles.btnEntregar}>
                      {marcando === t.id ? "..." : entrego ? "✓ Entregada" : "Marcar como entregada"}
                    </button>
                  )}

                  {puedeEditar && (
                    <div className={styles.cardActions}>
                      <button type="button" onClick={() => { cargarEntregasTarea(t.id); }} className={styles.btnVerEntregas}>
                        Ver quién entregó
                      </button>
                      {entregasPorTarea[t.id] !== undefined && (
                        <div className={styles.entregasList}>
                          {entregasPorTarea[t.id].length === 0 ? (
                            <span className={styles.muted}>Nadie entregó todavía</span>
                          ) : entregasPorTarea[t.id].map(uid => (
                            <span key={uid} className={styles.entregaChip}>{nombreAlumno(uid)}</span>
                          ))}
                        </div>
                      )}
                      <button type="button" onClick={() => eliminarTarea(t.id)} disabled={eliminandoTarea === t.id} className={styles.btnDelete}>
                        {eliminandoTarea === t.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB CALIFICACIONES ── */}
      {tab === "calificaciones" && (
        <div>
          <div className={styles.feed}>
            <h2 className={styles.feedTitle}>Calificaciones</h2>

            {esAlumno && (
              <div className={styles.miNotaBox}>
                {miNota ? (
                  <>
                    <div className={styles.notaGrande}>{miNota.nota}</div>
                    <div className={styles.notaLabel}>Tu nota final</div>
                    {miNota.comentario && <div className={styles.notaComentario}>"{miNota.comentario}"</div>}
                  </>
                ) : (
                  <div className={styles.empty}>Tu profesor todavía no cargó tu nota.</div>
                )}
              </div>
            )}

            {puedeEditar && (
              alumnos.length === 0 ? (
                <div className={styles.empty}>No hay alumnos inscriptos en esta materia.</div>
              ) : (
                <div className={styles.tablaNotas}>
                  <div className={styles.tablaHeader}>
                    <span>Alumno</span>
                    <span>Nota actual</span>
                    <span>Asignar nota</span>
                  </div>
                  {alumnos.map(uid => {
                    const notaActual = getNota(uid);
                    const alumno = usuarios.find(u => u.id === uid);
                    if (!alumno || (alumno.rol !== "alumno" && alumno.rol !== "student")) return null;
                    return (
                      <div key={uid} className={styles.tablaFila}>
                        <div className={styles.alumnoNombre}>
                          <div className={styles.avatarSmall}>{alumno.nombre.charAt(0).toUpperCase()}</div>
                          {alumno.nombre}
                        </div>
                        <div>
                          {notaActual ? (
                            <span className={styles.notaBadge}>{notaActual.nota}</span>
                          ) : (
                            <span className={styles.sinNota}>Sin nota</span>
                          )}
                        </div>
                        <div className={styles.notaForm}>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="0-10"
                            value={notaForm[uid]?.nota ?? ""}
                            onChange={e => setNotaForm(p => ({ ...p, [uid]: { ...p[uid], nota: e.target.value } }))}
                            className={styles.notaInput}
                          />
                          <input
                            type="text"
                            placeholder="Comentario"
                            value={notaForm[uid]?.comentario ?? ""}
                            onChange={e => setNotaForm(p => ({ ...p, [uid]: { ...p[uid], comentario: e.target.value } }))}
                            className={styles.notaInputWide}
                          />
                          <button type="button" onClick={() => guardarNota(uid)} disabled={guardandoNota === uid} className={styles.btnGuardarNota}>
                            {guardandoNota === uid ? "..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
