'use client'
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
    {
        title:"Dashboard",
        url: "/dashboard",
        icon:LayoutDashboard
    },
    {
    title: "Q&A",
    url: "/qa",
    icon: Bot
   },
//     {
//     title: "Meetings",
//     url: "/meetings",
//     icon: Presentation
//    },
    {
    title: "Billing",
    url: "/billing",
    icon: CreditCard
   }
]

export const AppSidebar = () => {

    const pathname = usePathname()
    const {open} = useSidebar()
    const {projects, projectId, setProjectId} = useProject()
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex gap-4 items-center">
                    <Image className="rounded-md" src="/logx.png" width={30} height={30} alt="logo" />
                {open &&
                    (
                    <h1 className="text-xl font-bold text-primary/80">Projects</h1>

                    )
                }
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuButton key={item.title} asChild>
                                <Link href={item.url}
                                className={cn({
                                    '!bg-primary !text-white': pathname === item.url,
                                })}>
                                <item.icon />
                                <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        ))}
                     </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>
                Your Projects
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {projects?.map(project => {
                    return (
                    <SidebarMenuItem key={project.name}>
                        <SidebarMenuButton onClick={()=>{setProjectId(project.id)}} asChild>
                        <div className="cursor-pointer">
                            <div className={
                          cn(
                            'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary', {
                                'bg-blue-400 text-white': project.id === projectId
                            }
                          )
                            }>
                            P
                            </div>
                            <span >{project.name}</span>
                        </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    );
                })}
                <div className="h-2"></div>

                {open && (
                <SidebarMenuItem>
                <Link href="/create">
                    <Button size="sm" variant="outline" className="w-fit cursor-pointer">
                    <Plus />
                    Create Project
                    </Button>
                </Link>
                </SidebarMenuItem>
                )}

                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

         </SidebarContent>
        </Sidebar>
        
    )
}