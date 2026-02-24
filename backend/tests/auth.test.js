const jwt = require("jsonwebtoken");
const config = require("../src/config");
const {
	decodeToken,
	generateAccessToken,
	generateRefreshToken,
	hashRefreshToken,
} = require("../src/middleware/auth");

describe("Authentication helpers", () => {
	it("generates and decodes access token payload", () => {
		const token = generateAccessToken(
			{
				id: "8e95fd24-dc74-4f01-8112-e30c9ebf4ee2",
				email: "john@example.com",
				role: "admin",
			},
			"1c2b9808-cd83-4e80-83dc-ac9da90ca2de",
		);

		const decoded = decodeToken(`Bearer ${token}`);

		expect(decoded).toBeTruthy();
		expect(decoded.type).toBe("access");
		expect(decoded.email).toBe("john@example.com");
		expect(decoded.role).toBe("admin");
		expect(decoded.sid).toBe("1c2b9808-cd83-4e80-83dc-ac9da90ca2de");
		expect(decoded.sub).toBe("8e95fd24-dc74-4f01-8112-e30c9ebf4ee2");
	});

	it("returns null for malformed auth header", () => {
		expect(decodeToken("invalid")).toBeNull();
		expect(decodeToken(null)).toBeNull();
	});

	it("throws coded errors in strict mode", () => {
		expect(() => decodeToken(null, { strict: true })).toThrow("Authentication token is required");

		try {
			decodeToken("invalid", { strict: true });
			throw new Error("Expected decodeToken to throw");
		} catch (error) {
			expect(error.code).toBe("AUTH_INVALID_TOKEN");
		}
	});

	it("throws expiration code for expired token in strict mode", () => {
		const expiredToken = jwt.sign(
			{
				email: "john@example.com",
				role: "user",
				type: "access",
				sid: "04f8f575-22e2-48aa-a915-c4ec7ce27173",
			},
			config.jwt.secret,
			{
				expiresIn: "-1s",
				issuer: config.jwt.issuer,
				audience: config.jwt.audience,
				subject: "8e95fd24-dc74-4f01-8112-e30c9ebf4ee2",
				jwtid: "auth-test-expired-token",
			},
		);

		try {
			decodeToken(`Bearer ${expiredToken}`, { strict: true });
			throw new Error("Expected decodeToken to throw");
		} catch (error) {
			expect(error.code).toBe("AUTH_TOKEN_EXPIRED");
		}
	});

	it("creates deterministic refresh token hashes", () => {
		const raw = generateRefreshToken();
		expect(raw.length).toBeGreaterThan(40);

		const hashA = hashRefreshToken(raw);
		const hashB = hashRefreshToken(raw);
		expect(hashA).toBe(hashB);
		expect(hashA).toHaveLength(64);
	});
});
