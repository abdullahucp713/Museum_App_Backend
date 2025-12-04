const express = require('express');
const {protect,authorize} = require('../middleware/authMiddleware');
const {getMyOrders,initiateCheckout,handleWebhook} = require("../controllers/orderController")


// Express Router
const router  = express.Router();


//Order Routes
router.get('/my-orders',protect,authorize("user", "admin"),getMyOrders);
router.post('/checkout',protect,authorize("user", "admin"),initiateCheckout);
router.post('/webhook',handleWebhook);


module.exports = router;
