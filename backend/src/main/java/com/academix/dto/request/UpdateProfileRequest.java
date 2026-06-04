package com.academix.dto.request;

public class UpdateProfileRequest {

    private String name;
    private String phone;
    private String course;
    private Integer currentYear;
    private Long collegeId;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String name, String phone, String course, Integer currentYear, Long collegeId) {
        this.name = name;
        this.phone = phone;
        this.course = course;
        this.currentYear = currentYear;
        this.collegeId = collegeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Integer getCurrentYear() {
        return currentYear;
    }

    public void setCurrentYear(Integer currentYear) {
        this.currentYear = currentYear;
    }

    public Long getCollegeId() {
        return collegeId;
    }

    public void setCollegeId(Long collegeId) {
        this.collegeId = collegeId;
    }
}
