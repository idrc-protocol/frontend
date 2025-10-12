#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding chains...');

  const chains = [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      network: 'ethereum',
      chainId: 1,
      rpcUrl: 'https://eth.llamarpc.com',
      explorerUrl: 'https://etherscan.io',
    },
    {
      name: 'Base',
      symbol: 'BASE',
      network: 'base',
      chainId: 8453,
      rpcUrl: 'https://mainnet.base.org',
      explorerUrl: 'https://basescan.org',
    },
    {
      name: 'Polygon',
      symbol: 'MATIC',
      network: 'polygon',
      chainId: 137,
      rpcUrl: 'https://polygon.llamarpc.com',
      explorerUrl: 'https://polygonscan.com',
    },
    {
      name: 'Arbitrum',
      symbol: 'ARB',
      network: 'arbitrum',
      chainId: 42161,
      rpcUrl: 'https://arbitrum.llamarpc.com',
      explorerUrl: 'https://arbiscan.io',
    },
    {
      name: 'Optimism',
      symbol: 'OP',
      network: 'optimism',
      chainId: 10,
      rpcUrl: 'https://optimism.llamarpc.com',
      explorerUrl: 'https://optimistic.etherscan.io',
    },
    {
      name: 'Base Sepolia',
      symbol: 'BASE SEPOLIA',
      network: 'base-sepolia',
      chainId: 84532,
      rpcUrl: 'https://sepolia.base.org',
      explorerUrl: 'https://sepolia.basescan.org',
    },
  ];

  for (const chainData of chains) {
    const chain = await prisma.chain.upsert({
      where: { chainId: chainData.chainId },
      update: chainData,
      create: chainData,
    });
    console.log(`✅ ${chain.name} chain seeded`);
  }

  console.log('🎉 All chains seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding chains:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
