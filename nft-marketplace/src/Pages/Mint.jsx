import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./Working/pinata";
import Marketplace from "../Marketplace.json";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import "./Mint.css";

function Mint() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);

  const [message, updateMessage] = useState("");

  async function DisableButton() {
    const mintButton = document.getElementById("mint-button");
    mintButton.disabled = true;
    mintButton.style.backgroundColor = "grey";
    mintButton.style.opacity = 0.2;
  }

  async function EnableButton() {
    const mintButton = document.getElementById("mint-button");
    mintButton.disabled = false;
    mintButton.style.backgroundColor = "#A500FF";
    mintButton.style.opacity = 1;
  }

  async function UploadToIPFS(e) {
    var file = e.target.files[0];
    try {
      DisableButton();
      updateMessage("Uploading image... Please wait for sometime");
      const response = await uploadFileToIPFS(file);
      if (response.success == true) {
        EnableButton();
        updateMessage("");
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }

  async function UploadMetaDataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the Data");
      return -1;
    }
    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success == true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("Error while uploading to IPFS");
    }
  }
  async function listNFT(e) {
    e.preventDefault();
    console.log("listNFT function is called");

    try {
      const metadataURL = await UploadMetaDataToIPFS();
      console.log(metadataURL);
      if (metadataURL === -1) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      DisableButton();
      updateMessage(
        "Uploading NFT(takes 5 mins).. please dont click anything!"
      );

      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      const price = ethers.utils.parseUnits(formParams.price, "ether");
      let listingPrice = await contract.getFeePrice();
      listingPrice = listingPrice.toString();

      let transaction = await contract.safeMint(metadataURL, price);
      await transaction.wait();

      alert("Successfully listed your NFT!");
      EnableButton();
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      window.location.replace("/");
    } catch (e) {
      console.error("Error in listNFT:", e);
      alert("Upload error" + e);
    }
  }

  return (
    <>
      <Navbar />
      <form>
        <label htmlFor="name">NFT Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Something COOL.."
          value={formParams.name}
          onChange={(e) =>
            updateFormParams({ ...formParams, name: e.target.value })
          }
        ></input>
        <br></br>

        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          placeholder="Type information about your NFT"
          value={formParams.description}
          onChange={(e) =>
            updateFormParams({ ...formParams, description: e.target.value })
          }
        ></input>
        <br></br>

        <label htmlFor="price">Price</label>
        <input
          type="text"
          id="price"
          name="price"
          placeholder="Min 0.01 ETH"
          value={formParams.price}
          onChange={(e) =>
            updateFormParams({ ...formParams, price: e.target.value })
          }
        ></input>
        <br></br>

        <input
          type="file"
          id="image"
          name="image-nft"
          onChange={UploadToIPFS}
        ></input>
        <button
          className="bg-indigo-500 py-8 "
          onClick={listNFT}
          id="mint-button"
        >
          Submit
        </button>
      </form>
    </>
  );
}

export default Mint;
