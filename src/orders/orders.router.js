const router = require("express").Router();
const ordersController = require("./orders.controller"); 
const methodNotAllowed = require("../errors/methodNotAllowed"); 

// TODO: Implement the /orders routes needed to make the tests pass

router
 .route("/")
 .get(ordersController.list)
 .post(ordersController.create)
 .all(methodNotAllowed)

module.exports = router;
