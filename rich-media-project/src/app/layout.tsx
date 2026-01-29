import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projet Rich Media Accessible",
  description: "Lecteur vidéo interactif accessible",
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="fr"> 
      <body>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}