import { create } from "zustand";
import { persist } from "zustand/middleware";

type Alumno = {
  uid: string;
  dni: string;
  email: string;
  password_hash: string;
  rol: string;
};

type Profesional = {
  id_profesor: number;
  dni: string;
  nombre: string;
  apellido: string;
};

type Materias = {
  id: number;
  descripcion: string;
  id_profesor: number;
};

type User = {
  dni: string;
  email: string;
};

interface AppStore {
  profesionales: Profesional[];
  alumnos: Alumno[];
  alumnoSeleccionado: Alumno | null;
  materias: Materias[];
  user: User | {};

  setProfesionales: (items: Profesional[]) => void;
  setAlumnos: (items: Alumno[]) => void;
  setAlumnoSeleccionado: (alumno: Alumno | null) => void;
  setMaterias: (items: Materias[]) => void;
  setUser: (user: User | {}) => void;
  clearStore: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      profesionales: [],
      alumnos: [],
      alumnoSeleccionado: null,
      materias: [],
      user: {},
      setProfesionales: (items) => set({ profesionales: items }),
      setAlumnos: (items) => set({ alumnos: items }),
      setAlumnoSeleccionado: (alumno) => set({ alumnoSeleccionado: alumno }),
      setMaterias: (items) => set({ materias: items }),
      setUser: (user) => set({ user: user }),
      clearStore: () =>
        set({
          profesionales: [],
          alumnos: [],
          alumnoSeleccionado: null,
          materias: [],
          user: {},
        }),
    }),
    {
      name: "app-storage",

      partialize: (state) => ({
        profesionales: state.profesionales,
        alumnos: state.alumnos,
        alumnoSeleccionado: state.alumnoSeleccionado,
        materias: state.materias,
        user: state.user,
      }),
    }
  )
);
