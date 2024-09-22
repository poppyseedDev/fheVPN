"use client";

import { useEffect, useState } from 'react';
import { useConnectWallet } from './hooks/connect';
import { useBalance } from './hooks/balance';
import { useMintTokens } from './hooks/mint';
import { useServers, useServerOperations, usePayForServerAccess} from './hooks/serverActions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ABI for MintableERC contract
const mintableERCABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) external returns (bool)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool)", // Added transferFrom
];

// ABI for ProxyLocation contract (simplified for this example)
const proxyLocationABI = [
  "function addServer(inEuint8 memory _firstOctet, inEuint8 memory _secondOctet, inEuint8 memory _thirdOctet, inEuint8 memory _fourthOctet, uint128 _costToLoan, string memory _countryServerIsIn) public onlyAdmin",
  "function payServerForAccess(inEuint8 memory _firstOctet, inEuint8 memory _secondOctet, inEuint8 memory _thirdOctet, inEuint8 memory _fourthOctet, uint256 _serverRequested) public",
  "function _currServerCount() public view returns (uint256)",
  "function _serverCountryList(uint256) public view returns (string)"
];

const rpcUrl = 'https://api.helium.fhenix.zone';
const mintableERCAddress = '0xe58080AA9f3D37BEefc41adcF15D527F2dc94dc3';
const proxyLocationAddress = '0x289cE92A4350D84e9106ba426A2A12C28d75Abe1';

export function Page() {
  const { account, network, connectWallet, error: connectError } = useConnectWallet(rpcUrl);
  const { balance, updateBalance, error: balanceError } = useBalance(rpcUrl, mintableERCAddress, mintableERCABI);
  const { serverCount, servers, fetchServers, error: serverError } = useServers(rpcUrl, proxyLocationAddress, proxyLocationABI);
  const { mintTokens, error: mintError } = useMintTokens(rpcUrl, mintableERCAddress, mintableERCABI);
  const { addServer, error: serverOpError } = useServerOperations(rpcUrl, proxyLocationAddress, proxyLocationABI);
  const { payForServerAccess, error: payError } = usePayForServerAccess(rpcUrl, proxyLocationAddress, proxyLocationABI);

  const [mintAmount, setMintAmount] = useState<string>('');

  useEffect(() => {
    // If wallet is already connected, don't trigger connect again.
    if (!account) {
      connectWallet();
    }
    fetchServers();
  }, [account, connectWallet, fetchServers]);

  useEffect(() => {
    if (account) {
      updateBalance(account);
    }
  }, [account, updateBalance]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-4">Welcome to Web3 Interaction</h2>
        <p className="text-lg text-neutral-500 dark:text-neutral-400">
          Connect your wallet and interact with Ethereum smart contracts. Mint tokens, manage servers, and explore the world of decentralized applications.
        </p>
      </section>

      {/* Error Alerts */}
      {connectError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{connectError}</AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Address:</strong> {account || "Not connected"}</p>
          <p><strong>Balance:</strong> {balance || "0"} TFHE</p>
          <p><strong>Connected to:</strong> {network || "-"}</p>
          {!account && (
            <Button onClick={connectWallet} className="mt-2">Connect Wallet</Button>
          )}
        </CardContent>
      </Card>

      {/* Mint Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Mint Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="mintAmount">Amount</Label>
            <Input
              id="mintAmount"
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Enter amount to mint"
            />
          </div>
          <Button className="mt-2" onClick={() => mintTokens(account, mintAmount)} disabled={!account || !mintAmount}>
            Mint
          </Button>
          {mintError && <p className="text-red-500 mt-2">{mintError}</p>}
        </CardContent>
      </Card>

      {/* Server Management */}
      <Card>
        <CardHeader>
          <CardTitle>Proxy Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Server Count:</strong> {serverCount}</p>
          <Button className="mt-2" onClick={() => addServer(account, '0.1', 'USA')} disabled={!account}>
            Add Server
          </Button>
          {serverOpError && <p className="text-red-500 mt-2">{serverOpError}</p>}
        </CardContent>
      </Card>

      {/* Server List */}
      <Card>
        <CardHeader>
          <CardTitle>Server List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {servers.map((server) => (
              <li key={server.id}>
                Server ID: {server.id}, Country: {server.country}
                <Button
                  className="ml-4"
                  onClick={() => payForServerAccess(account, server.id, { firstOctet: 192, secondOctet: 168, thirdOctet: 1, fourthOctet: 1 })}
                  disabled={!account}
                >
                  Pay for Access
                </Button>
              </li>
            ))}
          </ul>
          {payError && <p className="text-red-500 mt-2">{payError}</p>}
        </CardContent>
      </Card>
    </div>
  );
}