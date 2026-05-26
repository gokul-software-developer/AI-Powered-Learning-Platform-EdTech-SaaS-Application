const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MAX_RESULTS = 10;

function parseISODuration(duration) {
  if (!duration) {
    console.warn("Missing duration field.");
    return 0;
  }
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    console.warn("Invalid duration format:", duration);
    return 0;
  }
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// Expanded and curated list of top English tech channels for priority
const preferredChannels = [
  "Bro Code",
  "freeCodeCamp.org",
  "freeCodeCamp",
  "CodeWithHarry",
  "Tech With Tim",
  "The Net Ninja",
  "Academind",
  "Traversy Media",
  "Programming with Mosh",
  "Simplilearn",
  "Telusko",
  "CodeAcademy",
  "Fireship",
  "CS Dojo",
  "Derek Banas",
  "Caleb Curry",
  "The Coding Train",
  "Fun Fun Function",
  "Kudvenkat",
  "ProgrammingKnowledge",
  "LearnCode.academy",
  "Edureka",
  "Google Developers",
  "MIT OpenCourseWare"
];

function isPreferredChannel(channelTitle) {
  return preferredChannels.some(name =>
    channelTitle.toLowerCase().includes(name.toLowerCase())
  );
}

function isValidFullEnglishCourse(title, description) {
  const blacklist = [
    "shorts",
    "short course",
    "crash course",
    "roadmap",
    "overview",
    "summary",
    "part 1",
    "part-1",
    "part 2",
    "part-2",
    "part 3",
    "part-3",
    "episode",
    "ep ",
    "ep.",
    "step by step",
    "quick guide"
    // intentionally removed 'intro' and 'introduction' to prevent over-filtering
  ];

  const lowerTitle = (title || '').toLowerCase();
  const lowerDesc = (description || '').toLowerCase();

  for (const word of blacklist) {
    if (lowerTitle.includes(word) || lowerDesc.includes(word)) {
      console.log(`Filtered out due to blacklist word "${word}": "${title}"`);
      return false;
    }
  }

  // Disabled non-ASCII filter to allow emojis, accented chars, etc.
  // If you want to use it again, uncomment below and test carefully
  /*
  const nonEnglishPattern = /[^\x00-\x7F]+/;
  if (nonEnglishPattern.test(title) || nonEnglishPattern.test(description)) {
    console.log(`Filtered out due to non-English chars: "${title}"`);
    return false;
  }
  */

  return true;
}

async function getTopVideoByEstimatedWatchTime(query) {
  try {
    const searchQuery = `${query} full course`;
    console.log(`Searching for query: "${searchQuery}"`);

    const searchResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: searchQuery,
          part: 'snippet',
          maxResults: MAX_RESULTS,
          type: 'video',
          order: 'relevance',
        }
      }
    );

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
    if (!videoIds) {
      console.log("No video IDs found from search.");
      return null;
    }

    const statsResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          id: videoIds,
          part: 'statistics,contentDetails,snippet',
        }
      }
    );

    let preferredVideos = [];
    let otherVideos = [];

    for (const video of statsResponse.data.items) {
      const views = parseInt(video.statistics.viewCount || 0);
      const durationSeconds = parseISODuration(video.contentDetails.duration);
      const title = video.snippet.title || "";
      const description = video.snippet.description || "";
      const channel = video.snippet.channelTitle || "";

      console.log(`Evaluating video: "${title}"`);
      console.log(`Channel: "${channel}", Duration: ${durationSeconds} sec, Views: ${views}`);

      if (durationSeconds === 0) {
        console.log(`Skipping due to missing or invalid duration.`);
        continue;
      }

      // Lowered minimum duration to 30 minutes (1800 seconds)
      if (durationSeconds < 1800) {
        console.log(`Skipping due to short duration (<30 min).`);
        continue;
      }

      if (!isValidFullEnglishCourse(title, description)) {
        console.log(`Skipping due to failing full course filter.`);
        continue;
      }

      const estimatedWatchTime = views * durationSeconds;

      const videoData = {
        title,
        id: video.id,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.snippet.thumbnails.default.url,
        views,
        channel,
        duration: `${durationSeconds}s`,
        estimatedWatchTime
      };

      if (isPreferredChannel(channel)) {
        console.log(`Video is from preferred channel: "${channel}"`);
        preferredVideos.push(videoData);
      } else {
        console.log(`Video NOT from preferred channel.`);
        otherVideos.push(videoData);
      }
    }

    // Sort preferred videos by estimated watch time descending
    preferredVideos.sort((a, b) => b.estimatedWatchTime - a.estimatedWatchTime);

    if (preferredVideos.length > 0) {
      const topPreferred = preferredVideos[0];
      console.log(`Selected preferred channel video: "${topPreferred.title}" by "${topPreferred.channel}"`);
      topPreferred.estimatedWatchTime = topPreferred.estimatedWatchTime + " seconds";
      return topPreferred;
    }

    // Sort other videos if no preferred channel videos found
    otherVideos.sort((a, b) => b.estimatedWatchTime - a.estimatedWatchTime);

    if (otherVideos.length > 0) {
      const topOther = otherVideos[0];
      console.log(`Selected top video (non-preferred channel): "${topOther.title}" by "${topOther.channel}"`);
      topOther.estimatedWatchTime = topOther.estimatedWatchTime + " seconds";
      return topOther;
    }

    console.log("No suitable videos found after filtering.");
    return null;

  } catch (error) {
    console.error("Error fetching top video:", error);
    return null;
  }
}

module.exports = { getTopVideoByEstimatedWatchTime };
