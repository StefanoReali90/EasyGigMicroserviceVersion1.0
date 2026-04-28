package org.spring.chatservice.config;

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

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Pointcut("execution(* org.spring.chatservice.service.*.*(..))")
    public void serviceMethods() {}

    @Around("serviceMethods()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        log.info("===> [START] {}.{} | Args: {}", className, methodName, Arrays.toString(args));

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            
            long endTime = System.currentTimeMillis();
            log.info("<=== [END] {}.{} | Execution Time: {}ms", className, methodName, (endTime - startTime));
            
            return result;
        } catch (Throwable e) {
            log.error("!!! [ERROR] {}.{} | Message: {}", className, methodName, e.getMessage());
            
            Map<String, String> errorDetails = new HashMap<>();
            errorDetails.put("service", "chat-service");
            errorDetails.put("class", className);
            errorDetails.put("method", methodName);
            errorDetails.put("error", e.getMessage());
            
            kafkaTemplate.send("system-errors", errorDetails);
            
            throw e;
        }
    }
}
