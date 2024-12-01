import  { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TableBody,
    TableCell,
    TableHead,
    TableRow,

} from '@mui/material';
import {fetchWahlkreise, fetchWahlkreisUebersicht} from "../services/AnalyseService.ts";
import {Wahlkreis} from "../models/wahlkreis.ts";
import {WahlkreisUebersicht} from "../models/wahlkreisUebersicht.ts";
import Table from '@mui/material/Table';

const years = [2017, 2021]

export default function WahlkreisUebersichtPage() {

    const [wahlkreis, setWahlkreis] = useState<Wahlkreis | null>(null);
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>([]);
    const [wahlkreisUebersicht, setWahlkreisUebersicht] = useState<WahlkreisUebersicht | null>(null);
    const [year, setYear] = useState(2021);

    const [loading, setLoading] = useState(true);

    const loadWahlkreise = async () => {
        setLoading(true);
        try {
            const response = await fetchWahlkreise();
            console.log('Response:', response);
            setWahlkreise(response);
        } catch (error) {
            console.error('Failed to fetch grouped data:', error);
        } finally {
            setLoading(false);
        }
    }

    const loadWahlkreisUebersicht = async (year: number, wahlkreis_id: number) => {
        setLoading(true);
        try {
            const response = await fetchWahlkreisUebersicht(year, wahlkreis_id);
            response.parteiErgebnis.sort((ergA, ergB) => ergB.stimmen_abs - ergA.stimmen_abs);
            setWahlkreisUebersicht(response);
        } catch (error) {
            console.error('Failed to fetch grouped data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWahlkreise().then();
    }, []);

    useEffect(() => {
        if(wahlkreis) {
            loadWahlkreisUebersicht(year, wahlkreis.id).then()
        }
    }, [year, wahlkreis]);

    const updateYear = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as number;
        setYear(value);
    };

    const updateWahlkreis = (event: SelectChangeEvent<unknown>) => {
        const wahlkreis_id = event.target.value as number;
        const wahlkreis = wahlkreise.find(wk => wk.id === wahlkreis_id) ?? null;
        setWahlkreis(wahlkreis);
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <FormControl>
                <InputLabel>Jahr</InputLabel>
                <Select
                    value={year}
                    label="Jahr"
                    onChange={updateYear}
                >
                    {years.map(year => (
                        <MenuItem value={year}>{year}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel>Wahlkreis</InputLabel>
                <Select
                    value={wahlkreis?.id}
                    label="Wahlkreis"
                    onChange={updateWahlkreis}
                    sx={{width:200}}
                >
                    {wahlkreise.map(wk => (
                        <MenuItem value={wk.id}>{wk.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <br/>

            <label>gewählter Direktkandidat: {wahlkreisUebersicht?.direktMandat.vorname} {wahlkreisUebersicht?.direktMandat.nachname} ({wahlkreisUebersicht?.direktMandat.partei})</label>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Partei</TableCell>
                        <TableCell align={'right'}>Stimmen</TableCell>
                        <TableCell align={'right'}>diff</TableCell>
                        <TableCell align={'right'}>Stimmen %</TableCell>
                        <TableCell align={'right'}>diff %</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {wahlkreisUebersicht?.parteiErgebnis.map(row => (
                        <TableRow>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align={'right'}>{row.stimmen_abs} </TableCell>
                            <TableCell align={'right'}>
                                {!row.stimmen_abs_vergleich
                                    ? ''
                                    :
                                    <label>
                                        (
                                        <label style={row.stimmen_abs_vergleich < 0 ? {color: 'red'} :  {color: 'green'}}>
                                            {(row.stimmen_abs_vergleich > 0) ? '+' : ''}{row.stimmen_abs_vergleich}
                                        </label>
                                        )
                                    </label>
                                }
                            </TableCell>
                            <TableCell align={'right'}>{row.stimmen_prozent.toFixed(2)}%</TableCell>
                            <TableCell align={'right'}>
                                {!row.stimmen_prozent_vergleich
                                    ? ''
                                    :
                                    <label>
                                        (
                                        <label style={row.stimmen_prozent_vergleich < 0 ? {color: 'red'} :  {color: 'green'}}>
                                            {(row.stimmen_prozent_vergleich > 0) ? '+' : ''}{row.stimmen_prozent_vergleich.toFixed(2)}%
                                        </label>
                                        )
                                    </label>
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>


        </div>
    );
};