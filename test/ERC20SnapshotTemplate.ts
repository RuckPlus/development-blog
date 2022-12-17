import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

type SnapshotId = number | undefined;

describe("ERC20SnapshotTemplate", () => {
  const deployFixture = async () => {
    const [
      owner,
      account1
    ] = await ethers.getSigners();

    const ERC20SnapshotTemplate = await ethers.getContractFactory("ERC20SnapshotTemplate");
    const contract = await ERC20SnapshotTemplate.deploy();

    return { contract, owner, account1 };
  }

  describe("Functions: balanceOfAt", () => {
    describe("Success", () => {
      it("スナップショットを実行した時点の残高が取得できること", async () => {
        const { contract, account1 } = await loadFixture(deployFixture);

        const amount = 10;
        // 転送1回目
        await contract.transfer(account1.address, amount);
        // スナップショット
        const snapshotId: SnapshotId = await contract.snapshot()
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args[0]
                    ? Number(tx.events[0].args.id)
                    : undefined;
          });
        // 転送2回目
        await contract.transfer(account1.address, amount);

        if (snapshotId) {
          const balance = await contract.balanceOfAt(account1.address, snapshotId);
          expect(balance).to.equal(amount);
        } else {
          expect(snapshotId).to.equal(1);
        }
      });
    });
  });

  describe("Functions: totalSupplyAt", () => {
    describe("Success", () => {
      it("スナップショットを実行した時点の残高が取得できること", async () => {
        const { contract, account1 } = await loadFixture(deployFixture);

        const amount = ethers.BigNumber.from(10);
        // 転送1回目
        await contract.mint(account1.address, amount);
        const preTotalSupply = await contract.totalSupply();
        // スナップショット
        const snapshotId: SnapshotId = await contract.snapshot()
          .then(tx => { return tx.wait() })
          .then(tx => {
            return tx.events && tx.events[0].args && tx.events[0].args[0]
                    ? Number(tx.events[0].args.id)
                    : undefined;
          });
        // 転送2回目
        await contract.mint(account1.address, amount);

        if (snapshotId) {
          const totalSupply = await contract.totalSupplyAt(snapshotId);
          expect(totalSupply).to.equal(preTotalSupply);
        } else {
          expect(snapshotId).to.equal(1);
        }
      });
    });
  });
});
