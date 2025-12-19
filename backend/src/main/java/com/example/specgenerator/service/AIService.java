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

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    // Simple implementation for OpenAI Chat Completion
    public String generateSpecContent(String prompt) {
        return callOpenAi(prompt, true);
    }

    public String refineContent(String section, String currentContent, String instruction) {
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            return "Error: OpenAI API Key not configured.";
        }

        String prompt = "You are a technical expert. Refine the following code based on the instruction. \n" +
                "Section Type: " + section + "\n" +
                "Instruction: " + instruction + "\n" +
                "Current Content:\n" + currentContent + "\n\n" +
                "Return ONLY the updated code without any markdown formatting (no ```).";

        // Reuse generateSpecContent logic for now as it's just a chat completion
        // But we need to be careful about JSON mode. Refine might just want string
        // output.
        // Let's create a shared private method or just copy logic for simplicity in
        // this MVP
        // to toggle JSON mode off for this specific call if needed.
        // Actually, generateSpecContent forces JSON mode now. We should probably
        // refactor or make a new method.

        return callOpenAi(prompt, false);
    }

    private String callOpenAi(String prompt, boolean jsonMode) {
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            return "Error: OpenAI API Key not configured.";
        }

        String url = "https://api.openai.com/v1/chat/completions";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo-1106");

        if (jsonMode) {
            Map<String, String> responseFormat = new HashMap<>();
            responseFormat.put("type", "json_object");
            requestBody.put("response_format", responseFormat);
        }

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        messages.add(message);

        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            return (String) messageObj.get("content");
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling AI API: " + e.getMessage();
        }
    }
}
