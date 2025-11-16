package com.example.KLTN.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {
    // Tạo mã QR và lưu ra file
    public Path generateQrToFile(String text, String fileName) throws WriterException, IOException {
        int width = 300;
        int height = 300;
        String fileType = "png";

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix matrix = new MultiFormatWriter()
                .encode(text, BarcodeFormat.QR_CODE, width, height, hints);

        // Thư mục lưu QR
        Path folderPath = FileSystems.getDefault().getPath("uploads/qr");
        Files.createDirectories(folderPath);

        Path filePath = folderPath.resolve(fileName + "." + fileType);
        MatrixToImageWriter.writeToPath(matrix, fileType, filePath);

        return filePath;
    }

    // Tạo mã QR trả về Base64 (để gửi API hoặc hiển thị web)
    public String generateQrBase64(String text) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 250, 250);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        }
    }
}
