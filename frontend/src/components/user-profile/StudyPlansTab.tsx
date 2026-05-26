import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Share2, Save, ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

interface StudyPlan {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  study_time: number;
  weekdays: string[];
  save_count?: number;
  course_settings?: Record<
    string,
    {
      daily_hours: number;
      start_time: string;
      study_days: string[];
      notes?: string;
    }
  >;
}
interface Props {
  studyPlans: StudyPlan[];
  isOwnProfile: boolean;
  userName: string;
}
function addHours(time: string): string {
  if (!time) return "-";
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m || 0);
  return date.toTimeString().substring(0, 5);
}
export default function StudyPlansTab({ studyPlans, isOwnProfile, userName }: Props) {
  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "active";
    return "completed";
  };
  const formatDate = (dateStr: string) => format(new Date(dateStr), "MMM dd, yyyy");
  const handleShareClick = (planId: number) => {
    const shareUrl = `${window.location.origin}/studyplan/${planId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Study plan link copied to clipboard!");
  };
  const handleSaveClick = async (planId: number) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/profile/${planId}/save`,
        {},
        { withCredentials: true }
      );
      if (response.data.alreadySaved) {
        toast.success("You have already saved this study plan.");
      } else {
        toast.success("Study plan saved! You can now customize it.");
      }
    } catch (error) {
      toast.error("Failed to save the study plan.");
      console.error("Error saving plan:", error);
    }
  };
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="font-semibold text-lg text-foreground">
          {isOwnProfile ? "Your" : `${userName}'s`} Study Plans
        </CardTitle>
        {isOwnProfile && (
          <CardDescription className="text-muted-foreground">
            Manage and track your progress
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {studyPlans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p>No study plans found</p>
            {isOwnProfile && (
              <Button className="mt-4" variant="outline">
                Create Your First
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {studyPlans.map((plan) => {
              const status = getStatus(plan.start_date, plan.end_date);
              return (
                <div
                  key={plan.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.assign(`/studyplan/${plan.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.location.assign(`/studyplan/${plan.id}`);
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{plan.plan_name}</h3>
                    <div className="flex gap-4 items-center" onClick={(e) => e.stopPropagation()}>
                      {isOwnProfile && (
                        <button
                          onClick={() => console.log("Edit", plan.id)}
                          className="p-1 rounded"
                          aria-label="Edit plan"
                          title="Edit plan"
                        >
                          <Edit className="w-4 h-4 stroke-white" />
                        </button>
                      )}
                      <button
                        onClick={() => handleShareClick(plan.id)}
                        className="p-1 rounded flex items-center"
                        aria-label="Share"
                        title="Share plan"
                      >
                        <Share2 className="w-4 h-4 stroke-white" />
                      </button>
                      {!isOwnProfile && (
                        <Button
                          size="sm"
                          onClick={() => handleSaveClick(plan.id)}
                          className="flex items-center"
                          aria-label="Save plan"
                          title="Save plan"
                        >
                          <Save className="w-4 h-4 stroke-white" />
                        </Button>
                      )}

                      {/* Thumbs up icon with save count (separate, consistent style) */}
                      <div className="flex flex-col items-center ml-2 select-none">
                        <ThumbsUp className="w-4 h-4 stroke-white" />
                        <span className="text-xs text-white mt-0.5">{plan.save_count ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>
                        <strong>Duration:</strong> {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                      </p>
                      <p>
                        <strong>Daily Study Time:</strong> {plan.study_time} minutes
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Study Days:</strong> {Array.isArray(plan.weekdays) ? plan.weekdays.join(", ") : "N/A"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`ml-1 px-2 py-1 rounded text-xs ${
                            status === "active"
                              ? "bg-green-100 text-green-800"
                              : status === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
