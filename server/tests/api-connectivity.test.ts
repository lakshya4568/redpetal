/**
 * API Connectivity Test Script
 * Tests all backend endpoints sequentially using fetch.
 * Run: npx tsx server/tests/api-connectivity.test.ts
 *   or: bun run server/tests/api-connectivity.test.ts
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const API = `${BASE_URL}/api`;

// Test state
let authToken = "";
let testUserId = "";
let testPostId = "";
let testCommentId = "";
const TEST_EMAIL = `test-${Date.now()}@redpetal-test.app`;
const TEST_PASSWORD = "TestPass123!";
const TEST_USERNAME = `tester_${Date.now()}`;

// Colored output
const green = (s: string) => `\x1b[32m✅ ${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m❌ ${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m⚠️  ${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;
let skipped = 0;

async function apiCall(
  method: string,
  path: string,
  body?: any,
  token?: string,
): Promise<{ ok: boolean; status: number; data: any }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${path.startsWith("http") ? path : API + path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any;
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
  } catch (err: any) {
    console.log(red(`${name} — ${err.message}`));
    failed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// ─── Tests ───────────────────────────────────────────────

async function runTests() {
  console.log(bold("\n🔬 Red Petal API Connectivity Tests\n"));
  console.log(cyan(`Target: ${BASE_URL}\n`));

  // 1. Health check
  await test("1. GET /health", async () => {
    const r = await apiCall("GET", `${BASE_URL}/health`);
    assert(r.ok, `Status ${r.status}`);
    assert(r.data.status === "OK", `Expected status OK, got ${r.data.status}`);
  });

  // 2. Register
  await test("2. POST /api/auth/register", async () => {
    const r = await apiCall("POST", "/auth/register", {
      email: TEST_EMAIL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
      first_name: "Test",
      last_name: "User",
    });
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(!!r.data.token, "Missing token in response");
    authToken = r.data.token;
    testUserId = r.data.user?.id || "";
  });

  // 3. Login
  await test("3. POST /api/auth/login", async () => {
    const r = await apiCall("POST", "/auth/login", {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(!!r.data.token, "Missing token");
    authToken = r.data.token; // Use fresh token
  });

  // 4. Get profile
  await test("4. GET /api/auth/profile", async () => {
    if (!authToken) {
      skipped++;
      console.log(yellow("Skipped — no auth token"));
      return;
    }
    const r = await apiCall("GET", "/auth/profile", undefined, authToken);
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(!!r.data.user, "Missing user in response");
    assert(
      r.data.user.email === TEST_EMAIL,
      `Email mismatch: ${r.data.user.email}`,
    );
  });

  // 5. Create daily log
  const today = new Date().toISOString().split("T")[0];
  await test("5. POST /api/daily-logs", async () => {
    if (!authToken) {
      skipped++;
      console.log(yellow("Skipped — no auth token"));
      return;
    }
    const r = await apiCall(
      "POST",
      "/daily-logs",
      {
        date: today,
        flow: "medium",
        mood: "calm",
        skin: ["clear"],
        notes: "Test connectivity log",
      },
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
  });

  // 6. Get daily log
  await test("6. GET /api/daily-logs?date=" + today, async () => {
    if (!authToken) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "GET",
      `/daily-logs?date=${today}`,
      undefined,
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(r.data.flow === "medium", `Flow mismatch: ${r.data.flow}`);
  });

  // 7. Get daily logs range
  await test("7. GET /api/daily-logs/range", async () => {
    if (!authToken) {
      skipped++;
      return;
    }
    const start = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split("T")[0];
    const end = today;
    const r = await apiCall(
      "GET",
      `/daily-logs/range?start=${start}&end=${end}`,
      undefined,
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(Array.isArray(r.data), "Expected array response");
  });

  // 8. Monthly report
  const now = new Date();
  await test("8. GET /api/reports/monthly", async () => {
    if (!authToken) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "GET",
      `/reports/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
      undefined,
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert("month" in r.data, "Missing 'month' field");
  });

  // 9. Create community post
  await test("9. POST /api/community/posts", async () => {
    if (!authToken) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "POST",
      "/community/posts",
      {
        title: "Connectivity Test Post",
        content: "This is a test post from the API connectivity script.",
        category: "support",
        is_anonymous: false,
      },
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    testPostId = r.data.post?.id || "";
    assert(!!testPostId, "Missing post ID");
  });

  // 10. Get community posts
  await test("10. GET /api/community/posts", async () => {
    const r = await apiCall(
      "GET",
      "/community/posts",
      undefined,
      authToken || undefined,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert(Array.isArray(r.data.posts), "Expected posts array");
  });

  // 11. Like post
  await test("11. POST /api/community/posts/:id/like", async () => {
    if (!authToken || !testPostId) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "POST",
      `/community/posts/${testPostId}/like`,
      {},
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    assert("liked" in r.data, "Missing 'liked' field");
  });

  // 12. Add comment
  await test("12. POST /api/community/posts/:id/comments", async () => {
    if (!authToken || !testPostId) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "POST",
      `/community/posts/${testPostId}/comments`,
      { content: "Test comment from connectivity script" },
      authToken,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
    testCommentId = r.data.comment?.id || "";
  });

  // 13. Log period
  await test("13. POST /api/periods/log", async () => {
    if (!authToken) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "POST",
      "/periods/log",
      {
        start_date: today,
        flow_level: "medium",
      },
      authToken,
    );
    // May fail if period already exists — that's OK, check for 2xx or 409
    assert(
      r.ok || r.status === 409 || r.status === 400,
      `Unexpected status ${r.status}: ${JSON.stringify(r.data)}`,
    );
  });

  // 14. Get predictions
  await test("14. GET /api/periods/predictions", async () => {
    if (!authToken) {
      skipped++;
      return;
    }
    const r = await apiCall(
      "GET",
      "/periods/predictions",
      undefined,
      authToken,
    );
    // May return 404 if not enough data — acceptable
    assert(
      r.ok || r.status === 404,
      `Unexpected status ${r.status}: ${JSON.stringify(r.data)}`,
    );
  });

  // 15. Get remedies
  await test("15. GET /api/remedies", async () => {
    const r = await apiCall(
      "GET",
      "/remedies",
      undefined,
      authToken || undefined,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
  });

  // 16. Get resources
  await test("16. GET /api/resources", async () => {
    const r = await apiCall(
      "GET",
      "/resources",
      undefined,
      authToken || undefined,
    );
    assert(r.ok, `Status ${r.status}: ${JSON.stringify(r.data)}`);
  });

  // ─── Cleanup ─────────────────────────────────────────────
  // Delete test post
  if (testPostId && authToken) {
    await apiCall(
      "DELETE",
      `/community/posts/${testPostId}`,
      undefined,
      authToken,
    );
  }

  // ─── Summary ─────────────────────────────────────────────
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(bold("  Test Results\n"));
  console.log(`  ${green(`Passed: ${passed}`)}`);
  if (failed > 0) console.log(`  ${red(`Failed: ${failed}`)}`);
  if (skipped > 0) console.log(`  ${yellow(`Skipped: ${skipped}`)}`);
  console.log(`  Total:  ${passed + failed + skipped}`);
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
