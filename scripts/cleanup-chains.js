#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up chains...');

  try {
    
    const allChains = await prisma.chain.findMany();
    console.log('Current chains in database:');
    allChains.forEach(chain => {
      console.log(`- ${chain.name} (chainId: ${chain.chainId})`);
    });

    
    const result = await prisma.chain.deleteMany({
      where: {
        NOT: {
          chainId: 84532
        }
      }
    });

    console.log(`✅ Deleted ${result.count} chains`);

    
    const remainingChains = await prisma.chain.findMany();
    console.log('Remaining chains:');
    remainingChains.forEach(chain => {
      console.log(`- ${chain.name} (chainId: ${chain.chainId})`);
    });

    if (remainingChains.length === 1 && remainingChains[0].chainId === 84532) {
      console.log('🎉 Successfully kept only Base Sepolia chain!');
    } else {
      console.log('⚠️ Unexpected result. Please check the database.');
    }

  } catch (error) {
    console.error('❌ Error cleaning up chains:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });