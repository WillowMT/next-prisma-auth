import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const response = await prisma.$executeRaw`SELECT 1`
    if (response !== 1) {
        return Response.json({ error: 'Database connection failed' }, { status: 500 })
    }
    return Response.json({ message: 'Database connection successful' }, { status: 200 })
}