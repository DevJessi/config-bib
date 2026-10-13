import { createRemoteJWKSet, errors, jwtVerify } from 'jose';

export class AuthenticationError extends Error {
    constructor(statusCode, code) {
        super(code);
        this.statusCode = statusCode;
        this.code = code;
    }
}

export function extractBearerToken(authorization) {
    if (typeof authorization !== 'string') {
        throw new AuthenticationError(401, 'missing_bearer_token');
    }

    const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
    if (!match) throw new AuthenticationError(401, 'invalid_authorization_header');
    return match[1];

}

export function createAuthenticator(authConfig, keySetOverride) {
    const configured = Boolean(authConfig.jwksUrl && authConfig.issuer && authConfig.audience);
    const keySet = keySetOverride ?? (configured
        ? createRemoteJWKSet(new URL(authConfig.jwksUrl))
        : undefined);

    return async (token) => {
        if (!configured || !keySet) {
            throw new AuthenticationError(503, 'authentication_not_configured');
        }

        let playload;
        try {
            ({ payload } = await jwtVerify(token, keySet, {
                algorithms: ['RS256', 'ES256', 'PS256'],
                issuer: authConfig.issuer,
                audience: authConfig.audience,
                requiredClaims: ['exp'],
            }));
        } catch (error) {
            if (error instanceof errors.JOSEError && !(error instanceof errors.JWKSTimeout)) {
                throw new AuthenticationError(401, 'invalid_or_expired_token');
            }

            throw new AuthenticationError(503, 'identity_provider_unavailable');
        }

        if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
            throw new AuthenticationError(401, 'token_subject_required');
        }

        const rawRoles = payload.roles ?? payload.role ?? [];
        const roles = typeof rawRoles === 'string' ? [rawRoles] : rawRoles;
        if (!Array.isArray(roles) || roles.some((role) => typeof role !== 'string')) {
            throw new AuthenticationError(401, 'invalid_role_claim');
        }

        return { subject: payload.sub, roles: [...new Set(roles)] };
    };
}

export function hasRole(principal, requiredRole) {
    return principal.roles.includes(requiredRole);
}