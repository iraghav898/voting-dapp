import { useState, useEffect, useCallback } from 'react';
import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther
} from "ethers";
import { contractAddress, contractABI } from './Constant/constant';
import Login from './Components/Login';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState(' ');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(true);


  async function connectToMetamask() {
  if (window.ethereum) {
    try {
      // This line triggers the MetaMask popup
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const browserProvider = new BrowserProvider(window.ethereum); // ethers v6
      setProvider(browserProvider);

      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      console.log("Connected account: " + address);

      setAccount(address);
      setIsConnected(true);
      checkCanVote(); 

      // Connect to contract
      const contract = new Contract(contractAddress, contractABI, signer);
      console.log("Contract instance:", contract);

    } catch (error) {
      console.error("Error connecting to Metamask:", error);
    }
  } else {
    console.error("Metamask is not installed");
  }
}


   

  // ✅ Handles account switching — wrapped in useCallback for stability
  const handleAccountsChanged = useCallback((accounts) => {
    console.log("Accounts changed:", accounts);
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
      checkCanVote(); // Check if the user can vote
    } else {
      setAccount(null);
      setIsConnected(false);
    }
  }, []);

  
  useEffect(() => {
    getCandidates();
    getRemainingTime();
    getCurrentStatus();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(console.error);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [handleAccountsChanged]);

  




   

 const getCandidates = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const candidatesList = await contract.getAllVotesOfCandidates();
      const formatted = candidatesList.map((c, i) => ({
        index: i,
        name: c.name,
        voteCount: Number(c.voteCount),
      }));

      setCandidates(formatted);
    } catch (err) {
      console.error("Error loading candidates:", err);
    }
  }




  const getCurrentStatus = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const status = await contract.getVotingStatus();
      console.log("Voting active?", status);
      setVotingStatus(status);
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  };

  const getRemainingTime = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const time = await contract.getRemainingTime();
      console.log("Remaining time (seconds):", time);
      setRemainingTime(Number(time)); // Convert BigInt to number
    } catch (error) {
      console.error("Error fetching remaining time:", error);
    }
  };




async function vote() {
  const provider = new BrowserProvider(window.ethereum); // Updated provider
  const signer = await provider.getSigner(); // Now requires await

  const contractInstance = new Contract(
    contractAddress,
    contractABI,
    signer
  );

  const tx = await contractInstance.vote(number); // vote() is your contract method
  await tx.wait(); // Waits for it to be mined
  checkCanVote(); // Re-checks if the user can vote again
}

  

async function checkCanVote() {
  const provider = new BrowserProvider(window.ethereum); // Replaces Web3Provider
  const signer = await provider.getSigner(); // getSigner now returns a Promise

  const contractInstance = new Contract(
    contractAddress,
    contractABI,
    signer
  );

  const userAddress = await signer.getAddress(); // Same as v5
  const voteStatus = await contractInstance.voters(userAddress); // Reading mapping
  setCanVote(voteStatus); // Update your React state
}




  // ✅ Connect to MetaMask using ethers v6
  

  async function handleNumberChange(event) {
    setNumber(event.target.value);

  }

  return (
    <div className="App">
      {isConnected ? (
        <Connected
        account={account}
        candidates = {candidates}
        remainingTime = {remainingTime}
        number = {number}
        handleNumberChange = {handleNumberChange}
        voteFunction = {vote}
        showButton = {checkCanVote}  />) : (
        <Login connectWallet={connectToMetamask} />
      )}


    </div>
  );
}

export default App;
