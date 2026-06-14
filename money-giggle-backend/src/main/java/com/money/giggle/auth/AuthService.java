package com.money.giggle.auth;

import com.money.giggle.auth.dto.AuthDtos.*;
import com.money.giggle.user.User;
import com.money.giggle.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .defaultCurrency(request.getDefaultCurrency() != null
                    ? request.getDefaultCurrency().toUpperCase() : "EUR")
                .build();

        userRepository.save(user);
        return buildTokenResponse(user);
    }

    public TokenResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        return buildTokenResponse(user);
    }

    public TokenResponse refresh(RefreshRequest request) {
        String token = request.getRefreshToken();
        String email = jwtService.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        if (!jwtService.isTokenValid(token, user) || !jwtService.isRefreshToken(token)) {
            throw new IllegalArgumentException("Invalid or expired refresh token!");
        }

        return buildTokenResponse(user);
    }

    private TokenResponse buildTokenResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        TokenResponse.UserInfo userInfo = new TokenResponse.UserInfo();
        userInfo.setId(user.getId().toString());
        userInfo.setEmail(user.getEmail());
        userInfo.setName(user.getName());
        userInfo.setDefaultCurrency(user.getDefaultCurrency());

        TokenResponse response = new TokenResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtService.getExpirationMs() / 1000);
        response.setUser(userInfo);
        return response;
    }
}
