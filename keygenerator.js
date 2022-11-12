// Importing a library called elliptic to generate public/private keys
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Generating a key pair
const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

console.log();
console.log("Private Key: ", privateKey);

console.log();
console.log("Public Key: ", publicKey);