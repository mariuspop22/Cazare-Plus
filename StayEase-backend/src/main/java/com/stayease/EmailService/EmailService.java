package com.stayease.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPropertyRejectionEmail(String toEmail, String propertyTitle, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Proprietatea ta a fost respinsă - " + propertyTitle);
        message.setText("Salut,\n\n" +
                "Din păcate, proprietatea ta \"" + propertyTitle + "\" a fost respinsă de către administrator.\n\n" +
                "Motivul respingerii:\n" + reason + "\n\n" +
                "Te rugăm să remediezi problemele menționate și să trimiți proprietatea din nou spre revizuire.\n\n" +
                "O zi frumoasă,\nEchipa CazarePlus!");
        message.setFrom("mariusvalentin.popescu@ulbsibiu.ro");

        mailSender.send(message);
    }

    public void sendPropertyApprovalEmail(String toEmail, String propertyTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Proprietatea ta a fost aprobată! - " + propertyTitle);
        message.setText("Salut,\n\n" +
                "Veste bună! Proprietatea ta \"" + propertyTitle + "\" a fost aprobată de către administrator și este acum activă pe platformă.\n\n" +
                "Îți dorim mult succes cu închirierile!\n\n" +
                "O zi frumoasă,\nEchipa CazarePlus!");
        message.setFrom("mariusvalentin.popescu@ulbsibiu.ro");

        mailSender.send(message);
    }
    public void sendPropertyModificationsApprovalEmail(String toEmail, String propertyTitle){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Modificarile  tale au fost aprobate! - " + propertyTitle);
        message.setText("Salut,\n\n" +
                "Veste bună! Modificarile pentru proprietatea \"" + propertyTitle + "\" au fost aprobate de către administrator și  versiunea noua este acum activă pe platformă.\n\n" +
                "Îți dorim mult succes cu închirierile!\n\n" +
                "O zi frumoasă,\nEchipa CazarePlus!");
        message.setFrom("mariusvalentin.popescu@ulbsibiu.ro");

        mailSender.send(message);
    }
}