// Interface for ErstestimmeOptionen
export interface ErstestimmeOptionen {
    vorname: string;
    nachname: string;
    wahlkreis_id: number;
    partyKurzbezeichnung: string;
    partyName: string;
    partei_id: number;
    titel: string;
    beruf: string;
    wohnort: string;
}

// Interface for ZweitestimmeOptionen
export interface ZweitestimmeOptionen {
    vorname: string;
    nachname: string;
    landesliste_platz: number;
    bundesland_id: number;
    kurzbezeichnung: string;
    name: string;
    partei_id: number;
}
