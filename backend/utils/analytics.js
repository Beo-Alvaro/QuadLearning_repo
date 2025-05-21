export const calculateMovingAverage = (data, period = 3) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].present;
    }
    result.push(Math.round(sum / period));
  }
  return result;
};