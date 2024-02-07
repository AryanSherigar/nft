import { useState } from "react";
import "./App.css";
import Mint from "./Pages/Mint";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Marketplace from "./Pages/Marketplace";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ThirdwebProvider activeChain="ethereum" clientId="your-client-id">
        <Mint />
        <div>
          <p className="font-sans ...">The quick brown fox ...</p>
          <p className="font-serif ...">The quick brown fox ...</p>
          <p className="font-mono ...">The quick brown fox ...</p>
          <div className="text-5xl font-extrabold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              Hello world
            </span>
            <div className="h-14 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mint" element={<Mint />} />
        </Routes>
      </ThirdwebProvider>
    </>
  );
}

export default App;
