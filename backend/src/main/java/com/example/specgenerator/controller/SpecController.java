package com.example.specgenerator.controller;

import com.example.specgenerator.model.GeneratedSpec;
import com.example.specgenerator.model.Project;
import com.example.specgenerator.repository.GeneratedSpecRepository;
import com.example.specgenerator.repository.ProjectRepository;
import com.example.specgenerator.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/specs")
public class SpecController {

    @Autowired
    GeneratedSpecRepository specRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    AIService aiService;

    @GetMapping("/project/{projectId}")
    public List<GeneratedSpec> getSpecsByProject(@PathVariable Long projectId) {
        return specRepository.findByProjectId(projectId);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateSpec(@RequestBody Map<String, Object> payload) {
        Long projectId = Long.valueOf(payload.get("projectId").toString());
        String requirement = (String) payload.get("requirement");

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        GeneratedSpec spec = new GeneratedSpec();
        spec.setProject(project);
        spec.setRequirementDescription(requirement);

        // Generate content using AI
        // In a real app, we might want to parallelize these or use a single prompt to
        // get JSON output
        // For simplicity, we'll do sequential calls or one big call.
        // Let's do one big call and ask for JSON format to parse.

        String prompt = "You are a technical architect. Based on the following requirement, generate a technical specification in JSON format with the following keys: 'apiSpec' (OpenAPI 3.0 YAML/JSON), 'dbSchema' (SQL), 'sequenceDiagram' (Mermaid syntax), 'mockData' (JSON example). Requirement: "
                + requirement;

        String aiResponse = aiService.generateSpecContent(prompt);

        // Very naive parsing for demo purposes. In reality, we should enforce JSON
        // structure more strictly.
        // We'll just save the raw response in apiSpec for now if parsing fails, or try
        // to split it.
        // For this MVP, let's assume the AI returns a JSON string.

        spec.setApiSpec(aiResponse); // Storing full response for now as we don't have a robust parser yet
        spec.setDbSchema("-- See API Spec for full details --");
        spec.setSequenceDiagram("sequenceDiagram\nUser->>System: " + requirement);
        spec.setMockData("{}");

        specRepository.save(spec);

        return ResponseEntity.ok(spec);
    }
}
