package com.example.ecommerce.service;


import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserRegister {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AuthenticationProvider authManager;

    @Autowired
    private ProductService productService;

    final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public User register(User user){
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    public String login(User user){
        Authentication authentication =
                authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        if(!authentication.isAuthenticated()){
            throw new AuthenticationCredentialsNotFoundException("Invalid credentials");
        }
        return "Login success.. ";



    }
}
