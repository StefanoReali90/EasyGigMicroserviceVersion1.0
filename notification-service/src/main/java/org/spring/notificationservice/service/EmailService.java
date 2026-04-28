package org.spring.notificationservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.spring.notificationservice.exception.EmailSendingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${application.frontend.url}")
    private String frontendUrl;

    public void sendEmail(String to, String subject, String body){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);

    }

    public void sendInvitationEmail(String to, String bandName, int memberCount, String token, int expiryDays) {
        String invitationLink = UriComponentsBuilder.fromHttpUrl(frontendUrl)
                .queryParam("token", token)
                .build().toUriString();

        Context context = new Context();
        context.setVariable("bandName", bandName);
        context.setVariable("memberCount", memberCount);
        context.setVariable("invitationLink", invitationLink);
        context.setVariable("expiryDays", expiryDays);

        String htmlContent = templateEngine.process("invitation-email",context);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(fromEmail);
            helper.setText(htmlContent, true);
            helper.setTo(to);
            helper.setSubject("Invito a unirti alla band " + bandName);
            
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new EmailSendingException("Errore durante la creazione dell'email", e);
        }
    }

}
