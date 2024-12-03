

import ReactDOM from "react-dom/client";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import App from "./App";
import './index.css'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
const wallets = [new PhantomWalletAdapter()];
const network = 'devnet';
const endpoint = clusterApiUrl(network);

ReactDOM.createRoot(document.getElementById("root")  ).render(
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider> 
        <div className="bg-blue-300 w-screen h-screen">
          <App/>     
        </div>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
); 

/*

const network = 'devnet';
const endpoint = clusterApiUrl(network);

return (
    <ConnectionProvider endpoint={endpoint}>


*/