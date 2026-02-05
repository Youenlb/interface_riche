import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Night of the Living Dead - Lecteur Rich Media Accessible",
  description: "Lecteur vidéo interactif accessible avec sous-titres, audiodescription, carte interactive et chat en direct pour le film Night of the Living Dead",
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr"> 
      <body>
        {children}
      </body>
    </html>
  );
}