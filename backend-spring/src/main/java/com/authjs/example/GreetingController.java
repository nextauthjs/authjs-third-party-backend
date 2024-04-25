package com.authjs.example;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class GreetingController {

    @GetMapping(value = "/api/authenticated/greeting")
    public String getGreeting(JwtAuthenticationToken authenticationToken) {
        String name = authenticationToken
                .getTokenAttributes()
                .getOrDefault("name", "unknown name").toString();
        return "{\"greeting\": \"Hello, %s!\"}".formatted(name);
    }

    @GetMapping(value = "/api/public/greeting")
    public String getPublic() {
        return "Greetings, mysterious traveller.";
    }
}