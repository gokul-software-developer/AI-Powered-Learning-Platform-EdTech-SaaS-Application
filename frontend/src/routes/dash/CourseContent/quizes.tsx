// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import "./courseContent.css"; // Link to the CSS file

// const Quizes = () => {
//   const [isChecked1, setIsChecked1] = useState(false);
//   const [isChecked2, setIsChecked2] = useState(false);

//   return (
//     <div className="quizes-container">
//       <div 
//         className="quizes-header" 
//         style={{ textAlign: "center", marginBottom: "1rem", fontWeight: "600", fontSize: "1.8rem", color: "#fff" }}
//       >
//         Final Assessment
//       </div>

//       <div
//         className="quiz-rules"
//         style={{
//           padding: "1rem",
//           lineHeight: "1.6",
//           color: "#fff",
//           textAlign: "center", // center overall text
//           maxWidth: "700px",
//           margin: "0 auto",
//         }}
//       >
//         <p style={{ fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.8rem" }}>
//           Important Rules Before Taking the Final Assessment:
//         </p>
//         <ul
//           style={{
//             paddingLeft: "1.8rem",
//             marginTop: "0",
//             display: "inline-block",
//             textAlign: "left", // keep list text left for readability
//           }}
//         >
//           <li>
//             These assessments are <strong>AI-generated</strong> based on the keywords of the course content. Please ensure you have a clear understanding of the key concepts before attempting.
//           </li>
//           <li>
//             If you <strong>fail the assessment</strong>, you may retake it only after 24 hours. Upon passing, you become eligible to receive your certificate.
//           </li>
//           <li>
//             You must score at least <strong>40%</strong> to pass the assessment and qualify for certification.
//           </li>
//           <li>
//             Each question carries <strong>2 marks</strong>.
//           </li>
//           <li>
//             No shortcuts for certificates! Focus on mastering the material — genuine learning is the goal, not just the certificate.
//           </li>
//         </ul>

//         <p
//           style={{
//             marginTop: "1.8rem",
//             fontStyle: "italic",
//             fontWeight: "500",
//             maxWidth: "600px",
//             marginLeft: "auto",
//             marginRight: "auto",
//           }}
//         >
//           Wishing you the very best in your assessments. Study well, and succeed!
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Quizes;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./courseContent.css"; // Link to your CSS file

const Quizes = () => {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);

  return (
    <div 
      className="quizes-container" 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        padding: "2rem", 
        backgroundColor: "#121718",
        minHeight: "100vh", 
        boxSizing: "border-box"
      }}
    >
      <div 
        className="quizes-header" 
        style={{ 
          fontWeight: 700, 
          fontSize: "2rem", 
          color: "#e4e7eb",
          marginBottom: "2rem",
          textAlign: "center",
          letterSpacing: "1px",
          userSelect: "none"
        }}
      >
        Final Assessment
      </div>

      <div
        className="quiz-rules"
        style={{
          maxWidth: "720px",
          backgroundColor: "#1f2926",
          borderRadius: "12px",
          padding: "2rem 2.5rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          color: "#f0f6f3",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          lineHeight: 1.6,
          userSelect: "text",
        }}
      >
        <h2 
          style={{ 
            fontWeight: 700, 
            fontSize: "1.4rem", 
            marginBottom: "1.2rem", 
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#a5d6a7"
          }}
        >
          Important Rules Before Taking the Final Assessment
        </h2>

        <ul
          style={{ 
            margin: 0,
            paddingLeft: "1.6rem", 
            listStyleType: "disc",
            fontSize: "1.05rem",
            color: "#d3d7d4",
            textAlign: "left",
            userSelect: "text",
          }}
        >
          <li style={{ marginBottom: "1rem" }}>
            These assessments are <strong>AI-generated</strong> based on the course keywords. Please ensure you understand all key concepts before you begin.
          </li>
          <li style={{ marginBottom: "1rem" }}>
            If you <strong>fail</strong> the assessment, you can retake it only after 24 hours. Passing qualifies you for the certificate.
          </li>
          <li style={{ marginBottom: "1rem" }}>
            You must score at least <strong>40%</strong> to pass and receive certification.
          </li>
          <li style={{ marginBottom: "1rem" }}>
            Each question is worth <strong>2 marks</strong>. Plan your time accordingly.
          </li>
          <li>
            No shortcuts! Focus on learning deeply, as the certificate follows mastery, not haste.
          </li>
        </ul>

        <p
          style={{ 
            marginTop: "2rem", 
            fontStyle: "italic", 
            textAlign: "center", 
            fontWeight: 500, 
            fontSize: "1rem",
            color: "#a6c9a9",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            userSelect: "text",
          }}
        >
          Wishing you the very best in your assessments. Study well, succeed with confidence!
        </p>
      </div>
    </div>
  );
};

export default Quizes;
