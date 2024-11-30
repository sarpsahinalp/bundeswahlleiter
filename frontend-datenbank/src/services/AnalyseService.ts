import axios from 'axios';
import {Sitzverteilung} from "../models/sitzverteilung.ts";
import {WahlkreisSieger} from "../models/wahlkreissieger.ts";

const API_BASE_URL = 'http://localhost:8080';

export const fetchSitzverteilung = async (year: number): Promise<Sitzverteilung[]> => {
    const response = await axios.get<Sitzverteilung[]>(`${API_BASE_URL}/ergebnisse/sitzverteilung/${year}`);
    return response.data;
};

export const fetchWahlkreisSieger = async (): Promise<WahlkreisSieger[]> => {
    const response = await axios.get<WahlkreisSieger[]>(`${API_BASE_URL}/wahlkreisSieger`);
    return response.data;
};
