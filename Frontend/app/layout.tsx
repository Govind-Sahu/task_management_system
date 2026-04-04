"use client";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>TaskFlow - Task Management</title>
        <meta name="description" content="Manage your tasks efficiently" />
      </head>
      <body className="bg-gray-50 min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "8px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
