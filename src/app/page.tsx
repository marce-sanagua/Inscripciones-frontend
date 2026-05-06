"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/src/store";

export default function Home() {
  const { setUser } = useAppStore();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ dni: "", email: "", password: "", confirmPassword: "", rol: "alumno" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:3000/auth/login", loginData);
      setUser(data.user);
      document.cookie = `token=${data.user.id}; path=/`;
      toast.success("Bienvenido!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.warning(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return toast.warning("Las contraseñas no coinciden");
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/auth/register", registerData);
      toast.success("¡Usuario registrado con éxito!");
      setActive(false);
    } catch (err: any) {
      toast.warning(err.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins',sans-serif; }
        body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:linear-gradient(90deg,#0d1f35,#1a3a5c); }
        .container { position:relative; width:820px; height:520px; background:#fff; border-radius:30px; box-shadow:0 0 40px rgba(0,0,0,.4); overflow:hidden; }
        .form-box { position:absolute; right:0; width:50%; height:100%; background:#fff; display:flex; align-items:center; color:#333; text-align:center; padding:40px; z-index:1; transition:.6s ease-in-out 1.2s, visibility 0s 1s; }
        .container.active .form-box { right:50%; }
        .form-box.register { visibility:hidden; }
        .container.active .form-box.register { visibility:visible; }
        .form-box form { width:100%; }
        .form-box h1 { font-size:28px; margin-bottom:20px; color:#1a3a5c; }
        .input-box { position:relative; margin:14px 0; }
        .input-box input { width:100%; padding:12px 16px; background:#eee; border-radius:8px; border:none; outline:none; font-size:14px; color:#333; font-family:'Poppins',sans-serif; }
        .input-box input::placeholder { color:#888; }
        .input-box select { width:100%; padding:12px 16px; background:#eee; border-radius:8px; border:none; outline:none; font-size:14px; color:#333; font-family:'Poppins',sans-serif; }
        .btn { width:100%; height:44px; background:#185FA5; border-radius:8px; border:none; cursor:pointer; font-size:15px; color:#fff; font-weight:600; font-family:'Poppins',sans-serif; transition:background .2s; margin-top:8px; }
        .btn:hover { background:#378ADD; }
        .toggle-box { position:absolute; width:100%; height:100%; }
        .toggle-box::before { content:''; position:absolute; left:-250%; width:300%; height:100%; background:linear-gradient(135deg,#185FA5,#0d1f35); border-radius:150px; z-index:2; transition:1.8s ease-in-out; }
        .container.active .toggle-box::before { left:50%; }
        .toggle-panel { position:absolute; width:50%; height:100%; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:2; transition:.6s ease-in-out; padding:40px; text-align:center; }
        .toggle-panel h1 { font-size:26px; margin-bottom:10px; }
        .toggle-panel p { font-size:13px; margin-bottom:20px; opacity:0.8; }
        .toggle-panel.toggle-left { left:0; transition-delay:1.2s; }
        .container.active .toggle-panel.toggle-left { left:-50%; transition-delay:.6s; }
        .toggle-panel.toggle-right { right:-50%; transition-delay:.6s; }
        .container.active .toggle-panel.toggle-right { right:0; transition-delay:1.2s; }
        .toggle-btn { width:160px; height:44px; background:transparent; border:2px solid #fff; border-radius:8px; cursor:pointer; font-size:14px; color:#fff; font-weight:600; font-family:'Poppins',sans-serif; transition:background .2s; }
        .toggle-btn:hover { background:rgba(255,255,255,0.15); }
        .platform-name { font-size:12px; opacity:0.6; margin-bottom:16px; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className={`container${active ? ' active' : ''}`}>

          <div className="form-box login">
            <form onSubmit={handleLogin}>
              <h1>Iniciar sesión</h1>
              <div className="input-box">
                <input type="email" placeholder="Correo electrónico" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
              </div>
              <div className="input-box">
                <input type="password" placeholder="Contraseña" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
              </div>
              <button type="submit" className="btn" disabled={loading}>{loading ? "Cargando..." : "Ingresar"}</button>
            </form>
          </div>

          <div className="form-box register">
            <form onSubmit={handleRegister}>
              <h1>Registro</h1>
              <div className="input-box">
                <input type="text" placeholder="DNI" value={registerData.dni} onChange={e => setRegisterData({ ...registerData, dni: e.target.value })} required />
              </div>
              <div className="input-box">
                <input type="email" placeholder="Correo electrónico" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required />
              </div>
              <div className="input-box">
                <input type="password" placeholder="Contraseña" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} required />
              </div>
              <div className="input-box">
                <input type="password" placeholder="Confirmar contraseña" value={registerData.confirmPassword} onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
              </div>
              <div className="input-box">
                <select value={registerData.rol} onChange={e => setRegisterData({ ...registerData, rol: e.target.value })}>
                  <option value="alumno">Alumno</option>
                  <option value="profesor">Profesor</option>
                </select>
              </div>
              <button type="submit" className="btn" disabled={loading}>{loading ? "Cargando..." : "Registrarme"}</button>
            </form>
          </div>

          <div className="toggle-box">
            <div className="toggle-panel toggle-left">
              <h1>Bienvenido!</h1>
              <p className="platform-name">Plataforma de Inscripciones</p>
              <p>¿No tenés cuenta?</p>
              <button className="toggle-btn" onClick={() => setActive(true)}>Registrarme</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hola de nuevo!</h1>
              <p className="platform-name">Plataforma de Inscripciones</p>
              <p>¿Ya tenés cuenta?</p>
              <button className="toggle-btn" onClick={() => setActive(false)}>Iniciar sesión</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}