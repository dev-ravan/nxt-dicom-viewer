import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Learning App",
  description: "Created by Velmurugan R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="p-4">
        {children}
      </body>
    </html>
  );
}
