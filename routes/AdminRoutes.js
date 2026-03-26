const express = require('express');
const { addproduct } = require('../controllers/adminController');
const router = express.Router()
// multer
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/',upload.array('productImages',5), addproduct)

module.exports = router