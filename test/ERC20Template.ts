import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20Template", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC20Template = await ethers.getContractFactory("ERC20Template");
    const contract = await ERC20Template.deploy();

    return { contract, owner, account1 };
  }

  describe("Functions: mint", () => {
    describe("Success", () => {
      it("発行された通貨が、残高に反映されること", async () => {
        const { contract, account1 } = await loadFixture(deployFixture);

        const mintAmount = ethers.BigNumber.from(1000000);
        await contract.mint(account1.address, mintAmount);
  
        expect(await contract.balanceOf(account1.address)).to.equal(mintAmount);
      });
    })
  });
});
