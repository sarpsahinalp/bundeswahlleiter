export interface WahlkreisUebersicht  {
    direktMandat: {
        vorname: string;
        nachname: string;
        partei: string;
    };
    wahlbeteiligung: {
        teilgenommen: number;
        berechtigt: number;
    };
    parteiErgebnis: Stimmen[]

}
export interface Stimmen  {
    name: string;
    stimmen_abs: number;
    stimmen_prozent: number;
    stimmen_abs_vergleich: number;
    stimmen_prozent_vergleich: number;
}
export interface WahlkreisSieger {
    wahlkreisId: number;
    wahlkreisName: string;
    parteiNameErstStimme: string;
    parteiNameZweitStimme: string;
}
export interface Wahlkreis{
    id: number;
    name: string;
}
export interface UberhangMandate {
    groupField: string; // Grouping by Bundesland or Partei
    mandates: number; // Number of overhang mandates
}
export interface Sitzverteilung {
    kurzbezeichnung: string;
    sitze: number;
    prevSitze: number | null;
}
export interface NonVoters {
    wahlkreisName: string;
    nonVoters: number;
    type: string;
}
export interface Mandat {
    vorname: string,
    nachname: string,
    partei: string,
}
export interface KnappsteSieger {
    parteiName: string,
    wahlKreisName: string,
    typ: string,
    stimmen: number,
    differenz: number
}
export interface Bundesland {
    id: number,
    name: string,
}