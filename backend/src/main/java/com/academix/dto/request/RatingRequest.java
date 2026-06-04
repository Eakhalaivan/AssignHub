package com.academix.dto.request;

import jakarta.validation.constraints.*;

public class RatingRequest {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer score;

    private String feedback;

    public RatingRequest() {}

    public RatingRequest(Integer score, String feedback) {
        this.score = score;
        this.feedback = feedback;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
