"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan 01", score: 70 },
  { date: "Jan 05", score: 75 },
  { date: "Jan 10", score: 72 },
  { date: "Jan 15", score: 78 },
  { date: "Jan 20", score: 82 },
  { date: "Jan 25", score: 85 },
  { date: "Jan 30", score: 88 },
]

export function PerformanceGraph() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

