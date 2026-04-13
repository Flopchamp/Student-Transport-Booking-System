const { Setting } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { logAudit } = require('../utils/auditLog');

/**
 * GET /settings
 * Get all settings, optionally filtered by category
 */
exports.getSettings = catchAsync(async (req, res) => {
  const where = {};
  if (req.query.category) {
    where.category = req.query.category;
  }

  const settings = await Setting.findAll({
    where,
    order: [['category', 'ASC'], ['key', 'ASC']],
  });

  // Group settings by category for easier frontend consumption
  const grouped = {};
  settings.forEach((s) => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push({
      id: s.id,
      key: s.key,
      value: s.value,
      type: s.type,
      category: s.category,
      label: s.label,
      description: s.description,
    });
  });

  ApiResponse.success(res, grouped, 'Settings fetched');
});

/**
 * PUT /settings
 * Bulk update settings. Body: { settings: { key: value, key2: value2, ... } }
 */
exports.updateSettings = catchAsync(async (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return ApiResponse.error(res, 'Settings object is required', 400);
  }

  const updated = [];
  for (const [key, value] of Object.entries(settings)) {
    const setting = await Setting.findOne({ where: { key } });
    if (setting) {
      const oldValue = setting.value;
      setting.value = String(value);
      await setting.save();
      updated.push(key);

      logAudit({
        userId: req.user.id,
        action: 'UPDATE_SETTING',
        entityType: 'Setting',
        entityId: setting.id,
        description: `Updated setting "${key}" from "${oldValue}" to "${value}"`,
        metadata: { key, oldValue, newValue: String(value) },
        ipAddress: req.ip,
      });
    }
  }

  ApiResponse.success(res, { updated }, `${updated.length} settings updated`);
});

/**
 * POST /settings/seed
 * Seed default settings (admin only, idempotent)
 */
exports.seedSettings = catchAsync(async (req, res) => {
  await Setting.seedDefaults();
  ApiResponse.success(res, null, 'Default settings seeded');
});

/**
 * GET /settings/public
 * Get non-sensitive settings for unauthenticated access (site name, maintenance mode)
 */
exports.getPublicSettings = catchAsync(async (req, res) => {
  const publicKeys = ['site_name', 'support_email', 'support_phone', 'maintenance_mode', 'currency'];
  const settings = await Setting.findAll({ where: { key: publicKeys } });

  const result = {};
  settings.forEach((s) => {
    result[s.key] = s.type === 'boolean' ? s.value === 'true' : s.type === 'number' ? Number(s.value) : s.value;
  });

  ApiResponse.success(res, result, 'Public settings');
});
