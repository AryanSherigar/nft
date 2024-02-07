import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Marketplace from "./Pages/Marketplace.jsx";
import Mint from "./Pages/Mint.jsx";
import Home from "./Pages/Home.jsx";
import Profile from "./Pages/Profile.jsx";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";

function AppWithProviders() {
  return (
    <ThirdwebProvider
      supportedWallets={[
        metamaskWallet({
          recommended: true,
        }),
        coinbaseWallet(),
        walletConnect(),
      ]}
      clientId="4fe159e2df678edf92d8960729625837"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/home/:tokenId" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/app" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ThirdwebProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);
