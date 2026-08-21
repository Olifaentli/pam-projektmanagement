package de.iu.pam.tenant;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;

/**
 * Basisklasse aller mandantengebundenen Entitaeten.
 *
 * <p>Die {@code tenantId} wird beim Anlegen automatisch aus dem
 * {@link TenantContext} gestempelt, damit sie nicht an jeder Aufrufstelle
 * einzeln gesetzt werden muss und nicht vergessen werden kann.</p>
 */
@MappedSuperclass
public abstract class BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;

    @PrePersist
    void stampTenant() {
        if (tenantId == null) {
            tenantId = TenantContext.requireTenantId();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }
}
