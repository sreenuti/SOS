"use client";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, unit, icon }: MetricCardProps) {
  return (
    <div className="glass-card p-6 border border-ocean-border/60 bg-ocean-card/80 backdrop-blur-md shadow-xl min-h-[120px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-ocean-muted text-sm font-medium uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <span className="text-ocean-cyan/80 w-8 h-8 flex items-center justify-center">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="text-2xl md:text-3xl font-semibold text-ocean-text tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-ocean-muted text-sm ml-1.5 font-normal">{unit}</span>
        )}
      </div>
    </div>
  );
}
