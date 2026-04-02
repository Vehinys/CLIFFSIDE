import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
  color?: string; // couleur custom hex pour les rôles
}

export function Badge({ className, variant = "default", color, children, style, ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-surface-2 text-text border-border",
    success: "bg-green-950 text-green-400 border-green-900",
    warning: "bg-yellow-950 text-yellow-400 border-yellow-900",
    danger: "bg-red-950 text-red-400 border-red-900",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        !color && variantClasses[variant],
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color, borderColor: `${color}40`, ...style } : style}
      {...props}
    >
      {children}
    </span>
  );
}
