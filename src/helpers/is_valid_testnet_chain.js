export function isValidTestnetChain(chainId) {
  const acceptedNetworks = ["80001"]; // Mumbai testnet
  return acceptedNetworks.includes(String(chainId));
}
