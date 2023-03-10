// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC20Capped template
/// @author Kentaro Masuda
contract ERC20CappedTemplate is ERC20Capped, Ownable {
    uint8 private _decimals = 18;
    uint256 private _cap = 100000000 * 10 ** _decimals;

    constructor() ERC20("RuckCoin", "RCN") ERC20Capped(_cap) {
        _mint(_msgSender(), 100 * 10 ** _decimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
