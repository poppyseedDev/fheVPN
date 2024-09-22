// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { ethers } from 'ethers';
import { useState } from 'react';

export const useMintTokens = (rpcUrl: string, mintableERCAddress: string, mintableERCABI: any) => {
  const [error, setError] = useState<string>('');

  const mintTokens = async (account: string, mintAmount: string) => {
    if (!account || !mintAmount) return;

    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(account); 
      const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, signer);
      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(mintAmount, decimals);
      const tx = await contract.mint(account, amount);
      await tx.wait();
      setError('');
    } catch (err) {
      setError('Failed to mint tokens');
    }
  };

  return { mintTokens, error };
};
