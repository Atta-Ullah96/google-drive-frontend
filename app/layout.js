import "./globals.css";
import Header from "@/components/header/page";
import GoogleAuthProvider from "@/components/providers/google-auth-provider";

export const metadata = {
  title: "Storix",
  description: "Secure cloud storage for everyone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GoogleAuthProvider>
          <Header />
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
