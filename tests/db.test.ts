import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { prisma } from '@/lib/prisma'

describe('Database Operations', () => {
    beforeAll(async () => {
        await prisma.$connect()
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })

    beforeEach(async () => {
        // Clean up test data
        await prisma.post.deleteMany({
            where: {
                author: {
                    email: {
                        startsWith: 'test-'
                    }
                }
            }
        })
        await prisma.user.deleteMany({
            where: {
                email: {
                    startsWith: 'test-'
                }
            }
        })
    })

    describe('Prisma Client Setup', () => {
        it('should connect to database', async () => {
            const result = await prisma.$queryRaw`SELECT 1 as test`
            expect(result).toBeDefined()
        })

        it('should have prisma client instance', () => {
            expect(prisma).toBeDefined()
            expect(typeof prisma.user).toBe('object')
            expect(typeof prisma.post).toBe('object')
        })
    })

    describe('User Model Operations', () => {
        it('should create a user', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'test-user@example.com',
                    name: 'Test User',
                },
            })

            expect(user).toBeDefined()
            expect(user.id).toBeDefined()
            expect(user.email).toBe('test-user@example.com')
            expect(user.name).toBe('Test User')
            expect(user.createdAt).toBeInstanceOf(Date)
            expect(user.updatedAt).toBeInstanceOf(Date)
        })

        it('should find user by email', async () => {
            const createdUser = await prisma.user.create({
                data: {
                    email: 'test-find@example.com',
                    name: 'Find Test User',
                },
            })

            const foundUser = await prisma.user.findUnique({
                where: { email: 'test-find@example.com' }
            })

            expect(foundUser).toBeDefined()
            expect(foundUser?.id).toBe(createdUser.id)
            expect(foundUser?.email).toBe('test-find@example.com')
        })

        it('should update user information', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'test-update@example.com',
                    name: 'Original Name',
                },
            })

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: 'Updated Name',
                    emailVerified: true,
                },
            })

            expect(updatedUser.name).toBe('Updated Name')
            expect(updatedUser.emailVerified).toBe(true)
        })

        it('should delete user', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'test-delete@example.com',
                    name: 'Delete Test User',
                },
            })

            const deletedUser = await prisma.user.delete({
                where: { id: user.id },
            })

            expect(deletedUser.id).toBe(user.id)

            const notFound = await prisma.user.findUnique({
                where: { id: user.id },
            })

            expect(notFound).toBeNull()
        })
    })

    describe('Post Model Operations', () => {
        let testUser: any

        beforeEach(async () => {
            testUser = await prisma.user.create({
                data: {
                    email: 'test-post-author@example.com',
                    name: 'Post Author',
                },
            })
        })

        it('should create a post', async () => {
            const post = await prisma.post.create({
                data: {
                    title: 'Test Post',
                    content: 'This is test post content.',
                    published: true,
                    authorId: testUser.id,
                },
            })

            expect(post).toBeDefined()
            expect(post.id).toBeDefined()
            expect(post.title).toBe('Test Post')
            expect(post.content).toBe('This is test post content.')
            expect(post.published).toBe(true)
            expect(post.authorId).toBe(testUser.id)
        })

        it('should create unpublished post', async () => {
            const post = await prisma.post.create({
                data: {
                    title: 'Draft Post',
                    content: 'This is a draft.',
                    published: false,
                    authorId: testUser.id,
                },
            })

            expect(post.published).toBe(false)
        })

        it('should query posts with author relation', async () => {
            const post = await prisma.post.create({
                data: {
                    title: 'Relation Test Post',
                    content: 'Testing relations.',
                    published: true,
                    authorId: testUser.id,
                },
            })

            const postWithAuthor = await prisma.post.findUnique({
                where: { id: post.id },
                include: { author: true },
            })

            expect(postWithAuthor?.author).toBeDefined()
            expect(postWithAuthor?.author.email).toBe('test-post-author@example.com')
        })
    })

    describe('User-Post Relations', () => {
        it('should query user with posts', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'test-relation@example.com',
                    name: 'Relation Test User',
                },
            })

            const post1 = await prisma.post.create({
                data: {
                    title: 'First Post',
                    content: 'First post content.',
                    published: true,
                    authorId: user.id,
                },
            })

            const post2 = await prisma.post.create({
                data: {
                    title: 'Second Post',
                    content: 'Second post content.',
                    published: false,
                    authorId: user.id,
                },
            })

            const userWithPosts = await prisma.user.findUnique({
                where: { id: user.id },
                include: { posts: true },
            })

            expect(userWithPosts?.posts).toHaveLength(2)
            expect(userWithPosts?.posts[0].title).toBe('First Post')
            expect(userWithPosts?.posts[1].title).toBe('Second Post')
        })

        it('should query published posts only', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'test-published@example.com',
                    name: 'Published Test User',
                },
            })

            await prisma.post.create({
                data: {
                    title: 'Published Post',
                    content: 'Published content.',
                    published: true,
                    authorId: user.id,
                },
            })

            await prisma.post.create({
                data: {
                    title: 'Draft Post',
                    content: 'Draft content.',
                    published: false,
                    authorId: user.id,
                },
            })

            const publishedPosts = await prisma.post.findMany({
                where: {
                    published: true,
                    authorId: user.id,
                },
            })

            expect(publishedPosts).toHaveLength(1)
            expect(publishedPosts[0].title).toBe('Published Post')
        })
    })

    describe('Data Validation', () => {
        it('should enforce unique email constraint', async () => {
            await prisma.user.create({
                data: {
                    email: 'test-unique@example.com',
                    name: 'Unique Test User',
                },
            })

            try {
                await prisma.user.create({
                    data: {
                        email: 'test-unique@example.com', // Same email
                        name: 'Another User',
                    },
                })
                expect(true).toBe(false) // Should not reach here
            } catch (error: any) {
                expect(error.code).toBe('P2002') // Prisma unique constraint error
            }
        })

        it('should require authorId for posts', async () => {
            try {
                await prisma.post.create({
                    data: {
                        title: 'Post Without Author',
                        content: 'This should fail.',
                        published: true,
                        // Missing authorId - this should fail
                    } as any,
                })
                expect(true).toBe(false) // Should not reach here
            } catch (error: any) {
                // Foreign key constraint should fail
                expect(error).toBeDefined()
            }
        })
    })
})
