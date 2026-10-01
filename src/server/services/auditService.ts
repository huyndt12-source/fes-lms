import { db } from '../db/database';
import { AuditLog } from '../db/schema';

export function recordAuditLog(params: {
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}): AuditLog {
  const log: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actor_id: params.actor_id,
    actor_name: params.actor_name,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    old_values: params.old_values,
    new_values: params.new_values,
    ip_address: params.ip_address,
    user_agent: params.user_agent,
    created_at: new Date().toISOString(),
  };

  return db.insert('audit_logs', log);
}
