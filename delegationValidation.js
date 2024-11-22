const {
  DelegationIdentity,
  Ed25519PublicKey,
  ECDSAKeyIdentity,
  DelegationChain,
} = require("@dfinity/identity");
const errorMessages = require("../config/errorMessages.json");
const { toHex, fromHex, HttpAgent } = require("@dfinity/agent");
// const { backend, createActor } = require("../motoko/backend");
const { Hotel, createActor } = require("../motoko/Hotel");
const crypto = require("crypto");

let backendCanister = Hotel;

module.exports = {
  async delegationValidation(pubKey, priKey, delegation) {
    try {
      let publicKey = await crypto.webcrypto.subtle.importKey(
        "raw",
        Buffer.from(fromHex(pubKey)),
        { name: "ECDSA", namedCurve: "P-256" }, // Adjust the algorithm and curve as needed
        true, // Whether the key is extractable
        ["verify"]
      );
      console.log("generateKey._keyPair.publicKey", publicKey);

      let privateKey = await crypto.webcrypto.subtle.importKey(
        "pkcs8",
        Buffer.from(fromHex(priKey)),
        { name: "ECDSA", namedCurve: "P-256" }, // Adjust the algorithm and curve as needed
        true, // Whether the key is extractable
        ["sign"]
      );
      console.log("generateKey._keyPair.privateKey", privateKey);
      let newKeyPair = await ECDSAKeyIdentity.fromKeyPair({
        privateKey,
        publicKey,
      });
      console.log("newKeyPair", toHex(newKeyPair.getPublicKey().toDer()));

      console.log("delegation", delegation);

      const chain = DelegationChain.fromJSON(
        JSON.parse(decodeURIComponent(delegation))
      );
      console.log("chain", chain);
      const middleIdentity = DelegationIdentity.fromDelegation(
        newKeyPair,
        chain
      );
      console.log("middleIdentity", middleIdentity);
      const agent = new HttpAgent({
        identity: middleIdentity,
        fetchOptions: {
          reactNative: {
            __nativeResponseType: "base64",
          },
        },
        callOptions: {
          reactNative: {
            textStreaming: true,
          },
        },
        fetch,
        blsVerify: () => true,
        host: process.env.ICP_HOST,
      });

      // console.log("agent", agent);

      backendCanister = createActor(process.env.HOTEL_CANISTER_ID, {
        agent,
      });
      // console.log("backendCanister", backendCanister);

      // console.log("middleIdentity", middleIdentity.getPrincipal().toString());

      let principal = await backendCanister.whoami();
      console.log("principal", principal);
      console.log(process.env.ICP_HOST);
      return {
        principal,
        backendCanister,
        publicKey: pubKey,
        privateKey: priKey,
        agent,
        delegation: decodeURIComponent(delegation),
      };
    } catch (error) {
      console.error("error", error);
      throw new Error(errorMessages.invaildDelegationData);
    }
  },
};
