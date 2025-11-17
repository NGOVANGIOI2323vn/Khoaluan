package com.example.KLTN.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class Image {

    private static final String UPLOAD_DIR = "uploads/projects/";


    public String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String ext = "";
        if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
            ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + ext;
        Path filePath = uploadPath.resolve(fileName);

        file.transferTo(filePath);
        return fileName;
    }
    public  String updateFile(String oldFilePath, MultipartFile newFile) throws IOException {
        if (newFile == null || newFile.isEmpty()) {
            return oldFilePath; // giữ file cũ
        }
        // Xóa file cũ nếu tồn tại
        if (oldFilePath != null) {
            Path oldPath = Paths.get(oldFilePath);
            Files.deleteIfExists(oldPath);
        }
        return saveFile(newFile); // lưu file mới
    }
}

// String savedPath = FileUploadUtil.saveFile(image, "uploads/hotels/");
//hotel.setImage(savedPath); // gán path vào entity