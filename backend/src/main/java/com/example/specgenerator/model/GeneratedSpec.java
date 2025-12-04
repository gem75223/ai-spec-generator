package com.example.specgenerator.model;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_specs")
@Data
@NoArgsConstructor
public class GeneratedSpec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(columnDefinition = "TEXT")
    private String requirementDescription;

    @Column(columnDefinition = "TEXT")
    private String apiSpec; // JSON or YAML

    @Column(columnDefinition = "TEXT")
    private String dbSchema; // SQL

    @Column(columnDefinition = "TEXT")
    private String sequenceDiagram; // Mermaid or PlantUML

    @Column(columnDefinition = "TEXT")
    private String mockData; // JSON

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
