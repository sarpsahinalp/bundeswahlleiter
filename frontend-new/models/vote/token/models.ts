// Interface for ErstestimmeOptionen
export interface ErstestimmeOptionen {
    vorname: string;
    nachname: string;
    wahlkreis_id: number;
    kurzbezeichnung: string;
    partei_id: number;
}

// Interface for ZweitestimmeOptionen
export interface ZweitestimmeOptionen {
    vorname: string;
    nachname: string;
    landesliste_platz: number;
    bundesland_id: number;
    kurzbezeichnung: string;
    partei_id: number;
}
