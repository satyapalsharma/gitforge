import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "GitForge - Build Your GitHub Profile",
  description:
    "Generate real open-source projects with AI and fill your GitHub contribution graph with backdated commits. Make your profile stand out to recruiters.",
  keywords: ["GitHub", "profile builder", "contribution graph", "open source", "AI code generation"],
  openGraph: {
    title: "GitForge - Build Your GitHub Profile",
    description: "Generate real projects with AI and make your GitHub profile shine.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
