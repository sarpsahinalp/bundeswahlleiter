import pandas as pd


def extract_columns(input_csv, output_csv):
    # Relevant columns for Arbeitslosigkeit and Alter with short names
    column_mapping = {
        "Wahlkreis-Nr.": "Wahlkreis_Nr",
        "Sozialversicherungspflichtig Beschäftigte am 30.06.2020 - insgesamt (je 1000 EW)": "SVB_insgesamt",
        "Sozialversicherungspflichtig Beschäftigte am 30.06.2020 - Land- und Forstwirtschaft, Fischerei (%)": "SVB_landw_fischerei",
        "Sozialversicherungspflichtig Beschäftigte am 30.06.2020 - Produzierendes Gewerbe (%)": "SVB_produz_gewerbe",
        "Sozialversicherungspflichtig Beschäftigte am 30.06.2020 - Handel, Gastgewerbe, Verkehr (%)": "SVB_handel_gast_verkehr",
        "Sozialversicherungspflichtig Beschäftigte am 30.06.2020 - Öffentliche und private Dienstleister (%)": "SVB_dienstleister",
        "Sozialversicherungspflichtig Beschäftigte am 30.06.2020 - Übrige Dienstleister und": "SVB_uebrige_dienstleister",
        "Alter von ... bis ... Jahren am 31.12.2019 - unter 18 (%)": "Alter_unter_18",
        "Alter von ... bis ... Jahren am 31.12.2019 - 18-24 (%)": "Alter_18_24",
        "Alter von ... bis ... Jahren am 31.12.2019 - 25-34 (%)": "Alter_25_34",
        "Alter von ... bis ... Jahren am 31.12.2019 - 35-59 (%)": "Alter_35_59",
        "Alter von ... bis ... Jahren am 31.12.2019 - 60-74 (%)": "Alter_60_74",
        "Alter von ... bis ... Jahren am 31.12.2019 - 75 und mehr (%)": "Alter_75_plus",
        "Arbeitslosenquote Februar 2021 - Frauen": "ALQ_frauen",
        "Arbeitslosenquote Februar 2021 - 15 bis 24 Jahre": "ALQ_15_24",
        "Arbeitslosenquote Februar 2021 - 55 bis 64 Jahre": "ALQ_55_64",
        "Arbeitslosenquote Februar 2021 - insgesamt": "ALQ_insgesamt",
        "Arbeitslosenquote Februar 2021 - Männer": "ALQ_maenner"
    }

    # Load the CSV file
    try:
        df = pd.read_csv(input_csv, delimiter=";")
    except FileNotFoundError:
        print(f"Error: File '{input_csv}' not found.")
        return

    # Check for missing columns
    missing_columns = [col for col in column_mapping.keys() if col not in df.columns]
    if missing_columns:
        print(f"Warning: The following columns are missing in the input file: {missing_columns}")

    # Extract and rename the relevant columns
    extracted_df = df[[col for col in column_mapping.keys() if col in df.columns]].rename(columns=column_mapping)
    # Add a year column and make sure that it is always 2021
    extracted_df["year"] = 2021

    # Save to a new CSV file
    extracted_df.to_csv(output_csv, sep=";", index=False)
    print(f"Extracted data saved to '{output_csv}'.")


# Example usage
# Replace 'input.csv' with your actual file name
input_csv = "btw21_strukturdaten.csv"
output_csv = "alter_beschaftigung_arbeitslosigkeit2021.csv"
extract_columns(input_csv, output_csv)
