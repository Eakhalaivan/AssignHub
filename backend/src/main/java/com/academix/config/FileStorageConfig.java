package com.academix.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "file.storage")
public class FileStorageConfig {
    private String uploadDir;

    // TODO: Implement static dir structures and getter/setter bindings
}
