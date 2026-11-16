import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Алданба! — алаяқтарды танып үйрен",
  description:
    "Алаяқтықтың 14 түрі туралы қысқа бейнесабақтар мен тесттер. Короткие видеоуроки и тесты о 14 видах мошенничества.",
};

export const viewport: Viewport = { themeColor: "#0e5fa8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="kk" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
