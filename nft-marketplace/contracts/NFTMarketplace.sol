// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract NFTMarketplace is ERC721, ERC721Enumerable, ERC721URIStorage {
    uint256 constant MAX_LIMIT = 200;
    uint256 public TokenId = 0;
    address private owner;
    error ReachedMAXLIMIT(uint num);
    uint256 public fee = 0.01 ether;
    uint256 public totalSold = 0;

    error NOT_OWNER(address addr);

    struct ListedToken {
        uint256 id;
        address payable owner;
        address payable seller;
        uint256 price;
        bool listedOrNot;
    }

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    mapping(uint256 => ListedToken) private idToListedToken;

    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        uint256 currentTokenId = TokenId;
        return idToListedToken[currentTokenId];
    }

    function getListedTokenForId(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return TokenId;
    }

    

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function updateFee(uint256 _fee) public payable {
        if (msg.sender == owner) {
            fee = _fee;
        } else {
            revert NOT_OWNER(msg.sender);
        }
    }

    function getFeePrice() public view returns (uint256) {
        return fee;
    }

    function safeMint(string memory uri, uint256 price) public payable {
        TokenId++;
        _safeMint(msg.sender, TokenId);
        _setTokenURI(TokenId, uri);
        createListedToken(TokenId, price);
        if (TokenId >= MAX_LIMIT) {
            revert ReachedMAXLIMIT(TokenId);
        }
    }

    function createListedToken(uint256 tokenId, uint256 price) public {
        //require(msg.value == fee, "Sent the correct price");

        require(price > 0, "Make sure it is not negative");
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint256 totalItemCount = TokenId;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        uint256 currentId;

        for (uint i = 0; i <= totalItemCount; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                itemCount += 1;
            }
        }

        ListedToken[] memory items = new ListedToken[](itemCount);

        for (uint i = 0; i < totalItemCount; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                currentId = i + 1;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    
    function executeSale(uint256 tokenId) public payable {
        //uint256 price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;
       
         //if(msg.value != price+fee){
             //revert("Please submit the asking price in order to complete the purchase");
         //}

        idToListedToken[tokenId].listedOrNot = true;
        idToListedToken[tokenId].seller = payable(msg.sender);
        totalSold++;

        _safeTransfer(address(this), msg.sender, tokenId);

        approve(address(this), tokenId);
        (bool s, ) = owner.call{value: fee}("");
        require(s, "Failed to sent ether");
        //payable(owner).transfer(fee);
        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent, "Failed to sent ether");
        //payable(seller).transfer(msg.value);
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = TokenId;
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint currentIndex = 0;
        uint currentId;
        for (uint i = 0; i < nftCount; i++) {
            currentId = i + 1;
            ListedToken storage currentItem = idToListedToken[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return tokens;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
