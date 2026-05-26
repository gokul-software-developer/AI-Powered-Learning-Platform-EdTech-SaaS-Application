import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
interface Course {
  id: number;
  course_name: string;
}

interface CourseProgress {
  watchedVideos: number;
  totalVideos: number;
}

const gradients = [
  'linear-gradient(135deg, #09af67, rgb(77, 96, 90))',
  'linear-gradient(135deg, rgb(24, 173, 118), rgb(64, 91, 91))',
  'linear-gradient(135deg, rgb(26, 90, 57), rgb(62, 70, 66))',
  'linear-gradient(135deg, rgb(48, 99, 76), rgb(88, 104, 116))',
  'linear-gradient(135deg, rgb(46, 98, 53), rgb(91, 180, 135))',
  'linear-gradient(135deg, rgb(39, 91, 85), rgb(94, 190, 209))',
  'linear-gradient(135deg, rgb(75, 128, 116), rgb(32, 55, 69))',
];

const getGradientForCourse = (courseId: number) => {
  return gradients[courseId % gradients.length];
};

const ContinueLearning = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      try {
        const courseRes = await axios.get<Course[]>(
          `${BASE_URL}/courses/user`,
          { withCredentials: true }
        );
        const fetchedCourses = courseRes.data;
        setCourses(fetchedCourses);

        const progressResults = await Promise.all(
          fetchedCourses.map(async (course) => {
            try {
              const progressRes = await axios.get<CourseProgress>(
                `${BASE_URL}/videos/course/progress/${course.id}`,
                { withCredentials: true }
              );
              const { watchedVideos, totalVideos } = progressRes.data;
              const progress =
                totalVideos > 0
                  ? Math.round((watchedVideos / totalVideos) * 100)
                  : 0;
              return { courseId: course.id, progress };
            } catch {
              return { courseId: course.id, progress: 0 };
            }
          })
        );

        const map = progressResults.reduce((acc, curr) => {
          acc[curr.courseId] = curr.progress;
          return acc;
        }, {} as Record<number, number>);
        setProgressMap(map);
      } catch (error) {
        console.error('❌ Error loading courses/progress:', error);
      }
    };

    fetchCoursesAndProgress();
  }, []);

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Continue Learning
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl shadow-md overflow-hidden bg-card"
          >
            {/* Clickable gradient area with course title */}
            <a
              href={`http://localhost:5173/course/${course.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-48 flex items-center justify-center text-white"
              style={{ background: getGradientForCourse(course.id) }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <h3 className="z-10 text-2xl md:text-3xl font-bold text-center px-4">
                {course.course_name}
              </h3>
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/30 backdrop-blur-sm hover:bg-background/50 rounded-full"
                >
                  <Play className="w-6 h-6 text-white" />
                </Button>
              </div>
            </a>

            {/* Progress section */}
            <div className="p-4 text-white bg-muted/10 dark:bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium px-2 py-1 bg-white/20 text-white rounded-full">
                  Beginner
                </span>
                <span className="text-xs text-white/70">Self Curated</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Progress</span>
                <span className="text-sm font-medium text-primary">
                  {progressMap[course.id] ?? 0}%
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2 mt-1">
                <div
                  className="bg-white rounded-full h-2"
                  style={{ width: `${progressMap[course.id] || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueLearning;
// StudyPlanPopup.tsx