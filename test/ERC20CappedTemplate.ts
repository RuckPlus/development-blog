import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20CappedTemplate", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC20CappedTemplate = await ethers.getContractFactory("ERC20CappedTemplate");
    const contract = await ERC20CappedTemplate.deploy();

    return { contract, owner, account1 };
  }

  describe("Functions: mint", () => {
    describe("Success", () => {
      it("トークン供給上限を超える額は発行できないこと。", async () => {
        const { contract, owner } = await loadFixture(deployFixture);

        const cap = await contract.cap();
        const totalSupply = await contract.totalSupply();
        const remainingMintAmount = ethers.BigNumber.from(cap).sub(ethers.BigNumber.from(totalSupply));
        // MEMO: ここまではミント可能
        await contract.mint(owner.address, remainingMintAmount);

        await expect(contract.mint(owner.address, 1)).to.be.revertedWith("ERC20Capped: cap exceeded");
      });
    })
  });
});
