import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download } from "lucide-react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
interface Props {
  isOwnProfile: boolean;
  userId: number | string;
  userName: string;
}

interface Course {
  id: number;
  course_name: string;
  description?: string;
}

export default function AccomplishmentsTab({ isOwnProfile, userId, userName }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const hardcodedPassedDate = "Passed on July 15, 2025";

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios
      .get(`${BASE_URL}/profile/${userId}/accomplishments`)
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="font-semibold text-lg text-foreground">
          {isOwnProfile ? "Your" : `${userName}'s`} Accomplishments
        </CardTitle>
        {isOwnProfile && (
          <CardDescription className="text-muted-foreground">
            Here are the courses you've successfully completed. Great job!
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading accomplishments...</p>
        ) : courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map(course => (
              <div
                key={course.id}
                className="border rounded-lg p-4 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{course.course_name}</h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 italic">{hardcodedPassedDate}</p>
                </div>
                <button
                  className="p-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors flex items-center"
                  onClick={e => {
                    e.stopPropagation();
                    window.open(`${BASE_URL}/certificate/${course.id}`, "_blank");
                  }}
                  title="Download Certificate"
                  aria-label="Download Certificate"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            {isOwnProfile ? "You haven't passed any courses yet." : `${userName} hasn't shared any accomplishments yet.`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
