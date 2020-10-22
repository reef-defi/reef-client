export const contractData = {
  reefToken: {
    addr: '0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87',
    "abi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "delegator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "fromDelegate",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "toDelegate",
            "type": "address"
          }
        ],
        "name": "DelegateChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "delegate",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "previousBalance",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newBalance",
            "type": "uint256"
          }
        ],
        "name": "DelegateVotesChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "DELEGATION_TYPEHASH",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "DOMAIN_TYPEHASH",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "burnFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "name": "checkpoints",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "fromBlock",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "votes",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "subtractedValue",
            "type": "uint256"
          }
        ],
        "name": "decreaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "delegatee",
            "type": "address"
          }
        ],
        "name": "delegate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "delegatee",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "expiry",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "name": "delegateBySig",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "delegator",
            "type": "address"
          }
        ],
        "name": "delegates",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "getCurrentVotes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "blockNumber",
            "type": "uint256"
          }
        ],
        "name": "getPriorVotes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "addedValue",
            "type": "uint256"
          }
        ],
        "name": "increaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "nonces",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "numCheckpoints",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
  },
  reefBasket: {
    addr: '0x6b4BDe1086912A6Cb24ce3dB43b3466e6c72AFd3',
    'abi': [
      {
        'inputs': [
          {
            'internalType': 'uint16',
            'name': '_protocolTokenDisinvestPercentage',
            'type': 'uint16'
          },
          {
            'internalType': 'address',
            'name': '_protocolTokenAddress',
            'type': 'address'
          }
        ],
        'stateMutability': 'nonpayable',
        'type': 'constructor'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'internalType': 'uint256',
            'name': 'basketId',
            'type': 'uint256'
          },
          {
            'indexed': true,
            'internalType': 'address',
            'name': 'user',
            'type': 'address'
          }
        ],
        'name': 'BasketCreated',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'internalType': 'address',
            'name': 'user',
            'type': 'address'
          },
          {
            'indexed': true,
            'internalType': 'uint256',
            'name': 'basketId',
            'type': 'uint256'
          },
          {
            'indexed': false,
            'internalType': 'uint256',
            'name': 'disinvestedAmount',
            'type': 'uint256'
          }
        ],
        'name': 'Disinvest',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'internalType': 'address',
            'name': 'user',
            'type': 'address'
          },
          {
            'indexed': true,
            'internalType': 'uint256',
            'name': 'basketId',
            'type': 'uint256'
          },
          {
            'indexed': false,
            'internalType': 'uint256',
            'name': 'investedAmount',
            'type': 'uint256'
          }
        ],
        'name': 'Invest',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'internalType': 'address',
            'name': 'previousOwner',
            'type': 'address'
          },
          {
            'indexed': true,
            'internalType': 'address',
            'name': 'newOwner',
            'type': 'address'
          }
        ],
        'name': 'OwnershipTransferred',
        'type': 'event'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'name': 'availableBaskets',
        'outputs': [
          {
            'internalType': 'string',
            'name': 'name',
            'type': 'string'
          },
          {
            'internalType': 'address',
            'name': 'referrer',
            'type': 'address'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'availableBasketsSize',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': '_owner',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'balanceOfBalancerPools',
        'outputs': [
          {
            'internalType': 'uint256[]',
            'name': '',
            'type': 'uint256[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': '_owner',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'balanceOfMooniswapPools',
        'outputs': [
          {
            'internalType': 'uint256[]',
            'name': '',
            'type': 'uint256[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': '_owner',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'balanceOfTokens',
        'outputs': [
          {
            'internalType': 'uint256[]',
            'name': '',
            'type': 'uint256[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': '_owner',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'balanceOfUniswapPools',
        'outputs': [
          {
            'internalType': 'uint256[]',
            'name': '',
            'type': 'uint256[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'string',
            'name': '_name',
            'type': 'string'
          },
          {
            'internalType': 'address[2][]',
            'name': '_uniswapPools',
            'type': 'address[2][]'
          },
          {
            'internalType': 'uint8[]',
            'name': '_uniswapPoolsWeights',
            'type': 'uint8[]'
          },
          {
            'internalType': 'address[]',
            'name': '_tokens',
            'type': 'address[]'
          },
          {
            'internalType': 'uint8[]',
            'name': '_tokensWeights',
            'type': 'uint8[]'
          },
          {
            'internalType': 'address[]',
            'name': '_balancerPools',
            'type': 'address[]'
          },
          {
            'internalType': 'uint8[]',
            'name': '_balancerPoolsWeights',
            'type': 'uint8[]'
          },
          {
            'internalType': 'address[]',
            'name': '_mooniswapPools',
            'type': 'address[]'
          },
          {
            'internalType': 'uint8[]',
            'name': '_mooniswapPoolsWeights',
            'type': 'uint8[]'
          }
        ],
        'name': 'createBasket',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'payable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256[]',
            'name': '_basketIndexes',
            'type': 'uint256[]'
          },
          {
            'internalType': 'uint256[]',
            'name': '_percentage',
            'type': 'uint256[]'
          },
          {
            'internalType': 'uint256',
            'name': '_protocolYieldRatio',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': '_protocolPoolRestakeRatio',
            'type': 'uint256'
          }
        ],
        'name': 'disinvest',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'payable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'getAvailableBasketBalancerPools',
        'outputs': [
          {
            'internalType': 'address[]',
            'name': '',
            'type': 'address[]'
          },
          {
            'internalType': 'uint8[]',
            'name': '',
            'type': 'uint8[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'getAvailableBasketMooniswapPools',
        'outputs': [
          {
            'internalType': 'address[]',
            'name': '',
            'type': 'address[]'
          },
          {
            'internalType': 'uint8[]',
            'name': '',
            'type': 'uint8[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint8',
            'name': '_basketIndex',
            'type': 'uint8'
          }
        ],
        'name': 'getAvailableBasketTokens',
        'outputs': [
          {
            'internalType': 'address[]',
            'name': '',
            'type': 'address[]'
          },
          {
            'internalType': 'uint8[]',
            'name': '',
            'type': 'uint8[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'getAvailableBasketUniswapPools',
        'outputs': [
          {
            'internalType': 'address[2][]',
            'name': '',
            'type': 'address[2][]'
          },
          {
            'internalType': 'uint8[]',
            'name': '',
            'type': 'uint8[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'contract IERC20',
            'name': '_TokenAddress',
            'type': 'address'
          }
        ],
        'name': 'inCaseTokengetsStuck',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256[]',
            'name': '_basketIndexes',
            'type': 'uint256[]'
          },
          {
            'internalType': 'uint256[]',
            'name': '_weights',
            'type': 'uint256[]'
          },
          {
            'internalType': 'uint256',
            'name': '_minPoolTokens',
            'type': 'uint256'
          }
        ],
        'name': 'invest',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'payable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': '_owner',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': '_basketIndex',
            'type': 'uint256'
          }
        ],
        'name': 'investedAmountInBasket',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'minimalInvestment',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'owner',
        'outputs': [
          {
            'internalType': 'address',
            'name': '',
            'type': 'address'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'protocolTokenAddress',
        'outputs': [
          {
            'internalType': 'address',
            'name': '',
            'type': 'address'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'protocolTokenDisinvestPercentage',
        'outputs': [
          {
            'internalType': 'uint16',
            'name': '',
            'type': 'uint16'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'renounceOwnership',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256',
            'name': '_minimalInvestment',
            'type': 'uint256'
          }
        ],
        'name': 'setMinimalInvestment',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': '_newProtocolTokenAddress',
            'type': 'address'
          }
        ],
        'name': 'setProtocolTokenAddress',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint16',
            'name': '_newPercentage',
            'type': 'uint16'
          }
        ],
        'name': 'setProtocolTokenDisinvestPercentage',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'toggleContractActive',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'newOwner',
            'type': 'address'
          }
        ],
        'name': 'transferOwnership',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [],
        'name': 'withdraw',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'stateMutability': 'payable',
        'type': 'receive'
      }
    ],
  },
  reefFarming: {
    addr: '0x9E4c14403d7d9A8A782044E86a93CAE09D7B2ac9',
    "abi": [
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_reef",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_reefPerBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_startBlock",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Deposit",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "EmergencyWithdraw",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "missing",
            "type": "uint256"
          }
        ],
        "name": "InsufficientFunds",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Withdraw",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_allocPoint",
            "type": "uint256"
          },
          {
            "internalType": "contract IERC20",
            "name": "_lpToken",
            "type": "address"
          }
        ],
        "name": "addPool",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_pid",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_pid",
            "type": "uint256"
          }
        ],
        "name": "emergencyWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_to",
            "type": "uint256"
          }
        ],
        "name": "getMultiplier",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "massUpdatePools",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_pid",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_user",
            "type": "address"
          }
        ],
        "name": "pendingRewards",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "poolInfo",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "lpToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allocPoint",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastRewardBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "accReefPerShare",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "poolLength",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "reef",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "reefPerBlock",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_pid",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_allocPoint",
            "type": "uint256"
          }
        ],
        "name": "setPool",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "setReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "startBlock",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalAllocPoint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_pid",
            "type": "uint256"
          }
        ],
        "name": "updatePool",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userInfo",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rewardDebt",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_pid",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  reefStaking: {
    addr: '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9',
    "abi": [
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_reef",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "subtractedValue",
            "type": "uint256"
          }
        ],
        "name": "decreaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "addedValue",
            "type": "uint256"
          }
        ],
        "name": "increaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "reef",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
  }
};
