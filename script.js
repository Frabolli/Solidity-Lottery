document.getElementById('connectButton').addEventListener('click', async () => {
    if (typeof window.ethereum === 'undefined') {
        alert("Please install MetaMask to use this feature.");
        return;
    }

    const button = document.getElementById('connectButton');
    button.disabled = true; // Disable the button to prevent multiple clicks

    try {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        document.getElementById('accountArea').innerHTML = 'Connected: ' + account;
        alert('Connected to MetaMask. You can now buy a ticket or send tips.');
    } catch (error) {
        console.error('An error occurred:', error);
        alert('Failed to connect to MetaMask. Please try again.');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('buyTicketButton').addEventListener('click', async () => {
    const button = document.getElementById('buyTicketButton');
    button.disabled = true; // Prevent multiple clicks

    const numberOfTickets = parseInt(document.getElementById('ticketSlider').value);
    if (isNaN(numberOfTickets) || numberOfTickets < 1) {
        alert("Please enter a valid number of tickets.");
        button.disabled = false;
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0xf413B7Cb00D80A2cDBd2F4e9971fc1ef24FD743D";
        const contractABI = [
            {
                "inputs": [],
                "name": "EnterRaffle",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "GetLastWinner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "GetEntryCount",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const ticketPriceEth = 0.01; // The cost per ticket in ether
        const totalCostEth = ticketPriceEth * numberOfTickets;
        const txResponse = await contract.EnterRaffle({
            value: ethers.utils.parseEther(totalCostEth.toString())
        });
        await txResponse.wait();

        const lastWinner = await contract.GetLastWinner();
        document.getElementById('lastWinnerAddress').textContent = lastWinner;
        launchConfetti();

        console.log('Tickets purchased! Transaction Receipt:', txResponse);
        alert(`Successfully purchased ${numberOfTickets} tickets!`);
    } catch (error) {
        console.error('Failed to buy tickets:', error);
        alert('Failed to purchase the tickets. Please try again.');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('sendTipsButton').addEventListener('click', async () => {
    const button = document.getElementById('sendTipsButton');
    button.disabled = true; // Prevent multiple clicks

    const tipAmountEth = document.getElementById('tipAmountSlider').value;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0xf413B7Cb00D80A2cDBd2F4e9971fc1ef24FD743D";
        const contractABI = [
            {
                "inputs": [],
                "name": "SendTip",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "GetLastWinner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "GetEntryCount",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const txResponse = await contract.SendTip({
            value: ethers.utils.parseEther(tipAmountEth)
        });
        await txResponse.wait();

        console.log('Tip sent! Transaction Receipt:', txResponse);
        alert(`Thank you for your tip of ${tipAmountEth} ETH!`);
    } catch (error) {
        console.error('Failed to send tip:', error);
        alert('Failed to send the tip. Please try again.');
    } finally {
        button.disabled = false;
    }
});

// Optionally, fetch the last winner and entry count on page load
document.addEventListener('DOMContentLoaded', async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractAddress = "0xf413B7Cb00D80A2cDBd2F4e9971fc1ef24FD743D";
    const contractABI = [
        {
            "constant": true,
            "inputs": [],
            "name": "GetLastWinner",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "GetEntryCount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const lastWinner = await contract.GetLastWinner();
    document.getElementById('lastWinnerAddress').textContent = lastWinner || 'None';
    const entryCount = await contract.GetEntryCount();
    document.getElementById('entryCount').textContent = entryCount.toString();
});

// Function to launch confetti when a winner is updated
function launchConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}
