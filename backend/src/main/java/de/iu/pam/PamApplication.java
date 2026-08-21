package de.iu.pam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Einstiegspunkt der Anwendung. Spring Boot startet hier den eingebetteten
 * Webserver und den Anwendungskontext (vgl. Lektion 6.2 des Kursskripts).
 */
@SpringBootApplication
public class PamApplication {

    public static void main(String[] args) {
        SpringApplication.run(PamApplication.class, args);
    }
}
