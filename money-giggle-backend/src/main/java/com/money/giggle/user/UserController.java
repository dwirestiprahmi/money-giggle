package com.money.giggle.user;

import com.money.giggle.common.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(toProfileResponse(user)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User user) {
        if (request.getName() != null) user.setName(request.getName());
        if (request.getDefaultCurrency() != null )
            user.setDefaultCurrency(request.getDefaultCurrency().toUpperCase());

        return ResponseEntity.ok(ApiResponse.ok(toProfileResponse(userRepository.save(user))));
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse userProfileResponse = new UserProfileResponse();
        userProfileResponse.setId(user.getId());
        userProfileResponse.setEmail(user.getEmail());
        userProfileResponse.setName(user.getName());
        userProfileResponse.setDefaultCurrency(user.getDefaultCurrency());
        userProfileResponse.setCreatedAt(user.getCreatedAt().toString());
        return userProfileResponse;
    }

    @Data
    public static class UpdateProfileRequest {
        @Size(max = 100)
        private String name;

        @Size(min = 3, max = 3)
        private String defaultCurrency;
    }

    @Data
    public static class ChangePasswordRequest {
        private String currentPassword;

        @Size(min = 8, message = "New password must be at least 8 characters")
        private String newPassword;
    }

    @Data
    public static class UserProfileResponse {
        private UUID id;
        private String email;
        private String name;
        private String defaultCurrency;
        private String createdAt;
    }
}
