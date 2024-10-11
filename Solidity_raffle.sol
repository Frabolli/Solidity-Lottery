/**
 *Submitted for verification at Etherscan.io on 2024-05-06
*/

pragma solidity >=0.8.2 <0.9.0;

contract Lottery {
    address payable[] public entries;  // Player addresses (multiple entries permitted)
    address[] public winners;  // Previous winner addresses
    uint[] public winningIndices;  // Previous random indices
    uint public raffleID;  // Unique raffle identifier
    uint public pot;  // Amount of ETH in raffle
    bytes32 public keccakHash;  // Hashed randomness

    address[] public creators;  // Creator addresses
    mapping(address => uint) public pots;  // Creator pots
    uint public residuals;  // Tips which have not already been split between creator pots

    constructor() {
        raffleID = 0;
        pot = 0;
        
        creators.push(0xF436c06414b73537c75cf0E9baC9d3ad6715C316);  // Ale
        creators.push(0x1ad0f15a3D6a7fb443EF257834413518EdCD5B58);  // Andrea
        creators.push(0xda6416C3fd2AD07844b40EF9615b08237134fBdB);  // Franci
        creators.push(0x9A63679AC2927D1852Eee113Fee2332C44078b9f);  // Ila
        
        pots[0xF436c06414b73537c75cf0E9baC9d3ad6715C316] = 0;  // Ale
        pots[0x1ad0f15a3D6a7fb443EF257834413518EdCD5B58] = 0;  // Andrea
        pots[0xda6416C3fd2AD07844b40EF9615b08237134fBdB] = 0;  // Franci
        pots[0x9A63679AC2927D1852Eee113Fee2332C44078b9f] = 0;  // Ila
        
        residuals = 0;  // Unpaid tips
    }


    function EnterRaffle() public payable{
        require(msg.value >= 10000000000000000 wei, "msg.value must be a minimum of 0.01 ETH");
        require(msg.value%10000000000000000 == 0, "msg.value must be a multiple of 0.01 ETH");
        require(pot + msg.value <= 1000000000000000000 wei, "Total raffle pot cannot exceed 1 ETH");

        uint numEntries = msg.value/(10000000000000000);  // Number of new entries 
        pot += msg.value;  // Add msg.value to pot
        for (uint256 i = 0; i < numEntries; i++) {  // For each new entry
            entries.push(payable(msg.sender));  // Add msg.sender to entries array
        }

        if (entries.length == 100 && pot == 1 ether){  // If raffle complete
            FinishRaffle();  // Call FinishRaffle() function
        }
    }

    function FinishRaffle() private {
        require(pot >= 1000000000000000000 wei, "Raffle incomplete: total raffle pot must be 1 ETH");
        address payable winner = entries[ChooseWinner()];  // Find winning address
        winners.push(winner);  // Add winner to winners array
        winner.transfer(1 ether);  // Transfer pot to winner

        entries = new address payable[](0);  // Reset entries array
        raffleID += 1;  // Increment raffleID
        pot = 0;  // Reset raffle pot
    }

    function ChooseWinner() private returns (uint){
        keccakHash = keccak256(abi.encodePacked(gasleft(), block.timestamp));  // Generate random hash
        winningIndices.push(uint(keccakHash) % entries.length);  // Calculate winning index 
        return winningIndices[winningIndices.length-1];
    }

    function GetRaffleID() public view returns(uint) {
        return raffleID;
    }

    function GetEntryCount() public view returns (uint){
        return entries.length;
    }

    function GetEntries() public view returns (address payable[] memory) {
        return entries;
    }

    function GetPot() public view returns (uint){
        return pot;
    }

    function GetLastWinner() public view returns (address){
        return winners[winners.length -1];
    }

    function GetAllWinners() public view returns (address[] memory) {
        return winners;
    }

    function GetLastIndex() public view returns (uint){
        return winningIndices[winningIndices.length -1];
    }

    function GetAllIndices() public view returns (uint[] memory) {
        return winningIndices;
    }

    function SendTip() public payable{
        residuals += msg.value;
        uint splitTips = residuals/creators.length;  // Calculate maximum shareable amount
        for (uint256 i = 0; i < creators.length; i++) {
            pots[creators[i]] += splitTips;  // Distribute tips
            residuals -= splitTips;
        }
    }

    function GetMyTips() public view returns (uint){
        require(pots[msg.sender] > 0 wei, "msg.sender has no assigned tips");
        return pots[msg.sender];
    }

    function PayMyTips() public {
        require(pots[msg.sender] > 0 wei, "msg.sender has no assigned tips");
        payable(msg.sender).transfer(pots[msg.sender]);  // Transfer tips to assigned creator
        pots[msg.sender] = 0;
    }
}