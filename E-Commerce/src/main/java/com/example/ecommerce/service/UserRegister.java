package com.example.ecommerce.service;


import com.example.ecommerce.config.JwtService;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.UserAlreadyExistException;
import com.example.ecommerce.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserRegister {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AuthenticationProvider authManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ProductService productService;
    final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public User register(User user) {
        Optional<User> exist = userRepo.findByUsername(user.getUsername());
        if (exist != null) {
            throw new UserAlreadyExistException("user already exist");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    public String login(User user) {

        System.out.println("1. Login started");

        Authentication authentication =
                authManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                user.getUsername(),
                                user.getPassword()
                        )
                );

        System.out.println("2. Authentication successful");
        System.out.println("3. Username: " + authentication.getName());



        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        System.out.println("4. JWT generated successfully");

        return token;
    }

}