import "./globals.css";
import "@/app/(client)/_components/styles.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-poppins antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
