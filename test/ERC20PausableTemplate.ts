import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20PausableTemplate", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC20PausableTemplate = await ethers.getContractFactory("ERC20PausableTemplate");
    const contract = await ERC20PausableTemplate.deploy();

    return { contract, owner, account1 };
  }

  describe("Functions: transfer", () => {
    describe("Error", () => {
      it("停止中はトークンの転送ができないこと", async () => {
        const { contract, account1 } = await loadFixture(deployFixture);

        await contract.pause();
        await expect(contract.transfer(account1.address, 1)).to.be.revertedWith("ERC20Pausable: token transfer while paused");
      });
    })
  });

  describe("Functions: transferFrom", () => {
    describe("Error", () => {
      it("停止中はトークンの転送ができないこと", async () => {
        const { contract, owner, account1 } = await loadFixture(deployFixture);

        await contract.pause();
        await contract.approve(owner.address, 1);
        await expect(contract.transferFrom(owner.address, account1.address, 1)).to.be.revertedWith("ERC20Pausable: token transfer while paused");
      });
    })
  });

  describe("Functions: mint", () => {
    describe("Error", () => {
      it("停止中はミントができないこと", async () => {
        const { contract, owner } = await loadFixture(deployFixture);

        await contract.pause();
        await expect(contract.mint(owner.address, 1)).to.be.revertedWith("ERC20Pausable: token transfer while paused");
      });
    })
  });
});
