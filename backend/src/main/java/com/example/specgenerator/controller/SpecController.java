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
        String prompt = "You are a technical architect. Based on the following requirement, generate a technical specification in JSON format. "
                +
                "The JSON object MUST contain exactly these four keys: " +
                "'apiSpec' (OpenAPI 3.0 YAML or JSON string), " +
                "'dbSchema' (SQL create table statements), " +
                "'sequenceDiagram' (Mermaid sequenceDiagram syntax), " +
                "'mockData' (JSON example data). " +
                "Do not include markdown code blocks (```json) in the response, just the raw JSON object. " +
                "Requirement: " + requirement;

        String aiResponse = aiService.generateSpecContent(prompt);

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> parsed = mapper.readValue(aiResponse, Map.class);

            spec.setApiSpec(parsed.getOrDefault("apiSpec", aiResponse));
            spec.setDbSchema(parsed.getOrDefault("dbSchema", "-- No DB Schema generated"));
            spec.setSequenceDiagram(parsed.getOrDefault("sequenceDiagram",
                    "sequenceDiagram\nNote right of User: Parsing failed or empty"));
            spec.setMockData(parsed.getOrDefault("mockData", "{}"));

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback
            spec.setApiSpec(aiResponse);
            spec.setDbSchema("-- Error parsing AI response");
            spec.setSequenceDiagram("sequenceDiagram\nNote right of User: Error parsing AI response");
            spec.setMockData("{}");
        }

        specRepository.save(spec);

        return ResponseEntity.ok(spec);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSpec(@PathVariable Long id, @RequestBody GeneratedSpec specDetails) {
        GeneratedSpec spec = specRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到規格"));

        spec.setApiSpec(specDetails.getApiSpec());
        spec.setDbSchema(specDetails.getDbSchema());
        spec.setSequenceDiagram(specDetails.getSequenceDiagram());
        spec.setMockData(specDetails.getMockData());
        specRepository.save(spec);
        return ResponseEntity.ok(spec);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSpec(@PathVariable Long id) {
        GeneratedSpec spec = specRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到規格"));

        specRepository.delete(spec);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refine")
    public ResponseEntity<?> refineSpec(@RequestBody Map<String, String> request) {
        String section = request.get("section");
        String instruction = request.get("instruction");
        String currentContent = request.get("currentContent");

        String refinedContent = aiService.refineContent(section, currentContent, instruction);

        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("refinedContent", refinedContent);

        return ResponseEntity.ok(response);
    }
}
