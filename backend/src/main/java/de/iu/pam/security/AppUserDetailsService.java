package de.iu.pam.security;

import de.iu.pam.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Laedt Benutzerkonten fuer die Authentifizierung.
 *
 * <p>Die Suche erfolgt hier bewusst mandantenuebergreifend ueber die E-Mail:
 * Zum Anmeldezeitpunkt ist noch kein Mandant bekannt - er ergibt sich erst aus
 * dem gefundenen Konto. Die E-Mail ist deshalb global eindeutig.</p>
 */
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .map(AppUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Unbekannte Anmeldedaten"));
    }
}
