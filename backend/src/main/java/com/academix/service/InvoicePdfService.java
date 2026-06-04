package com.academix.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.academix.model.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(InvoicePdfService.class);

    /**
     * Generates a tax invoice PDF for a successful payment transaction.
     * Computes inclusive GST at 18% automatically.
     *
     * @param payment the payment record.
     * @return the generated PDF as a byte array.
     */
    public byte[] generateGSTInvoicePdf(Payment payment) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldSubFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("ACADEMIX TAX INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Top Info Table (Seller vs Invoice metadata)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("ACADEMIX Services Private Limited", boldSubFont));
            leftCell.addElement(new Paragraph("GSTIN: 29AAACA8912A1Z3", subFont));
            leftCell.addElement(new Paragraph("Outer Ring Road, Bellandur", subFont));
            leftCell.addElement(new Paragraph("Bengaluru, Karnataka - 560103", subFont));

            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.addElement(new Paragraph("Invoice Number: ACX-INV-" + payment.getId(), boldSubFont));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String dateStr = payment.getTransactionTime() != null ? payment.getTransactionTime().format(formatter) : "N/A";
            rightCell.addElement(new Paragraph("Date: " + dateStr, subFont));
            rightCell.addElement(new Paragraph("Razorpay Order ID: " + payment.getRazorpayOrderId(), subFont));
            rightCell.addElement(new Paragraph("Payment Status: PAID (Captured)", subFont));

            infoTable.addCell(leftCell);
            infoTable.addCell(rightCell);
            document.add(infoTable);

            // Separator line
            Paragraph sep = new Paragraph("----------------------------------------------------------------------------------------------------------------------------------");
            sep.setSpacingAfter(15);
            document.add(sep);

            // Customer/Order Details
            document.add(new Paragraph("Billed To:", boldSubFont));
            document.add(new Paragraph("Customer Name: " + (payment.getStudent() != null ? payment.getStudent().getName() : "N/A"), subFont));
            document.add(new Paragraph("Email: " + (payment.getStudent() != null ? payment.getStudent().getEmail() : "N/A"), subFont));
            document.add(new Paragraph("Order ID: #" + (payment.getOrder() != null ? payment.getOrder().getId() : "N/A"), subFont));
            document.add(new Paragraph("Subject: " + (payment.getOrder() != null ? payment.getOrder().getSubject() : "N/A"), subFont));

            Paragraph spacing = new Paragraph(" ");
            spacing.setSpacingAfter(15);
            document.add(spacing);

            // Calculations
            BigDecimal totalAmount = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
            BigDecimal divisor = new BigDecimal("1.18");
            BigDecimal baseAmount = totalAmount.divide(divisor, 2, RoundingMode.HALF_UP);
            BigDecimal gstAmount = totalAmount.subtract(baseAmount);

            // Items Table
            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{3f, 1f, 1f, 1f});
            itemsTable.setSpacingAfter(20);

            PdfPCell h1 = new PdfPCell(new Phrase("Description", boldSubFont));
            itemsTable.addCell(h1);
            PdfPCell h2 = new PdfPCell(new Phrase("Base Amount", boldSubFont));
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(h2);
            PdfPCell h3 = new PdfPCell(new Phrase("GST (18%)", boldSubFont));
            h3.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(h3);
            PdfPCell h4 = new PdfPCell(new Phrase("Total", boldSubFont));
            h4.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(h4);

            PdfPCell descCell = new PdfPCell(new Phrase("Academic Consultation / Task: " + (payment.getOrder() != null ? payment.getOrder().getTitle() : "Order Payout"), subFont));
            itemsTable.addCell(descCell);
            PdfPCell baseCell = new PdfPCell(new Phrase("INR " + baseAmount, subFont));
            baseCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(baseCell);
            PdfPCell gstCell = new PdfPCell(new Phrase("INR " + gstAmount, subFont));
            gstCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(gstCell);
            PdfPCell totalCell = new PdfPCell(new Phrase("INR " + totalAmount, subFont));
            totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(totalCell);

            document.add(itemsTable);

            // Summary totals
            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(40);
            summary.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPCell sLabel1 = new PdfPCell(new Phrase("Base Amount:", subFont));
            sLabel1.setBorder(Rectangle.NO_BORDER);
            summary.addCell(sLabel1);
            PdfPCell sVal1 = new PdfPCell(new Phrase("INR " + baseAmount, subFont));
            sVal1.setBorder(Rectangle.NO_BORDER);
            sVal1.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summary.addCell(sVal1);

            PdfPCell sLabel2 = new PdfPCell(new Phrase("CGST + SGST (18%):", subFont));
            sLabel2.setBorder(Rectangle.NO_BORDER);
            summary.addCell(sLabel2);
            PdfPCell sVal2 = new PdfPCell(new Phrase("INR " + gstAmount, subFont));
            sVal2.setBorder(Rectangle.NO_BORDER);
            sVal2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summary.addCell(sVal2);

            PdfPCell sLabel3 = new PdfPCell(new Phrase("Total Paid:", boldSubFont));
            sLabel3.setBorder(Rectangle.NO_BORDER);
            summary.addCell(sLabel3);
            PdfPCell sVal3 = new PdfPCell(new Phrase("INR " + totalAmount, boldSubFont));
            sVal3.setBorder(Rectangle.NO_BORDER);
            sVal3.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summary.addCell(sVal3);

            document.add(summary);

            // Footer note
            Paragraph footer = new Paragraph("Thank you for choosing ACADEMIX. This invoice is electronically generated and requires no physical signature.", subFont);
            footer.setSpacingBefore(60);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate invoice PDF", e);
            throw new RuntimeException("Error during invoice generation", e);
        }
    }
}
