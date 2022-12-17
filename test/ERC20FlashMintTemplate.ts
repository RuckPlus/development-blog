import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20FlashMintTemplate", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ERC20Template");
    const lenderERC20Contract = await ERC20.deploy();
    const borrowerERC20Contract = await ERC20.deploy();

    const ERC20FlashMintTemplate = await ethers.getContractFactory("ERC20FlashMintTemplate");
    const contract = await ERC20FlashMintTemplate.deploy();

    return { contract,lenderERC20Contract, borrowerERC20Contract, owner, account1 };
  }

  describe("Functions: maxFlashLoan", () => {
    describe("Success", () => {
      it("発行された通貨が、残高に反映されていること", async () => {  
        const { contract, lenderERC20Contract, account1 } = await loadFixture(deployFixture);

        const test1 = await contract.maxFlashLoan(lenderERC20Contract.address)
        console.log(test1);

        const test2 = await contract.flashFee(contract.address, 10)
        console.log(test2);

        const test3 = await contract.flashFee(contract.address, 10)
        console.log(test3);

        const mintAmount = ethers.BigNumber.from(1000000);
        await contract.mint(account1.address, mintAmount);
  
        expect(await contract.balanceOf(account1.address)).to.equal(mintAmount);
      });
    })
  });
});
