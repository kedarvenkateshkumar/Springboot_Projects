package com.example.ecommerce.config;

import com.example.ecommerce.repository.UserRepo;
import com.example.ecommerce.service.MyUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return  http
                .csrf(Customizer -> Customizer.disable())
                .authorizeHttpRequests(request -> request
                    .requestMatchers("/auth/register" , "/auth/login")
                    .permitAll()
                    .anyRequest().authenticated())
        //http.formLogin(Customizer.withDefaults());
            .httpBasic(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .build();
    }

    final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);


    @Autowired
    private MyUserDetails myUserDetails;
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(myUserDetails);
        provider.setPasswordEncoder(encoder);

        return provider;
    }
}
