package db.in.tum.de.datenbanken.logic.pdf;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.properties.TextAlignment;

import java.io.FileNotFoundException;
import java.util.UUID;

public class PdfGenerator {

    /**
     * Generates a PDF document for the upcoming Bundestagswahl 2025 that contains
     * details about the online voting and an embedded token.
     *
     * @param dest the file path where the PDF will be written (e.g., "Bundestagswahl2025.pdf")
     * @throws FileNotFoundException if the file cannot be created or written
     */
    public static void generateVotingPdf(String dest) throws FileNotFoundException {
        // Create a random token for voting (for instance, a UUID)
        String voteToken = UUID.randomUUID().toString();

        // Initialize PDF writer and document
        PdfWriter writer = new PdfWriter(dest);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Add a title for the document
        Paragraph title = new Paragraph("Bundestagswahl 2025 – Online Voting Token")
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Add a line separator
        SolidLine line = new SolidLine(1f);
        LineSeparator ls = new LineSeparator(line)
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(ls);

        // Add a welcome message paragraph
        Paragraph welcome = new Paragraph("Herzlich willkommen zur Online-Abstimmung für die Bundestagswahl 2025!")
                .setFontSize(14)
                .setTextAlignment(TextAlignment.LEFT);
        welcome.setMarginTop(20);
        document.add(welcome);

        // Add instructions paragraph
        Paragraph instructions = new Paragraph();
        instructions.add(new Text("Bitte verwenden Sie den folgenden Token, um Ihre Stimme abzugeben. ")
                .setFontSize(12));
        instructions.add(new Text("Dieser Token ist einzigartig und berechtigt Sie zur Teilnahme an der Online-Abstimmung.")
                .setFontSize(12).setBold());
        instructions.setMarginTop(10);
        document.add(instructions);

        // Display the token in a highlighted box
        Paragraph tokenParagraph = new Paragraph("Voting Token: " + voteToken)
                .setFontSize(16)
                .setFontColor(ColorConstants.DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(10)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 1));
        tokenParagraph.setMarginTop(20);
        document.add(tokenParagraph);

        // Additional information or footer
        Paragraph footer = new Paragraph("Hinweis: Dieser Token ist einmalig und persönlich. Bitte geben Sie ihn nicht an Dritte weiter.")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(footer);

        // Close the document
        document.close();

        System.out.println("PDF generated successfully at: " + dest);
        System.out.println("Generated Voting Token: " + voteToken);
    }

    public static void main(String[] args) {
        try {
            // Specify the output PDF file path
            String outputFilePath = "Bundestagswahl2025.pdf";
            generateVotingPdf(outputFilePath);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }
}

