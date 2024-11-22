const { fromHex } = require("@dfinity/agent");
const crypto = require("crypto");

module.exports = signatureVerification = async (
  pubKey,
  signature,
  data,
  publicKey
) => {
  try {
    const params = {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    };

    const cryptoKey = await crypto.webcrypto.subtle.importKey(
      "raw",
      Buffer.from(fromHex(pubKey)),
      { name: "ECDSA", namedCurve: "P-256" }, // Adjust the algorithm and curve as needed
      true, // Whether the key is extractable
      ["verify"] // The key usages
    );

    const result = await crypto.webcrypto.subtle.verify(
      params,
      cryptoKey,
      fromHex(signature),
      data
    );

    if (publicKey) {
      let publicKeyBuffer = Buffer.from(fromHex(publicKey)); // this is use for check public key valid format
    }
    return result;
  } catch (error) {
    console.log("error", error);
    return false;
  }
};
