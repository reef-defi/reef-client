export const contractData = {
  addr: '0xB095b4DEC4b71cf2C6EF875f26cafc3029e489A7',
  abi: [
    {
      inputs: [
        {
          internalType: 'uint16',
          name: '_protocolTokenDisinvestPercentage',
          type: 'uint16'
        },
        {
          internalType: 'address',
          name: '_protocolTokenAddress',
          type: 'address'
        }
      ],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'basketId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'disinvestedAmount',
          type: 'uint256'
        }
      ],
      name: 'Disinvest',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'basketId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'investedAmount',
          type: 'uint256'
        }
      ],
      name: 'Invest',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'OwnershipTransferred',
      type: 'event'
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      name: 'availableBaskets',
      outputs: [
        {
          internalType: 'string',
          name: 'name',
          type: 'string'
        },
        {
          internalType: 'address',
          name: 'referrer',
          type: 'address'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'availableBasketsSize',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address'
        },
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'balanceOfBalancerPools',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address'
        },
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'balanceOfMooniswapPools',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address'
        },
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'balanceOfTokens',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address'
        },
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'balanceOfUniswapPools',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: '_name',
          type: 'string'
        },
        {
          internalType: 'address[2][]',
          name: '_uniswapPools',
          type: 'address[2][]'
        },
        {
          internalType: 'uint8[]',
          name: '_uniswapPoolsWeights',
          type: 'uint8[]'
        },
        {
          internalType: 'address[]',
          name: '_tokens',
          type: 'address[]'
        },
        {
          internalType: 'uint8[]',
          name: '_tokensWeights',
          type: 'uint8[]'
        },
        {
          internalType: 'address[]',
          name: '_balancerPools',
          type: 'address[]'
        },
        {
          internalType: 'uint8[]',
          name: '_balancerPoolsWeights',
          type: 'uint8[]'
        },
        {
          internalType: 'address[]',
          name: '_mooniswapPools',
          type: 'address[]'
        },
        {
          internalType: 'uint8[]',
          name: '_mooniswapPoolsWeights',
          type: 'uint8[]'
        }
      ],
      name: 'createBasket',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'payable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint8[]',
          name: '_basketIndexes',
          type: 'uint8[]'
        },
        {
          internalType: 'uint256[]',
          name: '_percentage',
          type: 'uint256[]'
        },
        {
          internalType: 'uint256',
          name: '_protocolYieldRatio',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_protocolPoolRestakeRatio',
          type: 'uint256'
        }
      ],
      name: 'disinvest',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'payable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'getAvailableBasketBalancerPools',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]'
        },
        {
          internalType: 'uint8[]',
          name: '',
          type: 'uint8[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'getAvailableBasketMooniswapPools',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]'
        },
        {
          internalType: 'uint8[]',
          name: '',
          type: 'uint8[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'getAvailableBasketTokens',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]'
        },
        {
          internalType: 'uint8[]',
          name: '',
          type: 'uint8[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'getAvailableBasketUniswapPools',
      outputs: [
        {
          internalType: 'address[2][]',
          name: '',
          type: 'address[2][]'
        },
        {
          internalType: 'uint8[]',
          name: '',
          type: 'uint8[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'contract IERC20',
          name: '_TokenAddress',
          type: 'address'
        }
      ],
      name: 'inCaseTokengetsStuck',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint8[]',
          name: '_basketIndexes',
          type: 'uint8[]'
        },
        {
          internalType: 'uint256[]',
          name: '_weights',
          type: 'uint256[]'
        },
        {
          internalType: 'uint256',
          name: '_minPoolTokens',
          type: 'uint256'
        }
      ],
      name: 'invest',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'payable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address'
        },
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'investedAmountInBasket',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'minimalInvestment',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'protocolTokenAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'protocolTokenDisinvestPercentage',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_minimalInvestment',
          type: 'uint256'
        }
      ],
      name: 'setMinimalInvestment',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_newProtocolTokenAddress',
          type: 'address'
        }
      ],
      name: 'setProtocolTokenAddress',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint16',
          name: '_newPercentage',
          type: 'uint16'
        }
      ],
      name: 'setProtocolTokenDisinvestPercentage',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'toggleContractActive',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      stateMutability: 'payable',
      type: 'receive'
    }
  ]
};
