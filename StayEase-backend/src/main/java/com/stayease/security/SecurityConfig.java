package com.stayease.security;

import com.stayease.auth.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                // RECOMANDAT: Pentru JWT, sesiunile trebuie sa fie stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/auth/**", "/api/register/**").permitAll()
                        .requestMatchers("/api/locations/**").permitAll()
                        .requestMatchers("/api/destinations/**").permitAll()
                        .requestMatchers("/api/renter/**").permitAll()

                        // Endpoint-uri publice specifice
                        .requestMatchers("/api/properties/search").permitAll()
                        .requestMatchers("/api/properties/search/filters").permitAll()
                        .requestMatchers("/api/properties/*/UnavailablePeriods").permitAll()

                        // Endpoint-uri care necesită autentificare
                        .requestMatchers("/api/properties/owner/**").authenticated()
                        .requestMatchers("/api/owner/**").authenticated()
                        .requestMatchers("/api/booking/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/properties/**").authenticated()

                        // Admin
                        .requestMatchers("/api/admin/**").permitAll()
                        .requestMatchers("/api/properties/admin/**").permitAll()

                        // GET public
                        .requestMatchers(HttpMethod.GET, "/api/properties/**", "/api/facilities/**").permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}