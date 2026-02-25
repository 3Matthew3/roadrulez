/**
 * Rate-limit logic unit tests.
 * Uses a fully mocked Prisma client — no live DB required.
 *
 * Run: npx jest __tests__/rate-limit.test.ts
 */

// ── Prisma mock ──────────────────────────────────────────────────────────────
const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
const mockCreate = jest.fn();
const mockUpdateMany = jest.fn();
const mockDeleteMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
    prisma: {
        loginAttempt: {
            findFirst: () => mockFindFirst(),
            update: (...args: any[]) => mockUpdate(...args),
            create: (...args: any[]) => mockCreate(...args),
            updateMany: (...args: any[]) => mockUpdateMany(...args),
            deleteMany: (...args: any[]) => mockDeleteMany(...args),
        },
    },
}));

import {
    checkLoginAllowed,
    recordFailedAttempt,
    recordSuccessfulLogin,
    extractClientIp,
} from "@/lib/rate-limit";

// ── Test helpers ─────────────────────────────────────────────────────────────
const TEST_IP = "1.2.3.4";
const TEST_EMAIL = "admin@roadrulez.com";

beforeEach(() => {
    jest.clearAllMocks();
    // Default: deleteMany succeeds (lazy cleanup)
    mockDeleteMany.mockResolvedValue({ count: 0 });
});

// ── extractClientIp ───────────────────────────────────────────────────────────
describe("extractClientIp", () => {
    it("returns the first IP from x-forwarded-for", () => {
        const headers = new Headers({ "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3" });
        expect(extractClientIp(headers)).toBe("10.0.0.1");
    });

    it("falls back to x-real-ip", () => {
        const headers = new Headers({ "x-real-ip": "10.0.0.5" });
        expect(extractClientIp(headers)).toBe("10.0.0.5");
    });

    it("returns 'unknown' when no IP headers present", () => {
        expect(extractClientIp(new Headers())).toBe("unknown");
    });
});

// ── checkLoginAllowed ─────────────────────────────────────────────────────────
describe("checkLoginAllowed", () => {
    it("allows login when no record exists", async () => {
        mockFindFirst.mockResolvedValue(null);
        const result = await checkLoginAllowed(TEST_IP, TEST_EMAIL);
        expect(result.allowed).toBe(true);
    });

    it("allows login when record exists but failCount is below threshold", async () => {
        mockFindFirst.mockResolvedValue({
            id: "1",
            failCount: 5,
            lockedUntil: null,
        });
        const result = await checkLoginAllowed(TEST_IP, TEST_EMAIL);
        expect(result.allowed).toBe(true);
    });

    it("blocks login when lockedUntil is in the future", async () => {
        const future = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
        mockFindFirst.mockResolvedValue({
            id: "1",
            failCount: 10,
            lockedUntil: future,
        });
        const result = await checkLoginAllowed(TEST_IP, TEST_EMAIL);
        expect(result.allowed).toBe(false);
        expect(result.remainingSeconds).toBeGreaterThan(0);
    });

    it("allows login when lockedUntil is in the past", async () => {
        const past = new Date(Date.now() - 1000); // 1 second ago
        mockFindFirst.mockResolvedValue({
            id: "1",
            failCount: 10,
            lockedUntil: past,
        });
        const result = await checkLoginAllowed(TEST_IP, TEST_EMAIL);
        expect(result.allowed).toBe(true);
    });
});

// ── recordFailedAttempt ───────────────────────────────────────────────────────
describe("recordFailedAttempt", () => {
    it("creates a new record when none exists", async () => {
        mockFindFirst.mockResolvedValue(null);
        mockCreate.mockResolvedValue({});
        await recordFailedAttempt(TEST_IP, TEST_EMAIL);
        expect(mockCreate).toHaveBeenCalledTimes(1);
        const createArg = mockCreate.mock.calls[0][0];
        expect(createArg.data.failCount).toBe(1);
        expect(createArg.data.lockedUntil).toBeNull();
    });

    it("increments existing record without locking below threshold", async () => {
        mockFindFirst.mockResolvedValue({ id: "1", failCount: 4, lockedUntil: null });
        mockUpdate.mockResolvedValue({});
        await recordFailedAttempt(TEST_IP, TEST_EMAIL);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        const updateArg = mockUpdate.mock.calls[0][0];
        expect(updateArg.data.failCount).toBe(5);
        expect(updateArg.data.lockedUntil).toBeNull();
    });

    it("applies lockout exactly at MAX_ATTEMPTS (10)", async () => {
        mockFindFirst.mockResolvedValue({ id: "1", failCount: 9, lockedUntil: null });
        mockUpdate.mockResolvedValue({});
        await recordFailedAttempt(TEST_IP, TEST_EMAIL);
        const updateArg = mockUpdate.mock.calls[0][0];
        expect(updateArg.data.failCount).toBe(10);
        expect(updateArg.data.lockedUntil).toBeInstanceOf(Date);
        // lockedUntil should be ~15 minutes from now
        const diffMs = (updateArg.data.lockedUntil as Date).getTime() - Date.now();
        expect(diffMs).toBeGreaterThan(14 * 60 * 1000);
        expect(diffMs).toBeLessThan(16 * 60 * 1000);
    });
});

// ── recordSuccessfulLogin ─────────────────────────────────────────────────────
describe("recordSuccessfulLogin", () => {
    it("resets failCount and clears lockout", async () => {
        mockUpdateMany.mockResolvedValue({ count: 1 });
        await recordSuccessfulLogin(TEST_IP, TEST_EMAIL);
        expect(mockUpdateMany).toHaveBeenCalledTimes(1);
        const arg = mockUpdateMany.mock.calls[0][0];
        expect(arg.data.failCount).toBe(0);
        expect(arg.data.lockedUntil).toBeNull();
    });
});
