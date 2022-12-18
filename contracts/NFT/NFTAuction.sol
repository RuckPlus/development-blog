// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title NFTAuctionTemplate template
/// @author Kentaro Masuda
/// @dev NFTをラウンド毎にオークションにかけることができます。
///      ラウンドが進むにつれ、NFTの最低料金が高くなります。
///
///      ガイドライン:
///        1. オークションタイマーは、最初の入札が行われた後、48時間で設定されます。
///        2. 入札が行われると、オークションが2時間延長されます。
///        3. すべてのオークションラウンドは、（ラウンド開始から）7日後に終了します。
///        4. 第一ラウンドの開始価格は20,000になります。
///        5. すべてのラウンドを終了すると、NFTを作成できるようになります。
///        6. 入札後、金額はオークション契約(エスクロー)に送金されます。
///        7. より高い入札が行われると、資金はすぐにロック解除されます。
///        8. 入札がない場合、オークションは販売ラウンド終了時に終了します。
contract NFTAuctionTemplate is Ownable {
    uint256 public constant ONE_HOUR = 3600; // 1時間
    uint256 public constant PERIOD_LENGTH = 7 * 24 * ONE_HOUR; // 7日間
    uint256 public constant INITIAL_PERIOD = 48 * ONE_HOUR; // 48時間
    uint256 public constant BID_TIMEOUT = 2 * ONE_HOUR; // 2時間

    bytes32 public root; // MerkleRoot
    uint256 public start; // オークション開始日時 UNIXTIME

    IERC20 public paymentToken; // オークションで使用するERC20トークン

    uint256 public currentRound; // 現在のラウンド
    uint256 public startPrice; // オークション開始時のNFT価格
    uint256 public nextStartPrice; // 次回ラウンドのNFT初期価格

    mapping(bytes32=>address) public tokenOwner; // NFT ID ⇒ NFTオーナーのアドレス
    mapping(bytes32=>uint256) public highestPrice; // NFT ID ⇒ NFT価格
    mapping(bytes32=>uint256) public auctionEndTime; // NFT ID ⇒ 入札日時 + BID_TIMEOUT

    event NewRound(uint256 indexed round);

    event StartAuction(
        int indexed x,
        int indexed y,
        uint256 indexed round,
        address firstOwner,
        uint256 amount,
        uint256 ends
    );

    event NewBid(
        int indexed x,
        int indexed y,
        address owner,
        uint256 amount,
        uint256 ends
    );

    /// @param _root NFT IDのMerkleRoot
    /// @param _payment オークションで使用するERC20トークン
    /// @param _start オークション開始日時 UNIXTIME
    constructor(bytes32 _root, address _payment, uint _start) {
        root = _root;

        paymentToken = IERC20(_payment);

        startPrice = 20000 * 10 ** 18;
        nextStartPrice = startPrice;
        currentRound = 1;
        start = _start;

        emit NewRound(currentRound);
    }

    /// @dev トークンをBurnする関数
    function burnTokens(uint amount) public onlyOwner {
        paymentToken.transfer(address(1), amount);
    }

    /// @dev トークンを転送する関数
    function sendTokens(uint amount) public onlyOwner {
        paymentToken.transfer(owner(), amount);
    }

    /// @dev ラウンドを変える関数
    function changeRound() internal {
        currentRound = currentRound+1;
        startPrice = nextStartPrice;
        emit NewRound(currentRound);
    }

    /// @dev 次回ラウンドを返す関数
    function expectedRound() public view returns(uint256){
        return 1+(block.timestamp - start)/PERIOD_LENGTH;
    }

    /// @dev 次回ラウンドのオークション開始価格をセットする関数
    function setNextPrice(uint256 price) onlyOwner public{
        nextStartPrice = price;
    }

    /// @dev ハッシュ化する関数
    function getHash(int x, int y, uint256 round) public pure returns(bytes32){
        return keccak256(abi.encodePacked(x, y, round));
    }

    /// @dev ラウンド数を取得
    function getPlotRound(int x, int y) public view returns(uint256){
        return highestPrice[getHash(x, y, 0)];
    }

    /// @dev オークションを開始する関数
    function startAuction(int x, int y, bytes32[] calldata proof) public {
        require(start<=block.timestamp, "auction-not-started");
        while(expectedRound()>currentRound){
            changeRound();
        }
        uint256 plotRound = getPlotRound(x, y);
        require(MerkleProof.verify(proof, root, getHash(x, y, currentRound)), "invalid-proof");
        require(plotRound == 0,"already-sold");

        paymentToken.transferFrom(msg.sender, address(this), startPrice);
        highestPrice[getHash(x, y, 0)] = currentRound;
        tokenOwner[getHash(x, y, currentRound)] = msg.sender;
        auctionEndTime[getHash(x, y, currentRound)] = block.timestamp + INITIAL_PERIOD;
        highestPrice[getHash(x, y, currentRound)] = startPrice;

        emit NewBid(x, y, msg.sender, startPrice, auctionEndTime[getHash(x, y, currentRound)]);
        emit StartAuction(x, y,currentRound, msg.sender, startPrice, auctionEndTime[getHash(x, y, currentRound)]);
    }

    /// @dev NFTを入札する関数
    function bidPlot(int x, int y, uint256 amount) public {
        while(expectedRound()>currentRound){
            changeRound();
        }
        uint256 plotRound = getPlotRound(x, y);
        bytes32 plotSlotHash = getHash(x, y, plotRound);
        require(plotRound > 0, "not-started");
        require(plotRound == currentRound, "finished");
        require(highestPrice[plotSlotHash] * 11/10 <= amount, "bid-at-least-10-percent");
        require(timeLeft(x, y) >= 0, "bid-too-late");
        paymentToken.transferFrom(msg.sender, address(this), amount);
        paymentToken.transfer(
            tokenOwner[plotSlotHash], 
            highestPrice[plotSlotHash]);
        auctionEndTime[getHash(x, y, currentRound)] = auctionEndTime[getHash(x, y, currentRound)] + BID_TIMEOUT;
        tokenOwner[plotSlotHash] = msg.sender;
        highestPrice[plotSlotHash] = amount;
        emit NewBid(x, y, msg.sender, amount, auctionEndTime[getHash(x, y, currentRound)]);
    }

    /// @dev 取引ステータスを取得する関数
    function tradeStatus(int x, int y) public view returns (bool started, bool finished) {
        uint256 round = getPlotRound(x, y);
        started = (round != 0);
        finished = (round != currentRound);
        return (started, finished);
    }

    /// @dev NFT価格を取得する関数
    function getPlotPrice(int x, int y) public view returns (uint256) {
        uint256 round = getPlotRound(x, y);
        if(round==0){
            return 0;
        }
        return highestPrice[getHash(x,y,round)];
    }

    /// @dev NFTオーナーを取得する関数
    function getPlotOwner(int x, int y) public view returns (address) {
        uint256 round = getPlotRound(x, y);
        if(round==0){
            return address(0);
        }
        return tokenOwner[getHash(x,y,round)];
    }

    /// @dev 最終アクション日時からの経過時間を取得する関数
    function timeLeft(int x, int y) public view returns (int256) {
        uint256 round = getPlotRound(x, y);
        if(round != currentRound){
            return 0;
        }
        return (int256(auctionEndTime[getHash(x, y, round)]) - int256(block.timestamp));
    }

    /// @dev NFT詳細情報を取得する関数
    function getPlotDetails(int x, int y) public view  returns (uint256 price, address owner, bool isFinal) {
        uint256 round = highestPrice[getHash(x, y, 0)];
        return (highestPrice[getHash(x,y,round)], tokenOwner[getHash(x,y,round)], timeLeft(x, y)<=0);
    }
}
