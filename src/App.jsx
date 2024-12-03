import "@solana/wallet-adapter-react-ui/styles.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useState } from 'react';

import {  Connection, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import axios from "axios";

function App() {

  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = useWallet()

  const [fromToken, setFromToken] = useState("SOL");
  const [toToken, setToToken] = useState("USDC");

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  
  const [isWalletConnected, setIsWalletConnected] = useState(true);

  const SOL_MINT = "So11111111111111111111111111111111111111112";
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";//4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
  const [quoteResponse, setQuoteResponse] = useState()

  
  const handleSwap = async () => {

    console.log("helo swapt")
    const walletBalance = await connection.getBalance(wallet.publicKey);
    console.log("Wallet balance (SOL):", walletBalance / LAMPORTS_PER_SOL);
    try {
      const { data: { swapTransaction } } = await axios.post('https://quote-api.jup.ag/v6/swap', 
            {
                quoteResponse,
                userPublicKey: wallet.publicKey.toString(),
            }
        )

      console.log("swapTransaction")
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      // console.log(transaction);
      console.log('look up' , transaction.message.addressTableLookups);

      // transaction.sign([wallet.publicKey]);
      // console.log('latestcall')
      // const latestBlockHash = await connection.getLatestBlockhash();
      // console.log( "latest block hash " , latestBlockHash)
      // Execute the transaction

      const signedTransaction = await wallet.signTransaction(transaction);
      const rawTx = signedTransaction.serialize();
      // const rawTransaction = transaction.serialize()
      const txid = await connection.sendRawTransaction(rawTx, {
          skipPreflight: true,
          maxRetries: 2
      });
      // await connection.confirmTransaction({
      //     blockhash: latestBlockHash.blockhash,
      //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      //     signature: txid
      // });
      
      console.log(`https://solscan.io/tx/${txid}`);
    } catch(e) {
      console.log(e)
    }
  };


  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
    setToAmount("");
  };

  
  const getQuote =async (amount)=>{
    try {
      const response = await axios.get(`https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${amount * 1000000000 }&slippageBps=10`)
      console.log(response.data)
      const quoteRes = response.data;
      setToAmount(quoteRes.outAmount / 1000000)
      setQuoteResponse(quoteRes)
    } catch (error) {
        console.log(error)
    }

    // console.log(quoteResponse);
  }

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4">
      <WalletMultiButton />
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Solana Swap</h1>
          
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            You're Selling
          </label>
          <div className="flex border rounded overflow-hidden">
            <select
              value={fromToken}
              onChange={(e) => {
              
                setFromToken(e.target.value);
                setFromAmount("");
                setToAmount("");

              }}
              className="bg-gray-100 p-2 border-none outline-none"
            >
              <option value="SOL">SOL</option>
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => { setFromAmount(e.target.value) ; getQuote(e.target.value)}}
              placeholder="0.0"
              className="flex-1 p-2 border-none outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            You're Buying
          </label>
          <div className="flex border rounded overflow-hidden">
            <select
              value={toToken}
              onChange={(e) => {
                setToToken(e.target.value);
                setToAmount("");
              }}
              className="bg-gray-100 p-2 border-none outline-none"
            >
              <option value="USDC">USDC</option>
            </select>
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 p-2 bg-gray-100 border-none outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={ !wallet.publicKey }
          className={`w-full py-2 text-white rounded ${
            isLoading || !fromAmount || !toAmount || !wallet.publicKey
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Swapping..." : "Swap"}
        </button>
      </div>
    </div>
  );
}

export default App;