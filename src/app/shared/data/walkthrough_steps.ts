export const hintSteps = [
  {
    'next #welcome_to_reef': `Hello and welcome to Reef!
                              In this short tutorial, we\'d like to show you what Reef is,
                              and how it works. Click Start to begin`,
    nextButton: {className: 'regular', text: 'Start'},
    skipButton: {className: 'danger', text: 'Not interested'},
    showPrev: false,
    backgroundColor: 'yellow',
  },
  {
    'click #createBasket': `You can create baskets in the Create Basket page.
                            A basket is a composition of different DeFi activities and tokens
                            Click Create Basket to continue`,
    showNext: false,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #createBasketComp': 'Let\'s get started',
    timeout: 1000,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #ethAmount': 'The amount of Ethereum you decide to invest will affect the basket composition',
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #risk': `This is the "Risk Slider". It allows you to configure the risk exposure to DeFi activities and tokens.`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #createBasketComposition': `The composition consists of Token Pairs from Uniswap, Mooniswap and Balancer, but also
                                      of standalone tokens.`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #createCustomBasket': `Or, instead of being assembled by us, you can create your own custom basket, with it\'s
                                 own custom pools and allocation that you choose!`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #roiChart': `Here, you can see the Return of Investment
                           this basket has made over the course of 1, 6 or 12 months`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #selectMonth': `And you can choose which period from here. Press next to continue`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'click #myBaskets': `Once you create a basket, you will be able to view them here. Click My Baskets to continue`,
    showNext: false,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #emptyState': `On this page, you will be able to see the state of your baskets, how much ROI they have accrued,
                           and Liquidate them, returning the Profits to your wallet.`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
    timeout: 1000,
  },
  {
    'click #buyReef': `Finally, you are able to buy and stake REEF coins for further profits
                       Click on Buy Reef to continue`,
    showNext: false,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #ethWalletAmount': `The ETH amount you have in your wallet`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #usdAmount': `in USD`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Enough'},
    showPrev: false,
  },
  {
    'next #reefTokenAmount': `Finally, your REEF amount`,
    nextButton: {className: 'regular', text: 'Happy Trading'},
    skipButton: {className: 'danger', text: 'Done'},
    showPrev: false,
  },
];
