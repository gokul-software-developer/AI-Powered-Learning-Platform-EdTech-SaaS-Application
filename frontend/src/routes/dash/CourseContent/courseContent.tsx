import { Pencil, Trash2, Plus } from "lucide-react";

import { SetStateAction, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import Content from "./content";
import Quizes from "./quizes";
import FinalAssessment from "./finalAssessment";
import AlternativeContent from "./alternativeContent";
import axios from "axios";
import { CourseBreadCrumbs } from "./breadcrumbs";
import EditVideoModal from "./editVideoModal";


const CourseContent = () => {
  

  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const { courseId } = useParams();
 // const userId = Number(localStorage.getItem("userId")); // 
 const userId = 27; // ✅ Temporary static userId for testing

type Keyword = {
  id: number;
  keyword: string;
};
  const [courseName, setCourseName] = useState("");
  // const [courseKeywords, setCourseKeywords] = useState([]);
  const [enrolledCourseId, setEnrolledCourseId] = useState<number | null>(null);

  const navigate = useNavigate();
useEffect(() => {
  const isValidUser = async () => {
    try {
      const response = await axios.get(`${backendURL}/courses/user/2`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const foundCourse = response.data.find(
        (course: { ref_course_id: number; id: number }) => {
          const isMatch =
            course.ref_course_id === Number(courseId) ||
            course.id === Number(courseId);
          if (isMatch) setEnrolledCourseId(course.id);
          return isMatch;
        }
      );

      if (!foundCourse) {
        console.error("User is not enrolled in this course.");
        navigate(`/course-overview/${courseId}`);
      } else {
        navigate(`/course/${foundCourse.id}`); // ✅ Use foundCourse.id here
      }
    } catch (error) {
      console.error("Error checking user validity:", error);
    }
  };

  isValidUser();
}, [courseId, backendURL]);

  //const [courseKeywords, setCourseKeywords] = useState([]);
const [courseKeywords, setCourseKeywords] = useState<Keyword[]>([]);

console.log("Course ID (static):", courseId);

  useEffect(() => {
      const getCourseName = async () => {

      try {
        const response = await axios.get(`${backendURL}/courses/${courseId}`, {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        setCourseName(response.data.course_name);
      }
      catch (error) {
        console.error("Error fetching course name:", error);
      }
    };
    getCourseName();
  }, [courseId, backendURL]);

  useEffect(() => {
    const getCourseKeywords = async () => {
      
      try {
        const response = await axios.get(`${backendURL}/keywords/course/${courseId}` , {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        // const keywords = response.data.map((element: { keyword: String; }) => element.keyword);
        // setCourseKeywords(keywords);
        setCourseKeywords(response.data); // full objects with id + keyword

      //  
      // 🔍 Extract keyword IDs
      const keywordIds = response.data.map((k: { id: number }) => k.id);
      console.log("Keyword IDs:", keywordIds);
    } catch (error) {
      console.error("Error fetching course keywords:", error);
      }
    }
    getCourseKeywords();
  },[courseId, backendURL]);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);


// Convert courseKeywords into array of keyword IDs
const keywordIds = courseKeywords.map((keywordObj: any) => keywordObj.id);


  return (
    <div  style={{marginTop: "0.5rem"}}>
        <main className="flex justify-start md:justify-between items-start md:items-center flex-col md:flex-row gap-4 flex-wrap">
            <main className="header-row">
              <div className="course-title">
                <CourseBreadCrumbs courseName={courseName.toUpperCase()} />
              </div>

              <button
                onClick={() => setEditModalOpen(true)}
                className="edit-course-button hover:bg-green-700 transition"
              >
                <Pencil size={16} />
                Edit Course
              </button>
            </main>



          
          {/* <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginLeft: "1rem", marginTop: "1rem" }}>
            
            {courseKeywords.map((keyword, index) => (
              <button 
                key={index} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem", 
                  padding: "0.5rem 1rem", 
                  backgroundColor: "rgb(76, 76, 76)", 
                  borderRadius: "1rem", 
                  border: "none", 
                  cursor: "default",
                  margin: '5px',
                  fontSize: "14px",
                  color: "rgb(189, 247, 196)",
                }} 
                disabled
              >
                {keyword}
              </button>
            ))}
          </div> */}
          {/* <div
            className="keyword-container"
            style={{
              display: "flex",
              gap: "0.2rem",
              flexWrap: "wrap",
              marginLeft: "1rem",
              marginTop: "0rem",
            }}
          >
            {courseKeywords.map((keyword, index) => (
              <button
                className="keyword-button"
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgb(76, 76, 76)",
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "default",
                  margin: "5px",
                  fontSize: "14px",
                  color: "rgb(189, 247, 196)",
                }}
                disabled
              >
                {keyword.keyword}
              </button>
            ))}
          </div>  */}
          <div
            className="keyword-container"
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginLeft: "1rem",
              marginTop: "1rem",
            }}
          >
            {courseKeywords.map((keywordObj, index) => (
              <button
                className="keyword-button"
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgb(76, 76, 76)",
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "default",
                  margin: "5px",
                  fontSize: "14px",
                  color: "rgb(189, 247, 196)",
                }}
                disabled
              >
                {keywordObj.keyword}
              </button>
            ))}
          </div>

{/* <div
  style={{
    width: "100%",
    marginTop: "1rem",
    padding: "1.5rem 2rem",
    // backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
    color: "rgb(214, 255, 219)",
    fontFamily: "monospace",
  }}
>
  <ul
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)", // fixed 3 equal-width columns
      gap: "0.75rem 2rem",
      paddingLeft: "1rem",
      listStyleType: "disc",
      margin: 0,
    }}
  >
    {courseKeywords.map((keyword, index) => (
      <li
        key={index}
        style={{
          fontSize: "15px",
          lineHeight: "1.6",
          wordBreak: "break-word",
          opacity: 0.9,
        }}
      >
        {keyword}
      </li>
    ))}
  </ul>
</div> */}






        </main>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Content courseId={courseId ?? ""} refreshKey={refreshKey} />

        </div>
        <div>
          <Quizes />
        </div>
        <div>
          {/* <FinalAssessment /> */}
          <FinalAssessment userId={userId} keywordIds={keywordIds} />

        </div>
        <div>
          <AlternativeContent />
        </div>
        {isEditModalOpen && (
          <EditVideoModal 
            courseId={courseId ?? ""} 
            onClose={() => setEditModalOpen(false)} 
            backendURL={backendURL}
            onRefresh={() => setRefreshKey(prev => prev + 1)}
          />
        )}

    </div>
  )
}

export default CourseContent;
