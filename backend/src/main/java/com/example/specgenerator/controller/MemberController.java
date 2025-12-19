package com.example.specgenerator.controller;

import com.example.specgenerator.model.Member;
import com.example.specgenerator.payload.request.ChangePasswordRequest;
import com.example.specgenerator.payload.request.UpdateProfileRequest;
import com.example.specgenerator.payload.response.MessageResponse;
import com.example.specgenerator.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    PasswordEncoder encoder;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: Member not found."));

        // Hide sensitive info like password
        member.setPassword(null);
        return ResponseEntity.ok(member);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody UpdateProfileRequest updateRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return memberRepository.findByEmail(userDetails.getUsername())
                .map(member -> {
                    member.setName(updateRequest.getName());
                    member.setPhone(updateRequest.getPhone());
                    member.setGender(updateRequest.getGender());
                    member.setBirthday(updateRequest.getBirthday());

                    memberRepository.save(member);
                    return ResponseEntity.ok(new MessageResponse("個人資料更新成功！"));
                })
                .orElseThrow(() -> new RuntimeException("錯誤：找不到使用者"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("錯誤：找不到使用者"));

        if (!encoder.matches(changePasswordRequest.getOldPassword(), member.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("錯誤：舊密碼不正確！"));
        }

        member.setPassword(encoder.encode(changePasswordRequest.getNewPassword()));
        memberRepository.save(member);

        return ResponseEntity.ok(new MessageResponse("密碼修改成功！"));
    }
}
