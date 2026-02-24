const { createPostActivityIterator, publishPostActivity } = require("../src/events/postActivity");

describe("Post Activity Event Bus", () => {
	it("emits activity payload to iterator subscribers", async () => {
		const iterator = createPostActivityIterator();

		const payload = {
			action: "CREATED",
			postId: "post-123",
			title: "Hello Node",
			status: "published",
			viewCount: 10,
			authorUsername: "john",
		};

		const nextPromise = iterator.next();
		publishPostActivity(payload);

		const { value } = await nextPromise;

		expect(value.postActivity.action).toBe("CREATED");
		expect(value.postActivity.postId).toBe("post-123");
		expect(value.postActivity.title).toBe("Hello Node");
		expect(value.postActivity.timestamp).toBeDefined();

		await iterator.return();
	});
});
