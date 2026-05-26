// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { motion, AnimatePresence } from "framer-motion";
// import Fuse from "fuse.js";
// import graduationIcon from "../../assets/graduation-hat.png";
// const BASE_URL = import.meta.env.VITE_BACKEND_URL;
// const features = [
//   "Web Development",
//   "Python Programming",
//   "Data Structures & Algorithms",
//   "Mobile App Development",
//   "Machine Learning",
//   "Cybersecurity & Ethical Hacking",
//   "Data Analysis",
//   "SQL & Databases",
//   "DevOps",
//   "Cloud Computing",
//   "Git & GitHub",
//   "System Design",
//   "Java Programming",
//   "C++ Programming",
//   "UI/UX Design",
//   "Blockchain Development & Web3",
//   "Artificial Intelligence & Deep Learning",
//   "Operating Systems Fundamentals",
//   "Computer Networks",
//   "Software Testing & Automation"
// ];

// const relatedTopics: Record<string, string[]> = {
//   "Web Development": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
//   "Python Programming": ["Flask", "Django", "NumPy", "Pandas"],
//   "Data Structures & Algorithms": ["Arrays", "Trees", "Graphs", "Sorting"],
//   "Mobile App Development": ["Flutter", "React Native", "Dart", "Expo"],
//   "Machine Learning": ["Scikit-learn", "Regression", "Classification", "Model Evaluation"],
//   "Cybersecurity & Ethical Hacking": ["Penetration Testing", "Network Security", "OWASP", "Kali Linux"],
//   "Data Analysis": ["Excel Functions", "Power Query", "Pandas", "Power BI Dashboards"],
//   "SQL & Databases": ["MySQL", "PostgreSQL", "Joins", "Normalization"],
//   "DevOps": ["Docker", "Kubernetes", "Jenkins", "GitHub Actions"],
//   "Cloud Computing": ["EC2", "AWS", "Azure Functions", "GCP BigQuery"],
//   "Git & GitHub": ["Git Basics", "Branching", "Pull Requests", "Merge Conflicts"],
//   "System Design": ["Load Balancing", "Caching", "Scalability", "Microservices"],
//   "Java Programming": ["Spring Boot", "OOP", "Multithreading", "JVM"],
//   "C++ Programming": ["STL", "Pointers", "OOP in C++", "Memory Management"],
//   "UI/UX Design": ["Figma", "Wireframing","Adobe XD", "Prototyping"],
//   "Blockchain Development & Web3": ["Ethereum", "Smart Contracts", "Solidity", "Web3.js"],
//   "Artificial Intelligence & Deep Learning": ["Neural Networks", "TensorFlow", "PyTorch", "Computer Vision"],
//   "Operating Systems Fundamentals": ["Process Management", "Memory Management", "File Systems", "Threads"],
//   "Computer Networks": ["OSI Model", "TCP/IP", "Routing", "Network Protocols"],
//   "Software Testing & Automation": ["Unit Testing", "Selenium", "Jest", "Test Automation Frameworks"]
// };

// const fuseOptions = {
//   includeScore: true,
//   threshold: 0.4,
// };
// const fuse = new Fuse(features, fuseOptions);

// const MAX_SELECTION = 10;

// const FeatureSelection = () => {
//   const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
//   const [search, setSearch] = useState("");
//   const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);

//   const handleFeatureClick = (feature: string) => {
//     if (selectedFeatures.includes(feature)) return;
//     setSelectedFeatures((prev) => [...prev, feature]);
//     if (relatedTopics[feature]) {
//       setExpandedFeatures((prev) => [...prev, feature]);
//     }
//   };

//   const handleSelectRelated = (related: string) => {
//     if (selectedFeatures.length >= MAX_SELECTION || selectedFeatures.includes(related)) return;
//     setSelectedFeatures((prev) => [...prev, related]);
//   };

//   const handleRemove = (feature: string) => {
//     setSelectedFeatures((prev) => prev.filter((item) => item !== feature));
//     if (expandedFeatures.includes(feature)) {
//       setExpandedFeatures((prev) => prev.filter((item) => item !== feature));
//     }
//   };

