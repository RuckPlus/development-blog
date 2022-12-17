import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20BurnableTemplate", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC20Burnable = await ethers.getContractFactory("ERC20BurnableTemplate");
    const contract = await ERC20Burnable.deploy();

    return { contract, owner, account1 };
  }

  describe("Functions: burn", () => {
    describe("Success", () => {
      it("指定した額が、オーナーアカウントから破棄されること", async () => {
        const { contract, owner } = await loadFixture(deployFixture);

        const burnAmount = ethers.BigNumber.from('100000000000000000000000000')
        await contract.burn(burnAmount);
  
        expect(await contract.balanceOf(owner.address)).to.equal(0);
      });

      it("指定した額が、指定したアカウントから破棄されること", async () => {  
        const { contract, account1 } = await loadFixture(deployFixture);

        const mintAmount = ethers.BigNumber.from('10000000')
        await contract.mint(account1.address, mintAmount);
        expect(await contract.balanceOf(account1.address)).to.equal(mintAmount);

        await contract.connect(account1).approve(account1.address, mintAmount);
        await contract.connect(account1).burnFrom(account1.address, mintAmount);
        expect(await contract.balanceOf(account1.address)).to.equal(0);
      });
    })
  });
});
