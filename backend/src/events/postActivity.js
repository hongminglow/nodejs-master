const { EventEmitter, on } = require("node:events");

const POST_ACTIVITY_EVENT = "post-activity";

const emitter = new EventEmitter();
emitter.setMaxListeners(0);

const publishPostActivity = (activity) => {
	emitter.emit(POST_ACTIVITY_EVENT, {
		postActivity: {
			...activity,
			timestamp: activity.timestamp || new Date().toISOString(),
		},
	});
};

const createPostActivityIterator = async function* () {
	for await (const [payload] of on(emitter, POST_ACTIVITY_EVENT)) {
		yield payload;
	}
};

module.exports = {
	publishPostActivity,
	createPostActivityIterator,
};