//   const handleSubmit = async () => {
//     console.log("Selected Features:", selectedFeatures);
//     try {
//       const response = await fetch(`${BASE_URL}/features/save-features`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
  
//         },
//         credentials: "include", // Include credentials for session management
//         body: JSON.stringify({ features: selectedFeatures }),
//       });

//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
//       console.log("Server response:", data);
//        setShowSuccessPopup(true); // ✅ Show success popup
//     } catch (error) {
//       console.error("Error saving features:", error);
//       alert("Failed to save features. Please try again.");
//     }
//   };

//   const progress = (selectedFeatures.length / MAX_SELECTION) * 100;

//   const filteredFeatures =
//     search.trim() === ""
//       ? features
//       : fuse.search(search).map((result) => result.item);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 1.5, ease: "easeOut" }}
//       className="w-full min-h-screen flex flex-col items-center justify-start bg-black text-green-400 p-6 pt-16 relative overflow-hidden"
//     >
//       <div className="absolute top-0 left-0 w-48 h-48 bg-green-700 opacity-30 rounded-full blur-3xl"></div>
//       <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-700 opacity-30 rounded-full blur-3xl"></div>

//       <div className="relative z-10 flex flex-col items-center text-center">
//         <div className="flex items-center justify-center gap-4 mb-2">
//           <h1 className="text-xl font-bold text-gray-400">Let's Build Your Study Space</h1>
//           <img src={graduationIcon} alt="Graduation Icon" className="w-10 h-10" />
//         </div>
//         <h2 className="text-2xl font-extrabold text-white">
//           Pick the Features That Fit Your Study Style!
//         </h2>
//         <p className="text-sm text-gray-500 mt-1 mb-10">
//           Choose Wisely – Your Future Self is Watching!
//         </p>
//       </div>

//       <Input
//         type="text"
//         placeholder="Search for a course..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="w-4/5 md:w-3/5 p-3 border border-green-500 bg-white text-black rounded-full shadow-md relative z-10 mb-12"
//       />

//       <div className="w-4/5 md:w-2/5 mb-6 relative z-10">
//         <div className="w-full bg-green-900 rounded-full h-3">
//           <div
//             className="bg-green-500 h-3 rounded-full transition-all duration-300"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>

//       {selectedFeatures.length > 0 && (
//         <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl relative z-10">
//           {selectedFeatures.map((feature) => (
//             <span
//               key={feature}
//               className="bg-green-600 text-black px-4 py-2 rounded-full text-sm font-medium shadow cursor-pointer hover:bg-red-500 transition"
//               onClick={() => handleRemove(feature)}
//             >
//               {feature} ✕
//             </span>
//           ))}
//         </div>
//       )}

//       <div className="flex flex-wrap justify-center gap-4 mt-0 max-w-3xl relative z-10">
//         {filteredFeatures.flatMap((feature, idx) => {
//           if (expandedFeatures.includes(feature)) {
//             return relatedTopics[feature]?.map((related, rIdx) => (
//               <motion.button
//                 key={`${feature}-${related}`}
//                 onClick={() => handleSelectRelated(related)}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.03 * rIdx }}
//                 className="px-6 py-3 text-sm rounded-xl font-medium shadow-md bg-green-600 text-green-200 hover:bg-green-500 hover:text-black"
//               >
//                 {related}
//               </motion.button>
//             ));
//           }

//           if (!selectedFeatures.includes(feature)) {
//             return (
//               <motion.button
//                 key={feature}
//                 onClick={() => handleFeatureClick(feature)}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: idx * 0.03 }}
//                 className="px-6 py-3 text-sm rounded-xl font-medium shadow-md bg-green-900 text-green-300 hover:bg-green-600 hover:text-black"
//               >
//                 {feature}
//               </motion.button>
//             );
//           }

//           return null;
//         })}
//       </div>
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//         className="mt-10 relative z-10"
//       >
//         <Button
//           className="px-10 py-4 text-lg rounded-full shadow-lg transition-all duration-200 ease-in-out hover:brightness-110 hover:scale-105"
//           style={{ backgroundColor: "#85CBA0", color: "black" }}
//           onClick={handleSubmit}
//         >
//           Continue
//         </Button>
//       </motion.div>

