// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
//   } from "@/components/ui/accordion";
//   import { Button } from "@/components/ui/button";
//   import { Link } from "react-router-dom";
  
//   const Faq = () => {
//     return (
//       <div className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-green-800">
//         {/* Header Section */}
//         <section className="max-w-3xl text-center space-y-6">
//           <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
//   Got Any{" "}
//   <span className="text-red-600">Questions?</span>{" "}
//   We're Here to{" "}
//   <span className="text-yellow-200">Help!</span>
// </h1>

//           <p className="text-lg text-black leading-relaxed">
//             Have doubts? Drop us an email, and we’ll respond within{" "}
//             <span className="font-semibold">1–2 business days!</span>
//           </p>
  
//           {/* Buttons Section */}
//           <div className="flex flex-wrap justify-center gap-4">
//             <Button variant={"default"} size={"lg"} asChild>
//               <Link to={"/sign-in"} className="text-green-800 bg-white">
//                 Connect Back
//               </Link>
//             </Button>
//             <Button variant={"outline"} size={"lg"} asChild>
//               <Link to={"/sign-up"} className="text-white border-white">
//                 Get Started
//               </Link>
//             </Button>
//           </div>
//         </section>
  
//         {/* FAQ Section */}
//         <section className="max-w-2xl w-full mt-12">
//           <Accordion type="single" collapsible className="w-full pt-8">
//             {faqData.map(({ question, answer, id }) => (
//               <AccordionItem
//                 key={id}
//                 value={id}
//                 className="border-b border-white shadow-md rounded-lg"
//               >
//                 <AccordionTrigger className="text-lg text-black font-medium p-4 hover:bg-green-700 transition-colors">
//                   {question}
//                 </AccordionTrigger>
//                 <AccordionContent className="p-4 text-gray-200 bg-green-700 rounded-b-lg">
//                   {answer}
//                 </AccordionContent>
//               </AccordionItem>
//             ))}
//           </Accordion>
//         </section>
//       </div>
//     );
//   };
  
//   // FAQ Data
//   const faqData = [
//     {
//       id: "item-1",
//       question: "Does it support multiple devices?",
//       answer:
//         "Yes! You can access your study materials seamlessly across mobile, tablet, and desktop.",
//     },
//     {
//       id: "item-2",
//       question: "Can I export my notes?",
//       answer:
//         "Absolutely! Export your notes in various formats, including PDF and Markdown, for offline access.",
//     },
//     {
//       id: "item-3",
//       question: "Does it integrate with Notion?",
//       answer:
//         "Yes! You can sync your study notes directly with Notion for easy access and organization.",
//     },
//     {
//       id: "item-4",
//       question: "Can I connect Google Calendar?",
//       answer:
//         "Absolutely! Schedule your study sessions and get reminders synced with Google Calendar.",
//     },
//     {
//       id: "item-5",
//       question: "Does it support collaborative learning?",
//       answer:
//         "Yes! You can share notes, collaborate with friends, and study together in real-time.",
//     },
//     {
//       id: "item-6",
//       question: "Is there an AI-powered study assistant?",
//       answer:
//         "Yes! Our AI assistant helps you summarize topics, generate flashcards, and answer your questions instantly.",
//     },
//     {
//       id: "item-7",
//       question: "Can I track my progress?",
//       answer:
//         "Definitely! Our dashboard provides insights into your study habits, goals, and achievements.",
//     },
//   ];
  
//   export default Faq;
  // Enhanced FAQ Section
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Faq = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-br from-green-900 to-green-700">
      {/* Header Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-3xl text-center space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Got Questions?{" "}
          <span className="text-yellow-300">We Have Answers</span>
        </h1>
        <p className="text-lg text-green-100 leading-relaxed">
          Can't find what you're looking for? Contact our support team for 
          <span className="font-semibold text-white"> personalized assistance</span>.
        </p>

        {/* Buttons Section */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant={"default"} size={"lg"} asChild className="gap-2 bg-white text-green-800 hover:bg-green-100">
            <Link to={"/contact"}>
              <span>Contact Support</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <path d="m22 6-10 7L2 6"></path>
              </svg>
            </Link>
          </Button>
          <Button variant={"outline"} size={"lg"} asChild className="gap-2 border-white text-white hover:bg-green-600">
            <Link to={"/sign-up"}>
              <span>Get Started</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="max-w-2xl w-full mt-12"
      >
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map(({ question, answer, id }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <AccordionItem
                value={id}
                className="border border-green-600/30 rounded-lg overflow-hidden shadow-lg"
              >
                <AccordionTrigger className="text-lg font-medium p-4 hover:bg-green-600/20 transition-colors text-white">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="p-4 text-green-100 bg-green-800/50">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.section>
    </div>
  );
};

// FAQ Data
const faqData = [
  {
    id: "item-1",
    question: "Does it support multiple devices?",
    answer: "Yes! Access your study materials seamlessly across all your devices with automatic sync.",
  },
  {
    id: "item-2",
    question: "What formats can I export my notes in?",
    answer: "Export to PDF, Markdown, or DOCX for offline access and sharing with classmates.",
  },
  {
    id: "item-3",
    question: "How does the Notion integration work?",
    answer: "Automatically sync your notes, flashcards, and study schedules with your Notion workspace.",
  },
  {
    id: "item-4",
    question: "Can I collaborate with classmates?",
    answer: "Yes! Create shared study groups, collaborate on notes, and track group progress.",
  },
  {
    id: "item-5",
    question: "How does the AI assistant help with studying?",
    answer: "Our AI can summarize content, generate practice questions, explain concepts, and more.",
  },
];

export default Faq;