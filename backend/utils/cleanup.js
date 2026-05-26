// // // cleanup.js
// // const cron = require("node-cron");
// // const db = require("../models/QuizAttempt");
// // const Quiz = db.QuizAttempt;

// // // Runs every day at midnight
// // cron.schedule("0 0 * * *", async () => {
// //   const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
// //   try {
// //     const deleted = await Quiz.destroy({
// //       where: {
// //         passed: false,
// //         date: { [db.Sequelize.Op.lte]: cutoff },
// //       },
// //     });
// //     console.log(`🧹 Cleanup complete: ${deleted} old failed attempts removed`);
// //   } catch (err) {
// //     console.error("❌ Cleanup failed:", err.message);
// //   }
// // });
// // cleanup.js
// const cron = require("node-cron");
// const db = require("../models"); // Use index.js to access both QuizAttempt and Sequelize
// const Quiz = db.QuizAttempt;
// const { Op } = db.Sequelize;

// // 🧪 For testing: Runs every 10 seconds (change to "0 0 * * *" for midnight daily)
// cron.schedule("*/10 * * * * *", async () => {
//   const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

//   try {
//     const deleted = await Quiz.destroy({
//       where: {
//         passed: false,
//         date: { [Op.lte]: cutoff },
//       },
//     });

//     console.log(`🧹 [${new Date().toLocaleTimeString()}] Deleted ${deleted} failed quiz attempts older than 24h`);
//   } catch (err) {
//     console.error("❌ Cleanup failed:", err.message);
//   }
// });
const cron = require("node-cron");
const db = require("../models"); // Index exports Sequelize & models
const Quiz = db.QuizAttempt;
const { Op } = db.Sequelize;

// 🧪 For testing: runs every 10 seconds. Change to "0 0 * * *" for midnight.
cron.schedule("0 0 * * *", async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  try {
    const deleted = await Quiz.destroy({
      where: {
        [Op.or]: [
          { passed: false },
          { passed: null }
        ],
        createdAt: {
          [Op.lte]: cutoff
        }
      }
    });

    console.log(`🧹 [${new Date().toLocaleTimeString()}] Deleted ${deleted} old failed/unsubmitted quiz attempts`);
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  }
});
