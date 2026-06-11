# 04 — Auth & Roles

> BetterAuth · Session Cookies · RBAC · Middleware

---

## 1. BetterAuth Setup

### Installation

```bash
npm install better-auth
```

### `src/lib/auth.ts` — Server config

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  emailAndPassword: {
    enabled: true,
    // Passwords hashed with bcrypt by default
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 8, // 8 hours
    },
  },

  // After sign-in hook: attach role from our users table
  hooks: {
    after: [
      {
        matcher: (ctx) => ctx.path === '/sign-in/email',
        handler: async (ctx) => {
          if (ctx.context.newSession) {
            const authId = ctx.context.newSession.user.id;

            const user = await db.query.users.findFirst({
              where: (u, { eq }) => eq(u.authId, authId),
            });

            if (user) {
              // Attach role to session object
              ctx.context.newSession.user.role = user.role;
              ctx.context.newSession.user.appUserId = user.id;

              // Update lastLoginAt
              await db
                .update(usersTable)
                .set({ lastLoginAt: new Date() })
                .where(eq(usersTable.authId, authId));
            }
          }
        },
      },
    ],
  },
});
```

### `src/lib/auth-client.ts` — Client config

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const { signIn, signOut, useSession } = authClient;
```

---

## 2. Auth Flow — Step by Step

```
1. User visits /login
   └── Fills email + password form

2. authClient.signIn.email({ email, password })
   └── POST /api/auth/sign-in/email

3. BetterAuth validates credentials
   └── Checks hashed password in its own user table

4. after hook fires:
   ├── Queries our users table by authId
   ├── Reads role (Admin | Accountant | Operator | Viewer)
   └── Attaches role + appUserId to session

5. BetterAuth creates session
   └── Sets HttpOnly, Secure, SameSite=Lax cookie

6. Browser stores cookie (not accessible via JS)

7. Every subsequent request:
   └── middleware.ts reads cookie → validates → extracts role
```

---

## 3. The Four Roles

| Role | Arabic | Scope |
|------|--------|-------|
| **Admin** | مدير النظام | Full access + user management + system config |
| **Accountant** | المحاسب | All accounting operations — journal entries, reports, AR/AP |
| **Operator** | المشغل | Daily operations — trips, fleet, expenses |
| **Viewer** | مراقب | Read-only access to most modules |

---

## 4. Role Permission Matrix

| Module / Action | Admin | Accountant | Operator | Viewer |
|-----------------|-------|------------|----------|--------|
| **Users & Roles** | ✅ Full | ❌ | ❌ | ❌ |
| **System Config** | ✅ Full | ❌ | ❌ | ❌ |
| **Vehicles** | ✅ Full | 👀 Read | ✅ Full | 👀 Read |
| **Drivers** | ✅ Full | 👀 Read | ✅ Full | 👀 Read |
| **Trips / Orders** | ✅ Full | 👀 Read | ✅ Full | 👀 Read |
| **Expenses** | ✅ Full | 👀 Read | ✅ Full | 👀 Read |
| **Customers** | ✅ Full | 👀 Read | ✅ Full | 👀 Read |
| **Chart of Accounts** | ✅ Full | ✅ Full | ❌ | ❌ |
| **Journal Entries (view)** | ✅ | ✅ | ❌ | ✅ |
| **Journal Entries (create)** | ❌ | ✅ | ❌ | ❌ |
| **Post / Reverse Entries** | ❌ | ✅ | ❌ | ❌ |
| **Fiscal Periods** | ✅ Full | ✅ Full | ❌ | ❌ |
| **Financial Reports** | ✅ | ✅ | 👀 Read | 👀 Read |
| **Audit Logs** | ✅ | ❌ | ❌ | ❌ |

> ✅ = Full CRUD · 👀 = Read only · ❌ = No access

---

## 5. Middleware — Route Protection

### `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/auth-helpers';

type Role = 'Admin' | 'Accountant' | 'Operator' | 'Viewer';

const roleRoutes: Record<string, Role[]> = {
  '/settings':   ['Admin'],
  '/accounting': ['Admin', 'Accountant'],
  '/ar-ap':      ['Admin', 'Accountant'],
  '/reports':    ['Admin', 'Accountant', 'Operator', 'Viewer'],
  '/trips':      ['Admin', 'Operator'],
  '/fleet':      ['Admin', 'Operator'],
  '/expenses':   ['Admin', 'Operator'],
};

export async function middleware(req: NextRequest) {
  const session = await getSession(req);

  // Not authenticated → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = session.user.role as Role;
  const pathname = req.nextUrl.pathname;

  // Check each protected route prefix
  for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|login|unauthorized|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 6. API Route — Role Check Helper

Every API route must validate the session AND the role. Use this helper:

### `src/lib/auth-helpers.ts`

```typescript
import { auth } from './auth';
import { NextRequest } from 'next/server';

type Role = 'Admin' | 'Accountant' | 'Operator' | 'Viewer';

export async function requireAuth(req: NextRequest, allowedRoles: Role[]) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }

  const role = session.user.role as Role;

  if (!allowedRoles.includes(role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { session, role, userId: session.user.appUserId };
}
```

### Usage in API Route

```typescript
// src/app/api/trips/route.ts
import { requireAuth } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['Admin', 'Operator']);
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  // auth.session, auth.role, auth.userId available here
  const body = await req.json();
  // ... rest of handler
}
```

---

## 7. `useSession` Hook — Client Side

```typescript
// src/hooks/use-session.ts
import { useSession as useBetterAuthSession } from '@/lib/auth-client';

export function useSession() {
  const { data: session, isPending } = useBetterAuthSession();

  return {
    user: session?.user,
    role: session?.user?.role as Role | undefined,
    isAdmin: session?.user?.role === 'Admin',
    isAccountant: session?.user?.role === 'Accountant',
    isOperator: session?.user?.role === 'Operator',
    isLoading: isPending,
  };
}
```

---

## 8. User Creation Flow

When Admin creates a new user:

```
1. POST /api/settings/users { name, email, password, role }
   │
2. API calls BetterAuth to create auth user:
   await auth.api.createUser({ email, password, name })
   → returns authId
   │
3. INSERT INTO users { authId, code, name, email, role, isActive: true }
   │
4. User can now log in and gets role from our users table
```

---

## 9. Session Token Security Notes

| Property | Value | Why |
|----------|-------|-----|
| Cookie type | HttpOnly | JS cannot read it — XSS safe |
| SameSite | Lax | CSRF protection |
| Secure | true (prod) | HTTPS only |
| Expiry | 8 hours | Auto-renews on activity |
| Storage | Server-side session table (BetterAuth manages) | Not JWT — can be revoked instantly |

---

## 10. Unauthorized Page

```typescript
// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground">
        You don't have permission to access this page.
      </p>
      <a href="/dashboard" className="text-primary underline">
        Go to Dashboard
      </a>
    </div>
  );
}
```
