export const contractData = {
  addr: '0x32F84bC4C3aC1ea3d7EABE79cE55ef8c42758E2f',
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
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
      name: 'constructor'
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
      payable: true,
      stateMutability: 'payable',
      type: 'fallback'
    },
    {
      constant: true,
      inputs: [],
      name: 'UniSwapV2FactoryAddress',
      outputs: [
        {
          internalType: 'contract IUniswapV2Factory',
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
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
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
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
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'uint256',
          name: 'reserveIn',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'userIn',
          type: 'uint256'
        }
      ],
      name: 'calculateSwapInAmount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'pure',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '_fromToken',
          type: 'address'
        },
        {
          internalType: 'address',
          name: '_toToken',
          type: 'address'
        }
      ],
      name: 'canSwapFromV2',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'string',
          name: '_name',
          type: 'string'
        },
        {
          internalType: 'uint8[]',
          name: '_weights',
          type: 'uint8[]'
        },
        {
          internalType: 'address[2][]',
          name: '_uniswapPools',
          type: 'address[2][]'
        },
        {
          internalType: 'address[]',
          name: '_tokens',
          type: 'address[]'
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
      payable: true,
      stateMutability: 'payable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: '_ToTokenContractAddress',
          type: 'address'
        },
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
      payable: true,
      stateMutability: 'payable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'uint8',
          name: '_basketIndex',
          type: 'uint8'
        }
      ],
      name: 'getAvailableBasket',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string'
        },
        {
          internalType: 'uint8[]',
          name: '',
          type: 'uint8[]'
        },
        {
          internalType: 'address[2][]',
          name: '',
          type: 'address[2][]'
        },
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getAvailableBasketsCount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'contract IERC20',
          name: '_TokenAddress',
          type: 'address'
        }
      ],
      name: 'inCaseTokengetsStuck',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: '_FromTokenContractAddress',
          type: 'address'
        },
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
          name: '_amount',
          type: 'uint256'
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
      payable: true,
      stateMutability: 'payable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'isOwner',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'protocolTokenAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'protocolTokenDisinvestPercentage',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: '_newProtocolTokenAddress',
          type: 'address'
        }
      ],
      name: 'setProtocolTokenAddress',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'uint16',
          name: '_newPercentage',
          type: 'uint16'
        }
      ],
      name: 'setProtocolTokenDisinvestPercentage',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'toggleContractActive',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'transferOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'uniswapV2Router',
      outputs: [
        {
          internalType: 'contract IUniswapV2Router02',
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'withdraw',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ]
};
