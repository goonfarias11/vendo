// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "blue" | "red" | "gray";
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  const variants = {
    green: "bg-green-pale text-green-dark",
    amber: "bg-amber-50 text-amber-800",
    blue: "bg-blue-50 text-blue-800",
    red: "bg-red-50 text-red-700",
    gray: "bg-surface text-ink-soft",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const ORDER_STATUS_MAP: Record<
  OrderStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  NEW: { label: "Nuevo", variant: "blue" },
  CONFIRMED: { label: "Confirmado", variant: "amber" },
  PREPARING: { label: "Preparando", variant: "amber" },
  READY: { label: "Listo", variant: "green" },
  DELIVERED: { label: "Entregado", variant: "gray" },
  CANCELLED: { label: "Cancelado", variant: "red" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_MAP[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
