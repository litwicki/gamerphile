import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/layout/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { RegionProvider } from "@/components/region-provider";
import { UltrawideProvider } from "@/components/ultrawide-provider";
import { AppBar } from "@/components/layout/app-bar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gamerphile",
  description: "World of Warcraft character lookup and community features",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: apply theme class before first paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gamerphile-theme')||'midnight';var v=['midnight','death-knight','demon-hunter','druid','evoker','hunter','mage','monk','paladin','priest','rogue','shaman','warlock','warrior'];if(!v.includes(t))t='midnight';document.documentElement.classList.add('theme-'+t);}catch(e){document.documentElement.classList.add('theme-midnight');}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <AuthSessionProvider>
          <ThemeProvider>
            <RegionProvider>
              <UltrawideProvider>
                <div className="flex min-h-screen flex-col bg-background/90">
                  <AppBar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </UltrawideProvider>
            </RegionProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
