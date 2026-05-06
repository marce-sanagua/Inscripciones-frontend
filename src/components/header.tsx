"use client";

import { FiBook } from "react-icons/fi";
import { Button } from "./ui";
import { useRouter } from "next/navigation";
import { logoutServer } from "../actions";
import { useAppStore } from "../store";

export const Header = ({ children }: { children: React.ReactNode }) => {
  const { clearStore } = useAppStore();
  const router = useRouter();

  const logOut = async () => {
    clearStore();
    await logoutServer();
    router.push("/");
  };

  return (
    <section className="flex flex-col ">
      <div className="flex bg-slate-300 border-b p-5 border-slate-200 justify-between">
        <div className="flex items-center gap-2">
          <FiBook className="size-7" />
          <span className="text-xl font-bold text-slate-700">Bienvenido </span>
        </div>
        <Button className="cursor-pointer hover:bg-slate-700!" onClick={logOut}>
          Cerrar sesión
        </Button>
      </div>

      <div className="h-full overflow-auto static w-[calc(100vw-77px)]">
        {children}
      </div>
    </section>
  );
};
