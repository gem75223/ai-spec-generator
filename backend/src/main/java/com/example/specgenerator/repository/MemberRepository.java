package com.example.specgenerator.repository;

import com.example.specgenerator.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email); // Use Email for login mainly, or memberCode? Usually Email/Phone.

    Optional<Member> findByMemberCode(String memberCode);

    Optional<Member> findByResetPasswordToken(String resetPasswordToken);

    Boolean existsByEmail(String email);

    Boolean existsByPhone(String phone);

    // If username login is supported, map it to email or name?
    // The original `User` had `username`. `Member` has `email` and `phone`.
    // Let's assume we use `email` as the username for login purposes.
}
