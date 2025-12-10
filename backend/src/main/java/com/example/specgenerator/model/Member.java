package com.example.specgenerator.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "phone"),
        @UniqueConstraint(columnNames = "member_code")
})
@Data
@NoArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_code", nullable = false, length = 32)
    private String memberCode;

    @Column(unique = true, length = 255)
    private String email;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String password; // using 'password' field name for easier UserDetails integration, mapped to
                             // password_hash

    @Column(name = "password_salt", length = 64)
    private String passwordSalt;

    @Column(length = 50)
    private String name;

    @Column(length = 1)
    private String gender;

    private LocalDate birthday;

    @Column(nullable = false, columnDefinition = "SMALLINT DEFAULT 1")
    private Integer status = 1;

    @Column(name = "email_verified", nullable = false, columnDefinition = "SMALLINT DEFAULT 0")
    private Integer emailVerified = 0;

    @Column(name = "phone_verified", nullable = false, columnDefinition = "SMALLINT DEFAULT 0")
    private Integer phoneVerified = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "reset_password_token", length = 64)
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;
}
