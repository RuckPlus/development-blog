import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const BASE_URI = "https://localhost/";

describe("ERC721Template", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC721Template = await ethers.getContractFactory("ERC721Template");
    const contract = await ERC721Template.deploy();

    return { contract, owner, account1 };
  }

  describe("Functions: tokenURI", () => {
    describe("Success", () => {
      it("トークンURIが取得できること", async () => {
        const { contract, owner } = await loadFixture(deployFixture);

        const tokenId = await contract.safeMint(owner.address)
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args.tokenId;
          });

        const tokenURI = await contract.tokenURI(tokenId);

        expect(tokenURI).to.equal(`${BASE_URI}${tokenId}`);
      });
    })
  });

  describe("Functions: setBaseURI", () => {
    describe("Success", () => {
      it("ベースURIが変更できること", async () => {
        const { contract, owner } = await loadFixture(deployFixture);

        const newBaseURI = "http://localhost:3000/"

        // MEMO: イベントもチェック
        await expect(contract.setBaseURI(newBaseURI))
          .to.emit(contract, "BaseURIChanged")
          .withArgs(BASE_URI, newBaseURI);

        const tokenId = await contract.safeMint(owner.address)
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args.tokenId;
          });
        const tokenURI = await contract.tokenURI(tokenId);

        expect(tokenURI).to.equal(`${newBaseURI}${tokenId}`);
      });
    })
  });

  describe("Functions: safeMint", () => {
    describe("Success", () => {
      it("ミント時にトークンIDが自動採番されること", async () => {
        const { contract, owner } = await loadFixture(deployFixture);

        let tokenId = await contract.safeMint(owner.address)
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args.tokenId;
          });

        expect(tokenId).to.equal(0);

        tokenId = await contract.safeMint(owner.address)
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args.tokenId;
          });

        expect(tokenId).to.equal(1);

        tokenId = await contract.safeMint(owner.address)
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args.tokenId;
          });

        expect(tokenId).to.equal(2);

        tokenId = await contract.safeMint(owner.address)
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args.tokenId;
          });

        expect(tokenId).to.equal(3);
      });
    })
  });
});
