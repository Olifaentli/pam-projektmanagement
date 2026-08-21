package de.iu.pam.security;

import de.iu.pam.user.Role;
import de.iu.pam.user.User;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Adapter zwischen der fachlichen Entitaet {@link User} und Spring Security.
 *
 * <p>Traegt zusaetzlich die Mandanten-ID, damit der Mandantenkontext pro Request
 * ohne erneuten Datenbankzugriff gesetzt werden kann.</p>
 */
public class AppUserDetails implements UserDetails {

    private final Long userId;
    private final Long tenantId;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final boolean enabled;
    private final Set<Role> roles;

    public AppUserDetails(User user) {
        this.userId = user.getId();
        this.tenantId = user.getTenantId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.fullName = user.getFullName();
        this.enabled = user.isEnabled();
        this.roles = Set.copyOf(user.getRoles());
    }

    public Long getUserId() {
        return userId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public String getFullName() {
        return fullName;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public boolean hasRole(Role role) {
        return roles.contains(role);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role.authority()))
                .toList();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    /** Hilfsmethode fuer Tests und Controller. */
    public static List<String> authorityNames(Set<Role> roles) {
        return roles.stream().map(Role::authority).toList();
    }
}
