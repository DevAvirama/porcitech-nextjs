"use client";

import { useRouter } from "next/navigation";
import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";

function QuickActions({ actions = [] }) {
  const router = useRouter();
  return (
    <Card className="mt-6 rounded-4x1">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-lg text-slate-800 font-bold">
          AI
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Accesos rapidos
          </p>
          <h2 className="text-2xl font-black text-slate-950">
            Acciones frecuentes
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            tone="soft"
            className="justify-start text-left hover:scale-[1.02] transition-transform"
            onClick={() => router.push(action.path)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}

export default QuickActions;
