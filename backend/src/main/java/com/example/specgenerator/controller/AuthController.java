package com.example.specgenerator.controller;

import com.example.specgenerator.model.Member;
import com.example.specgenerator.payload.request.ForgotPasswordRequest;
import com.example.specgenerator.payload.request.LoginRequest;
import com.example.specgenerator.payload.request.ResetPasswordRequest;
import com.example.specgenerator.payload.request.SignupRequest;
import com.example.specgenerator.payload.response.JwtResponse;
import com.example.specgenerator.payload.response.MessageResponse;
import com.example.specgenerator.repository.MemberRepository;
import com.example.specgenerator.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        MemberRepository memberRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/signin")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

                // loginRequest.getUsername() is actually the email
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                Long memberId = memberRepository.findByEmail(userDetails.getUsername())
                                .map(Member::getId)
                                .orElse(null);

                // Update last login
                memberRepository.findByEmail(userDetails.getUsername()).ifPresent(member -> {
                        member.setLastLoginAt(LocalDateTime.now());
                        memberRepository.save(member);
                });

                return ResponseEntity.ok(new JwtResponse(jwt,
                                memberId,
                                userDetails.getUsername(),
                                roles));
        }

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
                if (memberRepository.existsByEmail(signUpRequest.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Email is already in use!"));
                }

                if (memberRepository.existsByPhone(signUpRequest.getPhone())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Phone number is already in use!"));
                }

                // Create new member's account
                Member member = new Member();
                member.setName(signUpRequest.getName());
                member.setEmail(signUpRequest.getEmail());
                member.setPhone(signUpRequest.getPhone());
                member.setPassword(encoder.encode(signUpRequest.getPassword()));
                member.setGender(signUpRequest.getGender());
                member.setBirthday(signUpRequest.getBirthday());

                // Generate Member Code
                member.setMemberCode(UUID.randomUUID().toString().replace("-", ""));

                // Status and Verified fields have defaults in Entity

                memberRepository.save(member);

                return ResponseEntity.ok(new MessageResponse("Member registered successfully!"));
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
                Member member = memberRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException(
                                                "Error: Member not found with email: " + request.getEmail()));

                // Generate token
                String token = UUID.randomUUID().toString();
                member.setResetPasswordToken(token);
                member.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24)); // 24 hours expiry
                memberRepository.save(member);

                // TODO: Send email with token
                System.out.println("Reset Token for " + request.getEmail() + ": " + token);

                return ResponseEntity.ok(new MessageResponse("Password reset token generated. Check console/email."));
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                String token = request.getToken();

                Member member = memberRepository.findByResetPasswordToken(token)
                                .orElseThrow(() -> new RuntimeException("Error: Invalid or expired token."));

                if (member.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: Token has expired."));
                }

                member.setPassword(encoder.encode(request.getNewPassword()));
                member.setResetPasswordToken(null);
                member.setResetPasswordTokenExpiry(null);
                memberRepository.save(member);

                return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
        }
}
