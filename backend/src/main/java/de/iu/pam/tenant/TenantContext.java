package de.iu.pam.tenant;

/**
 * Haelt die Mandanten-ID des aktuell verarbeiteten Requests.
 *
 * <p>Die Anwendung ist mandantenfaehig vorbereitet: alle fachlichen Tabellen
 * tragen eine {@code tenant_id}, und saemtliche Datenbankzugriffe werden ueber
 * diesen Kontext auf genau einen Mandanten eingeschraenkt. Der Wert wird pro
 * Request vom {@link TenantContextFilter} gesetzt und danach wieder geleert.</p>
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenantId(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static Long getTenantId() {
        return CURRENT_TENANT.get();
    }

    /**
     * @return die Mandanten-ID des aktuellen Requests
     * @throws IllegalStateException wenn kein Mandant gesetzt ist. Das ist ein
     *         Programmierfehler und darf nie zu einem stillen Zugriff auf alle
     *         Mandanten fuehren.
     */
    public static Long requireTenantId() {
        Long tenantId = CURRENT_TENANT.get();
        if (tenantId == null) {
            throw new IllegalStateException("Kein Mandantenkontext gesetzt");
        }
        return tenantId;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
