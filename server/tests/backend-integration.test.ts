/**
 * Backend Integration Test Script
 * Comprehensive tests for all API endpoints, edge cases, and error handling.
 * Run: npx tsx server/tests/backend-integration.test.ts
 */

// Ensure this file is treated as a module
export {};

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const API = `${BASE_URL}/api`;

// Test state
let authToken = "";
let testUserId = "";
let testPostId = "";
let testRemedyId = "";
let testResourceId = "";
const TIMESTAMP = Date.now();
const TEST_EMAIL = `integ-${TIMESTAMP}@redpetal-test.app`;
const TEST_PASSWORD = "IntegTest@2026!";
const TEST_USERNAME = `integ_${TIMESTAMP}`;

// Colored output
const green = (s: string) => `\x1b[32m✅ ${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m❌ ${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m⚠️  ${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

let passed = 0;
let failed = 0;
let skipped = 0;

async function apiCall(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  token?: string
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  return { ok: res.ok, status: res.status, data };
}

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(green(name));
    passed++;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(red(`${name} — ${message}`));
    failed++;
  }
}

function skip(name: string, reason: string) {
  console.log(yellow(`${name} — ${reason}`));
  skipped++;
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// ─── Test Suites ─────────────────────────────────────

async function runTests() {
  console.log(bold("\n🧪 Red Petal Backend Integration Tests\n"));
  console.log(dim(`Target: ${BASE_URL}`));
  console.log(dim(`Timestamp: ${new Date().toISOString()}\n`));

  // ═══ HEALTH & INFRA ═══════════════════════════════
  console.log(bold("\n─── Health & Infrastructure ───\n"));

  await test("Health check returns OK with DB status", async () => {
    const r = await apiCall("GET", `${BASE_URL}/health`);
    assert(r.ok, `Status ${r.status}`);
    assert(r.data.status === "OK" || r.data.status === "DEGRADED", "Invalid status");
    assert("database" in r.data, "Missing database health info");
  });

  await test("Root endpoint returns API info", async () => {
    const r = await apiCall("GET", `${BASE_URL}/`);
    assert(r.ok, `Status ${r.status}`);
    assert("endpoints" in r.data, "Missing endpoints listing");
  });

  await test("404 for unknown endpoint", async () => {
    const r = await apiCall("GET", "/this-does-not-exist");
    assert(r.status === 404, `Expected 404, got ${r.status}`);
  });

  // ═══ AUTH ═════════════════════════════════════════
  console.log(bold("\n─── Authentication ───\n"));

  await test("Register fails without required fields", async () => {
    const r = await apiCall("POST", "/auth/register", { email: TEST_EMAIL });
    assert(!r.ok, "Should reject incomplete registration");
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  await test("Register succeeds with valid data", async () => {
    const r = await apiCall("POST", "/auth/register", {
      email: TEST_EMAIL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
      first_name: "Integration",
      last_name: "Test",
    });
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(typeof r.data.token === "string" && r.data.token.length > 0, "Missing token");
    authToken = r.data.token as string;
    testUserId = (r.data.user as Record<string, unknown>)?.id as string || "";
  });

  await test("Duplicate registration fails with 409", async () => {
    const r = await apiCall("POST", "/auth/register", {
      email: TEST_EMAIL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });
    assert(r.status === 409, `Expected 409, got ${r.status}`);
  });

  await test("Login fails with wrong password", async () => {
    const r = await apiCall("POST", "/auth/login", {
      email: TEST_EMAIL,
      password: "WrongPassword",
    });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test("Login succeeds with correct credentials", async () => {
    const r = await apiCall("POST", "/auth/login", {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(typeof r.data.token === "string", "Missing token");
    authToken = r.data.token as string;
  });

  await test("Protected route rejects without token", async () => {
    const r = await apiCall("GET", "/auth/profile");
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test("Protected route rejects invalid token", async () => {
    const r = await apiCall("GET", "/auth/profile", undefined, "invalid.token.here");
    assert(r.status === 403, `Expected 403, got ${r.status}`);
  });

  await test("Profile fetch succeeds with valid token", async () => {
    const r = await apiCall("GET", "/auth/profile", undefined, authToken);
    assert(r.ok, `Status ${r.status}`);
    const user = r.data.user as Record<string, unknown>;
    assert(user?.email === TEST_EMAIL, "Email mismatch");
  });

  await test("Profile update succeeds", async () => {
    const r = await apiCall(
      "PUT",
      "/auth/profile",
      { first_name: "Updated", last_name: "Tester" },
      authToken
    );
    assert(r.ok, `Status ${r.status}`);
  });

  // ═══ DAILY LOGS ═══════════════════════════════════
  console.log(bold("\n─── Daily Logs ───\n"));

  const today = new Date().toISOString().split("T")[0];

  await test("Create daily log", async () => {
    if (!authToken) return skip("Create daily log", "No auth token");
    const r = await apiCall(
      "POST",
      "/daily-logs",
      {
        date: today,
        flow: "medium",
        mood: "happy",
        skin: ["clear", "glowing"],
        notes: "Integration test log",
      },
      authToken
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
  });

  await test("Get daily log by date", async () => {
    if (!authToken) return skip("Get daily log", "No auth token");
    const r = await apiCall("GET", `/daily-logs?date=${today}`, undefined, authToken);
    assert(r.ok, `Status ${r.status}`);
    assert(r.data.flow === "medium", `Flow mismatch: ${r.data.flow}`);
  });

  await test("Upsert daily log (update same date)", async () => {
    if (!authToken) return skip("Upsert daily log", "No auth token");
    const r = await apiCall(
      "POST",
      "/daily-logs",
      { date: today, flow: "heavy", mood: "tired", skin: ["dry"] },
      authToken
    );
    assert(r.ok, `Status ${r.status}`);
    assert(r.data.flow === "heavy", "Upsert did not update flow");
  });

  await test("Get daily logs range", async () => {
    if (!authToken) return skip("Get range", "No auth token");
    const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const r = await apiCall(
      "GET",
      `/daily-logs/range?start=${start}&end=${today}`,
      undefined,
      authToken
    );
    assert(r.ok, `Status ${r.status}`);
    assert(Array.isArray(r.data), "Expected array");
  });

  // ═══ PERIODS ══════════════════════════════════════
  console.log(bold("\n─── Period Tracking ───\n"));

  await test("Log period", async () => {
    if (!authToken) return skip("Log period", "No auth token");
    const r = await apiCall(
      "POST",
      "/periods/log",
      { period_start_date: today, notes: "Test period" },
      authToken
    );
    assert(r.ok || r.status === 409, `Unexpected status ${r.status}`);
  });

  await test("Get period predictions", async () => {
    if (!authToken) return skip("Predictions", "No auth token");
    const r = await apiCall("GET", "/periods/predictions", undefined, authToken);
    assert(r.ok || r.status === 404, `Unexpected status ${r.status}`);
  });

  await test("Get period history", async () => {
    if (!authToken) return skip("History", "No auth token");
    const r = await apiCall("GET", "/periods/history?limit=5&offset=0", undefined, authToken);
    assert(r.ok, `Status ${r.status}`);
  });

  await test("Log symptom", async () => {
    if (!authToken) return skip("Log symptom", "No auth token");
    const r = await apiCall(
      "POST",
      "/periods/symptoms",
      { date: today, symptom_type: "cramp", severity: 3 },
      authToken
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
  });

  await test("Log mood", async () => {
    if (!authToken) return skip("Log mood", "No auth token");
    const r = await apiCall(
      "POST",
      "/periods/moods",
      { date: today, mood_type: "calm", intensity: 4 },
      authToken
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
  });

  // ═══ COMMUNITY ════════════════════════════════════
  console.log(bold("\n─── Community ───\n"));

  await test("Create community post", async () => {
    if (!authToken) return skip("Create post", "No auth token");
    const r = await apiCall(
      "POST",
      "/community/posts",
      {
        title: "Integration Test Post",
        content: "Testing the backend integration thoroughly!",
        category: "support",
      },
      authToken
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    testPostId = ((r.data.post as Record<string, unknown>)?.id as string) || "";
    assert(testPostId.length > 0, "Missing post ID");
  });

  await test("Create post fails with empty content", async () => {
    if (!authToken) return skip("Empty content", "No auth token");
    const r = await apiCall(
      "POST",
      "/community/posts",
      { content: "" },
      authToken
    );
    assert(!r.ok, "Should reject empty content");
  });

  await test("Get all posts (public)", async () => {
    const r = await apiCall("GET", "/community/posts");
    assert(r.ok, `Status ${r.status}`);
    assert(Array.isArray(r.data.posts), "Expected posts array");
  });

  await test("Get single post", async () => {
    if (!testPostId) return skip("Get post", "No test post");
    const r = await apiCall("GET", `/community/posts/${testPostId}`);
    assert(r.ok, `Status ${r.status}`);
  });

  await test("Like post (toggle on)", async () => {
    if (!authToken || !testPostId) return skip("Like post", "Missing auth or post");
    const r = await apiCall("POST", `/community/posts/${testPostId}/like`, {}, authToken);
    assert(r.ok, `Status ${r.status}`);
  });

  await test("Add comment to post", async () => {
    if (!authToken || !testPostId) return skip("Add comment", "Missing auth or post");
    const r = await apiCall(
      "POST",
      `/community/posts/${testPostId}/comments`,
      { content: "Great integration test!" },
      authToken
    );
    assert(r.ok, `Status ${r.status}`);
  });

  await test("Get comments for post", async () => {
    if (!testPostId) return skip("Get comments", "No test post");
    const r = await apiCall("GET", `/community/posts/${testPostId}/comments`);
    assert(r.ok, `Status ${r.status}`);
  });

  // ═══ REMEDIES ═════════════════════════════════════
  console.log(bold("\n─── Remedies ───\n"));

  await test("Create remedy", async () => {
    if (!authToken) return skip("Create remedy", "No auth token");
    const r = await apiCall(
      "POST",
      "/remedies",
      {
        title: "Ginger Tea for Cramps",
        description: "Warm ginger tea helps reduce period cramps naturally.",
        ingredients: ["ginger", "honey", "water", "lemon"],
        instructions: "Boil water, add freshly grated ginger, steep 10 min, add honey.",
        category: "cramps",
      },
      authToken
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    testRemedyId = ((r.data.remedy as Record<string, unknown>)?.id as string) || "";
  });

  await test("Get remedies list", async () => {
    const r = await apiCall("GET", "/remedies");
    assert(r.ok, `Status ${r.status}`);
  });

  await test("Rate a remedy", async () => {
    if (!authToken || !testRemedyId) return skip("Rate remedy", "Missing auth or remedy");
    const r = await apiCall(
      "POST",
      `/remedies/${testRemedyId}/rate`,
      { rating: 5, review: "Works great!" },
      authToken
    );
    assert(r.ok, `Status ${r.status}`);
  });

  // ═══ RESOURCES ════════════════════════════════════
  console.log(bold("\n─── Resources ───\n"));

  await test("Create resource", async () => {
    if (!authToken) return skip("Create resource", "No auth token");
    const r = await apiCall(
      "POST",
      "/resources",
      {
        title: "Understanding Your Cycle",
        description: "A comprehensive guide to menstrual health.",
        url: "https://example.com/cycle-guide",
        resource_type: "article",
        category: "education",
      },
      authToken
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    testResourceId = ((r.data.resource as Record<string, unknown>)?.id as string) || "";
  });

  await test("Get resources list", async () => {
    const r = await apiCall("GET", "/resources");
    assert(r.ok, `Status ${r.status}`);
  });

  // ═══ REPORTS ══════════════════════════════════════
  console.log(bold("\n─── Reports ───\n"));

  await test("Get monthly report", async () => {
    if (!authToken) return skip("Monthly report", "No auth token");
    const now = new Date();
    const r = await apiCall(
      "GET",
      `/reports/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
      undefined,
      authToken
    );
    assert(r.ok, `Status ${r.status}`);
    assert("month" in r.data, "Missing 'month' field");
    assert("dailyLogs" in r.data, "Missing dailyLogs");
    assert("symptoms" in r.data, "Missing symptoms");
    assert("moods" in r.data, "Missing moods");
  });

  // ═══ CLEANUP ══════════════════════════════════════
  console.log(bold("\n─── Cleanup ───\n"));

  // Delete test post (cascades to comments/likes)
  if (testPostId && authToken) {
    await apiCall("DELETE", `/community/posts/${testPostId}`, undefined, authToken);
    console.log(dim("  Cleaned up test post"));
  }

  // Delete test remedy
  if (testRemedyId && authToken) {
    await apiCall("DELETE", `/remedies/${testRemedyId}`, undefined, authToken);
    console.log(dim("  Cleaned up test remedy"));
  }

  // Delete test resource
  if (testResourceId && authToken) {
    await apiCall("DELETE", `/resources/${testResourceId}`, undefined, authToken);
    console.log(dim("  Cleaned up test resource"));
  }

  // ═══ SUMMARY ══════════════════════════════════════
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(bold("  Backend Integration Test Results\n"));
  console.log(`  ${green(`Passed: ${passed}`)}`);
  if (failed > 0) console.log(`  ${red(`Failed: ${failed}`)}`);
  if (skipped > 0) console.log(`  ${yellow(`Skipped: ${skipped}`)}`);
  console.log(`  Total:  ${passed + failed + skipped}`);
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
