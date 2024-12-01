import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col m-0 p-0 overflow-hidden">
        {/* Topbar at the top */}
        <Topbar />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar on the left */}
          <Sidebar />

          {/* Main content area for pages */}
          <div className="flex-1 p-4 overflow-auto ">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;
