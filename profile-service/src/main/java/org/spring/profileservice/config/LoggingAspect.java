package org.spring.profileservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Monitoraggio trasversale dei servizi del modulo Profile.
 * Implementa logica di logging e tracciamento performance tramite AspectJ.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Pointcut per intercettare tutti i metodi definiti nel package service.
     * Garantisce la copertura automatica della business logic senza modifiche al codice sorgente.
     */
    @Pointcut("execution(* org.spring.profileservice.service.*.*(..))")
    public void serviceMethods() {}

    /**
     * Intercetta l'esecuzione dei metodi per il calcolo delle metriche di performance 
     * e la gestione centralizzata delle notifiche di errore verso Kafka.
     */
    @Around("serviceMethods()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        log.info("===> [START] {}.{} | Args: {}", className, methodName, Arrays.toString(args));

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed(); // Delegazione dell'esecuzione al metodo originale
            
            long endTime = System.currentTimeMillis();
            log.info("<=== [END] {}.{} | Execution Time: {}ms", className, methodName, (endTime - startTime));
            
            return result;
        } catch (Throwable e) {
            log.error("!!! [ERROR] {}.{} | Message: {}", className, methodName, e.getMessage());
            
            // Dispatch dell'errore al sistema di notifiche centralizzato
            Map<String, String> errorDetails = new HashMap<>();
            errorDetails.put("service", "profile-service");
            errorDetails.put("class", className);
            errorDetails.put("method", methodName);
            errorDetails.put("error", e.getMessage());
            
            kafkaTemplate.send("system-errors", errorDetails);
            
            throw e; // Rilancio dell'eccezione per mantenere l'integrità del flusso applicativo
        }
    }
}
