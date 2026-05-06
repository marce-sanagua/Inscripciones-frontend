"use client";

import React from "react";
import { Tabs, TabsContent, TabsList } from "./ui/tabs";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { SubjectsView } from "./subjects";
import { StudentsView } from "./students";
import { Registration } from "./regristration";

export const GeneralView = () => {
  const [view, setView] = React.useState<string>("subjects");

  return (
    <div className="p-5">
      <Tabs
        defaultValue={view || "subjects"}
        value={view}
        onValueChange={setView}
      >
        <TabsList className="border border-slate-200 p-5! flex gap-5! bg-white">
          <div>
            <TabsTrigger
              value="subjects"
              className="px-4 py-1 rounded-md border border-transparent 
                 text-gray-500 
                 data-[state=active]:bg-slate-100 
                 data-[state=active]:text-slate-700 
                 data-[state=active]:border-slate-200 
                 transition-colors duration-200"
            >
              Materias
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="px-4 py-1 rounded-md border border-transparent 
                 text-gray-500 
                 data-[state=active]:bg-slate-100 
                 data-[state=active]:text-slate-700 
                 data-[state=active]:border-slate-200 
                 transition-colors duration-200"
            >
              Estudiantes
            </TabsTrigger>
            <TabsTrigger
              value="students-subject"
              className="px-4 py-1 rounded-md border border-transparent 
                 text-gray-500 
                 data-[state=active]:bg-slate-100 
                 data-[state=active]:text-slate-700 
                 data-[state=active]:border-slate-200 
                 transition-colors duration-200"
            >
              Inscripciones
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="subjects">
          <SubjectsView />
        </TabsContent>
        <TabsContent value="students">
          <StudentsView />
        </TabsContent>
        <TabsContent value="students-subject">
          <Registration />
        </TabsContent>
      </Tabs>
    </div>
  );
};
