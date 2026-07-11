import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastContainer } from "@/components/ui/Toast";
import Navigation from "@/components/ui/Navigation";
import TopStatsBar from "@/components/ui/TopStatsBar";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export const metadata: Metadata = {
  title: "Duolingo",
  description: "The free, fun, and effective way to learn a language!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-duo-bg">
        <UserProvider>
          <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-duo-bg">
              {/* Left Sidebar Navigation */}
              <Navigation />

              {/* Main Content Area */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top stats bar - desktop only */}
                <TopStatsBar />
                {/* Page content */}
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                  {children}
                </main>
              </div>
            </div>
            <ToastContainer />
          </ProtectedRoute>
        </UserProvider>
      </body>
    </html>
  );
}
