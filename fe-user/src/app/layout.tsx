import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
