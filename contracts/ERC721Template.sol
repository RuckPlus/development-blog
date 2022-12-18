// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title ERC721 template
/// @author Kentaro Masuda
contract ERC721Template is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    string public baseURI = "https://localhost/";

    event BaseURIChanged(
        string indexed preBaseURI,
        string indexed newBaseURI
    );

    constructor() ERC721("RuckNFT", "RNFT") {}

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        string memory preBaseURI = baseURI;
        baseURI = newBaseURI;

        emit BaseURIChanged(preBaseURI, newBaseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}
