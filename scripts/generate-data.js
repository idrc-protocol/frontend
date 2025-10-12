#!/usr/bin/env node

/**
 * Executable script to generate all historical market data files
 * Run with: node scripts/generate-data.js
 */

const fs = require('fs');
const path = require('path');


function generateHistoryData(
  timeframeName,
  config,
  endPrice = 169.0,
  endTime = new Date(),
  trendType = 'bullish'
) {
  const { points, intervalMs } = config;
  const now = endTime.getTime();
  
  
  let startPrice;
  let totalGrowthFactor;
  
  switch (trendType) {
    case 'bullish':
      const bullishDrop = 0.15 + Math.random() * 0.25;
      startPrice = endPrice * (1 - bullishDrop);
      totalGrowthFactor = 1.0;
      break;
    case 'bearish':
      const bearishRise = 0.15 + Math.random() * 0.25;
      startPrice = endPrice * (1 + bearishRise);
      totalGrowthFactor = 1.0;
      break;
    case 'sideways':
      const sidewaysRange = 0.05 + Math.random() * 0.1;
      startPrice = endPrice * (1 + (Math.random() - 0.5) * sidewaysRange);
      totalGrowthFactor = 0.3;
      break;
    case 'volatile':
      const volatileRange = 0.25 + Math.random() * 0.35;
      startPrice = endPrice * (1 + (Math.random() - 0.5) * volatileRange);
      totalGrowthFactor = 0.7;
      break;
    default:
      startPrice = endPrice * 0.8;
      totalGrowthFactor = 1.0;
  }
  
  const totalGrowth = (endPrice - startPrice) * totalGrowthFactor;
  
  
  const baseVolatility = {
    '1D': 0.008,
    'weekly': 0.015,
    'monthly': 0.025,
    'quarterly': 0.035,
    'yearly': 0.045,
    'all': 0.055,
  };
  
  const trendVolatilityMultiplier = {
    bullish: 1.0,
    bearish: 1.3,
    sideways: 0.6,
    volatile: 2.5,
  };
  
  const volatility = (baseVolatility[timeframeName] || 0.03) * trendVolatilityMultiplier[trendType];
  
  const data = [];
  let previousClose = startPrice;
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - 1 - i) * intervalMs;
    const progress = i / (points - 1);
    
    
    let trendProgress;
    switch (trendType) {
      case 'bullish':
        trendProgress = Math.pow(progress, 0.7);
        break;
      case 'bearish':
        trendProgress = Math.pow(progress, 1.4);
        break;
      case 'sideways':
        trendProgress = progress + Math.sin(progress * Math.PI * 4) * 0.1;
        break;
      case 'volatile':
        trendProgress = progress + Math.sin(progress * Math.PI * 12) * 0.15;
        break;
      default:
        trendProgress = progress;
    }
    
    
    const basePriceFromTrend = startPrice + totalGrowth * trendProgress;
    
    
    const randomWalk = (Math.random() - 0.5) * 2 * volatility;
    const momentum = 0.15;
    const trend_influence = 0.85;
    
    const targetPrice = basePriceFromTrend * (1 + randomWalk);
    let currentPrice = previousClose * momentum + targetPrice * trend_influence;
    
    
    if (i === points - 1) {
      currentPrice = endPrice;
    }
    
    
    const priceVolatilityRange = currentPrice * volatility * 0.5;
    const open = i === 0 ? startPrice : previousClose + (Math.random() - 0.5) * priceVolatilityRange * 0.3;
    const close = currentPrice;
    const sessionHigh = Math.max(open, close) + Math.random() * priceVolatilityRange;
    const sessionLow = Math.min(open, close) - Math.random() * priceVolatilityRange;
    
    
    const finalOpen = Math.max(0.01, open);
    const finalClose = Math.max(0.01, close);
    const finalHigh = Math.max(0.01, sessionHigh, finalOpen, finalClose);
    const finalLow = Math.max(0.01, Math.min(sessionLow, finalOpen, finalClose));
    
    data.push({
      timestamp,
      value: finalClose,
      open: finalOpen,
      high: finalHigh,
      low: finalLow,
      close: finalClose,
    });
    
    previousClose = currentPrice;
  }
  
  return {
    primaryMarketPrice: data.sort((a, b) => a.timestamp - b.timestamp),
  };
}

function selectRandomTrendType() {
  const random = Math.random();
  if (random < 0.45) return 'bullish';
  if (random < 0.70) return 'bearish';
  if (random < 0.90) return 'sideways';
  return 'volatile';
}


const TIMEFRAME_CONFIGS = {
  '1D': { points: 1440, intervalMs: 60 * 1000 },
  'monthly': { points: 30, intervalMs: 24 * 60 * 60 * 1000 },
  'quarterly': { points: 90, intervalMs: 24 * 60 * 60 * 1000 },
  'yearly': { points: 365, intervalMs: 24 * 60 * 60 * 1000 },
  'all': { points: 730, intervalMs: 24 * 60 * 60 * 1000 },
};


const FILE_MAPPING = {
  '1D': 'history-daily.data.ts',
  'monthly': 'history-monthly.data.ts',
  'quarterly': 'history-quarterly.data.ts',
  'yearly': 'history-yearly.data.ts',
  'all': 'history-all.data.ts',
};

const VARIABLE_MAPPING = {
  '1D': 'historyDaily',
  'monthly': 'historyMontly', 
  'quarterly': 'historyQuarterly',
  'yearly': 'historyYearly',
  'all': 'historyAll',
};


const TREND_TYPES = {
  '1D': 'volatile',
  'monthly': 'bullish',
  'quarterly': selectRandomTrendType(),
  'yearly': 'bullish',
  'all': 'bullish',
};

function generateAllFiles() {
  const dataDir = path.join(__dirname, '..', 'data');
  const endPrice = 169.128533; 
  
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  console.log('🚀 Generating historical market data files...');
  
  Object.entries(TIMEFRAME_CONFIGS).forEach(([timeframeName, config]) => {
    console.log(`📈 Generating ${timeframeName} data (${config.points} points)...`);
    
    const trendType = TREND_TYPES[timeframeName];
    const data = generateHistoryData(timeframeName, config, endPrice, new Date(), trendType);
    
    const fileName = FILE_MAPPING[timeframeName];
    const variableName = VARIABLE_MAPPING[timeframeName];
    const filePath = path.join(dataDir, fileName);
    
    
    const fileContent = `export const ${variableName} = ${JSON.stringify(data, null, 2)};
`;
    
    
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`✅ Generated ${fileName} with ${data.primaryMarketPrice.length} data points`);
  });
  
  console.log('🎉 All history data files generated successfully!');
  console.log(`📁 Files saved to: ${dataDir}`);
}


if (require.main === module) {
  generateAllFiles();
}

module.exports = {
  generateHistoryData,
  generateAllFiles,
};