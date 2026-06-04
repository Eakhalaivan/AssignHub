package com.academix.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AssignWriterRequest {

    @NotNull
    private Long writerId;

    private BigDecimal writerEarning;

    public AssignWriterRequest() {}

    public AssignWriterRequest(Long writerId, BigDecimal writerEarning) {
        this.writerId = writerId;
        this.writerEarning = writerEarning;
    }

    public Long getWriterId() { return writerId; }
    public void setWriterId(Long writerId) { this.writerId = writerId; }

    public BigDecimal getWriterEarning() { return writerEarning; }
    public void setWriterEarning(BigDecimal writerEarning) { this.writerEarning = writerEarning; }
}
