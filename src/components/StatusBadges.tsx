import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/18 text-warning-foreground border-warning/40",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-info/12 text-info border-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  Validado: "success",
  "Consentimiento obtenido": "success",
  "Convertido en cliente": "success",
  Enriquecido: "info",
  "Apto para investigación comercial": "info",
  Nuevo: "info",
  "Pendiente de validar": "warning",
  "Pendiente de consentimiento": "warning",
  Duplicado: "warning",
  "No válido": "danger",
  "No apto para campaña directa": "danger",
  Excluido: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  return <Pill tone={statusTone[status] ?? "neutral"}>{status}</Pill>;
}

export function TriBadge({ value, label }: { value: "sí" | "no" | "pendiente"; label?: string }) {
  const tone: Tone = value === "sí" ? "success" : value === "pendiente" ? "warning" : "danger";
  return (
    <Pill tone={tone}>
      {label ? `${label}: ` : ""}
      {value}
    </Pill>
  );
}

export function RiskBadge({ level }: { level: "bajo" | "medio" | "alto" }) {
  const tone: Tone = level === "bajo" ? "success" : level === "medio" ? "warning" : "danger";
  return <Pill tone={tone}>Riesgo {level}</Pill>;
}

export function DemoTag() {
  return <Pill tone="neutral">datos demo</Pill>;
}
