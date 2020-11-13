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
    'next #createBasket': `You can create baskets in the Create Basket page.
                            A basket is a composition of different DeFi activities and tokens`,
    nextButton: {className: 'regular', text: 'Next'},
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #vaults': `Or create a Basket composed of Vaults`,
    nextButton: {className: 'regular', text: 'Next'},
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #myBaskets': `Once you create a basket, you will be able to view them in the My Baskets page`,
    nextButton: {className: 'regular', text: 'Next'},
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #reefMenu': `Buy, Stake & Farm Reef`,
    nextButton: {className: 'regular', text: 'Next'},
    showNext: true,
    showSkip: false,
    showPrev: false,
  },
  {
    'next #dashboardBtn': `All your account info will be here, such as address, tokens, and transactions.
    That's it! Have fun using our app.`,
    nextButton: {className: 'regular', text: 'Next'},
    skipButton: {className: 'danger', text: 'Done'},
    showNext: false,
    showSkip: true,
    showPrev: false,
  },
];
