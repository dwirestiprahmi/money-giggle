package com.money.giggle.receipt;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ReceiptService {

    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
            "(?:total|amount|sum|grand total)[:\\s]*[$€£]?\\s*(\\d{1,6}[.,]\\d{2})",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern GENERIC_AMOUNT_PATTERN = Pattern.compile(
            "[$€£]\\s*(\\d{1,6}[.,]\\d{2})");

    private static final Pattern DATE_PATTERN_MDY = Pattern.compile(
            "(\\d{1,2})[/\\-](\\d{1,2})[/\\-](\\d{2,4})");

    public Map<String, Object> scanReceipt(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();

        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("Could not read image file");
            }

            String text = extractText(image);
            log.debug("OCR extracted text: {}", text);

            result.put("rawText", text);
            result.put("amount", extractAmount(text));
            result.put("date", extractDate(text));
            result.put("merchant", extractMerchant(text));
            result.put("currency", extractCurrency(text));

        } catch (IOException e) {
            log.error("Failed to read receipt image", e);
            throw new IllegalArgumentException("Could not process image: " + e.getMessage());
        }

        return result;
    }

    private String extractText(BufferedImage image) {
        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(System.getenv().getOrDefault("TESSDATA_PREFIX", "/usr/share/tesseract-ocr/5/tessdata"));
            tesseract.setLanguage("eng");
            tesseract.setPageSegMode(6);  // uniform block of text
            return tesseract.doOCR(image);
        } catch (TesseractException e) {
            log.warn("Tesseract OCR failed, returning empty string: {}", e.getMessage());
            return "";
        }
    }

    private BigDecimal extractAmount(String text) {
        // Try labeled amount first (e.g. "Total: $42.50")
        Matcher m = AMOUNT_PATTERN.matcher(text);
        if (m.find()) {
            return parseMoney(m.group(1));
        }
        // Fallback: find the largest $ amount (likely the total)
        Matcher gm = GENERIC_AMOUNT_PATTERN.matcher(text);
        BigDecimal largest = null;
        while (gm.find()) {
            BigDecimal val = parseMoney(gm.group(1));
            if (largest == null || val.compareTo(largest) > 0) {
                largest = val;
            }
        }
        return largest;
    }

    private BigDecimal parseMoney(String raw) {
        try {
            return new BigDecimal(raw.replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate extractDate(String text) {
        Matcher m = DATE_PATTERN_MDY.matcher(text);
        while (m.find()) {
            try {
                String month = m.group(1).length() == 1 ? "0" + m.group(1) : m.group(1);
                String day = m.group(2).length() == 1 ? "0" + m.group(2) : m.group(2);
                String year = m.group(3).length() == 2 ? "20" + m.group(3) : m.group(3);
                return LocalDate.parse(year + "-" + month + "-" + day,
                        DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    private String extractMerchant(String text) {
        // First non-empty line is usually the merchant name
        String[] lines = text.split("\\n");
        for (String line : lines) {
            String clean = line.trim();
            if (clean.length() > 3 && clean.length() < 60
                    && !clean.matches(".*\\d{2}[/\\-]\\d{2}.*")) {
                return clean;
            }
        }
        return null;
    }

    private String extractCurrency(String text) {
        if (text.contains("€")) return "EUR";
        if (text.contains("£")) return "GBP";
        if (text.contains("¥")) return "JPY";
        return "USD";
    }
}