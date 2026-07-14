package com.example.ecommerce.controller;

import com.example.ecommerce.entity.User;
import com.example.ecommerce.service.UserRegister;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    private UserRegister userRegister;

    @PostMapping("/register")
    public User register(@RequestBody User user){
        return userRegister.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user){
        return userRegister.login(user);
    }

}


