package com.example.specgenerator.payload.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String gender;
    private LocalDate birthday;
}
