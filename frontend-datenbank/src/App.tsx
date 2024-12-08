import './App.css'
import WISToolbar from "./Components/header.tsx";
import {useState} from "react";
import BundestagsMitglieder from "./pages/bundestagsMitglieder.tsx";
import WahlKreisSieger from "./pages/wahlKreisSieger.tsx";
import WISDrawer from "./Components/drawer.tsx";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import {page} from "./models/page.tsx";
import PieChartIcon from '@mui/icons-material/PieChart';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SitzverteilungPieChart from "./pages/testSitzVerteilung.tsx";
import OverhangMandateChart from "./pages/uberhangmandate.tsx";
import WahlkreisUebersichtPage from "./pages/wahlKreisUebsersicht.tsx";
import KnappsteSiegerPage from "./pages/knappsteSiegerPage.tsx";

// die namen können noch angepasst werden und wenn es passt, kann man auch unterschiedliche Seiten zusammenfügen
const pages: page[] = [
    {'title': 'Sitzverteilung', 'link': <SitzverteilungPieChart />, 'icon': <PieChartIcon/>},
    {'title': 'Mitglieder des Bundestages', 'link': <BundestagsMitglieder />, 'icon': <InboxIcon />},
    {'title': 'Wahlkreisübersicht', 'link': <WahlkreisUebersichtPage />, 'icon': <InboxIcon/>},
    {'title': 'WahlkreisSieger', 'link': <WahlKreisSieger />, 'icon': <HowToRegIcon />},
    {'title': 'Überhangmandate', 'link': <OverhangMandateChart />, 'icon': <InboxIcon/>},
    {'title': 'Knappste Sieger', 'link': <KnappsteSiegerPage />, 'icon': <InboxIcon/>},
]

function App() {
    const [activePage, setActivePage] = useState(pages[0]);

    return (
        <div>
            <WISToolbar/>
            <WISDrawer
                pages={pages}
                onPageSelect={(selectedPage) => {
                    setActivePage(selectedPage)
                } }
            />
            <div className="content">
                {activePage.link}
            </div>
        </div>
    )
}

export default App
