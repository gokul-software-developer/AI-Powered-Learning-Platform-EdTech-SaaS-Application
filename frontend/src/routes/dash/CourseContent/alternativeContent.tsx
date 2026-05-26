

import thumbnail from "../../../assets/CourseContent/thumbnail.png"
import profile from "../../../assets/CourseContent/Profile.png"

const AlternativeContent = () =>{
  

  return(
  <div style={{marginBottom: "2rem"}}>
    {/* <div style={{ display: "flex", flexWrap: "wrap", marginTop: "2rem" }}>
        <span style={{fontSize: "32px",fontFamily:"poppins", fontWeight: "bold", color: "#fff"}}>
          Alternative Content
        </span>
    </div> */}

    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem",marginLeft: "1rem"}}>
      <div style={{flex: 1, display: "flex", gap: "1rem", flexWrap: "wrap"}}>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            {/* <div>
              <img 
                src={thumbnail}
                style={{ width: "400px", height: "auto", borderRadius: "8px" }}
                />
            </div> */}
            
            {/* Checkbox container */}
            
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: "1rem"}}>
            {/* <span style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}>
              Video content title
            </span>
            <span style={{ fontSize: "12px", color: "GrayText", marginTop: "0rem", textAlign: "left" }}>
              views / published on
            </span> */}
            <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
              {/* <div>
                <img
                  src={profile}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
              </div>
              <span style={{ fontSize: "18px", color: "#fff", marginLeft: "0.5rem", lineHeight: "40px" }}>
                Author Name
              </span> */}
            </div>
          </div>
        </div>
    </div>
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem",marginLeft: "1rem"}}>
      <div style={{flex: 1, display: "flex", gap: "1rem", flexWrap: "wrap"}}>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div>
              {/* <img 
                src={thumbnail}
                style={{ width: "400px", height: "auto", borderRadius: "8px" }}
                /> */}
            </div>
            
            {/* Checkbox container */}
            
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: "1rem"}}>
            {/* <span style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}>
              Video content title
            </span>
            <span style={{ fontSize: "12px", color: "GrayText", marginTop: "0rem", textAlign: "left" }}>
              views / published on
            </span> */}
            <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
              {/* <div>
                <img
                  src={profile}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
              </div>
              <span style={{ fontSize: "18px", color: "#fff", marginLeft: "0.5rem", lineHeight: "40px" }}>
                Author Name
              </span> */}
            </div>
          </div>
        </div>
    </div>
    </div>
    
</div>
)}

export default AlternativeContent