package de.iu.pam.tenant;

import de.iu.pam.security.AppUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Setzt den Mandantenkontext fuer die Dauer eines Requests.
 *
 * <p>Der Mandant wird nicht aus Parametern oder Headern gelesen - das waere
 * manipulierbar - sondern ausschliesslich aus dem bereits authentifizierten
 * Principal abgeleitet. Der Filter laeuft daher nach der Spring-Security-Kette.</p>
 */
@Component
@Order(Integer.MAX_VALUE - 100)
public class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof AppUserDetails principal) {
                TenantContext.setTenantId(principal.getTenantId());
            }
            filterChain.doFilter(request, response);
        } finally {
            // Zwingend: Tomcat verwendet Threads wieder. Ohne dieses clear()
            // koennte ein Folge-Request den Mandanten seines Vorgaengers erben.
            TenantContext.clear();
        }
    }
}
