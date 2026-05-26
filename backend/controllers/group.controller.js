const { Group, GroupMember, GroupJoinRequest, User, GroupMessage } = require('../models');
//const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');


let nanoid;
(async () => {
  const { nanoid: nano } = await import('nanoid');
  nanoid = nano;
})();

exports.createGroup = async (req, res) => {
  try {
    const { group_name, description } = req.body;

    const userId = req.session.userId;

    // Wait until nanoid is ready
    if (!nanoid) {
      return res.status(500).json({ message: 'Server not ready. Please try again shortly.' });
    }

    const group = await Group.create({
      group_name, // ✅ Matches the model
      description,
      created_by: userId,
      join_code: nanoid(8),
    });



     await GroupMember.create({
      group_id: group.id,
      user_id: userId,
      is_admin: true,
    });

    res.status(201).json({ group });
  } catch (err) {
    console.error('Group creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
async function isGroupAdmin(groupId, userId) {
  const member = await GroupMember.findOne({ where: { group_id: groupId, user_id: userId } });
  return member?.is_admin === true;
}
// ✅ Get all groups the user is a member of
// exports.getMyGroups = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     const memberships = await GroupMember.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: Group,
//           attributes: ['id', 'group_name', 'join_code', 'created_by', 'createdAt'],
//         },
//       ],
//     });

//     const groups = memberships.map((membership) => ({
//   ...membership.Group.dataValues,
//   role: membership.role,
//    isAdmin: membership.Group.created_by === userId,
// }));

//     res.status(200).json({ userId, groups });
//   } catch (err) {
//     console.error('Get my groups error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log("Session userId:", userId);

    const memberships = await GroupMember.findAll({
      where: { user_id: userId },
      attributes: ['is_admin'], 
      include: [
        {
          model: Group,
          attributes: ['id', 'group_name', 'join_code', 'created_by', 'createdAt'],
        },
      ],
    });

    console.log("Memberships found:", memberships.length);
    memberships.forEach((m) =>
    //   console.log(`Group ID: ${m.Group?.id}, Role: ${m.role}`)
    // );
    console.log(`Group ID: ${m.Group?.id}, isAdmin: ${m.is_admin}`)
    );

    const groups = memberships.map((membership) => ({
      ...membership.Group.dataValues,
     // role: membership.role,
      //isAdmin: membership.Group.created_by === userId,
      isAdmin: membership.is_admin,
    }));

    res.status(200).json({ userId, groups });
  } catch (err) {
    console.error('Get my groups error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request to Join Group

exports.requestToJoinGroup = async (req, res) => {
  try {
    const joinCode = req.body.join_code;
;
    const userId = req.session.userId;

    // 🛡 Validate inputs
    if (!joinCode) {
      console.error("❌ Missing joinCode in request body", req.body);
      return res.status(400).json({ message: 'Join code is required' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    // 🔍 Find group by join code
    const group = await Group.findOne({ where: { join_code: joinCode } });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 🔁 Check if already requested
    const existingRequest = await GroupJoinRequest.findOne({
      where: { group_id: group.id, user_id: userId },
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Already requested to join' });
    }

    // 👥 Check if already a member
    const isMember = await GroupMember.findOne({
      where: { group_id: group.id, user_id: userId },
    });
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // ✅ Create join request
    await GroupJoinRequest.create({ group_id: group.id, user_id: userId });
    const newRequest = await GroupJoinRequest.findOne({
      where: { group_id: group.id, user_id: userId },
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }],
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io && newRequest) {
      io.to(`group_${group.id}`).emit('joinRequestUpdate', {
        type: 'add',
        request: newRequest,
      });
    }
    res.status(200).json({ message: 'Join request sent' });
  } catch (err) {
    console.error('🔥 Join request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Approve Join Request


exports.approveJoinRequest = async (req, res) => {
  try {
    const { groupId, requestId } = req.params;
    const userId = req.session.userId;

    // Find the group
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if requester is admin
    if (group.created_by !== userId) {
      return res.status(403).json({ message: 'Forbidden: Not group admin' });
    }

    // Find the join request
    const request = await GroupJoinRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Add user to group members
    await GroupMember.create({
      group_id: groupId,
      user_id: request.user_id,
      role: 'member',
    });

    // Delete the join request after approval
    await request.destroy();

    // Emit real-time updates via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Notify the group that the request has been removed (for admins/UI updating request list)
      io.to(`group_${groupId}`).emit('joinRequestUpdate', {
        type: 'remove',
        requestId: requestId,
      });
      // Additionally, notify the user who was just added, so their "joined groups" list updates instantly
      io.to(`user_${request.user_id}`).emit('groupsUpdated', {
        message: 'You have been added to a new group',
        // Optionally, you can send the new group info here for instant update without refetching
        group: {
          id: group.id,
          group_name: group.group_name,
          created_by: group.created_by,
          createdAt: group.createdAt,
          // Add other fields as needed
        },
      });
    }

    // Send success response
    return res.status(200).json({ message: 'User added to group' });
  } catch (err) {
    console.error('Approve join request error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};



// Reject Join Request

exports.rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.session.userId;

    const request = await GroupJoinRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const group = await Group.findByPk(request.group_id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // 🔒 Only admin can reject
    if (group.created_by !== userId) {
      return res.status(403).json({ message: 'Forbidden: Not group admin' });
    }

    await request.destroy();
     const io = req.app.get('io');
    if (io) {
      io.to(`group_${group.id}`).emit('joinRequestUpdate', {
        type: 'remove',
        requestId: requestId,
      });
    }

    res.status(200).json({ message: 'Request rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get All Join Requests (Admin)

exports.getJoinRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.session.userId;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // 🔑 Allow any group member to see
    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (!membership) {
      return res.status(403).json({ message: 'Forbidden: Only group members can see requests' });
    }

    const requests = await GroupJoinRequest.findAll({
      where: { group_id: groupId },
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }],
    });

    res.status(200).json({ requests });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get All Group Members
exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const members = await GroupMember.findAll({
      where: { group_id: groupId },
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }],
    });

    res.status(200).json({ members });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove Member (Admin only)
exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const member = await GroupMember.findOne({ where: { group_id: groupId, user_id: userId } });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await member.destroy();

    res.status(200).json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Group Messages
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

  const messages = await GroupMessage.findAll({
  where: { group_id: groupId },
  include: [
    {
      model: User,
      as: 'sender', // IMPORTANT: Use the alias as defined in the association
      attributes: ['id', 'first_name', 'last_name'], // Optional: Select only what you need
    },
  ],
  order: [['createdAt', 'ASC']],
});

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send Message (Text or PDF only)
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.session.userId;
    const { message_type, content } = req.body;

    if (!['text', 'file'].includes(message_type)) {
      return res.status(400).json({ message: 'Invalid message type' });
    }

    let filePath = null;
    if (message_type === 'file') {
      if (!req.file) return res.status(400).json({ message: 'File is required' });

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.pdf') {
        return res.status(400).json({ message: 'Only PDF files allowed' });
      }

      filePath = '/uploads/pdfs/' + req.file.filename;
    }

    const message = await GroupMessage.create({
  group_id: groupId,
  sender_id: userId,
  message_text: message_type === 'text' ? content : filePath,
  isPdfLink: !!isPdfLink,
});


    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.uploadPDFToGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.session.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // Save file reference in DB or respond as needed
    return res.status(200).json({
      message: 'PDF uploaded successfully',
      filePath: `/uploads/pdfs/${req.file.filename}`,
    });
  } catch (err) {
    console.error('PDF Upload error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// controllers/groupController.js
exports.leaveGroup = async (req, res) => {
  try {
    const userId = req.session.userId; // Authenticated user
    const { groupId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!groupId) {
      return res.status(400).json({ message: 'groupId required' });
    }

    // Find membership
    const member = await GroupMember.findOne({ where: { group_id: groupId, user_id: userId } });
    if (!member) return res.status(404).json({ message: 'Membership not found' });

    // (optional: Prevent admin/creator from leaving if you want)

    await member.destroy();

    res.status(200).json({ message: 'Left group' });
  } catch (err) {
    console.error('Leave group error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// controllers/groupController.js
exports.deleteGroup = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only allow creator/admin to delete
    if (group.created_by !== userId) {
      return res.status(403).json({ message: "Only the group creator can delete this group." });
    }

    // Optionally: Delete GroupMembers and GroupMessages, or set up cascading delete
    await Group.destroy({ where: { id: groupId } });

    res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.removeMember = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userIdToRemove = Number(req.params.userId);
    const requestingUserId = req.session.userId;

    if (!groupId || !userIdToRemove) {
      return res.status(400).json({ message: 'Invalid group or user ID' });
    }

    // Check if requesting user is admin of the group
    const isAdmin = await isGroupAdmin(groupId, requestingUserId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Prevent admin from removing themselves (optional)
    if (userIdToRemove === requestingUserId) {
      return res.status(400).json({ message: 'Admins cannot remove themselves' });
    }

    const member = await GroupMember.findOne({ where: { group_id: groupId, user_id: userIdToRemove } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.destroy();
      // Emit socket event to group room
    if (req.app.get('io')) { // assuming you passed io to app locals
      req.app.get('io').to(`group_${groupId}`).emit('memberRemoved', {
        groupId,
        userId: userIdToRemove,
      });
    }

    res.status(200).json({ message: 'Member removed from group successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteGroupMessage = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const messageId = Number(req.params.messageId);
    const userId = req.session.userId;

    if (!groupId || !messageId) {
      return res.status(400).json({ message: 'Invalid group or message ID' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the message
    const message = await GroupMessage.findOne({
      where: { id: messageId, group_id: groupId },
    });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Get membership info and check admin status
    const member = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const isAdmin = member.is_admin === true;

    // Authorization check
    if (!isAdmin && message.sender_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: cannot delete this message' });
    }

    // Hard delete the message
    await GroupMessage.destroy({ where: { id: messageId } });

    // Emit Socket.IO event to notify clients
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('messageDeleted', {
        groupId,
        messageId,
      });
    }

    return res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteGroupMessages = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const messageIds = req.body.messageIds; // expects { messageIds: [1,2,3] }
    const userId = req.session.userId;

    if (!groupId || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check membership and role
    const member = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (!member) {
      return res.status(403).json({ message: 'Not a group member' });
    }
    const isAdmin = member.is_admin === true;

    // Fetch messages to delete
    const messages = await GroupMessage.findAll({
      where: { id: messageIds, group_id: groupId },
    });

    // For non-admin users, restrict deletion to own messages only
    if (!isAdmin) {
      const notOwned = messages.filter((msg) => msg.sender_id !== userId);
      if (notOwned.length > 0) {
        return res.status(403).json({ message: "Cannot delete others' messages" });
      }
    }

    // Hard delete all found messages
    await GroupMessage.destroy({
      where: { id: messages.map((m) => m.id) },
    });

    // Emit real-time deletion event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('messagesDeleted', {
        groupId,
        messageIds: messages.map((m) => m.id),
      });
    }

    return res.status(200).json({ message: 'Messages deleted successfully', ids: messages.map((m) => m.id) });
  } catch (error) {
    console.error('Batch delete error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};