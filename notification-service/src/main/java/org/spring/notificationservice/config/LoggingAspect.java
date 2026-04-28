package org.spring.notificationservice.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("execution(* org.spring.notificationservice.service.*.*(..))")
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
            throw e;
        }
    }
}
