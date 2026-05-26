"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"

const data = [
  {
    subject: "Math",
    score: 80,
    fullMark: 100,
  },
  {
    subject: "Science",
    score: 75,
    fullMark: 100,
  },
  {
    subject: "Programming",
    score: 90,
    fullMark: 100,
  },
  {
    subject: "Language",
    score: 70,
    fullMark: 100,
  },
  {
    subject: "History",
    score: 65,
    fullMark: 100,
  },
]

export function SkillRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Student" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

