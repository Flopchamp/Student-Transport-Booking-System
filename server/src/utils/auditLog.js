const { AuditLog } = require('../models');

/**
 * Log an admin/system action to the audit log.
 *
 * @param {Object} params
 * @param {string} params.userId      - ID of the user performing the action.
 * @param {string} params.action      - Action identifier, e.g. 'booking.status_change'.
 * @param {string} params.entityType  - Entity type, e.g. 'booking', 'payment', 'user'.
 * @param {string} [params.entityId]  - ID of the affected entity.
 * @param {string} params.description - Human-readable description.
 * @param {Object} [params.metadata]  - Extra context (old/new values, etc.).
 * @param {string} [params.ipAddress] - Request IP address.
 */
const logAudit = async ({ userId, action, entityType, entityId, description, metadata, ipAddress }) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      description,
      metadata: metadata || null,
      ip_address: ipAddress || null,
    });
  } catch (err) {
    // Never let audit logging break the request
    console.error('[AuditLog] Failed to write audit log:', err.message);
  }
};

module.exports = logAudit;
