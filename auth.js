const { User } = require("../models/User");
const errorMessages = require("../config/errorMessages.json");
const successMessages = require("../config/successMessages.json");

async function validateUser(req, res, next) {
  try {
    const principal = req.headers["x-principal"];
    const privateToken = req.headers["x-private-token"];

    if (_.isEmpty(principal) || _.isEmpty(privateToken)) {
      return res.status(401).json({ error: errorMessages.invalidHeaderData });
    }

    // Check if the user with the provided principal and privateToken exists
    const user = await User.findOne({
      where: { principal, privateToken },
    });

    if (_.isEmpty(user)) {
      return res
        .status(401)
        .json({ status: false, error: errorMessages.unauthorized });
    }
    // Attach the user object to the request for later use
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ status: false, error: errorMessages.internalServerError });
  }
}

module.exports = validateUser;
