import { Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Elite Bike Rentals | Premium Vehicle Rentals",
  description: "Rent premium cars and bikes at affordable prices. Experience luxury with Elite Bike Rentals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <GoogleAuthProvider>
          <NavbarWrapper />
          {children}
          <Analytics />
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
