import { a as __require, n as __esmMin, o as __toCommonJS, r as __exportAll, s as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { t as $9de8c596df24b669$export$2e2bcd8739ae039 } from "./debug-logs+[...].mjs";
//#endregion
//#region node_modules/@electrum-cash/network/node_modules/eventemitter3/index.mjs
var import_eventemitter3$1 = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var has = Object.prototype.hasOwnProperty;
	var prefix = "~";
	/**
	* Constructor to create a storage for our `EE` objects.
	* An `Events` instance is a plain object whose properties are event names.
	*
	* @constructor
	* @private
	*/
	function Events() {}
	if (Object.create) {
		Events.prototype = Object.create(null);
		if (!new Events().__proto__) prefix = false;
	}
	/**
	* Representation of a single event listener.
	*
	* @param {Function} fn The listener function.
	* @param {*} context The context to invoke the listener with.
	* @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	* @constructor
	* @private
	*/
	function EE(fn, context, once) {
		this.fn = fn;
		this.context = context;
		this.once = once || false;
	}
	/**
	* Add a listener for a given event.
	*
	* @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn The listener function.
	* @param {*} context The context to invoke the listener with.
	* @param {Boolean} once Specify if the listener is a one-time listener.
	* @returns {EventEmitter}
	* @private
	*/
	function addListener(emitter, event, fn, context, once) {
		if (typeof fn !== "function") throw new TypeError("The listener must be a function");
		var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
		if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		else emitter._events[evt] = [emitter._events[evt], listener];
		return emitter;
	}
	/**
	* Clear event by name.
	*
	* @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	* @param {(String|Symbol)} evt The Event name.
	* @private
	*/
	function clearEvent(emitter, evt) {
		if (--emitter._eventsCount === 0) emitter._events = new Events();
		else delete emitter._events[evt];
	}
	/**
	* Minimal `EventEmitter` interface that is molded against the Node.js
	* `EventEmitter` interface.
	*
	* @constructor
	* @public
	*/
	function EventEmitter() {
		this._events = new Events();
		this._eventsCount = 0;
	}
	/**
	* Return an array listing the events for which the emitter has registered
	* listeners.
	*
	* @returns {Array}
	* @public
	*/
	EventEmitter.prototype.eventNames = function eventNames() {
		var names = [], events, name;
		if (this._eventsCount === 0) return names;
		for (name in events = this._events) if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		if (Object.getOwnPropertySymbols) return names.concat(Object.getOwnPropertySymbols(events));
		return names;
	};
	/**
	* Return the listeners registered for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @returns {Array} The registered listeners.
	* @public
	*/
	EventEmitter.prototype.listeners = function listeners(event) {
		var evt = prefix ? prefix + event : event, handlers = this._events[evt];
		if (!handlers) return [];
		if (handlers.fn) return [handlers.fn];
		for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) ee[i] = handlers[i].fn;
		return ee;
	};
	/**
	* Return the number of listeners listening to a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @returns {Number} The number of listeners.
	* @public
	*/
	EventEmitter.prototype.listenerCount = function listenerCount(event) {
		var evt = prefix ? prefix + event : event, listeners = this._events[evt];
		if (!listeners) return 0;
		if (listeners.fn) return 1;
		return listeners.length;
	};
	/**
	* Calls each of the listeners registered for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @returns {Boolean} `true` if the event had listeners, else `false`.
	* @public
	*/
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		var evt = prefix ? prefix + event : event;
		if (!this._events[evt]) return false;
		var listeners = this._events[evt], len = arguments.length, args, i;
		if (listeners.fn) {
			if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
			switch (len) {
				case 1: return listeners.fn.call(listeners.context), true;
				case 2: return listeners.fn.call(listeners.context, a1), true;
				case 3: return listeners.fn.call(listeners.context, a1, a2), true;
				case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
				case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
				case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
			}
			for (i = 1, args = new Array(len - 1); i < len; i++) args[i - 1] = arguments[i];
			listeners.fn.apply(listeners.context, args);
		} else {
			var length = listeners.length, j;
			for (i = 0; i < length; i++) {
				if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
				switch (len) {
					case 1:
						listeners[i].fn.call(listeners[i].context);
						break;
					case 2:
						listeners[i].fn.call(listeners[i].context, a1);
						break;
					case 3:
						listeners[i].fn.call(listeners[i].context, a1, a2);
						break;
					case 4:
						listeners[i].fn.call(listeners[i].context, a1, a2, a3);
						break;
					default:
						if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) args[j - 1] = arguments[j];
						listeners[i].fn.apply(listeners[i].context, args);
				}
			}
		}
		return true;
	};
	/**
	* Add a listener for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn The listener function.
	* @param {*} [context=this] The context to invoke the listener with.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.on = function on(event, fn, context) {
		return addListener(this, event, fn, context, false);
	};
	/**
	* Add a one-time listener for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn The listener function.
	* @param {*} [context=this] The context to invoke the listener with.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.once = function once(event, fn, context) {
		return addListener(this, event, fn, context, true);
	};
	/**
	* Remove the listeners of a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn Only remove the listeners that match this function.
	* @param {*} context Only remove the listeners that have this context.
	* @param {Boolean} once Only remove one-time listeners.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		var evt = prefix ? prefix + event : event;
		if (!this._events[evt]) return this;
		if (!fn) {
			clearEvent(this, evt);
			return this;
		}
		var listeners = this._events[evt];
		if (listeners.fn) {
			if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) clearEvent(this, evt);
		} else {
			for (var i = 0, events = [], length = listeners.length; i < length; i++) if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) events.push(listeners[i]);
			if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
			else clearEvent(this, evt);
		}
		return this;
	};
	/**
	* Remove all listeners, or those of the specified event.
	*
	* @param {(String|Symbol)} [event] The event name.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		var evt;
		if (event) {
			evt = prefix ? prefix + event : event;
			if (this._events[evt]) clearEvent(this, evt);
		} else {
			this._events = new Events();
			this._eventsCount = 0;
		}
		return this;
	};
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	EventEmitter.prefixed = prefix;
	EventEmitter.EventEmitter = EventEmitter;
	if ("undefined" !== typeof module) module.exports = EventEmitter;
})))(), 1);
//#endregion
//#region node_modules/async-mutex/index.mjs
var E_CANCELED = /* @__PURE__ */ new Error("request for lock canceled");
var __awaiter$2 = function(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
var Semaphore = class {
	constructor(_value, _cancelError = E_CANCELED) {
		this._value = _value;
		this._cancelError = _cancelError;
		this._queue = [];
		this._weightedWaiters = [];
	}
	acquire(weight = 1, priority = 0) {
		if (weight <= 0) throw new Error(`invalid weight ${weight}: must be positive`);
		return new Promise((resolve, reject) => {
			const task = {
				resolve,
				reject,
				weight,
				priority
			};
			const i = findIndexFromEnd(this._queue, (other) => priority <= other.priority);
			if (i === -1 && weight <= this._value) this._dispatchItem(task);
			else this._queue.splice(i + 1, 0, task);
		});
	}
	runExclusive(callback_1) {
		return __awaiter$2(this, arguments, void 0, function* (callback, weight = 1, priority = 0) {
			const [value, release] = yield this.acquire(weight, priority);
			try {
				return yield callback(value);
			} finally {
				release();
			}
		});
	}
	waitForUnlock(weight = 1, priority = 0) {
		if (weight <= 0) throw new Error(`invalid weight ${weight}: must be positive`);
		if (this._couldLockImmediately(weight, priority)) return Promise.resolve();
		else return new Promise((resolve) => {
			if (!this._weightedWaiters[weight - 1]) this._weightedWaiters[weight - 1] = [];
			insertSorted(this._weightedWaiters[weight - 1], {
				resolve,
				priority
			});
		});
	}
	isLocked() {
		return this._value <= 0;
	}
	getValue() {
		return this._value;
	}
	setValue(value) {
		this._value = value;
		this._dispatchQueue();
	}
	release(weight = 1) {
		if (weight <= 0) throw new Error(`invalid weight ${weight}: must be positive`);
		this._value += weight;
		this._dispatchQueue();
	}
	cancel() {
		this._queue.forEach((entry) => entry.reject(this._cancelError));
		this._queue = [];
	}
	_dispatchQueue() {
		this._drainUnlockWaiters();
		while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
			this._dispatchItem(this._queue.shift());
			this._drainUnlockWaiters();
		}
	}
	_dispatchItem(item) {
		const previousValue = this._value;
		this._value -= item.weight;
		item.resolve([previousValue, this._newReleaser(item.weight)]);
	}
	_newReleaser(weight) {
		let called = false;
		return () => {
			if (called) return;
			called = true;
			this.release(weight);
		};
	}
	_drainUnlockWaiters() {
		if (this._queue.length === 0) for (let weight = this._value; weight > 0; weight--) {
			const waiters = this._weightedWaiters[weight - 1];
			if (!waiters) continue;
			waiters.forEach((waiter) => waiter.resolve());
			this._weightedWaiters[weight - 1] = [];
		}
		else {
			const queuedPriority = this._queue[0].priority;
			for (let weight = this._value; weight > 0; weight--) {
				const waiters = this._weightedWaiters[weight - 1];
				if (!waiters) continue;
				const i = waiters.findIndex((waiter) => waiter.priority <= queuedPriority);
				(i === -1 ? waiters : waiters.splice(0, i)).forEach(((waiter) => waiter.resolve()));
			}
		}
	}
	_couldLockImmediately(weight, priority) {
		return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
	}
};
function insertSorted(a, v) {
	const i = findIndexFromEnd(a, (other) => v.priority <= other.priority);
	a.splice(i + 1, 0, v);
}
function findIndexFromEnd(a, predicate) {
	for (let i = a.length - 1; i >= 0; i--) if (predicate(a[i])) return i;
	return -1;
}
var __awaiter$1 = function(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
var Mutex = class {
	constructor(cancelError) {
		this._semaphore = new Semaphore(1, cancelError);
	}
	acquire() {
		return __awaiter$1(this, arguments, void 0, function* (priority = 0) {
			const [, releaser] = yield this._semaphore.acquire(1, priority);
			return releaser;
		});
	}
	runExclusive(callback, priority = 0) {
		return this._semaphore.runExclusive(() => callback(), 1, priority);
	}
	isLocked() {
		return this._semaphore.isLocked();
	}
	waitForUnlock(priority = 0) {
		return this._semaphore.waitForUnlock(1, priority);
	}
	release() {
		if (this._semaphore.isLocked()) this._semaphore.release();
	}
	cancel() {
		return this._semaphore.cancel();
	}
};
//#endregion
//#region node_modules/ws/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		BINARY_TYPES: [
			"nodebuffer",
			"arraybuffer",
			"fragments"
		],
		GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
		kStatusCode: Symbol("status-code"),
		kWebSocket: Symbol("websocket"),
		EMPTY_BUFFER: Buffer.alloc(0),
		NOOP: () => {}
	};
}));
//#endregion
//#region __vite-optional-peer-dep:bufferutil:ws
var __vite_optional_peer_dep_bufferutil_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_bufferutil_ws_default });
var __vite_optional_peer_dep_bufferutil_ws_default;
var init___vite_optional_peer_dep_bufferutil_ws = __esmMin((() => {
	__vite_optional_peer_dep_bufferutil_ws_default = {};
	throw new Error(`Could not resolve "bufferutil" imported by "ws". Is it installed?`);
}));
//#endregion
//#region node_modules/ws/lib/buffer-util.js
var require_buffer_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { EMPTY_BUFFER } = require_constants();
	/**
	* Merges an array of buffers into a new buffer.
	*
	* @param {Buffer[]} list The array of buffers to concat
	* @param {Number} totalLength The total length of buffers in the list
	* @return {Buffer} The resulting buffer
	* @public
	*/
	function concat(list, totalLength) {
		if (list.length === 0) return EMPTY_BUFFER;
		if (list.length === 1) return list[0];
		const target = Buffer.allocUnsafe(totalLength);
		let offset = 0;
		for (let i = 0; i < list.length; i++) {
			const buf = list[i];
			target.set(buf, offset);
			offset += buf.length;
		}
		if (offset < totalLength) return target.slice(0, offset);
		return target;
	}
	/**
	* Masks a buffer using the given mask.
	*
	* @param {Buffer} source The buffer to mask
	* @param {Buffer} mask The mask to use
	* @param {Buffer} output The buffer where to store the result
	* @param {Number} offset The offset at which to start writing
	* @param {Number} length The number of bytes to mask.
	* @public
	*/
	function _mask(source, mask, output, offset, length) {
		for (let i = 0; i < length; i++) output[offset + i] = source[i] ^ mask[i & 3];
	}
	/**
	* Unmasks a buffer using the given mask.
	*
	* @param {Buffer} buffer The buffer to unmask
	* @param {Buffer} mask The mask to use
	* @public
	*/
	function _unmask(buffer, mask) {
		const length = buffer.length;
		for (let i = 0; i < length; i++) buffer[i] ^= mask[i & 3];
	}
	/**
	* Converts a buffer to an `ArrayBuffer`.
	*
	* @param {Buffer} buf The buffer to convert
	* @return {ArrayBuffer} Converted buffer
	* @public
	*/
	function toArrayBuffer(buf) {
		if (buf.byteLength === buf.buffer.byteLength) return buf.buffer;
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
	}
	/**
	* Converts `data` to a `Buffer`.
	*
	* @param {*} data The data to convert
	* @return {Buffer} The buffer
	* @throws {TypeError}
	* @public
	*/
	function toBuffer(data) {
		toBuffer.readOnly = true;
		if (Buffer.isBuffer(data)) return data;
		let buf;
		if (data instanceof ArrayBuffer) buf = Buffer.from(data);
		else if (ArrayBuffer.isView(data)) buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
		else {
			buf = Buffer.from(data);
			toBuffer.readOnly = false;
		}
		return buf;
	}
	try {
		const bufferUtil = (init___vite_optional_peer_dep_bufferutil_ws(), __toCommonJS(__vite_optional_peer_dep_bufferutil_ws_exports));
		const bu = bufferUtil.BufferUtil || bufferUtil;
		module.exports = {
			concat,
			mask(source, mask, output, offset, length) {
				if (length < 48) _mask(source, mask, output, offset, length);
				else bu.mask(source, mask, output, offset, length);
			},
			toArrayBuffer,
			toBuffer,
			unmask(buffer, mask) {
				if (buffer.length < 32) _unmask(buffer, mask);
				else bu.unmask(buffer, mask);
			}
		};
	} catch (e) /* istanbul ignore next */ {
		module.exports = {
			concat,
			mask: _mask,
			toArrayBuffer,
			toBuffer,
			unmask: _unmask
		};
	}
}));
//#endregion
//#region node_modules/ws/lib/limiter.js
var require_limiter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var kDone = Symbol("kDone");
	var kRun = Symbol("kRun");
	/**
	* A very simple job queue with adjustable concurrency. Adapted from
	* https://github.com/STRML/async-limiter
	*/
	var Limiter = class {
		/**
		* Creates a new `Limiter`.
		*
		* @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
		*     to run concurrently
		*/
		constructor(concurrency) {
			this[kDone] = () => {
				this.pending--;
				this[kRun]();
			};
			this.concurrency = concurrency || Infinity;
			this.jobs = [];
			this.pending = 0;
		}
		/**
		* Adds a job to the queue.
		*
		* @param {Function} job The job to run
		* @public
		*/
		add(job) {
			this.jobs.push(job);
			this[kRun]();
		}
		/**
		* Removes a job from the queue and runs it if possible.
		*
		* @private
		*/
		[kRun]() {
			if (this.pending === this.concurrency) return;
			if (this.jobs.length) {
				const job = this.jobs.shift();
				this.pending++;
				job(this[kDone]);
			}
		}
	};
	module.exports = Limiter;
}));
//#endregion
//#region node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var zlib = __require("zlib");
	var bufferUtil = require_buffer_util();
	var Limiter = require_limiter();
	var { kStatusCode, NOOP } = require_constants();
	var TRAILER = Buffer.from([
		0,
		0,
		255,
		255
	]);
	var kPerMessageDeflate = Symbol("permessage-deflate");
	var kTotalLength = Symbol("total-length");
	var kCallback = Symbol("callback");
	var kBuffers = Symbol("buffers");
	var kError = Symbol("error");
	var zlibLimiter;
	/**
	* permessage-deflate implementation.
	*/
	var PerMessageDeflate = class {
		/**
		* Creates a PerMessageDeflate instance.
		*
		* @param {Object} [options] Configuration options
		* @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
		*     disabling of server context takeover
		* @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
		*     acknowledge disabling of client context takeover
		* @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
		*     use of a custom server window size
		* @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
		*     for, or request, a custom client window size
		* @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
		*     deflate
		* @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
		*     inflate
		* @param {Number} [options.threshold=1024] Size (in bytes) below which
		*     messages should not be compressed
		* @param {Number} [options.concurrencyLimit=10] The number of concurrent
		*     calls to zlib
		* @param {Boolean} [isServer=false] Create the instance in either server or
		*     client mode
		* @param {Number} [maxPayload=0] The maximum allowed message length
		*/
		constructor(options, isServer, maxPayload) {
			this._maxPayload = maxPayload | 0;
			this._options = options || {};
			this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
			this._isServer = !!isServer;
			this._deflate = null;
			this._inflate = null;
			this.params = null;
			if (!zlibLimiter) zlibLimiter = new Limiter(this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10);
		}
		/**
		* @type {String}
		*/
		static get extensionName() {
			return "permessage-deflate";
		}
		/**
		* Create an extension negotiation offer.
		*
		* @return {Object} Extension parameters
		* @public
		*/
		offer() {
			const params = {};
			if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
			if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
			if (this._options.serverMaxWindowBits) params.server_max_window_bits = this._options.serverMaxWindowBits;
			if (this._options.clientMaxWindowBits) params.client_max_window_bits = this._options.clientMaxWindowBits;
			else if (this._options.clientMaxWindowBits == null) params.client_max_window_bits = true;
			return params;
		}
		/**
		* Accept an extension negotiation offer/response.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Object} Accepted configuration
		* @public
		*/
		accept(configurations) {
			configurations = this.normalizeParams(configurations);
			this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
			return this.params;
		}
		/**
		* Releases all resources used by the extension.
		*
		* @public
		*/
		cleanup() {
			if (this._inflate) {
				this._inflate.close();
				this._inflate = null;
			}
			if (this._deflate) {
				const callback = this._deflate[kCallback];
				this._deflate.close();
				this._deflate = null;
				if (callback) callback(/* @__PURE__ */ new Error("The deflate stream was closed while data was being processed"));
			}
		}
		/**
		*  Accept an extension negotiation offer.
		*
		* @param {Array} offers The extension negotiation offers
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsServer(offers) {
			const opts = this._options;
			const accepted = offers.find((params) => {
				if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) return false;
				return true;
			});
			if (!accepted) throw new Error("None of the extension offers can be accepted");
			if (opts.serverNoContextTakeover) accepted.server_no_context_takeover = true;
			if (opts.clientNoContextTakeover) accepted.client_no_context_takeover = true;
			if (typeof opts.serverMaxWindowBits === "number") accepted.server_max_window_bits = opts.serverMaxWindowBits;
			if (typeof opts.clientMaxWindowBits === "number") accepted.client_max_window_bits = opts.clientMaxWindowBits;
			else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) delete accepted.client_max_window_bits;
			return accepted;
		}
		/**
		* Accept the extension negotiation response.
		*
		* @param {Array} response The extension negotiation response
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsClient(response) {
			const params = response[0];
			if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) throw new Error("Unexpected parameter \"client_no_context_takeover\"");
			if (!params.client_max_window_bits) {
				if (typeof this._options.clientMaxWindowBits === "number") params.client_max_window_bits = this._options.clientMaxWindowBits;
			} else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
			return params;
		}
		/**
		* Normalize parameters.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Array} The offers/response with normalized parameters
		* @private
		*/
		normalizeParams(configurations) {
			configurations.forEach((params) => {
				Object.keys(params).forEach((key) => {
					let value = params[key];
					if (value.length > 1) throw new Error(`Parameter "${key}" must have only a single value`);
					value = value[0];
					if (key === "client_max_window_bits") {
						if (value !== true) {
							const num = +value;
							if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
							value = num;
						} else if (!this._isServer) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else if (key === "server_max_window_bits") {
						const num = +value;
						if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
						value = num;
					} else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
						if (value !== true) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else throw new Error(`Unknown parameter "${key}"`);
					params[key] = value;
				});
			});
			return configurations;
		}
		/**
		* Decompress data. Concurrency limited.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		decompress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._decompress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Compress data. Concurrency limited.
		*
		* @param {Buffer} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		compress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._compress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Decompress data.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_decompress(data, fin, callback) {
			const endpoint = this._isServer ? "client" : "server";
			if (!this._inflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._inflate = zlib.createInflateRaw({
					...this._options.zlibInflateOptions,
					windowBits
				});
				this._inflate[kPerMessageDeflate] = this;
				this._inflate[kTotalLength] = 0;
				this._inflate[kBuffers] = [];
				this._inflate.on("error", inflateOnError);
				this._inflate.on("data", inflateOnData);
			}
			this._inflate[kCallback] = callback;
			this._inflate.write(data);
			if (fin) this._inflate.write(TRAILER);
			this._inflate.flush(() => {
				const err = this._inflate[kError];
				if (err) {
					this._inflate.close();
					this._inflate = null;
					callback(err);
					return;
				}
				const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
				if (this._inflate._readableState.endEmitted) {
					this._inflate.close();
					this._inflate = null;
				} else {
					this._inflate[kTotalLength] = 0;
					this._inflate[kBuffers] = [];
					if (fin && this.params[`${endpoint}_no_context_takeover`]) this._inflate.reset();
				}
				callback(null, data);
			});
		}
		/**
		* Compress data.
		*
		* @param {Buffer} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_compress(data, fin, callback) {
			const endpoint = this._isServer ? "server" : "client";
			if (!this._deflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._deflate = zlib.createDeflateRaw({
					...this._options.zlibDeflateOptions,
					windowBits
				});
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				this._deflate.on("error", NOOP);
				this._deflate.on("data", deflateOnData);
			}
			this._deflate[kCallback] = callback;
			this._deflate.write(data);
			this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
				if (!this._deflate) return;
				let data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
				if (fin) data = data.slice(0, data.length - 4);
				this._deflate[kCallback] = null;
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				if (fin && this.params[`${endpoint}_no_context_takeover`]) this._deflate.reset();
				callback(null, data);
			});
		}
	};
	module.exports = PerMessageDeflate;
	/**
	* The listener of the `zlib.DeflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function deflateOnData(chunk) {
		this[kBuffers].push(chunk);
		this[kTotalLength] += chunk.length;
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function inflateOnData(chunk) {
		this[kTotalLength] += chunk.length;
		if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
			this[kBuffers].push(chunk);
			return;
		}
		this[kError] = /* @__PURE__ */ new RangeError("Max payload size exceeded");
		this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
		this[kError][kStatusCode] = 1009;
		this.removeListener("data", inflateOnData);
		this.reset();
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'error'` event.
	*
	* @param {Error} err The emitted error
	* @private
	*/
	function inflateOnError(err) {
		this[kPerMessageDeflate]._inflate = null;
		err[kStatusCode] = 1007;
		this[kCallback](err);
	}
}));
//#endregion
//#region __vite-optional-peer-dep:utf-8-validate:ws
var __vite_optional_peer_dep_utf_8_validate_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_utf_8_validate_ws_default });
var __vite_optional_peer_dep_utf_8_validate_ws_default;
var init___vite_optional_peer_dep_utf_8_validate_ws = __esmMin((() => {
	__vite_optional_peer_dep_utf_8_validate_ws_default = {};
	throw new Error(`Could not resolve "utf-8-validate" imported by "ws". Is it installed?`);
}));
//#endregion
//#region node_modules/ws/lib/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if a status code is allowed in a close frame.
	*
	* @param {Number} code The status code
	* @return {Boolean} `true` if the status code is valid, else `false`
	* @public
	*/
	function isValidStatusCode(code) {
		return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
	}
	/**
	* Checks if a given buffer contains only correct UTF-8.
	* Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
	* Markus Kuhn.
	*
	* @param {Buffer} buf The buffer to check
	* @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
	* @public
	*/
	function _isValidUTF8(buf) {
		const len = buf.length;
		let i = 0;
		while (i < len) if ((buf[i] & 128) === 0) i++;
		else if ((buf[i] & 224) === 192) {
			if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) return false;
			i += 2;
		} else if ((buf[i] & 240) === 224) {
			if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) return false;
			i += 3;
		} else if ((buf[i] & 248) === 240) {
			if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) return false;
			i += 4;
		} else return false;
		return true;
	}
	try {
		let isValidUTF8 = (init___vite_optional_peer_dep_utf_8_validate_ws(), __toCommonJS(__vite_optional_peer_dep_utf_8_validate_ws_exports));
		/* istanbul ignore if */
		if (typeof isValidUTF8 === "object") isValidUTF8 = isValidUTF8.Validation.isValidUTF8;
		module.exports = {
			isValidStatusCode,
			isValidUTF8(buf) {
				return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
			}
		};
	} catch (e) /* istanbul ignore next */ {
		module.exports = {
			isValidStatusCode,
			isValidUTF8: _isValidUTF8
		};
	}
}));
//#endregion
//#region node_modules/ws/lib/receiver.js
var require_receiver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Writable } = __require("stream");
	var PerMessageDeflate = require_permessage_deflate();
	var { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require_constants();
	var { concat, toArrayBuffer, unmask } = require_buffer_util();
	var { isValidStatusCode, isValidUTF8 } = require_validation();
	var GET_INFO = 0;
	var GET_PAYLOAD_LENGTH_16 = 1;
	var GET_PAYLOAD_LENGTH_64 = 2;
	var GET_MASK = 3;
	var GET_DATA = 4;
	var INFLATING = 5;
	/**
	* HyBi Receiver implementation.
	*
	* @extends Writable
	*/
	var Receiver = class extends Writable {
		/**
		* Creates a Receiver instance.
		*
		* @param {String} [binaryType=nodebuffer] The type for binary data
		* @param {Object} [extensions] An object containing the negotiated extensions
		* @param {Boolean} [isServer=false] Specifies whether to operate in client or
		*     server mode
		* @param {Number} [maxPayload=0] The maximum allowed message length
		* @param {Number} [maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [maxFragments=0] The maximum number of message
		*     fragments
		*/
		constructor(binaryType, extensions, isServer, maxPayload, maxBufferedChunks, maxFragments) {
			super();
			this._binaryType = binaryType || BINARY_TYPES[0];
			this[kWebSocket] = void 0;
			this._extensions = extensions || {};
			this._isServer = !!isServer;
			this._maxBufferedChunks = maxBufferedChunks | 0;
			this._maxFragments = maxFragments | 0;
			this._maxPayload = maxPayload | 0;
			this._bufferedBytes = 0;
			this._buffers = [];
			this._compressed = false;
			this._payloadLength = 0;
			this._mask = void 0;
			this._fragmented = 0;
			this._masked = false;
			this._fin = false;
			this._opcode = 0;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._numFragments = 0;
			this._fragments = [];
			this._state = GET_INFO;
			this._loop = false;
		}
		/**
		* Implements `Writable.prototype._write()`.
		*
		* @param {Buffer} chunk The chunk of data to write
		* @param {String} encoding The character encoding of `chunk`
		* @param {Function} cb Callback
		* @private
		*/
		_write(chunk, encoding, cb) {
			if (this._opcode === 8 && this._state == GET_INFO) return cb();
			if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) return cb(error(RangeError, "Too many buffered chunks", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
			this._bufferedBytes += chunk.length;
			this._buffers.push(chunk);
			this.startLoop(cb);
		}
		/**
		* Consumes `n` bytes from the buffered data.
		*
		* @param {Number} n The number of bytes to consume
		* @return {Buffer} The consumed bytes
		* @private
		*/
		consume(n) {
			this._bufferedBytes -= n;
			if (n === this._buffers[0].length) return this._buffers.shift();
			if (n < this._buffers[0].length) {
				const buf = this._buffers[0];
				this._buffers[0] = buf.slice(n);
				return buf.slice(0, n);
			}
			const dst = Buffer.allocUnsafe(n);
			do {
				const buf = this._buffers[0];
				const offset = dst.length - n;
				if (n >= buf.length) dst.set(this._buffers.shift(), offset);
				else {
					dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
					this._buffers[0] = buf.slice(n);
				}
				n -= buf.length;
			} while (n > 0);
			return dst;
		}
		/**
		* Starts the parsing loop.
		*
		* @param {Function} cb Callback
		* @private
		*/
		startLoop(cb) {
			let err;
			this._loop = true;
			do
				switch (this._state) {
					case GET_INFO:
						err = this.getInfo();
						break;
					case GET_PAYLOAD_LENGTH_16:
						err = this.getPayloadLength16();
						break;
					case GET_PAYLOAD_LENGTH_64:
						err = this.getPayloadLength64();
						break;
					case GET_MASK:
						this.getMask();
						break;
					case GET_DATA:
						err = this.getData(cb);
						break;
					default:
						this._loop = false;
						return;
				}
			while (this._loop);
			cb(err);
		}
		/**
		* Reads the first two bytes of a frame.
		*
		* @return {(RangeError|undefined)} A possible error
		* @private
		*/
		getInfo() {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			const buf = this.consume(2);
			if ((buf[0] & 48) !== 0) {
				this._loop = false;
				return error(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
			}
			const compressed = (buf[0] & 64) === 64;
			if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
				this._loop = false;
				return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
			}
			this._fin = (buf[0] & 128) === 128;
			this._opcode = buf[0] & 15;
			this._payloadLength = buf[1] & 127;
			if (this._opcode === 0) {
				if (compressed) {
					this._loop = false;
					return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
				}
				if (!this._fragmented) {
					this._loop = false;
					return error(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
				}
				this._opcode = this._fragmented;
			} else if (this._opcode === 1 || this._opcode === 2) {
				if (this._fragmented) {
					this._loop = false;
					return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
				}
				this._compressed = compressed;
			} else if (this._opcode > 7 && this._opcode < 11) {
				if (!this._fin) {
					this._loop = false;
					return error(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
				}
				if (compressed) {
					this._loop = false;
					return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
				}
				if (this._payloadLength > 125) {
					this._loop = false;
					return error(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
				}
			} else {
				this._loop = false;
				return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
			}
			if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
			this._masked = (buf[1] & 128) === 128;
			if (this._isServer) {
				if (!this._masked) {
					this._loop = false;
					return error(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
				}
			} else if (this._masked) {
				this._loop = false;
				return error(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
			}
			if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
			else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
			else return this.haveLength();
		}
		/**
		* Gets extended payload length (7+16).
		*
		* @return {(RangeError|undefined)} A possible error
		* @private
		*/
		getPayloadLength16() {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			this._payloadLength = this.consume(2).readUInt16BE(0);
			return this.haveLength();
		}
		/**
		* Gets extended payload length (7+64).
		*
		* @return {(RangeError|undefined)} A possible error
		* @private
		*/
		getPayloadLength64() {
			if (this._bufferedBytes < 8) {
				this._loop = false;
				return;
			}
			const buf = this.consume(8);
			const num = buf.readUInt32BE(0);
			if (num > Math.pow(2, 21) - 1) {
				this._loop = false;
				return error(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
			}
			this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
			return this.haveLength();
		}
		/**
		* Payload length has been read.
		*
		* @return {(RangeError|undefined)} A possible error
		* @private
		*/
		haveLength() {
			if (this._payloadLength && this._opcode < 8) {
				this._totalPayloadLength += this._payloadLength;
				if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
					this._loop = false;
					return error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
				}
			}
			if (this._masked) this._state = GET_MASK;
			else this._state = GET_DATA;
		}
		/**
		* Reads mask bytes.
		*
		* @private
		*/
		getMask() {
			if (this._bufferedBytes < 4) {
				this._loop = false;
				return;
			}
			this._mask = this.consume(4);
			this._state = GET_DATA;
		}
		/**
		* Reads data bytes.
		*
		* @param {Function} cb Callback
		* @return {(Error|RangeError|undefined)} A possible error
		* @private
		*/
		getData(cb) {
			let data = EMPTY_BUFFER;
			if (this._payloadLength) {
				if (this._bufferedBytes < this._payloadLength) {
					this._loop = false;
					return;
				}
				data = this.consume(this._payloadLength);
				if (this._masked) unmask(data, this._mask);
			}
			if (this._opcode > 7) return this.controlMessage(data);
			if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
				this._loop = false;
				return error(RangeError, "Too many message fragments", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS");
			}
			if (this._compressed) {
				this._state = INFLATING;
				this.decompress(data, cb);
				return;
			}
			if (data.length) {
				this._messageLength = this._totalPayloadLength;
				this._fragments.push(data);
			}
			return this.dataMessage();
		}
		/**
		* Decompresses data.
		*
		* @param {Buffer} data Compressed data
		* @param {Function} cb Callback
		* @private
		*/
		decompress(data, cb) {
			this._extensions[PerMessageDeflate.extensionName].decompress(data, this._fin, (err, buf) => {
				if (err) return cb(err);
				if (buf.length) {
					this._messageLength += buf.length;
					if (this._messageLength > this._maxPayload && this._maxPayload > 0) return cb(error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
					this._fragments.push(buf);
				}
				const er = this.dataMessage();
				if (er) return cb(er);
				this.startLoop(cb);
			});
		}
		/**
		* Handles a data message.
		*
		* @return {(Error|undefined)} A possible error
		* @private
		*/
		dataMessage() {
			if (this._fin) {
				const messageLength = this._messageLength;
				const fragments = this._fragments;
				this._totalPayloadLength = 0;
				this._messageLength = 0;
				this._fragmented = 0;
				this._numFragments = 0;
				this._fragments = [];
				if (this._opcode === 2) {
					let data;
					if (this._binaryType === "nodebuffer") data = concat(fragments, messageLength);
					else if (this._binaryType === "arraybuffer") data = toArrayBuffer(concat(fragments, messageLength));
					else data = fragments;
					this.emit("message", data);
				} else {
					const buf = concat(fragments, messageLength);
					if (!isValidUTF8(buf)) {
						this._loop = false;
						return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
					}
					this.emit("message", buf.toString());
				}
			}
			this._state = GET_INFO;
		}
		/**
		* Handles a control message.
		*
		* @param {Buffer} data Data to handle
		* @return {(Error|RangeError|undefined)} A possible error
		* @private
		*/
		controlMessage(data) {
			if (this._opcode === 8) {
				this._loop = false;
				if (data.length === 0) {
					this.emit("conclude", 1005, "");
					this.end();
				} else if (data.length === 1) return error(RangeError, "invalid payload length 1", true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
				else {
					const code = data.readUInt16BE(0);
					if (!isValidStatusCode(code)) return error(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
					const buf = data.slice(2);
					if (!isValidUTF8(buf)) return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
					this.emit("conclude", code, buf.toString());
					this.end();
				}
			} else if (this._opcode === 9) this.emit("ping", data);
			else this.emit("pong", data);
			this._state = GET_INFO;
		}
	};
	module.exports = Receiver;
	/**
	* Builds an error object.
	*
	* @param {function(new:Error|RangeError)} ErrorCtor The error constructor
	* @param {String} message The error message
	* @param {Boolean} prefix Specifies whether or not to add a default prefix to
	*     `message`
	* @param {Number} statusCode The status code
	* @param {String} errorCode The exposed error code
	* @return {(Error|RangeError)} The error
	* @private
	*/
	function error(ErrorCtor, message, prefix, statusCode, errorCode) {
		const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
		Error.captureStackTrace(err, error);
		err.code = errorCode;
		err[kStatusCode] = statusCode;
		return err;
	}
}));
//#endregion
//#region node_modules/ws/lib/sender.js
var require_sender = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	__require("net");
	__require("tls");
	var { randomFillSync } = __require("crypto");
	var PerMessageDeflate = require_permessage_deflate();
	var { EMPTY_BUFFER } = require_constants();
	var { isValidStatusCode } = require_validation();
	var { mask: applyMask, toBuffer } = require_buffer_util();
	var mask = Buffer.alloc(4);
	module.exports = class Sender {
		/**
		* Creates a Sender instance.
		*
		* @param {(net.Socket|tls.Socket)} socket The connection socket
		* @param {Object} [extensions] An object containing the negotiated extensions
		*/
		constructor(socket, extensions) {
			this._extensions = extensions || {};
			this._socket = socket;
			this._firstFragment = true;
			this._compress = false;
			this._bufferedBytes = 0;
			this._deflating = false;
			this._queue = [];
		}
		/**
		* Frames a piece of data according to the HyBi WebSocket protocol.
		*
		* @param {Buffer} data The data to frame
		* @param {Object} options Options object
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @return {Buffer[]} The framed data as a list of `Buffer` instances
		* @public
		*/
		static frame(data, options) {
			const merge = options.mask && options.readOnly;
			let offset = options.mask ? 6 : 2;
			let payloadLength = data.length;
			if (data.length >= 65536) {
				offset += 8;
				payloadLength = 127;
			} else if (data.length > 125) {
				offset += 2;
				payloadLength = 126;
			}
			const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);
			target[0] = options.fin ? options.opcode | 128 : options.opcode;
			if (options.rsv1) target[0] |= 64;
			target[1] = payloadLength;
			if (payloadLength === 126) target.writeUInt16BE(data.length, 2);
			else if (payloadLength === 127) {
				target.writeUInt32BE(0, 2);
				target.writeUInt32BE(data.length, 6);
			}
			if (!options.mask) return [target, data];
			randomFillSync(mask, 0, 4);
			target[1] |= 128;
			target[offset - 4] = mask[0];
			target[offset - 3] = mask[1];
			target[offset - 2] = mask[2];
			target[offset - 1] = mask[3];
			if (merge) {
				applyMask(data, mask, target, offset, data.length);
				return [target];
			}
			applyMask(data, mask, data, 0, data.length);
			return [target, data];
		}
		/**
		* Sends a close message to the other peer.
		*
		* @param {Number} [code] The status code component of the body
		* @param {String} [data] The message component of the body
		* @param {Boolean} [mask=false] Specifies whether or not to mask the message
		* @param {Function} [cb] Callback
		* @public
		*/
		close(code, data, mask, cb) {
			let buf;
			if (code === void 0) buf = EMPTY_BUFFER;
			else if (typeof code !== "number" || !isValidStatusCode(code)) throw new TypeError("First argument must be a valid error code number");
			else if (data === void 0 || data === "") {
				buf = Buffer.allocUnsafe(2);
				buf.writeUInt16BE(code, 0);
			} else {
				const length = Buffer.byteLength(data);
				if (length > 123) throw new RangeError("The message must not be greater than 123 bytes");
				buf = Buffer.allocUnsafe(2 + length);
				buf.writeUInt16BE(code, 0);
				buf.write(data, 2);
			}
			if (this._deflating) this.enqueue([
				this.doClose,
				buf,
				mask,
				cb
			]);
			else this.doClose(buf, mask, cb);
		}
		/**
		* Frames and sends a close message.
		*
		* @param {Buffer} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @private
		*/
		doClose(data, mask, cb) {
			this.sendFrame(Sender.frame(data, {
				fin: true,
				rsv1: false,
				opcode: 8,
				mask,
				readOnly: false
			}), cb);
		}
		/**
		* Sends a ping message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		ping(data, mask, cb) {
			const buf = toBuffer(data);
			if (buf.length > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			if (this._deflating) this.enqueue([
				this.doPing,
				buf,
				mask,
				toBuffer.readOnly,
				cb
			]);
			else this.doPing(buf, mask, toBuffer.readOnly, cb);
		}
		/**
		* Frames and sends a ping message.
		*
		* @param {Buffer} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
		* @param {Function} [cb] Callback
		* @private
		*/
		doPing(data, mask, readOnly, cb) {
			this.sendFrame(Sender.frame(data, {
				fin: true,
				rsv1: false,
				opcode: 9,
				mask,
				readOnly
			}), cb);
		}
		/**
		* Sends a pong message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		pong(data, mask, cb) {
			const buf = toBuffer(data);
			if (buf.length > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			if (this._deflating) this.enqueue([
				this.doPong,
				buf,
				mask,
				toBuffer.readOnly,
				cb
			]);
			else this.doPong(buf, mask, toBuffer.readOnly, cb);
		}
		/**
		* Frames and sends a pong message.
		*
		* @param {Buffer} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
		* @param {Function} [cb] Callback
		* @private
		*/
		doPong(data, mask, readOnly, cb) {
			this.sendFrame(Sender.frame(data, {
				fin: true,
				rsv1: false,
				opcode: 10,
				mask,
				readOnly
			}), cb);
		}
		/**
		* Sends a data message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Object} options Options object
		* @param {Boolean} [options.compress=false] Specifies whether or not to
		*     compress `data`
		* @param {Boolean} [options.binary=false] Specifies whether `data` is binary
		*     or text
		* @param {Boolean} [options.fin=false] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		send(data, options, cb) {
			const buf = toBuffer(data);
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			let opcode = options.binary ? 2 : 1;
			let rsv1 = options.compress;
			if (this._firstFragment) {
				this._firstFragment = false;
				if (rsv1 && perMessageDeflate) rsv1 = buf.length >= perMessageDeflate._threshold;
				this._compress = rsv1;
			} else {
				rsv1 = false;
				opcode = 0;
			}
			if (options.fin) this._firstFragment = true;
			if (perMessageDeflate) {
				const opts = {
					fin: options.fin,
					rsv1,
					opcode,
					mask: options.mask,
					readOnly: toBuffer.readOnly
				};
				if (this._deflating) this.enqueue([
					this.dispatch,
					buf,
					this._compress,
					opts,
					cb
				]);
				else this.dispatch(buf, this._compress, opts, cb);
			} else this.sendFrame(Sender.frame(buf, {
				fin: options.fin,
				rsv1: false,
				opcode,
				mask: options.mask,
				readOnly: toBuffer.readOnly
			}), cb);
		}
		/**
		* Dispatches a data message.
		*
		* @param {Buffer} data The message to send
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     `data`
		* @param {Object} options Options object
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		dispatch(data, compress, options, cb) {
			if (!compress) {
				this.sendFrame(Sender.frame(data, options), cb);
				return;
			}
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			this._bufferedBytes += data.length;
			this._deflating = true;
			perMessageDeflate.compress(data, options.fin, (_, buf) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while data was being compressed");
					if (typeof cb === "function") cb(err);
					for (let i = 0; i < this._queue.length; i++) {
						const callback = this._queue[i][4];
						if (typeof callback === "function") callback(err);
					}
					return;
				}
				this._bufferedBytes -= data.length;
				this._deflating = false;
				options.readOnly = false;
				this.sendFrame(Sender.frame(buf, options), cb);
				this.dequeue();
			});
		}
		/**
		* Executes queued send operations.
		*
		* @private
		*/
		dequeue() {
			while (!this._deflating && this._queue.length) {
				const params = this._queue.shift();
				this._bufferedBytes -= params[1].length;
				Reflect.apply(params[0], this, params.slice(1));
			}
		}
		/**
		* Enqueues a send operation.
		*
		* @param {Array} params Send operation parameters.
		* @private
		*/
		enqueue(params) {
			this._bufferedBytes += params[1].length;
			this._queue.push(params);
		}
		/**
		* Sends a frame.
		*
		* @param {Buffer[]} list The frame to send
		* @param {Function} [cb] Callback
		* @private
		*/
		sendFrame(list, cb) {
			if (list.length === 2) {
				this._socket.cork();
				this._socket.write(list[0]);
				this._socket.write(list[1], cb);
				this._socket.uncork();
			} else this._socket.write(list[0], cb);
		}
	};
}));
//#endregion
//#region node_modules/ws/lib/event-target.js
var require_event_target = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Class representing an event.
	*
	* @private
	*/
	var Event = class {
		/**
		* Create a new `Event`.
		*
		* @param {String} type The name of the event
		* @param {Object} target A reference to the target to which the event was
		*     dispatched
		*/
		constructor(type, target) {
			this.target = target;
			this.type = type;
		}
	};
	/**
	* Class representing a message event.
	*
	* @extends Event
	* @private
	*/
	var MessageEvent = class extends Event {
		/**
		* Create a new `MessageEvent`.
		*
		* @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
		* @param {WebSocket} target A reference to the target to which the event was
		*     dispatched
		*/
		constructor(data, target) {
			super("message", target);
			this.data = data;
		}
	};
	/**
	* Class representing a close event.
	*
	* @extends Event
	* @private
	*/
	var CloseEvent = class extends Event {
		/**
		* Create a new `CloseEvent`.
		*
		* @param {Number} code The status code explaining why the connection is being
		*     closed
		* @param {String} reason A human-readable string explaining why the
		*     connection is closing
		* @param {WebSocket} target A reference to the target to which the event was
		*     dispatched
		*/
		constructor(code, reason, target) {
			super("close", target);
			this.wasClean = target._closeFrameReceived && target._closeFrameSent;
			this.reason = reason;
			this.code = code;
		}
	};
	/**
	* Class representing an open event.
	*
	* @extends Event
	* @private
	*/
	var OpenEvent = class extends Event {
		/**
		* Create a new `OpenEvent`.
		*
		* @param {WebSocket} target A reference to the target to which the event was
		*     dispatched
		*/
		constructor(target) {
			super("open", target);
		}
	};
	/**
	* Class representing an error event.
	*
	* @extends Event
	* @private
	*/
	var ErrorEvent = class extends Event {
		/**
		* Create a new `ErrorEvent`.
		*
		* @param {Object} error The error that generated this event
		* @param {WebSocket} target A reference to the target to which the event was
		*     dispatched
		*/
		constructor(error, target) {
			super("error", target);
			this.message = error.message;
			this.error = error;
		}
	};
	module.exports = {
		/**
		* Register an event listener.
		*
		* @param {String} type A string representing the event type to listen for
		* @param {Function} listener The listener to add
		* @param {Object} [options] An options object specifies characteristics about
		*     the event listener
		* @param {Boolean} [options.once=false] A `Boolean`` indicating that the
		*     listener should be invoked at most once after being added. If `true`,
		*     the listener would be automatically removed when invoked.
		* @public
		*/
		addEventListener(type, listener, options) {
			if (typeof listener !== "function") return;
			function onMessage(data) {
				listener.call(this, new MessageEvent(data, this));
			}
			function onClose(code, message) {
				listener.call(this, new CloseEvent(code, message, this));
			}
			function onError(error) {
				listener.call(this, new ErrorEvent(error, this));
			}
			function onOpen() {
				listener.call(this, new OpenEvent(this));
			}
			const method = options && options.once ? "once" : "on";
			if (type === "message") {
				onMessage._listener = listener;
				this[method](type, onMessage);
			} else if (type === "close") {
				onClose._listener = listener;
				this[method](type, onClose);
			} else if (type === "error") {
				onError._listener = listener;
				this[method](type, onError);
			} else if (type === "open") {
				onOpen._listener = listener;
				this[method](type, onOpen);
			} else this[method](type, listener);
		},
		/**
		* Remove an event listener.
		*
		* @param {String} type A string representing the event type to remove
		* @param {Function} listener The listener to remove
		* @public
		*/
		removeEventListener(type, listener) {
			const listeners = this.listeners(type);
			for (let i = 0; i < listeners.length; i++) if (listeners[i] === listener || listeners[i]._listener === listener) this.removeListener(type, listeners[i]);
		}
	};
}));
//#endregion
//#region node_modules/ws/lib/extension.js
var require_extension = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var tokenChars = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		1,
		0,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		1,
		0,
		1,
		0
	];
	/**
	* Adds an offer to the map of extension offers or a parameter to the map of
	* parameters.
	*
	* @param {Object} dest The map of extension offers or parameters
	* @param {String} name The extension or parameter name
	* @param {(Object|Boolean|String)} elem The extension parameters or the
	*     parameter value
	* @private
	*/
	function push(dest, name, elem) {
		if (dest[name] === void 0) dest[name] = [elem];
		else dest[name].push(elem);
	}
	/**
	* Parses the `Sec-WebSocket-Extensions` header into an object.
	*
	* @param {String} header The field value of the header
	* @return {Object} The parsed object
	* @public
	*/
	function parse(header) {
		const offers = Object.create(null);
		if (header === void 0 || header === "") return offers;
		let params = Object.create(null);
		let mustUnescape = false;
		let isEscaping = false;
		let inQuotes = false;
		let extensionName;
		let paramName;
		let start = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			const code = header.charCodeAt(i);
			if (extensionName === void 0) {
				if (end === -1 && tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 32 || code === 9) {
					if (end === -1 && start !== -1) end = i;
				} else if (code === 59 || code === 44) {
					if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
					if (end === -1) end = i;
					const name = header.slice(start, end);
					if (code === 44) {
						push(offers, name, params);
						params = Object.create(null);
					} else extensionName = name;
					start = end = -1;
				} else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (paramName === void 0) {
				if (end === -1 && tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 32 || code === 9) {
					if (end === -1 && start !== -1) end = i;
				} else if (code === 59 || code === 44) {
					if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
					if (end === -1) end = i;
					push(params, header.slice(start, end), true);
					if (code === 44) {
						push(offers, extensionName, params);
						params = Object.create(null);
						extensionName = void 0;
					}
					start = end = -1;
				} else if (code === 61 && start !== -1 && end === -1) {
					paramName = header.slice(start, i);
					start = end = -1;
				} else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (isEscaping) {
				if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (start === -1) start = i;
				else if (!mustUnescape) mustUnescape = true;
				isEscaping = false;
			} else if (inQuotes) {
				if (tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 34 && start !== -1) {
					inQuotes = false;
					end = i;
				} else if (code === 92) isEscaping = true;
				else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (code === 34 && header.charCodeAt(i - 1) === 61) inQuotes = true;
			else if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (start !== -1 && (code === 32 || code === 9)) {
				if (end === -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				let value = header.slice(start, end);
				if (mustUnescape) {
					value = value.replace(/\\/g, "");
					mustUnescape = false;
				}
				push(params, paramName, value);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				paramName = void 0;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || inQuotes) throw new SyntaxError("Unexpected end of input");
		if (end === -1) end = i;
		const token = header.slice(start, end);
		if (extensionName === void 0) push(offers, token, params);
		else {
			if (paramName === void 0) push(params, token, true);
			else if (mustUnescape) push(params, paramName, token.replace(/\\/g, ""));
			else push(params, paramName, token);
			push(offers, extensionName, params);
		}
		return offers;
	}
	/**
	* Builds the `Sec-WebSocket-Extensions` header field value.
	*
	* @param {Object} extensions The map of extensions and parameters to format
	* @return {String} A string representing the given object
	* @public
	*/
	function format(extensions) {
		return Object.keys(extensions).map((extension) => {
			let configurations = extensions[extension];
			if (!Array.isArray(configurations)) configurations = [configurations];
			return configurations.map((params) => {
				return [extension].concat(Object.keys(params).map((k) => {
					let values = params[k];
					if (!Array.isArray(values)) values = [values];
					return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
				})).join("; ");
			}).join(", ");
		}).join(", ");
	}
	module.exports = {
		format,
		parse
	};
}));
//#endregion
//#region node_modules/ws/lib/websocket.js
var require_websocket = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter$2 = __require("events");
	var https = __require("https");
	var http$1 = __require("http");
	var net = __require("net");
	var tls = __require("tls");
	var { randomBytes, createHash: createHash$1 } = __require("crypto");
	var { Readable } = __require("stream");
	var { URL } = __require("url");
	var PerMessageDeflate = require_permessage_deflate();
	var Receiver = require_receiver();
	var Sender = require_sender();
	var { BINARY_TYPES, EMPTY_BUFFER, GUID, kStatusCode, kWebSocket, NOOP } = require_constants();
	var { addEventListener, removeEventListener } = require_event_target();
	var { format, parse } = require_extension();
	var { toBuffer } = require_buffer_util();
	var readyStates = [
		"CONNECTING",
		"OPEN",
		"CLOSING",
		"CLOSED"
	];
	var protocolVersions = [8, 13];
	var closeTimeout = 3e4;
	/**
	* Class representing a WebSocket.
	*
	* @extends EventEmitter
	*/
	var WebSocket = class WebSocket extends EventEmitter$2 {
		/**
		* Create a new `WebSocket`.
		*
		* @param {(String|URL)} address The URL to which to connect
		* @param {(String|String[])} [protocols] The subprotocols
		* @param {Object} [options] Connection options
		*/
		constructor(address, protocols, options) {
			super();
			this._binaryType = BINARY_TYPES[0];
			this._closeCode = 1006;
			this._closeFrameReceived = false;
			this._closeFrameSent = false;
			this._closeMessage = "";
			this._closeTimer = null;
			this._extensions = {};
			this._protocol = "";
			this._readyState = WebSocket.CONNECTING;
			this._receiver = null;
			this._sender = null;
			this._socket = null;
			if (address !== null) {
				this._bufferedAmount = 0;
				this._isServer = false;
				this._redirects = 0;
				if (Array.isArray(protocols)) protocols = protocols.join(", ");
				else if (typeof protocols === "object" && protocols !== null) {
					options = protocols;
					protocols = void 0;
				}
				initAsClient(this, address, protocols, options);
			} else this._isServer = true;
		}
		/**
		* This deviates from the WHATWG interface since ws doesn't support the
		* required default "blob" type (instead we define a custom "nodebuffer"
		* type).
		*
		* @type {String}
		*/
		get binaryType() {
			return this._binaryType;
		}
		set binaryType(type) {
			if (!BINARY_TYPES.includes(type)) return;
			this._binaryType = type;
			if (this._receiver) this._receiver._binaryType = type;
		}
		/**
		* @type {Number}
		*/
		get bufferedAmount() {
			if (!this._socket) return this._bufferedAmount;
			return this._socket._writableState.length + this._sender._bufferedBytes;
		}
		/**
		* @type {String}
		*/
		get extensions() {
			return Object.keys(this._extensions).join();
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onclose() {}
		/* istanbul ignore next */
		set onclose(listener) {}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onerror() {}
		/* istanbul ignore next */
		set onerror(listener) {}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onopen() {}
		/* istanbul ignore next */
		set onopen(listener) {}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onmessage() {}
		/* istanbul ignore next */
		set onmessage(listener) {}
		/**
		* @type {String}
		*/
		get protocol() {
			return this._protocol;
		}
		/**
		* @type {Number}
		*/
		get readyState() {
			return this._readyState;
		}
		/**
		* @type {String}
		*/
		get url() {
			return this._url;
		}
		/**
		* Set up the socket and the internal resources.
		*
		* @param {(net.Socket|tls.Socket)} socket The network socket between the
		*     server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Number} [maxPayload=0] The maximum allowed message size
		* @param {Number} [maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [maxFragments=0] The maximum number of message
		*     fragments
		* @private
		*/
		setSocket(socket, head, maxPayload, maxBufferedChunks, maxFragments) {
			const receiver = new Receiver(this.binaryType, this._extensions, this._isServer, maxPayload, maxBufferedChunks, maxFragments);
			this._sender = new Sender(socket, this._extensions);
			this._receiver = receiver;
			this._socket = socket;
			receiver[kWebSocket] = this;
			socket[kWebSocket] = this;
			receiver.on("conclude", receiverOnConclude);
			receiver.on("drain", receiverOnDrain);
			receiver.on("error", receiverOnError);
			receiver.on("message", receiverOnMessage);
			receiver.on("ping", receiverOnPing);
			receiver.on("pong", receiverOnPong);
			socket.setTimeout(0);
			socket.setNoDelay();
			if (head.length > 0) socket.unshift(head);
			socket.on("close", socketOnClose);
			socket.on("data", socketOnData);
			socket.on("end", socketOnEnd);
			socket.on("error", socketOnError);
			this._readyState = WebSocket.OPEN;
			this.emit("open");
		}
		/**
		* Emit the `'close'` event.
		*
		* @private
		*/
		emitClose() {
			if (!this._socket) {
				this._readyState = WebSocket.CLOSED;
				this.emit("close", this._closeCode, this._closeMessage);
				return;
			}
			if (this._extensions[PerMessageDeflate.extensionName]) this._extensions[PerMessageDeflate.extensionName].cleanup();
			this._receiver.removeAllListeners();
			this._readyState = WebSocket.CLOSED;
			this.emit("close", this._closeCode, this._closeMessage);
		}
		/**
		* Start a closing handshake.
		*
		*          +----------+   +-----------+   +----------+
		*     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
		*    |     +----------+   +-----------+   +----------+     |
		*          +----------+   +-----------+         |
		* CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
		*          +----------+   +-----------+   |
		*    |           |                        |   +---+        |
		*                +------------------------+-->|fin| - - - -
		*    |         +---+                      |   +---+
		*     - - - - -|fin|<---------------------+
		*              +---+
		*
		* @param {Number} [code] Status code explaining why the connection is closing
		* @param {String} [data] A string explaining why the connection is closing
		* @public
		*/
		close(code, data) {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) return abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
			if (this.readyState === WebSocket.CLOSING) {
				if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) this._socket.end();
				return;
			}
			this._readyState = WebSocket.CLOSING;
			this._sender.close(code, data, !this._isServer, (err) => {
				if (err) return;
				this._closeFrameSent = true;
				if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) this._socket.end();
			});
			this._closeTimer = setTimeout(this._socket.destroy.bind(this._socket), closeTimeout);
		}
		/**
		* Send a ping.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the ping is sent
		* @public
		*/
		ping(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.ping(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Send a pong.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the pong is sent
		* @public
		*/
		pong(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.pong(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Send a data message.
		*
		* @param {*} data The message to send
		* @param {Object} [options] Options object
		* @param {Boolean} [options.compress] Specifies whether or not to compress
		*     `data`
		* @param {Boolean} [options.binary] Specifies whether `data` is binary or
		*     text
		* @param {Boolean} [options.fin=true] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when data is written out
		* @public
		*/
		send(data, options, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof options === "function") {
				cb = options;
				options = {};
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			const opts = {
				binary: typeof data !== "string",
				mask: !this._isServer,
				compress: true,
				fin: true,
				...options
			};
			if (!this._extensions[PerMessageDeflate.extensionName]) opts.compress = false;
			this._sender.send(data || EMPTY_BUFFER, opts, cb);
		}
		/**
		* Forcibly close the connection.
		*
		* @public
		*/
		terminate() {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) return abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
			if (this._socket) {
				this._readyState = WebSocket.CLOSING;
				this._socket.destroy();
			}
		}
	};
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	[
		"binaryType",
		"bufferedAmount",
		"extensions",
		"protocol",
		"readyState",
		"url"
	].forEach((property) => {
		Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});
	[
		"open",
		"error",
		"close",
		"message"
	].forEach((method) => {
		Object.defineProperty(WebSocket.prototype, `on${method}`, {
			enumerable: true,
			get() {
				const listeners = this.listeners(method);
				for (let i = 0; i < listeners.length; i++) if (listeners[i]._listener) return listeners[i]._listener;
			},
			set(listener) {
				const listeners = this.listeners(method);
				for (let i = 0; i < listeners.length; i++) if (listeners[i]._listener) this.removeListener(method, listeners[i]);
				this.addEventListener(method, listener);
			}
		});
	});
	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;
	module.exports = WebSocket;
	/**
	* Initialize a WebSocket client.
	*
	* @param {WebSocket} websocket The client to initialize
	* @param {(String|URL)} address The URL to which to connect
	* @param {String} [protocols] The subprotocols
	* @param {Object} [options] Connection options
	* @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
	*     permessage-deflate
	* @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
	*     handshake request
	* @param {Number} [options.protocolVersion=13] Value of the
	*     `Sec-WebSocket-Version` header
	* @param {String} [options.origin] Value of the `Origin` or
	*     `Sec-WebSocket-Origin` header
	* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
	*     buffered data chunks
	* @param {Number} [options.maxFragments=16384] The maximum number of message
	*     fragments
	* @param {Number} [options.maxPayload=104857600] The maximum allowed message
	*     size
	* @param {Boolean} [options.followRedirects=false] Whether or not to follow
	*     redirects
	* @param {Number} [options.maxRedirects=10] The maximum number of redirects
	*     allowed
	* @private
	*/
	function initAsClient(websocket, address, protocols, options) {
		const opts = {
			protocolVersion: protocolVersions[1],
			maxBufferedChunks: 262144,
			maxFragments: 16384,
			maxPayload: 104857600,
			perMessageDeflate: true,
			followRedirects: false,
			maxRedirects: 10,
			...options,
			createConnection: void 0,
			socketPath: void 0,
			hostname: void 0,
			protocol: void 0,
			timeout: void 0,
			method: void 0,
			host: void 0,
			path: void 0,
			port: void 0
		};
		if (!protocolVersions.includes(opts.protocolVersion)) throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
		let parsedUrl;
		if (address instanceof URL) {
			parsedUrl = address;
			websocket._url = address.href;
		} else {
			parsedUrl = new URL(address);
			websocket._url = address;
		}
		const isUnixSocket = parsedUrl.protocol === "ws+unix:";
		if (!parsedUrl.host && (!isUnixSocket || !parsedUrl.pathname)) {
			const err = /* @__PURE__ */ new Error(`Invalid URL: ${websocket.url}`);
			if (websocket._redirects === 0) throw err;
			else {
				emitErrorAndClose(websocket, err);
				return;
			}
		}
		const isSecure = parsedUrl.protocol === "wss:" || parsedUrl.protocol === "https:";
		const defaultPort = isSecure ? 443 : 80;
		const key = randomBytes(16).toString("base64");
		const get = isSecure ? https.get : http$1.get;
		let perMessageDeflate;
		opts.createConnection = isSecure ? tlsConnect : netConnect;
		opts.defaultPort = opts.defaultPort || defaultPort;
		opts.port = parsedUrl.port || defaultPort;
		opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
		opts.headers = {
			"Sec-WebSocket-Version": opts.protocolVersion,
			"Sec-WebSocket-Key": key,
			Connection: "Upgrade",
			Upgrade: "websocket",
			...opts.headers
		};
		opts.path = parsedUrl.pathname + parsedUrl.search;
		opts.timeout = opts.handshakeTimeout;
		if (opts.perMessageDeflate) {
			perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
			opts.headers["Sec-WebSocket-Extensions"] = format({ [PerMessageDeflate.extensionName]: perMessageDeflate.offer() });
		}
		if (protocols) opts.headers["Sec-WebSocket-Protocol"] = protocols;
		if (opts.origin) {
			if (opts.protocolVersion < 13) opts.headers["Sec-WebSocket-Origin"] = opts.origin;
			else opts.headers.Origin = opts.origin;
		}
		if (parsedUrl.username || parsedUrl.password) opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
		if (isUnixSocket) {
			const parts = opts.path.split(":");
			opts.socketPath = parts[0];
			opts.path = parts[1];
		}
		if (opts.followRedirects) {
			if (websocket._redirects === 0) {
				websocket._originalUnixSocket = isUnixSocket;
				websocket._originalSecure = isSecure;
				websocket._originalHostOrSocketPath = isUnixSocket ? opts.socketPath : parsedUrl.host;
				const headers = options && options.headers;
				options = {
					...options,
					headers: {}
				};
				if (headers) for (const [key, value] of Object.entries(headers)) options.headers[key.toLowerCase()] = value;
			} else {
				const isSameHost = isUnixSocket ? websocket._originalUnixSocket ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalUnixSocket ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
				if (!isSameHost || websocket._originalSecure && !isSecure) {
					delete opts.headers.authorization;
					delete opts.headers.cookie;
					if (!isSameHost) delete opts.headers.host;
					opts.auth = void 0;
				}
			}
			if (opts.auth && !options.headers.authorization) options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
		}
		let req = websocket._req = get(opts);
		if (opts.timeout) req.on("timeout", () => {
			abortHandshake(websocket, req, "Opening handshake has timed out");
		});
		req.on("error", (err) => {
			if (req === null || req.aborted) return;
			req = websocket._req = null;
			emitErrorAndClose(websocket, err);
		});
		req.on("response", (res) => {
			const location = res.headers.location;
			const statusCode = res.statusCode;
			if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
				if (++websocket._redirects > opts.maxRedirects) {
					abortHandshake(websocket, req, "Maximum redirects exceeded");
					return;
				}
				req.abort();
				let addr;
				try {
					addr = new URL(location, address);
				} catch (err) {
					emitErrorAndClose(websocket, err);
					return;
				}
				initAsClient(websocket, addr, protocols, options);
			} else if (!websocket.emit("unexpected-response", req, res)) abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
		});
		req.on("upgrade", (res, socket, head) => {
			websocket.emit("upgrade", res);
			if (websocket.readyState !== WebSocket.CONNECTING) return;
			req = websocket._req = null;
			const upgrade = res.headers.upgrade;
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshake(websocket, socket, "Invalid Upgrade header");
				return;
			}
			const digest = createHash$1("sha1").update(key + GUID).digest("base64");
			if (res.headers["sec-websocket-accept"] !== digest) {
				abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
				return;
			}
			const serverProt = res.headers["sec-websocket-protocol"];
			const protList = (protocols || "").split(/, */);
			let protError;
			if (!protocols && serverProt) protError = "Server sent a subprotocol but none was requested";
			else if (protocols && !serverProt) protError = "Server sent no subprotocol";
			else if (serverProt && !protList.includes(serverProt)) protError = "Server sent an invalid subprotocol";
			if (protError) {
				abortHandshake(websocket, socket, protError);
				return;
			}
			if (serverProt) websocket._protocol = serverProt;
			const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
			if (secWebSocketExtensions !== void 0) {
				if (!perMessageDeflate) {
					abortHandshake(websocket, socket, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
					return;
				}
				let extensions;
				try {
					extensions = parse(secWebSocketExtensions);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				const extensionNames = Object.keys(extensions);
				if (extensionNames.length) {
					if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
						abortHandshake(websocket, socket, "Server indicated an extension that was not requested");
						return;
					}
					try {
						perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
					} catch (err) {
						abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
						return;
					}
					websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
				}
			}
			websocket.setSocket(socket, head, opts.maxPayload, opts.maxBufferedChunks, opts.maxFragments);
		});
	}
	/**
	* Emit the `'error'` and `'close'` event.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {Error} The error to emit
	* @private
	*/
	function emitErrorAndClose(websocket, err) {
		websocket._readyState = WebSocket.CLOSING;
		websocket.emit("error", err);
		websocket.emitClose();
	}
	/**
	* Create a `net.Socket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {net.Socket} The newly created socket used to start the connection
	* @private
	*/
	function netConnect(options) {
		options.path = options.socketPath;
		return net.connect(options);
	}
	/**
	* Create a `tls.TLSSocket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {tls.TLSSocket} The newly created socket used to start the connection
	* @private
	*/
	function tlsConnect(options) {
		options.path = void 0;
		if (!options.servername && options.servername !== "") options.servername = net.isIP(options.host) ? "" : options.host;
		return tls.connect(options);
	}
	/**
	* Abort the handshake and emit an error.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
	*     abort or the socket to destroy
	* @param {String} message The error message
	* @private
	*/
	function abortHandshake(websocket, stream, message) {
		websocket._readyState = WebSocket.CLOSING;
		const err = new Error(message);
		Error.captureStackTrace(err, abortHandshake);
		if (stream.setHeader) {
			stream.abort();
			if (stream.socket && !stream.socket.destroyed) stream.socket.destroy();
			stream.once("abort", websocket.emitClose.bind(websocket));
			websocket.emit("error", err);
		} else {
			stream.destroy(err);
			stream.once("error", websocket.emit.bind(websocket, "error"));
			stream.once("close", websocket.emitClose.bind(websocket));
		}
	}
	/**
	* Handle cases where the `ping()`, `pong()`, or `send()` methods are called
	* when the `readyState` attribute is `CLOSING` or `CLOSED`.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {*} [data] The data to send
	* @param {Function} [cb] Callback
	* @private
	*/
	function sendAfterClose(websocket, data, cb) {
		if (data) {
			const length = toBuffer(data).length;
			if (websocket._socket) websocket._sender._bufferedBytes += length;
			else websocket._bufferedAmount += length;
		}
		if (cb) cb(/* @__PURE__ */ new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`));
	}
	/**
	* The listener of the `Receiver` `'conclude'` event.
	*
	* @param {Number} code The status code
	* @param {String} reason The reason for closing
	* @private
	*/
	function receiverOnConclude(code, reason) {
		const websocket = this[kWebSocket];
		websocket._closeFrameReceived = true;
		websocket._closeMessage = reason;
		websocket._closeCode = code;
		if (websocket._socket[kWebSocket] === void 0) return;
		websocket._socket.removeListener("data", socketOnData);
		process.nextTick(resume, websocket._socket);
		if (code === 1005) websocket.close();
		else websocket.close(code, reason);
	}
	/**
	* The listener of the `Receiver` `'drain'` event.
	*
	* @private
	*/
	function receiverOnDrain() {
		this[kWebSocket]._socket.resume();
	}
	/**
	* The listener of the `Receiver` `'error'` event.
	*
	* @param {(RangeError|Error)} err The emitted error
	* @private
	*/
	function receiverOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket._socket[kWebSocket] !== void 0) {
			websocket._socket.removeListener("data", socketOnData);
			process.nextTick(resume, websocket._socket);
			websocket.close(err[kStatusCode]);
		}
		websocket.emit("error", err);
	}
	/**
	* The listener of the `Receiver` `'finish'` event.
	*
	* @private
	*/
	function receiverOnFinish() {
		this[kWebSocket].emitClose();
	}
	/**
	* The listener of the `Receiver` `'message'` event.
	*
	* @param {(String|Buffer|ArrayBuffer|Buffer[])} data The message
	* @private
	*/
	function receiverOnMessage(data) {
		this[kWebSocket].emit("message", data);
	}
	/**
	* The listener of the `Receiver` `'ping'` event.
	*
	* @param {Buffer} data The data included in the ping frame
	* @private
	*/
	function receiverOnPing(data) {
		const websocket = this[kWebSocket];
		websocket.pong(data, !websocket._isServer, NOOP);
		websocket.emit("ping", data);
	}
	/**
	* The listener of the `Receiver` `'pong'` event.
	*
	* @param {Buffer} data The data included in the pong frame
	* @private
	*/
	function receiverOnPong(data) {
		this[kWebSocket].emit("pong", data);
	}
	/**
	* Resume a readable stream
	*
	* @param {Readable} stream The readable stream
	* @private
	*/
	function resume(stream) {
		stream.resume();
	}
	/**
	* The listener of the `net.Socket` `'close'` event.
	*
	* @private
	*/
	function socketOnClose() {
		const websocket = this[kWebSocket];
		this.removeListener("close", socketOnClose);
		this.removeListener("data", socketOnData);
		this.removeListener("end", socketOnEnd);
		websocket._readyState = WebSocket.CLOSING;
		let chunk;
		if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) websocket._receiver.write(chunk);
		websocket._receiver.end();
		this[kWebSocket] = void 0;
		clearTimeout(websocket._closeTimer);
		if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) websocket.emitClose();
		else {
			websocket._receiver.on("error", receiverOnFinish);
			websocket._receiver.on("finish", receiverOnFinish);
		}
	}
	/**
	* The listener of the `net.Socket` `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function socketOnData(chunk) {
		if (!this[kWebSocket]._receiver.write(chunk)) this.pause();
	}
	/**
	* The listener of the `net.Socket` `'end'` event.
	*
	* @private
	*/
	function socketOnEnd() {
		const websocket = this[kWebSocket];
		websocket._readyState = WebSocket.CLOSING;
		websocket._receiver.end();
		this.end();
	}
	/**
	* The listener of the `net.Socket` `'error'` event.
	*
	* @private
	*/
	function socketOnError() {
		const websocket = this[kWebSocket];
		this.removeListener("error", socketOnError);
		this.on("error", NOOP);
		if (websocket) {
			websocket._readyState = WebSocket.CLOSING;
			this.destroy();
		}
	}
}));
//#endregion
//#region node_modules/ws/lib/stream.js
var require_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Duplex } = __require("stream");
	/**
	* Emits the `'close'` event on a stream.
	*
	* @param {Duplex} stream The stream.
	* @private
	*/
	function emitClose(stream) {
		stream.emit("close");
	}
	/**
	* The listener of the `'end'` event.
	*
	* @private
	*/
	function duplexOnEnd() {
		if (!this.destroyed && this._writableState.finished) this.destroy();
	}
	/**
	* The listener of the `'error'` event.
	*
	* @param {Error} err The error
	* @private
	*/
	function duplexOnError(err) {
		this.removeListener("error", duplexOnError);
		this.destroy();
		if (this.listenerCount("error") === 0) this.emit("error", err);
	}
	/**
	* Wraps a `WebSocket` in a duplex stream.
	*
	* @param {WebSocket} ws The `WebSocket` to wrap
	* @param {Object} [options] The options for the `Duplex` constructor
	* @return {Duplex} The duplex stream
	* @public
	*/
	function createWebSocketStream(ws, options) {
		let resumeOnReceiverDrain = true;
		let terminateOnDestroy = true;
		function receiverOnDrain() {
			if (resumeOnReceiverDrain) ws._socket.resume();
		}
		if (ws.readyState === ws.CONNECTING) ws.once("open", function open() {
			ws._receiver.removeAllListeners("drain");
			ws._receiver.on("drain", receiverOnDrain);
		});
		else {
			ws._receiver.removeAllListeners("drain");
			ws._receiver.on("drain", receiverOnDrain);
		}
		const duplex = new Duplex({
			...options,
			autoDestroy: false,
			emitClose: false,
			objectMode: false,
			writableObjectMode: false
		});
		ws.on("message", function message(msg) {
			if (!duplex.push(msg)) {
				resumeOnReceiverDrain = false;
				ws._socket.pause();
			}
		});
		ws.once("error", function error(err) {
			if (duplex.destroyed) return;
			terminateOnDestroy = false;
			duplex.destroy(err);
		});
		ws.once("close", function close() {
			if (duplex.destroyed) return;
			duplex.push(null);
		});
		duplex._destroy = function(err, callback) {
			if (ws.readyState === ws.CLOSED) {
				callback(err);
				process.nextTick(emitClose, duplex);
				return;
			}
			let called = false;
			ws.once("error", function error(err) {
				called = true;
				callback(err);
			});
			ws.once("close", function close() {
				if (!called) callback(err);
				process.nextTick(emitClose, duplex);
			});
			if (terminateOnDestroy) ws.terminate();
		};
		duplex._final = function(callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._final(callback);
				});
				return;
			}
			if (ws._socket === null) return;
			if (ws._socket._writableState.finished) {
				callback();
				if (duplex._readableState.endEmitted) duplex.destroy();
			} else {
				ws._socket.once("finish", function finish() {
					callback();
				});
				ws.close();
			}
		};
		duplex._read = function() {
			if ((ws.readyState === ws.OPEN || ws.readyState === ws.CLOSING) && !resumeOnReceiverDrain) {
				resumeOnReceiverDrain = true;
				if (!ws._receiver._writableState.needDrain) ws._socket.resume();
			}
		};
		duplex._write = function(chunk, encoding, callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._write(chunk, encoding, callback);
				});
				return;
			}
			ws.send(chunk, callback);
		};
		duplex.on("end", duplexOnEnd);
		duplex.on("error", duplexOnError);
		return duplex;
	}
	module.exports = createWebSocketStream;
}));
//#endregion
//#region node_modules/ws/lib/websocket-server.js
var require_websocket_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter$1 = __require("events");
	var http = __require("http");
	__require("https");
	__require("net");
	__require("tls");
	var { createHash } = __require("crypto");
	var PerMessageDeflate = require_permessage_deflate();
	var WebSocket = require_websocket();
	var { format, parse } = require_extension();
	var { GUID, kWebSocket } = require_constants();
	var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
	var RUNNING = 0;
	var CLOSING = 1;
	var CLOSED = 2;
	/**
	* Class representing a WebSocket server.
	*
	* @extends EventEmitter
	*/
	var WebSocketServer = class extends EventEmitter$1 {
		/**
		* Create a `WebSocketServer` instance.
		*
		* @param {Object} options Configuration options
		* @param {Number} [options.backlog=511] The maximum length of the queue of
		*     pending connections
		* @param {Boolean} [options.clientTracking=true] Specifies whether or not to
		*     track clients
		* @param {Function} [options.handleProtocols] A hook to handle protocols
		* @param {String} [options.host] The hostname where to bind the server
		* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=16384] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=104857600] The maximum allowed message
		*     size
		* @param {Boolean} [options.noServer=false] Enable no server mode
		* @param {String} [options.path] Accept only connections matching this path
		* @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
		*     permessage-deflate
		* @param {Number} [options.port] The port where to bind the server
		* @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
		*     server to use
		* @param {Function} [options.verifyClient] A hook to reject connections
		* @param {Function} [callback] A listener for the `listening` event
		*/
		constructor(options, callback) {
			super();
			options = {
				maxBufferedChunks: 262144,
				maxFragments: 16384,
				maxPayload: 104857600,
				perMessageDeflate: false,
				handleProtocols: null,
				clientTracking: true,
				verifyClient: null,
				noServer: false,
				backlog: null,
				server: null,
				host: null,
				path: null,
				port: null,
				...options
			};
			if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) throw new TypeError("One and only one of the \"port\", \"server\", or \"noServer\" options must be specified");
			if (options.port != null) {
				this._server = http.createServer((req, res) => {
					const body = http.STATUS_CODES[426];
					res.writeHead(426, {
						"Content-Length": body.length,
						"Content-Type": "text/plain"
					});
					res.end(body);
				});
				this._server.listen(options.port, options.host, options.backlog, callback);
			} else if (options.server) this._server = options.server;
			if (this._server) {
				const emitConnection = this.emit.bind(this, "connection");
				this._removeListeners = addListeners(this._server, {
					listening: this.emit.bind(this, "listening"),
					error: this.emit.bind(this, "error"),
					upgrade: (req, socket, head) => {
						this.handleUpgrade(req, socket, head, emitConnection);
					}
				});
			}
			if (options.perMessageDeflate === true) options.perMessageDeflate = {};
			if (options.clientTracking) this.clients = /* @__PURE__ */ new Set();
			this.options = options;
			this._state = RUNNING;
		}
		/**
		* Returns the bound address, the address family name, and port of the server
		* as reported by the operating system if listening on an IP socket.
		* If the server is listening on a pipe or UNIX domain socket, the name is
		* returned as a string.
		*
		* @return {(Object|String|null)} The address of the server
		* @public
		*/
		address() {
			if (this.options.noServer) throw new Error("The server is operating in \"noServer\" mode");
			if (!this._server) return null;
			return this._server.address();
		}
		/**
		* Close the server.
		*
		* @param {Function} [cb] Callback
		* @public
		*/
		close(cb) {
			if (cb) this.once("close", cb);
			if (this._state === CLOSED) {
				process.nextTick(emitClose, this);
				return;
			}
			if (this._state === CLOSING) return;
			this._state = CLOSING;
			if (this.clients) for (const client of this.clients) client.terminate();
			const server = this._server;
			if (server) {
				this._removeListeners();
				this._removeListeners = this._server = null;
				if (this.options.port != null) {
					server.close(emitClose.bind(void 0, this));
					return;
				}
			}
			process.nextTick(emitClose, this);
		}
		/**
		* See if a given request should be handled by this server instance.
		*
		* @param {http.IncomingMessage} req Request object to inspect
		* @return {Boolean} `true` if the request is valid, else `false`
		* @public
		*/
		shouldHandle(req) {
			if (this.options.path) {
				const index = req.url.indexOf("?");
				if ((index !== -1 ? req.url.slice(0, index) : req.url) !== this.options.path) return false;
			}
			return true;
		}
		/**
		* Handle a HTTP Upgrade request.
		*
		* @param {http.IncomingMessage} req The request object
		* @param {(net.Socket|tls.Socket)} socket The network socket between the
		*     server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @public
		*/
		handleUpgrade(req, socket, head, cb) {
			socket.on("error", socketOnError);
			const key = req.headers["sec-websocket-key"] !== void 0 ? req.headers["sec-websocket-key"].trim() : false;
			const upgrade = req.headers.upgrade;
			const version = +req.headers["sec-websocket-version"];
			const extensions = {};
			if (req.method !== "GET" || upgrade === void 0 || upgrade.toLowerCase() !== "websocket" || !key || !keyRegex.test(key) || version !== 8 && version !== 13 || !this.shouldHandle(req)) return abortHandshake(socket, 400);
			if (this.options.perMessageDeflate) {
				const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
				try {
					const offers = parse(req.headers["sec-websocket-extensions"]);
					if (offers[PerMessageDeflate.extensionName]) {
						perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
						extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
					}
				} catch (err) {
					return abortHandshake(socket, 400);
				}
			}
			if (this.options.verifyClient) {
				const info = {
					origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
					secure: !!(req.socket.authorized || req.socket.encrypted),
					req
				};
				if (this.options.verifyClient.length === 2) {
					this.options.verifyClient(info, (verified, code, message, headers) => {
						if (!verified) return abortHandshake(socket, code || 401, message, headers);
						this.completeUpgrade(key, extensions, req, socket, head, cb);
					});
					return;
				}
				if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
			}
			this.completeUpgrade(key, extensions, req, socket, head, cb);
		}
		/**
		* Upgrade the connection to WebSocket.
		*
		* @param {String} key The value of the `Sec-WebSocket-Key` header
		* @param {Object} extensions The accepted extensions
		* @param {http.IncomingMessage} req The request object
		* @param {(net.Socket|tls.Socket)} socket The network socket between the
		*     server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @throws {Error} If called more than once with the same socket
		* @private
		*/
		completeUpgrade(key, extensions, req, socket, head, cb) {
			if (!socket.readable || !socket.writable) return socket.destroy();
			if (socket[kWebSocket]) throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
			if (this._state > RUNNING) return abortHandshake(socket, 503);
			const headers = [
				"HTTP/1.1 101 Switching Protocols",
				"Upgrade: websocket",
				"Connection: Upgrade",
				`Sec-WebSocket-Accept: ${createHash("sha1").update(key + GUID).digest("base64")}`
			];
			const ws = new WebSocket(null);
			let protocol = req.headers["sec-websocket-protocol"];
			if (protocol) {
				protocol = protocol.split(",").map(trim);
				if (this.options.handleProtocols) protocol = this.options.handleProtocols(protocol, req);
				else protocol = protocol[0];
				if (protocol) {
					headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
					ws._protocol = protocol;
				}
			}
			if (extensions[PerMessageDeflate.extensionName]) {
				const params = extensions[PerMessageDeflate.extensionName].params;
				const value = format({ [PerMessageDeflate.extensionName]: [params] });
				headers.push(`Sec-WebSocket-Extensions: ${value}`);
				ws._extensions = extensions;
			}
			this.emit("headers", headers, req);
			socket.write(headers.concat("\r\n").join("\r\n"));
			socket.removeListener("error", socketOnError);
			ws.setSocket(socket, head, this.options.maxPayload, this.options.maxBufferedChunks, this.options.maxFragments);
			if (this.clients) {
				this.clients.add(ws);
				ws.on("close", () => this.clients.delete(ws));
			}
			cb(ws, req);
		}
	};
	module.exports = WebSocketServer;
	/**
	* Add event listeners on an `EventEmitter` using a map of <event, listener>
	* pairs.
	*
	* @param {EventEmitter} server The event emitter
	* @param {Object.<String, Function>} map The listeners to add
	* @return {Function} A function that will remove the added listeners when
	*     called
	* @private
	*/
	function addListeners(server, map) {
		for (const event of Object.keys(map)) server.on(event, map[event]);
		return function removeListeners() {
			for (const event of Object.keys(map)) server.removeListener(event, map[event]);
		};
	}
	/**
	* Emit a `'close'` event on an `EventEmitter`.
	*
	* @param {EventEmitter} server The event emitter
	* @private
	*/
	function emitClose(server) {
		server._state = CLOSED;
		server.emit("close");
	}
	/**
	* Handle premature socket errors.
	*
	* @private
	*/
	function socketOnError() {
		this.destroy();
	}
	/**
	* Close the connection when preconditions are not fulfilled.
	*
	* @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} [message] The HTTP response body
	* @param {Object} [headers] Additional HTTP response headers
	* @private
	*/
	function abortHandshake(socket, code, message, headers) {
		if (socket.writable) {
			message = message || http.STATUS_CODES[code];
			headers = {
				Connection: "close",
				"Content-Type": "text/html",
				"Content-Length": Buffer.byteLength(message),
				...headers
			};
			socket.write(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
		}
		socket.removeListener("error", socketOnError);
		socket.destroy();
	}
	/**
	* Remove whitespace characters from both ends of a string.
	*
	* @param {String} str The string
	* @return {String} A new string representing `str` stripped of whitespace
	*     characters from both its beginning and end
	* @private
	*/
	function trim(str) {
		return str.trim();
	}
}));
//#endregion
//#region node_modules/ws/index.js
var require_ws = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var WebSocket = require_websocket();
	WebSocket.createWebSocketStream = require_stream();
	WebSocket.Server = require_websocket_server();
	WebSocket.Receiver = require_receiver();
	WebSocket.Sender = require_sender();
	module.exports = WebSocket;
}));
//#endregion
//#region node_modules/@monsterbitar/isomorphic-ws/import.mjs
var import_ws = /* @__PURE__ */ __toESM(require_ws(), 1);
//#endregion
//#region node_modules/@electrum-cash/web-socket/node_modules/eventemitter3/index.mjs
var import_eventemitter3 = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var has = Object.prototype.hasOwnProperty;
	var prefix = "~";
	/**
	* Constructor to create a storage for our `EE` objects.
	* An `Events` instance is a plain object whose properties are event names.
	*
	* @constructor
	* @private
	*/
	function Events() {}
	if (Object.create) {
		Events.prototype = Object.create(null);
		if (!new Events().__proto__) prefix = false;
	}
	/**
	* Representation of a single event listener.
	*
	* @param {Function} fn The listener function.
	* @param {*} context The context to invoke the listener with.
	* @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	* @constructor
	* @private
	*/
	function EE(fn, context, once) {
		this.fn = fn;
		this.context = context;
		this.once = once || false;
	}
	/**
	* Add a listener for a given event.
	*
	* @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn The listener function.
	* @param {*} context The context to invoke the listener with.
	* @param {Boolean} once Specify if the listener is a one-time listener.
	* @returns {EventEmitter}
	* @private
	*/
	function addListener(emitter, event, fn, context, once) {
		if (typeof fn !== "function") throw new TypeError("The listener must be a function");
		var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
		if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		else emitter._events[evt] = [emitter._events[evt], listener];
		return emitter;
	}
	/**
	* Clear event by name.
	*
	* @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	* @param {(String|Symbol)} evt The Event name.
	* @private
	*/
	function clearEvent(emitter, evt) {
		if (--emitter._eventsCount === 0) emitter._events = new Events();
		else delete emitter._events[evt];
	}
	/**
	* Minimal `EventEmitter` interface that is molded against the Node.js
	* `EventEmitter` interface.
	*
	* @constructor
	* @public
	*/
	function EventEmitter() {
		this._events = new Events();
		this._eventsCount = 0;
	}
	/**
	* Return an array listing the events for which the emitter has registered
	* listeners.
	*
	* @returns {Array}
	* @public
	*/
	EventEmitter.prototype.eventNames = function eventNames() {
		var names = [], events, name;
		if (this._eventsCount === 0) return names;
		for (name in events = this._events) if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		if (Object.getOwnPropertySymbols) return names.concat(Object.getOwnPropertySymbols(events));
		return names;
	};
	/**
	* Return the listeners registered for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @returns {Array} The registered listeners.
	* @public
	*/
	EventEmitter.prototype.listeners = function listeners(event) {
		var evt = prefix ? prefix + event : event, handlers = this._events[evt];
		if (!handlers) return [];
		if (handlers.fn) return [handlers.fn];
		for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) ee[i] = handlers[i].fn;
		return ee;
	};
	/**
	* Return the number of listeners listening to a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @returns {Number} The number of listeners.
	* @public
	*/
	EventEmitter.prototype.listenerCount = function listenerCount(event) {
		var evt = prefix ? prefix + event : event, listeners = this._events[evt];
		if (!listeners) return 0;
		if (listeners.fn) return 1;
		return listeners.length;
	};
	/**
	* Calls each of the listeners registered for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @returns {Boolean} `true` if the event had listeners, else `false`.
	* @public
	*/
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		var evt = prefix ? prefix + event : event;
		if (!this._events[evt]) return false;
		var listeners = this._events[evt], len = arguments.length, args, i;
		if (listeners.fn) {
			if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
			switch (len) {
				case 1: return listeners.fn.call(listeners.context), true;
				case 2: return listeners.fn.call(listeners.context, a1), true;
				case 3: return listeners.fn.call(listeners.context, a1, a2), true;
				case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
				case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
				case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
			}
			for (i = 1, args = new Array(len - 1); i < len; i++) args[i - 1] = arguments[i];
			listeners.fn.apply(listeners.context, args);
		} else {
			var length = listeners.length, j;
			for (i = 0; i < length; i++) {
				if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
				switch (len) {
					case 1:
						listeners[i].fn.call(listeners[i].context);
						break;
					case 2:
						listeners[i].fn.call(listeners[i].context, a1);
						break;
					case 3:
						listeners[i].fn.call(listeners[i].context, a1, a2);
						break;
					case 4:
						listeners[i].fn.call(listeners[i].context, a1, a2, a3);
						break;
					default:
						if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) args[j - 1] = arguments[j];
						listeners[i].fn.apply(listeners[i].context, args);
				}
			}
		}
		return true;
	};
	/**
	* Add a listener for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn The listener function.
	* @param {*} [context=this] The context to invoke the listener with.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.on = function on(event, fn, context) {
		return addListener(this, event, fn, context, false);
	};
	/**
	* Add a one-time listener for a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn The listener function.
	* @param {*} [context=this] The context to invoke the listener with.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.once = function once(event, fn, context) {
		return addListener(this, event, fn, context, true);
	};
	/**
	* Remove the listeners of a given event.
	*
	* @param {(String|Symbol)} event The event name.
	* @param {Function} fn Only remove the listeners that match this function.
	* @param {*} context Only remove the listeners that have this context.
	* @param {Boolean} once Only remove one-time listeners.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		var evt = prefix ? prefix + event : event;
		if (!this._events[evt]) return this;
		if (!fn) {
			clearEvent(this, evt);
			return this;
		}
		var listeners = this._events[evt];
		if (listeners.fn) {
			if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) clearEvent(this, evt);
		} else {
			for (var i = 0, events = [], length = listeners.length; i < length; i++) if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) events.push(listeners[i]);
			if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
			else clearEvent(this, evt);
		}
		return this;
	};
	/**
	* Remove all listeners, or those of the specified event.
	*
	* @param {(String|Symbol)} [event] The event name.
	* @returns {EventEmitter} `this`.
	* @public
	*/
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		var evt;
		if (event) {
			evt = prefix ? prefix + event : event;
			if (this._events[evt]) clearEvent(this, evt);
		} else {
			this._events = new Events();
			this._eventsCount = 0;
		}
		return this;
	};
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	EventEmitter.prefixed = prefix;
	EventEmitter.EventEmitter = EventEmitter;
	if ("undefined" !== typeof module) module.exports = EventEmitter;
})))(), 1);
//#endregion
//#region node_modules/@electrum-cash/web-socket/dist/index.mjs
function $parcel$export$1(e, n, v, s) {
	Object.defineProperty(e, n, {
		get: v,
		set: s,
		enumerable: true,
		configurable: true
	});
}
$parcel$export$1({}, "ElectrumWebSocket", () => $05743633fea447d4$export$25b4633f61498e1);
var $d801b1f9b7fc3074$export$1bddf2b96e25d075 = 3e4;
var $05743633fea447d4$export$25b4633f61498e1 = class extends import_eventemitter3.default {
	host;
	port;
	encrypted;
	timeout;
	webSocket;
	disconnectTimer;
	onConnectHasRun;
	eventForwarders;
	/**
	* Creates a socket configured with connection information for a given Electrum server.
	*
	* @param host        Fully qualified domain name or IP address of the host
	* @param port        Network port for the host to connect to, defaults to the standard TLS port
	* @param encrypted   If false, uses an unencrypted connection instead of the default on TLS
	* @param timeout     If no connection is established after `timeout` ms, the connection is terminated
	*/ constructor(host, port = 50004, encrypted = true, timeout = $d801b1f9b7fc3074$export$1bddf2b96e25d075) {
		super();
		this.host = host;
		this.port = port;
		this.encrypted = encrypted;
		this.timeout = timeout;
		this.onConnectHasRun = false;
		this.eventForwarders = {
			disconnect: () => this.emit("disconnected"),
			wsData: (event) => this.emit("data", `${event.data}\n`),
			wsError: (event) => this.emit("error", new Error(event.error))
		};
	}
	/**
	* Returns a string for the host identifier for usage in debug messages.
	*/ get hostIdentifier() {
		return `${this.host}:${this.port}`;
	}
	/**
	* Connect to host:port using the specified transport
	*/ connect() {
		if (this.webSocket) throw new Error("Cannot initiate a new socket connection when an existing connection exists");
		this.disconnectTimer = setTimeout(() => this.disconnectOnTimeout(), this.timeout);
		this.once("connected", this.clearDisconnectTimerOnTimeout);
		const connectionType = this.encrypted ? "an encrypted WebSocket" : "a WebSocket";
		$9de8c596df24b669$export$2e2bcd8739ae039.network(`Initiating ${connectionType} connection to '${this.host}:${this.port}'.`);
		if (this.encrypted) this.webSocket = new import_ws.default(`wss://${this.host}:${this.port}`);
		else this.webSocket = new import_ws.default(`ws://${this.host}:${this.port}`);
		this.webSocket.addEventListener("open", this.onConnect.bind(this));
		this.webSocket.addEventListener("error", this.eventForwarders.wsError);
	}
	/**
	* Sets up forwarding of events related to the connection.
	*/ onConnect() {
		if (this.onConnectHasRun) return;
		const connectionType = this.encrypted ? "an encrypted WebSocket" : "a WebSocket";
		$9de8c596df24b669$export$2e2bcd8739ae039.network(`Established ${connectionType} connection with '${this.host}:${this.port}'.`);
		this.webSocket.addEventListener("close", this.eventForwarders.disconnect);
		this.webSocket.addEventListener("message", this.eventForwarders.wsData);
		this.onConnectHasRun = true;
		this.emit("connected");
	}
	/**
	* Clears the disconnect timer if it is still active.
	*/ clearDisconnectTimerOnTimeout() {
		if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
	}
	/**
	* Forcibly terminate the connection.
	*
	* @throws {Error} if no connection was found
	*/ disconnect() {
		this.clearDisconnectTimerOnTimeout();
		try {
			this.webSocket.removeEventListener("close", this.eventForwarders.disconnect);
			this.webSocket.removeEventListener("message", this.eventForwarders.wsData);
			this.webSocket.removeEventListener("error", this.eventForwarders.wsError);
			this.webSocket.close();
		} catch (ignored) {} finally {
			this.webSocket = void 0;
		}
		this.onConnectHasRun = false;
		this.emit("disconnected");
	}
	/**
	* Write data to the socket
	*
	* @param data       Data to be written to the socket
	* @param callback   Callback function to be called when the write has completed
	*
	* @throws {Error} if no connection was found
	* @returns true if the message was fully flushed to the socket, false if part of the message
	* is queued in the user memory
	*/ write(data, callback) {
		if (!this.webSocket) throw new Error("Cannot write to socket when there is no active connection");
		this.webSocket.send(data, callback);
		return true;
	}
	/**
	* Force a disconnection if no connection is established after `timeout` milliseconds.
	*/ disconnectOnTimeout() {
		this.removeListener("connected", this.clearDisconnectTimerOnTimeout);
		this.emit("error", /* @__PURE__ */ new Error(`Connection to '${this.host}:${this.port}' timed out after ${this.timeout} milliseconds`));
		this.disconnect();
	}
	connected;
	disconnected;
	data;
	error;
};
//#endregion
//#region node_modules/lossless-json/lib/esm/utils.js
/**
* Test whether a string contains an integer number
*/
function isInteger(value) {
	return INTEGER_REGEX.test(value);
}
var INTEGER_REGEX = /^-?[0-9]+$/;
/**
* Test whether a string contains a number
* http://stackoverflow.com/questions/13340717/json-numbers-regular-expression
*/
function isNumber(value) {
	return NUMBER_REGEX.test(value);
}
var NUMBER_REGEX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
/**
* Test whether a string can be safely represented with a number
* without information loss.
*
* When approx is true, floating point numbers that lose a few digits but
* are still approximately equal in value are considered safe too.
* Integer numbers must still be exactly equal.
*/
function isSafeNumber(value, config) {
	if (isInteger(value)) return Number.isSafeInteger(Number.parseInt(value, 10));
	const parsed = String(Number.parseFloat(value));
	if (value === parsed) return true;
	const valueDigits = extractSignificantDigits(value);
	const parsedDigits = extractSignificantDigits(parsed);
	if (valueDigits === parsedDigits) return true;
	if (config?.approx === true) {
		const requiredDigits = 14;
		if (!isInteger(value) && parsedDigits.length >= requiredDigits && valueDigits.startsWith(parsedDigits.substring(0, requiredDigits))) return true;
	}
	return false;
}
var UnsafeNumberReason = /*#__PURE__*/ function(UnsafeNumberReason) {
	UnsafeNumberReason["underflow"] = "underflow";
	UnsafeNumberReason["overflow"] = "overflow";
	UnsafeNumberReason["truncate_integer"] = "truncate_integer";
	UnsafeNumberReason["truncate_float"] = "truncate_float";
	return UnsafeNumberReason;
}({});
/**
* When the provided value is an unsafe number, describe what the reason is:
* overflow, underflow, truncate_integer, or truncate_float.
* Returns undefined when the value is safe.
*/
function getUnsafeNumberReason(value) {
	if (isSafeNumber(value, { approx: false })) return;
	if (isInteger(value)) return UnsafeNumberReason.truncate_integer;
	const num = Number.parseFloat(value);
	if (!Number.isFinite(num)) return UnsafeNumberReason.overflow;
	if (num === 0) return UnsafeNumberReason.underflow;
	return UnsafeNumberReason.truncate_float;
}
/**
* Get the significant digits of a number.
*
* For example:
*   '2.34' returns '234'
*   '-77' returns '77'
*   '0.003400' returns '34'
*   '120.5e+30' returns '1205'
**/
function extractSignificantDigits(value) {
	const { start, end } = getSignificantDigitRange(value);
	const digits = value.substring(start, end);
	const dot = digits.indexOf(".");
	if (dot === -1) return digits;
	return digits.substring(0, dot) + digits.substring(dot + 1);
}
/**
* Returns the range (start to end) of the significant digits of a value.
* Note that this range _may_ contain the decimal dot.
*
* For example:
*
*     getSignificantDigitRange('0.0325900') // { start: 3, end: 7 }
*     getSignificantDigitRange('2.0300')    // { start: 0, end: 3 }
*     getSignificantDigitRange('0.0')       // { start: 3, end: 3 }
*
*/
function getSignificantDigitRange(value) {
	let start = 0;
	if (value[0] === "-") start++;
	while (value[start] === "0" || value[start] === ".") start++;
	let end = value.lastIndexOf("e");
	if (end === -1) end = value.lastIndexOf("E");
	if (end === -1) end = value.length;
	while ((value[end - 1] === "0" || value[end - 1] === ".") && end > start) end--;
	return {
		start,
		end
	};
}
//#endregion
//#region node_modules/lossless-json/lib/esm/LosslessNumber.js
/**
* A lossless number. Stores its numeric value as string
*/
var LosslessNumber = class {
	isLosslessNumber = true;
	constructor(value) {
		if (!isNumber(value)) throw new Error(`Invalid number (value: "${value}")`);
		this.value = value;
	}
	/**
	* Get the value of the LosslessNumber as number or bigint.
	*
	* - a number is returned for safe numbers and decimal values that only lose some insignificant digits
	* - a bigint is returned for big integer numbers
	* - an Error is thrown for values that will overflow or underflow
	*
	* Note that you can implement your own strategy for conversion by just getting the value as string
	* via .toString(), and using util functions like isInteger, isSafeNumber, getUnsafeNumberReason,
	* and toSafeNumberOrThrow to convert it to a numeric value.
	*/
	valueOf() {
		const unsafeReason = getUnsafeNumberReason(this.value);
		if (unsafeReason === void 0 || unsafeReason === UnsafeNumberReason.truncate_float) return Number.parseFloat(this.value);
		if (isInteger(this.value)) return BigInt(this.value);
		throw new Error(`Cannot safely convert to number: the value '${this.value}' would ${unsafeReason} and become ${Number.parseFloat(this.value)}`);
	}
	/**
	* Get the value of the LosslessNumber as string.
	*/
	toString() {
		return this.value;
	}
};
/**
* Test whether a value is a LosslessNumber
*/
function isLosslessNumber(value) {
	return value && typeof value === "object" && value.isLosslessNumber || false;
}
//#endregion
//#region node_modules/lossless-json/lib/esm/numberParsers.js
function parseLosslessNumber(value) {
	return new LosslessNumber(value);
}
function parseNumberAndBigInt(value) {
	return isInteger(value) ? BigInt(value) : Number.parseFloat(value);
}
//#endregion
//#region node_modules/lossless-json/lib/esm/revive.js
/**
* Revive a json object.
* Applies the reviver function recursively on all values in the JSON object.
* @param json   A JSON Object, Array, or value
* @param reviver
*              A reviver function invoked with arguments `key` and `value`,
*              which must return a replacement value. The function context
*              (`this`) is the Object or Array that contains the currently
*              handled value.
*/
function revive(json, reviver) {
	return reviveValue({ "": json }, "", json, reviver);
}
/**
* Revive a value
*/
function reviveValue(context, key, value, reviver) {
	if (Array.isArray(value)) return reviver.call(context, key, reviveArray(value, reviver));
	if (value && typeof value === "object" && !isLosslessNumber(value)) return reviver.call(context, key, reviveObject(value, reviver));
	return reviver.call(context, key, value);
}
/**
* Revive the properties of an object
*/
function reviveObject(object, reviver) {
	for (const key of Object.keys(object)) {
		const value = reviveValue(object, key, object[key], reviver);
		if (value !== void 0) object[key] = value;
		else delete object[key];
	}
	return object;
}
/**
* Revive the properties of an Array
*/
function reviveArray(array, reviver) {
	for (let i = 0; i < array.length; i++) array[i] = reviveValue(array, String(i), array[i], reviver);
	return array;
}
//#endregion
//#region node_modules/lossless-json/lib/esm/parse.js
/**
* The LosslessJSON.parse() method parses a string as JSON, optionally transforming
* the value produced by parsing.
*
* The parser is based on the parser of Tan Li Hou shared in
* https://lihautan.com/json-parser-with-javascript/
*
* @param text
* The string to parse as JSON. See the JSON object for a description of JSON syntax.
*
* @param [reviver]
* If a function, prescribes how the value originally produced by parsing is
* transformed, before being returned.
*
* @param [options=ParseOptions | NumberParserArgument]
* Pass a custom number parser. Input is a string, and the output can be unknown
* numeric value: number, bigint, LosslessNumber, or a custom BigNumber library.
*
* @returns Returns the Object corresponding to the given JSON text.
*
* @throws Throws a SyntaxError exception if the string to parse is not valid JSON.
*/
function parse(text, reviver, options) {
	const optionsObj = typeof options === "function" ? { parseNumber: options } : options;
	const parseNumber = optionsObj?.parseNumber ?? parseLosslessNumber;
	const onDuplicateKey = optionsObj?.onDuplicateKey ?? throwDuplicateKey;
	let i = 0;
	const value = parseValue();
	expectValue(value);
	expectEndOfInput();
	return reviver ? revive(value, reviver) : value;
	function parseObject() {
		if (text.charCodeAt(i) === codeOpeningBrace) {
			i++;
			skipWhitespace();
			const object = {};
			let initial = true;
			while (i < text.length && text.charCodeAt(i) !== codeClosingBrace) {
				if (!initial) {
					eatComma();
					skipWhitespace();
				} else initial = false;
				const start = i;
				const key = parseString();
				if (key === void 0) {
					throwObjectKeyExpected();
					return;
				}
				skipWhitespace();
				eatColon();
				const value = parseValue();
				if (value === void 0) {
					throwObjectValueExpected();
					return;
				}
				if (Object.prototype.hasOwnProperty.call(object, key) && !isDeepEqual(value, object[key])) {
					const returnedValue = onDuplicateKey({
						key,
						position: start + 1,
						oldValue: object[key],
						newValue: value
					});
					if (returnedValue !== void 0) object[key] = returnedValue;
				} else object[key] = value;
			}
			if (text.charCodeAt(i) !== codeClosingBrace) throwObjectKeyOrEndExpected();
			i++;
			return object;
		}
	}
	function parseArray() {
		if (text.charCodeAt(i) === codeOpeningBracket) {
			i++;
			skipWhitespace();
			const array = [];
			let initial = true;
			while (i < text.length && text.charCodeAt(i) !== codeClosingBracket) {
				if (!initial) eatComma();
				else initial = false;
				const value = parseValue();
				expectArrayItem(value);
				array.push(value);
			}
			if (text.charCodeAt(i) !== codeClosingBracket) throwArrayItemOrEndExpected();
			i++;
			return array;
		}
	}
	function parseValue() {
		skipWhitespace();
		const value = parseString() ?? parseNumeric() ?? parseObject() ?? parseArray() ?? parseKeyword("true", true) ?? parseKeyword("false", false) ?? parseKeyword("null", null);
		skipWhitespace();
		return value;
	}
	function parseKeyword(name, value) {
		if (text.slice(i, i + name.length) === name) {
			i += name.length;
			return value;
		}
	}
	function skipWhitespace() {
		while (isWhitespace(text.charCodeAt(i))) i++;
	}
	function parseString() {
		if (text.charCodeAt(i) === codeDoubleQuote) {
			i++;
			let result = "";
			while (i < text.length && text.charCodeAt(i) !== codeDoubleQuote) {
				if (text.charCodeAt(i) === codeBackslash) {
					const char = text[i + 1];
					const escapeChar = escapeCharacters[char];
					if (escapeChar !== void 0) {
						result += escapeChar;
						i++;
					} else if (char === "u") {
						if (isHex(text.charCodeAt(i + 2)) && isHex(text.charCodeAt(i + 3)) && isHex(text.charCodeAt(i + 4)) && isHex(text.charCodeAt(i + 5))) {
							result += String.fromCharCode(Number.parseInt(text.slice(i + 2, i + 6), 16));
							i += 5;
						} else throwInvalidUnicodeCharacter(i);
					} else throwInvalidEscapeCharacter(i);
				} else if (isValidStringCharacter(text.charCodeAt(i))) result += text[i];
				else throwInvalidCharacter(text[i]);
				i++;
			}
			expectEndOfString();
			i++;
			return result;
		}
	}
	function parseNumeric() {
		const start = i;
		if (text.charCodeAt(i) === codeMinus) {
			i++;
			expectDigit(start);
		}
		if (text.charCodeAt(i) === codeZero) i++;
		else if (isNonZeroDigit(text.charCodeAt(i))) {
			i++;
			while (isDigit(text.charCodeAt(i))) i++;
		}
		if (text.charCodeAt(i) === codeDot) {
			i++;
			expectDigit(start);
			while (isDigit(text.charCodeAt(i))) i++;
		}
		if (text.charCodeAt(i) === 101 || text.charCodeAt(i) === 69) {
			i++;
			if (text.charCodeAt(i) === codeMinus || text.charCodeAt(i) === codePlus) i++;
			expectDigit(start);
			while (isDigit(text.charCodeAt(i))) i++;
		}
		if (i > start) return parseNumber(text.slice(start, i));
	}
	function eatComma() {
		if (text.charCodeAt(i) !== codeComma) throw new SyntaxError(`Comma ',' expected after value ${gotAt()}`);
		i++;
	}
	function eatColon() {
		if (text.charCodeAt(i) !== codeColon) throw new SyntaxError(`Colon ':' expected after property name ${gotAt()}`);
		i++;
	}
	function expectValue(value) {
		if (value === void 0) throw new SyntaxError(`JSON value expected ${gotAt()}`);
	}
	function expectArrayItem(value) {
		if (value === void 0) throw new SyntaxError(`Array item expected ${gotAt()}`);
	}
	function expectEndOfInput() {
		if (i < text.length) throw new SyntaxError(`Expected end of input ${gotAt()}`);
	}
	function expectDigit(start) {
		if (!isDigit(text.charCodeAt(i))) {
			const numSoFar = text.slice(start, i);
			throw new SyntaxError(`Invalid number '${numSoFar}', expecting a digit ${gotAt()}`);
		}
	}
	function expectEndOfString() {
		if (text.charCodeAt(i) !== codeDoubleQuote) throw new SyntaxError(`End of string '"' expected ${gotAt()}`);
	}
	function throwObjectKeyExpected() {
		throw new SyntaxError(`Quoted object key expected ${gotAt()}`);
	}
	function throwDuplicateKey(_ref) {
		let { key, position } = _ref;
		throw new SyntaxError(`Duplicate key '${key}' encountered at position ${position}`);
	}
	function throwObjectKeyOrEndExpected() {
		throw new SyntaxError(`Quoted object key or end of object '}' expected ${gotAt()}`);
	}
	function throwArrayItemOrEndExpected() {
		throw new SyntaxError(`Array item or end of array ']' expected ${gotAt()}`);
	}
	function throwInvalidCharacter(char) {
		throw new SyntaxError(`Invalid character '${char}' ${pos()}`);
	}
	function throwInvalidEscapeCharacter(start) {
		const chars = text.slice(start, start + 2);
		throw new SyntaxError(`Invalid escape character '${chars}' ${pos()}`);
	}
	function throwObjectValueExpected() {
		throw new SyntaxError(`Object value expected after ':' ${pos()}`);
	}
	function throwInvalidUnicodeCharacter(start) {
		const chars = text.slice(start, start + 6);
		throw new SyntaxError(`Invalid unicode character '${chars}' ${pos()}`);
	}
	function pos() {
		return `at position ${i}`;
	}
	function got() {
		return i < text.length ? `but got '${text[i]}'` : "but reached end of input";
	}
	function gotAt() {
		return `${got()} ${pos()}`;
	}
}
function isWhitespace(code) {
	return code === codeSpace || code === codeNewline || code === codeTab || code === codeReturn;
}
function isHex(code) {
	return code >= codeZero && code <= codeNine || code >= 65 && code <= 70 || code >= 97 && code <= 102;
}
function isDigit(code) {
	return code >= codeZero && code <= codeNine;
}
function isNonZeroDigit(code) {
	return code >= codeOne && code <= codeNine;
}
function isValidStringCharacter(code) {
	return code >= 32 && code <= 1114111;
}
function isDeepEqual(a, b) {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => isDeepEqual(item, b[index]));
	if (isObject(a) && isObject(b)) return [.../* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)])].every((key) => isDeepEqual(a[key], b[key]));
	return false;
}
function isObject(value) {
	return typeof value === "object" && value !== null;
}
var escapeCharacters = {
	"\"": "\"",
	"\\": "\\",
	"/": "/",
	b: "\b",
	f: "\f",
	n: "\n",
	r: "\r",
	t: "	"
};
var codeBackslash = 92;
var codeOpeningBrace = 123;
var codeClosingBrace = 125;
var codeOpeningBracket = 91;
var codeClosingBracket = 93;
var codeSpace = 32;
var codeNewline = 10;
var codeTab = 9;
var codeReturn = 13;
var codeDoubleQuote = 34;
var codePlus = 43;
var codeMinus = 45;
var codeZero = 48;
var codeOne = 49;
var codeNine = 57;
var codeComma = 44;
var codeDot = 46;
var codeColon = 58;
//#endregion
//#region node_modules/@electrum-cash/network/dist/index.mjs
function $parcel$export(e, n, v, s) {
	Object.defineProperty(e, n, {
		get: v,
		set: s,
		enumerable: true,
		configurable: true
	});
}
var $24139611f53a54b8$export$5d955335434540c6 = class {
	/**
	* Helper function that builds an Electrum request object.
	*
	* @param method     - method to call.
	* @param parameters - method parameters for the call.
	* @param requestId  - unique string or number referencing this request.
	*
	* @returns a properly formatted Electrum request string.
	*/ static buildRequestObject(method, parameters, requestId) {
		return JSON.stringify({
			method,
			params: parameters,
			id: requestId
		});
	}
	/**
	* Constant used to verify if a provided string is a valid version number.
	*
	* @returns a regular expression that matches valid version numbers.
	*/ static get versionRegexp() {
		return /^\d+(\.\d+)+$/;
	}
	/**
	* Constant used to separate statements/messages in a stream of data.
	*
	* @returns the delimiter used by Electrum to separate statements.
	*/ static get statementDelimiter() {
		return "\n";
	}
};
var $e83d2e7688025acd$exports = {};
$parcel$export($e83d2e7688025acd$exports, "isVersionRejected", () => $e83d2e7688025acd$export$e1f38ab2b4ebdde6);
$parcel$export($e83d2e7688025acd$exports, "isVersionNegotiated", () => $e83d2e7688025acd$export$9598f0c76aa41d73);
var $e83d2e7688025acd$export$e1f38ab2b4ebdde6 = function(object) {
	return "error" in object;
};
var $e83d2e7688025acd$export$9598f0c76aa41d73 = function(object) {
	return "software" in object && "protocol" in object;
};
var $abcb763a48577a1e$export$d73a2e87a509880 = function(message) {
	return "id" in message && "error" in message;
};
var $abcb763a48577a1e$export$280de919a0cf6928 = function(message) {
	return !("id" in message) && "method" in message;
};
$parcel$export({}, "ConnectionStatus", () => $db7c797e63383364$export$7516420eb880ab68);
/**
* Enum that denotes the connection status of an ElectrumConnection.
* @enum {number}
* @property {0} DISCONNECTED    The connection is disconnected.
* @property {1} AVAILABLE       The connection is connected.
* @property {2} DISCONNECTING   The connection is disconnecting.
* @property {3} CONNECTING      The connection is connecting.
* @property {4} RECONNECTING    The connection is restarting.
*/ var $db7c797e63383364$export$7516420eb880ab68;
(function(ConnectionStatus) {
	ConnectionStatus[ConnectionStatus["DISCONNECTED"] = 0] = "DISCONNECTED";
	ConnectionStatus[ConnectionStatus["CONNECTED"] = 1] = "CONNECTED";
	ConnectionStatus[ConnectionStatus["DISCONNECTING"] = 2] = "DISCONNECTING";
	ConnectionStatus[ConnectionStatus["CONNECTING"] = 3] = "CONNECTING";
	ConnectionStatus[ConnectionStatus["RECONNECTING"] = 4] = "RECONNECTING";
})($db7c797e63383364$export$7516420eb880ab68 || ($db7c797e63383364$export$7516420eb880ab68 = {}));
var $ff134c9a9e1f7361$export$de0f57fc22079b5e = class extends import_eventemitter3$1.default {
	/**
	* Sets up network configuration for an Electrum client connection.
	*
	* @param application       - your application name, used to identify to the electrum host.
	* @param version           - protocol version to use with the host.
	* @param socketOrHostname  - pre-configured electrum socket or fully qualified domain name or IP number of the host
	* @param options           - ...
	*
	* @throws {Error} if `version` is not a valid version string.
	*/ constructor(application, version, socketOrHostname, options) {
		super();
		this.application = application;
		this.version = version;
		this.socketOrHostname = socketOrHostname;
		this.options = options;
		this.status = $db7c797e63383364$export$7516420eb880ab68.DISCONNECTED;
		this.verifications = [];
		this.messageBuffer = "";
		if (!$24139611f53a54b8$export$5d955335434540c6.versionRegexp.test(version)) throw new Error(`Provided version string (${version}) is not a valid protocol version number.`);
		if (typeof socketOrHostname === "string") this.socket = new $05743633fea447d4$export$25b4633f61498e1(socketOrHostname);
		else this.socket = socketOrHostname;
		this.socket.on("connected", this.onSocketConnect.bind(this));
		this.socket.on("disconnected", this.onSocketDisconnect.bind(this));
		this.socket.on("data", this.parseMessageChunk.bind(this));
		if (typeof document !== "undefined" && !this.options.disableBrowserVisibilityHandling) document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
		if (typeof window !== "undefined" && !this.options.disableBrowserConnectivityHandling) {
			window.addEventListener("online", this.handleNetworkChange.bind(this));
			window.addEventListener("offline", this.handleNetworkChange.bind(this));
		}
	}
	get hostIdentifier() {
		return this.socket.hostIdentifier;
	}
	get encrypted() {
		return this.socket.encrypted;
	}
	/**
	* Assembles incoming data into statements and hands them off to the message parser.
	*
	* @param data - data to append to the current message buffer, as a string.
	*
	* @throws {SyntaxError} if the passed statement parts are not valid JSON.
	*/ parseMessageChunk(data) {
		this.lastReceivedTimestamp = Date.now();
		this.emit("received");
		this.verifications.forEach((timer) => clearTimeout(timer));
		this.verifications.length = 0;
		this.messageBuffer += data;
		while (this.messageBuffer.includes($24139611f53a54b8$export$5d955335434540c6.statementDelimiter)) {
			const statementParts = this.messageBuffer.split($24139611f53a54b8$export$5d955335434540c6.statementDelimiter);
			while (statementParts.length > 1) {
				let statementList = parse(String(statementParts.shift()), null, this.options.useBigInt ? parseNumberAndBigInt : parseFloat);
				if (!Array.isArray(statementList)) statementList = [statementList];
				while (statementList.length > 0) {
					const currentStatement = statementList.shift();
					if ($abcb763a48577a1e$export$280de919a0cf6928(currentStatement)) {
						this.emit("response", currentStatement);
						continue;
					}
					if (currentStatement.id === "versionNegotiation") {
						if ($abcb763a48577a1e$export$d73a2e87a509880(currentStatement)) this.emit("version", { error: currentStatement.error });
						else {
							const [software, protocol] = currentStatement.result;
							this.emit("version", {
								software,
								protocol
							});
						}
						continue;
					}
					if (currentStatement.id === "keepAlive") continue;
					this.emit("response", currentStatement);
				}
			}
			this.messageBuffer = statementParts.shift() || "";
		}
	}
	/**
	* Sends a keep-alive message to the host.
	*
	* @returns true if the ping message was fully flushed to the socket, false if
	* part of the message is queued in the user memory
	*/ ping() {
		$9de8c596df24b669$export$2e2bcd8739ae039.ping(`Sending keep-alive ping to '${this.hostIdentifier}'`);
		const message = $24139611f53a54b8$export$5d955335434540c6.buildRequestObject("server.ping", [], "keepAlive");
		return this.send(message);
	}
	/**
	* Initiates the network connection negotiates a protocol version. Also emits the 'connect' signal if successful.
	*
	* @throws {Error} if the socket connection fails.
	* @returns a promise resolving when the connection is established
	*/ async connect() {
		if (this.status === $db7c797e63383364$export$7516420eb880ab68.CONNECTED) return;
		this.status = $db7c797e63383364$export$7516420eb880ab68.CONNECTING;
		this.emit("connecting");
		const connectionResolver = (resolve, reject) => {
			const rejector = (error) => {
				this.status = $db7c797e63383364$export$7516420eb880ab68.DISCONNECTED;
				this.emit("disconnected");
				reject(error);
			};
			this.socket.removeAllListeners("error");
			this.socket.once("error", rejector);
			const versionNegotiator = () => {
				$9de8c596df24b669$export$2e2bcd8739ae039.network(`Requesting protocol version ${this.version} with '${this.hostIdentifier}'.`);
				this.socket.removeListener("error", rejector);
				const versionMessage = $24139611f53a54b8$export$5d955335434540c6.buildRequestObject("server.version", [this.application, this.version], "versionNegotiation");
				const versionValidator = (version) => {
					if ($e83d2e7688025acd$export$e1f38ab2b4ebdde6(version)) {
						this.disconnect(true);
						const errorMessage = "unsupported protocol version.";
						$9de8c596df24b669$export$2e2bcd8739ae039.errors(`Failed to connect with ${this.hostIdentifier} due to ${errorMessage}`);
						reject(errorMessage);
					} else if (version.protocol !== this.version && `${version.protocol}.0` !== this.version && `${version.protocol}.0.0` !== this.version) {
						this.disconnect(true);
						const errorMessage = `incompatible protocol version negotiated (${version.protocol} !== ${this.version}).`;
						$9de8c596df24b669$export$2e2bcd8739ae039.errors(`Failed to connect with ${this.hostIdentifier} due to ${errorMessage}`);
						reject(errorMessage);
					} else {
						$9de8c596df24b669$export$2e2bcd8739ae039.network(`Negotiated protocol version ${version.protocol} with '${this.hostIdentifier}', powered by ${version.software}.`);
						this.status = $db7c797e63383364$export$7516420eb880ab68.CONNECTED;
						this.emit("connected");
						resolve();
					}
				};
				this.once("version", versionValidator);
				this.send(versionMessage);
			};
			this.socket.once("connected", versionNegotiator);
			this.socket.on("error", this.onSocketError.bind(this));
			this.socket.connect();
		};
		await new Promise(connectionResolver);
	}
	/**
	* Restores the network connection.
	*/ async reconnect() {
		await this.clearReconnectTimer();
		$9de8c596df24b669$export$2e2bcd8739ae039.network(`Trying to reconnect to '${this.hostIdentifier}'..`);
		this.status = $db7c797e63383364$export$7516420eb880ab68.RECONNECTING;
		this.emit("reconnecting");
		this.socket.disconnect();
		try {
			await this.connect();
		} catch (error) {}
	}
	/**
	* Removes the current reconnect timer.
	*/ clearReconnectTimer() {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.reconnectTimer = void 0;
	}
	/**
	* Removes the current keep-alive timer.
	*/ clearKeepAliveTimer() {
		if (this.keepAliveTimer) clearTimeout(this.keepAliveTimer);
		this.keepAliveTimer = void 0;
	}
	/**
	* Initializes the keep alive timer loop.
	*/ setupKeepAliveTimer() {
		if (!this.keepAliveTimer) this.keepAliveTimer = setTimeout(this.ping.bind(this), this.options.sendKeepAliveIntervalInMilliSeconds);
	}
	/**
	* Tears down the current connection and removes all event listeners on disconnect.
	*
	* @param force       - disconnect even if the connection has not been fully established yet.
	* @param intentional - update connection state if disconnect is intentional.
	*
	* @returns true if successfully disconnected, or false if there was no connection.
	*/ async disconnect(force = false, intentional = true) {
		if (this.status === $db7c797e63383364$export$7516420eb880ab68.DISCONNECTED && !force) return false;
		if (intentional) this.status = $db7c797e63383364$export$7516420eb880ab68.DISCONNECTING;
		this.emit("disconnecting");
		await this.clearKeepAliveTimer();
		await this.clearReconnectTimer();
		const disconnectResolver = (resolve) => {
			this.once("disconnected", () => resolve(true));
			this.socket.disconnect();
		};
		return new Promise(disconnectResolver);
	}
	/**
	* Updates the connection state based on browser reported connectivity.
	*
	* Most modern browsers are able to provide information on the connection state
	* which allows for significantly faster response times to network changes compared
	* to waiting for network requests to fail.
	*
	* When available, we make use of this to fail early to provide a better user experience.
	*/ async handleNetworkChange() {
		if (typeof window.navigator === "undefined") return;
		if (window.navigator.onLine === true) this.reconnect();
		if (window.navigator.onLine !== true) this.disconnect(true, true);
	}
	/**
	* Updates connection state based on application visibility.
	*
	* Some browsers will disconnect network connections when the browser is out of focus,
	* which would normally cause our reconnect-on-timeout routines to trigger, but that
	* results in a poor user experience since the events are not handled consistently
	* and sometimes it can take some time after restoring focus to the browser.
	*
	* By manually disconnecting when this happens we prevent the default reconnection routines
	* and make the behavior consistent across browsers.
	*/ async handleVisibilityChange() {
		if (document.visibilityState === "hidden") this.disconnect(true, true);
		if (document.visibilityState === "visible") this.reconnect();
	}
	/**
	* Sends an arbitrary message to the server.
	*
	* @param message - json encoded request object to send to the server, as a string.
	*
	* @returns true if the message was fully flushed to the socket, false if part of the message
	* is queued in the user memory
	*/ send(message) {
		this.clearKeepAliveTimer();
		const currentTime = Date.now();
		const verificationTimer = setTimeout(this.verifySend.bind(this, currentTime), this.socket.timeout);
		this.verifications.push(verificationTimer);
		this.setupKeepAliveTimer();
		return this.socket.write(message + $24139611f53a54b8$export$5d955335434540c6.statementDelimiter);
	}
	/**
	* Marks the connection as timed out and schedules reconnection if we have not
	* received data within the expected time frame.
	*/ verifySend(sentTimestamp) {
		if (Number(this.lastReceivedTimestamp) < sentTimestamp) {
			if (this.status === $db7c797e63383364$export$7516420eb880ab68.DISCONNECTED || this.status === $db7c797e63383364$export$7516420eb880ab68.DISCONNECTING) return;
			this.clearKeepAliveTimer();
			$9de8c596df24b669$export$2e2bcd8739ae039.network(`Connection to '${this.hostIdentifier}' timed out.`);
			this.socket.disconnect();
		}
	}
	/**
	* Updates the connection status when a connection is confirmed.
	*/ onSocketConnect() {
		this.clearReconnectTimer();
		this.lastReceivedTimestamp = Date.now();
		this.setupKeepAliveTimer();
		this.socket.removeAllListeners("error");
		this.socket.on("error", this.onSocketError.bind(this));
	}
	/**
	* Updates the connection status when a connection is ended.
	*/ onSocketDisconnect() {
		this.clearKeepAliveTimer();
		if (this.status === $db7c797e63383364$export$7516420eb880ab68.DISCONNECTING) {
			this.status = $db7c797e63383364$export$7516420eb880ab68.DISCONNECTED;
			this.emit("disconnected");
			this.clearReconnectTimer();
			this.removeAllListeners();
			$9de8c596df24b669$export$2e2bcd8739ae039.network(`Disconnected from '${this.hostIdentifier}'.`);
		} else {
			if (this.status === $db7c797e63383364$export$7516420eb880ab68.CONNECTED) $9de8c596df24b669$export$2e2bcd8739ae039.errors(`Connection with '${this.hostIdentifier}' was closed, trying to reconnect in ${this.options.reconnectAfterMilliSeconds / 1e3} seconds.`);
			this.status = $db7c797e63383364$export$7516420eb880ab68.DISCONNECTED;
			this.emit("disconnected");
			if (!this.reconnectTimer) this.reconnectTimer = setTimeout(this.reconnect.bind(this), this.options.reconnectAfterMilliSeconds);
		}
	}
	/**
	* Notify administrator of any unexpected errors.
	*/ onSocketError(error) {
		if (typeof error === "undefined") return;
		$9de8c596df24b669$export$2e2bcd8739ae039.errors(`Network error ('${this.hostIdentifier}'): `, error);
	}
};
var $d801b1f9b7fc3074$var$MILLI_SECONDS_PER_SECOND = 1e3;
var $d801b1f9b7fc3074$export$5ba3a4134d0d751d = {
	useBigInt: false,
	sendKeepAliveIntervalInMilliSeconds: 1 * $d801b1f9b7fc3074$var$MILLI_SECONDS_PER_SECOND,
	reconnectAfterMilliSeconds: 5 * $d801b1f9b7fc3074$var$MILLI_SECONDS_PER_SECOND,
	verifyConnectionTimeoutInMilliSeconds: 5 * $d801b1f9b7fc3074$var$MILLI_SECONDS_PER_SECOND,
	disableBrowserVisibilityHandling: false,
	disableBrowserConnectivityHandling: false
};
/**
* High-level Electrum client that lets applications send requests and subscribe to notification events from a server.
*/ var $558b46d3f899ced5$var$ElectrumClient = class extends import_eventemitter3$1.default {
	/**
	* Number corresponding to the underlying connection status.
	*/ get status() {
		return this.connection.status;
	}
	/**
	* Initializes an Electrum client.
	*
	* @param application       - your application name, used to identify to the electrum host.
	* @param version           - protocol version to use with the host.
	* @param socketOrHostname  - pre-configured electrum socket or fully qualified domain name or IP number of the host
	* @param options           - ...
	*
	* @throws {Error} if `version` is not a valid version string.
	*/ constructor(application, version, socketOrHostname, options = {}) {
		super();
		this.application = application;
		this.version = version;
		this.socketOrHostname = socketOrHostname;
		this.options = options;
		this.subscriptionMethods = {};
		this.requestId = 0;
		this.requestResolvers = {};
		this.connectionLock = new Mutex();
		const networkOptions = {
			...$d801b1f9b7fc3074$export$5ba3a4134d0d751d,
			...options
		};
		this.connection = new $ff134c9a9e1f7361$export$de0f57fc22079b5e(application, version, socketOrHostname, networkOptions);
	}
	get hostIdentifier() {
		return this.connection.hostIdentifier;
	}
	get encrypted() {
		return this.connection.encrypted;
	}
	/**
	* Connects to the remote server.
	*
	* @throws {Error} if the socket connection fails.
	* @returns a promise resolving when the connection is established.
	*/ async connect() {
		const unlock = await this.connectionLock.acquire();
		try {
			if (this.connection.status === $db7c797e63383364$export$7516420eb880ab68.CONNECTED) return;
			this.connection.on("response", this.response.bind(this));
			this.connection.on("connected", this.resubscribeOnConnect.bind(this));
			this.connection.on("disconnected", this.onConnectionDisconnect.bind(this));
			this.connection.on("connecting", this.handleConnectionStatusChanges.bind(this, "connecting"));
			this.connection.on("disconnecting", this.handleConnectionStatusChanges.bind(this, "disconnecting"));
			this.connection.on("reconnecting", this.handleConnectionStatusChanges.bind(this, "reconnecting"));
			this.connection.on("version", this.storeSoftwareVersion.bind(this));
			this.connection.on("received", this.updateLastReceivedTimestamp.bind(this));
			this.connection.on("error", this.emit.bind(this, "error"));
			await this.connection.connect();
		} finally {
			unlock();
		}
	}
	/**
	* Disconnects from the remote server and removes all event listeners/subscriptions and open requests.
	*
	* @param force               - disconnect even if the connection has not been fully established yet.
	* @param retainSubscriptions - retain subscription data so they will be restored on reconnection.
	*
	* @returns true if successfully disconnected, or false if there was no connection.
	*/ async disconnect(force = false, retainSubscriptions = false) {
		if (!retainSubscriptions) {
			this.removeAllListeners();
			this.subscriptionMethods = {};
		}
		return this.connection.disconnect(force);
	}
	/**
	* Calls a method on the remote server with the supplied parameters.
	*
	* @param method     - name of the method to call.
	* @param parameters - one or more parameters for the method.
	*
	* @throws {Error} if the client is disconnected.
	* @returns a promise that resolves with the result of the method or an Error.
	*/ async request(method, ...parameters) {
		if (this.connection.status !== $db7c797e63383364$export$7516420eb880ab68.CONNECTED) throw new Error(`Unable to send request to a disconnected server '${this.hostIdentifier}'.`);
		this.requestId += 1;
		const id = this.requestId;
		const message = $24139611f53a54b8$export$5d955335434540c6.buildRequestObject(method, parameters, id);
		const requestResolver = (resolve) => {
			this.requestResolvers[id] = (error, data) => {
				if (error) resolve(error);
				else resolve(data);
			};
			this.connection.send(message);
		};
		$9de8c596df24b669$export$2e2bcd8739ae039.network(`Sending request '${method}' to '${this.hostIdentifier}'`);
		return new Promise(requestResolver);
	}
	/**
	* Subscribes to the method and payload at the server.
	*
	* @remarks the response for the subscription request is issued as a notification event.
	*
	* @param method     - one of the subscribable methods the server supports.
	* @param parameters - one or more parameters for the method.
	*
	* @throws {Error} if the client is disconnected.
	* @returns a promise resolving when the subscription is established.
	*/ async subscribe(method, ...parameters) {
		if (!this.subscriptionMethods[method]) this.subscriptionMethods[method] = /* @__PURE__ */ new Set();
		this.subscriptionMethods[method].add(JSON.stringify(parameters));
		const requestData = await this.request(method, ...parameters);
		if (requestData instanceof Error) throw requestData;
		if (Array.isArray(requestData)) throw new Error("Subscription request returned an more than one data point.");
		const notification = {
			jsonrpc: "2.0",
			method,
			params: [...parameters, requestData]
		};
		this.emit("notification", notification);
		this.updateChainHeightFromHeadersNotifications(notification);
	}
	/**
	* Unsubscribes to the method at the server and removes any callback functions
	* when there are no more subscriptions for the method.
	*
	* @param method     - a previously subscribed to method.
	* @param parameters - one or more parameters for the method.
	*
	* @throws {Error} if no subscriptions exist for the combination of the provided `method` and `parameters.
	* @throws {Error} if the client is disconnected.
	* @returns a promise resolving when the subscription is removed.
	*/ async unsubscribe(method, ...parameters) {
		if (this.connection.status !== $db7c797e63383364$export$7516420eb880ab68.CONNECTED) throw new Error(`Unable to send unsubscribe request to a disconnected server '${this.hostIdentifier}'.`);
		if (!this.subscriptionMethods[method]) throw new Error(`Cannot unsubscribe from '${method}' since the method has no subscriptions.`);
		const subscriptionParameters = JSON.stringify(parameters);
		if (!this.subscriptionMethods[method].has(subscriptionParameters)) throw new Error(`Cannot unsubscribe from '${method}' since it has no subscription with the given parameters.`);
		this.subscriptionMethods[method].delete(subscriptionParameters);
		await this.request(method.replace(".subscribe", ".unsubscribe"), ...parameters);
		$9de8c596df24b669$export$2e2bcd8739ae039.client(`Unsubscribed from '${String(method)}' for the '${subscriptionParameters}' parameters.`);
	}
	/**
	* Restores existing subscriptions without updating status or triggering manual callbacks.
	*
	* @throws {Error} if subscription data cannot be found for all stored event names.
	* @throws {Error} if the client is disconnected.
	* @returns a promise resolving to true when the subscriptions are restored.
	*
	* @ignore
	*/ async resubscribeOnConnect() {
		$9de8c596df24b669$export$2e2bcd8739ae039.client(`Connected to '${this.hostIdentifier}'.`);
		this.handleConnectionStatusChanges("connected");
		const resubscriptionPromises = [];
		for (const method in this.subscriptionMethods) {
			for (const parameterJSON of this.subscriptionMethods[method].values()) {
				const parameters = JSON.parse(parameterJSON);
				resubscriptionPromises.push(this.subscribe(method, ...parameters));
			}
			await Promise.all(resubscriptionPromises);
		}
		if (resubscriptionPromises.length > 0) $9de8c596df24b669$export$2e2bcd8739ae039.client(`Restored ${resubscriptionPromises.length} previous subscriptions for '${this.hostIdentifier}'`);
	}
	/**
	* Parser messages from the remote server to resolve request promises and emit subscription events.
	*
	* @param message - the response message
	*
	* @throws {Error} if the message ID does not match an existing request.
	* @ignore
	*/ response(message) {
		if ($abcb763a48577a1e$export$280de919a0cf6928(message)) {
			$9de8c596df24b669$export$2e2bcd8739ae039.client(`Received notification for '${message.method}' from '${this.hostIdentifier}'`);
			this.emit("notification", message);
			this.updateChainHeightFromHeadersNotifications(message);
			return;
		}
		if (message.id === null) throw new Error("Internal error: Received an RPC response with ID null.");
		const requestResolver = this.requestResolvers[message.id];
		if (!requestResolver) {
			$9de8c596df24b669$export$2e2bcd8739ae039.warning(`Ignoring response #${message.id} as the request has already been rejected.`);
			return;
		}
		delete this.requestResolvers[message.id];
		if ($abcb763a48577a1e$export$d73a2e87a509880(message)) requestResolver(new Error(message.error.message));
		else {
			requestResolver(void 0, message.result);
			this.storeGenesisHashFromFeaturesResponse(message);
		}
	}
	/**
	* Callback function that is called when connection to the Electrum server is lost.
	* Aborts all active requests with an error message indicating that connection was lost.
	*
	* @ignore
	*/ async onConnectionDisconnect() {
		for (const resolverId in this.requestResolvers) {
			const requestResolver = this.requestResolvers[resolverId];
			requestResolver(/* @__PURE__ */ new Error("Connection lost"));
			delete this.requestResolvers[resolverId];
		}
		this.handleConnectionStatusChanges("disconnected");
	}
	/**
	* Stores the server provider software version field on successful version negotiation.
	*
	* @ignore
	*/ async storeSoftwareVersion(versionStatement) {
		if (versionStatement.error) return;
		this.software = versionStatement.software;
	}
	/**
	* Updates the last received timestamp.
	*
	* @ignore
	*/ async updateLastReceivedTimestamp() {
		this.lastReceivedTimestamp = Date.now();
	}
	/**
	* Checks if the provided message is a response to a headers subscription,
	* and if so updates the locally stored chain height value for this client.
	*
	* @ignore
	*/ async updateChainHeightFromHeadersNotifications(message) {
		if (message.method === "blockchain.headers.subscribe") this.chainHeight = message.params[0].height;
	}
	/**
	* Checks if the provided message is a response to a server.features request,
	* and if so stores the genesis hash for this client locally.
	*
	* @ignore
	*/ async storeGenesisHashFromFeaturesResponse(message) {
		try {
			if (typeof message.result.genesis_hash !== "undefined") this.genesisHash = message.result.genesis_hash;
		} catch (error) {}
	}
	/**
	* Helper function to synchronize state and events with the underlying connection.
	*/ async handleConnectionStatusChanges(eventName) {
		this.emit(eventName);
	}
};
var $558b46d3f899ced5$export$2e2bcd8739ae039 = $558b46d3f899ced5$var$ElectrumClient;
//#endregion
export { $05743633fea447d4$export$25b4633f61498e1 as n, require_ws as r, $558b46d3f899ced5$export$2e2bcd8739ae039 as t };
