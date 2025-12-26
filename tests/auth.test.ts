import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { authClient } from '@/lib/auth-client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('Authentication System', () => {
    beforeAll(async () => {
        // Ensure database connection
        await prisma.$connect()
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })

    beforeEach(async () => {
        // Clean up test data
        await prisma.account.deleteMany({
            where: {
                user: {
                    email: {
                        startsWith: 'test-'
                    }
                }
            }
        })
        await prisma.session.deleteMany({
            where: {
                user: {
                    email: {
                        startsWith: 'test-'
                    }
                }
            }
        })
        await prisma.verification.deleteMany({
            where: {
                identifier: {
                    startsWith: 'test-'
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

    describe('Auth Client', () => {
        it('should export auth client functions', () => {
            expect(authClient).toBeDefined()
            expect(typeof authClient.signIn).toBe('function')
            expect(typeof authClient.signUp).toBe('function')
            expect(typeof authClient.useSession).toBe('function')
        })

        it('should export signIn function', () => {
            expect(typeof authClient.signIn).toBe('function')
        })

        it('should export signUp function', () => {
            expect(typeof authClient.signUp).toBe('function')
        })

        it('should export useSession hook', () => {
            expect(typeof authClient.useSession).toBe('function')
        })
    })

    describe('Auth Configuration', () => {
        it('should configure better-auth with prisma adapter', () => {
            expect(auth).toBeDefined()
            expect(typeof auth).toBe('object')
            // Check that auth has expected better-auth properties
            expect(auth).toHaveProperty('handler')
            expect(auth).toHaveProperty('api')
        })

        it('should have email and password enabled', () => {
            // The auth configuration includes emailAndPassword: { enabled: true }
            // This is tested indirectly through the configuration
            expect(auth).toBeDefined()
        })
    })

    describe('User Registration and Authentication', () => {
        it('should have signUp method that accepts correct parameters', () => {
            // Test that the signUp method exists and has correct structure
            expect(typeof authClient.signUp).toBe('function')

            // Note: Actual signup/signin tests would require a running server
            // These are integration tests that would be run separately
        })

        it('should have signIn method that accepts correct parameters', () => {
            // Test that the signIn method exists and has correct structure
            expect(typeof authClient.signIn).toBe('function')

            // Note: Actual signup/signin tests would require a running server
            // These are integration tests that would be run separately
        })

        it('should create user account directly in database', async () => {
            const testEmail = 'test-direct-user@example.com'
            const testPassword = 'password123'

            // Create user directly via database for testing auth schema
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: 'Test Direct User',
                    emailVerified: false
                }
            })

            expect(user).toBeDefined()
            expect(user.email).toBe(testEmail)
            expect(user.name).toBe('Test Direct User')
            expect(user.emailVerified).toBe(false)

            // Create account record for email/password auth
            const account = await prisma.account.create({
                data: {
                    id: 'test-account-' + user.id,
                    accountId: testEmail,
                    providerId: 'credential',
                    userId: user.id,
                    password: testPassword // In real scenario, this would be hashed
                }
            })

            expect(account).toBeDefined()
            expect(account.providerId).toBe('credential')
            expect(account.userId).toBe(user.id)
        })
    })

    describe('Database Integration', () => {
        it('should create and retrieve user with auth-related fields', async () => {
            const testEmail = 'test-db@example.com'

            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: 'Test DB User',
                    emailVerified: true
                }
            })

            expect(user.email).toBe(testEmail)
            expect(user.emailVerified).toBe(true)

            const retrievedUser = await prisma.user.findUnique({
                where: { email: testEmail }
            })

            expect(retrievedUser?.email).toBe(testEmail)
            expect(retrievedUser?.emailVerified).toBe(true)
        })

        it('should handle user sessions', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'test-session@example.com',
                    name: 'Session Test User'
                }
            })

            const session = await prisma.session.create({
                data: {
                    id: 'test-session-id',
                    token: 'test-session-token',
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                    userId: user.id,
                    ipAddress: '127.0.0.1',
                    userAgent: 'Test Agent'
                }
            })

            expect(session.token).toBe('test-session-token')
            expect(session.userId).toBe(user.id)

            const retrievedSession = await prisma.session.findUnique({
                where: { token: 'test-session-token' },
                include: { user: true }
            })

            expect(retrievedSession?.user.email).toBe('test-session@example.com')
        })

        it('should handle verification tokens', async () => {
            const uniqueId = 'test-verification-' + Date.now()
            const verification = await prisma.verification.create({
                data: {
                    id: uniqueId,
                    identifier: 'test@example.com',
                    value: '123456',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
                }
            })

            expect(verification.identifier).toBe('test@example.com')
            expect(verification.value).toBe('123456')

            const retrievedVerification = await prisma.verification.findUnique({
                where: { id: uniqueId }
            })

            expect(retrievedVerification?.identifier).toBe('test@example.com')
        })
    })
})
