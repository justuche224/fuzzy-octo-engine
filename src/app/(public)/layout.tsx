import { AppSidebar } from "@/components/app-sidebar-home";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import Cart from "@/cart/cart-icon";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "21rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-10 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            Milky Way
          </div>
          <div className="flex items-center gap-2">
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <UserMenu />
            <ModeToggle />
            <Cart />
          </div>
        </header>
        <section className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
