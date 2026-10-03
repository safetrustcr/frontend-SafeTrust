interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  on?: <T = unknown>(event: string, handler: (...args: T[]) => void) => void;
  removeListener?: <T = unknown>(
    event: string,
    handler: (...args: T[]) => void,
  ) => void;
  selectedAddress?: string | null;
  networkVersion?: string;
  chainId?: string;
}

interface Window {
  ethereum?: EthereumProvider;
}
