import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { BrowserRouter as Router, Link } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import { GetIpfsUrlFromPinata } from "./Working/pinata.js";
import Navbar from "./Navbar";

export default function Marketplace() {
  const sampleData = [
    {
      name: "NFT#1",
      description: "test:1",
      image:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.goodhousekeeping.com%2Flife%2Fpets%2Fg4531%2Fcutest-dog-breeds%2F&psig=AOvVaw0-OMN5a8AJztFBuIzy-YNT&ust=1707483940015000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCJiRn8bnm4QDFQAAAAAdAAAAABAE",
      price: "0.03ETH",
      currentlySelling: "True",
      address: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    },
  ];
  const [data, updateData] = useState(sampleData);
  const [dataFetched, updateFetched] = useState(false);

  async function getAllNFTs() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    let transaction = await contract.getAllNFTs();
    const items = await Promise.all(
      transaction.map(async (i) => {
        var tokenURI = await contract.tokenURI(i.id);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
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
        return item;
      })
    );
    updateFetched(true);
    updateData(items);
  }

  useEffect(() => {
    if (!dataFetched) getAllNFTs();
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
    <div>
      <Navbar />
      <div className="flex flex-col place-items-center mt-20">
        <div className="md:text-xl font-bold text-white">Top NFTs</div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {data.map((value, index) => {
            return <Tile data={value} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
}
