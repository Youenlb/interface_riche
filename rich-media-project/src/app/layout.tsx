import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projet Rich Media Accessible",
  description: "Lecteur vidéo interactif accessible",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"> 
      <body>
        <header role="banner">
          <h1>Rich Media Player</h1>
        </header>
        <main id="main-content">
          {children}
        </main>
        <footer role="contentinfo">
          <p>© 2026 Projet Étudiant - Accessible selon RGAA</p>
        </footer>
      </body>
    </html>
  );
}