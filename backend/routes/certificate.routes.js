const express = require('express');
const router = express.Router();
const  {getCertificate } = require('../controllers/certificate.controller');

router.get('/:courseId', getCertificate);

module.exports = router;
