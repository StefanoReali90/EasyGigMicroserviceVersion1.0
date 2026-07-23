package org.spring.apigateway.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("execution(* org.spring.apigateway.filter.*.*(..))")
    public void filterMethods() {}

    @Around("filterMethods()")
    public Object logFilterExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        log.info("===> [GATEWAY FILTER START] {}.{} | Args: {}", className, methodName, Arrays.toString(args));
        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            log.info("<=== [GATEWAY FILTER END] {}.{} | Execution Time: {}ms", className, methodName, (endTime - startTime));
            return result;
        } catch (Throwable e) {
            log.error("!!! [GATEWAY FILTER ERROR] {}.{} | Message: {}", className, methodName, e.getMessage(), e);
            throw e;
        }
    }
}
