const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Creating a transaction class to input inside the block
class Transaction{
    constructor(fromAddress, toAddress, amt){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amt = amt;
    }

    // Method to calculate Hash which will sign the private key
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amt).toString();
    }

    // The parameter will be the key gained from keygenerator.js
    signTransaction(signingKey) {

        // Only spend coins if you have the private key and the private key is linked to the public key
        if(signingKey.getPublic("hex") !== this.fromAddress) {
            throw new Error("Cannot sign transactions for other wallets!");

        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, "base64");
        this.signature = sig.toDER("hex");
    }

    isValid(){
        // Assume the fromAddress of mined block is valid, mined blocks will have a null fromAddress
        if(this.fromAddress == null) return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error("No signature in this transaction!");
        }

        // The fromAddress is a public key
        const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
        return publicKey.verify(this.calculateHash(), this.signature);

    }

}

class Block{
    // Timestamp is when it was created
    // Data could be transaction details, sender, receiver
    constructor(timestamp, transactions, previousHash=""){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    // Calculate the hash of this block using the current index, the previous hash, the time, and the data
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    // Used for the mining aspect of crypto
    // The difficulty dictates how many zeroes start in the hash, and the longer it takes to mine
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    // Method to validate all transactions within a block
    hasValidTransactions(){
        // Iterate through all transactions and use the isValid method
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}


class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        // Mining a new block will give 80 coins
        this.miningReward = 80;
    }

    // The first block on the block chain must be made manually
    createGenesisBlock(){
        return new Block("01/01/2022", "Genesis Block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    // When successfully mining, send the reward to an address
    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log("Block is successfully mined!")
        this.chain.push(block);
        // This will reset the new pending transactions
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    // Pushing the transaction to the pendingTransactions array
    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include from and to address!");
        }

        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transactions to chain!");
        }

        this.pendingTransactions.push(transaction);
    }

    // Getter method to get the balance of a specific wallet
    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address) {
                    // If you are the fromAddress, subtract amount
                    balance -= trans.amt;
                }

                if(trans.toAddress === address) {
                    // If you are the toAddress, add amount
                    balance += trans.amt;
                }
            }
        }
        return balance;
    }

    // The blocks in blockchains are linked with hash codes
    // Verifies if each block links to the previous block
    // To verify the integrity of the chain
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }
 
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            // If the previous block is pointing to the next block
            if(currentBlock.previousHash !== prevBlock.hash){
                return false;
            }

        }
        return true;
    }




}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;