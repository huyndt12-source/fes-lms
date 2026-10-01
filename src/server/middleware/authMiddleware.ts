import { Request, Response, NextFunction } from 'express';
import { authStorage, getFallbackUserContext } from '../services/authService';
import { verifyFirebaseIdToken, resolveUserContext } from '../services/firebaseAuthService';

/**
 * Express middleware that intercepts requests, checks for a Firebase ID token
 * in the Authorization header (format: Bearer <idToken>), validates it server-side,
 * resolves the matching LMS user & role context from Firestore, and injects it
 * into request-scoped async storage.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized: Bearer token is empty',
      });
    }

    try {
      // 1. Authoritatively verify the Firebase ID token
      const verifiedToken = await verifyFirebaseIdToken(token);

      // 2. Resolve matching Firestore LMS user, profile, and role
      const authCtx = resolveUserContext(verifiedToken.email, verifiedToken.uid, verifiedToken);

      // 3. Attach to request object and run within AsyncLocalStorage context
      (req as any).authContext = authCtx;
      (req as any).firebaseUser = verifiedToken;

      return authStorage.run(authCtx, () => {
        next();
      });
    } catch (err: any) {
      console.warn(`[authMiddleware] Token verification failed:`, err.message);
      return res.status(401).json({
        error: 'Unauthorized: Invalid Firebase ID token',
        message: err.message,
      });
    }
  }

  // For protected API endpoints (/api/admin and /api/student), require a valid Bearer token
  const url = req.originalUrl || req.url;
  const isProtected = url.startsWith('/api/admin') || url.startsWith('/api/student');
  if (isProtected) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required. Bearer token missing.',
    });
  }

  // If no Bearer token is provided on public/auth routes, run with fallback context (supporting dev tests/scripts)
  const fallbackCtx = getFallbackUserContext();
  (req as any).authContext = fallbackCtx;
  return authStorage.run(fallbackCtx, () => {
    next();
  });
}
