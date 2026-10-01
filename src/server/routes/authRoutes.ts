import { Router } from 'express';
import { getCurrentUserContext, switchActiveUser } from '../services/authService';
import {
  verifyFirebaseIdToken,
  resolveUserContext,
  checkEmailPasswordProviderStatus,
} from '../services/firebaseAuthService';
import { loadFirebaseConfig } from '../db/firestore';
import { db } from '../db/database';

export const authRouter = Router();

/**
 * Returns the currently active authentication context (user, profile, role, and Firebase user if signed in).
 */
authRouter.get('/me', (req, res) => {
  try {
    const ctx = getCurrentUserContext();
    res.json(ctx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint to verify a Firebase ID token and return user identity and RBAC role.
 */
authRouter.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    const token = idToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if (!token) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const verified = await verifyFirebaseIdToken(token);
    const ctx = resolveUserContext(verified.email, verified.uid, verified);

    res.json({
      success: true,
      verifiedToken: verified,
      context: ctx,
    });
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token: ' + err.message });
  }
});

/**
 * Returns public Firebase configuration so client SDK can initialize smoothly.
 */
authRouter.get('/config', (req, res) => {
  try {
    const cfg = loadFirebaseConfig();
    res.json({
      projectId: cfg.projectId,
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reports the active status of Firebase Authentication and the Email/Password sign-in provider.
 */
authRouter.get('/provider-status', async (req, res) => {
  try {
    const status = await checkEmailPasswordProviderStatus();
    const config = loadFirebaseConfig();
    res.json({
      firebaseAuthEnabled: true,
      projectId: config.projectId,
      authDomain: config.authDomain,
      emailPasswordProvider: status,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Development role switcher (backward compatible with local dev / tests).
 */
authRouter.post('/switch-role', (req, res) => {
  try {
    const { roleId, userId } = req.body;
    const target = userId || roleId;
    if (!target) {
      return res.status(400).json({ error: 'roleId or userId is required' });
    }
    const updatedCtx = switchActiveUser(target);
    res.json({
      success: true,
      current: updatedCtx,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Returns user list with their roles and profile names.
 */
authRouter.get('/users-list', (req, res) => {
  try {
    const users = db.getTable('users');
    const profiles = db.getTable('user_profiles');
    const roles = db.getTable('roles');

    const list = users.map((u) => {
      const p = profiles.find((prof) => prof.user_id === u.id);
      const r = roles.find((role) => role.id === u.role_id);
      return {
        id: u.id,
        email: u.email,
        roleId: u.role_id,
        roleName: r?.name || u.role_id,
        fullName: p?.full_name || u.email,
      };
    });

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
