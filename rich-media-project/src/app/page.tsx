'use client'
import { useEffect, useState } from "react";
import { FilmData } from "./types";

export default function Home() {
  const [data, setData] = useState<FilmData | null>(null);

  useEffect(() => {
    // Récupération des infos principales
    fetch("https://tp-iai3.cleverapps.io/projet")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div role="status">Chargement...</div>;

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 tabIndex={0}>{data.film.title}</h1>
      <p>Projet Multimédia Accessible</p>
      {/* Les composants viendront s'ajouter ici */}
    </main>
  );
}