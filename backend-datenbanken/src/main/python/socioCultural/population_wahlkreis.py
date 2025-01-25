import pandas as pd


def extract_columns(input_csv, output_csv):
    # Relevant columns for Arbeitslosigkeit and Alter with short names
    column_mapping = {
        "Wahlkreis-Nr.": "Wahlkreis_Nr",
        "Bevölkerung am 31.12.2019 - Insgesamt (in 1000)": "Population",
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
    extracted_df["year"] = 2017

    # Save to a new CSV file
    extracted_df.to_csv(output_csv, sep=";", index=False)
    print(f"Extracted data saved to '{output_csv}'.")


# Example usage
# Replace 'input.csv' with your actual file name
input_csv = "btw21_strukturdaten.csv"
output_csv = "population_wahlkreis2021.csv"
extract_columns(input_csv, output_csv)
