import csv
import os

# Input and output file paths
INPUT_FILE = "path/to/aggregated.csv"  # Replace with the path to your input CSV file
OUTPUT_DIRECTORY = "path/to/expanded"  # Directory to store the expanded files
MAX_ROWS_PER_FILE = 1000000  # Split into multiple files if rows exceed this

def expand_csv(input_file, output_directory, max_rows_per_file):
    os.makedirs(output_directory, exist_ok=True)  # Ensure output directory exists

    with open(input_file, mode="r", encoding="utf-8") as infile:
        reader = csv.DictReader(infile, delimiter=';')
        file_count = 1
        current_row_count = 0
        rows = []

        for line in reader:
            partei_id = line["partei_id"]
            wahlkreis_id = line["wahlkreis_id"]
            jahr = line["jahr"]
            anzahl = int(line["anzahl"])

            # Expand each row by the 'anzahl' value
            for _ in range(anzahl):
                rows.append([partei_id, wahlkreis_id, jahr])
                current_row_count += 1

                # Write to a new file if max rows per file is reached
                if current_row_count >= max_rows_per_file:
                    write_to_csv(rows, output_directory, file_count)
                    rows = []
                    current_row_count = 0
                    file_count += 1

        # Write remaining rows to a new file
        if rows:
            write_to_csv(rows, output_directory, file_count)

def write_to_csv(rows, output_directory, file_count):
    output_file = os.path.join(output_directory, f"expanded_{file_count}.csv")
    with open(output_file, mode="w", encoding="utf-8", newline="") as outfile:
        writer = csv.writer(outfile)
        writer.writerow(["partei_id", "wahlkreis_id", "jahr"])  # Write header
        writer.writerows(rows)
    print(f"File written: {output_file}")

# Run the script
expand_csv(INPUT_FILE, OUTPUT_DIRECTORY, MAX_ROWS_PER_FILE)
