const express = require('express');
const {getAllEvents,getEventDetails,searchEvents} = require('../controllers/eventController')

//Express Router
const router = express.Router();

// Event Routes
router.get('/search',searchEvents);
router.get('/',getAllEvents);
router.get('/:id',getEventDetails);

module.exports = router;