import { prisma } from '@/lib/prisma'

async function main() {
    console.log('Testing Prisma ORM v7 setup...')

    // Clean up any existing test data
    console.log('Cleaning up existing test data...')
    await prisma.post.deleteMany({
        where: {
            author: {
                email: 'test@example.com'
            }
        }
    })
    await prisma.user.deleteMany({
        where: { email: 'test@example.com' }
    })

    // Create a user
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
        },
    })
    console.log('Created user:', user)

    // Create some posts
    const post1 = await prisma.post.create({
        data: {
            title: 'First Post',
            content: 'This is the first post content.',
            published: true,
            authorId: user.id,
        },
    })

    const post2 = await prisma.post.create({
        data: {
            title: 'Second Post',
            content: 'This is the second post content.',
            published: false,
            authorId: user.id,
        },
    })

    console.log('Created posts:', [post1, post2])

    // Query the user with posts
    const userWithPosts = await prisma.user.findUnique({
        where: { id: user.id },
        include: { posts: true },
    })

    console.log('User with posts:', userWithPosts)

    console.log('Test completed successfully!')
}

main()
    .catch((e) => {
        console.error('Test failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
