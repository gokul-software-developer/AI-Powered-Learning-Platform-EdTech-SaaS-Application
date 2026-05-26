// // // // import { auth } from "./firebase";
// // // // import {
// // // //   RecaptchaVerifier,
// // // //   signInWithPhoneNumber,
// // // //   ConfirmationResult,
// // // // } from "firebase/auth";

// // // // let recaptchaVerifier: RecaptchaVerifier | null = null;

// // // // export const setupRecaptcha = (containerId: string) => {
// // // //   if (!recaptchaVerifier) {
// // // //     recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
// // // //       size: "invisible",
// // // //       callback: () => console.log("reCAPTCHA solved"),
// // // //       "expired-callback": () => {
// // // //         recaptchaVerifier = null;  // reset on expiry
// // // //       }
// // // //     });
// // // //     recaptchaVerifier.render();
// // // //   }
// // // //   return recaptchaVerifier;
// // // // };

// // // // export const sendOtp = async (phoneNumber: string) => {
// // // //   if (!recaptchaVerifier) throw new Error("reCAPTCHA not initialized");
// // // //   return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
// // // // };
// // // import { auth } from "./firebase";
// // // import {
// // //   RecaptchaVerifier,
// // //   signInWithPhoneNumber,
// // //   ConfirmationResult,
// // // } from "firebase/auth";

// // // let recaptchaVerifier: RecaptchaVerifier | null = null;

// // // export const setupRecaptcha = (containerId: string) => {
// // //   // 🧹 Clean up old verifier if it exists
// // //   if (recaptchaVerifier) {
// // //     recaptchaVerifier.clear(); // clears the rendered widget
// // //     recaptchaVerifier = null;
// // //   }

// // //   // ✅ Create a new verifier
// // //   recaptchaVerifier = new RecaptchaVerifier(
// // //     auth,
// // //     containerId,
// // //     {
// // //       size: "invisible",
// // //       callback: () => {
// // //         console.log("reCAPTCHA solved");
// // //       },
// // //       "expired-callback": () => {
// // //         recaptchaVerifier = null;
// // //         console.warn("reCAPTCHA expired. Please try again.");
// // //       },
// // //     }
// // //   );

// // //   recaptchaVerifier.render();
// // //   return recaptchaVerifier;
// // // };

// // // export const sendOtp = async (phoneNumber: string): Promise<ConfirmationResult> => {
// // //   if (!recaptchaVerifier) throw new Error("reCAPTCHA not initialized");
// // //   return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
// // // };
// // import { auth } from "./firebase";
// // import {
// //   RecaptchaVerifier,
// //   signInWithPhoneNumber,
// //   ConfirmationResult,
// // } from "firebase/auth";

// // let recaptchaVerifier: RecaptchaVerifier | null = null;

// // export const setupRecaptcha = (containerId: string) => {
// //   // 🚫 Clear existing widget from DOM (if any)
// //   if (recaptchaVerifier) {
// //     try {
// //       recaptchaVerifier.clear(); // 🔁 remove previous reCAPTCHA widget
// //     } catch (err) {
// //       console.warn("Failed to clear previous reCAPTCHA:", err);
// //     }
// //     recaptchaVerifier = null;
// //   }

// //   // ✅ Create new instance
// //   recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
// //     size: "invisible",
// //     callback: () => console.log("✅ reCAPTCHA solved"),
// //     'expired-callback': () => {
// //       console.warn("⚠️ reCAPTCHA expired");
// //       recaptchaVerifier = null;
// //     },
// //   });

// //   return recaptchaVerifier.render().then(() => {
// //     return recaptchaVerifier;
// //   });
// // };

// // export const sendOtp = async (phoneNumber: string): Promise<ConfirmationResult> => {
// //   if (!recaptchaVerifier) {
// //     throw new Error("reCAPTCHA not initialized");
// //   }
// //   return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
// // };
// import { auth } from "./firebase";
// import {
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   ConfirmationResult,
// } from "firebase/auth";

// let recaptchaVerifier: RecaptchaVerifier | null = null;

// export const setupRecaptcha = (containerId: string) => {
//   if (
//     !recaptchaVerifier ||
//     (recaptchaVerifier as any)._widgetId === null // ✅ reCAPTCHA got removed
//   ) {
//     recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
//       size: "invisible",
//       callback: () => console.log("✅ reCAPTCHA solved"),
//       "expired-callback": () => {
//         console.warn("⚠️ reCAPTCHA expired");
//         recaptchaVerifier = null; // allow fresh re-init
//       },
//     });
//     recaptchaVerifier.render();
//   }

//   return recaptchaVerifier;
// };

// export const sendOtp = async (phoneNumber: string) => {
//   if (!recaptchaVerifier) {
//     throw new Error("reCAPTCHA not initialized");
//   }

//   return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
// };
import { auth } from "./firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (containerId: string) => {
  const needsReset =
    !recaptchaVerifier || (recaptchaVerifier as any)._widgetId === null;

  if (needsReset) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => console.log("✅ reCAPTCHA solved"),
      "expired-callback": () => {
        console.warn("⚠️ reCAPTCHA expired");
        recaptchaVerifier = null;
      },
    });

    recaptchaVerifier.render().then((widgetId) => {
      console.log("🔁 reCAPTCHA rendered, widget ID:", widgetId);
    });
  }

  return recaptchaVerifier;
};

export const sendOtp = async (phoneNumber: string) => {
  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not initialized");
  }

  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};
