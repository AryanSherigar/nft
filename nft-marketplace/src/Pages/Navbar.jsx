import { Link } from "react-router-dom";
import { ConnectWallet } from "@thirdweb-dev/react";
//import "../index.css";

function Navbar() {
  return (
    <header>
      <div>
        <Link to="/">
          <span className="text-5xl font-extrabold inline-block font-bold text-xl ml-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              MarketPlace
            </span>
          </span>
        </Link>
        <nav>
          <ul>
            <li></li>
            <li>
              <ul>
                {location.pathname === "/" ? (
                  <li>
                    <Link to="/">Marketplace</Link>
                  </li>
                ) : (
                  <li className="hover:border-b-2 hover:pb-0 p-2">
                    <Link to="/">Marketplace</Link>
                  </li>
                )}
                {location.pathname === "/mint" ? (
                  <li className="border-b-2 hover:pb-0 p-2">
                    <Link to="/mint">List My NFT</Link>
                  </li>
                ) : (
                  <li className="hover:border-b-2 hover:pb-0 p-2">
                    <Link to="/mint">List My NFT</Link>
                  </li>
                )}
                {location.pathname === "/profile" ? (
                  <li className="border-b-2 hover:pb-0 p-2">
                    <Link to="/profile">Profile</Link>
                  </li>
                ) : (
                  <li className="hover:border-b-2 hover:pb-0 p-2">
                    <Link to="/profile">Profile</Link>
                  </li>
                )}
                <li></li>
                <ConnectWallet />
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
