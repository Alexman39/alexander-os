"use client";

import { createAuthClient } from "better-auth/react";

/** Browser-side auth calls (sign in with GitHub, sign out). Same-origin, so no baseURL needed. */
export const authClient = createAuthClient();
