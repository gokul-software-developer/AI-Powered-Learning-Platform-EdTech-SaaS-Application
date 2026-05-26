import { useEffect, useState } from "react";
import "./courseOverview.css";
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

const CourseOverviewContent = ({ courseId }: { courseId: string }) => {
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
  }, [courseId]);

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

            <div className="video-info-box" 
            onClick={() => window.open(video.video_url, "_blank")}
            >
              <div className="video-header">
                <div>
                  {/* <div className="video-title">{video.video_title}</div> */}
                  <div
                    className="video-title"
                    // style={{
                    //   textDecoration: video.video_progress ? "line-through" : "none",
                    //   color: video.video_progress ? "#999" : "#fff",
                    // }}
                  >
                    {video.video_title}
                  </div>

                  <div 
                  className="video-meta"
                  // style={{
                  //     textDecoration: video.video_progress ? "line-through" : "none",
                  //     color: video.video_progress ? "#999" : "#fff",
                  //   }}
                  >
                    Duration: {formatDuration(video.video_duration)}
                  </div>
                  <div 
                  className="video-channel"
                  // style={{
                  //     textDecoration: video.video_progress ? "line-through" : "none",
                  //     color: video.video_progress ? "#999" : "#fff",
                  //   }}
                  >
                    By {video.video_channel}
                  </div>
                </div>

                {/* <input
                type="checkbox"
                className="video-checkbox"
                checked={video.video_progress}
                // readOnly
                onClick={(e) => e.stopPropagation()} 
                title={video.video_progress ? "Watched" : "Mark as watched"}
                onChange={() => handleChangeProgress(video.id)}
              /> */}
              </div>
            </div>
          </div>

        ))}
      </div>


    </div>
  );
};

export default CourseOverviewContent;

