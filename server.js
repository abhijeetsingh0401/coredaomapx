require("dotenv").config();
const express = require("express");
const Web3 = require("web3");
const fs = require("fs");


const PRIVATE_KEY ="8094da305068e860a0e6a2378bcf815b27497aba567d5d9b13d406e0333a6917"
const INFURA_RPC_URL = "https://rpc.test.btcs.network";
const CONTRACT_ADDRESS = "0x43a280a6a08257C1b48A509D24d3DCd9e328F882";


const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_RPC_URL));


const contractABI = JSON.parse(fs.readFileSync("GameItem.json", "utf8"));


const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);


const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const app = express();
app.use(express.json());


app.post("/mint", async (req, res) => {
    try {
        const tx = contract.methods.awardItem();
        const gas = await tx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();

        const txData = {
            from: account.address,
            to: CONTRACT_ADDRESS,
            gas,
            gasPrice,
            data: tx.encodeABI(),
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json({ message: "NFT Minted!", transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Minting failed" });
    }
});

// 🎉 Server Listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
