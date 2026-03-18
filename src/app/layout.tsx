import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hello, I am Creeper.",
  description: "A browser game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
