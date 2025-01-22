import api from "@/lib/axios"
import {ErstestimmeOptionen, ZweitestimmeOptionen} from "@/models/vote/token/models";

/**
 * Fetch ErstestimmeOptionen
 */
export const getErstestimmeForWahlkreis = async (wahlkreisId: number): Promise<ErstestimmeOptionen[]> => {
    try {
        const response = await api.get<ErstestimmeOptionen[]>(`/secure/vote/erstestimme`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ErstestimmeOptionen:", error);
        throw error;
    }
};

/**
 * Fetch ZweitestimmeOptionen
 */
export const getZweitestimmeForWahlkreis = async (wahlkreisId: number): Promise<ZweitestimmeOptionen[]> => {
    try {
        const response = await api.get<ZweitestimmeOptionen[]>(`/secure/vote/zweitestimme`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ZweitestimmeOptionen:", error);
        throw error;
    }
};