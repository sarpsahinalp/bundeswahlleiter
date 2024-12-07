import axios from 'axios';
import {Sitzverteilung} from "../models/sitzverteilung.ts";
import {WahlkreisSieger} from "../models/wahlkreissieger.ts";
import {UberhangMandate} from "../models/uberhandmandate.ts";
import {Wahlkreis} from "../models/wahlkreis.ts";
import {WahlkreisUebersicht} from "../models/wahlkreisUebersicht.ts";
import {KnappsteSieger} from "../models/knappsteSieger.ts";

const API_BASE_URL = 'http://localhost:8080';

export const fetchSitzverteilung = async (year: number): Promise<Sitzverteilung[]> => {
    const response = await axios.get<Sitzverteilung[]>(`${API_BASE_URL}/ergebnisse/sitzverteilung/${year}`);
    return response.data;
};

export const fetchWahlkreisSieger = async (): Promise<WahlkreisSieger[]> => {
    const response = await axios.get<WahlkreisSieger[]>(`${API_BASE_URL}/wahlkreisSieger`);
    return response.data;
};

export const fetchUberhangMandates = async (year: number, grouping: string): Promise<UberhangMandate[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ergebnisse/ueberhangmandate/${year}/${grouping}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching overhang mandates:', error);
        throw error;
    }
};

export const fetchWahlkreise = async (): Promise<Wahlkreis[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ergebnisse/wahlkreise`);
        return response.data;
    } catch (error) {
        console.error('Error fetching wahlkreise:', error);
        throw error;
    }
}

export const fetchWahlkreisUebersicht = async (year: number, wahlkreis_id: number): Promise<WahlkreisUebersicht>  => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ergebnisse/wahlkreis/uebersicht/${year}/${wahlkreis_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Wahlkreis Uebersicht:', error);
        throw error;
    }
}

export const fetchKnappsteSieger = async (year: number): Promise<KnappsteSieger[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ergebnisse/knappsteSieger/${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching knappste Sieger:', error);
        throw error;
    }
}
