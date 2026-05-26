import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Grids from "@/assets/grid-lines.png";
import Stars from "@/assets/stars.png";
import { useCheckSession } from "@/hooks/use-check-session";

const Hero = () => {
  useCheckSession();

  // State to track if screen is >= 1450px wide
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    // Function to update showImages based on window width
    const handleResize = () => {
      setShowImages(window.innerWidth >= 1450);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(100%_100%_at_center,hsl(142.1,76.2%,36.3%,0.4)_5%,hsl(142.1,66%,38%,0.2)_20%,transparent_100%)]">
      <div
        className="min-h-[90vh] flex w-full relative px-4 md:px-0 justify-center items-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${Stars})`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl z-10 relative mx-auto text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
            Your AI-Powered Study Plan Curator
          </h1>
          <p className="text-lg font-normal leading-relaxed text-gray-600 dark:text-gray-300">
            Transform your study sessions with personalized plans, smart scheduling,{" "}
            and progress tracking. Our AI creates the perfect roadmap for your academic success.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center">
            <Button variant={"default"} size={"lg"} asChild className="gap-2">
              <Link to={"/sign-up"}>
                <span>Create your plan</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </Button>

            <Button variant={"outline"} size={"lg"} asChild>
              <Link to={"/features"} className="flex items-center gap-2">
                <span>How it works</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </Link>
            </Button>
          </div>
        </motion.main>

        {/* Conditionally render big images only if screen width >= 1450px */}
        {showImages && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-[90vh] absolute w-screen"
            >
              <img
                src="/cta (1).png"
                alt="Decorative illustration"
                className="h-[40vh] w-[40vh] object-cover absolute top-32 left-28"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-[90vh] w-screen absolute"
            >
              <img
                src="/cta (2).png"
                alt="Decorative illustration"
                className="h-[45vh] w-[40vh] object-cover absolute bottom-12 right-12"
              />
            </motion.div>
          </>
        )}

        {/* Animated grid background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 h-[90vh] w-full overflow-hidden"
          style={{
            backgroundImage: `url(${Grids})`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>
    </main>
  );
};

export default Hero;
