import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type Question = { question: string; options: string[]; answer: string };
//type QuizQuestions = Record<string, Question[]>;
type QuizQuestions = Question[];

type Result = { score: number; passed: boolean; createdAt: string };

const QUIZ_DURATION = 45 * 60; // 45 minutes

const QuizPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const { courseId, keywordIds } = state || {};
  const quizGeneratedKey = `quiz_generated_${courseId}`;
  const answersKey = `quiz_answers_${courseId}`;
   const timerKey = `quiz_start_time_${courseId}`;
  const quizDataKey = `quiz_data_${courseId}`;

  
  

  const [quizData, setQuizData] = useState<QuizQuestions | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmitted = useRef(false);
  const lockRef = useRef(false); // Prevent duplicate quiz generation

  // 🕒 Load saved answers on refresh
  useEffect(() => {
  const savedAnswers = sessionStorage.getItem(answersKey);
  const savedQuizData = sessionStorage.getItem(quizDataKey);
  const savedStartTime = sessionStorage.getItem(timerKey);

  if (savedAnswers) {
    try {
      setSelectedAnswers(JSON.parse(savedAnswers));
    } catch (_) {}
  }

  if (savedQuizData) {
    try {
      setQuizData(JSON.parse(savedQuizData));
    } catch (_) {}
  }

  if (savedStartTime) {
    const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
    const remaining = Math.max(QUIZ_DURATION - elapsed, 0);
    setTimeLeft(remaining);
  }
}, []);

  // 💾 Save answers on change
  useEffect(() => {
    if (Object.keys(selectedAnswers).length > 0) {
      sessionStorage.setItem(answersKey, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers]);
useEffect(() => {
    if (!hasSubmitted.current && quizData) {
      sessionStorage.setItem(`quiz_time_${courseId}`, String(timeLeft));
    }
  }, [timeLeft]);
  // ⏱️ Timer logic
useEffect(() => {
  if (!quizData || hasSubmitted.current || timeLeft <= 0) return;

  const tick = () => {
    setTimeLeft((prev) => {
      const next = prev - 1;
      if (next <= 0) {
  clearTimeout(timerRef.current!);

  // Delay auto submit slightly to ensure quizData is available
  setTimeout(() => {
    if (!hasSubmitted.current && quizData) {
      console.log("⏱ Timer expired — Auto-submitting...");
      handleSubmit(true).then(() => window.location.reload());
    }
  }, 100); // slight delay for safety

  return 0;
}

      return next;
    });

    timerRef.current = setTimeout(tick, 1000);
  };

  timerRef.current = setTimeout(tick, 1000);

  return () => clearTimeout(timerRef.current!);
}, [quizData, timeLeft]);



  useEffect(() => {
  if (!courseId || !Array.isArray(keywordIds)) {
    toast({
      title: "Invalid Quiz Start",
      description: "Missing course or topics. Please go back and try again.",
      variant: "destructive",
    });
    navigate("/final-assessment");
    return;
  }

  if (lockRef.current) return;
  lockRef.current = true;
const init = async () => {
  try {
    const statusRes = await axios.get(`${backendURL}/quiz/status?courseId=${courseId}`, {
      withCredentials: true,
    });

    if (statusRes.data?.attempted) {
      setResult({
        score: statusRes.data.score,
        passed: statusRes.data.passed,
        createdAt: statusRes.data.createdAt,
      });
      return;
    }

    const savedQuizData = sessionStorage.getItem(quizDataKey);
    const savedStartTime = sessionStorage.getItem(timerKey);

    // ✅ If quiz already generated and timer exists, just restore
    if (savedQuizData && savedStartTime) {
      const data = JSON.parse(savedQuizData);
      setQuizData(data);

      const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      const remaining = Math.max(QUIZ_DURATION - elapsed, 0);
      setTimeLeft(remaining);

      return;
    }

    // ❌ If not generated or timer not saved, clear and regenerate
    sessionStorage.removeItem(timerKey);
    sessionStorage.removeItem(quizDataKey);
    sessionStorage.removeItem(answersKey);

    const quizRes = await axios.post(
      `${backendURL}/quiz/generate`,
      { courseId, keywordIds },
      { withCredentials: true }
    );

    const data = quizRes.data.quiz.questions;
    setQuizData(data);

    sessionStorage.setItem(quizGeneratedKey, "true");
    sessionStorage.setItem(quizDataKey, JSON.stringify(data));
    sessionStorage.setItem(timerKey, Date.now().toString());
    setTimeLeft(QUIZ_DURATION);

  } catch (err: any) {
    toast({
      title: "Quiz Load Error",
      description: err.response?.data?.error || err.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  init();
}, [courseId, keywordIds]);
const handleDownload = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/certificate/${courseId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch certificate');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    // // 👇 Optional: clean & safe file name
    // const filename = `${user.first_name}_${course.course_name}_certificate.pdf`.replace(/\s+/g, '_');
    // link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('❌ Download failed:', err);
    toast({
      title: 'Download Failed',
      description: 'Unable to download certificate. Please try again.',
      variant: 'destructive',
    });
  }
};


console.log("quizData loaded:", quizData);
console.log("timeLeft:", timeLeft);
  // ✅ Submit quiz
  const handleSubmit = async (isAuto = false) => {
    if (!quizData || hasSubmitted.current) return;

    //if (isAuto && !isQuizComplete()) return;
    if (isAuto && !quizData) return; // allow auto-submit even if incomplete

    hasSubmitted.current = true;

    try {
      const res = await axios.post(
        `${backendURL}/quiz/submit-score`,
        { course_id: courseId, responses: collectAnswers(quizData) },
        { withCredentials: true }
      );

      setResult({
        score: res.data.score,
        passed: res.data.passed,
        createdAt: new Date().toISOString(),
      });

      sessionStorage.removeItem(quizGeneratedKey);
    sessionStorage.removeItem(answersKey);
    sessionStorage.removeItem(`quiz_data_${courseId}`);
    sessionStorage.removeItem(`quiz_time_${courseId}`);
      if (!isAuto) {
        toast({
          title: "Quiz Submitted",
          description: `You scored ${res.data.percentage}% — ${res.data.passed ? "Passed" : "Failed"}`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    }
  };

  // const groupAnswersByLevel = (quizData: QuizQuestions) => {
  //   const responses: Record<string, string[]> = {};
  //   for (const level in quizData) {
  //     responses[level] = quizData.map((_, i) => selectedAnswers[`${level}-${i}`] || "");
  //   }
  //   return responses;
  // };
const collectAnswers = (quizData: Question[]) => {
  return quizData.map((_, i) => selectedAnswers[`q-${i}`] || "");
};

  const isQuizComplete = () => {
    if (!quizData) return false;
    //for (const level in quizData) {
      for (let i = 0; i < quizData.length; i++) {
        if (!selectedAnswers[`q-${i}`]) return false;
      }
    //}
    return true;
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const renderResult = () => {
    if (!result) return null;
    const { score, passed, createdAt } = result;
    const attemptTime = new Date(createdAt);
    const nextTime = new Date(attemptTime.getTime() + 24 * 60 * 60 * 1000);
    //const canRetry = new Date() >= nextTime;

    return (
<div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-black text-white text-center">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="w-full max-w-xl bg-[#1c1c1c] border border-[#1f3321] rounded-xl p-8 shadow-lg"
  >
    <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${passed ? "text-green-400" : "text-red-500"}`}>
      {passed ? "Assessment Passed" : "Assessment Incomplete"}
    </h1>

    <p className="text-xl font-semibold text-gray-300 mb-2">
      Your Score: {typeof score === "number" ? score.toFixed(2) : "N/A"}/40
    </p>

    <p className="mb-6 text-md text-gray-400">
      {passed
        ? "Great job! You've demonstrated strong understanding."
        : "Don't worry — every setback is a setup for a comeback."}
    </p>

    {!passed && (
      <>
        <p className="text-sm text-red-400 mb-1">Next Attempt Available:</p>
        <p className="text-gray-400 text-md font-mono mb-4">{nextTime.toLocaleString()}</p>

        {/* {canRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md shadow transition"
          >
            Retry Assessment
          </motion.button>
        )} */}
     

      </>
    )}

    {passed && (
      <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  onClick={handleDownload}
  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md shadow transition"
>
  🎓 Download Certificate
</motion.button>

    )}
  </motion.div>
</div>

    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-300">
        ⏳ Generating your personalized quiz...
      </div>
    );
  }

  if (result) return renderResult();

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        ❌ No quiz available. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {/* ⏳ Timer */}
      <div className="fixed top-4 right-4 text-white bg-[#2c2c2c] px-4 py-2 rounded shadow-lg font-bold z-50">
        Time Left: {formatTime(timeLeft)}
      </div>

      {/* 🧠 Quiz UI */}
      {/* {quizData.map((level) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-[#0a1f1c] p-4 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold text-[#39f59c] mb-2">{level.toUpperCase()}</h2>
          {quizData.map((q, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-semibold text-white">{q.question}</p>
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="block text-gray-300 ml-2 cursor-pointer">
                  <input
                    type="radio"
                    // name={`${level}-${idx}`}
                    // value={opt}
                    // checked={selectedAnswers[`${level}-${idx}`] === opt}
                    // onChange={() =>
                    //   setSelectedAnswers((prev) => ({ ...prev, [`${level}-${idx}`]: opt }))
                    // }
                    name={`q-${idx}`}
value={opt}
checked={selectedAnswers[`q-${idx}`] === opt}
onChange={() =>
  setSelectedAnswers((prev) => ({ ...prev, [`q-${idx}`]: opt }))
}

                    className="mr-2 accent-green-500"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
        </motion.div>
      ))} */}
      {quizData.map((q, idx) => (
  <motion.div
    key={idx}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 * idx }}
    className="mb-6 bg-[#1c1c1c] p-4 rounded-lg shadow-md"
  >
    <p className="font-semibold  mb-2"
      style={{ color: "rgb(102, 131, 97)"}}>
      
      Q{idx + 1}: {q.question}
    </p>
    {q.options.map((opt, optIdx) => (
      <label key={optIdx} className="block text-gray-300 ml-2 cursor-pointer">
        <input
          type="radio"
          name={`q-${idx}`}
          value={opt}
          checked={selectedAnswers[`q-${idx}`] === opt}
          onChange={() =>
            setSelectedAnswers((prev) => ({ ...prev, [`q-${idx}`]: opt }))
          }
          className="mr-2 "
          style={{ accentColor: "rgb(102, 131, 97)" }} // Custom accent color
        />
        {opt}
      </label>
    ))}
  </motion.div>
))}


      <div className="text-center">
        <button
          onClick={() => handleSubmit(false)}
          disabled={!isQuizComplete()}
          className={`mt-4 px-6 py-2 ${
            isQuizComplete() ? "bg-[#09af67] hover:bg-[#0ec57a]" : "bg-gray-500 cursor-not-allowed"
          } text-white font-semibold rounded`}
        >
           Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
