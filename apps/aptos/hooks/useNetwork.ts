import { useAccount, useNetwork } from '@pancakeswap/awgmi';
import { equalsIgnoreCase } from '@pancakeswap/utils/equalsIgnoreCase';
import { chains, defaultChain } from 'config/chains';
import { atom, useAtom, useAtomValue } from 'jotai'; // Updated import to include useAtom
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

function useLocalNetwork() {
  const queryNetwork = useAtomValue(queryNetworkAtom);
  const { query } = useRouter();

  const network = query.network || queryNetwork;

  if (typeof network === 'string' && isChainSupported(network)) {
    return network;
  }

  return undefined;
}

export function useActiveNetwork() {
  const localNetworkName = useLocalNetwork();
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const queryNetwork = useAtomValue(queryNetworkAtom);
  const isWrongNetwork = (isConnected && !chain) || chain?.unsupported;

  // until wallet support switch network, we follow wallet chain instead of routing
  return useMemo(() => {
    let networkName = '';

    if (queryNetwork === '') {
      return {
        networkName,
      };
    }

    networkName = chain?.network ?? localNetworkName;

    return {
      networkName,
      isWrongNetwork,
    };
  }, [queryNetwork, chain?.network, localNetworkName, isWrongNetwork]);
}

export function useActiveChainId() {
  const { networkName } = useActiveNetwork();

  return useMemo(
    () => chains.find((c) => equalsIgnoreCase(c.network, networkName))?.id ?? defaultChain.id,
    [networkName],
  );
}

export default function YourComponent() {
  const router = useRouter();

  // Function to change the network
  const changeNetwork = (newNetwork) => {
    router.push({ query: { network: newNetwork } });
  };

  return (
    <div>
      <button onClick={() => changeNetwork('ethereum')}>Switch to Ethereum</button>
      <button onClick={() => changeNetwork('bsc')}>Switch to BSC</button>
      {/* Add more buttons for other networks as needed */}
    </div>
  );
}
