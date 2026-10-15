package com.example.ecommerce.dto;

public class UserProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String phoneNumber;

    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    private String role;
    private String profileImageUrl;

    private boolean emailVerified;
    private boolean phoneVerified;

    public UserProfileResponse(
            Long id,
            String username,
            String email,
            String phoneNumber,
            String addressLine,
            String city,
            String state,
            String postalCode,
            String country,
            String role,
            String profileImageUrl,
            boolean emailVerified,
            boolean phoneVerified) {

        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.addressLine = addressLine;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
        this.emailVerified = emailVerified;
        this.phoneVerified = phoneVerified;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddressLine() { return addressLine; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }
    public String getCountry() { return country; }
    public String getRole() { return role; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isPhoneVerified() { return phoneVerified; }
}