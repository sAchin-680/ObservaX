import '../globals.css';
import { ReactNode, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../components/Sidebar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ChartContainer from '../components/ChartContainer';
import ServiceSelector from '../components/ServiceSelector';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <span className="font-bold text-lg">ObservaX</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Traces</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Logs</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Metrics</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <span className="text-xs text-muted-foreground">© 2025 ObservaX</span>
            </SidebarFooter>
          </Sidebar>
          <div className="ml-[16rem] flex flex-col gap-4">
            <Header />
            <div className="flex items-center gap-4 px-4 pt-4">
              <ServiceSelector onSelect={setSelectedService} />
              <SearchBar />
            </div>
            <ChartContainer service={selectedService} />
            <main>{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
