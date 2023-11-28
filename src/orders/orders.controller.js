const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: orders });
}

function validatorFor(propertyName) {
  return function (req, res, next) {
    if (req.body.data[propertyName]) {
      next();
    } else {
      next({ status: 400, message: `Must include a ${propertyName}` });
    }
  };
}

function validateBodyDataExists(req, res, next) {
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: "request body must have a data key",
    });
  }
}

function dishesArrayValidator(req, res, next) {
  const { dishes } = data;

  if (!Array.isArray(dishes) || dishes.length <= 0) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  } else {
    next();
  }
}

function dishesQuantityValidator(req, res, next) {
  const { dishes } = data;
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity != "number"
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
}

function create(req, res, next) {
  let newOrder = {
    id: nextId,
    deliverTo: req.body.data.deliverTo,
    mobileNumber: req.body.data.mobileNumber,
    status: req.body.data.status,
    dishes: req.body.data.status,
  };
  orders.push(newOrder);
  res.status(201).send({ data: newOrder });
}

module.exports = {
  list,
  create: [
validateBodyDataExists,   
validatorFor("deliverTo"), 
validatorFor("mobileNumber"),
validatorFor("dishes"), 
dishesArrayValidator, 
dishesQuantityValidator,
create]
};
