package com.flowsync.auth;

import com.flowsync.exception.BadRequestException;
import com.flowsync.security.JwtService;
import com.flowsync.security.UserPrincipal;
import com.flowsync.user.User;
import com.flowsync.user.UserDto;
import com.flowsync.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        String userId = UUID.randomUUID().toString();
        User user = new User(
                userId,
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                "Member",
                "Workspace member"
        );

        User saved = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.create(saved);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, UserDto.fromEntity(saved));
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);
        User user = userRepository.findById(principal.getId()).orElseThrow();

        return new AuthResponse(token, UserDto.fromEntity(user));
    }
}
