import { useState } from 'react';
import { ethers } from 'ethers';

export const useConnectWallet = (rpcUrl: string) => {
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [network, setNetwork] = useState<string>('');

  const connectWallet = async () => {
    try {
      let provider;
      let accountAddress;

      // Check if the connection is to MetaMask (window.ethereum) or a custom RPC URL
      if (rpcUrl === 'https://api.helium.fhenix.zone') {
        // Use MetaMask if connecting to Helium
        if (!window.ethereum) {
          setError('MetaMask is not installed');
          return;
        }
        provider = new ethers.BrowserProvider(window.ethereum);

        // Request the account if not already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length === 0) {
          // If no accounts are returned, request connection via MetaMask
          const requestedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          accountAddress = requestedAccounts[0]; // Get the first account (default)
        } else {
          // If already connected, use the first account
          accountAddress = accounts[0];
        }
      } else {
        // Use custom provider (localhost or other RPC)
        provider = new ethers.JsonRpcProvider(rpcUrl);

        // Get the first account from the local node via the JSON-RPC provider
        const accounts = await provider.listAccounts();
        if (accounts.length === 0) {
          throw new Error('No accounts found in the custom RPC');
        }
        accountAddress = accounts[0]; // Use the first account
      }

      setAccount(accountAddress);

      // Get the network details from the provider
      const networkDetails = await provider.getNetwork();
      setNetwork(networkDetails.name || `Chain ID: ${networkDetails.chainId}`);

      return accountAddress;
    } catch (err) {
      setError(`Failed to connect to the wallet: ${err.message}`);
    }
  };

  return { account, network, connectWallet, error };
};
