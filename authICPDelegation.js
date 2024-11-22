const errorMessages = require("../config/errorMessages.json");
const { delegationValidation } = require("../helper/delegationValidation");

module.exports = {
  async verifyDelegation(req, res, next) {
    console.log("verify delegation");
    try {
      let pubKey = req.headers["x-public"]; // public key for delegation chain
      let priKey = req.headers["x-private"]; // private key for delegation chain
      let delegation = req.headers["x-delegation"]; // private key for delegation chain

      if (_.isEmpty(pubKey) || _.isEmpty(priKey) || _.isEmpty(delegation)) {
        return res
          .status(401)
          .json({ status: false, error: errorMessages.invalidHeaderData });
      }

      try {
        let data = await delegationValidation(pubKey, priKey, delegation);
        req.principal = data.principal;
        req.privateKey = data.privateKey;
        req.publicKey = data.publicKey;
        req.delegation = data.delegation;
        req.backendCanister = data.backendCanister;
        req.agent = data.agent;
        next();
      } catch (error) {
        console.log("error", error);
        return res
          .status(400)
          .json({ status: false, error: errorMessages.invaildDelegationData });
      }
    } catch (error) {
      console.log("error", error);
      return res
        .status(500)
        .json({ status: false, error: errorMessages.internalServerError });
    }
  },
};
