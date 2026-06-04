package com.academix.service;

import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final ClamAVService clamAVService;

    public FileStorageService(@Value("${file.upload.dir:uploads}") String uploadDir, ClamAVService clamAVService) {
        this.clamAVService = clamAVService;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for storing uploaded files.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        
        // Block directory traversal attacks
        if (originalFileName.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence " + originalFileName);
        }

        // Validate file size (10MB limit)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File exceeds maximum allowed limit of 10MB");
        }

        // Validate file extension
        String fileExtension = "";
        int extIndex = originalFileName.lastIndexOf(".");
        if (extIndex >= 0) {
            fileExtension = originalFileName.substring(extIndex).toLowerCase();
        } else {
            throw new BadRequestException("File must have a valid extension.");
        }

        java.util.List<String> allowedExtensions = java.util.List.of(".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".zip");
        if (!allowedExtensions.contains(fileExtension)) {
            throw new BadRequestException("File extension " + fileExtension + " not allowed. Permitted: " + String.join(", ", allowedExtensions));
        }

        // Generate safe unique filename
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Perform virus scan
        try (java.io.InputStream scanStream = file.getInputStream()) {
            if (!clamAVService.scanFile(scanStream)) {
                throw new BadRequestException("File upload rejected: Virus or malware signature detected.");
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not verify file integrity.", ex);
        }

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + fileName);
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
    }
}
