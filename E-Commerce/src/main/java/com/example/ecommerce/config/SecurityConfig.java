package com.example.ecommerce.config;

import com.example.ecommerce.service.MyUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return  http
                .csrf(Customizer -> Customizer.disable())
                .authorizeHttpRequests(request -> request
                    .requestMatchers("/auth/register" , "/auth/login")
                    .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**")
                        .hasAnyAuthority("USER", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/products/**")
                        .hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/products/**")
                        .hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/products/**")
                        .hasAuthority("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/**"
                        )
                        .hasAnyAuthority("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders"
                        )
                        .hasAuthority("USER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/status"
                        )
                        .hasAuthority("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin"
                        )
                        .hasAuthority("ADMIN")
                    .anyRequest().authenticated())
        //http.formLogin(Customizer.withDefaults());
            .httpBasic(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
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
