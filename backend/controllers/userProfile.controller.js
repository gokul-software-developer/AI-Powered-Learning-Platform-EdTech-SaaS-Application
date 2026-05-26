const { User, Follow, FollowRequest,QuizAttempt, Course, StudyPlan,sequelize, Videos } = require("../models");
const { Op } = require("sequelize");

// Helper: check if viewer can see target's follow lists
async function canViewFollowData(targetUserId, viewerUserId) {
  if (targetUserId === viewerUserId) return true;

  const targetUser = await User.findByPk(targetUserId, { attributes: ["is_public"] });
  if (!targetUser) throw new Error("User not found");
  if (targetUser.is_public) return true;

  const acceptedFollow = await Follow.findOne({
    where: { followerId: viewerUserId, followingId: targetUserId },
  });

  return Boolean(acceptedFollow);
}

// GET profile details
exports.getUserProfile = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId, 10);
    const sessionUserId = req.session.userId;

    if (!sessionUserId) return res.status(401).json({ error: "Unauthorized" });
    if (isNaN(requestedUserId)) return res.status(400).json({ error: "Invalid ID" });

    const user = await User.findByPk(requestedUserId, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        
        "bio",
        "is_public",
        "follower_count",
        "following_count",
        "created_at",
        "updated_at",
         "sync_with_notion",
    "sync_with_google",
      ],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isFollowing = await Follow.findOne({
      where: { followerId: sessionUserId, followingId: requestedUserId },
    });

    const hasPendingRequest = await FollowRequest.findOne({
      where: { followerId: sessionUserId, followingId: requestedUserId, status: "pending" },
    });

    res.json({
      id: user.id,
      name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      bio: user.bio,
      is_public: user.is_public,
      follower_count: user.follower_count,
      following_count: user.following_count,
      joined_on: user.created_at,
      updated_at: user.updated_at,
       sync_with_notion: user.sync_with_notion,
  sync_with_google: user.sync_with_google,
      is_following: Boolean(isFollowing),
      has_pending_request: Boolean(hasPendingRequest),
    });
  } catch (error) {
    console.error("[getUserProfile] Error:", error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

// PATCH update profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { bio, is_public, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const wasPrivate = !user.is_public;

    if (bio !== undefined) user.bio = bio;
    if (is_public !== undefined) user.is_public = is_public;

    await user.save();

    // Auto accept pending requests if user switched to public
    if (wasPrivate && user.is_public) {
      const pending = await FollowRequest.findAll({
        where: { followingId: userId, status: "pending" },
      });

      for (const req of pending) {
        await Follow.create({ followerId: req.followerId, followingId: userId });
        await User.increment("follower_count", { where: { id: userId } });
        await User.increment("following_count", { where: { id: req.followerId } });
        await req.destroy();
      }
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("[updateUserProfile] Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.followUser = async (req, res) => {
  const followerId = req.session.userId;
  const followingId = parseInt(req.params.userId, 10);

  if (!followerId) return res.status(401).json({ error: "Unauthorized" });
  if (followerId === followingId) return res.status(400).json({ error: "Cannot follow yourself" });

  const io = req.app.get("io");

  try {
    const target = await User.findByPk(followingId);
    if (!target) return res.status(404).json({ error: "User not found" });

    const existing = await Follow.findOne({ where: { followerId, followingId } });
    if (existing) return res.status(400).json({ error: "Already following" });

    if (!target.is_public) {
      const existingRequest = await FollowRequest.findOne({
        where: { followerId, followingId, status: "pending" },
      });
      if (existingRequest) return res.status(400).json({ error: "Follow request already sent" });

      await FollowRequest.create({ followerId, followingId, status: "pending" });

      console.log(`Emit follow request notification to user: ${followingId}`);
      io.to(`profile_${followingId}`).emit("profileChanged", {
        type: "request",
        fromUser: { id: followerId },
      });

      return res.json({ message: "Follow request sent" });
    }

    await sequelize.transaction(async (transaction) => {
      await Follow.create({ followerId, followingId }, { transaction });
      await User.increment("follower_count", { by: 1, where: { id: followingId }, transaction });
      await User.increment("following_count", { by: 1, where: { id: followerId }, transaction });
    });

    console.log(`Emit follow notification to user: ${followingId}`);
    io.to(`profile_${followingId}`).emit("profileChanged", {
      type: "follow",
      fromUser: { id: followerId },
    });

    return res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("[followUser] Error:", error);
    return res.status(500).json({ error: "Follow failed" });
  }
};

// DELETE unfollow and delete any request
exports.unfollowUser = async (req, res) => {
  const followerId = req.session.userId;
  const followingId = parseInt(req.params.userId, 10);
  const io = req.app.get('io');

  if (!followerId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await sequelize.transaction(async (transaction) => {
      const deleted = await Follow.destroy({ where: { followerId, followingId }, transaction });
      await FollowRequest.destroy({ where: { followerId, followingId }, transaction });

      if (deleted) {
        await User.decrement("follower_count", { by: 1, where: { id: followingId }, transaction });
        await User.decrement("following_count", { by: 1, where: { id: followerId }, transaction });

        io.to(`profile_${followingId}`).emit("profileChanged", {
          type: "unfollow",
          fromUser: { id: followerId },
        });
      }
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("[unfollowUser] Error:", err);
    res.status(500).json({ error: "Unfollow failed" });
  }
};

// GET followers list for target user with access check
// exports.getFollowers = async (req, res) => {
//   try {
//     const sessionUserId = req.session.userId;
//     const requestedUserId = parseInt(req.params.userId, 10);

//     if (!sessionUserId) return res.status(401).json({ error: "Unauthorized" });

//     const canView = await canViewFollowData(requestedUserId, sessionUserId);
//     if (!canView) return res.status(403).json({ error: "Access denied" });

//     const followers = await User.findAll({
//       include: [
//         {
//           model: Follow,
//           as: "FollowingFollows",
//           where: { followingId: requestedUserId },
//           attributes: [],
//         },
//       ],
//       attributes: ["id", "first_name", "last_name", "email"],
//     });

//     const formatted = followers.map((u) => ({
//       id: u.id,
//       name: `${u.first_name} ${u.last_name}`.trim(),
//       email: u.email,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error("[getFollowers] Error:", err);
//     res.status(500).json({ error: "Failed to fetch followers" });
//   }
// };
exports.getFollowers = async (req, res) => {
  try {
    const sessionUserId = req.session.userId;
    const requestedUserId = parseInt(req.params.userId, 10);

    if (!sessionUserId) return res.status(401).json({ error: "Unauthorized" });

    const canView = await canViewFollowData(requestedUserId, sessionUserId);
    if (!canView) return res.status(403).json({ error: "Access denied" });

    const user = await User.findByPk(requestedUserId, {
      include: [{
        model: User,
        as: "UserFollowers", // Alias from belongsToMany
        attributes: ["id", "first_name", "last_name"],
        through: { attributes: [] }, // exclude junction table data
      }],
      attributes: [], // no user fields needed here
    });

    const formatted = (user?.UserFollowers || []).map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`.trim(),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("[getFollowers] Error:", err);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

// GET following list for target user with access check
exports.getFollowing = async (req, res) => {
  try {
    const sessionUserId = req.session.userId;
    const requestedUserId = parseInt(req.params.userId, 10);

    if (!sessionUserId) return res.status(401).json({ error: "Unauthorized" });

    const canView = await canViewFollowData(requestedUserId, sessionUserId);
    if (!canView) return res.status(403).json({ error: "Access denied" });

    const user = await User.findByPk(requestedUserId, {
      include: [{
        model: User,
        as: "UserFollowings", // Correct alias from belongsToMany
        attributes: ["id", "first_name", "last_name"],
        through: { attributes: [] },
      }],
      attributes: [],
    });

    const formatted = (user?.UserFollowings || []).map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`.trim(),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("[getFollowing] Error:", err);
    res.status(500).json({ error: "Failed to fetch following list" });
  }
};

// GET pending follow requests to current logged-in user
exports.getPendingFollowRequests = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const requests = await FollowRequest.findAll({
      where: { followingId: userId, status: "pending" },
      include: [
        {
          model: User,
          as: "Follower",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = requests.map((r) => ({
      id: r.Follower.id,
      name: `${r.Follower.first_name} ${r.Follower.last_name}`.trim(),
      requested_at: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("[getPendingFollowRequests] Error:", err);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

// POST accept follow request
exports.acceptFollowRequest = async (req, res) => {
  try {
    const followingId = req.session.userId;
    const followerId = parseInt(req.params.followerId, 10);

    const io = req.app.get('io');

    const request = await FollowRequest.findOne({
      where: { followerId, followingId, status: "pending" },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });

    await Follow.create({ followerId, followingId });
    await User.increment("follower_count", { where: { id: followingId } });
    await User.increment("following_count", { where: { id: followerId } });
    await request.destroy();

    // Emit follow event to the user who got accepted
    io.to(`profile_${followingId}`).emit("profileChanged", {
      type: "follow",
      fromUser: { id: followerId },
    });

    res.json({ message: "Follow request accepted" });
  } catch (err) {
    console.error("[acceptFollowRequest] Error:", err);
    res.status(500).json({ error: "Failed to accept request" });
  }
};

// POST reject follow request
exports.rejectFollowRequest = async (req, res) => {
  try {
    const followingId = req.session.userId;
    const followerId = parseInt(req.params.followerId, 10);

    const io = req.app.get('io');

    const request = await FollowRequest.findOne({
      where: { followerId, followingId, status: "pending" },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });

    await request.destroy();

    // Emit reject event to the related user (optional)
    io.to(`profile_${followingId}`).emit("profileChanged", {
      type: "request_rejected",
      fromUser: { id: followerId },
    });

    res.json({ message: "Follow request rejected" });
  } catch (err) {
    console.error("[rejectFollowRequest] Error:", err);
    res.status(500).json({ error: "Failed to reject request" });
  }
};

// DELETE cancel follow request (sent by you)
exports.cancelFollowRequest = async (req, res) => {
  try {
    const followerId = req.session.userId;
    const followingId = parseInt(req.params.userId, 10);

    const request = await FollowRequest.findOne({
      where: { followerId, followingId, status: "pending" },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });

    await request.destroy();
    res.json({ message: "Follow request canceled" });
  } catch (err) {
    console.error("[cancelFollowRequest] Error:", err);
    res.status(500).json({ error: "Failed to cancel follow request" });
  }
};

// controllers/userProfileController.js


exports.getUserAccomplishments = async (req, res) => {
  const userId = req.params.userId;

  try {
    const attempts = await QuizAttempt.findAll({
      where: {
        user_id: userId,
        passed: true
      },
      include: [{
        model: Course,
        attributes: ['id', 'course_name']
      }]
    });

    // Get unique courses by course_id
    const seen = new Set();
    const uniqueCourses = [];
    for (const attempt of attempts) {
      if (attempt.Course && !seen.has(attempt.Course.id)) {
        uniqueCourses.push(attempt.Course);
        seen.add(attempt.Course.id);
      }
    }

    res.json(uniqueCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch accomplishments' });
  }
};


// Update Google Calendar sync flag
exports.updateSyncWithGoogle = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { sync_with_google } = req.body;

    if (typeof sync_with_google !== "boolean") {
      return res.status(400).json({ error: "sync_with_google must be a boolean" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.sync_with_google = sync_with_google;
    await user.save();

    res.json({ message: "Google sync setting updated", sync_with_google });
  } catch (error) {
    console.error("[updateSyncWithGoogle] Error:", error);
    res.status(500).json({ error: "Failed to update Google sync setting" });
  }
};

// Update Notion sync flag
exports.updateSyncWithNotion = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { sync_with_notion } = req.body;

    if (typeof sync_with_notion !== "boolean") {
      return res.status(400).json({ error: "sync_with_notion must be a boolean" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.sync_with_notion = sync_with_notion;
    await user.save();

    res.json({ message: "Notion sync setting updated", sync_with_notion });
  } catch (error) {
    console.error("[updateSyncWithNotion] Error:", error);
    res.status(500).json({ error: "Failed to update Notion sync setting" });
  }
};



exports.saveStudyPlanWithCourses = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.session.userId;
    const { planId } = req.params;

    console.log('Attempting to duplicate study plan:', { userId, planId });

    if (!userId) {
      console.log('User ID not found in session.');
      return res.status(401).json({ error: "Unauthorized" });
    }

    // First, check if the user already saved this plan (has a duplicate referencing original)
    const existingDuplicate = await StudyPlan.findOne({
      where: {
        user_id: userId,
        ref_study_plan_id: planId,
      },
      transaction,
    });

   if (existingDuplicate) {
  console.log(`User ${userId} has already saved study plan ${planId}`);
  await transaction.rollback();
  return res.status(200).json({ 
    message: "You have already saved this plan",
    alreadySaved: true,
    duplicatedPlan: existingDuplicate // optionally send the existing duplicated plan info
  });
}


    // Fetch the original study plan
    const originalPlan = await StudyPlan.findByPk(planId, { transaction });
    console.log('Fetched original study plan:', originalPlan ? originalPlan.toJSON() : null);

    if (!originalPlan) {
      await transaction.rollback();
      console.log('Original study plan not found. Rolled back transaction.');
      return res.status(404).json({ error: "Original study plan not found" });
    }

    // Duplicate the study plan for current user with link to original
    const duplicatedPlan = await StudyPlan.create(
      {
        plan_name: originalPlan.plan_name + " (Copy)",
        user_id: userId,
        start_date: originalPlan.start_date,
        end_date: originalPlan.end_date,
        weekdays: originalPlan.weekdays,
        study_time: originalPlan.study_time,
        course_settings: originalPlan.course_settings,
        course_count: originalPlan.course_count,
        sync_with_notion: originalPlan.sync_with_notion,
        sync_with_google: originalPlan.sync_with_google,
        course_ids: [],
        save_count: 0,
        ref_study_plan_id: originalPlan.id, // Reference to the original plan
      },
      { transaction }
    );
    console.log('Created duplicated study plan:', duplicatedPlan.toJSON());

    const originalCourseIds = originalPlan.course_ids || [];
    const newCourseIds = [];
    console.log('Original course IDs:', originalCourseIds);

    for (const origCourseId of originalCourseIds) {
      const origCourse = await Course.findByPk(origCourseId, { transaction });
      console.log('Fetched original course:', origCourse ? origCourse.toJSON() : null, 'for courseId:', origCourseId);

      if (!origCourse) {
        console.log(`Course ID ${origCourseId} not found, skipping.`);
        continue;
      }

      const duplicatedCourse = await Course.create(
        {
          course_name: origCourse.course_name,
          user_id_foreign_key: userId,
          ref_course_id: origCourse.id,
          notion_template_db_id: origCourse.notion_template_db_id,
        },
        { transaction }
      );
      console.log('Created duplicated course:', duplicatedCourse.toJSON());

      // Duplicate videos for each course
      const origVideos = await Videos.findAll({
        where: { course_id_foreign_key: origCourse.id },
        transaction,
      });
      console.log(`Found ${origVideos.length} videos for courseId ${origCourse.id}`);

      for (const video of origVideos) {
        await Videos.create(
          {
            video_title: video.video_title,
            video_url: video.video_url,
            video_thumbnail: video.video_thumbnail,
            video_channel: video.video_channel,
            video_duration: video.video_duration,
            video_progress: video.video_progress,
            course_id_foreign_key: duplicatedCourse.id,
          },
          { transaction }
        );
        console.log(`Duplicated video ${video.video_title} for new course ID ${duplicatedCourse.id}`);
      }

      newCourseIds.push(duplicatedCourse.id);
    }

    console.log('New duplicated course IDs:', newCourseIds);

    duplicatedPlan.course_ids = newCourseIds;
    duplicatedPlan.course_count = newCourseIds.length;
    await duplicatedPlan.save({ transaction });
    console.log('Updated duplicated study plan with new course IDs and count.');

    // Increment save count on original plan
    originalPlan.save_count = (originalPlan.save_count || 0) + 1;
    await originalPlan.save({ transaction });
    console.log('Incremented original plan save_count to', originalPlan.save_count);

    await transaction.commit();
    console.log('Transaction committed successfully!');

    return res.status(201).json({
      message: "Study plan duplicated successfully",
      newPlanId: duplicatedPlan.id,
      duplicatedPlan,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error duplicating study plan with courses:", error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: "Failed to duplicate study plan" });
  }
};
exports.isFollowing = async (req, res) => {
  try {
    const profileUserId = parseInt(req.params.userId, 10);
    const currentUserId = req.session.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (isNaN(profileUserId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    // Cannot follow self
    if (profileUserId === currentUserId) {
      return res.json({ isFollowing: true });  // You "follow" self by definition or treat as true
    }

    const followRecord = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: profileUserId,
      },
    });

    return res.json({ isFollowing: !!followRecord });
  } catch (error) {
    console.error("Error checking following status:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

