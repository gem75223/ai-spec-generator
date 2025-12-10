package com.example.specgenerator.payload.request;

import lombok.Data;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDate;

@Data
public class SignupRequest {
    // We can keep 'username' field for compatibility but map it to 'name' or
    // 'email' or just deprecate it.
    // Ideally we replace it. Let's assume the frontend will send 'email' now.

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Size(max = 255)
    @Email
    private String email;

    @NotBlank
    @Size(max = 20)
    private String phone;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String gender;

    private LocalDate birthday;
}
