// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC20Burnable template
/// @author Kentaro Masuda
contract ERC20BurnableTemplate is ERC20Burnable, Ownable {
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
}
