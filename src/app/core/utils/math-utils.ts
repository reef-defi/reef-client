export const roundDownTo = (base: number, precision: number) => {
  const m = Math.pow(10, precision);
  return Math.floor(base * m) / m;
};

