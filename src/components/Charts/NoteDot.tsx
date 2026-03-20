interface NoteDotProps {
  cx?: number;
  cy?: number;
  payload?: { notes?: string };
  stroke?: string;
}

export default function NoteDot({ cx, cy, payload, stroke }: NoteDotProps) {
  if (cx == null || cy == null) return null;

  const dot = (
    <circle cx={cx} cy={cy} r={3} fill="#fff" stroke={stroke} strokeWidth={2} />
  );

  if (!payload?.notes) return dot;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        opacity={0.4}
      />
      {dot}
    </g>
  );
}
