package com.example.KLTN.Service.Impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class OpenAiService {

    public String ask(String prompt, String apiKey) {
        HttpClient client = HttpClient.newHttpClient();
        ObjectMapper objectMapper = new ObjectMapper();

        // Tạo body request đúng chuẩn
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", "gpt-3.5-turbo");

        ArrayNode messages = objectMapper.createArrayNode();
        ObjectNode message = objectMapper.createObjectNode();
        message.put("role", "user");
        message.put("content", prompt);
        messages.add(message);

        requestBody.set("messages", messages);

        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(requestBody);
        } catch (Exception e) {
            return "Lỗi khi tạo JSON: " + e.getMessage();
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonString))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String json = response.body();

            // Kiểm tra HTTP status code
            if (response.statusCode() != 200) {
                return "Lỗi từ OpenAI API (HTTP " + response.statusCode() + "): " + json;
            }

            // Parse JSON response
            JsonNode rootNode = objectMapper.readTree(json);
            
            // Kiểm tra lỗi trong response
            if (rootNode.has("error")) {
                JsonNode errorNode = rootNode.get("error");
                String errorMessage = errorNode.has("message") 
                    ? errorNode.get("message").asText() 
                    : errorNode.toString();
                return "Lỗi từ OpenAI: " + errorMessage;
            }

            // Trích xuất kết quả
            if (rootNode.has("choices") && rootNode.get("choices").isArray()) {
                JsonNode choices = rootNode.get("choices");
                if (choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                        return firstChoice.get("message").get("content").asText();
                    }
                }
            }
            
            return "Không có nội dung phản hồi từ OpenAI. Response: " + json;
        } catch (java.net.http.HttpTimeoutException e) {
            return "Lỗi: Timeout khi gọi OpenAI API. Vui lòng thử lại sau.";
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            return "Lỗi khi xử lý phản hồi từ OpenAI: " + e.getMessage();
        } catch (java.io.IOException e) {
            return "Lỗi kết nối đến OpenAI API: " + e.getMessage();
        } catch (Exception e) {
            return "Lỗi không xác định khi gọi OpenAI: " + e.getMessage() + " (" + e.getClass().getSimpleName() + ")";
        }
    }
}

