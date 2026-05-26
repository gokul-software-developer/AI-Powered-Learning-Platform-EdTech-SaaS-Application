import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
type Recommendation = {
  id: number;
  course_name: string;
  user_id_foreign_key: number;
  first_video_url: string | null;
  // first_video_thumbnail is ignored here
};

const getYouTubeId = (url: string | null): string | null => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname.includes('youtube.com')) {
      return parsedUrl.searchParams.get('v');
    }

    if (hostname.includes('youtu.be')) {
      return parsedUrl.pathname.split('/')[1];
    }

    return null;
  } catch {
    return null;
  }
};

const getThumbnailUrl = (videoUrl: string | null): string => {
  const videoId = getYouTubeId(videoUrl);
  return videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : '/fallback-thumbnail.jpg';
};

const StartLearning = () => {
  const [courses, setCourses] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/recommendations/`, {
        method: 'GET',
        credentials: 'include', // ✅ This allows cookies to be sent
      });

        const data = await response.json();
        setCourses(data.recommendations || []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <div className="text-center mt-6 text-muted-foreground">Loading recommendations...</div>;
  }

  if (courses.length === 0) {
    return <div className="text-center mt-6 text-muted-foreground">No recommendations available.</div>;
  }

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Start Learning</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const thumbnail = getThumbnailUrl(course.first_video_url);

          return (
            <div
              key={course.id}
              className="bg-card rounded-2xl shadow-md overflow-hidden cursor-pointer"
              onClick={() => navigate(`/course/${course.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/course/${course.id}`);
                }
              }}
            >
              <div className="relative h-48">
                <img
                  src={thumbnail}
                  className="w-full h-full object-cover"
                  alt={course.course_name}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {course.first_video_url && (
                    <a
                      href={course.first_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      tabIndex={0}
                      aria-label={`Watch first video of ${course.course_name}`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/30 backdrop-blur-sm hover:bg-background/50 rounded-full"
                      >
                        <Play className="w-6 h-6" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium">{course.course_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Start learning with the first video of this course.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StartLearning;
