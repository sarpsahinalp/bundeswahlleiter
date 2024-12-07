import pandas as pd
from itertools import islice

import scrapy

wahlkreise_path = r'..\..\..\..\..\resources\electionData\targetCSV\wahlkreise.csv'
result_path = r'..\..\..\..\..\resources\electionData\targetCSV\wahlberechtigte.csv'


class Wahlkreis_spider(scrapy.Spider):
    name = "wahlkreis"

    ergebnis = []

    def start_requests(self):
        wahlkreise = pd.read_csv(wahlkreise_path , sep = ';')
        
        for year in [2017, 2021]:
            for _ , row in islice(wahlkreise.iterrows(), None):
                url = f"https://www.bundeswahlleiterin.de/bundestagswahlen/{year}/ergebnisse/bund-99/land-{row.iloc[2]}/wahlkreis-{row.iloc[0]}.html"
                yield scrapy.Request(
                    url=url, 
                    callback=self.parse,
                    meta={
                        'name': row.iloc[1], 
                        'year': year
                    }
                )

    def parse(self, response):
        element = list(response.css("td.colgroup-1"))[0]
        wahlberechtigte_text = element.css("::text").get().strip()
        wahlberechtigte = int(wahlberechtigte_text.replace(".", ""))
        self.ergebnis.append([
            wahlberechtigte,
            response.meta['name'], 
            response.meta['year'], 
        ])
    
    def closed(self, _):
        result_df = pd.DataFrame(
            data=self.ergebnis, 
            columns=["wahlberechtigte", "wahlkreis", "jahr"]
        )
        result_df.to_csv(result_path, sep=';', index=False)

