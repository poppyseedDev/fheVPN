import { useState } from 'react';
import { ethers } from 'ethers';

export const useBalance = (rpcUrl: string, mintableERCAddress: string, mintableERCABI: any) => {
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string>('');

  const updateBalance = async (account: string) => {

    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, provider);
      const balanceRaw = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      setBalance(ethers.formatUnits(balanceRaw, decimals));
    } catch (err) {
      setError(`Failed to fetch balance ${err}`);
    }
  };

  return { balance, updateBalance, error };
};
