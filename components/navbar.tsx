"use client"

import { useSession, authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HomeIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"


export function Navbar() {
    const { data: session, isPending } = useSession()

    const handleSignOut = async () => {
        await authClient.signOut()
    }

    console.log(session);
    

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full grid place-items-center">
            <div className="bg-background/80 backdrop-blur-md border rounded-full px-4 py-2 w-[90%] max-w-xl">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                        <HomeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium truncate">Next Auth</span> 
                        
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {isPending ? (
                            <div className="text-xs text-muted-foreground">...</div>
                        ) : session?.user ? (
                            <div className="flex items-center gap-2">
                                <Avatar>
                                        <AvatarImage src={session.user.image || `https://api.dicebear.com/9.x/adventurer/svg?seed=${session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}`} />
                                    <AvatarFallback>
                                        {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
