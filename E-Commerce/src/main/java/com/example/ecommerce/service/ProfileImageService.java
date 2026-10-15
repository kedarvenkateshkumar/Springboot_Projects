package com.example.ecommerce.service;

import com.example.ecommerce.entity.User;
import com.example.ecommerce.entity.UserProfileImage;
import com.example.ecommerce.repository.UserProfileImageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.Instant;
import java.util.Set;

@Service
public class ProfileImageService {

    private static final long MAX_SIZE = 2 * 1024 * 1024; // 2 MB

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final UserProfileImageRepository imageRepository;

    public ProfileImageService(
            UserProfileImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    @Transactional
    public void upload(User user, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select an image");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Image must be 2 MB or smaller");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPEG, PNG and WebP images are allowed");
        }

        try {
            byte[] bytes = file.getBytes();

            // Check that the uploaded bytes can actually be decoded as an image.
            BufferedImage decoded = ImageIO.read(
                    new java.io.ByteArrayInputStream(bytes));

            if (decoded == null
                    || decoded.getWidth() > 5000
                    || decoded.getHeight() > 5000) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid image or image dimensions too large");
            }

            UserProfileImage image = imageRepository
                    .findById(user.getId())
                    .orElseGet(UserProfileImage::new);

            image.setUser(user);
            image.setImageData(bytes);
            image.setContentType(contentType);
            image.setUpdatedAt(Instant.now());

            imageRepository.save(image);

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Unable to read image");
        }
    }

    @Transactional(readOnly = true)
    public UserProfileImage getImage(Long userId) {
        return imageRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Profile image not found"));
    }
}