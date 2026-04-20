import { PrismaClient } from '@prisma/client'

// Prevent multiple PrismaClient instances during hot reload in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Note: I removed the 'export' keyword from this line
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  })

// Note: I added this line so it matches our dashboard imports!
export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma