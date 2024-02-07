import { BrowserRouter as Router, Link } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import { GetIpfsUrlFromPinata } from "./Working/pinata";

export default function Profile() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [address, updateAddress] = useState("0x");
  const [totalPrice, updateTotalPrice] = useState("0");

  useEffect(() => {
    async function fetchData() {
      let sumPrice = 0;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();

      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );

      let transaction = await contract.getMyNFTs();

      const items = await Promise.all(
        transaction.map(async (i) => {
          var tokenURI = await contract.tokenURI(i.id);
          tokenURI = GetIpfsUrlFromPinata(tokenURI);
          console.log("getting this tokenUri", tokenURI);
          let meta = await axios.get(tokenURI);
          meta = meta.data;

          let price = ethers.utils.formatUnits(i.price.toString(), "ether");

          let item = {
            price,
            tokenId: i.id.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
          sumPrice += Number(price);
          return item;
        })
      );

      updateData(items);
      updateFetched(true);
      updateAddress(addr);
      updateTotalPrice(sumPrice.toPrecision(3));
    }

    if (!dataFetched) {
      fetchData();
    }
  }, [dataFetched]);

  const Tile = ({ data }) => {
    const newTo = {
      pathname: "/home/" + data.tokenId,
    };

    const [IPFSUrl, setIPFSUrl] = useState("");

    useEffect(() => {
      async function fetchIPFSUrl() {
        const url = await GetIpfsUrlFromPinata(data.image);
        setIPFSUrl(url);
      }
      fetchIPFSUrl();
    }, [data.image]);

    return (
      <Link to={newTo}>
        <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
          <img
            src={IPFSUrl}
            alt=""
            className="w-72 h-80 rounded-lg object-cover"
            crossOrigin="anonymous"
          />
          <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
            <strong className="text-xl">{data.name}</strong>
            <p className="display-inline">{data.description}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="profileClass">
      <Navbar />
      <div className="profileClass">
        <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
          <div className="mb-5">
            <h2 className="font-bold">Wallet Address</h2>
            {address}
          </div>
        </div>
        <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
          <div>
            <h2 className="font-bold">No. of NFTs</h2>
            {data.length}
          </div>
          <div className="ml-20">
            <h2 className="font-bold">Total Value</h2>
            {totalPrice} ETH
          </div>
        </div>
        <div className="flex flex-col text-center items-center mt-11 text-white">
          <h2 className="font-bold">Your NFTs</h2>
          <div className="flex justify-center flex-wrap max-w-screen-xl">
            {data.map((value, index) => {
              return <Tile data={value} key={index} />;
            })}
          </div>
          <div className="mt-10 text-xl">
            {data.length === 0
              ? "Oops, No NFT data to display (Are you logged in?)"
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
