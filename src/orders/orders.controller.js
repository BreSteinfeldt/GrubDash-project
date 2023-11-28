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
  const { dishes } = req.body.data;

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
  const { dishes } = req.body.data;
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity !== "number"
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next(); 
}

function create(req, res, next) {
  let newOrder = {
    id: nextId(),
    deliverTo: req.body.data.deliverTo,
    mobileNumber: req.body.data.mobileNumber,
    status: req.body.data.status,
    dishes: req.body.data.status,
  };
  orders.push(newOrder);
  res.status(201).send({ data: newOrder });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  let index = orders.findIndex((order) => order.id === orderId);

  if (index < 0) {
    next({
      status: 404,
      message: `Order does not exist: ${orderId}`,
    });
  } else {
    res.locals.index = index;
    next();
  }
}

function read(req, res, next) {
  res.send({ data: orders[res.locals.index] });
}

function validateStatusForUpdate(req, res, next) {
  const { status } = req.body.data;
  if (status == "delivered" || status == "invalid") {
    return next({
      status: 400,
      message: `An order with status: "delivered" cannot be changed.`,
    });
  } else {
    next();
  }
}

function update(req, res, next) {
  const orderIndex = res.locals.index;
  const {
    data: { id, deliverTo, mobileNumber, status, dishes },
  } = req.body;

  if (id && id !== req.params.orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`,
    });
  } else {
    orders[orderIndex].deliverTo = deliverTo;
    orders[orderIndex].mobileNumber = mobileNumber;
    orders[orderIndex].status = status;
    orders[orderIndex].dishes = dishes;
    res.json({ data: orders[orderIndex] });
  }
}

function destroyValidator(req, res, next) {
  const { status } = orders[res.locals.index];

  if (status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.`,
    });
  } else {
    next();
  }
}

function destroy(req, res, next) {
  const orderId = req.params;
  const index = orders.findIndex((order) => order.id === orderId);

  orders.splice(index, 1);
  res.sendStatus(204);
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
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    validateBodyDataExists,
    validatorFor("deliverTo"),
    validatorFor("mobileNumber"),
    validatorFor("dishes"),
    validatorFor("status"),
    dishesArrayValidator,
    dishesQuantityValidator,
    validateStatusForUpdate,
    update,
  ],
  delete: [orderExists, destroyValidator, destroy],
};
