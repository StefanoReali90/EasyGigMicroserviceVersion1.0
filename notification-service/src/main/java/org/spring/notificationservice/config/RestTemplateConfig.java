package org.spring.notificationservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configurazione del RestTemplate con load-balancing Eureka.
 * Il bean {@code @LoadBalanced} permette di risolvere i nomi dei servizi
 * registrati su Eureka (es. "http://profile-service/...").
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
