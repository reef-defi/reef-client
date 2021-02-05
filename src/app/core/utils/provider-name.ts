export const getProviderName = (web3: any): string => {
  if (!web3) {
    return 'unknown';
  }
  if (web3.currentProvider.isMetaMask) {
    return 'MetaMask';
  }

  if (web3.currentProvider.isTrust) {
    return 'Trust';
  }

  if (web3.currentProvider.isGoWallet) {
    return 'Go Wallet';
  }

  if (web3.currentProvider.isAlphaWallet) {
    return 'Alpha Wallet';
  }

  if (web3.currentProvider.isStatus) {
    return 'Status';
  }

  if (web3.currentProvider.isToshi) {
    return 'Coinbase';
  }

  if (web3.currentProvider.isTorus) {
    return 'Torus';
  }

  if (web3.currentProvider.constructor.name === 'WalletConnectProvider') {
    return 'Wallet Connect';
  }
};
