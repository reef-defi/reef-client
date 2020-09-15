export const balancerPoolQuery = `
{
  pools(first: 250, orderBy: liquidity, orderDirection: desc, where: {publicSwap: true}) {
    id
    totalWeight
    tokensList
    totalShares
    swapsCount
    liquidity
    tokens {
      id
      address
      balance
      symbol
      denormWeight
    }
  }
}`;

export const uniswapPoolQuery = `
{
  pairs(first: 250, orderBy: trackedReserveETH, orderDirection: desc) {
    id,
    reserve0,
    reserve1,
    totalSupply,
    trackedReserveETH,
    token0 {
      id,
      symbol,
      decimals
    },
    token1 {
      id,
      symbol,
      decimals
    }
  }
}`;
