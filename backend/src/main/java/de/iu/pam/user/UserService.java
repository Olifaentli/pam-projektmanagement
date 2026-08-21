package de.iu.pam.user;

import de.iu.pam.common.ConflictException;
import de.iu.pam.common.NotFoundException;
import de.iu.pam.project.ProjectMembershipRepository;
import de.iu.pam.tenant.TenantContext;
import de.iu.pam.user.dto.CreateUserRequest;
import de.iu.pam.user.dto.UpdateRolesRequest;
import de.iu.pam.user.dto.UpdateUserRequest;
import de.iu.pam.user.dto.UserResponse;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Geschaeftslogik der Benutzerverwaltung (US-1).
 *
 * <p>Alle Zugriffe sind ueber {@link TenantContext} auf den Mandanten des
 * angemeldeten Benutzers eingeschraenkt. Entitaeten verlassen diese Schicht
 * nicht - nach aussen gehen ausschliesslich DTOs.</p>
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProjectMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       ProjectMembershipRepository membershipRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository
                .findAllByTenantIdOrderByLastNameAscFirstNameAsc(TenantContext.requireTenantId())
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(load(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = normalise(request.email());
        // Die E-Mail ist global eindeutig, weil die Anmeldung ohne bekannten
        // Mandanten stattfindet und das Konto eindeutig auffinden muss.
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Es existiert bereits ein Konto mit dieser E-Mail-Adresse");
        }
        User user = new User(
                email,
                passwordEncoder.encode(request.password()),
                request.firstName().trim(),
                request.lastName().trim(),
                request.roles());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = load(id);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEnabled(request.enabled());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateRoles(Long id, UpdateRolesRequest request) {
        User user = load(id);
        // Ohne diese Pruefung koennte sich die letzte Administration selbst
        // die Rechte entziehen und der Mandant waere nicht mehr verwaltbar.
        if (user.hasRole(Role.ADMIN) && !request.roles().contains(Role.ADMIN) && isLastAdmin(user)) {
            throw new ConflictException("Der letzte Administrator kann seine Rolle nicht abgeben");
        }
        user.setRoles(request.roles());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = load(id);
        if (user.hasRole(Role.ADMIN) && isLastAdmin(user)) {
            throw new ConflictException("Der letzte Administrator kann nicht gelöscht werden");
        }
        membershipRepository.deleteAllByTenantIdAndUserId(TenantContext.requireTenantId(), id);
        userRepository.delete(user);
    }

    private boolean isLastAdmin(User candidate) {
        return userRepository
                .findAllByTenantIdOrderByLastNameAscFirstNameAsc(TenantContext.requireTenantId())
                .stream()
                .noneMatch(other -> other.hasRole(Role.ADMIN) && !other.getId().equals(candidate.getId()));
    }

    private User load(Long id) {
        return userRepository.findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> NotFoundException.of("Benutzer", id));
    }

    private String normalise(String email) {
        return email.trim().toLowerCase();
    }
}
