// ─────────────────────────────────────────────────────────────
//  MonthlyChart.jsx
//  Pie chart of spending by category using Recharts library.
//  Recharts is a React-friendly chart library (wrapper over D3).
// ─────────────────────────────────────────────────────────────
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CATEGORY_COLORS } from "../pages/Dashboard";

export default function MonthlyChart({ expenses }) {
  // Group expenses by category and sum amounts
  const dataMap = {};
  expenses.forEach((e) => {
    dataMap[e.category] = (dataMap[e.category] || 0) + e.amount;
  });

  // Convert to array format Recharts expects: [{ name, value }]
  const data = Object.entries(dataMap)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#ccc", padding: "3rem 0", fontSize: "0.9rem" }}>
        Add expenses to see chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}   // donut hole
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#aaa"} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => `₹${val.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
