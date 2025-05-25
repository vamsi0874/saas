import { db } from "@/server/db"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"

const SyncUser = async () => {
    const {userId} = await auth()
    console.log('userIdddd',userId)

    if(!userId) {
        throw new Error("User not logged in")
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    console.log('userrrr',user)
    if (!user.emailAddresses[0]?.emailAddress){
        return notFound()
    }

    await db.user.upsert({
        where: {
            emailAddress: user.emailAddresses[0].emailAddress
        },
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName
        },
        create: {
            id: user.id,
            emailAddress: user.emailAddresses[0].emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl
        }
    })
    redirect("/dashboard")

}

export default SyncUser