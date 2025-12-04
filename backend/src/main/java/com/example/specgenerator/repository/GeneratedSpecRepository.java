package com.example.specgenerator.repository;

import com.example.specgenerator.model.GeneratedSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GeneratedSpecRepository extends JpaRepository<GeneratedSpec, Long> {
    List<GeneratedSpec> findByProjectId(Long projectId);
}
