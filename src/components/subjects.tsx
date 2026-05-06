"use client";

import React from "react";
import { LuPenLine, LuBook, LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { Button, Card, CardContent, CardHeader, CardTitle } from "./ui";
import { obtenerMaterias, obtenerProfesionales } from "../actions";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { AddSubjectForm } from "./forms/add-subject";
import { Skeleton } from "./ui/skeleton";
import { DeleteSubject } from "./forms";
import { useAppStore } from "../store";

export const SubjectsView = () => {
  const { profesionales, setProfesionales, materias, setMaterias } =
    useAppStore();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [itemSelect, setItemSelect] = React.useState<null | {
    id: number;
    descripcion: string;
    id_profesor: number;
  }>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [materiasRes, profesionalesRes] = await Promise.all([
        obtenerMaterias(),
        obtenerProfesionales(),
      ]);
      if (materiasRes?.error) {
        toast.error("Error cargando materias", {
          description: materiasRes.error,
        });
      } else {
        setMaterias(materiasRes?.materias || []);
      }

      if ("error" in profesionalesRes) {
        toast.error("Error cargando profesores", {
          description: profesionalesRes.error,
        });
      } else {
        setProfesionales(profesionalesRes?.data || []);
      }
    } catch (error: any) {
      toast.error("Error al cargar datos", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refresh();
  }, []);

  return (
    <Card>
      <CardHeader className="justify-between flex! flex-row!">
        <CardTitle className="text-xl">Listado de materias</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setItemSelect(null);
              }}
            >
              Agregar materia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AddSubjectForm
              onClose={() => setOpen(false)}
              refresh={refresh}
              item={itemSelect}
              setItem={setItemSelect}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 overflow-auto h-[calc(100vh-280px)]">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-5 border border-slate-200 rounded-lg flex gap-2 items-center"
              >
                <Skeleton className="size-10 rounded-full" />
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            ))
          : materias?.map((m: any, index: number) => {
              const profesor = profesionales?.find(
                (p) => p?.id_profesor === m?.id_profesor
              );

              return (
                <div
                  key={index}
                  className="p-5 border border-slate-200 rounded-lg flex gap-2 items-center"
                >
                  <LuBook className="size-10" />
                  <div className="w-full flex flex-col">
                    <span className="font-bold text-xl">
                      {m?.descripcion?.toUpperCase()}
                    </span>
                    <span className="text-base text-semibold">
                      {profesor?.nombre}-{profesor?.apellido}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setItemSelect(m);
                      setOpen(true);
                    }}
                  >
                    <LuPenLine className="size-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setItemSelect(m);
                      setOpenDelete(true);
                    }}
                  >
                    <LuTrash2 className="size-6 text-red-500" />
                  </Button>
                </div>
              );
            })}
        <DeleteSubject
          item={itemSelect}
          setItem={setItemSelect}
          setOpenDelete={setOpenDelete}
          openDelete={openDelete}
          refresh={refresh}
        />
      </CardContent>
    </Card>
  );
};
