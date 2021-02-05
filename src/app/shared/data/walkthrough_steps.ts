export const hintSteps = [
  {
    'next #welcome_to_reef': `Hello and welcome to Reef!
                              In this short tutorial, we\'d like to show you what Reef is,
                              and how it works. Click Start to begin`,
    nextButton: { className: 'regular', text: 'Start' },
    skipButton: { className: 'danger', text: 'Not interested' },
    showPrev: false,
    backgroundColor: 'yellow',
  },
  {
    'next #settings': `You can find your account settings here, including setting slippage and gas fees.`,
    nextButton: { className: 'regular', text: 'Next' },
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #dashboardBtn': `A list of all your Tokens, your total balance in USD, token allocations and more`,
    nextButton: { className: 'regular', text: 'Next' },
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #buyReef': `Buy REEF wih ETH & USDT via our Uniswap Integration`,
    nextButton: { className: 'regular', text: 'Next' },
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #reefLiquidity': `Be a liquidity provider for REEF's USDT & ETH Pools`,
    nextButton: { className: 'regular', text: 'Next' },
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #farmReef': `Invest your LP Tokens into our Farms to earn even more REEF!`,
    nextButton: { className: 'regular', text: 'Next' },
    skipButton: { className: 'danger', text: 'Done' },
    showNext: false,
    showSkip: true,
    showPrev: false,
  },
];
