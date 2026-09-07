import { clsx } from "@/lib/format";

export function LineChart({
  labels,
  series,
  height = 180,
}: {
  labels: string[];
  series: Array<{ id: string; label: string; color: string; values: number[] }>;
  height?: number;
}) {
  const width = 640;
  const pad = { top: 12, right: 12, bottom: 28, left: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...series.flatMap((item) => item.values), 1);
  const step = series[0]?.values.length > 1 ? innerW / (series[0].values.length - 1) : innerW;

  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const x = pad.left + index * step;
        const y = pad.top + innerH - (value / max) * innerH;
        return `${x},${y}`;
      })
      .join(" ");

  const area = (values: number[]) => {
    if (!values.length) return "";
    const line = points(values);
    const lastX = pad.left + (values.length - 1) * step;
    const firstX = pad.left;
    const base = pad.top + innerH;
    return `${firstX},${base} ${line} ${lastX},${base}`;
  };

  return (
    <div className="min-w-0">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full" role="img">
        {[0.25, 0.5, 0.75, 1].map((tick) => {
          const y = pad.top + innerH - tick * innerH;
          return (
            <line
              key={tick}
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              stroke="#E8EAEE"
              strokeWidth="1"
            />
          );
        })}
        {series[0] ? (
          <polygon points={area(series[0].values)} fill={series[0].color} opacity="0.16" />
        ) : null}
        {series.map((item) => (
          <polyline
            key={item.id}
            points={points(item.values)}
            fill="none"
            stroke={item.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {labels.map((label, index) =>
          index % Math.ceil(labels.length / 7) === 0 ? (
            <text
              key={label + index}
              x={pad.left + index * step}
              y={height - 8}
              textAnchor="middle"
              className="fill-ink-400"
              fontSize="10"
            >
              {label}
            </text>
          ) : null,
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-500">
        {series.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarList({
  items,
  color = "#111318",
}: {
  items: Array<{ key: string; label: string; count: number }>;
  color?: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);
  if (!items.length) {
    return <p className="text-sm text-ink-400">Sin datos todavía.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-ink-600">{item.label}</span>
            <span className="font-medium text-ink-900">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div
              className={clsx("h-full rounded-full")}
              style={{ width: `${(item.count / max) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
