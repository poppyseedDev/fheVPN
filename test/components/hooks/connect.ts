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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner(account);
      const accountAddress = await (await signer).getAddress();
      setAccount(accountAddress);
      return accountAddress;
    } catch (err) {
      setError(`Failed to connect to the custom RPC URL ${err}`);
    }
  };

  return { account, connectWallet, error };
};
