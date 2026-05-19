import { base44 } from '@/api/base44Client';

/**
 * Get the store owner email for a given user.
 * Owners are their own store owner. Team members point to their owner.
 */
export function getStoreOwnerEmail(user) {
  if (!user) return null;
  if (user.role === 'owner' || user.role === 'user' || !user.store_owner_email) {
    return user.email;
  }
  return user.store_owner_email;
}

/**
 * Log an activity action automatically based on the current user.
 */
export async function logActivity(user, actionType, description, extra = {}) {
  if (!user) return;
  const storeOwnerEmail = getStoreOwnerEmail(user);
  try {
    await base44.entities.ActivityLog.create({
      store_owner_email: storeOwnerEmail,
      user_email: user.email,
      user_name: user.full_name || user.email,
      user_role: user.role || 'user',
      action_type: actionType,
      description,
      entity_id: extra.entity_id || null,
      entity_name: extra.entity_name || null,
      metadata: extra.metadata ? JSON.stringify(extra.metadata) : null,
    });
  } catch (e) {
    // Never block the main flow if logging fails
    console.warn('Activity log failed:', e);
  }
}