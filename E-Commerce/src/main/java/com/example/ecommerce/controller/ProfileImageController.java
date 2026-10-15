package com.example.ecommerce.controller;

import com.example.ecommerce.entity.User;
import com.example.ecommerce.entity.UserPrinciples;
import com.example.ecommerce.entity.UserProfileImage;
import com.example.ecommerce.service.ProfileImageService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/users/me/profile-image")
public class ProfileImageController {

    private final ProfileImageService imageService;

    public ProfileImageController(ProfileImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> upload(
            @AuthenticationPrincipal UserPrinciples principal,
            @RequestParam("file") MultipartFile file) {

        imageService.upload(principal.getUser(), file);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<byte[]> getMyImage(
            @AuthenticationPrincipal UserPrinciples principal) {

        User user = principal.getUser();
        UserProfileImage image = imageService.getImage(user.getId());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        image.getContentType()))
                .cacheControl(CacheControl.noCache())
                .header("X-Content-Type-Options", "nosniff")
                .body(image.getImageData());
    }
}