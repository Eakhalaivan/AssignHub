package com.academix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

@Service
public class ClamAVService {

    private static final Logger log = LoggerFactory.getLogger(ClamAVService.class);

    @Value("${clamav.host:localhost}")
    private String clamAVHost;

    @Value("${clamav.port:3310}")
    private int clamAVPort;

    @Value("${clamav.enabled:false}")
    private boolean clamAVEnabled;

    /**
     * Scans an input stream for viruses using ClamAV.
     * Uses ClamAV INSTREAM command over a direct TCP socket.
     * If ClamAV is disabled or unavailable, it logs a warning and returns true (permitting the file).
     *
     * @param fileStream the file stream to scan.
     * @return true if the file is clean/safe, false if infected.
     */
    public boolean scanFile(InputStream fileStream) {
        if (!clamAVEnabled) {
            log.info("ClamAV virus scanner is disabled. Assuming file is clean.");
            return true;
        }

        try (Socket socket = new Socket(clamAVHost, clamAVPort);
             OutputStream out = socket.getOutputStream();
             InputStream in = socket.getInputStream()) {
            
            socket.setSoTimeout(5000); // 5 seconds timeout
            
            // Send INSTREAM command
            out.write("nINSTREAM\n".getBytes(StandardCharsets.US_ASCII));
            out.flush();

            byte[] buffer = new byte[8192];
            int read;
            while ((read = fileStream.read(buffer)) != -1) {
                // Send chunk length (4 bytes, big-endian)
                out.write(new byte[]{
                        (byte) ((read >> 24) & 0xFF),
                        (byte) ((read >> 16) & 0xFF),
                        (byte) ((read >> 8) & 0xFF),
                        (byte) (read & 0xFF)
                });
                // Send the actual chunk bytes
                out.write(buffer, 0, read);
                out.flush();
            }

            // Terminate INSTREAM command with a zero-length chunk
            out.write(new byte[]{0, 0, 0, 0});
            out.flush();

            // Read response
            byte[] responseBytes = new byte[1024];
            int responseLength = in.read(responseBytes);
            if (responseLength == -1) {
                log.warn("Empty response received from ClamAV daemon. Permitting file.");
                return true;
            }

            String response = new String(responseBytes, 0, responseLength, StandardCharsets.US_ASCII).trim();
            log.info("ClamAV scanning output: {}", response);

            if (response.contains("FOUND")) {
                log.error("ClamAV detected virus threat in uploaded file: {}", response);
                return false;
            }

            return true;
        } catch (Exception ex) {
            log.warn("ClamAV connection failed ({}). Fallback applied: assuming file is clean for development.", ex.getMessage());
            return true;
        }
    }
}
