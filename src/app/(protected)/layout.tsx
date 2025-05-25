import { SidebarProvider } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import { AppSidebar } from "./app-sidebar"

const SidebarLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <main className="w-full m-2">
                <div className="flex item-center gap-2 border-sidebar-border p-2 bg-sidebar border shadow rounded-md py-2 px-4">
                 {/**searchbar */}
                 <div className="ml-auto"></div>
                 <UserButton/>
                 
                </div>
                {/**main content */}
                <div className="h-4"></div>
                <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4 mt-4">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default SidebarLayout