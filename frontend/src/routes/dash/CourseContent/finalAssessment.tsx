
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import certificate from "../../../assets/CourseContent/certificate.png";

const FinalAssessment = ({ userId, keywordIds }: { userId: number, keywordIds: number[] }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const handleTakeAssessment = () => {
    navigate("/quiz", {
      state: {
        userId,
        courseId,
        keywordIds,
      },
    });
    
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: "1rem" }}>
      {/* <span style={{ fontSize: "32px", fontFamily: "poppins", fontWeight: "bold", color: "#fff" }}>
        Final Assessment
      </span>
      <span style={{ fontSize: "14px", fontFamily: "poppins", color: "GrayText" }}>
        *A minimum of 70% is required to pass the final assessment
      </span> */}
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
  <Button style={{ backgroundColor: "rgb(2, 200, 114)" }} onClick={handleTakeAssessment}>
    Take Assessment
  </Button>
</div>

      <div style={{ marginTop: "1rem" }}>
        {/* <span style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}>
          Your Score: -/15
        </span> */}
      </div>
      {/* <div style={{ marginTop: "1rem" }}>
        <span style={{ fontSize: "18px", color: "GrayText" }}>
          Get your certificate of completion{" "}
          <a href="#" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            click here
          </a>
        </span>
      </div>
      <div style={{ marginTop: "1rem", justifyContent: "center" }}>
        <img src={certificate} />
      </div> */}
    </div>
  );
};

export default FinalAssessment;
