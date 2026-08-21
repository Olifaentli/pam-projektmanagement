package de.iu.pam.security;

import de.iu.pam.security.dto.CurrentUserResponse;
import de.iu.pam.security.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * An- und Abmeldung (US-7).
 *
 * <p>Die Anmeldung laeuft nicht ueber Spring Securitys Formular-Filter, sondern
 * ueber einen eigenen Endpunkt: eine Single-Page-Anwendung erwartet JSON und
 * Statuscodes, keine HTML-Weiterleitungen.</p>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<CurrentUserResponse> login(@Valid @RequestBody LoginRequest request,
                                                     HttpServletRequest httpRequest,
                                                     HttpServletResponse httpResponse) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            request.email().trim().toLowerCase(), request.password()));
        } catch (BadCredentialsException ex) {
            // Bewusst dieselbe Meldung fuer unbekanntes Konto und falsches
            // Passwort, damit die API keine gueltigen E-Mail-Adressen verraet.
            throw new BadCredentialsException("E-Mail oder Passwort ist falsch");
        }

        // Sitzungs-ID nach erfolgreicher Anmeldung erneuern (Session Fixation).
        HttpSession existing = httpRequest.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }
        httpRequest.getSession(true);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(CurrentUserResponse.from(principal));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    /** Liefert den angemeldeten Benutzer, damit das Frontend nach einem Reload den Zustand wiederherstellen kann. */
    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal AppUserDetails principal) {
        return CurrentUserResponse.from(principal);
    }

    /**
     * Setzt das CSRF-Cookie, bevor das Frontend seinen ersten schreibenden
     * Aufruf macht. Ohne diesen Abruf haette der Login-POST noch kein Token.
     */
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf() {
        return ResponseEntity.noContent().build();
    }
}
