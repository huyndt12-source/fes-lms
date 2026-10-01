import { AsyncLocalStorage } from 'node:async_hooks';
import { db } from '../db/database';
import { Role, User, UserProfile } from '../db/schema';

// Active session store in memory for fallback dev/CLI execution
let currentActiveUserId = 'usr-admin-01'; // Default starts as admin for full access, easily switchable

export interface AuthContext {
  user: User;
  profile: UserProfile;
  role: Role;
  firebaseUser?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    display_name?: string;
    provider_id?: string;
  };
}

/**
 * Request-scoped storage for authenticated user contexts (populated by authMiddleware from verified Firebase ID tokens).
 */
export const authStorage = new AsyncLocalStorage<AuthContext>();

export function getFallbackUserContext(): AuthContext {
  let user = db.findById('users', currentActiveUserId) as User | undefined;
  if (!user) {
    user = db.getTable('users')[0];
    if (user) currentActiveUserId = user.id;
  }

  if (!user) {
    throw new Error('No users found in database');
  }

  const profile = db.findOne('user_profiles', (p) => p.user_id === user!.id) as UserProfile;
  const role = db.findById('roles', user.role_id) as Role;

  return { user, profile, role };
}

export function getCurrentUserContext(): AuthContext {
  const requestScopedContext = authStorage.getStore();
  if (requestScopedContext) {
    return requestScopedContext;
  }
  return getFallbackUserContext();
}

export function switchActiveUser(userIdOrRole: string): AuthContext {
  let targetUser = db.findById('users', userIdOrRole) as User | undefined;
  if (!targetUser) {
    targetUser = db.findOne('users', (u) => u.role_id === userIdOrRole);
  }

  if (!targetUser) {
    throw new Error(`Cannot switch to user or role: ${userIdOrRole}`);
  }

  currentActiveUserId = targetUser.id;
  return getCurrentUserContext();
}

export function requireRole(allowedRoles: Role['id'][]) {
  return (req: any, res: any, next: any) => {
    try {
      const { role } = getCurrentUserContext();
      if (!allowedRoles.includes(role.id)) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient privileges',
          userRole: role.id,
          requiredRoles: allowedRoles,
        });
      }
      next();
    } catch (err: any) {
      return res.status(401).json({ error: 'Unauthorized: ' + err.message });
    }
  };
}
