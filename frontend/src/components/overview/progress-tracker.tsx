"use client"

import { Progress } from "@/components/ui/progress"

export function ProgressTracker() {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Overall Progress</p>
            <p className="text-sm text-muted-foreground">75% of goals achieved</p>
          </div>
          <div className="text-sm font-medium">75%</div>
        </div>
        <Progress value={75} className="mt-2" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Weekly Goal</p>
            <p className="text-sm text-muted-foreground">3 out of 5 tasks completed</p>
          </div>
          <div className="text-sm font-medium">60%</div>
        </div>
        <Progress value={60} className="mt-2" />
      </div>
    </div>
  )
}

