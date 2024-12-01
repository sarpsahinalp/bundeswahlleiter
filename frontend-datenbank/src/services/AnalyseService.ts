import axios from 'axios';
import {Sitzverteilung} from "../models/sitzverteilung.ts";
import {WahlkreisSieger} from "../models/wahlkreissieger.ts";
import {UberhangMandate} from "../models/uberhandmandate.ts";

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
