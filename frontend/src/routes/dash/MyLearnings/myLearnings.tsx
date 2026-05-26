
import { useEffect, useState } from "react";
import axios from "axios";
import "./myLearning.css";
import { Link } from "react-router-dom";
import { MyLearningsBreadCrumbs } from "./breadcrumbs";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MyLearnings = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const userId = 5; // Replace with actual userId if needed

  type Course = {
    id: number;
    course_name: string;
    createdAt: string;
    thumbnail: string;
    progress?: number;
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<"all" | "ongoing" | "completed">("all");

  const [showModal, setShowModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeleting(true);
      await axios.delete(`${backendURL}/courses/${courseToDelete.id}`, {
        withCredentials: true,
      });
      setCourseToDelete(null);
      await loadCoursesWithProgress(); // Refresh after delete
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setIsDeleting(false);
    }
  };


  const loadCoursesWithProgress = async () => {
    try {
      const courseRes = await axios.get(`${backendURL}/courses/user/${userId}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const courseList = courseRes.data;

      const updatedCourses = await Promise.all(
        courseList.map(async (course: Course) => {
          try {
            const res = await axios.get(`${backendURL}/videos/course/progress/${course.id}`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const progress = (res.data.watchedVideos / res.data.totalVideos) * 100;
            return { ...course, progress: Math.round(progress) };
          } catch (err) {
            console.error(`Error fetching progress for course ${course.id}`, err);
            return { ...course, progress: 0 };
          }
        })
      );

      setCourses(updatedCourses);
    } catch (err) {
      console.error("Error loading courses with progress:", err);
    }
  };

  useEffect(() => {
    loadCoursesWithProgress();
  }, [backendURL, userId]);

  // const handleCreateCourse = async () => {
  //   const trimmedName = newCourseName.trim();
  //   if (!trimmedName) return;

  //   try {
  //     setIsCreating(true);

  //     await axios.post(`${backendURL}/courses`, {
  //       course_name: trimmedName
  //     }, {
  //       headers: { 'Content-Type': 'application/json' },
  //       withCredentials: true,
  //     });

  //     setNewCourseName("");
  //     setShowModal(false);

  //     await loadCoursesWithProgress(); // Refresh list with progress
  //   } catch (error) {
  //     console.error("Error creating course:", error);
  //   } finally {
  //     setIsCreating(false);
  //   }
  // };
const handleCreateCourse = async () => {
  const trimmedName = newCourseName.trim();
  if (!trimmedName) return;

  try {
    setIsCreating(true);

    await axios.post(`${backendURL}/courses`, {
      course_name: trimmedName,
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    setNewCourseName("");
    setShowModal(false);

    await loadCoursesWithProgress(); // Refresh list with progress

    toast({
      title: "Course Created",
      description: "Your course was created successfully.",
      variant: "default",
    });

  } catch (error: any) {
    if (error.response?.status === 403) {
      // Show toast for course limit reached
      toast({
        title: "Creation Limit Reached",
        description: error.response.data?.error || "You can create only up to 5 courses.",
        variant: "destructive",
      });
    } else {
      // Generic error toast
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create course.",
        variant: "destructive",
      });
    }
  } finally {
    setIsCreating(false);
  }
};
  const filteredCourses = courses
    .filter(course =>
      course.course_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .filter(course => {
      if (courseStatusFilter === "completed") return course.progress === 100;
      if (courseStatusFilter === "ongoing") return (course.progress ?? 0) < 100;
      return true;
    });

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const gradients = [
    "linear-gradient(135deg, #09af67,rgb(77, 96, 90))",
    "linear-gradient(135deg,rgb(24, 173, 118),rgb(64, 91, 91))",
    "linear-gradient(135deg,rgb(26, 90, 57),rgb(62, 70, 66))",
    "linear-gradient(135deg,rgb(48, 99, 76),rgb(88, 104, 116))",
    "linear-gradient(135deg,rgb(46, 98, 53),rgb(91, 180, 135))",
    "linear-gradient(135deg,rgb(39, 91, 85),rgb(94, 190, 209))",
    "linear-gradient(135deg,rgb(75, 128, 116),rgb(32, 55, 69))",
  ];

  const getGradientForCourse = (courseId: number) => {
    return gradients[courseId % gradients.length];
  };

  return (
    <div className="mycourses-container">
      <div className="mycourses-header">
        <MyLearningsBreadCrumbs />
        <input
          type="text"
          placeholder="Search your courses"
          className="course-search transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="generate-course-btn" onClick={() => setShowModal(true)}>
          Generate Your Own Course
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create a New Course</h2>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter course name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="modal-create"
                onClick={handleCreateCourse}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="course-filters" style={{ overflowX: "auto" }}>
        <button
          className={`filter-btn ${courseStatusFilter === "all" ? "active" : ""}`}
          onClick={() => setCourseStatusFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${courseStatusFilter === "ongoing" ? "active" : ""}`}
          onClick={() => setCourseStatusFilter("ongoing")}
        >
          Ongoing
        </button>
        <button
          className={`filter-btn ${courseStatusFilter === "completed" ? "active" : ""}`}
          onClick={() => setCourseStatusFilter("completed")}
        >
          Completed
        </button>
      </div>

      <div className="course-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.reverse().map((course) => (
            <div key={course.id} className="course-card">
              <div
                className="course-thumbnail-placeholder"
                style={{ background: getGradientForCourse(course.id) }}
              >
                <span>{toTitleCase(course.course_name)}</span>
                <Trash2
                  className="delete-icon"
                  size={20}
                  onClick={() => setCourseToDelete(course)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    cursor: "pointer",
                    color: "#fff",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                    padding: 4,
                  }}
                />
              </div>
              <div className="course-info">
                <h3 className="course-title">{toTitleCase(course.course_name)}</h3>
                <p className="course-date">
                  Enrolled: {new Date(course.createdAt).toLocaleDateString()}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
                <Link to={`/course/${course.id}`} className="go-to-course">
                  Go to Course
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results-text">No courses found.</p>
        )}
        {courseToDelete && (
          <div className="modal-overlay" onClick={() => setCourseToDelete(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Course</h2>
              <p>Are you sure you want to delete <strong>{toTitleCase(courseToDelete.course_name)}</strong>?</p>
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setCourseToDelete(null)}>
                  Cancel
                </button>
                <button className="modal-create" onClick={handleDeleteCourse} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyLearnings;
