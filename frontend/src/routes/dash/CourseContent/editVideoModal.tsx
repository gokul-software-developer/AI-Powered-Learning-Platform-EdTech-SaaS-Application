import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import axios from "axios";

type Props = {
  courseId: string;
  onClose: () => void;
  backendURL: string;
  onRefresh: () => void;
};

type VideoItem = {
  id: number;
  video_title: string;
  video_url: string;
  video_thumbnail: string;
  video_channel: string;
  video_duration: string;
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

const EditVideoModal = ({ courseId, onClose, backendURL ,onRefresh }: Props) => {
  const [originalVideos, setOriginalVideos] = useState<VideoItem[]>([]);
  const [stagedVideos, setStagedVideos] = useState<VideoItem[]>([]);
  const [newVideoUrls, setNewVideoUrls] = useState<string[]>([""]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${backendURL}/videos/course/${courseId}`);
        setOriginalVideos(res.data);
        setStagedVideos(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchVideos();
  }, []);

  const handleAddUrlInput = () => {
    setNewVideoUrls([...newVideoUrls, ""]);
  };

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...newVideoUrls];
    updated[index] = value;
    setNewVideoUrls(updated);
  };

  const handleDeleteStaged = (videoId: number) => {
    setStagedVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

//   const handleConfirm = async () => {
//   try {
//     for (const url of newVideoUrls) {
//       if (url.trim()) {
//         const videoData = await fetchYouTubeVideoData(url.trim());
//         await axios.post(`${backendURL}/videos/video`, {
//           ...videoData,
//           video_title: videoData.video_title,
//           video_url: videoData.video_url,
//           video_thumbnail: videoData.video_thumbnail,
//           video_channel: videoData.video_channel,
//           video_duration: videoData.video_duration,
//           video_progress: false,
//           course_id_foreign_key: courseId,
//         });
//         console.log("New video data:", videoData);
//       }

//     }
//     onClose();
//   } catch (err) {
//     console.error("Confirm error:", err);
//   }
// };
  const handleConfirm = async () => {
    try {
      // 1. Delete videos removed by user
      const toDelete = originalVideos.filter(
        (orig) => !stagedVideos.find((s) => s.id === orig.id)
      );
      for (const vid of toDelete) {
        await axios.delete(`${backendURL}/videos/${vid.id}`);
      }

      // 2. Add new video URLs
      for (const url of newVideoUrls) {
        if (url.trim()) {
          const alreadyExists = stagedVideos.some(v => v.video_url === url.trim());
          if(!alreadyExists){
            const videoData = await fetchYouTubeVideoData(url.trim());
            await axios.post(`${backendURL}/videos/video`, {
              ...videoData,
              course_id_foreign_key: courseId,
            });
        }
        }
      }

      onRefresh();  // ✅ trigger CourseContent update
      onClose();    // ✅ close modal
    } catch (err) {
      console.error("Error during confirm:", err);
    }
  };



  function extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }


  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  async function fetchYouTubeVideoData(videoUrl: string) {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;

    const response = await axios.get(apiUrl);
    const item = response.data.items[0];

    if (!item) throw new Error("Video not found");

    const duration = item.contentDetails.duration; // ISO 8601 (e.g., PT5M2S)
    const formattedDuration = convertISO8601ToSeconds(duration).toString() + "s";

    const videoData = {
      id: videoId,
      video_title: item.snippet.title,
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
      video_thumbnail: item.snippet.thumbnails.default.url,
      video_channel: item.snippet.channelTitle,
      video_duration: formattedDuration,
    };

    return videoData;
  }

  function convertISO8601ToSeconds(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const [, h = "0", m = "0", s = "0"] = match;
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
  }




  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-3xl text-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Course Videos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* New Video URLs */}
        <div className="space-y-3 mb-6">
          {newVideoUrls.map((url, index) => (
            <input
              key={index}
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder="Enter YouTube video URL"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm"
            />
          ))}
          <button
            onClick={handleAddUrlInput}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            <Plus size={16} className="inline mr-1" />
            Add Another Video
          </button>
        </div>

        {/* Video List (Staged for deletion) */}
        <div className="space-y-4 mb-6">
          {stagedVideos.map((video) => (
            <div key={video.id} className="flex items-center gap-4 border-b border-zinc-700 pb-4">
              <img
                src={video.video_thumbnail.replace("default.jpg", "mqdefault.jpg")}
                className="w-32 h-20 rounded cursor-pointer"
                alt={video.video_title}
                onClick={() => window.open(video.video_url, "_blank")}
              />
              <div className="flex-1 cursor-pointer" onClick={() => window.open(video.video_url, "_blank")}>
                <div className="font-medium">{video.video_title}</div>
                <div className="text-sm text-gray-400">By {video.video_channel}</div>
                <div className="text-xs text-gray-500">Duration: {formatDuration(video.video_duration)}</div>
              </div>
              <button
                onClick={() => handleDeleteStaged(video.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete Video"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Confirm / Cancel Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;