//       {/* ✅ Success Popup */}
//       <AnimatePresence>
//         {showSuccessPopup && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white text-black p-8 rounded-2xl shadow-xl text-center w-[90%] md:w-[400px]"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//             >
//               <h2 className="text-xl font-bold mb-4">🎉 Features Saved Successfully!</h2>
//               <p className="mb-6 text-sm text-gray-700">You're now ready to start learning.</p>
//               <Button
//                 onClick={() => {
//                   setShowSuccessPopup(false);
//                   // You can also add navigation logic here
//                 }}
//                 className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
//               >
//                 Start Learning
//               </Button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default FeatureSelection;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import graduationIcon from "../../assets/graduation-hat.png";

const hardcodedFeatures = [
  "Web Development", "Python Programming", "Data Structures & Algorithms",
  "Mobile App Development", "Machine Learning", "Cybersecurity & Ethical Hacking",
  "Data Analysis", "SQL & Databases", "DevOps", "Cloud Computing", "Git & GitHub",
  "System Design", "Java Programming", "C++ Programming", "UI/UX Design",
  "Blockchain Development & Web3", "Artificial Intelligence & Deep Learning",
  "Operating Systems Fundamentals", "Computer Networks", "Software Testing & Automation"
];

const fuse = new Fuse(hardcodedFeatures, { includeScore: true, threshold: 0.4 });
const MAX_SELECTION = 10;

const FeatureSelection = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, string[]>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // const fetchRelatedTopics = async (feature: string) => {
  //   try {
  //     const res = await fetch(
  //       `http://localhost:3000/api/features/generate/related-topics?feature=${encodeURIComponent(feature)}`,
  //       {
  //         method: "POST",
  //         credentials: "include",
  //       }
  //     );
  //     const data = await res.json();
  //     if (data?.relatedTopics) {
  //       setExpandedTopics((prev) => ({ ...prev, [feature]: data.relatedTopics }));
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch related topics:", err);
  //   }
  // };
