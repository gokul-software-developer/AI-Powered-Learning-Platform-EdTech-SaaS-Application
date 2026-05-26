import { useState, useEffect } from "react";
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  setMonth,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const views = ["month", "day"] as const;
type View = (typeof views)[number];

type UserType = { id: number; name?: string; /* other user fields */ };
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
type StudyPlan = {
  id: number;
  name: string;
  color: string;
  weekdays: number[];
  studyTime: string;
  startDate: string;
  endDate: string;
  start_time: string;
};

const weekdayMap: { [key: string]: number } = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const getRandomColor = () => {
  const colors = [
    "bg-green-800",
    "bg-teal-900",
    "bg-blue-900",
    "bg-pink-900",
    "bg-purple-900",
    "bg-yellow-900",
    "bg-orange-900",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function CalendarView() {
  const [view, setView] = useState<View>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [activePlans, setActivePlans] = useState<StudyPlan[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const navigate = useNavigate();

  const start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const handleDayClick = (date: Date) => {
    const weekday = date.getDay();
    const matchingPlans = studyPlans.filter(plan => {
      const planStart = new Date(plan.startDate);
      const planEnd = new Date(plan.endDate);
      const weekdayIncludes = plan.weekdays.includes(weekday);
      const dateInRange = date >= planStart && date <= planEnd;
      return weekdayIncludes && dateInRange;
    });
    setActivePlans(matchingPlans);
    setSelectedDate(date);
    setOpen(true);
  };

  const handleMonthClick = (monthIndex: number) => {
    const newDate = setMonth(new Date(selectedDate), monthIndex);
    setView("day");
    setSelectedDate(newDate);
  };

  const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const nextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  const transformPlans = (apiData: any[]): StudyPlan[] => {
    return apiData.map(plan => {
      const weekdayArray = Array.isArray(plan.weekdays)
        ? plan.weekdays.map((day: string) => {
            const trimmedDay = day.trim();
            const wdNum = weekdayMap[trimmedDay];
            if (wdNum === undefined) {
              console.warn(`Unrecognized weekday "${trimmedDay}" in plan`, plan);
              return -1;
            }
            return wdNum;
          }).filter((wd: number) => wd >= 0)
        : [];
      return {
        id: plan.id,
        name: plan.plan_name,
        color: getRandomColor(),
        weekdays: weekdayArray,
        studyTime: plan.start_time || "00:00",
        startDate: plan.start_date,
        endDate: plan.end_date,
        start_time: plan.start_time || "00:00",
      };
    });
  };

 useEffect(() => {
  const fetchSession = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/session/check-session', {
        withCredentials: true,
      });
      if (res.data.loggedIn) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setSessionLoading(false);
    }
  };
  fetchSession();
}, []);

  // Fetch study plans when user is set (session loaded)
  useEffect(() => {
  const fetchPlans = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${BASE_URL}/studyplan/study-plans?userId=${user.userId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      const transformed = transformPlans(data.studyPlans || []);
      setStudyPlans(transformed);
    } catch (err) {
      console.error("Error fetching study plans:", err);
    }
  };
  fetchPlans();
}, [user]);
  const monthNames = Array.from({ length: 12 }, (_, i) => format(new Date(2023, i, 1), "MMM"));

  if (sessionLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#101010] text-[#a7f3d0]">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen p-6 bg-[#101010] text-[#a7f3d0] flex flex-col overflow-hidden">
      {/* Optional glow div (commented) */}
      {/* <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#065f46] rounded-full opacity-20 blur-3xl pointer-events-none" /> */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#a7f3d0] drop-shadow-lg">Study Planner</h1>
        <div className="flex gap-3">
          {views.map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "outline"}
              className={cn(
                view === v
                  ? "bg-[#065f46] text-white border-[#064e3b]"
                  : "text-[#a7f3d0] border-[#0d8050] hover:bg-[#064e3b]"
              )}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div className="relative z-10 mx-auto mt-6 w-[75vw] h-[75vh] grid grid-cols-3 grid-rows-4 border-4 border-[#064e3b] rounded-lg bg-[#065f46] shadow-xl overflow-hidden">
          {monthNames.map((monthName, i) => (
            <div
              key={monthName}
              className={cn(
                "flex items-center justify-center text-2xl font-semibold cursor-pointer select-none transition-colors duration-200",
                "border border-[#064e3b]",
                i === selectedDate.getMonth()
                  ? "bg-[#0d8050] text-[#a7f3d0]"
                  : "bg-transparent text-[#a7f3d0] hover:bg-[#064e3b]"
              )}
              onClick={() => handleMonthClick(i)}
            >
              {monthName}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="relative z-10 flex justify-between mb-4">
            <Button variant="ghost" className="text-[#a7f3d0]" onClick={prevMonth}>
              ← Prev
            </Button>
            <span className="font-semibold text-[#a7f3d0]">{format(selectedDate, "MMMM yyyy")}</span>
            <Button variant="ghost" className="text-[#a7f3d0]" onClick={nextMonth}>
              Next →
            </Button>
          </div>

          <div className="relative z-10 grid grid-cols-7 border-4 border-[#064e3b] bg-[#101010] rounded h-[calc(100vh-250px)] overflow-auto shadow-inner">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold border border-[#064e3b] bg-[#065f46] text-[#a7f3d0] py-2 select-none"
              >
                {day}
              </div>
            ))}
            {days.map((day) => {
              const inMonth = isSameMonth(day, selectedDate);
              const dayPlans = studyPlans.filter((plan) => {
                const weekdayMatch = plan.weekdays.includes(day.getDay());
                const current = day.getTime();
                const start = new Date(plan.startDate).getTime();
                const end = new Date(plan.endDate).getTime();
                return weekdayMatch && current >= start && current <= end;
              });

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "border border-[#064e3b] p-1 cursor-pointer transition-colors duration-150",
                    inMonth ? "bg-[#101010] hover:bg-[#064e3b]" : "bg-[#065f46] opacity-60"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="font-semibold text-[#a7f3d0]">{format(day, "d")}</div>
                  <div className="flex flex-col gap-1 mt-1">
                    {dayPlans.map(plan => (
                      <div
                        key={plan.id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded text-white font-medium shadow",
                          plan.color,
                          "opacity-90"
                        )}
                      >
                        {plan.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plans for {format(selectedDate, "PPP")}</DialogTitle>
          </DialogHeader>
          {activePlans.length > 0 ? (
            <div className="space-y-2">
              {activePlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/studyplan/${plan.id}`);
                  }}
                  className={cn(
                    "text-white px-3 py-1 rounded cursor-pointer shadow font-semibold hover:bg-[#0d8050]",
                    plan.color
                  )}
                  title={`Go to study plan: ${plan.name}`}
                >
                  {plan.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[#a7f3d0] text-center py-4">No study plans for this day.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
