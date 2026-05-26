// src/pages/CourseOverview.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CourseOverviewContent from "./courseOverviewContent";
import { CourseOverviewBreadCrumbs } from "./breadcrumbs";

const CourseOverview = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState("");
  const [courseKeywords, setCourseKeywords] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);

  useEffect(() => {
    const getCourseName = async () => {
      try {
        const response = await axios.get(`${backendURL}/courses/${courseId}`);
        setCourseName(response.data.course_name);
      } catch (error) {
        console.error("Error fetching course name:", error);
      }
    };

    getCourseName();
  }, [courseId, backendURL]);


  useEffect(() => {
    const ifAlreadyEnrolled = async () => {
      try {
        const response = await axios.get(`${backendURL}/courses/user/2`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });

        const foundCourse = response.data.find(
          (course: { ref_course_id: number; id: number }) =>
            course.ref_course_id === Number(courseId) || course.id === Number(courseId)
        );
        if (foundCourse) {
          console.log("User is enrolled in this course.");
          navigate(`/course/${foundCourse.id}`);
        }
        setIsEnrolled(Boolean(foundCourse));
      } catch (error) {
        console.error("Error checking enrollment:", error);
      }
    };

    ifAlreadyEnrolled();
  }, [backendURL, courseId]);

  useEffect(() => {
    const getCourseKeywords = async () => {
      try {
        const response = await axios.get(`${backendURL}/keywords/course/${courseId}`);
        const keywords = response.data.map((element: { keyword: string }) => element.keyword);
        setCourseKeywords(keywords);
      } catch (error) {
        console.error("Error fetching course keywords:", error);
      }
    };

    getCourseKeywords();
  }, [courseId, backendURL]);

  const handleEnroll = () => setShowEnrollConfirm(true);

  const confirmEnrollment = async () => {
    try {
      await axios.post(
        `${backendURL}/courses/enroll`,
        { courseId },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setShowEnrollConfirm(false);
      navigate("/mylearnings");
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  return (
    <div className="w-full p-4 mt-4">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <CourseOverviewBreadCrumbs courseName={courseName.toUpperCase()} />
        </div>

        <button
          className="enroll-course-btn"
          onClick={!isEnrolled ? handleEnroll : undefined}
          disabled={isEnrolled}
          style={{
            marginTop: "-1rem",
            backgroundColor: isEnrolled ? "gray" : "",
            cursor: isEnrolled ? "not-allowed" : "pointer",
            opacity: isEnrolled ? 0.7 : 1,
          }}
        >
          {isEnrolled ? "Already Enrolled" : "Enroll Course"}
        </button>
      </section>

      {showEnrollConfirm && (
        <div className="modal-overlay" onClick={() => setShowEnrollConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Confirm Enrollment</h2>
            <p className="modal-desc">
              Are you sure you want to enroll in this course?
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowEnrollConfirm(false)}>
                Cancel
              </button>
              <button className="modal-create" onClick={confirmEnrollment}>
                Yes, Enroll
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="learn-section">
        <h3 className="learn-title">What you will learn</h3>
        <ul className="course-list">
          {courseKeywords.length === 0 ? (
            <li className="text-muted italic">No learning outcomes available.</li>
          ) : (
            courseKeywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-4 flex gap-4 flex-wrap">
        <CourseOverviewContent courseId={courseId ?? ""} />
      </div>
    </div>
  );
};

export default CourseOverview;