const fetchRelatedTopics = async (feature: string) => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/features/generate/related-topics`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: feature }),
      }
    );
    const data = await res.json();
    if (data?.relatedTopics) {
      setExpandedTopics((prev) => ({ ...prev, [feature]: data.relatedTopics }));
    }
  } catch (err) {
    console.error("Failed to fetch related topics:", err);
  }
};

  const handleFeatureClick = (feature: string) => {
    if (selectedFeatures.includes(feature) || selectedFeatures.length >= MAX_SELECTION) return;
    setSelectedFeatures((prev) => [...prev, feature]);
    if (!expandedTopics[feature]) fetchRelatedTopics(feature);
  };

  const handleSelectRelated = (related: string) => {
    if (selectedFeatures.length >= MAX_SELECTION || selectedFeatures.includes(related)) return;
    setSelectedFeatures((prev) => [...prev, related]);
  };

  const handleRemove = (feature: string) => {
    setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
    const newTopics = { ...expandedTopics };
    delete newTopics[feature];
    setExpandedTopics(newTopics);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/features/save-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: selectedFeatures }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error saving features");
      setShowSuccessPopup(true);
    } catch (error) {
      alert("Failed to save features. Please try again.");
    }
  };

  const progress = (selectedFeatures.length / MAX_SELECTION) * 100;
  const filteredFeatures = search.trim()
    ? fuse.search(search.trim()).map(result => result.item)
    : hardcodedFeatures;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5 }}
      className="w-full min-h-screen flex flex-col items-center justify-start bg-black text-green-400 p-6 pt-16 relative"
    >
      <div className="absolute top-0 left-0 w-48 h-48 bg-green-700 opacity-30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-700 opacity-30 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-xl font-bold text-gray-400">Let's Build Your Study Space</h1>
          <img src={graduationIcon} alt="Graduation Icon" className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Pick the Features That Fit Your Study Style!</h2>
        <p className="text-sm text-gray-500 mt-1 mb-10">Choose Wisely – Your Future Self is Watching!</p>
      </div>

      <Input
        type="text"
        placeholder="Search for a course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-4/5 md:w-3/5 p-3 border border-green-500 bg-white text-black rounded-full shadow-md mb-12"
      />

      <div className="w-4/5 md:w-2/5 mb-6 relative z-10">
        <div className="w-full bg-green-900 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {selectedFeatures.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl relative z-10">
          {selectedFeatures.map((feature) => (
            <span
              key={feature}
              onClick={() => handleRemove(feature)}
              className="bg-green-600 text-black px-4 py-2 rounded-full text-sm font-medium shadow cursor-pointer hover:bg-red-500 transition"
            >
              {feature} ✕
            </span>
          ))}
        </div>
      )}

      {/* Combined Feature Buttons and Custom Add */}
      <div className="flex flex-wrap justify-center gap-4 mt-0 w-full max-w-6xl relative z-10">
        {filteredFeatures.length > 0
          ? filteredFeatures.map((feature, idx) => {
              if (selectedFeatures.includes(feature)) {
                const related = expandedTopics[feature];
                return related ? (
                  <div key={feature} className="flex flex-wrap gap-2 justify-center items-start">
                    {related.map((relatedTopic, j) => (
                      <motion.button
                        key={`${feature}-${relatedTopic}`}
                        onClick={() => handleSelectRelated(relatedTopic)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.02 * j }}
                        className="px-6 py-3 text-sm rounded-xl font-medium shadow-md bg-green-600 text-green-200 hover:bg-green-500 hover:text-black"
                      >
                        {relatedTopic}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <span key={feature} className="text-sm text-green-300 italic">
                    Loading...
                  </span>
                );
              } else {
                return (
                  <motion.button
                    key={feature}
                    onClick={() => handleFeatureClick(feature)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="px-6 py-3 text-sm rounded-xl font-medium shadow-md bg-green-900 text-green-300 hover:bg-green-600 hover:text-black min-w-[150px]"
                  >
                    {feature}
                  </motion.button>
                );
              }
            })
          : search.trim() && !selectedFeatures.includes(search.trim())
          ? (
              <motion.button
                key="custom-topic"
                onClick={() => handleFeatureClick(search.trim())}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-3 text-sm rounded-xl font-medium shadow-md bg-green-700 text-green-100 hover:bg-green-500 hover:text-black min-w-[180px]"
              >
                ➕ Add "{search.trim()}" as a custom topic
              </motion.button>
            )
          : null}

        {/* Related topics for custom topics */}
        {selectedFeatures
          .filter((feature) => !hardcodedFeatures.includes(feature))
          .map((feature) => {
            const related = expandedTopics[feature];
            return related ? (
              <div key={feature} className="flex flex-wrap gap-2 justify-center items-start">
                {related.map((relatedTopic, j) => (
                  <motion.button
                    key={`${feature}-${relatedTopic}`}
                    onClick={() => handleSelectRelated(relatedTopic)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * j }}
                    className="px-6 py-3 text-sm rounded-xl font-medium shadow-md bg-green-600 text-green-200 hover:bg-green-500 hover:text-black"
                  >
                    {relatedTopic}
                  </motion.button>
                ))}
              </div>
            ) : (
              <span key={feature} className="text-sm text-green-300 italic">
                ...
              </span>
            );
          })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 relative z-10"
      >
        <Button
          className="px-10 py-4 text-lg rounded-full shadow-lg hover:brightness-110 hover:scale-105"
          style={{ backgroundColor: "#85CBA0", color: "black" }}
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </motion.div>

      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-black p-8 rounded-2xl shadow-xl text-center w-[90%] md:w-[400px]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-xl font-bold mb-4">🎉 Features Saved Successfully!</h2>
              <p className="mb-6 text-sm text-gray-700">You're now ready to start learning.</p>
              <Button
                onClick={() => {
                  setShowSuccessPopup(false);
                  window.location.href = "/overview";
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                Start Learning
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeatureSelection;
