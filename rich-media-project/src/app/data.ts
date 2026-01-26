import { FilmData } from "./types";
import rawData from "../datas/data.json"; // On importe le fichier JSON

// On l'exporte en forçant le type pour que le reste de l'app soit content
export const LOCAL_DATA: FilmData = rawData as unknown as FilmData;