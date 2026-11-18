/** Shared by playwright.config.ts and the auth setup/teardown. */
export const PORT = Number(process.env.PORT ?? 3100);
/** Fake owner ID for the test server only — never the real owner's GitHub ID. */
export const E2E_OWNER_GITHUB_ID = "1000000001";
/** Reserved test domain so cleanup can never touch a real account. */
export const E2E_EMAIL_DOMAIN = "e2e.alexander-os.test";
export const OWNER_STATE = "tests/.auth/owner.json";
/** A second owner session, used only by the sign-out test so it cannot break others. */
export const OWNER_SIGNOUT_STATE = "tests/.auth/owner-signout.json";
export const INTRUDER_STATE = "tests/.auth/intruder.json";
