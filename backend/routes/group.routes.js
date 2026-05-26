// module.exports = router;
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const uploadPDF = require('../middleware/pdfUpload'); // PDF-only multer setup

// ---- Group Core Management ----

// Create a new group
router.post('/create', groupController.createGroup);
router.get('/mygroups', groupController.getMyGroups);

// Request to join a group using join code
router.post('/request-join', groupController.requestToJoinGroup);

// Get all join requests (Admin-only route)
router.get('/:groupId/requests', groupController.getJoinRequests);

// Approve a specific join request
router.post('/:groupId/requests/:requestId/approve', groupController.approveJoinRequest);

// Reject a join request
router.delete('/requests/:requestId/reject', groupController.rejectJoinRequest);

// Get all members in a group
router.get('/:groupId/members', groupController.getGroupMembers);

// Remove a member (Admin-only)
router.delete('/:groupId/members/:userId/remove', groupController.removeMember);


// ---- Group Chat & File Uploads ----

// Get all messages in a group
router.get('/:groupId/messages', groupController.getGroupMessages);

// Send a group message (text or PDF) - with multer middleware
router.post('/:groupId/message', uploadPDF.single('file'), groupController.sendGroupMessage);

// Optional: Upload only PDF without sending as message (optional utility)

router.post('/:groupId/upload-pdf', uploadPDF.single('pdf'), groupController.uploadPDFToGroup);
router.delete('/:groupId/messages/:messageId', groupController.deleteGroupMessage);

// Delete multiple messages (batch)
router.post('/:groupId/messages/batch-delete', groupController.deleteGroupMessages);
router.post('/leave', groupController.leaveGroup);
router.delete("/:groupId", groupController.deleteGroup);

module.exports = router;
