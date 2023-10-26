import { useAccount, useNetwork } from '@pancakeswap/awgmi';
import { equalsIgnoreCase } from '@pancakeswap/utils/equalsIgnoreCase';
import { chains, defaultChain } from 'config/chains';
import { atom, useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { isChainSupported } from 'utils';

const queryNetworkAtom = atom('');

queryNetworkAtom.onMount = (set) => {
  const params = new URL(window.location.href).searchParams;
  const n = params.get('network');
  if (n && isChainSupported(n)) {
    set(n.toLowerCase());
  } else {
    set(defaultChain.name);
  }
};

const supportedNetworks = ['ethereum', 'bsc', 'polygon']; // Add more networks as needed

export default function NetworkSwitcher() {
  const queryNetwork = useAtomValue(queryNetworkAtom);
  const { query } = useRouter();
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const isWrongNetwork = (isConnected && !chain) || chain?.unsupported;

  const handleNetworkSwitch = (newNetwork) => {
    const router = useRouter();
    router.push({ query: { network: newNetwork } });
  };

  const localNetworkName = useLocalNetwork(query, queryNetwork);

  return (
    <div>
      {supportedNetworks.map((network) => (
        <button
          key={network}
          onClick={() => handleNetworkSwitch(network)}
          disabled={localNetworkName === network || isWrongNetwork}
        >
          Switch to {network.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function useLocalNetwork(query, queryNetwork) {
  const network = query.network || queryNetwork;

  if (typeof network === 'string' && isChainSupported(network)) {
    return network;
  }

  return undefined;
}