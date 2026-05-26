import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { Progress } from "@radix-ui/react-progress";
import { toast } from "sonner";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
// Data interfaces
interface Course {
  id: number;
  course_name: string;
  user_id?: number;
}
interface StudyPlan {
  id: number;
  plan_name: string;
  user_id: number;
  start_date: string;
  end_date: string;
  weekdays: string[];
  study_time: number;
  start_time: string;
  course_details?: Course[];
}

// Helper: Map weekday names to indexes
const weekdayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// Generate all dates between two dates inclusive
const getDatesInRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const dt = new Date(start);
  while (dt <= end) {
    dates.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return dates;
};

const StudyPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [planName, setPlanName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  // Hard-coded streak date strings for demo purposes
  const streakDatesIso = [
    "2025-07-25",
    "2025-07-26",
    "2025-07-27",
    "2025-07-28",
    "2025-07-29",
    "2025-08-01",
  ];
  // Converts to Date objects
  const streakDates = streakDatesIso.map((d) => new Date(d));

  // Helper to check if a date is a streak day
  const isStreakDate = (date: Date): boolean => {
    return streakDates.some(
      (d) =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    );
  };

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const getStatus = () => {
    if (!plan) return "Unknown";
    const now = new Date();
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    if (now < start) return "Upcoming";
    if (now > end) return "Completed";
    return "Active";
  };
  const status = getStatus();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/studyplan/study-plans/${id}/with-courses`,
          { withCredentials: true }
        );
        setPlan(data.studyPlan);
        setPlanName(data.studyPlan.plan_name);

        if (data.studyPlan?.course_details?.length) {
          const progressResults = await Promise.all(
            data.studyPlan.course_details.map(async (course: Course) => {
              try {
                const resp = await axios.get(
                  `${BASE_URL}/videos/course/progress/${course.id}`,
                  { withCredentials: true }
                );
                const { watchedVideos, totalVideos } = resp.data;
                return {
                  courseId: course.id,
                  progress: totalVideos
                    ? Math.round((watchedVideos / totalVideos) * 100)
                    : 0,
                };
              } catch {
                return { courseId: course.id, progress: 0 };
              }
            })
          );
          const map: Record<number, number> = {};
          progressResults.forEach(({ courseId, progress }) => {
            map[courseId] = progress;
          });
          setProgressMap(map);
        }
        setError(null);
      } catch {
        setError("Failed to load plan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleExpand = (courseId: number) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      next.has(courseId) ? next.delete(courseId) : next.add(courseId);
      return next;
    });
  };

  const overallProgress = useMemo(() => {
    if (!plan?.course_details?.length) return 0;
    const total = plan.course_details.reduce(
      (sum, c) => sum + (progressMap[c.id] ?? 0),
      0
    );
    return Math.round(total / plan.course_details.length);
  }, [plan, progressMap]);

  if (loading)
    return (
      <div className="p-10 text-center text-lg text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500 dark:text-red-400">{error}</div>
    );
  if (!plan)
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-400">
        No plan found.
      </div>
    );

  // Mini calendar calculations
  const startDate = new Date(plan.start_date);
  const endDate = new Date(plan.end_date);
  const today = new Date();
  const datesInRange = getDatesInRange(startDate, endDate);
  const studyDayIndexes = plan.weekdays.map((d) => weekdayMap[d]);
  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 lg:px-0 select-none">
      {/* Plan Header */}
      <div className="flex flex-col md:flex-row md:gap-10">
        <div className="flex-1 mb-8 md:mb-0">
          <input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            disabled={true} // editable feature can be added later
            className="text-3xl font-bold w-full border-transparent bg-transparent focus:border-green-500 transition p-1 mb-1 outline-none text-gray-900 dark:text-white"
            aria-label="Plan name"
          />
          <div className="flex flex-wrap gap-6 text-gray-500 text-sm mt-3">
            <span>
              Status:{" "}
              <span
                className={`text-xs px-2 py-1 rounded ${
                  status === "Active"
                    ? "bg-green-100 text-green-700"
                    : status === "Upcoming"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {status}
              </span>
            </span>
            <span>
              Duration: {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
            </span>
            <span>
              Days left:{" "}
              {status === "Completed"
                ? 0
                : Math.max(
                    Math.ceil(
                      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    ) + 1,
                    0
                  )}
            </span>
          </div>
          <div className="mt-6">
            <div className="text-md text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-4">
              <span>
                Goal: <span className="font-semibold">{plan.study_time} min/day</span>
              </span>
              <span>|</span>
              <span>
                Time: <span className="font-semibold">{plan.start_time}</span>
              </span>
            </div>
            <div className="w-full max-w-lg">
              <Progress
                value={overallProgress}
                max={100}
                className="h-5 rounded bg-green-50 dark:bg-green-900"
                aria-label="Overall progress"
              >
                <div
                  className="bg-green-500 h-5 transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </Progress>
              <div className="mt-1 text-right text-xs text-green-800 dark:text-green-200">
                {overallProgress}%
              </div>
            </div>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="flex-1">
          <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-green-100 dark:border-green-700">
            <div className="mb-2 text-green-800 dark:text-green-300 font-medium">
              Study Plan Calendar
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
              {datesInRange.map((date) => {
                const day = date.getDay();
                const dayNum = date.getDate();
                const isStudy = studyDayIndexes.includes(day);
                const isPastOrToday = date <= new Date(today.toDateString());
                const current = isToday(date);
                const streak = isStreakDate(date);

                let className = "flex items-center justify-center relative h-8 w-8 rounded-full text-sm";

                if (isStudy && isPastOrToday) {
                  className += " bg-green-100 text-green-700 font-semibold border";
                } else if (isStudy && !isPastOrToday) {
                  // Future study day - dimmed style
                  className += " opacity-50 text-green-300";
                } else if (!isStudy) {
                  className += " text-gray-400 dark:text-gray-600";
                }

                if (current) className += " ring-2 ring-green-500";

                // Only show streak highlight for past or today
                const showStreak = streak && isPastOrToday;

                return (
                  <div
                    key={date.toISOString()}
                    className={className + " transition"}
                    title={`${date.toDateString()}${isStudy ? " (Study Day)" : ""}${
                      showStreak ? " - Streak Day" : ""
                    }`}
                  >
                    {dayNum}

                    {/* Streak diagonal stripe overlay */}
                    {showStreak && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none rounded-full"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, rgba(34,197,94,0.4), rgba(34,197,94,0.4) 2px, transparent 2px, transparent 4px)",
                        }}
                      />
                    )}

                    {current && (
                      <span className="absolute bottom-0 right-0 block w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-right text-green-700 dark:text-green-300">
              Study days highlighted | Today is outlined | Streak days have diagonal stripes (only up to today)
            </div>
          </section>
        </div>
      </div>

      {/* Courses */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-200 tracking-tight">
          Courses
        </h2>
        {plan.course_details?.length ? (
          <div className="space-y-4">
            {plan.course_details.map((course) => {
              const progress = progressMap[course.id] ?? 0;
              const isExpanded = expandedCourses.has(course.id);
              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 border border-green-100 dark:border-green-700 rounded shadow p-5 mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        className="rounded p-2 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 border"
                        tabIndex={0}
                        aria-label={`Go to course ${course.course_name}`}
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        <Play size={18} className="text-green-700" />
                      </button>
                      <div className="font-semibold text-green-900 dark:text-green-300 text-lg">
                        {course.course_name}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(course.id)}
                      className="text-green-600 hover:text-green-800 flex items-center gap-1 px-2 py-1"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      Details
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-green-800 dark:text-green-200 mb-1">
                      Progress: <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress
                      value={progress}
                      max={100}
                      className="h-3 bg-green-50 dark:bg-green-900"
                    >
                      <div
                        className="bg-green-400 h-3 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </Progress>
                    {isExpanded && (
                      <div className="mt-3 border-t pt-3 text-green-900 dark:text-green-100 text-sm">
                        <div>Notes: (Add note feature for this course...)</div>
                        <div className="mt-1">More details to be filled in.</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-green-700 dark:text-green-300 text-sm pl-1">
            No courses in this study plan.
          </p>
        )}
      </section>
    </div>
  );
};

export default StudyPlanDetail;
