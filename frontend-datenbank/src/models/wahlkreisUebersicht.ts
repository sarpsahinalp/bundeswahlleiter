export interface WahlkreisUebersicht  {
    direktMandat: {
        vorname: string;
        nachname: string;
        partei: string;
    };
    parteiErgebnis: {
        name: string;
        stimmen_abs: number;
        stimmen_prozent: number;
        stimmen_abs_vergleich: number;
        stimmen_prozent_vergleich: number;
    }[]

}