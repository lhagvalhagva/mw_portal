// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/contexts/LocaleContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayan Hotel Portal",
  description: "Бизнесийн үйл ажиллагааг удирдах цогц портал",
  icons: {
    icon: "/assets/images/ayan_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <LocaleProvider>
          {children}
          <Toaster position="top-center" richColors />
        </LocaleProvider>
      </body>
    </html>
  );
}