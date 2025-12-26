package com.example.specgenerator.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
public class AIService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    // Simple implementation for Gemini API
    public String generateSpecContent(String prompt) {
        return callGemini(prompt, true);
    }

    public String refineContent(String section, String currentContent, String instruction) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "Error: Gemini API Key not configured.";
        }

        String fullPrompt = "You are a technical expert. Refine the following code based on the instruction. \n" +
                "Section Type: " + section + "\n" +
                "Instruction: " + instruction + "\n" +
                "Current Content:\n" + currentContent + "\n\n" +
                "Return ONLY the updated code without any markdown formatting (no ```).";

        return callGemini(fullPrompt, false);
    }

    private String callGemini(String prompt, boolean jsonMode) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "Error: Gemini API Key not configured.";
        }

        // Use the correct Gemini API endpoint from official documentation
        // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="
                + geminiApiKey;
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();

        // Build contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();

        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        parts.add(part);

        content.put("parts", parts);
        contents.add(content);

        requestBody.put("contents", contents);

        // Note: Gemini Pro v1 doesn't support response_mime_type
        // We rely on the prompt to request JSON format output

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            // Parse Gemini response format
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "Error: No response from Gemini API";
            }

            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentObj.get("parts");

            if (responseParts == null || responseParts.isEmpty()) {
                return "Error: Invalid response format from Gemini API";
            }

            return (String) responseParts.get(0).get("text");
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Gemini API: " + e.getMessage();
        }
    }
}
