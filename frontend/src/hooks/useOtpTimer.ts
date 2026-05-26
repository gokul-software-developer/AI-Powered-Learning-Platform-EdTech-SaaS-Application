import { useState, useEffect } from "react";

// export const useOtpTimer = (initialSeconds = 60) => {

//   const [seconds, setSeconds] = useState(initialSeconds);
//   const [active, setActive] = useState(false);

//   useEffect(() => {
//     let timer: any;
//     if (active && seconds > 0) {
//       timer = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
//     } else if (seconds === 0) {
//       setActive(false);
//     }
//     return () => clearTimeout(timer);
//   }, [active, seconds]);

//   const start = () => {
//     setSeconds(initialSeconds);
//     setActive(true);
//   };

//   const stop = () => {
//     setActive(false);
//     setSeconds(initialSeconds);
//   };

//   return { seconds, active, start, stop };
// };
export const useOtpTimer = (initialTime = 60) => {
  const [seconds, setSeconds] = useState(initialTime);
  const [active, setActive] = useState(false);

  const start = (customTime = initialTime) => {
    setSeconds(customTime);
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          setActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);

  const stop = () => {
    setActive(false);
    setSeconds(initialTime);
  };

  return { seconds, active, start, stop };
};
