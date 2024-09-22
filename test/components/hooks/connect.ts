import { useState } from 'react';
import { ethers } from 'ethers';

export const useConnectWallet = (rpcUrl: string) => {
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      // Request accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const selectedAccount = accounts[0]; // Get the first account (default)
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(selectedAccount);
      const accountAddress = await signer.getAddress(); // This should now work properly

      setAccount(accountAddress);
      return accountAddress;
    } catch (err) {
      setError(`Failed to connect to the wallet: ${err}`);
    }
  };

  return { account, connectWallet, error };
};
