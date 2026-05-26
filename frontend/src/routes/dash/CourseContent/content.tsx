// import { useEffect, useState } from "react";
// import thumbnail from "../../../assets/CourseContent/thumbnail.png";
// import profile from "../../../assets/CourseContent/Profile.png";
// import "./courseContent.css";
// import axios from "axios";

// const Content = ( {courseId}: any ) => {

//   const backendURL = import.meta.env.VITE_BACKEND_URL;
//   const [videoData, setVideoData] = useState([]);



//   const [isChecked, setIsChecked] = useState(false);

//   useEffect(() => {
//     const fetchVideoData = async () => {

//       try {
//         const response = await axios.get(`${backendURL}/videos/course/${courseId}`, {
//           headers: {
//             'Content-Type': 'application/json',
//             // 'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
//         setVideoData(response.data);
//         console.log("Video Data:", videoData);
        
//       }
//       catch (error) {
//         console.error("Error fetching video data:", error);
//       }
//     }
//     fetchVideoData();
//   }, [courseId, backendURL]);
  

//   return (
//     <div className="content-container">
//       <div className="content-header">
//         <span>Videos</span>
//       </div>

//       {/* <div className="content-body">
//         <div className="checkbox-container">
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={() => setIsChecked(!isChecked)}
//             className="checkbox"
//           />
//         </div>

//         <div className="content-details">
//           <div className="thumbnail-container">
//             <img src={thumbnail} className="thumbnail" />
//           </div>

//           <div className="video-details">
//             <span className="video-title">Video content title</span>
//             <span className="video-info">views / published on</span>
//             <div className="author-details">
//               <img src={profile} className="profile-img" />
//               <span className="author-name">Author Name</span>
//             </div>
//           </div>
//         </div>
//       </div> */}


//         <div className="content-body">
//           <div className="checkbox-container">
//             <input
//               type="checkbox"
//               checked={isChecked}
//               onChange={() => setIsChecked(!isChecked)}
//               className="checkbox"
//             />
//           </div>

//           {videoData.map((video) => (
//             <div key={video.id} className="content-details">
//               <div className="thumbnail-container">
//                 <a href={video.video_url} target="_blank" rel="noopener noreferrer">
//                   <img src={video.video_thumbnail} className="thumbnail" alt={video.video_title} />
//                 </a>
//               </div>
//               <div className="video-details">
//                 <a href={video.video_url} target="_blank" rel="noopener noreferrer">
//                   <span className="video-title">{video.video_title}</span>
//                 </a>
//                 <div className="author-details">
//                   {/* Placeholder profile until you fetch author data */}
//                   <img src={profile} className="profile-img" alt="Author" />
//                   <span className="author-name">{video.video_channel}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//     </div>
//   );
// };

// export default Content;


import { useEffect, useState } from "react";
import profile from "../../../assets/CourseContent/Profile.png";
import "./courseContent.css";
import axios from "axios";

type VideoItem = {
  id: number;
  course_id_foreign_key: number;
  createdAt: string;
  updatedAt: string;
  video_channel: string;
  video_duration: string;
  video_thumbnail: string;
  video_title: string;
  video_progress: boolean;
  video_url: string;
};

const formatDuration = (durationStr: string) => {
  const seconds = parseInt(durationStr.replace("s", ""), 10);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .filter((v, i) => v !== 0 || i > 0)
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
};

const Content = ({ courseId, refreshKey }: { courseId: string; refreshKey: number }) => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [videoData, setVideoData] = useState<VideoItem[]>([]);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get<VideoItem[]>(
          `${backendURL}/videos/course/${courseId}`
        );
        setVideoData(response.data);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();
  }, [courseId, refreshKey]);

  const handleChangeProgress = async (videoId: number) => {
    try {
      const video = videoData.find((v) => v.id === videoId);
      if (!video) return;

      const updatedProgress = !video.video_progress;
      await axios.put(
        `${backendURL}/videos/progress/${videoId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setVideoData((prevData) =>
        prevData.map((v) =>
          v.id === videoId ? { ...v, video_progress: updatedProgress } : v
        )
      );
    } catch (error) {
      console.error("Error updating video progress:", error);
    }
  };

  return (
    <div className="content-container">
      <h2 className="content-header" style={{ color: "#fff", marginBottom: "1rem" }}>Videos</h2>
      <div className="video-list">
        {videoData.map((video) => (
          <div className="video-row" key={video.id}>
            <img
              src={video.video_thumbnail.replace("default.jpg", "mqdefault.jpg")}
              className="video-thumbnail"
              alt={video.video_title}
              onClick={() => window.open(video.video_url, "_blank")}
            />

            <div className="video-info-box" onClick={() => window.open(video.video_url, "_blank")}>
              <div className="video-header">
                <div>
                  {/* <div className="video-title">{video.video_title}</div> */}
                  <div
                    className="video-title"
                    style={{
                      textDecoration: video.video_progress ? "line-through" : "none",
                      color: video.video_progress ? "#999" : "#fff",
                    }}
                  >
                    {video.video_title}
                  </div>

                  <div 
                  className="video-meta"
                  style={{
                      textDecoration: video.video_progress ? "line-through" : "none",
                      color: video.video_progress ? "#999" : "#fff",
                    }}
                  >
                    Duration: {formatDuration(video.video_duration)}
                  </div>
                  <div 
                  className="video-channel"
                  style={{
                      textDecoration: video.video_progress ? "line-through" : "none",
                      color: video.video_progress ? "#999" : "#fff",
                    }}
                  >
                    By {video.video_channel}
                  </div>
                </div>

                <input
                type="checkbox"
                className="video-checkbox"
                checked={video.video_progress}
                // readOnly
                onClick={(e) => e.stopPropagation()} 
                title={video.video_progress ? "Watched" : "Mark as watched"}
                onChange={() => handleChangeProgress(video.id)}
                />
              </div>
            </div>
          </div>

        ))}
      </div>


    </div>
  );
};

export default Content;

