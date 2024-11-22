import './App.css'
import WISToolbar from "./Components/header.tsx";
import {useState} from "react";
import SitzVerteilung from "./pages/sitzVerteilung.tsx";
import BundestagsMitglieder from "./pages/bundestagsMitglieder.tsx";

// die namen können noch angepasst werden und wenn es passt, kann man auch unterschiedliche Seiten zusammenfügen
const pages = [
    'Sitzverteilung',
    'Mitglieder des Bundestages',
    'Wahlkreisübersicht',
    'Stimmkreissieger',
    'Überhangmandate',
    'Knappste Sieger',
    'Wahlkreisübersicht Einzelstimmen',
]

function App() {
    const [activePage, setActivePage] = useState(pages[0]);

    return (
        <div>
            <WISToolbar
                pages={pages}
                onPageSelect={(selectedPage) => {
                    setActivePage(selectedPage)
                } }
            />
            {pageSwitch(activePage)}
        </div>
    )
}

export default App

function pageSwitch(page: string) {
    switch (page) {
        case 'Sitzverteilung':
            return <SitzVerteilung />;
        case 'Mitglieder des Bundestages':
            return <BundestagsMitglieder />;
        default:
            return <label>Not implemented!</label>
    }
}
