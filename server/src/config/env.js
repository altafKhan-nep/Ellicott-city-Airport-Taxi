/**
 * Fails fast at boot when a production deployment is missing critical config or
 * is still using placeholder secrets. Running with a weak JWT secret lets anyone
 * mint an admin token, so this is a hard stop rather than a warning.
 */

// Unmistakable "someone forgot to set this" markers. Matched as substrings of
// the normalised value so `change-me-access-secret` is caught, while a real
// random secret that merely starts with similar letters is not.
const PLACEHOLDER_TOKENS = [
  'changeme', 'change-me', 'change_me', 'your-secret', 'your_secret', 'yoursecret',
  'replaceme', 'replace-me', 'replace_me', 'placeholder', 'example-secret',
  'secretsecret', 'dummytoken', 'dummy-secret', 'notasecret', 'topsecret',
];

const isWeakSecret = (value) => {
  if (typeof value !== 'string') return true;
  const v = value.trim();
  // Short secrets are brute-forceable regardless of their content.
  if (v.length < 32) return true;
  const norm = v.toLowerCase();
  return PLACEHOLDER_TOKENS.some((token) => norm.includes(token));
};

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]} human-readable problems (empty when healthy)
 */
export const validateEnv = (env = process.env) => {
  const problems = [];
  const isProd = env.NODE_ENV === 'production';

  if (!env.MONGO_URI) {
    problems.push('MONGO_URI is required');
  } else if (isProd && env.MONGO_URI.includes('127.0.0.1') && !env.MONGO_URI.includes('localhost')) {
    problems.push('MONGO_URI still points at localhost in production');
  }

  if (!env.JWT_ACCESS_SECRET) {
    problems.push('JWT_ACCESS_SECRET is required');
  } else if (isProd && isWeakSecret(env.JWT_ACCESS_SECRET)) {
    problems.push('JWT_ACCESS_SECRET is a placeholder or shorter than 32 chars');
  }

  if (isProd && env.EXPOSE_DEV_TOKENS === 'true') {
    problems.push('EXPOSE_DEV_TOKENS must be false (unset) in production — it returns password-reset tokens in API responses');
  }

  if (isProd && env.CLIENT_ORIGIN === '*') {
    problems.push('CLIENT_ORIGIN must be a specific origin, not *');
  }

  // Rate limits that have been raised for local testing must not ship.
  if (isProd) {
    const login = Number(env.RATE_LIMIT_LOGIN);
    if (Number.isFinite(login) && login > 20) {
      problems.push(`RATE_LIMIT_LOGIN=${login} is effectively disabled for production`);
    }
  }

  return problems;
};

/** Prints problems and exits(1) when the environment is unsafe for production. */
export const assertEnv = (env = process.env) => {
  const problems = validateEnv(env);
  if (!problems.length) return;
  console.error('\nRefusing to start — unsafe environment configuration:');
  for (const p of problems) console.error(`  • ${p}`);
  if (env.NODE_ENV === 'production') {
    console.error('\nSee server/.env.example for the expected values.\n');
    process.exit(1);
  }
  console.warn('(non-production: continuing with warnings)\n');
};
