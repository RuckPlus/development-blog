// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC20Snapshot template
/// @author Kentaro Masuda
contract ERC20SnapshotTemplate is ERC20Snapshot, Ownable {
    uint8 private _desimals = 18;

    constructor() ERC20("RuckCoin", "RCN") {
        _mint(msg.sender, 100000000 * 10 ** _desimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _desimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function snapshot() public onlyOwner returns (uint256) {
        return _snapshot();
    }
}
