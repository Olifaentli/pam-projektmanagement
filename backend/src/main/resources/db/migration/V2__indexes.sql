-- Indizes auf den Spalten, ueber die die Anwendung tatsaechlich filtert.
-- Da jede Abfrage mandantengebunden ist, fuehrt tenant_id jeden Index an.

CREATE INDEX idx_app_user_tenant   ON app_user (tenant_id);
CREATE INDEX idx_project_tenant    ON project (tenant_id, status);
CREATE INDEX idx_membership_tenant ON project_membership (tenant_id, user_id);
CREATE INDEX idx_membership_proj   ON project_membership (tenant_id, project_id);
CREATE INDEX idx_task_tenant_proj  ON task (tenant_id, project_id, status);
CREATE INDEX idx_task_assignee     ON task (tenant_id, assignee_id);
