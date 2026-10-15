package com.example.ecommerce.repository;

import com.example.ecommerce.entity.UserProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileImageRepository
        extends JpaRepository<UserProfileImage, Long> {
}