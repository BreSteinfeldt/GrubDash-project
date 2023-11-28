const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: dishes });
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

// function validatorForPrice(req, res, next) {
//   const { price } = data;

//   if (typeof price !== "number" || price <= 0) {
//     return next({
//       status: 400,
//       message: "Dish must have a price that is an integer greater than 0",
//     });
//   } else {
//     next();
//   }
// }

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

function create(req, res, next) {
  let newDish = {
    id: nextId,
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url,
  };
  dishes.push(newDish);
  res.status(201).send({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  let index = dishes.findIndex((dish) => dish.id === dishId);

  if (index < 0) {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  } else {
    res.locals.index = index;
    next();
  }
}

function read(req, res, next) {
  res.send({ data: dishes[res.locals.index] });
}

function update(req, res, next) {
  const dish = res.locals.index;
  const {
    data: { id, name, description, price, image_url },
  } = req.body;

  dish.id = id;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    validateBodyDataExists,
    validatorFor("name"),
    validatorFor("description"),
    validatorFor("price"),
    validatorFor("image_url"),
    create,
  ],
  read: [dishExists, read],
  update: [
    validateBodyDataExists,
    validatorFor("id"),
    validatorFor("name"),
    validatorFor("description"),
    validatorFor("price"),
    validatorFor("image_url"),
    update,
  ],
};
