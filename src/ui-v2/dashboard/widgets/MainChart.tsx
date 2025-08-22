import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Entry } from "../../../types/entryTypes";

const buildSeries = (entries: Entry[]) => {
  const days = Array.from({ length: 12 }, (_, i) => i + 1);
  const sum = entries.reduce((s, e) => s + Number(e.amount), 0);
  return days.map((d) => ({ d, v: (sum / 12) * (1 + Math.sin(d / 2) * 0.05) }));
};

const MainChart: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  const data = buildSeries(entries);
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, left: 0, right: 10, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="d" stroke="#aaa" tick={{ fontSize: 12 }} />
          <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#0f0f10', border: '1px solid #2a2a2a', fontSize: 12 }} />
          <Line type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MainChart;


