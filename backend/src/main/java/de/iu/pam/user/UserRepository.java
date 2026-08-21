package de.iu.pam.user;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Datenzugriff auf Benutzerkonten.
 *
 * <p>Bis auf {@link #findByEmail(String)} - das fuer die Anmeldung noetig ist,
 * bevor ein Mandantenkontext existiert - ist jede Methode mandantengebunden.</p>
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndTenantId(Long id, Long tenantId);

    List<User> findAllByTenantIdOrderByLastNameAscFirstNameAsc(Long tenantId);

    List<User> findAllByTenantIdAndIdIn(Long tenantId, Collection<Long> ids);

    boolean existsByEmail(String email);
}
