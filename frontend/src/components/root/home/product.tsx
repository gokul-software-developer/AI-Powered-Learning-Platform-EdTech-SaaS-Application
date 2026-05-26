import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Product = () => {
  return (
    <div className="space-y-0">
      {/* First Section - Original (Image Right) */}
      <div className="relative h-screen w-full flex flex-col md:flex-row items-center justify-center px-6 md:px-16 py-12 overflow-hidden">
        {/* Animated background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute inset-0 bg-black z-0"
        />
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-[url('/pattern.jpg')] bg-cover bg-center z-0 opacity-40"
        />

        {/* Text Section */}
        <motion.section 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex flex-col justify-center gap-8 md:px-16 text-white z-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Smart Learning
            </span>{" "}
            Made Simple
          </h1>
          <p className="text-lg tracking-tight leading-relaxed text-gray-300">
            Our platform integrates with your favorite tools to create a seamless 
            learning experience. Automate note-taking, get personalized study plans, 
            and track your progress with intuitive analytics.
          </p>
          <div className="flex flex-row gap-6 items-center">
            {/* <Button variant={"default"} size={"lg"} asChild className="gap-2">
              <Link to={"/sign-up"}>
                <span>Start Free Trial</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </Button>
            <Button variant={"outline"} size={"lg"} asChild>
              <Link to={"/features"}>Explore Features</Link>
            </Button> */}
          </div>
        </motion.section>

        {/* Image Section */}
        <motion.section 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex justify-center md:justify-end md:pl-12 z-10"
        >
          <div className="relative">
            <img
              src="/product.png"
              alt="Product interface"
              className="w-full h-auto max-h-[85vh] object-cover rounded-2xl shadow-2xl shadow-green-500/20"
            />
            <div className="absolute inset-0 rounded-2xl border-2 border-green-500/30 pointer-events-none"></div>
          </div>
        </motion.section>
      </div>


{/* 
{/* Modern Section Divider */}
<div className="relative h-16 w-full">
  {/* Geometric pattern */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_65%,_hsl(142.1,76.2%,36.3%,0.3)_65%,_hsl(142.1,76.2%,36.3%,0.3)_70%,_transparent_70%)] bg-[length:40px_40px]"></div>
  </div>
  
  {/* Animated chevrons */}
  <div className="absolute inset-0 flex items-center justify-center gap-4">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 0, opacity: 0.3 }}
        animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.2
        }}
        className="text-green-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </motion.div>
    ))}
  </div>
</div> 

      {/* Second Section - Image Left */}
      <div className="relative h-screen w-full flex flex-col md:flex-row items-center justify-center px-6 md:px-16 py-12 overflow-hidden">
        {/* Same background as first section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute inset-0 bg-black z-0"
        />
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-[url('/pattern.jpg')] bg-cover bg-center z-0 opacity-40"
        />

        {/* Image Section - Now on Left */}
        <motion.section 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex justify-center md:justify-start md:pr-12 z-10 order-1 md:order-none"
        >
          <div className="relative">
            <img
              src="/product.png"
              alt="Analytics dashboard"
              className="w-full h-auto max-h-[85vh] object-cover rounded-2xl shadow-2xl shadow-green-500/20"
            />
            <div className="absolute inset-0 rounded-2xl border-2 border-green-500/30 pointer-events-none"></div>
          </div>
        </motion.section>

        {/* Text Section - Now on Right */}
        <motion.section 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex flex-col justify-center gap-8 md:px-16 text-white z-10 order-2 md:order-none"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Advanced Analytics
            </span>{" "}
            for Your Progress
          </h2>
          <p className="text-lg tracking-tight leading-relaxed text-gray-300">
            Track your learning journey with our comprehensive analytics dashboard.
            Visualize your improvement, identify weak areas, and optimize your
            study time with data-driven insights.
          </p>
          <div className="flex flex-row gap-6 items-center">
            <Button variant={"default"} size={"lg"} asChild className="gap-2">
              <Link to={"/sign-up"}>
                <span>View Dashboard</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </Button>
            <Button variant={"outline"} size={"lg"} asChild>
              <Link to={"/features"}>See All Features</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Product;