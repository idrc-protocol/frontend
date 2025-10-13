#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding chains...');

  const chains = [
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
