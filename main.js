const {Blockchain, Transaction} = require('./blockchain')
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Initializing key
const myKey = ec.keyFromPrivate("119bb0fc0c2cf5ab31f2b70e3c9bf1488e88dd49b9609368ee5dc43cdc2c9031")
const myWalletAddress = myKey.getPublic("hex");


// Testing and creating a new block
let deloCoin = new Blockchain();

// Make a new transaction then sign it
const tx1 = new Transaction(myWalletAddress, "public key goes here", 10);
tx1.signTransaction(myKey);
deloCoin.addTransaction(tx1);

console.log("\nStarting to mine...");
deloCoin.minePendingTransactions(myWalletAddress);
console.log("\nBalance of Luis is", deloCoin.getBalanceOfAddress(myWalletAddress));

deloCoin.chain[1].transactions[0].amt = 1;
console.log("Is the chain valid?", deloCoin.isChainValid());