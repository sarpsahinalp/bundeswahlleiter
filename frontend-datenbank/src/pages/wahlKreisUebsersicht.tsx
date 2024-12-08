import React, { useEffect, useState } from 'react';
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
    Switch, FormControlLabel,

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
    const [error, setError] = useState(false);

    const [useAggregation, setUseAggregation] = useState<boolean>(true);

    const loadWahlkreise = async () => {
        setLoading(true);
        try {
            const response = await fetchWahlkreise();
            setWahlkreise(response);
        } catch (error) {
            console.error('Failed to fetch grouped data:', error);
        } finally {
            setLoading(false);
        }
    }

    const loadWahlkreisUebersicht = async (year: number, wahlkreis_id: number, useAggregation: boolean) => {
        setLoading(true);
        setError(false);
        try {
            const response = await fetchWahlkreisUebersicht(year, wahlkreis_id, useAggregation);
            response.parteiErgebnis.sort((ergA, ergB) => ergB.stimmen_abs - ergA.stimmen_abs);
            setWahlkreisUebersicht(response);
        } catch (error) {
            console.error('Failed to fetch grouped data:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWahlkreise().then();
    }, []);

    useEffect(() => {
        if(wahlkreis) {
            loadWahlkreisUebersicht(year, wahlkreis.id, useAggregation).then()
        }
    }, [year, wahlkreis, useAggregation]);

    const updateYear = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as number;
        setYear(value);
    };

    const updateWahlkreis = (event: SelectChangeEvent<unknown>) => {
        const wahlkreis_id = event.target.value as number;
        const wahlkreis = wahlkreise.find(wk => wk.id === wahlkreis_id) ?? null;
        setWahlkreis(wahlkreis);
    }

    const updateUseAggregation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUseAggregation(event.target.checked)
    }

    const render = (wU: WahlkreisUebersicht) => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (<h1>Error</h1>)
        }

        return <div>
            <div><h3>gewählter Direktkandidat:</h3></div>
            <div>
                <h1>{wU.direktMandat.vorname} {wU.direktMandat.nachname} ({wU.direktMandat.partei})</h1>
            </div>
            <div><h3>Wahlbeteiligung:</h3></div>
            <div><h2>
                {wU.wahlbeteiligung.teilgenommen}/{wU.wahlbeteiligung.berechtigt}
                &nbsp;
                ({(100 * wU.wahlbeteiligung.teilgenommen / wU.wahlbeteiligung.berechtigt).toFixed(2)}%)
            </h2></div>
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
                    {wU.parteiErgebnis.map(row => (
                        <TableRow>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align={'right'}>{row.stimmen_abs} </TableCell>
                            <TableCell align={'right'}>
                                {!row.stimmen_abs_vergleich
                                    ? ''
                                    :
                                    <label
                                        style={row.stimmen_abs_vergleich < 0 ? {color: 'red'} : {color: 'green'}}>
                                        {(row.stimmen_abs_vergleich > 0) ? '+' : ''}{row.stimmen_abs_vergleich}
                                    </label>

                                }
                            </TableCell>
                            <TableCell align={'right'}>{row.stimmen_prozent.toFixed(2)}%</TableCell>
                            <TableCell align={'right'}>
                                {!row.stimmen_prozent_vergleich
                                    ? ''
                                    :
                                    <label
                                        style={row.stimmen_prozent_vergleich < 0 ? {color: 'red'} : {color: 'green'}}>
                                        {(row.stimmen_prozent_vergleich > 0) ? '+' : ''}{row.stimmen_prozent_vergleich.toFixed(2)}%
                                    </label>
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
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
                    sx={{width: 200}}
                >
                    {wahlkreise.map(wk => (
                        <MenuItem value={wk.id}>{wk.id} {wk.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControlLabel
                control={
                     <Switch
                         checked={useAggregation}
                         onChange={updateUseAggregation}
                     ></Switch>

                 }
                 label="Aggregation benutzen"
            ></FormControlLabel>
            {wahlkreisUebersicht ? render(wahlkreisUebersicht) : ''}
        </div>
    );
};