const express = require('express');
const router = express.Router();


const { searchMulti } = require('../controllers/search.controller');

router.get('/multi', searchMulti);
module.exports=router;