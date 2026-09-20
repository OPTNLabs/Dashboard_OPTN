import { a as __require, t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/_u64.js
var require__u64$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBig = exports.shrSL = exports.shrSH = exports.rotrSL = exports.rotrSH = exports.rotrBL = exports.rotrBH = exports.rotr32L = exports.rotr32H = exports.rotlSL = exports.rotlSH = exports.rotlBL = exports.rotlBH = exports.add5L = exports.add5H = exports.add4L = exports.add4H = exports.add3L = exports.add3H = void 0;
	exports.add = add;
	exports.fromBig = fromBig;
	exports.split = split;
	/**
	* Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
	* @todo re-check https://issues.chromium.org/issues/42212588
	* @module
	*/
	var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
	var _32n = /* @__PURE__ */ BigInt(32);
	function fromBig(n, le = false) {
		if (le) return {
			h: Number(n & U32_MASK64),
			l: Number(n >> _32n & U32_MASK64)
		};
		return {
			h: Number(n >> _32n & U32_MASK64) | 0,
			l: Number(n & U32_MASK64) | 0
		};
	}
	function split(lst, le = false) {
		const len = lst.length;
		let Ah = new Uint32Array(len);
		let Al = new Uint32Array(len);
		for (let i = 0; i < len; i++) {
			const { h, l } = fromBig(lst[i], le);
			[Ah[i], Al[i]] = [h, l];
		}
		return [Ah, Al];
	}
	var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
	exports.toBig = toBig;
	var shrSH = (h, _l, s) => h >>> s;
	exports.shrSH = shrSH;
	var shrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.shrSL = shrSL;
	var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
	exports.rotrSH = rotrSH;
	var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.rotrSL = rotrSL;
	var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
	exports.rotrBH = rotrBH;
	var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
	exports.rotrBL = rotrBL;
	var rotr32H = (_h, l) => l;
	exports.rotr32H = rotr32H;
	var rotr32L = (h, _l) => h;
	exports.rotr32L = rotr32L;
	var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
	exports.rotlSH = rotlSH;
	var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
	exports.rotlSL = rotlSL;
	var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
	exports.rotlBH = rotlBH;
	var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
	exports.rotlBL = rotlBL;
	function add(Ah, Al, Bh, Bl) {
		const l = (Al >>> 0) + (Bl >>> 0);
		return {
			h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
			l: l | 0
		};
	}
	var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
	exports.add3L = add3L;
	var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
	exports.add3H = add3H;
	var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
	exports.add4L = add4L;
	var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
	exports.add4H = add4H;
	var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
	exports.add5L = add5L;
	var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
	exports.add5H = add5H;
	exports.default = {
		fromBig,
		split,
		toBig,
		shrSH,
		shrSL,
		rotrSH,
		rotrSL,
		rotrBH,
		rotrBL,
		rotr32H,
		rotr32L,
		rotlSH,
		rotlSL,
		rotlBH,
		rotlBL,
		add,
		add3L,
		add3H,
		add4L,
		add4H,
		add5H,
		add5L
	};
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/cryptoNode.js
var require_cryptoNode$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.crypto = void 0;
	/**
	* Internal webcrypto alias.
	* We prefer WebCrypto aka globalThis.crypto, which exists in node.js 16+.
	* Falls back to Node.js built-in crypto for Node.js <=v14.
	* See utils.ts for details.
	* @module
	*/
	var nc$2 = __require("node:crypto");
	exports.crypto = nc$2 && typeof nc$2 === "object" && "webcrypto" in nc$2 ? nc$2.webcrypto : nc$2 && typeof nc$2 === "object" && "randomBytes" in nc$2 ? nc$2 : void 0;
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/utils.js
var require_utils$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.Hash = exports.nextTick = exports.swap32IfBE = exports.byteSwapIfBE = exports.swap8IfBE = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.rotr = rotr;
	exports.rotl = rotl;
	exports.byteSwap = byteSwap;
	exports.byteSwap32 = byteSwap32;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.asyncLoop = asyncLoop;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.kdfInputToBytes = kdfInputToBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.createHasher = createHasher;
	exports.createOptHasher = createOptHasher;
	exports.createXOFer = createXOFer;
	exports.randomBytes = randomBytes;
	var crypto_1 = require_cryptoNode$2();
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is positive integer. */
	function anumber(n) {
		if (!Number.isSafeInteger(n) || n < 0) throw new Error("positive integer expected, got " + n);
	}
	/** Asserts something is Uint8Array. */
	function abytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Uint8Array expected");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
	}
	/** Asserts something is hash */
	function ahash(h) {
		if (typeof h !== "function" || typeof h.create !== "function") throw new Error("Hash should be wrapped by utils.createHasher");
		anumber(h.outputLen);
		anumber(h.blockLen);
	}
	/** Asserts a hash instance has not been destroyed / finished */
	function aexists(instance, checkFinished = true) {
		if (instance.destroyed) throw new Error("Hash instance has been destroyed");
		if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
	}
	/** Asserts output is properly-sized byte array */
	function aoutput(out, instance) {
		abytes(out);
		const min = instance.outputLen;
		if (out.length < min) throw new Error("digestInto() expects output buffer of length at least " + min);
	}
	/** Cast u8 / u16 / u32 to u8. */
	function u8(arr) {
		return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** Cast u8 / u16 / u32 to u32. */
	function u32(arr) {
		return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
	}
	/** Zeroize a byte array. Warning: JS provides no guarantees. */
	function clean(...arrays) {
		for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
	}
	/** Create DataView of an array for easy byte-level manipulation. */
	function createView(arr) {
		return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** The rotate right (circular right shift) operation for uint32 */
	function rotr(word, shift) {
		return word << 32 - shift | word >>> shift;
	}
	/** The rotate left (circular left shift) operation for uint32 */
	function rotl(word, shift) {
		return word << shift | word >>> 32 - shift >>> 0;
	}
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
	/** The byte swap operation for uint32 */
	function byteSwap(word) {
		return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
	}
	/** Conditionally byte swap if on a big-endian platform */
	exports.swap8IfBE = exports.isLE ? (n) => n : (n) => byteSwap(n);
	/** @deprecated */
	exports.byteSwapIfBE = exports.swap8IfBE;
	/** In place byte swap for Uint32Array */
	function byteSwap32(arr) {
		for (let i = 0; i < arr.length; i++) arr[i] = byteSwap(arr[i]);
		return arr;
	}
	exports.swap32IfBE = exports.isLE ? (u) => u : byteSwap32;
	var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Convert byte array to hex string. Uses built-in function, when available.
	* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
	*/
	function bytesToHex(bytes) {
		abytes(bytes);
		if (hasHexBuiltin) return bytes.toHex();
		let hex = "";
		for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
		return hex;
	}
	var asciis = {
		_0: 48,
		_9: 57,
		A: 65,
		F: 70,
		a: 97,
		f: 102
	};
	function asciiToBase16(ch) {
		if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
		if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
		if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
	}
	/**
	* Convert hex string to byte array. Uses built-in function, when available.
	* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
	*/
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		if (hasHexBuiltin) return Uint8Array.fromHex(hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	/**
	* There is no setImmediate in browser and setTimeout is slow.
	* Call of async fn will return Promise, which will be fullfiled only on
	* next scheduler queue processing step and this is exactly what we need.
	*/
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/** Returns control to thread each 'tick' ms to avoid blocking. */
	async function asyncLoop(iters, tick, cb) {
		let ts = Date.now();
		for (let i = 0; i < iters; i++) {
			cb(i);
			const diff = Date.now() - ts;
			if (diff >= 0 && diff < tick) continue;
			await (0, exports.nextTick)();
			ts += diff;
		}
	}
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // Uint8Array.from([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	function bytesToUtf8(bytes) {
		return new TextDecoder().decode(bytes);
	}
	/**
	* Normalizes (non-hex) string or Uint8Array to Uint8Array.
	* Warning: when Uint8Array is passed, it would NOT get copied.
	* Keep in mind for future mutable operations.
	*/
	function toBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/**
	* Helper for KDFs: consumes uint8array or string.
	* When string is passed, does utf8 decoding, using TextDecoder.
	*/
	function kdfInputToBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/** Copies several Uint8Arrays into one. */
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			abytes(a);
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	function checkOpts(defaults, opts) {
		if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]") throw new Error("options should be object or undefined");
		return Object.assign(defaults, opts);
	}
	/** For runtime check if class implements interface */
	var Hash = class {};
	exports.Hash = Hash;
	/** Wraps hash function, creating an interface on top of it */
	function createHasher(hashCons) {
		const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
		const tmp = hashCons();
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = () => hashCons();
		return hashC;
	}
	function createOptHasher(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	function createXOFer(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	exports.wrapConstructor = createHasher;
	exports.wrapConstructorWithOpts = createOptHasher;
	exports.wrapXOFConstructorWithOpts = createXOFer;
	/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
	function randomBytes(bytesLength = 32) {
		if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
		if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
		throw new Error("crypto.getRandomValues must be defined");
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/cryptoNode.js
var require_cryptoNode$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.crypto = void 0;
	/**
	* Internal webcrypto alias.
	* We prefer WebCrypto aka globalThis.crypto, which exists in node.js 16+.
	* Falls back to Node.js built-in crypto for Node.js <=v14.
	* See utils.ts for details.
	* @module
	*/
	var nc$1 = __require("node:crypto");
	exports.crypto = nc$1 && typeof nc$1 === "object" && "webcrypto" in nc$1 ? nc$1.webcrypto : nc$1 && typeof nc$1 === "object" && "randomBytes" in nc$1 ? nc$1 : void 0;
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/utils.js
var require_utils$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.Hash = exports.nextTick = exports.swap32IfBE = exports.byteSwapIfBE = exports.swap8IfBE = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.rotr = rotr;
	exports.rotl = rotl;
	exports.byteSwap = byteSwap;
	exports.byteSwap32 = byteSwap32;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.asyncLoop = asyncLoop;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.kdfInputToBytes = kdfInputToBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.createHasher = createHasher;
	exports.createOptHasher = createOptHasher;
	exports.createXOFer = createXOFer;
	exports.randomBytes = randomBytes;
	var crypto_1 = require_cryptoNode$1();
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is positive integer. */
	function anumber(n) {
		if (!Number.isSafeInteger(n) || n < 0) throw new Error("positive integer expected, got " + n);
	}
	/** Asserts something is Uint8Array. */
	function abytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Uint8Array expected");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
	}
	/** Asserts something is hash */
	function ahash(h) {
		if (typeof h !== "function" || typeof h.create !== "function") throw new Error("Hash should be wrapped by utils.createHasher");
		anumber(h.outputLen);
		anumber(h.blockLen);
	}
	/** Asserts a hash instance has not been destroyed / finished */
	function aexists(instance, checkFinished = true) {
		if (instance.destroyed) throw new Error("Hash instance has been destroyed");
		if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
	}
	/** Asserts output is properly-sized byte array */
	function aoutput(out, instance) {
		abytes(out);
		const min = instance.outputLen;
		if (out.length < min) throw new Error("digestInto() expects output buffer of length at least " + min);
	}
	/** Cast u8 / u16 / u32 to u8. */
	function u8(arr) {
		return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** Cast u8 / u16 / u32 to u32. */
	function u32(arr) {
		return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
	}
	/** Zeroize a byte array. Warning: JS provides no guarantees. */
	function clean(...arrays) {
		for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
	}
	/** Create DataView of an array for easy byte-level manipulation. */
	function createView(arr) {
		return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** The rotate right (circular right shift) operation for uint32 */
	function rotr(word, shift) {
		return word << 32 - shift | word >>> shift;
	}
	/** The rotate left (circular left shift) operation for uint32 */
	function rotl(word, shift) {
		return word << shift | word >>> 32 - shift >>> 0;
	}
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
	/** The byte swap operation for uint32 */
	function byteSwap(word) {
		return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
	}
	/** Conditionally byte swap if on a big-endian platform */
	exports.swap8IfBE = exports.isLE ? (n) => n : (n) => byteSwap(n);
	/** @deprecated */
	exports.byteSwapIfBE = exports.swap8IfBE;
	/** In place byte swap for Uint32Array */
	function byteSwap32(arr) {
		for (let i = 0; i < arr.length; i++) arr[i] = byteSwap(arr[i]);
		return arr;
	}
	exports.swap32IfBE = exports.isLE ? (u) => u : byteSwap32;
	var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Convert byte array to hex string. Uses built-in function, when available.
	* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
	*/
	function bytesToHex(bytes) {
		abytes(bytes);
		if (hasHexBuiltin) return bytes.toHex();
		let hex = "";
		for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
		return hex;
	}
	var asciis = {
		_0: 48,
		_9: 57,
		A: 65,
		F: 70,
		a: 97,
		f: 102
	};
	function asciiToBase16(ch) {
		if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
		if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
		if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
	}
	/**
	* Convert hex string to byte array. Uses built-in function, when available.
	* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
	*/
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		if (hasHexBuiltin) return Uint8Array.fromHex(hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	/**
	* There is no setImmediate in browser and setTimeout is slow.
	* Call of async fn will return Promise, which will be fullfiled only on
	* next scheduler queue processing step and this is exactly what we need.
	*/
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/** Returns control to thread each 'tick' ms to avoid blocking. */
	async function asyncLoop(iters, tick, cb) {
		let ts = Date.now();
		for (let i = 0; i < iters; i++) {
			cb(i);
			const diff = Date.now() - ts;
			if (diff >= 0 && diff < tick) continue;
			await (0, exports.nextTick)();
			ts += diff;
		}
	}
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // Uint8Array.from([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	function bytesToUtf8(bytes) {
		return new TextDecoder().decode(bytes);
	}
	/**
	* Normalizes (non-hex) string or Uint8Array to Uint8Array.
	* Warning: when Uint8Array is passed, it would NOT get copied.
	* Keep in mind for future mutable operations.
	*/
	function toBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/**
	* Helper for KDFs: consumes uint8array or string.
	* When string is passed, does utf8 decoding, using TextDecoder.
	*/
	function kdfInputToBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/** Copies several Uint8Arrays into one. */
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			abytes(a);
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	function checkOpts(defaults, opts) {
		if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]") throw new Error("options should be object or undefined");
		return Object.assign(defaults, opts);
	}
	/** For runtime check if class implements interface */
	var Hash = class {};
	exports.Hash = Hash;
	/** Wraps hash function, creating an interface on top of it */
	function createHasher(hashCons) {
		const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
		const tmp = hashCons();
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = () => hashCons();
		return hashC;
	}
	function createOptHasher(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	function createXOFer(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	exports.wrapConstructor = createHasher;
	exports.wrapConstructorWithOpts = createOptHasher;
	exports.wrapXOFConstructorWithOpts = createXOFer;
	/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
	function randomBytes(bytesLength = 32) {
		if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
		if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
		throw new Error("crypto.getRandomValues must be defined");
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/_md.js
var require__md$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SHA512_IV = exports.SHA384_IV = exports.SHA224_IV = exports.SHA256_IV = exports.HashMD = void 0;
	exports.setBigUint64 = setBigUint64;
	exports.Chi = Chi;
	exports.Maj = Maj;
	/**
	* Internal Merkle-Damgard hash utils.
	* @module
	*/
	var utils_ts_1 = require_utils$4();
	/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
	function setBigUint64(view, byteOffset, value, isLE) {
		if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE);
		const _32n = BigInt(32);
		const _u32_max = BigInt(4294967295);
		const wh = Number(value >> _32n & _u32_max);
		const wl = Number(value & _u32_max);
		const h = isLE ? 4 : 0;
		const l = isLE ? 0 : 4;
		view.setUint32(byteOffset + h, wh, isLE);
		view.setUint32(byteOffset + l, wl, isLE);
	}
	/** Choice: a ? b : c */
	function Chi(a, b, c) {
		return a & b ^ ~a & c;
	}
	/** Majority function, true if any two inputs is true. */
	function Maj(a, b, c) {
		return a & b ^ a & c ^ b & c;
	}
	/**
	* Merkle-Damgard hash construction base class.
	* Could be used to create MD5, RIPEMD, SHA1, SHA2.
	*/
	var HashMD = class extends utils_ts_1.Hash {
		constructor(blockLen, outputLen, padOffset, isLE) {
			super();
			this.finished = false;
			this.length = 0;
			this.pos = 0;
			this.destroyed = false;
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.padOffset = padOffset;
			this.isLE = isLE;
			this.buffer = new Uint8Array(blockLen);
			this.view = (0, utils_ts_1.createView)(this.buffer);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { view, buffer, blockLen } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					const dataView = (0, utils_ts_1.createView)(data);
					for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(view, 0);
					this.pos = 0;
				}
			}
			this.length += data.length;
			this.roundClean();
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { buffer, view, blockLen, isLE } = this;
			let { pos } = this;
			buffer[pos++] = 128;
			(0, utils_ts_1.clean)(this.buffer.subarray(pos));
			if (this.padOffset > blockLen - pos) {
				this.process(view, 0);
				pos = 0;
			}
			for (let i = pos; i < blockLen; i++) buffer[i] = 0;
			setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
			this.process(view, 0);
			const oview = (0, utils_ts_1.createView)(out);
			const len = this.outputLen;
			if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
			const outLen = len / 4;
			const state = this.get();
			if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
			for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			to || (to = new this.constructor());
			to.set(...this.get());
			const { blockLen, buffer, length, finished, destroyed, pos } = this;
			to.destroyed = destroyed;
			to.finished = finished;
			to.length = length;
			to.pos = pos;
			if (length % blockLen) to.buffer.set(buffer);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
	};
	exports.HashMD = HashMD;
	/**
	* Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
	* Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
	*/
	/** Initial SHA256 state. Bits 0..32 of frac part of sqrt of primes 2..19 */
	exports.SHA256_IV = Uint32Array.from([
		1779033703,
		3144134277,
		1013904242,
		2773480762,
		1359893119,
		2600822924,
		528734635,
		1541459225
	]);
	/** Initial SHA224 state. Bits 32..64 of frac part of sqrt of primes 23..53 */
	exports.SHA224_IV = Uint32Array.from([
		3238371032,
		914150663,
		812702999,
		4144912697,
		4290775857,
		1750603025,
		1694076839,
		3204075428
	]);
	/** Initial SHA384 state. Bits 0..64 of frac part of sqrt of primes 23..53 */
	exports.SHA384_IV = Uint32Array.from([
		3418070365,
		3238371032,
		1654270250,
		914150663,
		2438529370,
		812702999,
		355462360,
		4144912697,
		1731405415,
		4290775857,
		2394180231,
		1750603025,
		3675008525,
		1694076839,
		1203062813,
		3204075428
	]);
	/** Initial SHA512 state. Bits 0..64 of frac part of sqrt of primes 2..19 */
	exports.SHA512_IV = Uint32Array.from([
		1779033703,
		4089235720,
		3144134277,
		2227873595,
		1013904242,
		4271175723,
		2773480762,
		1595750129,
		1359893119,
		2917565137,
		2600822924,
		725511199,
		528734635,
		4215389547,
		1541459225,
		327033209
	]);
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/_u64.js
var require__u64$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBig = exports.shrSL = exports.shrSH = exports.rotrSL = exports.rotrSH = exports.rotrBL = exports.rotrBH = exports.rotr32L = exports.rotr32H = exports.rotlSL = exports.rotlSH = exports.rotlBL = exports.rotlBH = exports.add5L = exports.add5H = exports.add4L = exports.add4H = exports.add3L = exports.add3H = void 0;
	exports.add = add;
	exports.fromBig = fromBig;
	exports.split = split;
	/**
	* Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
	* @todo re-check https://issues.chromium.org/issues/42212588
	* @module
	*/
	var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
	var _32n = /* @__PURE__ */ BigInt(32);
	function fromBig(n, le = false) {
		if (le) return {
			h: Number(n & U32_MASK64),
			l: Number(n >> _32n & U32_MASK64)
		};
		return {
			h: Number(n >> _32n & U32_MASK64) | 0,
			l: Number(n & U32_MASK64) | 0
		};
	}
	function split(lst, le = false) {
		const len = lst.length;
		let Ah = new Uint32Array(len);
		let Al = new Uint32Array(len);
		for (let i = 0; i < len; i++) {
			const { h, l } = fromBig(lst[i], le);
			[Ah[i], Al[i]] = [h, l];
		}
		return [Ah, Al];
	}
	var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
	exports.toBig = toBig;
	var shrSH = (h, _l, s) => h >>> s;
	exports.shrSH = shrSH;
	var shrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.shrSL = shrSL;
	var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
	exports.rotrSH = rotrSH;
	var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.rotrSL = rotrSL;
	var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
	exports.rotrBH = rotrBH;
	var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
	exports.rotrBL = rotrBL;
	var rotr32H = (_h, l) => l;
	exports.rotr32H = rotr32H;
	var rotr32L = (h, _l) => h;
	exports.rotr32L = rotr32L;
	var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
	exports.rotlSH = rotlSH;
	var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
	exports.rotlSL = rotlSL;
	var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
	exports.rotlBH = rotlBH;
	var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
	exports.rotlBL = rotlBL;
	function add(Ah, Al, Bh, Bl) {
		const l = (Al >>> 0) + (Bl >>> 0);
		return {
			h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
			l: l | 0
		};
	}
	var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
	exports.add3L = add3L;
	var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
	exports.add3H = add3H;
	var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
	exports.add4L = add4L;
	var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
	exports.add4H = add4H;
	var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
	exports.add5L = add5L;
	var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
	exports.add5H = add5H;
	exports.default = {
		fromBig,
		split,
		toBig,
		shrSH,
		shrSL,
		rotrSH,
		rotrSL,
		rotrBH,
		rotrBL,
		rotr32H,
		rotr32L,
		rotlSH,
		rotlSL,
		rotlBH,
		rotlBL,
		add,
		add3L,
		add3H,
		add4L,
		add4H,
		add5H,
		add5L
	};
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/sha2.js
var require_sha2$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512_224 = exports.sha512_256 = exports.sha384 = exports.sha512 = exports.sha224 = exports.sha256 = exports.SHA512_256 = exports.SHA512_224 = exports.SHA384 = exports.SHA512 = exports.SHA224 = exports.SHA256 = void 0;
	/**
	* SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
	* SHA256 is the fastest hash implementable in JS, even faster than Blake3.
	* Check out [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and
	* [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
	* @module
	*/
	var _md_ts_1 = require__md$2();
	var u64 = require__u64$1();
	var utils_ts_1 = require_utils$4();
	/**
	* Round constants:
	* First 32 bits of fractional parts of the cube roots of the first 64 primes 2..311)
	*/
	var SHA256_K = /* @__PURE__ */ Uint32Array.from([
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	]);
	/** Reusable temporary buffer. "W" comes straight from spec. */
	var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
	var SHA256 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 32) {
			super(64, outputLen, 8, false);
			this.A = _md_ts_1.SHA256_IV[0] | 0;
			this.B = _md_ts_1.SHA256_IV[1] | 0;
			this.C = _md_ts_1.SHA256_IV[2] | 0;
			this.D = _md_ts_1.SHA256_IV[3] | 0;
			this.E = _md_ts_1.SHA256_IV[4] | 0;
			this.F = _md_ts_1.SHA256_IV[5] | 0;
			this.G = _md_ts_1.SHA256_IV[6] | 0;
			this.H = _md_ts_1.SHA256_IV[7] | 0;
		}
		get() {
			const { A, B, C, D, E, F, G, H } = this;
			return [
				A,
				B,
				C,
				D,
				E,
				F,
				G,
				H
			];
		}
		set(A, B, C, D, E, F, G, H) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
			this.F = F | 0;
			this.G = G | 0;
			this.H = H | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 64; i++) {
				const W15 = SHA256_W[i - 15];
				const W2 = SHA256_W[i - 2];
				const s0 = (0, utils_ts_1.rotr)(W15, 7) ^ (0, utils_ts_1.rotr)(W15, 18) ^ W15 >>> 3;
				const s1 = (0, utils_ts_1.rotr)(W2, 17) ^ (0, utils_ts_1.rotr)(W2, 19) ^ W2 >>> 10;
				SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
			}
			let { A, B, C, D, E, F, G, H } = this;
			for (let i = 0; i < 64; i++) {
				const sigma1 = (0, utils_ts_1.rotr)(E, 6) ^ (0, utils_ts_1.rotr)(E, 11) ^ (0, utils_ts_1.rotr)(E, 25);
				const T1 = H + sigma1 + (0, _md_ts_1.Chi)(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
				const T2 = ((0, utils_ts_1.rotr)(A, 2) ^ (0, utils_ts_1.rotr)(A, 13) ^ (0, utils_ts_1.rotr)(A, 22)) + (0, _md_ts_1.Maj)(A, B, C) | 0;
				H = G;
				G = F;
				F = E;
				E = D + T1 | 0;
				D = C;
				C = B;
				B = A;
				A = T1 + T2 | 0;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			F = F + this.F | 0;
			G = G + this.G | 0;
			H = H + this.H | 0;
			this.set(A, B, C, D, E, F, G, H);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA256_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA256 = SHA256;
	var SHA224 = class extends SHA256 {
		constructor() {
			super(28);
			this.A = _md_ts_1.SHA224_IV[0] | 0;
			this.B = _md_ts_1.SHA224_IV[1] | 0;
			this.C = _md_ts_1.SHA224_IV[2] | 0;
			this.D = _md_ts_1.SHA224_IV[3] | 0;
			this.E = _md_ts_1.SHA224_IV[4] | 0;
			this.F = _md_ts_1.SHA224_IV[5] | 0;
			this.G = _md_ts_1.SHA224_IV[6] | 0;
			this.H = _md_ts_1.SHA224_IV[7] | 0;
		}
	};
	exports.SHA224 = SHA224;
	var K512 = /* @__PURE__ */ (() => u64.split([
		"0x428a2f98d728ae22",
		"0x7137449123ef65cd",
		"0xb5c0fbcfec4d3b2f",
		"0xe9b5dba58189dbbc",
		"0x3956c25bf348b538",
		"0x59f111f1b605d019",
		"0x923f82a4af194f9b",
		"0xab1c5ed5da6d8118",
		"0xd807aa98a3030242",
		"0x12835b0145706fbe",
		"0x243185be4ee4b28c",
		"0x550c7dc3d5ffb4e2",
		"0x72be5d74f27b896f",
		"0x80deb1fe3b1696b1",
		"0x9bdc06a725c71235",
		"0xc19bf174cf692694",
		"0xe49b69c19ef14ad2",
		"0xefbe4786384f25e3",
		"0x0fc19dc68b8cd5b5",
		"0x240ca1cc77ac9c65",
		"0x2de92c6f592b0275",
		"0x4a7484aa6ea6e483",
		"0x5cb0a9dcbd41fbd4",
		"0x76f988da831153b5",
		"0x983e5152ee66dfab",
		"0xa831c66d2db43210",
		"0xb00327c898fb213f",
		"0xbf597fc7beef0ee4",
		"0xc6e00bf33da88fc2",
		"0xd5a79147930aa725",
		"0x06ca6351e003826f",
		"0x142929670a0e6e70",
		"0x27b70a8546d22ffc",
		"0x2e1b21385c26c926",
		"0x4d2c6dfc5ac42aed",
		"0x53380d139d95b3df",
		"0x650a73548baf63de",
		"0x766a0abb3c77b2a8",
		"0x81c2c92e47edaee6",
		"0x92722c851482353b",
		"0xa2bfe8a14cf10364",
		"0xa81a664bbc423001",
		"0xc24b8b70d0f89791",
		"0xc76c51a30654be30",
		"0xd192e819d6ef5218",
		"0xd69906245565a910",
		"0xf40e35855771202a",
		"0x106aa07032bbd1b8",
		"0x19a4c116b8d2d0c8",
		"0x1e376c085141ab53",
		"0x2748774cdf8eeb99",
		"0x34b0bcb5e19b48a8",
		"0x391c0cb3c5c95a63",
		"0x4ed8aa4ae3418acb",
		"0x5b9cca4f7763e373",
		"0x682e6ff3d6b2b8a3",
		"0x748f82ee5defb2fc",
		"0x78a5636f43172f60",
		"0x84c87814a1f0ab72",
		"0x8cc702081a6439ec",
		"0x90befffa23631e28",
		"0xa4506cebde82bde9",
		"0xbef9a3f7b2c67915",
		"0xc67178f2e372532b",
		"0xca273eceea26619c",
		"0xd186b8c721c0c207",
		"0xeada7dd6cde0eb1e",
		"0xf57d4f7fee6ed178",
		"0x06f067aa72176fba",
		"0x0a637dc5a2c898a6",
		"0x113f9804bef90dae",
		"0x1b710b35131c471b",
		"0x28db77f523047d84",
		"0x32caab7b40c72493",
		"0x3c9ebe0a15c9bebc",
		"0x431d67c49c100d4c",
		"0x4cc5d4becb3e42b6",
		"0x597f299cfc657e2a",
		"0x5fcb6fab3ad6faec",
		"0x6c44198c4a475817"
	].map((n) => BigInt(n))))();
	var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
	var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
	var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
	var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
	var SHA512 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 64) {
			super(128, outputLen, 16, false);
			this.Ah = _md_ts_1.SHA512_IV[0] | 0;
			this.Al = _md_ts_1.SHA512_IV[1] | 0;
			this.Bh = _md_ts_1.SHA512_IV[2] | 0;
			this.Bl = _md_ts_1.SHA512_IV[3] | 0;
			this.Ch = _md_ts_1.SHA512_IV[4] | 0;
			this.Cl = _md_ts_1.SHA512_IV[5] | 0;
			this.Dh = _md_ts_1.SHA512_IV[6] | 0;
			this.Dl = _md_ts_1.SHA512_IV[7] | 0;
			this.Eh = _md_ts_1.SHA512_IV[8] | 0;
			this.El = _md_ts_1.SHA512_IV[9] | 0;
			this.Fh = _md_ts_1.SHA512_IV[10] | 0;
			this.Fl = _md_ts_1.SHA512_IV[11] | 0;
			this.Gh = _md_ts_1.SHA512_IV[12] | 0;
			this.Gl = _md_ts_1.SHA512_IV[13] | 0;
			this.Hh = _md_ts_1.SHA512_IV[14] | 0;
			this.Hl = _md_ts_1.SHA512_IV[15] | 0;
		}
		get() {
			const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			return [
				Ah,
				Al,
				Bh,
				Bl,
				Ch,
				Cl,
				Dh,
				Dl,
				Eh,
				El,
				Fh,
				Fl,
				Gh,
				Gl,
				Hh,
				Hl
			];
		}
		set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
			this.Ah = Ah | 0;
			this.Al = Al | 0;
			this.Bh = Bh | 0;
			this.Bl = Bl | 0;
			this.Ch = Ch | 0;
			this.Cl = Cl | 0;
			this.Dh = Dh | 0;
			this.Dl = Dl | 0;
			this.Eh = Eh | 0;
			this.El = El | 0;
			this.Fh = Fh | 0;
			this.Fl = Fl | 0;
			this.Gh = Gh | 0;
			this.Gl = Gl | 0;
			this.Hh = Hh | 0;
			this.Hl = Hl | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) {
				SHA512_W_H[i] = view.getUint32(offset);
				SHA512_W_L[i] = view.getUint32(offset += 4);
			}
			for (let i = 16; i < 80; i++) {
				const W15h = SHA512_W_H[i - 15] | 0;
				const W15l = SHA512_W_L[i - 15] | 0;
				const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
				const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
				const W2h = SHA512_W_H[i - 2] | 0;
				const W2l = SHA512_W_L[i - 2] | 0;
				const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
				const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
				const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
				const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
				SHA512_W_H[i] = SUMh | 0;
				SHA512_W_L[i] = SUMl | 0;
			}
			let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			for (let i = 0; i < 80; i++) {
				const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
				const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
				const CHIh = Eh & Fh ^ ~Eh & Gh;
				const CHIl = El & Fl ^ ~El & Gl;
				const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
				const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
				const T1l = T1ll | 0;
				const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
				const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
				const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
				const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
				Hh = Gh | 0;
				Hl = Gl | 0;
				Gh = Fh | 0;
				Gl = Fl | 0;
				Fh = Eh | 0;
				Fl = El | 0;
				({h: Eh, l: El} = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
				Dh = Ch | 0;
				Dl = Cl | 0;
				Ch = Bh | 0;
				Cl = Bl | 0;
				Bh = Ah | 0;
				Bl = Al | 0;
				const All = u64.add3L(T1l, sigma0l, MAJl);
				Ah = u64.add3H(All, T1h, sigma0h, MAJh);
				Al = All | 0;
			}
			({h: Ah, l: Al} = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
			({h: Bh, l: Bl} = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
			({h: Ch, l: Cl} = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
			({h: Dh, l: Dl} = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
			({h: Eh, l: El} = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
			({h: Fh, l: Fl} = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
			({h: Gh, l: Gl} = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
			({h: Hh, l: Hl} = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
			this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA512_W_H, SHA512_W_L);
		}
		destroy() {
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.SHA512 = SHA512;
	var SHA384 = class extends SHA512 {
		constructor() {
			super(48);
			this.Ah = _md_ts_1.SHA384_IV[0] | 0;
			this.Al = _md_ts_1.SHA384_IV[1] | 0;
			this.Bh = _md_ts_1.SHA384_IV[2] | 0;
			this.Bl = _md_ts_1.SHA384_IV[3] | 0;
			this.Ch = _md_ts_1.SHA384_IV[4] | 0;
			this.Cl = _md_ts_1.SHA384_IV[5] | 0;
			this.Dh = _md_ts_1.SHA384_IV[6] | 0;
			this.Dl = _md_ts_1.SHA384_IV[7] | 0;
			this.Eh = _md_ts_1.SHA384_IV[8] | 0;
			this.El = _md_ts_1.SHA384_IV[9] | 0;
			this.Fh = _md_ts_1.SHA384_IV[10] | 0;
			this.Fl = _md_ts_1.SHA384_IV[11] | 0;
			this.Gh = _md_ts_1.SHA384_IV[12] | 0;
			this.Gl = _md_ts_1.SHA384_IV[13] | 0;
			this.Hh = _md_ts_1.SHA384_IV[14] | 0;
			this.Hl = _md_ts_1.SHA384_IV[15] | 0;
		}
	};
	exports.SHA384 = SHA384;
	/**
	* Truncated SHA512/256 and SHA512/224.
	* SHA512_IV is XORed with 0xa5a5a5a5a5a5a5a5, then used as "intermediary" IV of SHA512/t.
	* Then t hashes string to produce result IV.
	* See `test/misc/sha2-gen-iv.js`.
	*/
	/** SHA512/224 IV */
	var T224_IV = /* @__PURE__ */ Uint32Array.from([
		2352822216,
		424955298,
		1944164710,
		2312950998,
		502970286,
		855612546,
		1738396948,
		1479516111,
		258812777,
		2077511080,
		2011393907,
		79989058,
		1067287976,
		1780299464,
		286451373,
		2446758561
	]);
	/** SHA512/256 IV */
	var T256_IV = /* @__PURE__ */ Uint32Array.from([
		573645204,
		4230739756,
		2673172387,
		3360449730,
		596883563,
		1867755857,
		2520282905,
		1497426621,
		2519219938,
		2827943907,
		3193839141,
		1401305490,
		721525244,
		746961066,
		246885852,
		2177182882
	]);
	var SHA512_224 = class extends SHA512 {
		constructor() {
			super(28);
			this.Ah = T224_IV[0] | 0;
			this.Al = T224_IV[1] | 0;
			this.Bh = T224_IV[2] | 0;
			this.Bl = T224_IV[3] | 0;
			this.Ch = T224_IV[4] | 0;
			this.Cl = T224_IV[5] | 0;
			this.Dh = T224_IV[6] | 0;
			this.Dl = T224_IV[7] | 0;
			this.Eh = T224_IV[8] | 0;
			this.El = T224_IV[9] | 0;
			this.Fh = T224_IV[10] | 0;
			this.Fl = T224_IV[11] | 0;
			this.Gh = T224_IV[12] | 0;
			this.Gl = T224_IV[13] | 0;
			this.Hh = T224_IV[14] | 0;
			this.Hl = T224_IV[15] | 0;
		}
	};
	exports.SHA512_224 = SHA512_224;
	var SHA512_256 = class extends SHA512 {
		constructor() {
			super(32);
			this.Ah = T256_IV[0] | 0;
			this.Al = T256_IV[1] | 0;
			this.Bh = T256_IV[2] | 0;
			this.Bl = T256_IV[3] | 0;
			this.Ch = T256_IV[4] | 0;
			this.Cl = T256_IV[5] | 0;
			this.Dh = T256_IV[6] | 0;
			this.Dl = T256_IV[7] | 0;
			this.Eh = T256_IV[8] | 0;
			this.El = T256_IV[9] | 0;
			this.Fh = T256_IV[10] | 0;
			this.Fl = T256_IV[11] | 0;
			this.Gh = T256_IV[12] | 0;
			this.Gl = T256_IV[13] | 0;
			this.Hh = T256_IV[14] | 0;
			this.Hl = T256_IV[15] | 0;
		}
	};
	exports.SHA512_256 = SHA512_256;
	/**
	* SHA2-256 hash function from RFC 4634.
	*
	* It is the fastest JS hash, even faster than Blake3.
	* To break sha256 using birthday attack, attackers need to try 2^128 hashes.
	* BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
	*/
	exports.sha256 = (0, utils_ts_1.createHasher)(() => new SHA256());
	/** SHA2-224 hash function from RFC 4634 */
	exports.sha224 = (0, utils_ts_1.createHasher)(() => new SHA224());
	/** SHA2-512 hash function from RFC 4634. */
	exports.sha512 = (0, utils_ts_1.createHasher)(() => new SHA512());
	/** SHA2-384 hash function from RFC 4634. */
	exports.sha384 = (0, utils_ts_1.createHasher)(() => new SHA384());
	/**
	* SHA2-512/256 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_256 = (0, utils_ts_1.createHasher)(() => new SHA512_256());
	/**
	* SHA2-512/224 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_224 = (0, utils_ts_1.createHasher)(() => new SHA512_224());
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/utils.js
var require_utils$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Hex, bytes and number utilities.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.notImplemented = exports.bitMask = void 0;
	exports.isBytes = isBytes;
	exports.abytes = abytes;
	exports.abool = abool;
	exports.numberToHexUnpadded = numberToHexUnpadded;
	exports.hexToNumber = hexToNumber;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.bytesToNumberLE = bytesToNumberLE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.numberToBytesLE = numberToBytesLE;
	exports.numberToVarBytesBE = numberToVarBytesBE;
	exports.ensureBytes = ensureBytes;
	exports.concatBytes = concatBytes;
	exports.equalBytes = equalBytes;
	exports.utf8ToBytes = utf8ToBytes;
	exports.inRange = inRange;
	exports.aInRange = aInRange;
	exports.bitLen = bitLen;
	exports.bitGet = bitGet;
	exports.bitSet = bitSet;
	exports.createHmacDrbg = createHmacDrbg;
	exports.validateObject = validateObject;
	exports.memoized = memoized;
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = /* @__PURE__ */ BigInt(1);
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	function abytes(item) {
		if (!isBytes(item)) throw new Error("Uint8Array expected");
	}
	function abool(title, value) {
		if (typeof value !== "boolean") throw new Error(title + " boolean expected, got " + value);
	}
	function numberToHexUnpadded(num) {
		const hex = num.toString(16);
		return hex.length & 1 ? "0" + hex : hex;
	}
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return hex === "" ? _0n : BigInt("0x" + hex);
	}
	var hasHexBuiltin = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Convert byte array to hex string. Uses built-in function, when available.
	* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
	*/
	function bytesToHex(bytes) {
		abytes(bytes);
		if (hasHexBuiltin) return bytes.toHex();
		let hex = "";
		for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
		return hex;
	}
	var asciis = {
		_0: 48,
		_9: 57,
		A: 65,
		F: 70,
		a: 97,
		f: 102
	};
	function asciiToBase16(ch) {
		if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
		if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
		if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
	}
	/**
	* Convert hex string to byte array. Uses built-in function, when available.
	* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
	*/
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		if (hasHexBuiltin) return Uint8Array.fromHex(hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber(bytesToHex(bytes));
	}
	function bytesToNumberLE(bytes) {
		abytes(bytes);
		return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
	}
	function numberToBytesBE(n, len) {
		return hexToBytes(n.toString(16).padStart(len * 2, "0"));
	}
	function numberToBytesLE(n, len) {
		return numberToBytesBE(n, len).reverse();
	}
	function numberToVarBytesBE(n) {
		return hexToBytes(numberToHexUnpadded(n));
	}
	/**
	* Takes hex string or Uint8Array, converts to Uint8Array.
	* Validates output length.
	* Will throw error for other types.
	* @param title descriptive title for an error e.g. 'private key'
	* @param hex hex string or Uint8Array
	* @param expectedLength optional, will compare to result array's length
	* @returns
	*/
	function ensureBytes(title, hex, expectedLength) {
		let res;
		if (typeof hex === "string") try {
			res = hexToBytes(hex);
		} catch (e) {
			throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
		}
		else if (isBytes(hex)) res = Uint8Array.from(hex);
		else throw new Error(title + " must be hex string or Uint8Array");
		const len = res.length;
		if (typeof expectedLength === "number" && len !== expectedLength) throw new Error(title + " of length " + expectedLength + " expected, got " + len);
		return res;
	}
	/**
	* Copies several Uint8Arrays into one.
	*/
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			abytes(a);
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/**
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
	function inRange(n, min, max) {
		return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
	}
	/**
	* Asserts min <= n < max. NOTE: It's < max and not <= max.
	* @example
	* aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
	*/
	function aInRange(title, n, min, max) {
		if (!inRange(n, min, max)) throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
	}
	/**
	* Calculates amount of bits in a bigint.
	* Same as `n.toString(2).length`
	* TODO: merge with nLength in modular
	*/
	function bitLen(n) {
		let len = 0;
		for (; n > _0n; n >>= _1n, len += 1);
		return len;
	}
	/**
	* Gets single bit at position.
	* NOTE: first bit position is 0 (same as arrays)
	* Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
	*/
	function bitGet(n, pos) {
		return n >> BigInt(pos) & _1n;
	}
	/**
	* Sets single bit at position.
	*/
	function bitSet(n, pos, value) {
		return n | (value ? _1n : _0n) << BigInt(pos);
	}
	/**
	* Calculate mask for N bits. Not using ** operator with bigints because of old engines.
	* Same as BigInt(`0b${Array(i).fill('1').join('')}`)
	*/
	var bitMask = (n) => (_1n << BigInt(n)) - _1n;
	exports.bitMask = bitMask;
	var u8n = (len) => new Uint8Array(len);
	var u8fr = (arr) => Uint8Array.from(arr);
	/**
	* Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
	* @returns function that will call DRBG until 2nd arg returns something meaningful
	* @example
	*   const drbg = createHmacDRBG<Key>(32, 32, hmac);
	*   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
	*/
	function createHmacDrbg(hashLen, qByteLen, hmacFn) {
		if (typeof hashLen !== "number" || hashLen < 2) throw new Error("hashLen must be a number");
		if (typeof qByteLen !== "number" || qByteLen < 2) throw new Error("qByteLen must be a number");
		if (typeof hmacFn !== "function") throw new Error("hmacFn must be a function");
		let v = u8n(hashLen);
		let k = u8n(hashLen);
		let i = 0;
		const reset = () => {
			v.fill(1);
			k.fill(0);
			i = 0;
		};
		const h = (...b) => hmacFn(k, v, ...b);
		const reseed = (seed = u8n(0)) => {
			k = h(u8fr([0]), seed);
			v = h();
			if (seed.length === 0) return;
			k = h(u8fr([1]), seed);
			v = h();
		};
		const gen = () => {
			if (i++ >= 1e3) throw new Error("drbg: tried 1000 values");
			let len = 0;
			const out = [];
			while (len < qByteLen) {
				v = h();
				const sl = v.slice();
				out.push(sl);
				len += v.length;
			}
			return concatBytes(...out);
		};
		const genUntil = (seed, pred) => {
			reset();
			reseed(seed);
			let res = void 0;
			while (!(res = pred(gen()))) reseed();
			reset();
			return res;
		};
		return genUntil;
	}
	var validatorFns = {
		bigint: (val) => typeof val === "bigint",
		function: (val) => typeof val === "function",
		boolean: (val) => typeof val === "boolean",
		string: (val) => typeof val === "string",
		stringOrUint8Array: (val) => typeof val === "string" || isBytes(val),
		isSafeInteger: (val) => Number.isSafeInteger(val),
		array: (val) => Array.isArray(val),
		field: (val, object) => object.Fp.isValid(val),
		hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
	};
	function validateObject(object, validators, optValidators = {}) {
		const checkField = (fieldName, type, isOptional) => {
			const checkVal = validatorFns[type];
			if (typeof checkVal !== "function") throw new Error("invalid validator function");
			const val = object[fieldName];
			if (isOptional && val === void 0) return;
			if (!checkVal(val, object)) throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
		};
		for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);
		for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);
		return object;
	}
	/**
	* throws not implemented error
	*/
	var notImplemented = () => {
		throw new Error("not implemented");
	};
	exports.notImplemented = notImplemented;
	/**
	* Memoizes (caches) computation result.
	* Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
	*/
	function memoized(fn) {
		const map = /* @__PURE__ */ new WeakMap();
		return (arg, ...args) => {
			const val = map.get(arg);
			if (val !== void 0) return val;
			const computed = fn(arg, ...args);
			map.set(arg, computed);
			return computed;
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/hmac.js
var require_hmac$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac = exports.HMAC = void 0;
	/**
	* HMAC: RFC2104 message authentication code.
	* @module
	*/
	var utils_ts_1 = require_utils$4();
	var HMAC = class extends utils_ts_1.Hash {
		constructor(hash, _key) {
			super();
			this.finished = false;
			this.destroyed = false;
			(0, utils_ts_1.ahash)(hash);
			const key = (0, utils_ts_1.toBytes)(_key);
			this.iHash = hash.create();
			if (typeof this.iHash.update !== "function") throw new Error("Expected instance of class which extends utils.Hash");
			this.blockLen = this.iHash.blockLen;
			this.outputLen = this.iHash.outputLen;
			const blockLen = this.blockLen;
			const pad = new Uint8Array(blockLen);
			pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
			for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
			this.iHash.update(pad);
			this.oHash = hash.create();
			for (let i = 0; i < pad.length; i++) pad[i] ^= 106;
			this.oHash.update(pad);
			(0, utils_ts_1.clean)(pad);
		}
		update(buf) {
			(0, utils_ts_1.aexists)(this);
			this.iHash.update(buf);
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.abytes)(out, this.outputLen);
			this.finished = true;
			this.iHash.digestInto(out);
			this.oHash.update(out);
			this.oHash.digestInto(out);
			this.destroy();
		}
		digest() {
			const out = new Uint8Array(this.oHash.outputLen);
			this.digestInto(out);
			return out;
		}
		_cloneInto(to) {
			to || (to = Object.create(Object.getPrototypeOf(this), {}));
			const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
			to = to;
			to.finished = finished;
			to.destroyed = destroyed;
			to.blockLen = blockLen;
			to.outputLen = outputLen;
			to.oHash = oHash._cloneInto(to.oHash);
			to.iHash = iHash._cloneInto(to.iHash);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
		destroy() {
			this.destroyed = true;
			this.oHash.destroy();
			this.iHash.destroy();
		}
	};
	exports.HMAC = HMAC;
	/**
	* HMAC: RFC2104 message authentication code.
	* @param hash - function that would be used e.g. sha256
	* @param key - message key
	* @param message - message data
	* @example
	* import { hmac } from '@noble/hashes/hmac';
	* import { sha256 } from '@noble/hashes/sha2';
	* const mac1 = hmac(sha256, 'key', 'message');
	*/
	var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
	exports.hmac = hmac;
	exports.hmac.create = (hash, key) => new HMAC(hash, key);
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/modular.js
var require_modular$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNegativeLE = void 0;
	exports.mod = mod;
	exports.pow = pow;
	exports.pow2 = pow2;
	exports.invert = invert;
	exports.tonelliShanks = tonelliShanks;
	exports.FpSqrt = FpSqrt;
	exports.validateField = validateField;
	exports.FpPow = FpPow;
	exports.FpInvertBatch = FpInvertBatch;
	exports.FpDiv = FpDiv;
	exports.FpLegendre = FpLegendre;
	exports.FpIsSquare = FpIsSquare;
	exports.nLength = nLength;
	exports.Field = Field;
	exports.FpSqrtOdd = FpSqrtOdd;
	exports.FpSqrtEven = FpSqrtEven;
	exports.hashToPrivateScalar = hashToPrivateScalar;
	exports.getFieldBytesLength = getFieldBytesLength;
	exports.getMinHashLength = getMinHashLength;
	exports.mapHashToField = mapHashToField;
	/**
	* Utils for modular division and finite fields.
	* A finite field over 11 is integer number operations `mod 11`.
	* There is no division: it is replaced by modular multiplicative inverse.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_1 = require_utils$4();
	var utils_ts_1 = require_utils$3();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = /* @__PURE__ */ BigInt(2);
	var _3n = /* @__PURE__ */ BigInt(3);
	var _4n = /* @__PURE__ */ BigInt(4);
	var _5n = /* @__PURE__ */ BigInt(5);
	var _8n = /* @__PURE__ */ BigInt(8);
	function mod(a, b) {
		const result = a % b;
		return result >= _0n ? result : b + result;
	}
	/**
	* Efficiently raise num to power and do modular division.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	* TODO: remove.
	* @example
	* pow(2n, 6n, 11n) // 64n % 11n == 9n
	*/
	function pow(num, power, modulo) {
		return FpPow(Field(modulo), num, power);
	}
	/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
	function pow2(x, power, modulo) {
		let res = x;
		while (power-- > _0n) {
			res *= res;
			res %= modulo;
		}
		return res;
	}
	/**
	* Inverses number over modulo.
	* Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
	*/
	function invert(number, modulo) {
		if (number === _0n) throw new Error("invert: expected non-zero number");
		if (modulo <= _0n) throw new Error("invert: expected positive modulus, got " + modulo);
		let a = mod(number, modulo);
		let b = modulo;
		let x = _0n, y = _1n, u = _1n, v = _0n;
		while (a !== _0n) {
			const q = b / a;
			const r = b % a;
			const m = x - u * q;
			const n = y - v * q;
			b = a, a = r, x = u, y = v, u = m, v = n;
		}
		if (b !== _1n) throw new Error("invert: does not exist");
		return mod(x, modulo);
	}
	function sqrt3mod4(Fp, n) {
		const p1div4 = (Fp.ORDER + _1n) / _4n;
		const root = Fp.pow(n, p1div4);
		if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
		return root;
	}
	function sqrt5mod8(Fp, n) {
		const p5div8 = (Fp.ORDER - _5n) / _8n;
		const n2 = Fp.mul(n, _2n);
		const v = Fp.pow(n2, p5div8);
		const nv = Fp.mul(n, v);
		const i = Fp.mul(Fp.mul(nv, _2n), v);
		const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
		if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
		return root;
	}
	/**
	* Tonelli-Shanks square root search algorithm.
	* 1. https://eprint.iacr.org/2012/685.pdf (page 12)
	* 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
	* @param P field order
	* @returns function that takes field Fp (created from P) and number n
	*/
	function tonelliShanks(P) {
		if (P < BigInt(3)) throw new Error("sqrt is not defined for small field");
		let Q = P - _1n;
		let S = 0;
		while (Q % _2n === _0n) {
			Q /= _2n;
			S++;
		}
		let Z = _2n;
		const _Fp = Field(P);
		while (FpLegendre(_Fp, Z) === 1) if (Z++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
		if (S === 1) return sqrt3mod4;
		let cc = _Fp.pow(Z, Q);
		const Q1div2 = (Q + _1n) / _2n;
		return function tonelliSlow(Fp, n) {
			if (Fp.is0(n)) return n;
			if (FpLegendre(Fp, n) !== 1) throw new Error("Cannot find square root");
			let M = S;
			let c = Fp.mul(Fp.ONE, cc);
			let t = Fp.pow(n, Q);
			let R = Fp.pow(n, Q1div2);
			while (!Fp.eql(t, Fp.ONE)) {
				if (Fp.is0(t)) return Fp.ZERO;
				let i = 1;
				let t_tmp = Fp.sqr(t);
				while (!Fp.eql(t_tmp, Fp.ONE)) {
					i++;
					t_tmp = Fp.sqr(t_tmp);
					if (i === M) throw new Error("Cannot find square root");
				}
				const exponent = _1n << BigInt(M - i - 1);
				const b = Fp.pow(c, exponent);
				M = i;
				c = Fp.sqr(b);
				t = Fp.mul(t, c);
				R = Fp.mul(R, b);
			}
			return R;
		};
	}
	/**
	* Square root for a finite field. Will try optimized versions first:
	*
	* 1. P ≡ 3 (mod 4)
	* 2. P ≡ 5 (mod 8)
	* 3. Tonelli-Shanks algorithm
	*
	* Different algorithms can give different roots, it is up to user to decide which one they want.
	* For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
	*/
	function FpSqrt(P) {
		if (P % _4n === _3n) return sqrt3mod4;
		if (P % _8n === _5n) return sqrt5mod8;
		return tonelliShanks(P);
	}
	var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;
	exports.isNegativeLE = isNegativeLE;
	var FIELD_FIELDS = [
		"create",
		"isValid",
		"is0",
		"neg",
		"inv",
		"sqrt",
		"sqr",
		"eql",
		"add",
		"sub",
		"mul",
		"pow",
		"div",
		"addN",
		"subN",
		"mulN",
		"sqrN"
	];
	function validateField(field) {
		const opts = FIELD_FIELDS.reduce((map, val) => {
			map[val] = "function";
			return map;
		}, {
			ORDER: "bigint",
			MASK: "bigint",
			BYTES: "isSafeInteger",
			BITS: "isSafeInteger"
		});
		return (0, utils_ts_1.validateObject)(field, opts);
	}
	/**
	* Same as `pow` but for Fp: non-constant-time.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	*/
	function FpPow(Fp, num, power) {
		if (power < _0n) throw new Error("invalid exponent, negatives unsupported");
		if (power === _0n) return Fp.ONE;
		if (power === _1n) return num;
		let p = Fp.ONE;
		let d = num;
		while (power > _0n) {
			if (power & _1n) p = Fp.mul(p, d);
			d = Fp.sqr(d);
			power >>= _1n;
		}
		return p;
	}
	/**
	* Efficiently invert an array of Field elements.
	* Exception-free. Will return `undefined` for 0 elements.
	* @param passZero map 0 to 0 (instead of undefined)
	*/
	function FpInvertBatch(Fp, nums, passZero = false) {
		const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
		const multipliedAcc = nums.reduce((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = acc;
			return Fp.mul(acc, num);
		}, Fp.ONE);
		const invertedAcc = Fp.inv(multipliedAcc);
		nums.reduceRight((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = Fp.mul(acc, inverted[i]);
			return Fp.mul(acc, num);
		}, invertedAcc);
		return inverted;
	}
	function FpDiv(Fp, lhs, rhs) {
		return Fp.mul(lhs, typeof rhs === "bigint" ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
	}
	/**
	* Legendre symbol.
	* Legendre constant is used to calculate Legendre symbol (a | p)
	* which denotes the value of a^((p-1)/2) (mod p).
	*
	* * (a | p) ≡ 1    if a is a square (mod p), quadratic residue
	* * (a | p) ≡ -1   if a is not a square (mod p), quadratic non residue
	* * (a | p) ≡ 0    if a ≡ 0 (mod p)
	*/
	function FpLegendre(Fp, n) {
		const p1mod2 = (Fp.ORDER - _1n) / _2n;
		const powered = Fp.pow(n, p1mod2);
		const yes = Fp.eql(powered, Fp.ONE);
		const zero = Fp.eql(powered, Fp.ZERO);
		const no = Fp.eql(powered, Fp.neg(Fp.ONE));
		if (!yes && !zero && !no) throw new Error("invalid Legendre symbol result");
		return yes ? 1 : zero ? 0 : -1;
	}
	function FpIsSquare(Fp, n) {
		return FpLegendre(Fp, n) === 1;
	}
	function nLength(n, nBitLength) {
		if (nBitLength !== void 0) (0, utils_1.anumber)(nBitLength);
		const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
		return {
			nBitLength: _nBitLength,
			nByteLength: Math.ceil(_nBitLength / 8)
		};
	}
	/**
	* Initializes a finite field over prime.
	* Major performance optimizations:
	* * a) denormalized operations like mulN instead of mul
	* * b) same object shape: never add or remove keys
	* * c) Object.freeze
	* Fragile: always run a benchmark on a change.
	* Security note: operations don't check 'isValid' for all elements for performance reasons,
	* it is caller responsibility to check this.
	* This is low-level code, please make sure you know what you're doing.
	* @param ORDER prime positive bigint
	* @param bitLen how many bits the field consumes
	* @param isLE (def: false) if encoding / decoding should be in little-endian
	* @param redef optional faster redefinitions of sqrt and other methods
	*/
	function Field(ORDER, bitLen, isLE = false, redef = {}) {
		if (ORDER <= _0n) throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
		const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen);
		if (BYTES > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
		let sqrtP;
		const f = Object.freeze({
			ORDER,
			isLE,
			BITS,
			BYTES,
			MASK: (0, utils_ts_1.bitMask)(BITS),
			ZERO: _0n,
			ONE: _1n,
			create: (num) => mod(num, ORDER),
			isValid: (num) => {
				if (typeof num !== "bigint") throw new Error("invalid field element: expected bigint, got " + typeof num);
				return _0n <= num && num < ORDER;
			},
			is0: (num) => num === _0n,
			isOdd: (num) => (num & _1n) === _1n,
			neg: (num) => mod(-num, ORDER),
			eql: (lhs, rhs) => lhs === rhs,
			sqr: (num) => mod(num * num, ORDER),
			add: (lhs, rhs) => mod(lhs + rhs, ORDER),
			sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
			mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
			pow: (num, power) => FpPow(f, num, power),
			div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
			sqrN: (num) => num * num,
			addN: (lhs, rhs) => lhs + rhs,
			subN: (lhs, rhs) => lhs - rhs,
			mulN: (lhs, rhs) => lhs * rhs,
			inv: (num) => invert(num, ORDER),
			sqrt: redef.sqrt || ((n) => {
				if (!sqrtP) sqrtP = FpSqrt(ORDER);
				return sqrtP(f, n);
			}),
			toBytes: (num) => isLE ? (0, utils_ts_1.numberToBytesLE)(num, BYTES) : (0, utils_ts_1.numberToBytesBE)(num, BYTES),
			fromBytes: (bytes) => {
				if (bytes.length !== BYTES) throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
				return isLE ? (0, utils_ts_1.bytesToNumberLE)(bytes) : (0, utils_ts_1.bytesToNumberBE)(bytes);
			},
			invertBatch: (lst) => FpInvertBatch(f, lst),
			cmov: (a, b, c) => c ? b : a
		});
		return Object.freeze(f);
	}
	function FpSqrtOdd(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? root : Fp.neg(root);
	}
	function FpSqrtEven(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? Fp.neg(root) : root;
	}
	/**
	* "Constant-time" private key generation utility.
	* Same as mapKeyToField, but accepts less bytes (40 instead of 48 for 32-byte field).
	* Which makes it slightly more biased, less secure.
	* @deprecated use `mapKeyToField` instead
	*/
	function hashToPrivateScalar(hash, groupOrder, isLE = false) {
		hash = (0, utils_ts_1.ensureBytes)("privateHash", hash);
		const hashLen = hash.length;
		const minLen = nLength(groupOrder).nByteLength + 8;
		if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error("hashToPrivateScalar: expected " + minLen + "-1024 bytes of input, got " + hashLen);
		return mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(hash) : (0, utils_ts_1.bytesToNumberBE)(hash), groupOrder - _1n) + _1n;
	}
	/**
	* Returns total number of bytes consumed by the field element.
	* For example, 32 bytes for usual 256-bit weierstrass curve.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of field
	*/
	function getFieldBytesLength(fieldOrder) {
		if (typeof fieldOrder !== "bigint") throw new Error("field order must be bigint");
		const bitLength = fieldOrder.toString(2).length;
		return Math.ceil(bitLength / 8);
	}
	/**
	* Returns minimal amount of bytes that can be safely reduced
	* by field order.
	* Should be 2^-128 for 128-bit curve such as P256.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of target hash
	*/
	function getMinHashLength(fieldOrder) {
		const length = getFieldBytesLength(fieldOrder);
		return length + Math.ceil(length / 2);
	}
	/**
	* "Constant-time" private key generation utility.
	* Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
	* and convert them into private scalar, with the modulo bias being negligible.
	* Needs at least 48 bytes of input for 32-byte private key.
	* https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
	* FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
	* RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
	* @param hash hash output from SHA3 or a similar function
	* @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
	* @param isLE interpret hash bytes as LE num
	* @returns valid private scalar
	*/
	function mapHashToField(key, fieldOrder, isLE = false) {
		const len = key.length;
		const fieldLen = getFieldBytesLength(fieldOrder);
		const minLen = getMinHashLength(fieldOrder);
		if (len < 16 || len < minLen || len > 1024) throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
		const reduced = mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(key) : (0, utils_ts_1.bytesToNumberBE)(key), fieldOrder - _1n) + _1n;
		return isLE ? (0, utils_ts_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_ts_1.numberToBytesBE)(reduced, fieldLen);
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/curve.js
var require_curve$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wNAF = wNAF;
	exports.pippenger = pippenger;
	exports.precomputeMSMUnsafe = precomputeMSMUnsafe;
	exports.validateBasic = validateBasic;
	/**
	* Methods for elliptic curve multiplication by scalars.
	* Contains wNAF, pippenger
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	function constTimeNegate(condition, item) {
		const neg = item.negate();
		return condition ? neg : item;
	}
	function validateW(W, bits) {
		if (!Number.isSafeInteger(W) || W <= 0 || W > bits) throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
	}
	function calcWOpts(W, scalarBits) {
		validateW(W, scalarBits);
		const windows = Math.ceil(scalarBits / W) + 1;
		const windowSize = 2 ** (W - 1);
		const maxNumber = 2 ** W;
		return {
			windows,
			windowSize,
			mask: (0, utils_ts_1.bitMask)(W),
			maxNumber,
			shiftBy: BigInt(W)
		};
	}
	function calcOffsets(n, window, wOpts) {
		const { windowSize, mask, maxNumber, shiftBy } = wOpts;
		let wbits = Number(n & mask);
		let nextN = n >> shiftBy;
		if (wbits > windowSize) {
			wbits -= maxNumber;
			nextN += _1n;
		}
		const offsetStart = window * windowSize;
		const offset = offsetStart + Math.abs(wbits) - 1;
		const isZero = wbits === 0;
		const isNeg = wbits < 0;
		const isNegF = window % 2 !== 0;
		return {
			nextN,
			offset,
			isZero,
			isNeg,
			isNegF,
			offsetF: offsetStart
		};
	}
	function validateMSMPoints(points, c) {
		if (!Array.isArray(points)) throw new Error("array expected");
		points.forEach((p, i) => {
			if (!(p instanceof c)) throw new Error("invalid point at index " + i);
		});
	}
	function validateMSMScalars(scalars, field) {
		if (!Array.isArray(scalars)) throw new Error("array of scalars expected");
		scalars.forEach((s, i) => {
			if (!field.isValid(s)) throw new Error("invalid scalar at index " + i);
		});
	}
	var pointPrecomputes = /* @__PURE__ */ new WeakMap();
	var pointWindowSizes = /* @__PURE__ */ new WeakMap();
	function getW(P) {
		return pointWindowSizes.get(P) || 1;
	}
	/**
	* Elliptic curve multiplication of Point by scalar. Fragile.
	* Scalars should always be less than curve order: this should be checked inside of a curve itself.
	* Creates precomputation tables for fast multiplication:
	* - private scalar is split by fixed size windows of W bits
	* - every window point is collected from window's table & added to accumulator
	* - since windows are different, same point inside tables won't be accessed more than once per calc
	* - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
	* - +1 window is neccessary for wNAF
	* - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
	*
	* @todo Research returning 2d JS array of windows, instead of a single window.
	* This would allow windows to be in different memory locations
	*/
	function wNAF(c, bits) {
		return {
			constTimeNegate,
			hasPrecomputes(elm) {
				return getW(elm) !== 1;
			},
			unsafeLadder(elm, n, p = c.ZERO) {
				let d = elm;
				while (n > _0n) {
					if (n & _1n) p = p.add(d);
					d = d.double();
					n >>= _1n;
				}
				return p;
			},
			/**
			* Creates a wNAF precomputation window. Used for caching.
			* Default window size is set by `utils.precompute()` and is equal to 8.
			* Number of precomputed points depends on the curve size:
			* 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
			* - 𝑊 is the window size
			* - 𝑛 is the bitlength of the curve order.
			* For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
			* @param elm Point instance
			* @param W window size
			* @returns precomputed point tables flattened to a single array
			*/
			precomputeWindow(elm, W) {
				const { windows, windowSize } = calcWOpts(W, bits);
				const points = [];
				let p = elm;
				let base = p;
				for (let window = 0; window < windows; window++) {
					base = p;
					points.push(base);
					for (let i = 1; i < windowSize; i++) {
						base = base.add(p);
						points.push(base);
					}
					p = base.double();
				}
				return points;
			},
			/**
			* Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
			* @param W window size
			* @param precomputes precomputed tables
			* @param n scalar (we don't check here, but should be less than curve order)
			* @returns real and fake (for const-time) points
			*/
			wNAF(W, precomputes, n) {
				let p = c.ZERO;
				let f = c.BASE;
				const wo = calcWOpts(W, bits);
				for (let window = 0; window < wo.windows; window++) {
					const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
					n = nextN;
					if (isZero) f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
					else p = p.add(constTimeNegate(isNeg, precomputes[offset]));
				}
				return {
					p,
					f
				};
			},
			/**
			* Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
			* @param W window size
			* @param precomputes precomputed tables
			* @param n scalar (we don't check here, but should be less than curve order)
			* @param acc accumulator point to add result of multiplication
			* @returns point
			*/
			wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
				const wo = calcWOpts(W, bits);
				for (let window = 0; window < wo.windows; window++) {
					if (n === _0n) break;
					const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
					n = nextN;
					if (isZero) continue;
					else {
						const item = precomputes[offset];
						acc = acc.add(isNeg ? item.negate() : item);
					}
				}
				return acc;
			},
			getPrecomputes(W, P, transform) {
				let comp = pointPrecomputes.get(P);
				if (!comp) {
					comp = this.precomputeWindow(P, W);
					if (W !== 1) pointPrecomputes.set(P, transform(comp));
				}
				return comp;
			},
			wNAFCached(P, n, transform) {
				const W = getW(P);
				return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
			},
			wNAFCachedUnsafe(P, n, transform, prev) {
				const W = getW(P);
				if (W === 1) return this.unsafeLadder(P, n, prev);
				return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
			},
			setWindowSize(P, W) {
				validateW(W, bits);
				pointWindowSizes.set(P, W);
				pointPrecomputes.delete(P);
			}
		};
	}
	/**
	* Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* 30x faster vs naive addition on L=4096, 10x faster than precomputes.
	* For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
	* Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @param scalars array of L scalars (aka private keys / bigints)
	*/
	function pippenger(c, fieldN, points, scalars) {
		validateMSMPoints(points, c);
		validateMSMScalars(scalars, fieldN);
		const plength = points.length;
		const slength = scalars.length;
		if (plength !== slength) throw new Error("arrays of points and scalars must have equal length");
		const zero = c.ZERO;
		const wbits = (0, utils_ts_1.bitLen)(BigInt(plength));
		let windowSize = 1;
		if (wbits > 12) windowSize = wbits - 3;
		else if (wbits > 4) windowSize = wbits - 2;
		else if (wbits > 0) windowSize = 2;
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const buckets = new Array(Number(MASK) + 1).fill(zero);
		const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
		let sum = zero;
		for (let i = lastBits; i >= 0; i -= windowSize) {
			buckets.fill(zero);
			for (let j = 0; j < slength; j++) {
				const scalar = scalars[j];
				const wbits = Number(scalar >> BigInt(i) & MASK);
				buckets[wbits] = buckets[wbits].add(points[j]);
			}
			let resI = zero;
			for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
				sumI = sumI.add(buckets[j]);
				resI = resI.add(sumI);
			}
			sum = sum.add(resI);
			if (i !== 0) for (let j = 0; j < windowSize; j++) sum = sum.double();
		}
		return sum;
	}
	/**
	* Precomputed multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @returns function which multiplies points with scaars
	*/
	function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
		/**
		* Performance Analysis of Window-based Precomputation
		*
		* Base Case (256-bit scalar, 8-bit window):
		* - Standard precomputation requires:
		*   - 31 additions per scalar × 256 scalars = 7,936 ops
		*   - Plus 255 summary additions = 8,191 total ops
		*   Note: Summary additions can be optimized via accumulator
		*
		* Chunked Precomputation Analysis:
		* - Using 32 chunks requires:
		*   - 255 additions per chunk
		*   - 256 doublings
		*   - Total: (255 × 32) + 256 = 8,416 ops
		*
		* Memory Usage Comparison:
		* Window Size | Standard Points | Chunked Points
		* ------------|-----------------|---------------
		*     4-bit   |     520         |      15
		*     8-bit   |    4,224        |     255
		*    10-bit   |   13,824        |   1,023
		*    16-bit   |  557,056        |  65,535
		*
		* Key Advantages:
		* 1. Enables larger window sizes due to reduced memory overhead
		* 2. More efficient for smaller scalar counts:
		*    - 16 chunks: (16 × 255) + 256 = 4,336 ops
		*    - ~2x faster than standard 8,191 ops
		*
		* Limitations:
		* - Not suitable for plain precomputes (requires 256 constant doublings)
		* - Performance degrades with larger scalar counts:
		*   - Optimal for ~256 scalars
		*   - Less efficient for 4096+ scalars (Pippenger preferred)
		*/
		validateW(windowSize, fieldN.BITS);
		validateMSMPoints(points, c);
		const zero = c.ZERO;
		const tableSize = 2 ** windowSize - 1;
		const chunks = Math.ceil(fieldN.BITS / windowSize);
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const tables = points.map((p) => {
			const res = [];
			for (let i = 0, acc = p; i < tableSize; i++) {
				res.push(acc);
				acc = acc.add(p);
			}
			return res;
		});
		return (scalars) => {
			validateMSMScalars(scalars, fieldN);
			if (scalars.length > points.length) throw new Error("array of scalars must be smaller than array of points");
			let res = zero;
			for (let i = 0; i < chunks; i++) {
				if (res !== zero) for (let j = 0; j < windowSize; j++) res = res.double();
				const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
				for (let j = 0; j < scalars.length; j++) {
					const n = scalars[j];
					const curr = Number(n >> shiftBy & MASK);
					if (!curr) continue;
					res = res.add(tables[j][curr - 1]);
				}
			}
			return res;
		};
	}
	function validateBasic(curve) {
		(0, modular_ts_1.validateField)(curve.Fp);
		(0, utils_ts_1.validateObject)(curve, {
			n: "bigint",
			h: "bigint",
			Gx: "field",
			Gy: "field"
		}, {
			nBitLength: "isSafeInteger",
			nByteLength: "isSafeInteger"
		});
		return Object.freeze({
			...(0, modular_ts_1.nLength)(curve.n, curve.nBitLength),
			...curve,
			p: curve.Fp.ORDER
		});
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/weierstrass.js
var require_weierstrass$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DER = exports.DERErr = void 0;
	exports.weierstrassPoints = weierstrassPoints;
	exports.weierstrass = weierstrass;
	exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
	exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
	/**
	* Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
	*
	* ### Parameters
	*
	* To initialize a weierstrass curve, one needs to pass following params:
	*
	* * a: formula param
	* * b: formula param
	* * Fp: finite field of prime characteristic P; may be complex (Fp2). Arithmetics is done in field
	* * n: order of prime subgroup a.k.a total amount of valid curve points
	* * Gx: Base point (x, y) aka generator point. Gx = x coordinate
	* * Gy: ...y coordinate
	* * h: cofactor, usually 1. h*n = curve group order (n is only subgroup order)
	* * lowS: whether to enable (default) or disable "low-s" non-malleable signatures
	*
	* ### Design rationale for types
	*
	* * Interaction between classes from different curves should fail:
	*   `k256.Point.BASE.add(p256.Point.BASE)`
	* * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
	* * Different calls of `curve()` would return different classes -
	*   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
	*   it won't affect others
	*
	* TypeScript can't infer types for classes created inside a function. Classes is one instance
	* of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
	* unique type for every function call.
	*
	* We can use generic types via some param, like curve opts, but that would:
	*     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
	*     which is hard to debug.
	*     2. Params can be generic and we can't enforce them to be constant value:
	*     if somebody creates curve from non-constant params,
	*     it would be allowed to interact with other curves with non-constant params
	*
	* @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var curve_ts_1 = require_curve$2();
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	function validateSigVerOpts(opts) {
		if (opts.lowS !== void 0) (0, utils_ts_1.abool)("lowS", opts.lowS);
		if (opts.prehash !== void 0) (0, utils_ts_1.abool)("prehash", opts.prehash);
	}
	function validatePointOpts(curve) {
		const opts = (0, curve_ts_1.validateBasic)(curve);
		(0, utils_ts_1.validateObject)(opts, {
			a: "field",
			b: "field"
		}, {
			allowInfinityPoint: "boolean",
			allowedPrivateKeyLengths: "array",
			clearCofactor: "function",
			fromBytes: "function",
			isTorsionFree: "function",
			toBytes: "function",
			wrapPrivateKey: "boolean"
		});
		const { endo, Fp, a } = opts;
		if (endo) {
			if (!Fp.eql(a, Fp.ZERO)) throw new Error("invalid endo: CURVE.a must be 0");
			if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") throw new Error("invalid endo: expected \"beta\": bigint and \"splitScalar\": function");
		}
		return Object.freeze({ ...opts });
	}
	var DERErr = class extends Error {
		constructor(m = "") {
			super(m);
		}
	};
	exports.DERErr = DERErr;
	/**
	* ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
	*
	*     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
	*
	* Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
	*/
	exports.DER = {
		Err: DERErr,
		_tlv: {
			encode: (tag, data) => {
				const { Err: E } = exports.DER;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length & 1) throw new E("tlv.encode: unpadded data");
				const dataLen = data.length / 2;
				const len = (0, utils_ts_1.numberToHexUnpadded)(dataLen);
				if (len.length / 2 & 128) throw new E("tlv.encode: long form length too big");
				const lenLen = dataLen > 127 ? (0, utils_ts_1.numberToHexUnpadded)(len.length / 2 | 128) : "";
				return (0, utils_ts_1.numberToHexUnpadded)(tag) + lenLen + len + data;
			},
			decode(tag, data) {
				const { Err: E } = exports.DER;
				let pos = 0;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length < 2 || data[pos++] !== tag) throw new E("tlv.decode: wrong tlv");
				const first = data[pos++];
				const isLong = !!(first & 128);
				let length = 0;
				if (!isLong) length = first;
				else {
					const lenLen = first & 127;
					if (!lenLen) throw new E("tlv.decode(long): indefinite length not supported");
					if (lenLen > 4) throw new E("tlv.decode(long): byte length is too big");
					const lengthBytes = data.subarray(pos, pos + lenLen);
					if (lengthBytes.length !== lenLen) throw new E("tlv.decode: length bytes not complete");
					if (lengthBytes[0] === 0) throw new E("tlv.decode(long): zero leftmost byte");
					for (const b of lengthBytes) length = length << 8 | b;
					pos += lenLen;
					if (length < 128) throw new E("tlv.decode(long): not minimal encoding");
				}
				const v = data.subarray(pos, pos + length);
				if (v.length !== length) throw new E("tlv.decode: wrong value length");
				return {
					v,
					l: data.subarray(pos + length)
				};
			}
		},
		_int: {
			encode(num) {
				const { Err: E } = exports.DER;
				if (num < _0n) throw new E("integer: negative integers are not allowed");
				let hex = (0, utils_ts_1.numberToHexUnpadded)(num);
				if (Number.parseInt(hex[0], 16) & 8) hex = "00" + hex;
				if (hex.length & 1) throw new E("unexpected DER parsing assertion: unpadded hex");
				return hex;
			},
			decode(data) {
				const { Err: E } = exports.DER;
				if (data[0] & 128) throw new E("invalid signature integer: negative");
				if (data[0] === 0 && !(data[1] & 128)) throw new E("invalid signature integer: unnecessary leading zero");
				return (0, utils_ts_1.bytesToNumberBE)(data);
			}
		},
		toSig(hex) {
			const { Err: E, _int: int, _tlv: tlv } = exports.DER;
			const data = (0, utils_ts_1.ensureBytes)("signature", hex);
			const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
			if (seqLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
			const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
			if (sLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			return {
				r: int.decode(rBytes),
				s: int.decode(sBytes)
			};
		},
		hexFromSig(sig) {
			const { _tlv: tlv, _int: int } = exports.DER;
			const seq = tlv.encode(2, int.encode(sig.r)) + tlv.encode(2, int.encode(sig.s));
			return tlv.encode(48, seq);
		}
	};
	function numToSizedHex(num, size) {
		return (0, utils_ts_1.bytesToHex)((0, utils_ts_1.numberToBytesBE)(num, size));
	}
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	var _4n = BigInt(4);
	function weierstrassPoints(opts) {
		const CURVE = validatePointOpts(opts);
		const { Fp } = CURVE;
		const Fn = (0, modular_ts_1.Field)(CURVE.n, CURVE.nBitLength);
		const toBytes = CURVE.toBytes || ((_c, point, _isCompressed) => {
			const a = point.toAffine();
			return (0, utils_ts_1.concatBytes)(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
		});
		const fromBytes = CURVE.fromBytes || ((bytes) => {
			const tail = bytes.subarray(1);
			return {
				x: Fp.fromBytes(tail.subarray(0, Fp.BYTES)),
				y: Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
			};
		});
		/**
		* y² = x³ + ax + b: Short weierstrass curve formula. Takes x, returns y².
		* @returns y²
		*/
		function weierstrassEquation(x) {
			const { a, b } = CURVE;
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
		}
		function isValidXY(x, y) {
			const left = Fp.sqr(y);
			const right = weierstrassEquation(x);
			return Fp.eql(left, right);
		}
		if (!isValidXY(CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
		const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
		if (Fp.is0(Fp.add(_4a3, _27b2))) throw new Error("bad curve params: a or b");
		function isWithinCurveOrder(num) {
			return (0, utils_ts_1.inRange)(num, _1n, CURVE.n);
		}
		function normPrivateKeyToScalar(key) {
			const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
			if (lengths && typeof key !== "bigint") {
				if ((0, utils_ts_1.isBytes)(key)) key = (0, utils_ts_1.bytesToHex)(key);
				if (typeof key !== "string" || !lengths.includes(key.length)) throw new Error("invalid private key");
				key = key.padStart(nByteLength * 2, "0");
			}
			let num;
			try {
				num = typeof key === "bigint" ? key : (0, utils_ts_1.bytesToNumberBE)((0, utils_ts_1.ensureBytes)("private key", key, nByteLength));
			} catch (error) {
				throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
			}
			if (wrapPrivateKey) num = (0, modular_ts_1.mod)(num, N);
			(0, utils_ts_1.aInRange)("private key", num, _1n, N);
			return num;
		}
		function aprjpoint(other) {
			if (!(other instanceof Point)) throw new Error("ProjectivePoint expected");
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { px: x, py: y, pz: z } = p;
			if (Fp.eql(z, Fp.ONE)) return {
				x,
				y
			};
			const is0 = p.is0();
			if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(z);
			const ax = Fp.mul(x, iz);
			const ay = Fp.mul(y, iz);
			const zz = Fp.mul(z, iz);
			if (is0) return {
				x: Fp.ZERO,
				y: Fp.ZERO
			};
			if (!Fp.eql(zz, Fp.ONE)) throw new Error("invZ was invalid");
			return {
				x: ax,
				y: ay
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			if (p.is0()) {
				if (CURVE.allowInfinityPoint && !Fp.is0(p.py)) return;
				throw new Error("bad point: ZERO");
			}
			const { x, y } = p.toAffine();
			if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error("bad point: x or y not FE");
			if (!isValidXY(x, y)) throw new Error("bad point: equation left != right");
			if (!p.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
			return true;
		});
		/**
		* Projective Point works in 3d / projective (homogeneous) coordinates: (X, Y, Z) ∋ (x=X/Z, y=Y/Z)
		* Default Point works in 2d / affine coordinates: (x, y)
		* We're doing calculations in projective, because its operations don't require costly inversion.
		*/
		class Point {
			constructor(px, py, pz) {
				if (px == null || !Fp.isValid(px)) throw new Error("x required");
				if (py == null || !Fp.isValid(py) || Fp.is0(py)) throw new Error("y required");
				if (pz == null || !Fp.isValid(pz)) throw new Error("z required");
				this.px = px;
				this.py = py;
				this.pz = pz;
				Object.freeze(this);
			}
			static fromAffine(p) {
				const { x, y } = p || {};
				if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error("invalid affine point");
				if (p instanceof Point) throw new Error("projective point not allowed");
				const is0 = (i) => Fp.eql(i, Fp.ZERO);
				if (is0(x) && is0(y)) return Point.ZERO;
				return new Point(x, y, Fp.ONE);
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			/**
			* Takes a bunch of Projective Points but executes only one
			* inversion on all of them. Inversion is very slow operation,
			* so this improves performance massively.
			* Optimization: converts a list of projective points to a list of identical points with Z=1.
			*/
			static normalizeZ(points) {
				const toInv = (0, modular_ts_1.FpInvertBatch)(Fp, points.map((p) => p.pz));
				return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
			}
			/**
			* Converts hash string or Uint8Array to Point.
			* @param hex short/long ECDSA hex
			*/
			static fromHex(hex) {
				const P = Point.fromAffine(fromBytes((0, utils_ts_1.ensureBytes)("pointHex", hex)));
				P.assertValidity();
				return P;
			}
			static fromPrivateKey(privateKey) {
				return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			_setWindowSize(windowSize) {
				wnaf.setWindowSize(this, windowSize);
			}
			assertValidity() {
				assertValidMemo(this);
			}
			hasEvenY() {
				const { y } = this.toAffine();
				if (Fp.isOdd) return !Fp.isOdd(y);
				throw new Error("Field doesn't support isOdd");
			}
			/**
			* Compare one point to another.
			*/
			equals(other) {
				aprjpoint(other);
				const { px: X1, py: Y1, pz: Z1 } = this;
				const { px: X2, py: Y2, pz: Z2 } = other;
				const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
				const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
				return U1 && U2;
			}
			/**
			* Flips point to one corresponding to (x, -y) in Affine coordinates.
			*/
			negate() {
				return new Point(this.px, Fp.neg(this.py), this.pz);
			}
			double() {
				const { a, b } = CURVE;
				const b3 = Fp.mul(b, _3n);
				const { px: X1, py: Y1, pz: Z1 } = this;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				let t0 = Fp.mul(X1, X1);
				let t1 = Fp.mul(Y1, Y1);
				let t2 = Fp.mul(Z1, Z1);
				let t3 = Fp.mul(X1, Y1);
				t3 = Fp.add(t3, t3);
				Z3 = Fp.mul(X1, Z1);
				Z3 = Fp.add(Z3, Z3);
				X3 = Fp.mul(a, Z3);
				Y3 = Fp.mul(b3, t2);
				Y3 = Fp.add(X3, Y3);
				X3 = Fp.sub(t1, Y3);
				Y3 = Fp.add(t1, Y3);
				Y3 = Fp.mul(X3, Y3);
				X3 = Fp.mul(t3, X3);
				Z3 = Fp.mul(b3, Z3);
				t2 = Fp.mul(a, t2);
				t3 = Fp.sub(t0, t2);
				t3 = Fp.mul(a, t3);
				t3 = Fp.add(t3, Z3);
				Z3 = Fp.add(t0, t0);
				t0 = Fp.add(Z3, t0);
				t0 = Fp.add(t0, t2);
				t0 = Fp.mul(t0, t3);
				Y3 = Fp.add(Y3, t0);
				t2 = Fp.mul(Y1, Z1);
				t2 = Fp.add(t2, t2);
				t0 = Fp.mul(t2, t3);
				X3 = Fp.sub(X3, t0);
				Z3 = Fp.mul(t2, t1);
				Z3 = Fp.add(Z3, Z3);
				Z3 = Fp.add(Z3, Z3);
				return new Point(X3, Y3, Z3);
			}
			add(other) {
				aprjpoint(other);
				const { px: X1, py: Y1, pz: Z1 } = this;
				const { px: X2, py: Y2, pz: Z2 } = other;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				const a = CURVE.a;
				const b3 = Fp.mul(CURVE.b, _3n);
				let t0 = Fp.mul(X1, X2);
				let t1 = Fp.mul(Y1, Y2);
				let t2 = Fp.mul(Z1, Z2);
				let t3 = Fp.add(X1, Y1);
				let t4 = Fp.add(X2, Y2);
				t3 = Fp.mul(t3, t4);
				t4 = Fp.add(t0, t1);
				t3 = Fp.sub(t3, t4);
				t4 = Fp.add(X1, Z1);
				let t5 = Fp.add(X2, Z2);
				t4 = Fp.mul(t4, t5);
				t5 = Fp.add(t0, t2);
				t4 = Fp.sub(t4, t5);
				t5 = Fp.add(Y1, Z1);
				X3 = Fp.add(Y2, Z2);
				t5 = Fp.mul(t5, X3);
				X3 = Fp.add(t1, t2);
				t5 = Fp.sub(t5, X3);
				Z3 = Fp.mul(a, t4);
				X3 = Fp.mul(b3, t2);
				Z3 = Fp.add(X3, Z3);
				X3 = Fp.sub(t1, Z3);
				Z3 = Fp.add(t1, Z3);
				Y3 = Fp.mul(X3, Z3);
				t1 = Fp.add(t0, t0);
				t1 = Fp.add(t1, t0);
				t2 = Fp.mul(a, t2);
				t4 = Fp.mul(b3, t4);
				t1 = Fp.add(t1, t2);
				t2 = Fp.sub(t0, t2);
				t2 = Fp.mul(a, t2);
				t4 = Fp.add(t4, t2);
				t0 = Fp.mul(t1, t4);
				Y3 = Fp.add(Y3, t0);
				t0 = Fp.mul(t5, t4);
				X3 = Fp.mul(t3, X3);
				X3 = Fp.sub(X3, t0);
				t0 = Fp.mul(t3, t1);
				Z3 = Fp.mul(t5, Z3);
				Z3 = Fp.add(Z3, t0);
				return new Point(X3, Y3, Z3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			wNAF(n) {
				return wnaf.wNAFCached(this, n, Point.normalizeZ);
			}
			/**
			* Non-constant-time multiplication. Uses double-and-add algorithm.
			* It's faster, but should only be used when you don't care about
			* an exposed private key e.g. sig verification, which works over *public* keys.
			*/
			multiplyUnsafe(sc) {
				const { endo, n: N } = CURVE;
				(0, utils_ts_1.aInRange)("scalar", sc, _0n, N);
				const I = Point.ZERO;
				if (sc === _0n) return I;
				if (this.is0() || sc === _1n) return this;
				if (!endo || wnaf.hasPrecomputes(this)) return wnaf.wNAFCachedUnsafe(this, sc, Point.normalizeZ);
				/** See docs for {@link EndomorphismOpts} */
				let { k1neg, k1, k2neg, k2 } = endo.splitScalar(sc);
				let k1p = I;
				let k2p = I;
				let d = this;
				while (k1 > _0n || k2 > _0n) {
					if (k1 & _1n) k1p = k1p.add(d);
					if (k2 & _1n) k2p = k2p.add(d);
					d = d.double();
					k1 >>= _1n;
					k2 >>= _1n;
				}
				if (k1neg) k1p = k1p.negate();
				if (k2neg) k2p = k2p.negate();
				k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
				return k1p.add(k2p);
			}
			/**
			* Constant time multiplication.
			* Uses wNAF method. Windowed method may be 10% faster,
			* but takes 2x longer to generate and consumes 2x memory.
			* Uses precomputes when available.
			* Uses endomorphism for Koblitz curves.
			* @param scalar by which the point would be multiplied
			* @returns New point
			*/
			multiply(scalar) {
				const { endo, n: N } = CURVE;
				(0, utils_ts_1.aInRange)("scalar", scalar, _1n, N);
				let point, fake;
				/** See docs for {@link EndomorphismOpts} */
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = endo.splitScalar(scalar);
					let { p: k1p, f: f1p } = this.wNAF(k1);
					let { p: k2p, f: f2p } = this.wNAF(k2);
					k1p = wnaf.constTimeNegate(k1neg, k1p);
					k2p = wnaf.constTimeNegate(k2neg, k2p);
					k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
					point = k1p.add(k2p);
					fake = f1p.add(f2p);
				} else {
					const { p, f } = this.wNAF(scalar);
					point = p;
					fake = f;
				}
				return Point.normalizeZ([point, fake])[0];
			}
			/**
			* Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
			* Not using Strauss-Shamir trick: precomputation tables are faster.
			* The trick could be useful if both P and Q are not G (not in our case).
			* @returns non-zero affine point
			*/
			multiplyAndAddUnsafe(Q, a, b) {
				const G = Point.BASE;
				const mul = (P, a) => a === _0n || a === _1n || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a);
				const sum = mul(this, a).add(mul(Q, b));
				return sum.is0() ? void 0 : sum;
			}
			toAffine(iz) {
				return toAffineMemo(this, iz);
			}
			isTorsionFree() {
				const { h: cofactor, isTorsionFree } = CURVE;
				if (cofactor === _1n) return true;
				if (isTorsionFree) return isTorsionFree(Point, this);
				throw new Error("isTorsionFree() has not been declared for the elliptic curve");
			}
			clearCofactor() {
				const { h: cofactor, clearCofactor } = CURVE;
				if (cofactor === _1n) return this;
				if (clearCofactor) return clearCofactor(Point, this);
				return this.multiplyUnsafe(CURVE.h);
			}
			toRawBytes(isCompressed = true) {
				(0, utils_ts_1.abool)("isCompressed", isCompressed);
				this.assertValidity();
				return toBytes(Point, this, isCompressed);
			}
			toHex(isCompressed = true) {
				(0, utils_ts_1.abool)("isCompressed", isCompressed);
				return (0, utils_ts_1.bytesToHex)(this.toRawBytes(isCompressed));
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
		Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
		const { endo, nBitLength } = CURVE;
		const wnaf = (0, curve_ts_1.wNAF)(Point, endo ? Math.ceil(nBitLength / 2) : nBitLength);
		return {
			CURVE,
			ProjectivePoint: Point,
			normPrivateKeyToScalar,
			weierstrassEquation,
			isWithinCurveOrder
		};
	}
	function validateOpts(curve) {
		const opts = (0, curve_ts_1.validateBasic)(curve);
		(0, utils_ts_1.validateObject)(opts, {
			hash: "hash",
			hmac: "function",
			randomBytes: "function"
		}, {
			bits2int: "function",
			bits2int_modN: "function",
			lowS: "boolean"
		});
		return Object.freeze({
			lowS: true,
			...opts
		});
	}
	/**
	* Creates short weierstrass curve and ECDSA signature methods for it.
	* @example
	* import { Field } from '@noble/curves/abstract/modular';
	* // Before that, define BigInt-s: a, b, p, n, Gx, Gy
	* const curve = weierstrass({ a, b, Fp: Field(p), n, Gx, Gy, h: 1n })
	*/
	function weierstrass(curveDef) {
		const CURVE = validateOpts(curveDef);
		const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
		const compressedLen = Fp.BYTES + 1;
		const uncompressedLen = 2 * Fp.BYTES + 1;
		function modN(a) {
			return (0, modular_ts_1.mod)(a, CURVE_ORDER);
		}
		function invN(a) {
			return (0, modular_ts_1.invert)(a, CURVE_ORDER);
		}
		const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
			...CURVE,
			toBytes(_c, point, isCompressed) {
				const a = point.toAffine();
				const x = Fp.toBytes(a.x);
				const cat = utils_ts_1.concatBytes;
				(0, utils_ts_1.abool)("isCompressed", isCompressed);
				if (isCompressed) return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
				else return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
			},
			fromBytes(bytes) {
				const len = bytes.length;
				const head = bytes[0];
				const tail = bytes.subarray(1);
				if (len === compressedLen && (head === 2 || head === 3)) {
					const x = (0, utils_ts_1.bytesToNumberBE)(tail);
					if (!(0, utils_ts_1.inRange)(x, _1n, Fp.ORDER)) throw new Error("Point is not on curve");
					const y2 = weierstrassEquation(x);
					let y;
					try {
						y = Fp.sqrt(y2);
					} catch (sqrtError) {
						const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
						throw new Error("Point is not on curve" + suffix);
					}
					const isYOdd = (y & _1n) === _1n;
					if ((head & 1) === 1 !== isYOdd) y = Fp.neg(y);
					return {
						x,
						y
					};
				} else if (len === uncompressedLen && head === 4) return {
					x: Fp.fromBytes(tail.subarray(0, Fp.BYTES)),
					y: Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
				};
				else {
					const cl = compressedLen;
					const ul = uncompressedLen;
					throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
				}
			}
		});
		function isBiggerThanHalfOrder(number) {
			return number > CURVE_ORDER >> _1n;
		}
		function normalizeS(s) {
			return isBiggerThanHalfOrder(s) ? modN(-s) : s;
		}
		const slcNum = (b, from, to) => (0, utils_ts_1.bytesToNumberBE)(b.slice(from, to));
		/**
		* ECDSA signature with its (r, s) properties. Supports DER & compact representations.
		*/
		class Signature {
			constructor(r, s, recovery) {
				(0, utils_ts_1.aInRange)("r", r, _1n, CURVE_ORDER);
				(0, utils_ts_1.aInRange)("s", s, _1n, CURVE_ORDER);
				this.r = r;
				this.s = s;
				if (recovery != null) this.recovery = recovery;
				Object.freeze(this);
			}
			static fromCompact(hex) {
				const l = nByteLength;
				hex = (0, utils_ts_1.ensureBytes)("compactSignature", hex, l * 2);
				return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
			}
			static fromDER(hex) {
				const { r, s } = exports.DER.toSig((0, utils_ts_1.ensureBytes)("DER", hex));
				return new Signature(r, s);
			}
			/**
			* @todo remove
			* @deprecated
			*/
			assertValidity() {}
			addRecoveryBit(recovery) {
				return new Signature(this.r, this.s, recovery);
			}
			recoverPublicKey(msgHash) {
				const { r, s, recovery: rec } = this;
				const h = bits2int_modN((0, utils_ts_1.ensureBytes)("msgHash", msgHash));
				if (rec == null || ![
					0,
					1,
					2,
					3
				].includes(rec)) throw new Error("recovery id invalid");
				const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
				if (radj >= Fp.ORDER) throw new Error("recovery id 2 or 3 invalid");
				const prefix = (rec & 1) === 0 ? "02" : "03";
				const R = Point.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
				const ir = invN(radj);
				const u1 = modN(-h * ir);
				const u2 = modN(s * ir);
				const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
				if (!Q) throw new Error("point at infinify");
				Q.assertValidity();
				return Q;
			}
			hasHighS() {
				return isBiggerThanHalfOrder(this.s);
			}
			normalizeS() {
				return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
			}
			toDERRawBytes() {
				return (0, utils_ts_1.hexToBytes)(this.toDERHex());
			}
			toDERHex() {
				return exports.DER.hexFromSig(this);
			}
			toCompactRawBytes() {
				return (0, utils_ts_1.hexToBytes)(this.toCompactHex());
			}
			toCompactHex() {
				const l = nByteLength;
				return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
			}
		}
		const utils = {
			isValidPrivateKey(privateKey) {
				try {
					normPrivateKeyToScalar(privateKey);
					return true;
				} catch (error) {
					return false;
				}
			},
			normPrivateKeyToScalar,
			/**
			* Produces cryptographically secure private key from random of size
			* (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
			*/
			randomPrivateKey: () => {
				const length = (0, modular_ts_1.getMinHashLength)(CURVE.n);
				return (0, modular_ts_1.mapHashToField)(CURVE.randomBytes(length), CURVE.n);
			},
			/**
			* Creates precompute table for an arbitrary EC point. Makes point "cached".
			* Allows to massively speed-up `point.multiply(scalar)`.
			* @returns cached point
			* @example
			* const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
			* fast.multiply(privKey); // much faster ECDH now
			*/
			precompute(windowSize = 8, point = Point.BASE) {
				point._setWindowSize(windowSize);
				point.multiply(BigInt(3));
				return point;
			}
		};
		/**
		* Computes public key for a private key. Checks for validity of the private key.
		* @param privateKey private key
		* @param isCompressed whether to return compact (default), or full key
		* @returns Public key, full when isCompressed=false; short when isCompressed=true
		*/
		function getPublicKey(privateKey, isCompressed = true) {
			return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
		}
		/**
		* Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
		*/
		function isProbPub(item) {
			if (typeof item === "bigint") return false;
			if (item instanceof Point) return true;
			const len = (0, utils_ts_1.ensureBytes)("key", item).length;
			const fpl = Fp.BYTES;
			const compLen = fpl + 1;
			const uncompLen = 2 * fpl + 1;
			if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) return;
			else return len === compLen || len === uncompLen;
		}
		/**
		* ECDH (Elliptic Curve Diffie Hellman).
		* Computes shared public key from private key and public key.
		* Checks: 1) private key validity 2) shared key is on-curve.
		* Does NOT hash the result.
		* @param privateA private key
		* @param publicB different public key
		* @param isCompressed whether to return compact (default), or full key
		* @returns shared public key
		*/
		function getSharedSecret(privateA, publicB, isCompressed = true) {
			if (isProbPub(privateA) === true) throw new Error("first arg must be private key");
			if (isProbPub(publicB) === false) throw new Error("second arg must be public key");
			return Point.fromHex(publicB).multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
		}
		const bits2int = CURVE.bits2int || function(bytes) {
			if (bytes.length > 8192) throw new Error("input is too large");
			const num = (0, utils_ts_1.bytesToNumberBE)(bytes);
			const delta = bytes.length * 8 - nBitLength;
			return delta > 0 ? num >> BigInt(delta) : num;
		};
		const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
			return modN(bits2int(bytes));
		};
		const ORDER_MASK = (0, utils_ts_1.bitMask)(nBitLength);
		/**
		* Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
		*/
		function int2octets(num) {
			(0, utils_ts_1.aInRange)("num < 2^" + nBitLength, num, _0n, ORDER_MASK);
			return (0, utils_ts_1.numberToBytesBE)(num, nByteLength);
		}
		function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
			if (["recovered", "canonical"].some((k) => k in opts)) throw new Error("sign() legacy options not supported");
			const { hash, randomBytes } = CURVE;
			let { lowS, prehash, extraEntropy: ent } = opts;
			if (lowS == null) lowS = true;
			msgHash = (0, utils_ts_1.ensureBytes)("msgHash", msgHash);
			validateSigVerOpts(opts);
			if (prehash) msgHash = (0, utils_ts_1.ensureBytes)("prehashed msgHash", hash(msgHash));
			const h1int = bits2int_modN(msgHash);
			const d = normPrivateKeyToScalar(privateKey);
			const seedArgs = [int2octets(d), int2octets(h1int)];
			if (ent != null && ent !== false) {
				const e = ent === true ? randomBytes(Fp.BYTES) : ent;
				seedArgs.push((0, utils_ts_1.ensureBytes)("extraEntropy", e));
			}
			const seed = (0, utils_ts_1.concatBytes)(...seedArgs);
			const m = h1int;
			function k2sig(kBytes) {
				const k = bits2int(kBytes);
				if (!isWithinCurveOrder(k)) return;
				const ik = invN(k);
				const q = Point.BASE.multiply(k).toAffine();
				const r = modN(q.x);
				if (r === _0n) return;
				const s = modN(ik * modN(m + r * d));
				if (s === _0n) return;
				let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n);
				let normS = s;
				if (lowS && isBiggerThanHalfOrder(s)) {
					normS = normalizeS(s);
					recovery ^= 1;
				}
				return new Signature(r, normS, recovery);
			}
			return {
				seed,
				k2sig
			};
		}
		const defaultSigOpts = {
			lowS: CURVE.lowS,
			prehash: false
		};
		const defaultVerOpts = {
			lowS: CURVE.lowS,
			prehash: false
		};
		/**
		* Signs message hash with a private key.
		* ```
		* sign(m, d, k) where
		*   (x, y) = G × k
		*   r = x mod n
		*   s = (m + dr)/k mod n
		* ```
		* @param msgHash NOT message. msg needs to be hashed to `msgHash`, or use `prehash`.
		* @param privKey private key
		* @param opts lowS for non-malleable sigs. extraEntropy for mixing randomness into k. prehash will hash first arg.
		* @returns signature with recovery param
		*/
		function sign(msgHash, privKey, opts = defaultSigOpts) {
			const { seed, k2sig } = prepSig(msgHash, privKey, opts);
			const C = CURVE;
			return (0, utils_ts_1.createHmacDrbg)(C.hash.outputLen, C.nByteLength, C.hmac)(seed, k2sig);
		}
		Point.BASE._setWindowSize(8);
		/**
		* Verifies a signature against message hash and public key.
		* Rejects lowS signatures by default: to override,
		* specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
		*
		* ```
		* verify(r, s, h, P) where
		*   U1 = hs^-1 mod n
		*   U2 = rs^-1 mod n
		*   R = U1⋅G - U2⋅P
		*   mod(R.x, n) == r
		* ```
		*/
		function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
			const sg = signature;
			msgHash = (0, utils_ts_1.ensureBytes)("msgHash", msgHash);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey);
			const { lowS, prehash, format } = opts;
			validateSigVerOpts(opts);
			if ("strict" in opts) throw new Error("options.strict was renamed to lowS");
			if (format !== void 0 && format !== "compact" && format !== "der") throw new Error("format must be compact or der");
			const isHex = typeof sg === "string" || (0, utils_ts_1.isBytes)(sg);
			const isObj = !isHex && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
			if (!isHex && !isObj) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
			let _sig = void 0;
			let P;
			try {
				if (isObj) _sig = new Signature(sg.r, sg.s);
				if (isHex) {
					try {
						if (format !== "compact") _sig = Signature.fromDER(sg);
					} catch (derError) {
						if (!(derError instanceof exports.DER.Err)) throw derError;
					}
					if (!_sig && format !== "der") _sig = Signature.fromCompact(sg);
				}
				P = Point.fromHex(publicKey);
			} catch (error) {
				return false;
			}
			if (!_sig) return false;
			if (lowS && _sig.hasHighS()) return false;
			if (prehash) msgHash = CURVE.hash(msgHash);
			const { r, s } = _sig;
			const h = bits2int_modN(msgHash);
			const is = invN(s);
			const u1 = modN(h * is);
			const u2 = modN(r * is);
			const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
			if (!R) return false;
			return modN(R.x) === r;
		}
		return {
			CURVE,
			getPublicKey,
			getSharedSecret,
			sign,
			verify,
			ProjectivePoint: Point,
			Signature,
			utils
		};
	}
	/**
	* Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
	* TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
	* b = True and y = sqrt(u / v) if (u / v) is square in F, and
	* b = False and y = sqrt(Z * (u / v)) otherwise.
	* @param Fp
	* @param Z
	* @returns
	*/
	function SWUFpSqrtRatio(Fp, Z) {
		const q = Fp.ORDER;
		let l = _0n;
		for (let o = q - _1n; o % _2n === _0n; o /= _2n) l += _1n;
		const c1 = l;
		const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;
		const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
		const c2 = (q - _1n) / _2n_pow_c1;
		const c3 = (c2 - _1n) / _2n;
		const c4 = _2n_pow_c1 - _1n;
		const c5 = _2n_pow_c1_1;
		const c6 = Fp.pow(Z, c2);
		const c7 = Fp.pow(Z, (c2 + _1n) / _2n);
		let sqrtRatio = (u, v) => {
			let tv1 = c6;
			let tv2 = Fp.pow(v, c4);
			let tv3 = Fp.sqr(tv2);
			tv3 = Fp.mul(tv3, v);
			let tv5 = Fp.mul(u, tv3);
			tv5 = Fp.pow(tv5, c3);
			tv5 = Fp.mul(tv5, tv2);
			tv2 = Fp.mul(tv5, v);
			tv3 = Fp.mul(tv5, u);
			let tv4 = Fp.mul(tv3, tv2);
			tv5 = Fp.pow(tv4, c5);
			let isQR = Fp.eql(tv5, Fp.ONE);
			tv2 = Fp.mul(tv3, c7);
			tv5 = Fp.mul(tv4, tv1);
			tv3 = Fp.cmov(tv2, tv3, isQR);
			tv4 = Fp.cmov(tv5, tv4, isQR);
			for (let i = c1; i > _1n; i--) {
				let tv5 = i - _2n;
				tv5 = _2n << tv5 - _1n;
				let tvv5 = Fp.pow(tv4, tv5);
				const e1 = Fp.eql(tvv5, Fp.ONE);
				tv2 = Fp.mul(tv3, tv1);
				tv1 = Fp.mul(tv1, tv1);
				tvv5 = Fp.mul(tv4, tv1);
				tv3 = Fp.cmov(tv2, tv3, e1);
				tv4 = Fp.cmov(tvv5, tv4, e1);
			}
			return {
				isValid: isQR,
				value: tv3
			};
		};
		if (Fp.ORDER % _4n === _3n) {
			const c1 = (Fp.ORDER - _3n) / _4n;
			const c2 = Fp.sqrt(Fp.neg(Z));
			sqrtRatio = (u, v) => {
				let tv1 = Fp.sqr(v);
				const tv2 = Fp.mul(u, v);
				tv1 = Fp.mul(tv1, tv2);
				let y1 = Fp.pow(tv1, c1);
				y1 = Fp.mul(y1, tv2);
				const y2 = Fp.mul(y1, c2);
				const tv3 = Fp.mul(Fp.sqr(y1), v);
				const isQR = Fp.eql(tv3, u);
				return {
					isValid: isQR,
					value: Fp.cmov(y2, y1, isQR)
				};
			};
		}
		return sqrtRatio;
	}
	/**
	* Simplified Shallue-van de Woestijne-Ulas Method
	* https://www.rfc-editor.org/rfc/rfc9380#section-6.6.2
	*/
	function mapToCurveSimpleSWU(Fp, opts) {
		(0, modular_ts_1.validateField)(Fp);
		if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z)) throw new Error("mapToCurveSimpleSWU: invalid opts");
		const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
		if (!Fp.isOdd) throw new Error("Fp.isOdd is not implemented!");
		return (u) => {
			let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
			tv1 = Fp.sqr(u);
			tv1 = Fp.mul(tv1, opts.Z);
			tv2 = Fp.sqr(tv1);
			tv2 = Fp.add(tv2, tv1);
			tv3 = Fp.add(tv2, Fp.ONE);
			tv3 = Fp.mul(tv3, opts.B);
			tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
			tv4 = Fp.mul(tv4, opts.A);
			tv2 = Fp.sqr(tv3);
			tv6 = Fp.sqr(tv4);
			tv5 = Fp.mul(tv6, opts.A);
			tv2 = Fp.add(tv2, tv5);
			tv2 = Fp.mul(tv2, tv3);
			tv6 = Fp.mul(tv6, tv4);
			tv5 = Fp.mul(tv6, opts.B);
			tv2 = Fp.add(tv2, tv5);
			x = Fp.mul(tv1, tv3);
			const { isValid, value } = sqrtRatio(tv2, tv6);
			y = Fp.mul(tv1, u);
			y = Fp.mul(y, value);
			x = Fp.cmov(x, tv3, isValid);
			y = Fp.cmov(y, value, isValid);
			const e1 = Fp.isOdd(u) === Fp.isOdd(y);
			y = Fp.cmov(Fp.neg(y), y, e1);
			const tv4_inv = (0, modular_ts_1.FpInvertBatch)(Fp, [tv4], true)[0];
			x = Fp.mul(x, tv4_inv);
			return {
				x,
				y
			};
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/_shortw_utils.js
var require__shortw_utils$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getHash = getHash;
	exports.createCurve = createCurve;
	/**
	* Utilities for short weierstrass curves, combined with noble-hashes.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var hmac_1 = require_hmac$2();
	var utils_1 = require_utils$4();
	var weierstrass_ts_1 = require_weierstrass$2();
	/** connects noble-curves to noble-hashes */
	function getHash(hash) {
		return {
			hash,
			hmac: (key, ...msgs) => (0, hmac_1.hmac)(hash, key, (0, utils_1.concatBytes)(...msgs)),
			randomBytes: utils_1.randomBytes
		};
	}
	function createCurve(curveDef, defHash) {
		const create = (hash) => (0, weierstrass_ts_1.weierstrass)({
			...curveDef,
			...getHash(hash)
		});
		return {
			...create(defHash),
			create
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/hash-to-curve.js
var require_hash_to_curve$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.expand_message_xmd = expand_message_xmd;
	exports.expand_message_xof = expand_message_xof;
	exports.hash_to_field = hash_to_field;
	exports.isogenyMap = isogenyMap;
	exports.createHasher = createHasher;
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var os2ip = utils_ts_1.bytesToNumberBE;
	function i2osp(value, length) {
		anum(value);
		anum(length);
		if (value < 0 || value >= 1 << 8 * length) throw new Error("invalid I2OSP input: " + value);
		const res = Array.from({ length }).fill(0);
		for (let i = length - 1; i >= 0; i--) {
			res[i] = value & 255;
			value >>>= 8;
		}
		return new Uint8Array(res);
	}
	function strxor(a, b) {
		const arr = new Uint8Array(a.length);
		for (let i = 0; i < a.length; i++) arr[i] = a[i] ^ b[i];
		return arr;
	}
	function anum(item) {
		if (!Number.isSafeInteger(item)) throw new Error("number expected");
	}
	/**
	* Produces a uniformly random byte string using a cryptographic hash function H that outputs b bits.
	* [RFC 9380 5.3.1](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.1).
	*/
	function expand_message_xmd(msg, DST, lenInBytes, H) {
		(0, utils_ts_1.abytes)(msg);
		(0, utils_ts_1.abytes)(DST);
		anum(lenInBytes);
		if (DST.length > 255) DST = H((0, utils_ts_1.concatBytes)((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-"), DST));
		const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
		const ell = Math.ceil(lenInBytes / b_in_bytes);
		if (lenInBytes > 65535 || ell > 255) throw new Error("expand_message_xmd: invalid lenInBytes");
		const DST_prime = (0, utils_ts_1.concatBytes)(DST, i2osp(DST.length, 1));
		const Z_pad = i2osp(0, r_in_bytes);
		const l_i_b_str = i2osp(lenInBytes, 2);
		const b = new Array(ell);
		const b_0 = H((0, utils_ts_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
		b[0] = H((0, utils_ts_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
		for (let i = 1; i <= ell; i++) {
			const args = [
				strxor(b_0, b[i - 1]),
				i2osp(i + 1, 1),
				DST_prime
			];
			b[i] = H((0, utils_ts_1.concatBytes)(...args));
		}
		return (0, utils_ts_1.concatBytes)(...b).slice(0, lenInBytes);
	}
	/**
	* Produces a uniformly random byte string using an extendable-output function (XOF) H.
	* 1. The collision resistance of H MUST be at least k bits.
	* 2. H MUST be an XOF that has been proved indifferentiable from
	*    a random oracle under a reasonable cryptographic assumption.
	* [RFC 9380 5.3.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.2).
	*/
	function expand_message_xof(msg, DST, lenInBytes, k, H) {
		(0, utils_ts_1.abytes)(msg);
		(0, utils_ts_1.abytes)(DST);
		anum(lenInBytes);
		if (DST.length > 255) {
			const dkLen = Math.ceil(2 * k / 8);
			DST = H.create({ dkLen }).update((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-")).update(DST).digest();
		}
		if (lenInBytes > 65535 || DST.length > 255) throw new Error("expand_message_xof: invalid lenInBytes");
		return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
	}
	/**
	* Hashes arbitrary-length byte strings to a list of one or more elements of a finite field F.
	* [RFC 9380 5.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.2).
	* @param msg a byte string containing the message to hash
	* @param count the number of elements of F to output
	* @param options `{DST: string, p: bigint, m: number, k: number, expand: 'xmd' | 'xof', hash: H}`, see above
	* @returns [u_0, ..., u_(count - 1)], a list of field elements.
	*/
	function hash_to_field(msg, count, options) {
		(0, utils_ts_1.validateObject)(options, {
			DST: "stringOrUint8Array",
			p: "bigint",
			m: "isSafeInteger",
			k: "isSafeInteger",
			hash: "hash"
		});
		const { p, k, m, hash, expand, DST: _DST } = options;
		(0, utils_ts_1.abytes)(msg);
		anum(count);
		const DST = typeof _DST === "string" ? (0, utils_ts_1.utf8ToBytes)(_DST) : _DST;
		const log2p = p.toString(2).length;
		const L = Math.ceil((log2p + k) / 8);
		const len_in_bytes = count * m * L;
		let prb;
		if (expand === "xmd") prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
		else if (expand === "xof") prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
		else if (expand === "_internal_pass") prb = msg;
		else throw new Error("expand must be \"xmd\" or \"xof\"");
		const u = new Array(count);
		for (let i = 0; i < count; i++) {
			const e = new Array(m);
			for (let j = 0; j < m; j++) {
				const elm_offset = L * (j + i * m);
				const tv = prb.subarray(elm_offset, elm_offset + L);
				e[j] = (0, modular_ts_1.mod)(os2ip(tv), p);
			}
			u[i] = e;
		}
		return u;
	}
	function isogenyMap(field, map) {
		const coeff = map.map((i) => Array.from(i).reverse());
		return (x, y) => {
			const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
			const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(field, [xd, yd], true);
			x = field.mul(xn, xd_inv);
			y = field.mul(y, field.mul(yn, yd_inv));
			return {
				x,
				y
			};
		};
	}
	/** Creates hash-to-curve methods from EC Point and mapToCurve function. */
	function createHasher(Point, mapToCurve, defaults) {
		if (typeof mapToCurve !== "function") throw new Error("mapToCurve() must be defined");
		function map(num) {
			return Point.fromAffine(mapToCurve(num));
		}
		function clear(initial) {
			const P = initial.clearCofactor();
			if (P.equals(Point.ZERO)) return Point.ZERO;
			P.assertValidity();
			return P;
		}
		return {
			defaults,
			hashToCurve(msg, options) {
				const u = hash_to_field(msg, 2, {
					...defaults,
					DST: defaults.DST,
					...options
				});
				const u0 = map(u[0]);
				const u1 = map(u[1]);
				return clear(u0.add(u1));
			},
			encodeToCurve(msg, options) {
				return clear(map(hash_to_field(msg, 1, {
					...defaults,
					DST: defaults.encodeDST,
					...options
				})[0]));
			},
			mapToCurve(scalars) {
				if (!Array.isArray(scalars)) throw new Error("expected array of bigints");
				for (const i of scalars) if (typeof i !== "bigint") throw new Error("expected array of bigints");
				return clear(map(scalars));
			}
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/secp256k1.js
var require_secp256k1$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeToCurve = exports.hashToCurve = exports.secp256k1_hasher = exports.schnorr = exports.secp256k1 = void 0;
	/**
	* NIST secp256k1. See [pdf](https://www.secg.org/sec2-v2.pdf).
	*
	* Seems to be rigid (not backdoored)
	* [as per discussion](https://bitcointalk.org/index.php?topic=289795.msg3183975#msg3183975).
	*
	* secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
	* Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
	* For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
	* [See explanation](https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066).
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_1 = require_sha2$2();
	var utils_1 = require_utils$4();
	var _shortw_utils_ts_1 = require__shortw_utils$2();
	var hash_to_curve_ts_1 = require_hash_to_curve$2();
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var weierstrass_ts_1 = require_weierstrass$2();
	var secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
	var secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var divNearest = (a, b) => (a + b / _2n) / b;
	/**
	* √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
	* (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
	*/
	function sqrtMod(y) {
		const P = secp256k1P;
		const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
		const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
		const b2 = y * y * y % P;
		const b3 = b2 * b2 * y % P;
		const b6 = (0, modular_ts_1.pow2)(b3, _3n, P) * b3 % P;
		const b9 = (0, modular_ts_1.pow2)(b6, _3n, P) * b3 % P;
		const b11 = (0, modular_ts_1.pow2)(b9, _2n, P) * b2 % P;
		const b22 = (0, modular_ts_1.pow2)(b11, _11n, P) * b11 % P;
		const b44 = (0, modular_ts_1.pow2)(b22, _22n, P) * b22 % P;
		const b88 = (0, modular_ts_1.pow2)(b44, _44n, P) * b44 % P;
		const b176 = (0, modular_ts_1.pow2)(b88, _88n, P) * b88 % P;
		const b220 = (0, modular_ts_1.pow2)(b176, _44n, P) * b44 % P;
		const b223 = (0, modular_ts_1.pow2)(b220, _3n, P) * b3 % P;
		const t1 = (0, modular_ts_1.pow2)(b223, _23n, P) * b22 % P;
		const t2 = (0, modular_ts_1.pow2)(t1, _6n, P) * b2 % P;
		const root = (0, modular_ts_1.pow2)(t2, _2n, P);
		if (!Fpk1.eql(Fpk1.sqr(root), y)) throw new Error("Cannot find square root");
		return root;
	}
	var Fpk1 = (0, modular_ts_1.Field)(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
	/**
	* secp256k1 curve, ECDSA and ECDH methods.
	*
	* Field: `2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n`
	*
	* @example
	* ```js
	* import { secp256k1 } from '@noble/curves/secp256k1';
	* const priv = secp256k1.utils.randomPrivateKey();
	* const pub = secp256k1.getPublicKey(priv);
	* const msg = new Uint8Array(32).fill(1); // message hash (not message) in ecdsa
	* const sig = secp256k1.sign(msg, priv); // `{prehash: true}` option is available
	* const isValid = secp256k1.verify(sig, msg, pub) === true;
	* ```
	*/
	exports.secp256k1 = (0, _shortw_utils_ts_1.createCurve)({
		a: _0n,
		b: BigInt(7),
		Fp: Fpk1,
		n: secp256k1N,
		Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
		Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
		h: BigInt(1),
		lowS: true,
		endo: {
			beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
			splitScalar: (k) => {
				const n = secp256k1N;
				const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
				const b1 = -_1n * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
				const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
				const b2 = a1;
				const POW_2_128 = BigInt("0x100000000000000000000000000000000");
				const c1 = divNearest(b2 * k, n);
				const c2 = divNearest(-b1 * k, n);
				let k1 = (0, modular_ts_1.mod)(k - c1 * a1 - c2 * a2, n);
				let k2 = (0, modular_ts_1.mod)(-c1 * b1 - c2 * b2, n);
				const k1neg = k1 > POW_2_128;
				const k2neg = k2 > POW_2_128;
				if (k1neg) k1 = n - k1;
				if (k2neg) k2 = n - k2;
				if (k1 > POW_2_128 || k2 > POW_2_128) throw new Error("splitScalar: Endomorphism failed, k=" + k);
				return {
					k1neg,
					k1,
					k2neg,
					k2
				};
			}
		}
	}, sha2_1.sha256);
	/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
	var TAGGED_HASH_PREFIXES = {};
	function taggedHash(tag, ...messages) {
		let tagP = TAGGED_HASH_PREFIXES[tag];
		if (tagP === void 0) {
			const tagH = (0, sha2_1.sha256)(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
			tagP = (0, utils_ts_1.concatBytes)(tagH, tagH);
			TAGGED_HASH_PREFIXES[tag] = tagP;
		}
		return (0, sha2_1.sha256)((0, utils_ts_1.concatBytes)(tagP, ...messages));
	}
	var pointToBytes = (point) => point.toRawBytes(true).slice(1);
	var numTo32b = (n) => (0, utils_ts_1.numberToBytesBE)(n, 32);
	var modP = (x) => (0, modular_ts_1.mod)(x, secp256k1P);
	var modN = (x) => (0, modular_ts_1.mod)(x, secp256k1N);
	var Point = /* @__PURE__ */ (() => exports.secp256k1.ProjectivePoint)();
	var GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
	function schnorrGetExtPubKey(priv) {
		let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv);
		let p = Point.fromPrivateKey(d_);
		return {
			scalar: p.hasEvenY() ? d_ : modN(-d_),
			bytes: pointToBytes(p)
		};
	}
	/**
	* lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
	* @returns valid point checked for being on-curve
	*/
	function lift_x(x) {
		(0, utils_ts_1.aInRange)("x", x, _1n, secp256k1P);
		let y = sqrtMod(modP(modP(x * x) * x + BigInt(7)));
		if (y % _2n !== _0n) y = modP(-y);
		const p = new Point(x, y, _1n);
		p.assertValidity();
		return p;
	}
	var num = utils_ts_1.bytesToNumberBE;
	/**
	* Create tagged hash, convert it to bigint, reduce modulo-n.
	*/
	function challenge(...args) {
		return modN(num(taggedHash("BIP0340/challenge", ...args)));
	}
	/**
	* Schnorr public key is just `x` coordinate of Point as per BIP340.
	*/
	function schnorrGetPublicKey(privateKey) {
		return schnorrGetExtPubKey(privateKey).bytes;
	}
	/**
	* Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
	* auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
	*/
	function schnorrSign(message, privateKey, auxRand = (0, utils_1.randomBytes)(32)) {
		const m = (0, utils_ts_1.ensureBytes)("message", message);
		const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
		const k_ = modN(num(taggedHash("BIP0340/nonce", numTo32b(d ^ num(taggedHash("BIP0340/aux", (0, utils_ts_1.ensureBytes)("auxRand", auxRand, 32)))), px, m)));
		if (k_ === _0n) throw new Error("sign failed: k is zero");
		const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
		const e = challenge(rx, px, m);
		const sig = /* @__PURE__ */ new Uint8Array(64);
		sig.set(rx, 0);
		sig.set(numTo32b(modN(k + e * d)), 32);
		if (!schnorrVerify(sig, m, px)) throw new Error("sign: Invalid signature produced");
		return sig;
	}
	/**
	* Verifies Schnorr signature.
	* Will swallow errors & return false except for initial type validation of arguments.
	*/
	function schnorrVerify(signature, message, publicKey) {
		const sig = (0, utils_ts_1.ensureBytes)("signature", signature, 64);
		const m = (0, utils_ts_1.ensureBytes)("message", message);
		const pub = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, 32);
		try {
			const P = lift_x(num(pub));
			const r = num(sig.subarray(0, 32));
			if (!(0, utils_ts_1.inRange)(r, _1n, secp256k1P)) return false;
			const s = num(sig.subarray(32, 64));
			if (!(0, utils_ts_1.inRange)(s, _1n, secp256k1N)) return false;
			const R = GmulAdd(P, s, modN(-challenge(numTo32b(r), pointToBytes(P), m)));
			if (!R || !R.hasEvenY() || R.toAffine().x !== r) return false;
			return true;
		} catch (error) {
			return false;
		}
	}
	/**
	* Schnorr signatures over secp256k1.
	* https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
	* @example
	* ```js
	* import { schnorr } from '@noble/curves/secp256k1';
	* const priv = schnorr.utils.randomPrivateKey();
	* const pub = schnorr.getPublicKey(priv);
	* const msg = new TextEncoder().encode('hello');
	* const sig = schnorr.sign(msg, priv);
	* const isValid = schnorr.verify(sig, msg, pub);
	* ```
	*/
	exports.schnorr = (() => ({
		getPublicKey: schnorrGetPublicKey,
		sign: schnorrSign,
		verify: schnorrVerify,
		utils: {
			randomPrivateKey: exports.secp256k1.utils.randomPrivateKey,
			lift_x,
			pointToBytes,
			numberToBytesBE: utils_ts_1.numberToBytesBE,
			bytesToNumberBE: utils_ts_1.bytesToNumberBE,
			taggedHash,
			mod: modular_ts_1.mod
		}
	}))();
	var isoMap = /* @__PURE__ */ (() => (0, hash_to_curve_ts_1.isogenyMap)(Fpk1, [
		[
			"0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
			"0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
			"0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
			"0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
		],
		[
			"0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
			"0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
			"0x0000000000000000000000000000000000000000000000000000000000000001"
		],
		[
			"0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
			"0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
			"0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
			"0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
		],
		[
			"0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
			"0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
			"0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
			"0x0000000000000000000000000000000000000000000000000000000000000001"
		]
	].map((i) => i.map((j) => BigInt(j)))))();
	var mapSWU = /* @__PURE__ */ (() => (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fpk1, {
		A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
		B: BigInt("1771"),
		Z: Fpk1.create(BigInt("-11"))
	}))();
	/** Hashing / encoding to secp256k1 points / field. RFC 9380 methods. */
	exports.secp256k1_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.secp256k1.ProjectivePoint, (scalars) => {
		const { x, y } = mapSWU(Fpk1.create(scalars[0]));
		return isoMap(x, y);
	}, {
		DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
		encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
		p: Fpk1.ORDER,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_1.sha256
	}))();
	exports.hashToCurve = (() => exports.secp256k1_hasher.hashToCurve)();
	exports.encodeToCurve = (() => exports.secp256k1_hasher.encodeToCurve)();
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/bls.js
var require_bls = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bls = bls;
	/**
	* BLS (Barreto-Lynn-Scott) family of pairing-friendly curves.
	* BLS != BLS.
	* The file implements BLS (Boneh-Lynn-Shacham) signatures.
	* Used in both BLS (Barreto-Lynn-Scott) and BN (Barreto-Naehrig)
	* families of pairing-friendly curves.
	* Consists of two curves: G1 and G2:
	* - G1 is a subgroup of (x, y) E(Fq) over y² = x³ + 4.
	* - G2 is a subgroup of ((x₁, x₂+i), (y₁, y₂+i)) E(Fq²) over y² = x³ + 4(1 + i) where i is √-1
	* - Gt, created by bilinear (ate) pairing e(G1, G2), consists of p-th roots of unity in
	*   Fq^k where k is embedding degree. Only degree 12 is currently supported, 24 is not.
	* Pairing is used to aggregate and verify signatures.
	* There are two main ways to use it:
	* 1. Fp for short private keys, Fp₂ for signatures
	* 2. Fp for short signatures, Fp₂ for private keys
	* @module
	**/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var hash_to_curve_ts_1 = require_hash_to_curve$2();
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var weierstrass_ts_1 = require_weierstrass$2();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	function NAfDecomposition(a) {
		const res = [];
		for (; a > _1n; a >>= _1n) if ((a & _1n) === _0n) res.unshift(0);
		else if ((a & _3n) === _3n) {
			res.unshift(-1);
			a += _1n;
		} else res.unshift(1);
		return res;
	}
	function bls(CURVE) {
		const { Fp, Fr, Fp2, Fp6, Fp12 } = CURVE.fields;
		const BLS_X_IS_NEGATIVE = CURVE.params.xNegative;
		const TWIST = CURVE.params.twistType;
		const G1_ = (0, weierstrass_ts_1.weierstrassPoints)({
			n: Fr.ORDER,
			...CURVE.G1
		});
		const G1 = Object.assign(G1_, (0, hash_to_curve_ts_1.createHasher)(G1_.ProjectivePoint, CURVE.G1.mapToCurve, {
			...CURVE.htfDefaults,
			...CURVE.G1.htfDefaults
		}));
		const G2_ = (0, weierstrass_ts_1.weierstrassPoints)({
			n: Fr.ORDER,
			...CURVE.G2
		});
		const G2 = Object.assign(G2_, (0, hash_to_curve_ts_1.createHasher)(G2_.ProjectivePoint, CURVE.G2.mapToCurve, {
			...CURVE.htfDefaults,
			...CURVE.G2.htfDefaults
		}));
		let lineFunction;
		if (TWIST === "multiplicative") lineFunction = (c0, c1, c2, f, Px, Py) => Fp12.mul014(f, c0, Fp2.mul(c1, Px), Fp2.mul(c2, Py));
		else if (TWIST === "divisive") lineFunction = (c0, c1, c2, f, Px, Py) => Fp12.mul034(f, Fp2.mul(c2, Py), Fp2.mul(c1, Px), c0);
		else throw new Error("bls: unknown twist type");
		const Fp2div2 = Fp2.div(Fp2.ONE, Fp2.mul(Fp2.ONE, _2n));
		function pointDouble(ell, Rx, Ry, Rz) {
			const t0 = Fp2.sqr(Ry);
			const t1 = Fp2.sqr(Rz);
			const t2 = Fp2.mulByB(Fp2.mul(t1, _3n));
			const t3 = Fp2.mul(t2, _3n);
			const t4 = Fp2.sub(Fp2.sub(Fp2.sqr(Fp2.add(Ry, Rz)), t1), t0);
			const c0 = Fp2.sub(t2, t0);
			const c1 = Fp2.mul(Fp2.sqr(Rx), _3n);
			const c2 = Fp2.neg(t4);
			ell.push([
				c0,
				c1,
				c2
			]);
			Rx = Fp2.mul(Fp2.mul(Fp2.mul(Fp2.sub(t0, t3), Rx), Ry), Fp2div2);
			Ry = Fp2.sub(Fp2.sqr(Fp2.mul(Fp2.add(t0, t3), Fp2div2)), Fp2.mul(Fp2.sqr(t2), _3n));
			Rz = Fp2.mul(t0, t4);
			return {
				Rx,
				Ry,
				Rz
			};
		}
		function pointAdd(ell, Rx, Ry, Rz, Qx, Qy) {
			const t0 = Fp2.sub(Ry, Fp2.mul(Qy, Rz));
			const t1 = Fp2.sub(Rx, Fp2.mul(Qx, Rz));
			const c0 = Fp2.sub(Fp2.mul(t0, Qx), Fp2.mul(t1, Qy));
			const c1 = Fp2.neg(t0);
			const c2 = t1;
			ell.push([
				c0,
				c1,
				c2
			]);
			const t2 = Fp2.sqr(t1);
			const t3 = Fp2.mul(t2, t1);
			const t4 = Fp2.mul(t2, Rx);
			const t5 = Fp2.add(Fp2.sub(t3, Fp2.mul(t4, _2n)), Fp2.mul(Fp2.sqr(t0), Rz));
			Rx = Fp2.mul(t1, t5);
			Ry = Fp2.sub(Fp2.mul(Fp2.sub(t4, t5), t0), Fp2.mul(t3, Ry));
			Rz = Fp2.mul(Rz, t3);
			return {
				Rx,
				Ry,
				Rz
			};
		}
		const ATE_NAF = NAfDecomposition(CURVE.params.ateLoopSize);
		const calcPairingPrecomputes = (0, utils_ts_1.memoized)((point) => {
			const { x, y } = point.toAffine();
			const Qx = x, Qy = y, negQy = Fp2.neg(y);
			let Rx = Qx, Ry = Qy, Rz = Fp2.ONE;
			const ell = [];
			for (const bit of ATE_NAF) {
				const cur = [];
				({Rx, Ry, Rz} = pointDouble(cur, Rx, Ry, Rz));
				if (bit) ({Rx, Ry, Rz} = pointAdd(cur, Rx, Ry, Rz, Qx, bit === -1 ? negQy : Qy));
				ell.push(cur);
			}
			if (CURVE.postPrecompute) {
				const last = ell[ell.length - 1];
				CURVE.postPrecompute(Rx, Ry, Rz, Qx, Qy, pointAdd.bind(null, last));
			}
			return ell;
		});
		function millerLoopBatch(pairs, withFinalExponent = false) {
			let f12 = Fp12.ONE;
			if (pairs.length) {
				const ellLen = pairs[0][0].length;
				for (let i = 0; i < ellLen; i++) {
					f12 = Fp12.sqr(f12);
					for (const [ell, Px, Py] of pairs) for (const [c0, c1, c2] of ell[i]) f12 = lineFunction(c0, c1, c2, f12, Px, Py);
				}
			}
			if (BLS_X_IS_NEGATIVE) f12 = Fp12.conjugate(f12);
			return withFinalExponent ? Fp12.finalExponentiate(f12) : f12;
		}
		function pairingBatch(pairs, withFinalExponent = true) {
			const res = [];
			G1.ProjectivePoint.normalizeZ(pairs.map(({ g1 }) => g1));
			G2.ProjectivePoint.normalizeZ(pairs.map(({ g2 }) => g2));
			for (const { g1, g2 } of pairs) {
				if (g1.equals(G1.ProjectivePoint.ZERO) || g2.equals(G2.ProjectivePoint.ZERO)) throw new Error("pairing is not available for ZERO point");
				g1.assertValidity();
				g2.assertValidity();
				const Qa = g1.toAffine();
				res.push([
					calcPairingPrecomputes(g2),
					Qa.x,
					Qa.y
				]);
			}
			return millerLoopBatch(res, withFinalExponent);
		}
		function pairing(Q, P, withFinalExponent = true) {
			return pairingBatch([{
				g1: Q,
				g2: P
			}], withFinalExponent);
		}
		const utils = {
			randomPrivateKey: () => {
				const length = (0, modular_ts_1.getMinHashLength)(Fr.ORDER);
				return (0, modular_ts_1.mapHashToField)(CURVE.randomBytes(length), Fr.ORDER);
			},
			calcPairingPrecomputes
		};
		const { ShortSignature } = CURVE.G1;
		const { Signature } = CURVE.G2;
		function normP1(point) {
			return point instanceof G1.ProjectivePoint ? point : G1.ProjectivePoint.fromHex(point);
		}
		function normP1Hash(point, htfOpts) {
			return point instanceof G1.ProjectivePoint ? point : G1.hashToCurve((0, utils_ts_1.ensureBytes)("point", point), htfOpts);
		}
		function normP2(point) {
			return point instanceof G2.ProjectivePoint ? point : Signature.fromHex(point);
		}
		function normP2Hash(point, htfOpts) {
			return point instanceof G2.ProjectivePoint ? point : G2.hashToCurve((0, utils_ts_1.ensureBytes)("point", point), htfOpts);
		}
		function getPublicKey(privateKey) {
			return G1.ProjectivePoint.fromPrivateKey(privateKey).toRawBytes(true);
		}
		function getPublicKeyForShortSignatures(privateKey) {
			return G2.ProjectivePoint.fromPrivateKey(privateKey).toRawBytes(true);
		}
		function sign(message, privateKey, htfOpts) {
			const msgPoint = normP2Hash(message, htfOpts);
			msgPoint.assertValidity();
			const sigPoint = msgPoint.multiply(G1.normPrivateKeyToScalar(privateKey));
			if (message instanceof G2.ProjectivePoint) return sigPoint;
			return Signature.toRawBytes(sigPoint);
		}
		function signShortSignature(message, privateKey, htfOpts) {
			const msgPoint = normP1Hash(message, htfOpts);
			msgPoint.assertValidity();
			const sigPoint = msgPoint.multiply(G1.normPrivateKeyToScalar(privateKey));
			if (message instanceof G1.ProjectivePoint) return sigPoint;
			return ShortSignature.toRawBytes(sigPoint);
		}
		function verify(signature, message, publicKey, htfOpts) {
			const P = normP1(publicKey);
			const Hm = normP2Hash(message, htfOpts);
			const G = G1.ProjectivePoint.BASE;
			const S = normP2(signature);
			const exp = pairingBatch([{
				g1: P.negate(),
				g2: Hm
			}, {
				g1: G,
				g2: S
			}]);
			return Fp12.eql(exp, Fp12.ONE);
		}
		function verifyShortSignature(signature, message, publicKey, htfOpts) {
			const P = normP2(publicKey);
			const Hm = normP1Hash(message, htfOpts);
			const G = G2.ProjectivePoint.BASE;
			const S = normP1(signature);
			const exp = pairingBatch([{
				g1: Hm,
				g2: P
			}, {
				g1: S,
				g2: G.negate()
			}]);
			return Fp12.eql(exp, Fp12.ONE);
		}
		function aNonEmpty(arr) {
			if (!Array.isArray(arr) || arr.length === 0) throw new Error("expected non-empty array");
		}
		function aggregatePublicKeys(publicKeys) {
			aNonEmpty(publicKeys);
			const aggAffine = publicKeys.map(normP1).reduce((sum, p) => sum.add(p), G1.ProjectivePoint.ZERO);
			if (publicKeys[0] instanceof G1.ProjectivePoint) {
				aggAffine.assertValidity();
				return aggAffine;
			}
			return aggAffine.toRawBytes(true);
		}
		function aggregateSignatures(signatures) {
			aNonEmpty(signatures);
			const aggAffine = signatures.map(normP2).reduce((sum, s) => sum.add(s), G2.ProjectivePoint.ZERO);
			if (signatures[0] instanceof G2.ProjectivePoint) {
				aggAffine.assertValidity();
				return aggAffine;
			}
			return Signature.toRawBytes(aggAffine);
		}
		function aggregateShortSignatures(signatures) {
			aNonEmpty(signatures);
			const aggAffine = signatures.map(normP1).reduce((sum, s) => sum.add(s), G1.ProjectivePoint.ZERO);
			if (signatures[0] instanceof G1.ProjectivePoint) {
				aggAffine.assertValidity();
				return aggAffine;
			}
			return ShortSignature.toRawBytes(aggAffine);
		}
		function verifyBatch(signature, messages, publicKeys, htfOpts) {
			aNonEmpty(messages);
			if (publicKeys.length !== messages.length) throw new Error("amount of public keys and messages should be equal");
			const sig = normP2(signature);
			const nMessages = messages.map((i) => normP2Hash(i, htfOpts));
			const nPublicKeys = publicKeys.map(normP1);
			const messagePubKeyMap = /* @__PURE__ */ new Map();
			for (let i = 0; i < nPublicKeys.length; i++) {
				const pub = nPublicKeys[i];
				const msg = nMessages[i];
				let keys = messagePubKeyMap.get(msg);
				if (keys === void 0) {
					keys = [];
					messagePubKeyMap.set(msg, keys);
				}
				keys.push(pub);
			}
			const paired = [];
			try {
				for (const [msg, keys] of messagePubKeyMap) {
					const groupPublicKey = keys.reduce((acc, msg) => acc.add(msg));
					paired.push({
						g1: groupPublicKey,
						g2: msg
					});
				}
				paired.push({
					g1: G1.ProjectivePoint.BASE.negate(),
					g2: sig
				});
				return Fp12.eql(pairingBatch(paired), Fp12.ONE);
			} catch {
				return false;
			}
		}
		G1.ProjectivePoint.BASE._setWindowSize(4);
		return {
			getPublicKey,
			getPublicKeyForShortSignatures,
			sign,
			signShortSignature,
			verify,
			verifyBatch,
			verifyShortSignature,
			aggregatePublicKeys,
			aggregateSignatures,
			aggregateShortSignatures,
			millerLoopBatch,
			pairing,
			pairingBatch,
			G1,
			G2,
			Signature,
			ShortSignature,
			fields: {
				Fr,
				Fp,
				Fp2,
				Fp6,
				Fp12
			},
			params: {
				ateLoopSize: CURVE.params.ateLoopSize,
				r: CURVE.params.r,
				G1b: CURVE.G1.b,
				G2b: CURVE.G2.b
			},
			utils
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/tower.js
var require_tower = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.psiFrobenius = psiFrobenius;
	exports.tower12 = tower12;
	/**
	* Towered extension fields.
	* Rather than implementing a massive 12th-degree extension directly, it is more efficient
	* to build it up from smaller extensions: a tower of extensions.
	*
	* For BLS12-381, the Fp12 field is implemented as a quadratic (degree two) extension,
	* on top of a cubic (degree three) extension, on top of a quadratic extension of Fp.
	*
	* For more info: "Pairings for beginners" by Costello, section 7.3.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var mod = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	function calcFrobeniusCoefficients(Fp, nonResidue, modulus, degree, num = 1, divisor) {
		const _divisor = BigInt(divisor === void 0 ? degree : divisor);
		const towerModulus = modulus ** BigInt(degree);
		const res = [];
		for (let i = 0; i < num; i++) {
			const a = BigInt(i + 1);
			const powers = [];
			for (let j = 0, qPower = _1n; j < degree; j++) {
				const power = (a * qPower - a) / _divisor % towerModulus;
				powers.push(Fp.pow(nonResidue, power));
				qPower *= modulus;
			}
			res.push(powers);
		}
		return res;
	}
	function psiFrobenius(Fp, Fp2, base) {
		const PSI_X = Fp2.pow(base, (Fp.ORDER - _1n) / _3n);
		const PSI_Y = Fp2.pow(base, (Fp.ORDER - _1n) / _2n);
		function psi(x, y) {
			return [Fp2.mul(Fp2.frobeniusMap(x, 1), PSI_X), Fp2.mul(Fp2.frobeniusMap(y, 1), PSI_Y)];
		}
		const PSI2_X = Fp2.pow(base, (Fp.ORDER ** _2n - _1n) / _3n);
		const PSI2_Y = Fp2.pow(base, (Fp.ORDER ** _2n - _1n) / _2n);
		if (!Fp2.eql(PSI2_Y, Fp2.neg(Fp2.ONE))) throw new Error("psiFrobenius: PSI2_Y!==-1");
		function psi2(x, y) {
			return [Fp2.mul(x, PSI2_X), Fp2.neg(y)];
		}
		const mapAffine = (fn) => (c, P) => {
			const affine = P.toAffine();
			const p = fn(affine.x, affine.y);
			return c.fromAffine({
				x: p[0],
				y: p[1]
			});
		};
		return {
			psi,
			psi2,
			G2psi: mapAffine(psi),
			G2psi2: mapAffine(psi2),
			PSI_X,
			PSI_Y,
			PSI2_X,
			PSI2_Y
		};
	}
	function tower12(opts) {
		const { ORDER } = opts;
		const Fp = mod.Field(ORDER);
		const FpNONRESIDUE = Fp.create(opts.NONRESIDUE || BigInt(-1));
		const Fpdiv2 = Fp.div(Fp.ONE, _2n);
		const FP2_FROBENIUS_COEFFICIENTS = calcFrobeniusCoefficients(Fp, FpNONRESIDUE, Fp.ORDER, 2)[0];
		const Fp2Add = ({ c0, c1 }, { c0: r0, c1: r1 }) => ({
			c0: Fp.add(c0, r0),
			c1: Fp.add(c1, r1)
		});
		const Fp2Subtract = ({ c0, c1 }, { c0: r0, c1: r1 }) => ({
			c0: Fp.sub(c0, r0),
			c1: Fp.sub(c1, r1)
		});
		const Fp2Multiply = ({ c0, c1 }, rhs) => {
			if (typeof rhs === "bigint") return {
				c0: Fp.mul(c0, rhs),
				c1: Fp.mul(c1, rhs)
			};
			const { c0: r0, c1: r1 } = rhs;
			let t1 = Fp.mul(c0, r0);
			let t2 = Fp.mul(c1, r1);
			return {
				c0: Fp.sub(t1, t2),
				c1: Fp.sub(Fp.mul(Fp.add(c0, c1), Fp.add(r0, r1)), Fp.add(t1, t2))
			};
		};
		const Fp2Square = ({ c0, c1 }) => {
			const a = Fp.add(c0, c1);
			const b = Fp.sub(c0, c1);
			const c = Fp.add(c0, c0);
			return {
				c0: Fp.mul(a, b),
				c1: Fp.mul(c, c1)
			};
		};
		const Fp2fromBigTuple = (tuple) => {
			if (tuple.length !== 2) throw new Error("invalid tuple");
			const fps = tuple.map((n) => Fp.create(n));
			return {
				c0: fps[0],
				c1: fps[1]
			};
		};
		const FP2_ORDER = ORDER * ORDER;
		const Fp2Nonresidue = Fp2fromBigTuple(opts.FP2_NONRESIDUE);
		const Fp2 = {
			ORDER: FP2_ORDER,
			isLE: Fp.isLE,
			NONRESIDUE: Fp2Nonresidue,
			BITS: (0, utils_ts_1.bitLen)(FP2_ORDER),
			BYTES: Math.ceil((0, utils_ts_1.bitLen)(FP2_ORDER) / 8),
			MASK: (0, utils_ts_1.bitMask)((0, utils_ts_1.bitLen)(FP2_ORDER)),
			ZERO: {
				c0: Fp.ZERO,
				c1: Fp.ZERO
			},
			ONE: {
				c0: Fp.ONE,
				c1: Fp.ZERO
			},
			create: (num) => num,
			isValid: ({ c0, c1 }) => typeof c0 === "bigint" && typeof c1 === "bigint",
			is0: ({ c0, c1 }) => Fp.is0(c0) && Fp.is0(c1),
			eql: ({ c0, c1 }, { c0: r0, c1: r1 }) => Fp.eql(c0, r0) && Fp.eql(c1, r1),
			neg: ({ c0, c1 }) => ({
				c0: Fp.neg(c0),
				c1: Fp.neg(c1)
			}),
			pow: (num, power) => mod.FpPow(Fp2, num, power),
			invertBatch: (nums) => mod.FpInvertBatch(Fp2, nums),
			add: Fp2Add,
			sub: Fp2Subtract,
			mul: Fp2Multiply,
			sqr: Fp2Square,
			addN: Fp2Add,
			subN: Fp2Subtract,
			mulN: Fp2Multiply,
			sqrN: Fp2Square,
			div: (lhs, rhs) => Fp2.mul(lhs, typeof rhs === "bigint" ? Fp.inv(Fp.create(rhs)) : Fp2.inv(rhs)),
			inv: ({ c0: a, c1: b }) => {
				const factor = Fp.inv(Fp.create(a * a + b * b));
				return {
					c0: Fp.mul(factor, Fp.create(a)),
					c1: Fp.mul(factor, Fp.create(-b))
				};
			},
			sqrt: (num) => {
				if (opts.Fp2sqrt) return opts.Fp2sqrt(num);
				const { c0, c1 } = num;
				if (Fp.is0(c1)) {
					if (mod.FpLegendre(Fp, c0) === 1) return Fp2.create({
						c0: Fp.sqrt(c0),
						c1: Fp.ZERO
					});
					else return Fp2.create({
						c0: Fp.ZERO,
						c1: Fp.sqrt(Fp.div(c0, FpNONRESIDUE))
					});
				}
				const a = Fp.sqrt(Fp.sub(Fp.sqr(c0), Fp.mul(Fp.sqr(c1), FpNONRESIDUE)));
				let d = Fp.mul(Fp.add(a, c0), Fpdiv2);
				if (mod.FpLegendre(Fp, d) === -1) d = Fp.sub(d, a);
				const a0 = Fp.sqrt(d);
				const candidateSqrt = Fp2.create({
					c0: a0,
					c1: Fp.div(Fp.mul(c1, Fpdiv2), a0)
				});
				if (!Fp2.eql(Fp2.sqr(candidateSqrt), num)) throw new Error("Cannot find square root");
				const x1 = candidateSqrt;
				const x2 = Fp2.neg(x1);
				const { re: re1, im: im1 } = Fp2.reim(x1);
				const { re: re2, im: im2 } = Fp2.reim(x2);
				if (im1 > im2 || im1 === im2 && re1 > re2) return x1;
				return x2;
			},
			isOdd: (x) => {
				const { re: x0, im: x1 } = Fp2.reim(x);
				const sign_0 = x0 % _2n;
				const zero_0 = x0 === _0n;
				const sign_1 = x1 % _2n;
				return BigInt(sign_0 || zero_0 && sign_1) == _1n;
			},
			fromBytes(b) {
				if (b.length !== Fp2.BYTES) throw new Error("fromBytes invalid length=" + b.length);
				return {
					c0: Fp.fromBytes(b.subarray(0, Fp.BYTES)),
					c1: Fp.fromBytes(b.subarray(Fp.BYTES))
				};
			},
			toBytes: ({ c0, c1 }) => (0, utils_ts_1.concatBytes)(Fp.toBytes(c0), Fp.toBytes(c1)),
			cmov: ({ c0, c1 }, { c0: r0, c1: r1 }, c) => ({
				c0: Fp.cmov(c0, r0, c),
				c1: Fp.cmov(c1, r1, c)
			}),
			reim: ({ c0, c1 }) => ({
				re: c0,
				im: c1
			}),
			mulByNonresidue: ({ c0, c1 }) => Fp2.mul({
				c0,
				c1
			}, Fp2Nonresidue),
			mulByB: opts.Fp2mulByB,
			fromBigTuple: Fp2fromBigTuple,
			frobeniusMap: ({ c0, c1 }, power) => ({
				c0,
				c1: Fp.mul(c1, FP2_FROBENIUS_COEFFICIENTS[power % 2])
			})
		};
		const Fp6Add = ({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }) => ({
			c0: Fp2.add(c0, r0),
			c1: Fp2.add(c1, r1),
			c2: Fp2.add(c2, r2)
		});
		const Fp6Subtract = ({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }) => ({
			c0: Fp2.sub(c0, r0),
			c1: Fp2.sub(c1, r1),
			c2: Fp2.sub(c2, r2)
		});
		const Fp6Multiply = ({ c0, c1, c2 }, rhs) => {
			if (typeof rhs === "bigint") return {
				c0: Fp2.mul(c0, rhs),
				c1: Fp2.mul(c1, rhs),
				c2: Fp2.mul(c2, rhs)
			};
			const { c0: r0, c1: r1, c2: r2 } = rhs;
			const t0 = Fp2.mul(c0, r0);
			const t1 = Fp2.mul(c1, r1);
			const t2 = Fp2.mul(c2, r2);
			return {
				c0: Fp2.add(t0, Fp2.mulByNonresidue(Fp2.sub(Fp2.mul(Fp2.add(c1, c2), Fp2.add(r1, r2)), Fp2.add(t1, t2)))),
				c1: Fp2.add(Fp2.sub(Fp2.mul(Fp2.add(c0, c1), Fp2.add(r0, r1)), Fp2.add(t0, t1)), Fp2.mulByNonresidue(t2)),
				c2: Fp2.sub(Fp2.add(t1, Fp2.mul(Fp2.add(c0, c2), Fp2.add(r0, r2))), Fp2.add(t0, t2))
			};
		};
		const Fp6Square = ({ c0, c1, c2 }) => {
			let t0 = Fp2.sqr(c0);
			let t1 = Fp2.mul(Fp2.mul(c0, c1), _2n);
			let t3 = Fp2.mul(Fp2.mul(c1, c2), _2n);
			let t4 = Fp2.sqr(c2);
			return {
				c0: Fp2.add(Fp2.mulByNonresidue(t3), t0),
				c1: Fp2.add(Fp2.mulByNonresidue(t4), t1),
				c2: Fp2.sub(Fp2.sub(Fp2.add(Fp2.add(t1, Fp2.sqr(Fp2.add(Fp2.sub(c0, c1), c2))), t3), t0), t4)
			};
		};
		const [FP6_FROBENIUS_COEFFICIENTS_1, FP6_FROBENIUS_COEFFICIENTS_2] = calcFrobeniusCoefficients(Fp2, Fp2Nonresidue, Fp.ORDER, 6, 2, 3);
		const Fp6 = {
			ORDER: Fp2.ORDER,
			isLE: Fp2.isLE,
			BITS: 3 * Fp2.BITS,
			BYTES: 3 * Fp2.BYTES,
			MASK: (0, utils_ts_1.bitMask)(3 * Fp2.BITS),
			ZERO: {
				c0: Fp2.ZERO,
				c1: Fp2.ZERO,
				c2: Fp2.ZERO
			},
			ONE: {
				c0: Fp2.ONE,
				c1: Fp2.ZERO,
				c2: Fp2.ZERO
			},
			create: (num) => num,
			isValid: ({ c0, c1, c2 }) => Fp2.isValid(c0) && Fp2.isValid(c1) && Fp2.isValid(c2),
			is0: ({ c0, c1, c2 }) => Fp2.is0(c0) && Fp2.is0(c1) && Fp2.is0(c2),
			neg: ({ c0, c1, c2 }) => ({
				c0: Fp2.neg(c0),
				c1: Fp2.neg(c1),
				c2: Fp2.neg(c2)
			}),
			eql: ({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }) => Fp2.eql(c0, r0) && Fp2.eql(c1, r1) && Fp2.eql(c2, r2),
			sqrt: utils_ts_1.notImplemented,
			div: (lhs, rhs) => Fp6.mul(lhs, typeof rhs === "bigint" ? Fp.inv(Fp.create(rhs)) : Fp6.inv(rhs)),
			pow: (num, power) => mod.FpPow(Fp6, num, power),
			invertBatch: (nums) => mod.FpInvertBatch(Fp6, nums),
			add: Fp6Add,
			sub: Fp6Subtract,
			mul: Fp6Multiply,
			sqr: Fp6Square,
			addN: Fp6Add,
			subN: Fp6Subtract,
			mulN: Fp6Multiply,
			sqrN: Fp6Square,
			inv: ({ c0, c1, c2 }) => {
				let t0 = Fp2.sub(Fp2.sqr(c0), Fp2.mulByNonresidue(Fp2.mul(c2, c1)));
				let t1 = Fp2.sub(Fp2.mulByNonresidue(Fp2.sqr(c2)), Fp2.mul(c0, c1));
				let t2 = Fp2.sub(Fp2.sqr(c1), Fp2.mul(c0, c2));
				let t4 = Fp2.inv(Fp2.add(Fp2.mulByNonresidue(Fp2.add(Fp2.mul(c2, t1), Fp2.mul(c1, t2))), Fp2.mul(c0, t0)));
				return {
					c0: Fp2.mul(t4, t0),
					c1: Fp2.mul(t4, t1),
					c2: Fp2.mul(t4, t2)
				};
			},
			fromBytes: (b) => {
				if (b.length !== Fp6.BYTES) throw new Error("fromBytes invalid length=" + b.length);
				return {
					c0: Fp2.fromBytes(b.subarray(0, Fp2.BYTES)),
					c1: Fp2.fromBytes(b.subarray(Fp2.BYTES, 2 * Fp2.BYTES)),
					c2: Fp2.fromBytes(b.subarray(2 * Fp2.BYTES))
				};
			},
			toBytes: ({ c0, c1, c2 }) => (0, utils_ts_1.concatBytes)(Fp2.toBytes(c0), Fp2.toBytes(c1), Fp2.toBytes(c2)),
			cmov: ({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }, c) => ({
				c0: Fp2.cmov(c0, r0, c),
				c1: Fp2.cmov(c1, r1, c),
				c2: Fp2.cmov(c2, r2, c)
			}),
			fromBigSix: (t) => {
				if (!Array.isArray(t) || t.length !== 6) throw new Error("invalid Fp6 usage");
				return {
					c0: Fp2.fromBigTuple(t.slice(0, 2)),
					c1: Fp2.fromBigTuple(t.slice(2, 4)),
					c2: Fp2.fromBigTuple(t.slice(4, 6))
				};
			},
			frobeniusMap: ({ c0, c1, c2 }, power) => ({
				c0: Fp2.frobeniusMap(c0, power),
				c1: Fp2.mul(Fp2.frobeniusMap(c1, power), FP6_FROBENIUS_COEFFICIENTS_1[power % 6]),
				c2: Fp2.mul(Fp2.frobeniusMap(c2, power), FP6_FROBENIUS_COEFFICIENTS_2[power % 6])
			}),
			mulByFp2: ({ c0, c1, c2 }, rhs) => ({
				c0: Fp2.mul(c0, rhs),
				c1: Fp2.mul(c1, rhs),
				c2: Fp2.mul(c2, rhs)
			}),
			mulByNonresidue: ({ c0, c1, c2 }) => ({
				c0: Fp2.mulByNonresidue(c2),
				c1: c0,
				c2: c1
			}),
			mul1: ({ c0, c1, c2 }, b1) => ({
				c0: Fp2.mulByNonresidue(Fp2.mul(c2, b1)),
				c1: Fp2.mul(c0, b1),
				c2: Fp2.mul(c1, b1)
			}),
			mul01({ c0, c1, c2 }, b0, b1) {
				let t0 = Fp2.mul(c0, b0);
				let t1 = Fp2.mul(c1, b1);
				return {
					c0: Fp2.add(Fp2.mulByNonresidue(Fp2.sub(Fp2.mul(Fp2.add(c1, c2), b1), t1)), t0),
					c1: Fp2.sub(Fp2.sub(Fp2.mul(Fp2.add(b0, b1), Fp2.add(c0, c1)), t0), t1),
					c2: Fp2.add(Fp2.sub(Fp2.mul(Fp2.add(c0, c2), b0), t0), t1)
				};
			}
		};
		const FP12_FROBENIUS_COEFFICIENTS = calcFrobeniusCoefficients(Fp2, Fp2Nonresidue, Fp.ORDER, 12, 1, 6)[0];
		const Fp12Add = ({ c0, c1 }, { c0: r0, c1: r1 }) => ({
			c0: Fp6.add(c0, r0),
			c1: Fp6.add(c1, r1)
		});
		const Fp12Subtract = ({ c0, c1 }, { c0: r0, c1: r1 }) => ({
			c0: Fp6.sub(c0, r0),
			c1: Fp6.sub(c1, r1)
		});
		const Fp12Multiply = ({ c0, c1 }, rhs) => {
			if (typeof rhs === "bigint") return {
				c0: Fp6.mul(c0, rhs),
				c1: Fp6.mul(c1, rhs)
			};
			let { c0: r0, c1: r1 } = rhs;
			let t1 = Fp6.mul(c0, r0);
			let t2 = Fp6.mul(c1, r1);
			return {
				c0: Fp6.add(t1, Fp6.mulByNonresidue(t2)),
				c1: Fp6.sub(Fp6.mul(Fp6.add(c0, c1), Fp6.add(r0, r1)), Fp6.add(t1, t2))
			};
		};
		const Fp12Square = ({ c0, c1 }) => {
			let ab = Fp6.mul(c0, c1);
			return {
				c0: Fp6.sub(Fp6.sub(Fp6.mul(Fp6.add(Fp6.mulByNonresidue(c1), c0), Fp6.add(c0, c1)), ab), Fp6.mulByNonresidue(ab)),
				c1: Fp6.add(ab, ab)
			};
		};
		function Fp4Square(a, b) {
			const a2 = Fp2.sqr(a);
			const b2 = Fp2.sqr(b);
			return {
				first: Fp2.add(Fp2.mulByNonresidue(b2), a2),
				second: Fp2.sub(Fp2.sub(Fp2.sqr(Fp2.add(a, b)), a2), b2)
			};
		}
		const Fp12 = {
			ORDER: Fp2.ORDER,
			isLE: Fp6.isLE,
			BITS: 2 * Fp6.BITS,
			BYTES: 2 * Fp6.BYTES,
			MASK: (0, utils_ts_1.bitMask)(2 * Fp6.BITS),
			ZERO: {
				c0: Fp6.ZERO,
				c1: Fp6.ZERO
			},
			ONE: {
				c0: Fp6.ONE,
				c1: Fp6.ZERO
			},
			create: (num) => num,
			isValid: ({ c0, c1 }) => Fp6.isValid(c0) && Fp6.isValid(c1),
			is0: ({ c0, c1 }) => Fp6.is0(c0) && Fp6.is0(c1),
			neg: ({ c0, c1 }) => ({
				c0: Fp6.neg(c0),
				c1: Fp6.neg(c1)
			}),
			eql: ({ c0, c1 }, { c0: r0, c1: r1 }) => Fp6.eql(c0, r0) && Fp6.eql(c1, r1),
			sqrt: utils_ts_1.notImplemented,
			inv: ({ c0, c1 }) => {
				let t = Fp6.inv(Fp6.sub(Fp6.sqr(c0), Fp6.mulByNonresidue(Fp6.sqr(c1))));
				return {
					c0: Fp6.mul(c0, t),
					c1: Fp6.neg(Fp6.mul(c1, t))
				};
			},
			div: (lhs, rhs) => Fp12.mul(lhs, typeof rhs === "bigint" ? Fp.inv(Fp.create(rhs)) : Fp12.inv(rhs)),
			pow: (num, power) => mod.FpPow(Fp12, num, power),
			invertBatch: (nums) => mod.FpInvertBatch(Fp12, nums),
			add: Fp12Add,
			sub: Fp12Subtract,
			mul: Fp12Multiply,
			sqr: Fp12Square,
			addN: Fp12Add,
			subN: Fp12Subtract,
			mulN: Fp12Multiply,
			sqrN: Fp12Square,
			fromBytes: (b) => {
				if (b.length !== Fp12.BYTES) throw new Error("fromBytes invalid length=" + b.length);
				return {
					c0: Fp6.fromBytes(b.subarray(0, Fp6.BYTES)),
					c1: Fp6.fromBytes(b.subarray(Fp6.BYTES))
				};
			},
			toBytes: ({ c0, c1 }) => (0, utils_ts_1.concatBytes)(Fp6.toBytes(c0), Fp6.toBytes(c1)),
			cmov: ({ c0, c1 }, { c0: r0, c1: r1 }, c) => ({
				c0: Fp6.cmov(c0, r0, c),
				c1: Fp6.cmov(c1, r1, c)
			}),
			fromBigTwelve: (t) => ({
				c0: Fp6.fromBigSix(t.slice(0, 6)),
				c1: Fp6.fromBigSix(t.slice(6, 12))
			}),
			frobeniusMap(lhs, power) {
				const { c0, c1, c2 } = Fp6.frobeniusMap(lhs.c1, power);
				const coeff = FP12_FROBENIUS_COEFFICIENTS[power % 12];
				return {
					c0: Fp6.frobeniusMap(lhs.c0, power),
					c1: Fp6.create({
						c0: Fp2.mul(c0, coeff),
						c1: Fp2.mul(c1, coeff),
						c2: Fp2.mul(c2, coeff)
					})
				};
			},
			mulByFp2: ({ c0, c1 }, rhs) => ({
				c0: Fp6.mulByFp2(c0, rhs),
				c1: Fp6.mulByFp2(c1, rhs)
			}),
			conjugate: ({ c0, c1 }) => ({
				c0,
				c1: Fp6.neg(c1)
			}),
			mul014: ({ c0, c1 }, o0, o1, o4) => {
				let t0 = Fp6.mul01(c0, o0, o1);
				let t1 = Fp6.mul1(c1, o4);
				return {
					c0: Fp6.add(Fp6.mulByNonresidue(t1), t0),
					c1: Fp6.sub(Fp6.sub(Fp6.mul01(Fp6.add(c1, c0), o0, Fp2.add(o1, o4)), t0), t1)
				};
			},
			mul034: ({ c0, c1 }, o0, o3, o4) => {
				const a = Fp6.create({
					c0: Fp2.mul(c0.c0, o0),
					c1: Fp2.mul(c0.c1, o0),
					c2: Fp2.mul(c0.c2, o0)
				});
				const b = Fp6.mul01(c1, o3, o4);
				const e = Fp6.mul01(Fp6.add(c0, c1), Fp2.add(o0, o3), o4);
				return {
					c0: Fp6.add(Fp6.mulByNonresidue(b), a),
					c1: Fp6.sub(e, Fp6.add(a, b))
				};
			},
			_cyclotomicSquare: opts.Fp12cyclotomicSquare,
			_cyclotomicExp: opts.Fp12cyclotomicExp,
			finalExponentiate: opts.Fp12finalExponentiate
		};
		return {
			Fp,
			Fp2,
			Fp6,
			Fp4Square,
			Fp12
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/bls12-381.js
var require_bls12_381 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bls12_381 = void 0;
	/**
	* bls12-381 is pairing-friendly Barreto-Lynn-Scott elliptic curve construction allowing to:
	* * Construct zk-SNARKs at the ~120-bit security
	* * Efficiently verify N aggregate signatures with 1 pairing and N ec additions:
	*   the Boneh-Lynn-Shacham signature scheme is orders of magnitude more efficient than Schnorr
	*
	* ### Summary
	* 1. BLS Relies on Bilinear Pairing (expensive)
	* 2. Private Keys: 32 bytes
	* 3. Public Keys: 48 bytes: 381 bit affine x coordinate, encoded into 48 big-endian bytes.
	* 4. Signatures: 96 bytes: two 381 bit integers (affine x coordinate), encoded into two 48 big-endian byte arrays.
	*     - The signature is a point on the G2 subgroup, which is defined over a finite field
	*       with elements twice as big as the G1 curve (G2 is over Fp2 rather than Fp. Fp2 is analogous to the
	*       complex numbers).
	*     - We also support reversed 96-byte pubkeys & 48-byte short signatures.
	* 5. The 12 stands for the Embedding degree.
	*
	* ### Formulas
	* - `P = pk x G` - public keys
	* - `S = pk x H(m)` - signing
	* - `e(P, H(m)) == e(G, S)` - verification using pairings
	* - `e(G, S) = e(G, SUM(n)(Si)) = MUL(n)(e(G, Si))` - signature aggregation
	*
	* ### Compatibility and notes
	* 1. It is compatible with Algorand, Chia, Dfinity, Ethereum, Filecoin, ZEC.
	* Filecoin uses little endian byte arrays for private keys - make sure to reverse byte order.
	* 2. Some projects use G2 for public keys and G1 for signatures. It's called "short signature".
	* 3. Curve security level is about 120 bits as per [Barbulescu-Duquesne 2017](https://hal.science/hal-01534101/file/main.pdf)
	* 4. Compatible with specs:
	*    [cfrg-pairing-friendly-curves-11](https://tools.ietf.org/html/draft-irtf-cfrg-pairing-friendly-curves-11),
	*    [cfrg-bls-signature-05](https://www.rfc-editor.org/rfc/draft-irtf-cfrg-bls-signature-05),
	*    RFC 9380.
	*
	* ### Params
	* To verify curve parameters, see
	* [pairing-friendly-curves spec](https://www.rfc-editor.org/rfc/draft-irtf-cfrg-pairing-friendly-curves-11).
	* Basic math is done over finite fields over p.
	* More complicated math is done over polynominal extension fields.
	* To simplify calculations in Fp12, we construct extension tower:
	*
	* Embedding degree (k): 12
	* Seed (X): -15132376222941642752
	* Fr:  (x⁴-x²+1)
	* Fp: ((x-1)² ⋅ r(x)/3+x)
	* (E/Fp): Y²=X³+4
	* (Eₜ/Fp²): Y² = X³+4(u+1) (M-type twist)
	* Ate loop size: X
	*
	* ### Towers
	* - Fp₁₂ = Fp₆² => Fp₂³
	* - Fp(u) / (u² - β) where β = -1
	* - Fp₂(v) / (v³ - ξ) where ξ = u + 1
	* - Fp₆(w) / (w² - γ) where γ = v
	* - Fp²[u] = Fp/u²+1
	* - Fp⁶[v] = Fp²/v³-1-u
	* - Fp¹²[w] = Fp⁶/w²-v
	*
	* @todo construct bls & bn fp/fr from seed.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_1 = require_sha2$2();
	var utils_1 = require_utils$4();
	var bls_ts_1 = require_bls();
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var hash_to_curve_ts_1 = require_hash_to_curve$2();
	var tower_ts_1 = require_tower();
	var weierstrass_ts_1 = require_weierstrass$2();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	var _4n = BigInt(4);
	var BLS_X = BigInt("0xd201000000010000");
	var BLS_X_LEN = (0, utils_ts_1.bitLen)(BLS_X);
	var { Fp, Fp2, Fp6, Fp4Square, Fp12 } = (0, tower_ts_1.tower12)({
		ORDER: BigInt("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab"),
		FP2_NONRESIDUE: [_1n, _1n],
		Fp2mulByB: ({ c0, c1 }) => {
			const t0 = Fp.mul(c0, _4n);
			const t1 = Fp.mul(c1, _4n);
			return {
				c0: Fp.sub(t0, t1),
				c1: Fp.add(t0, t1)
			};
		},
		Fp12cyclotomicSquare: ({ c0, c1 }) => {
			const { c0: c0c0, c1: c0c1, c2: c0c2 } = c0;
			const { c0: c1c0, c1: c1c1, c2: c1c2 } = c1;
			const { first: t3, second: t4 } = Fp4Square(c0c0, c1c1);
			const { first: t5, second: t6 } = Fp4Square(c1c0, c0c2);
			const { first: t7, second: t8 } = Fp4Square(c0c1, c1c2);
			const t9 = Fp2.mulByNonresidue(t8);
			return {
				c0: Fp6.create({
					c0: Fp2.add(Fp2.mul(Fp2.sub(t3, c0c0), _2n), t3),
					c1: Fp2.add(Fp2.mul(Fp2.sub(t5, c0c1), _2n), t5),
					c2: Fp2.add(Fp2.mul(Fp2.sub(t7, c0c2), _2n), t7)
				}),
				c1: Fp6.create({
					c0: Fp2.add(Fp2.mul(Fp2.add(t9, c1c0), _2n), t9),
					c1: Fp2.add(Fp2.mul(Fp2.add(t4, c1c1), _2n), t4),
					c2: Fp2.add(Fp2.mul(Fp2.add(t6, c1c2), _2n), t6)
				})
			};
		},
		Fp12cyclotomicExp(num, n) {
			let z = Fp12.ONE;
			for (let i = BLS_X_LEN - 1; i >= 0; i--) {
				z = Fp12._cyclotomicSquare(z);
				if ((0, utils_ts_1.bitGet)(n, i)) z = Fp12.mul(z, num);
			}
			return z;
		},
		Fp12finalExponentiate: (num) => {
			const x = BLS_X;
			const t0 = Fp12.div(Fp12.frobeniusMap(num, 6), num);
			const t1 = Fp12.mul(Fp12.frobeniusMap(t0, 2), t0);
			const t2 = Fp12.conjugate(Fp12._cyclotomicExp(t1, x));
			const t3 = Fp12.mul(Fp12.conjugate(Fp12._cyclotomicSquare(t1)), t2);
			const t4 = Fp12.conjugate(Fp12._cyclotomicExp(t3, x));
			const t5 = Fp12.conjugate(Fp12._cyclotomicExp(t4, x));
			const t6 = Fp12.mul(Fp12.conjugate(Fp12._cyclotomicExp(t5, x)), Fp12._cyclotomicSquare(t2));
			const t7 = Fp12.conjugate(Fp12._cyclotomicExp(t6, x));
			const t2_t5_pow_q2 = Fp12.frobeniusMap(Fp12.mul(t2, t5), 2);
			const t4_t1_pow_q3 = Fp12.frobeniusMap(Fp12.mul(t4, t1), 3);
			const t6_t1c_pow_q1 = Fp12.frobeniusMap(Fp12.mul(t6, Fp12.conjugate(t1)), 1);
			const t7_t3c_t1 = Fp12.mul(Fp12.mul(t7, Fp12.conjugate(t3)), t1);
			return Fp12.mul(Fp12.mul(Fp12.mul(t2_t5_pow_q2, t4_t1_pow_q3), t6_t1c_pow_q1), t7_t3c_t1);
		}
	});
	var Fr = (0, modular_ts_1.Field)(BigInt("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001"));
	var isogenyMapG2 = (0, hash_to_curve_ts_1.isogenyMap)(Fp2, [
		[
			["0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6", "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6"],
			["0x0", "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71a"],
			["0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71e", "0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38d"],
			["0x171d6541fa38ccfaed6dea691f5fb614cb14b4e7f4e810aa22d6108f142b85757098e38d0f671c7188e2aaaaaaaa5ed1", "0x0"]
		],
		[
			["0x0", "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa63"],
			["0xc", "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa9f"],
			["0x1", "0x0"]
		],
		[
			["0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706", "0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706"],
			["0x0", "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97be"],
			["0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71c", "0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38f"],
			["0x124c9ad43b6cf79bfbf7043de3811ad0761b0f37a1e26286b0e977c69aa274524e79097a56dc4bd9e1b371c71c718b10", "0x0"]
		],
		[
			["0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fb", "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fb"],
			["0x0", "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa9d3"],
			["0x12", "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa99"],
			["0x1", "0x0"]
		]
	].map((i) => i.map((pair) => Fp2.fromBigTuple(pair.map(BigInt)))));
	var isogenyMapG1 = (0, hash_to_curve_ts_1.isogenyMap)(Fp, [
		[
			"0x11a05f2b1e833340b809101dd99815856b303e88a2d7005ff2627b56cdb4e2c85610c2d5f2e62d6eaeac1662734649b7",
			"0x17294ed3e943ab2f0588bab22147a81c7c17e75b2f6a8417f565e33c70d1e86b4838f2a6f318c356e834eef1b3cb83bb",
			"0xd54005db97678ec1d1048c5d10a9a1bce032473295983e56878e501ec68e25c958c3e3d2a09729fe0179f9dac9edcb0",
			"0x1778e7166fcc6db74e0609d307e55412d7f5e4656a8dbf25f1b33289f1b330835336e25ce3107193c5b388641d9b6861",
			"0xe99726a3199f4436642b4b3e4118e5499db995a1257fb3f086eeb65982fac18985a286f301e77c451154ce9ac8895d9",
			"0x1630c3250d7313ff01d1201bf7a74ab5db3cb17dd952799b9ed3ab9097e68f90a0870d2dcae73d19cd13c1c66f652983",
			"0xd6ed6553fe44d296a3726c38ae652bfb11586264f0f8ce19008e218f9c86b2a8da25128c1052ecaddd7f225a139ed84",
			"0x17b81e7701abdbe2e8743884d1117e53356de5ab275b4db1a682c62ef0f2753339b7c8f8c8f475af9ccb5618e3f0c88e",
			"0x80d3cf1f9a78fc47b90b33563be990dc43b756ce79f5574a2c596c928c5d1de4fa295f296b74e956d71986a8497e317",
			"0x169b1f8e1bcfa7c42e0c37515d138f22dd2ecb803a0c5c99676314baf4bb1b7fa3190b2edc0327797f241067be390c9e",
			"0x10321da079ce07e272d8ec09d2565b0dfa7dccdde6787f96d50af36003b14866f69b771f8c285decca67df3f1605fb7b",
			"0x6e08c248e260e70bd1e962381edee3d31d79d7e22c837bc23c0bf1bc24c6b68c24b1b80b64d391fa9c8ba2e8ba2d229"
		],
		[
			"0x8ca8d548cff19ae18b2e62f4bd3fa6f01d5ef4ba35b48ba9c9588617fc8ac62b558d681be343df8993cf9fa40d21b1c",
			"0x12561a5deb559c4348b4711298e536367041e8ca0cf0800c0126c2588c48bf5713daa8846cb026e9e5c8276ec82b3bff",
			"0xb2962fe57a3225e8137e629bff2991f6f89416f5a718cd1fca64e00b11aceacd6a3d0967c94fedcfcc239ba5cb83e19",
			"0x3425581a58ae2fec83aafef7c40eb545b08243f16b1655154cca8abc28d6fd04976d5243eecf5c4130de8938dc62cd8",
			"0x13a8e162022914a80a6f1d5f43e7a07dffdfc759a12062bb8d6b44e833b306da9bd29ba81f35781d539d395b3532a21e",
			"0xe7355f8e4e667b955390f7f0506c6e9395735e9ce9cad4d0a43bcef24b8982f7400d24bc4228f11c02df9a29f6304a5",
			"0x772caacf16936190f3e0c63e0596721570f5799af53a1894e2e073062aede9cea73b3538f0de06cec2574496ee84a3a",
			"0x14a7ac2a9d64a8b230b3f5b074cf01996e7f63c21bca68a81996e1cdf9822c580fa5b9489d11e2d311f7d99bbdcc5a5e",
			"0xa10ecf6ada54f825e920b3dafc7a3cce07f8d1d7161366b74100da67f39883503826692abba43704776ec3a79a1d641",
			"0x95fc13ab9e92ad4476d6e3eb3a56680f682b4ee96f7d03776df533978f31c1593174e4b4b7865002d6384d168ecdd0a",
			"0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
		],
		[
			"0x90d97c81ba24ee0259d1f094980dcfa11ad138e48a869522b52af6c956543d3cd0c7aee9b3ba3c2be9845719707bb33",
			"0x134996a104ee5811d51036d776fb46831223e96c254f383d0f906343eb67ad34d6c56711962fa8bfe097e75a2e41c696",
			"0xcc786baa966e66f4a384c86a3b49942552e2d658a31ce2c344be4b91400da7d26d521628b00523b8dfe240c72de1f6",
			"0x1f86376e8981c217898751ad8746757d42aa7b90eeb791c09e4a3ec03251cf9de405aba9ec61deca6355c77b0e5f4cb",
			"0x8cc03fdefe0ff135caf4fe2a21529c4195536fbe3ce50b879833fd221351adc2ee7f8dc099040a841b6daecf2e8fedb",
			"0x16603fca40634b6a2211e11db8f0a6a074a7d0d4afadb7bd76505c3d3ad5544e203f6326c95a807299b23ab13633a5f0",
			"0x4ab0b9bcfac1bbcb2c977d027796b3ce75bb8ca2be184cb5231413c4d634f3747a87ac2460f415ec961f8855fe9d6f2",
			"0x987c8d5333ab86fde9926bd2ca6c674170a05bfe3bdd81ffd038da6c26c842642f64550fedfe935a15e4ca31870fb29",
			"0x9fc4018bd96684be88c9e221e4da1bb8f3abd16679dc26c1e8b6e6a1f20cabe69d65201c78607a360370e577bdba587",
			"0xe1bba7a1186bdb5223abde7ada14a23c42a0ca7915af6fe06985e7ed1e4d43b9b3f7055dd4eba6f2bafaaebca731c30",
			"0x19713e47937cd1be0dfd0b8f1d43fb93cd2fcbcb6caf493fd1183e416389e61031bf3a5cce3fbafce813711ad011c132",
			"0x18b46a908f36f6deb918c143fed2edcc523559b8aaf0c2462e6bfe7f911f643249d9cdf41b44d606ce07c8a4d0074d8e",
			"0xb182cac101b9399d155096004f53f447aa7b12a3426b08ec02710e807b4633f06c851c1919211f20d4c04f00b971ef8",
			"0x245a394ad1eca9b72fc00ae7be315dc757b3b080d4c158013e6632d3c40659cc6cf90ad1c232a6442d9d3f5db980133",
			"0x5c129645e44cf1102a159f748c4a3fc5e673d81d7e86568d9ab0f5d396a7ce46ba1049b6579afb7866b1e715475224b",
			"0x15e6be4e990f03ce4ea50b3b42df2eb5cb181d8f84965a3957add4fa95af01b2b665027efec01c7704b456be69c8b604"
		],
		[
			"0x16112c4c3a9c98b252181140fad0eae9601a6de578980be6eec3232b5be72e7a07f3688ef60c206d01479253b03663c1",
			"0x1962d75c2381201e1a0cbd6c43c348b885c84ff731c4d59ca4a10356f453e01f78a4260763529e3532f6102c2e49a03d",
			"0x58df3306640da276faaae7d6e8eb15778c4855551ae7f310c35a5dd279cd2eca6757cd636f96f891e2538b53dbf67f2",
			"0x16b7d288798e5395f20d23bf89edb4d1d115c5dbddbcd30e123da489e726af41727364f2c28297ada8d26d98445f5416",
			"0xbe0e079545f43e4b00cc912f8228ddcc6d19c9f0f69bbb0542eda0fc9dec916a20b15dc0fd2ededda39142311a5001d",
			"0x8d9e5297186db2d9fb266eaac783182b70152c65550d881c5ecd87b6f0f5a6449f38db9dfa9cce202c6477faaf9b7ac",
			"0x166007c08a99db2fc3ba8734ace9824b5eecfdfa8d0cf8ef5dd365bc400a0051d5fa9c01a58b1fb93d1a1399126a775c",
			"0x16a3ef08be3ea7ea03bcddfabba6ff6ee5a4375efa1f4fd7feb34fd206357132b920f5b00801dee460ee415a15812ed9",
			"0x1866c8ed336c61231a1be54fd1d74cc4f9fb0ce4c6af5920abc5750c4bf39b4852cfe2f7bb9248836b233d9d55535d4a",
			"0x167a55cda70a6e1cea820597d94a84903216f763e13d87bb5308592e7ea7d4fbc7385ea3d529b35e346ef48bb8913f55",
			"0x4d2f259eea405bd48f010a01ad2911d9c6dd039bb61a6290e591b36e636a5c871a5c29f4f83060400f8b49cba8f6aa8",
			"0xaccbb67481d033ff5852c1e48c50c477f94ff8aefce42d28c0f9a88cea7913516f968986f7ebbea9684b529e2561092",
			"0xad6b9514c767fe3c3613144b45f1496543346d98adf02267d5ceef9a00d9b8693000763e3b90ac11e99b138573345cc",
			"0x2660400eb2e4f3b628bdd0d53cd76f2bf565b94e72927c1cb748df27942480e420517bd8714cc80d1fadc1326ed06f7",
			"0xe0fa1d816ddc03e6b24255e0d7819c171c40f65e273b853324efcd6356caa205ca2f570f13497804415473a1d634b8f",
			"0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
		]
	].map((i) => i.map((j) => BigInt(j))));
	var G2_SWU = (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fp2, {
		A: Fp2.create({
			c0: Fp.create(_0n),
			c1: Fp.create(BigInt(240))
		}),
		B: Fp2.create({
			c0: Fp.create(BigInt(1012)),
			c1: Fp.create(BigInt(1012))
		}),
		Z: Fp2.create({
			c0: Fp.create(BigInt(-2)),
			c1: Fp.create(BigInt(-1))
		})
	});
	var G1_SWU = (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fp, {
		A: Fp.create(BigInt("0x144698a3b8e9433d693a02c96d4982b0ea985383ee66a8d8e8981aefd881ac98936f8da0e0f97f5cf428082d584c1d")),
		B: Fp.create(BigInt("0x12e2908d11688030018b12e8753eee3b2016c1f0f24f4070a0b9c14fcef35ef55a23215a316ceaa5d1cc48e98e172be0")),
		Z: Fp.create(BigInt(11))
	});
	var { G2psi, G2psi2 } = (0, tower_ts_1.psiFrobenius)(Fp, Fp2, Fp2.div(Fp2.ONE, Fp2.NONRESIDUE));
	var htfDefaults = Object.freeze({
		DST: "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_",
		encodeDST: "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_",
		p: Fp.ORDER,
		m: 2,
		k: 128,
		expand: "xmd",
		hash: sha2_1.sha256
	});
	var COMPRESSED_ZERO = setMask(Fp.toBytes(_0n), {
		infinity: true,
		compressed: true
	});
	function parseMask(bytes) {
		bytes = bytes.slice();
		const mask = bytes[0] & 224;
		const compressed = !!(mask >> 7 & 1);
		const infinity = !!(mask >> 6 & 1);
		const sort = !!(mask >> 5 & 1);
		bytes[0] &= 31;
		return {
			compressed,
			infinity,
			sort,
			value: bytes
		};
	}
	function setMask(bytes, mask) {
		if (bytes[0] & 224) throw new Error("setMask: non-empty mask");
		if (mask.compressed) bytes[0] |= 128;
		if (mask.infinity) bytes[0] |= 64;
		if (mask.sort) bytes[0] |= 32;
		return bytes;
	}
	function signatureG1ToRawBytes(point) {
		point.assertValidity();
		const isZero = point.equals(exports.bls12_381.G1.ProjectivePoint.ZERO);
		const { x, y } = point.toAffine();
		if (isZero) return COMPRESSED_ZERO.slice();
		const P = Fp.ORDER;
		const sort = Boolean(y * _2n / P);
		return setMask((0, utils_ts_1.numberToBytesBE)(x, Fp.BYTES), {
			compressed: true,
			sort
		});
	}
	function signatureG2ToRawBytes(point) {
		point.assertValidity();
		const len = Fp.BYTES;
		if (point.equals(exports.bls12_381.G2.ProjectivePoint.ZERO)) return (0, utils_ts_1.concatBytes)(COMPRESSED_ZERO, (0, utils_ts_1.numberToBytesBE)(_0n, len));
		const { x, y } = point.toAffine();
		const { re: x0, im: x1 } = Fp2.reim(x);
		const { re: y0, im: y1 } = Fp2.reim(y);
		const tmp = y1 > _0n ? y1 * _2n : y0 * _2n;
		const sort = Boolean(tmp / Fp.ORDER & _1n);
		const z2 = x0;
		return (0, utils_ts_1.concatBytes)(setMask((0, utils_ts_1.numberToBytesBE)(x1, len), {
			sort,
			compressed: true
		}), (0, utils_ts_1.numberToBytesBE)(z2, len));
	}
	/**
	* bls12-381 pairing-friendly curve.
	* @example
	* import { bls12_381 as bls } from '@noble/curves/bls12-381';
	* // G1 keys, G2 signatures
	* const privateKey = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73265c';
	* const message = '64726e3da8';
	* const publicKey = bls.getPublicKey(privateKey);
	* const signature = bls.sign(message, privateKey);
	* const isValid = bls.verify(signature, message, publicKey);
	*/
	exports.bls12_381 = (0, bls_ts_1.bls)({
		fields: {
			Fp,
			Fp2,
			Fp6,
			Fp12,
			Fr
		},
		G1: {
			Fp,
			h: BigInt("0x396c8c005555e1568c00aaab0000aaab"),
			Gx: BigInt("0x17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb"),
			Gy: BigInt("0x08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1"),
			a: Fp.ZERO,
			b: _4n,
			htfDefaults: {
				...htfDefaults,
				m: 1,
				DST: "BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_"
			},
			wrapPrivateKey: true,
			allowInfinityPoint: true,
			isTorsionFree: (c, point) => {
				const beta = BigInt("0x5f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe");
				const phi = new c(Fp.mul(point.px, beta), point.py, point.pz);
				return point.multiplyUnsafe(BLS_X).negate().multiplyUnsafe(BLS_X).equals(phi);
			},
			clearCofactor: (_c, point) => {
				return point.multiplyUnsafe(BLS_X).add(point);
			},
			mapToCurve: (scalars) => {
				const { x, y } = G1_SWU(Fp.create(scalars[0]));
				return isogenyMapG1(x, y);
			},
			fromBytes: (bytes) => {
				const { compressed, infinity, sort, value } = parseMask(bytes);
				if (value.length === 48 && compressed) {
					const P = Fp.ORDER;
					const compressedValue = (0, utils_ts_1.bytesToNumberBE)(value);
					const x = Fp.create(compressedValue & Fp.MASK);
					if (infinity) {
						if (x !== _0n) throw new Error("G1: non-empty compressed point at infinity");
						return {
							x: _0n,
							y: _0n
						};
					}
					const right = Fp.add(Fp.pow(x, _3n), Fp.create(exports.bls12_381.params.G1b));
					let y = Fp.sqrt(right);
					if (!y) throw new Error("invalid compressed G1 point");
					if (y * _2n / P !== BigInt(sort)) y = Fp.neg(y);
					return {
						x: Fp.create(x),
						y: Fp.create(y)
					};
				} else if (value.length === 96 && !compressed) {
					const x = (0, utils_ts_1.bytesToNumberBE)(value.subarray(0, Fp.BYTES));
					const y = (0, utils_ts_1.bytesToNumberBE)(value.subarray(Fp.BYTES));
					if (infinity) {
						if (x !== _0n || y !== _0n) throw new Error("G1: non-empty point at infinity");
						return exports.bls12_381.G1.ProjectivePoint.ZERO.toAffine();
					}
					return {
						x: Fp.create(x),
						y: Fp.create(y)
					};
				} else throw new Error("invalid point G1, expected 48/96 bytes");
			},
			toBytes: (c, point, isCompressed) => {
				const isZero = point.equals(c.ZERO);
				const { x, y } = point.toAffine();
				if (isCompressed) {
					if (isZero) return COMPRESSED_ZERO.slice();
					const P = Fp.ORDER;
					const sort = Boolean(y * _2n / P);
					return setMask((0, utils_ts_1.numberToBytesBE)(x, Fp.BYTES), {
						compressed: true,
						sort
					});
				} else if (isZero) return (0, utils_ts_1.concatBytes)(new Uint8Array([64]), new Uint8Array(2 * Fp.BYTES - 1));
				else return (0, utils_ts_1.concatBytes)((0, utils_ts_1.numberToBytesBE)(x, Fp.BYTES), (0, utils_ts_1.numberToBytesBE)(y, Fp.BYTES));
			},
			ShortSignature: {
				fromHex(hex) {
					const { infinity, sort, value } = parseMask((0, utils_ts_1.ensureBytes)("signatureHex", hex, 48));
					const P = Fp.ORDER;
					const compressedValue = (0, utils_ts_1.bytesToNumberBE)(value);
					if (infinity) return exports.bls12_381.G1.ProjectivePoint.ZERO;
					const x = Fp.create(compressedValue & Fp.MASK);
					const right = Fp.add(Fp.pow(x, _3n), Fp.create(exports.bls12_381.params.G1b));
					let y = Fp.sqrt(right);
					if (!y) throw new Error("invalid compressed G1 point");
					const aflag = BigInt(sort);
					if (y * _2n / P !== aflag) y = Fp.neg(y);
					const point = exports.bls12_381.G1.ProjectivePoint.fromAffine({
						x,
						y
					});
					point.assertValidity();
					return point;
				},
				toRawBytes(point) {
					return signatureG1ToRawBytes(point);
				},
				toHex(point) {
					return (0, utils_ts_1.bytesToHex)(signatureG1ToRawBytes(point));
				}
			}
		},
		G2: {
			Fp: Fp2,
			h: BigInt("0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5"),
			Gx: Fp2.fromBigTuple([BigInt("0x024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8"), BigInt("0x13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e")]),
			Gy: Fp2.fromBigTuple([BigInt("0x0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801"), BigInt("0x0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be")]),
			a: Fp2.ZERO,
			b: Fp2.fromBigTuple([_4n, _4n]),
			hEff: BigInt("0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551"),
			htfDefaults: { ...htfDefaults },
			wrapPrivateKey: true,
			allowInfinityPoint: true,
			mapToCurve: (scalars) => {
				const { x, y } = G2_SWU(Fp2.fromBigTuple(scalars));
				return isogenyMapG2(x, y);
			},
			isTorsionFree: (c, P) => {
				return P.multiplyUnsafe(BLS_X).negate().equals(G2psi(c, P));
			},
			clearCofactor: (c, P) => {
				const x = BLS_X;
				let t1 = P.multiplyUnsafe(x).negate();
				let t2 = G2psi(c, P);
				let t3 = P.double();
				t3 = G2psi2(c, t3);
				t3 = t3.subtract(t2);
				t2 = t1.add(t2);
				t2 = t2.multiplyUnsafe(x).negate();
				t3 = t3.add(t2);
				t3 = t3.subtract(t1);
				return t3.subtract(P);
			},
			fromBytes: (bytes) => {
				const { compressed, infinity, sort, value } = parseMask(bytes);
				if (!compressed && !infinity && sort || !compressed && infinity && sort || sort && infinity && compressed) throw new Error("invalid encoding flag: " + (bytes[0] & 224));
				const L = Fp.BYTES;
				const slc = (b, from, to) => (0, utils_ts_1.bytesToNumberBE)(b.slice(from, to));
				if (value.length === 96 && compressed) {
					const b = exports.bls12_381.params.G2b;
					const P = Fp.ORDER;
					if (infinity) {
						if (value.reduce((p, c) => p !== 0 ? c + 1 : c, 0) > 0) throw new Error("invalid compressed G2 point");
						return {
							x: Fp2.ZERO,
							y: Fp2.ZERO
						};
					}
					const x_1 = slc(value, 0, L);
					const x_0 = slc(value, L, 2 * L);
					const x = Fp2.create({
						c0: Fp.create(x_0),
						c1: Fp.create(x_1)
					});
					const right = Fp2.add(Fp2.pow(x, _3n), b);
					let y = Fp2.sqrt(right);
					const Y_bit = y.c1 === _0n ? y.c0 * _2n / P : y.c1 * _2n / P ? _1n : _0n;
					y = sort && Y_bit > 0 ? y : Fp2.neg(y);
					return {
						x,
						y
					};
				} else if (value.length === 192 && !compressed) {
					if (infinity) {
						if (value.reduce((p, c) => p !== 0 ? c + 1 : c, 0) > 0) throw new Error("invalid uncompressed G2 point");
						return {
							x: Fp2.ZERO,
							y: Fp2.ZERO
						};
					}
					const x1 = slc(value, 0, L);
					const x0 = slc(value, L, 2 * L);
					const y1 = slc(value, 2 * L, 3 * L);
					const y0 = slc(value, 3 * L, 4 * L);
					return {
						x: Fp2.fromBigTuple([x0, x1]),
						y: Fp2.fromBigTuple([y0, y1])
					};
				} else throw new Error("invalid point G2, expected 96/192 bytes");
			},
			toBytes: (c, point, isCompressed) => {
				const { BYTES: len, ORDER: P } = Fp;
				const isZero = point.equals(c.ZERO);
				const { x, y } = point.toAffine();
				if (isCompressed) {
					if (isZero) return (0, utils_ts_1.concatBytes)(COMPRESSED_ZERO, (0, utils_ts_1.numberToBytesBE)(_0n, len));
					const flag = Boolean(y.c1 === _0n ? y.c0 * _2n / P : y.c1 * _2n / P);
					return (0, utils_ts_1.concatBytes)(setMask((0, utils_ts_1.numberToBytesBE)(x.c1, len), {
						compressed: true,
						sort: flag
					}), (0, utils_ts_1.numberToBytesBE)(x.c0, len));
				} else {
					if (isZero) return (0, utils_ts_1.concatBytes)(new Uint8Array([64]), new Uint8Array(4 * len - 1));
					const { re: x0, im: x1 } = Fp2.reim(x);
					const { re: y0, im: y1 } = Fp2.reim(y);
					return (0, utils_ts_1.concatBytes)((0, utils_ts_1.numberToBytesBE)(x1, len), (0, utils_ts_1.numberToBytesBE)(x0, len), (0, utils_ts_1.numberToBytesBE)(y1, len), (0, utils_ts_1.numberToBytesBE)(y0, len));
				}
			},
			Signature: {
				fromHex(hex) {
					const { infinity, sort, value } = parseMask((0, utils_ts_1.ensureBytes)("signatureHex", hex));
					const P = Fp.ORDER;
					const half = value.length / 2;
					if (half !== 48 && half !== 96) throw new Error("invalid compressed signature length, must be 96 or 192");
					const z1 = (0, utils_ts_1.bytesToNumberBE)(value.slice(0, half));
					const z2 = (0, utils_ts_1.bytesToNumberBE)(value.slice(half));
					if (infinity) return exports.bls12_381.G2.ProjectivePoint.ZERO;
					const x1 = Fp.create(z1 & Fp.MASK);
					const x2 = Fp.create(z2);
					const x = Fp2.create({
						c0: x2,
						c1: x1
					});
					const y2 = Fp2.add(Fp2.pow(x, _3n), exports.bls12_381.params.G2b);
					let y = Fp2.sqrt(y2);
					if (!y) throw new Error("Failed to find a square root");
					const { re: y0, im: y1 } = Fp2.reim(y);
					const aflag1 = BigInt(sort);
					const isGreater = y1 > _0n && y1 * _2n / P !== aflag1;
					const isZero = y1 === _0n && y0 * _2n / P !== aflag1;
					if (isGreater || isZero) y = Fp2.neg(y);
					const point = exports.bls12_381.G2.ProjectivePoint.fromAffine({
						x,
						y
					});
					point.assertValidity();
					return point;
				},
				toRawBytes(point) {
					return signatureG2ToRawBytes(point);
				},
				toHex(point) {
					return (0, utils_ts_1.bytesToHex)(signatureG2ToRawBytes(point));
				}
			}
		},
		params: {
			ateLoopSize: BLS_X,
			r: Fr.ORDER,
			xNegative: true,
			twistType: "multiplicative"
		},
		htfDefaults,
		hash: sha2_1.sha256,
		randomBytes: utils_1.randomBytes
	});
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/edwards.js
var require_edwards$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.twistedEdwards = twistedEdwards;
	/**
	* Twisted Edwards curve. The formula is: ax² + y² = 1 + dx²y².
	* For design rationale of types / exports, see weierstrass module documentation.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var curve_ts_1 = require_curve$2();
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _8n = BigInt(8);
	var VERIFY_DEFAULT = { zip215: true };
	function validateOpts(curve) {
		const opts = (0, curve_ts_1.validateBasic)(curve);
		(0, utils_ts_1.validateObject)(curve, {
			hash: "function",
			a: "bigint",
			d: "bigint",
			randomBytes: "function"
		}, {
			adjustScalarBytes: "function",
			domain: "function",
			uvRatio: "function",
			mapToCurve: "function"
		});
		return Object.freeze({ ...opts });
	}
	/**
	* Creates Twisted Edwards curve with EdDSA signatures.
	* @example
	* import { Field } from '@noble/curves/abstract/modular';
	* // Before that, define BigInt-s: a, d, p, n, Gx, Gy, h
	* const curve = twistedEdwards({ a, d, Fp: Field(p), n, Gx, Gy, h })
	*/
	function twistedEdwards(curveDef) {
		const CURVE = validateOpts(curveDef);
		const { Fp, n: CURVE_ORDER, prehash, hash: cHash, randomBytes, nByteLength, h: cofactor } = CURVE;
		const MASK = _2n << BigInt(nByteLength * 8) - _1n;
		const modP = Fp.create;
		const Fn = (0, modular_ts_1.Field)(CURVE.n, CURVE.nBitLength);
		function isEdValidXY(x, y) {
			const x2 = Fp.sqr(x);
			const y2 = Fp.sqr(y);
			const left = Fp.add(Fp.mul(CURVE.a, x2), y2);
			const right = Fp.add(Fp.ONE, Fp.mul(CURVE.d, Fp.mul(x2, y2)));
			return Fp.eql(left, right);
		}
		if (!isEdValidXY(CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		const uvRatio = CURVE.uvRatio || ((u, v) => {
			try {
				return {
					isValid: true,
					value: Fp.sqrt(u * Fp.inv(v))
				};
			} catch (e) {
				return {
					isValid: false,
					value: _0n
				};
			}
		});
		const adjustScalarBytes = CURVE.adjustScalarBytes || ((bytes) => bytes);
		const domain = CURVE.domain || ((data, ctx, phflag) => {
			(0, utils_ts_1.abool)("phflag", phflag);
			if (ctx.length || phflag) throw new Error("Contexts/pre-hash are not supported");
			return data;
		});
		function aCoordinate(title, n, banZero = false) {
			const min = banZero ? _1n : _0n;
			(0, utils_ts_1.aInRange)("coordinate " + title, n, min, MASK);
		}
		function aextpoint(other) {
			if (!(other instanceof Point)) throw new Error("ExtendedPoint expected");
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { ex: x, ey: y, ez: z } = p;
			const is0 = p.is0();
			if (iz == null) iz = is0 ? _8n : Fp.inv(z);
			const ax = modP(x * iz);
			const ay = modP(y * iz);
			const zz = modP(z * iz);
			if (is0) return {
				x: _0n,
				y: _1n
			};
			if (zz !== _1n) throw new Error("invZ was invalid");
			return {
				x: ax,
				y: ay
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			const { a, d } = CURVE;
			if (p.is0()) throw new Error("bad point: ZERO");
			const { ex: X, ey: Y, ez: Z, et: T } = p;
			const X2 = modP(X * X);
			const Y2 = modP(Y * Y);
			const Z2 = modP(Z * Z);
			const Z4 = modP(Z2 * Z2);
			const aX2 = modP(X2 * a);
			if (modP(Z2 * modP(aX2 + Y2)) !== modP(Z4 + modP(d * modP(X2 * Y2)))) throw new Error("bad point: equation left != right (1)");
			if (modP(X * Y) !== modP(Z * T)) throw new Error("bad point: equation left != right (2)");
			return true;
		});
		class Point {
			constructor(ex, ey, ez, et) {
				aCoordinate("x", ex);
				aCoordinate("y", ey);
				aCoordinate("z", ez, true);
				aCoordinate("t", et);
				this.ex = ex;
				this.ey = ey;
				this.ez = ez;
				this.et = et;
				Object.freeze(this);
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			static fromAffine(p) {
				if (p instanceof Point) throw new Error("extended point not allowed");
				const { x, y } = p || {};
				aCoordinate("x", x);
				aCoordinate("y", y);
				return new Point(x, y, _1n, modP(x * y));
			}
			static normalizeZ(points) {
				const toInv = (0, modular_ts_1.FpInvertBatch)(Fp, points.map((p) => p.ez));
				return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			_setWindowSize(windowSize) {
				wnaf.setWindowSize(this, windowSize);
			}
			assertValidity() {
				assertValidMemo(this);
			}
			equals(other) {
				aextpoint(other);
				const { ex: X1, ey: Y1, ez: Z1 } = this;
				const { ex: X2, ey: Y2, ez: Z2 } = other;
				const X1Z2 = modP(X1 * Z2);
				const X2Z1 = modP(X2 * Z1);
				const Y1Z2 = modP(Y1 * Z2);
				const Y2Z1 = modP(Y2 * Z1);
				return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			negate() {
				return new Point(modP(-this.ex), this.ey, this.ez, modP(-this.et));
			}
			double() {
				const { a } = CURVE;
				const { ex: X1, ey: Y1, ez: Z1 } = this;
				const A = modP(X1 * X1);
				const B = modP(Y1 * Y1);
				const C = modP(_2n * modP(Z1 * Z1));
				const D = modP(a * A);
				const x1y1 = X1 + Y1;
				const E = modP(modP(x1y1 * x1y1) - A - B);
				const G = D + B;
				const F = G - C;
				const H = D - B;
				const X3 = modP(E * F);
				const Y3 = modP(G * H);
				const T3 = modP(E * H);
				const Z3 = modP(F * G);
				return new Point(X3, Y3, Z3, T3);
			}
			add(other) {
				aextpoint(other);
				const { a, d } = CURVE;
				const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;
				const { ex: X2, ey: Y2, ez: Z2, et: T2 } = other;
				const A = modP(X1 * X2);
				const B = modP(Y1 * Y2);
				const C = modP(T1 * d * T2);
				const D = modP(Z1 * Z2);
				const E = modP((X1 + Y1) * (X2 + Y2) - A - B);
				const F = D - C;
				const G = D + C;
				const H = modP(B - a * A);
				const X3 = modP(E * F);
				const Y3 = modP(G * H);
				const T3 = modP(E * H);
				const Z3 = modP(F * G);
				return new Point(X3, Y3, Z3, T3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			wNAF(n) {
				return wnaf.wNAFCached(this, n, Point.normalizeZ);
			}
			multiply(scalar) {
				const n = scalar;
				(0, utils_ts_1.aInRange)("scalar", n, _1n, CURVE_ORDER);
				const { p, f } = this.wNAF(n);
				return Point.normalizeZ([p, f])[0];
			}
			multiplyUnsafe(scalar, acc = Point.ZERO) {
				const n = scalar;
				(0, utils_ts_1.aInRange)("scalar", n, _0n, CURVE_ORDER);
				if (n === _0n) return I;
				if (this.is0() || n === _1n) return this;
				return wnaf.wNAFCachedUnsafe(this, n, Point.normalizeZ, acc);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			isTorsionFree() {
				return wnaf.unsafeLadder(this, CURVE_ORDER).is0();
			}
			toAffine(iz) {
				return toAffineMemo(this, iz);
			}
			clearCofactor() {
				const { h: cofactor } = CURVE;
				if (cofactor === _1n) return this;
				return this.multiplyUnsafe(cofactor);
			}
			static fromHex(hex, zip215 = false) {
				const { d, a } = CURVE;
				const len = Fp.BYTES;
				hex = (0, utils_ts_1.ensureBytes)("pointHex", hex, len);
				(0, utils_ts_1.abool)("zip215", zip215);
				const normed = hex.slice();
				const lastByte = hex[len - 1];
				normed[len - 1] = lastByte & -129;
				const y = (0, utils_ts_1.bytesToNumberLE)(normed);
				const max = zip215 ? MASK : Fp.ORDER;
				(0, utils_ts_1.aInRange)("pointHex.y", y, _0n, max);
				const y2 = modP(y * y);
				const u = modP(y2 - _1n);
				const v = modP(d * y2 - a);
				let { isValid, value: x } = uvRatio(u, v);
				if (!isValid) throw new Error("Point.fromHex: invalid y coordinate");
				const isXOdd = (x & _1n) === _1n;
				const isLastByteOdd = (lastByte & 128) !== 0;
				if (!zip215 && x === _0n && isLastByteOdd) throw new Error("Point.fromHex: x=0 and x_0=1");
				if (isLastByteOdd !== isXOdd) x = modP(-x);
				return Point.fromAffine({
					x,
					y
				});
			}
			static fromPrivateKey(privKey) {
				const { scalar } = getPrivateScalar(privKey);
				return G.multiply(scalar);
			}
			toRawBytes() {
				const { x, y } = this.toAffine();
				const bytes = (0, utils_ts_1.numberToBytesLE)(y, Fp.BYTES);
				bytes[bytes.length - 1] |= x & _1n ? 128 : 0;
				return bytes;
			}
			toHex() {
				return (0, utils_ts_1.bytesToHex)(this.toRawBytes());
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n, modP(CURVE.Gx * CURVE.Gy));
		Point.ZERO = new Point(_0n, _1n, _1n, _0n);
		const { BASE: G, ZERO: I } = Point;
		const wnaf = (0, curve_ts_1.wNAF)(Point, nByteLength * 8);
		function modN(a) {
			return (0, modular_ts_1.mod)(a, CURVE_ORDER);
		}
		function modN_LE(hash) {
			return modN((0, utils_ts_1.bytesToNumberLE)(hash));
		}
		function getPrivateScalar(key) {
			const len = Fp.BYTES;
			key = (0, utils_ts_1.ensureBytes)("private key", key, len);
			const hashed = (0, utils_ts_1.ensureBytes)("hashed private key", cHash(key), 2 * len);
			const head = adjustScalarBytes(hashed.slice(0, len));
			return {
				head,
				prefix: hashed.slice(len, 2 * len),
				scalar: modN_LE(head)
			};
		}
		function getExtendedPublicKey(key) {
			const { head, prefix, scalar } = getPrivateScalar(key);
			const point = G.multiply(scalar);
			return {
				head,
				prefix,
				scalar,
				point,
				pointBytes: point.toRawBytes()
			};
		}
		function getPublicKey(privKey) {
			return getExtendedPublicKey(privKey).pointBytes;
		}
		function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
			const msg = (0, utils_ts_1.concatBytes)(...msgs);
			return modN_LE(cHash(domain(msg, (0, utils_ts_1.ensureBytes)("context", context), !!prehash)));
		}
		/** Signs message with privateKey. RFC8032 5.1.6 */
		function sign(msg, privKey, options = {}) {
			msg = (0, utils_ts_1.ensureBytes)("message", msg);
			if (prehash) msg = prehash(msg);
			const { prefix, scalar, pointBytes } = getExtendedPublicKey(privKey);
			const r = hashDomainToScalar(options.context, prefix, msg);
			const R = G.multiply(r).toRawBytes();
			const s = modN(r + hashDomainToScalar(options.context, R, pointBytes, msg) * scalar);
			(0, utils_ts_1.aInRange)("signature.s", s, _0n, CURVE_ORDER);
			const res = (0, utils_ts_1.concatBytes)(R, (0, utils_ts_1.numberToBytesLE)(s, Fp.BYTES));
			return (0, utils_ts_1.ensureBytes)("result", res, Fp.BYTES * 2);
		}
		const verifyOpts = VERIFY_DEFAULT;
		/**
		* Verifies EdDSA signature against message and public key. RFC8032 5.1.7.
		* An extended group equation is checked.
		*/
		function verify(sig, msg, publicKey, options = verifyOpts) {
			const { context, zip215 } = options;
			const len = Fp.BYTES;
			sig = (0, utils_ts_1.ensureBytes)("signature", sig, 2 * len);
			msg = (0, utils_ts_1.ensureBytes)("message", msg);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, len);
			if (zip215 !== void 0) (0, utils_ts_1.abool)("zip215", zip215);
			if (prehash) msg = prehash(msg);
			const s = (0, utils_ts_1.bytesToNumberLE)(sig.slice(len, 2 * len));
			let A, R, SB;
			try {
				A = Point.fromHex(publicKey, zip215);
				R = Point.fromHex(sig.slice(0, len), zip215);
				SB = G.multiplyUnsafe(s);
			} catch (error) {
				return false;
			}
			if (!zip215 && A.isSmallOrder()) return false;
			const k = hashDomainToScalar(context, R.toRawBytes(), A.toRawBytes(), msg);
			return R.add(A.multiplyUnsafe(k)).subtract(SB).clearCofactor().equals(Point.ZERO);
		}
		G._setWindowSize(8);
		return {
			CURVE,
			getPublicKey,
			sign,
			verify,
			ExtendedPoint: Point,
			utils: {
				getExtendedPublicKey,
				/** ed25519 priv keys are uniform 32b. No need to check for modulo bias, like in secp256k1. */
				randomPrivateKey: () => randomBytes(Fp.BYTES),
				/**
				* We're doing scalar multiplication (used in getPublicKey etc) with precomputed BASE_POINT
				* values. This slows down first getPublicKey() by milliseconds (see Speed section),
				* but allows to speed-up subsequent getPublicKey() calls up to 20x.
				* @param windowSize 2, 4, 8, 16
				*/
				precompute(windowSize = 8, point = Point.BASE) {
					point._setWindowSize(windowSize);
					point.multiply(BigInt(3));
					return point;
				}
			}
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/abstract/montgomery.js
var require_montgomery$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.montgomery = montgomery;
	/**
	* Montgomery curve methods. It's not really whole montgomery curve,
	* just bunch of very specific methods for X25519 / X448 from
	* [RFC 7748](https://www.rfc-editor.org/rfc/rfc7748)
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var modular_ts_1 = require_modular$2();
	var utils_ts_1 = require_utils$3();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	function validateOpts(curve) {
		(0, utils_ts_1.validateObject)(curve, {
			adjustScalarBytes: "function",
			powPminus2: "function"
		});
		return Object.freeze({ ...curve });
	}
	function montgomery(curveDef) {
		const CURVE = validateOpts(curveDef);
		const { P, type, adjustScalarBytes, powPminus2 } = CURVE;
		const is25519 = type === "x25519";
		if (!is25519 && type !== "x448") throw new Error("invalid type");
		const montgomeryBits = is25519 ? 255 : 448;
		const fieldLen = is25519 ? 32 : 56;
		const Gu = is25519 ? BigInt(9) : BigInt(5);
		const a24 = is25519 ? BigInt(121665) : BigInt(39081);
		const minScalar = is25519 ? _2n ** BigInt(254) : _2n ** BigInt(447);
		const maxScalar = minScalar + (is25519 ? BigInt(8) * _2n ** BigInt(251) - _1n : BigInt(4) * _2n ** BigInt(445) - _1n) + _1n;
		const modP = (n) => (0, modular_ts_1.mod)(n, P);
		const GuBytes = encodeU(Gu);
		function encodeU(u) {
			return (0, utils_ts_1.numberToBytesLE)(modP(u), fieldLen);
		}
		function decodeU(u) {
			const _u = (0, utils_ts_1.ensureBytes)("u coordinate", u, fieldLen);
			if (is25519) _u[31] &= 127;
			return modP((0, utils_ts_1.bytesToNumberLE)(_u));
		}
		function decodeScalar(scalar) {
			return (0, utils_ts_1.bytesToNumberLE)(adjustScalarBytes((0, utils_ts_1.ensureBytes)("scalar", scalar, fieldLen)));
		}
		function scalarMult(scalar, u) {
			const pu = montgomeryLadder(decodeU(u), decodeScalar(scalar));
			if (pu === _0n) throw new Error("invalid private or public key received");
			return encodeU(pu);
		}
		function scalarMultBase(scalar) {
			return scalarMult(scalar, GuBytes);
		}
		function cswap(swap, x_2, x_3) {
			const dummy = modP(swap * (x_2 - x_3));
			x_2 = modP(x_2 - dummy);
			x_3 = modP(x_3 + dummy);
			return {
				x_2,
				x_3
			};
		}
		/**
		* Montgomery x-only multiplication ladder.
		* @param pointU u coordinate (x) on Montgomery Curve 25519
		* @param scalar by which the point would be multiplied
		* @returns new Point on Montgomery curve
		*/
		function montgomeryLadder(u, scalar) {
			(0, utils_ts_1.aInRange)("u", u, _0n, P);
			(0, utils_ts_1.aInRange)("scalar", scalar, minScalar, maxScalar);
			const k = scalar;
			const x_1 = u;
			let x_2 = _1n;
			let z_2 = _0n;
			let x_3 = u;
			let z_3 = _1n;
			let swap = _0n;
			for (let t = BigInt(montgomeryBits - 1); t >= _0n; t--) {
				const k_t = k >> t & _1n;
				swap ^= k_t;
				({x_2, x_3} = cswap(swap, x_2, x_3));
				({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
				swap = k_t;
				const A = x_2 + z_2;
				const AA = modP(A * A);
				const B = x_2 - z_2;
				const BB = modP(B * B);
				const E = AA - BB;
				const C = x_3 + z_3;
				const D = x_3 - z_3;
				const DA = modP(D * A);
				const CB = modP(C * B);
				const dacb = DA + CB;
				const da_cb = DA - CB;
				x_3 = modP(dacb * dacb);
				z_3 = modP(x_1 * modP(da_cb * da_cb));
				x_2 = modP(AA * BB);
				z_2 = modP(E * (AA + modP(a24 * E)));
			}
			({x_2, x_3} = cswap(swap, x_2, x_3));
			({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
			const z2 = powPminus2(z_2);
			return modP(x_2 * z2);
		}
		return {
			scalarMult,
			scalarMultBase,
			getSharedSecret: (privateKey, publicKey) => scalarMult(privateKey, publicKey),
			getPublicKey: (privateKey) => scalarMultBase(privateKey),
			utils: { randomPrivateKey: () => CURVE.randomBytes(fieldLen) },
			GuBytes: GuBytes.slice()
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/ed25519.js
var require_ed25519$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hash_to_ristretto255 = exports.hashToRistretto255 = exports.RistrettoPoint = exports.encodeToCurve = exports.hashToCurve = exports.ed25519_hasher = exports.edwardsToMontgomery = exports.x25519 = exports.ed25519ph = exports.ed25519ctx = exports.ed25519 = exports.ED25519_TORSION_SUBGROUP = void 0;
	exports.edwardsToMontgomeryPub = edwardsToMontgomeryPub;
	exports.edwardsToMontgomeryPriv = edwardsToMontgomeryPriv;
	/**
	* ed25519 Twisted Edwards curve with following addons:
	* - X25519 ECDH
	* - Ristretto cofactor elimination
	* - Elligator hash-to-group / point indistinguishability
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_1 = require_sha2$2();
	var utils_1 = require_utils$4();
	var curve_ts_1 = require_curve$2();
	var edwards_ts_1 = require_edwards$1();
	var hash_to_curve_ts_1 = require_hash_to_curve$2();
	var modular_ts_1 = require_modular$2();
	var montgomery_ts_1 = require_montgomery$1();
	var utils_ts_1 = require_utils$3();
	var ED25519_P = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819949");
	var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	var _5n = BigInt(5);
	var _8n = BigInt(8);
	function ed25519_pow_2_252_3(x) {
		const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
		const P = ED25519_P;
		const b2 = x * x % P * x % P;
		const b4 = (0, modular_ts_1.pow2)(b2, _2n, P) * b2 % P;
		const b5 = (0, modular_ts_1.pow2)(b4, _1n, P) * x % P;
		const b10 = (0, modular_ts_1.pow2)(b5, _5n, P) * b5 % P;
		const b20 = (0, modular_ts_1.pow2)(b10, _10n, P) * b10 % P;
		const b40 = (0, modular_ts_1.pow2)(b20, _20n, P) * b20 % P;
		const b80 = (0, modular_ts_1.pow2)(b40, _40n, P) * b40 % P;
		const b160 = (0, modular_ts_1.pow2)(b80, _80n, P) * b80 % P;
		const b240 = (0, modular_ts_1.pow2)(b160, _80n, P) * b80 % P;
		const b250 = (0, modular_ts_1.pow2)(b240, _10n, P) * b10 % P;
		return {
			pow_p_5_8: (0, modular_ts_1.pow2)(b250, _2n, P) * x % P,
			b2
		};
	}
	function adjustScalarBytes(bytes) {
		bytes[0] &= 248;
		bytes[31] &= 127;
		bytes[31] |= 64;
		return bytes;
	}
	function uvRatio(u, v) {
		const P = ED25519_P;
		const v3 = (0, modular_ts_1.mod)(v * v * v, P);
		const pow = ed25519_pow_2_252_3(u * (0, modular_ts_1.mod)(v3 * v3 * v, P)).pow_p_5_8;
		let x = (0, modular_ts_1.mod)(u * v3 * pow, P);
		const vx2 = (0, modular_ts_1.mod)(v * x * x, P);
		const root1 = x;
		const root2 = (0, modular_ts_1.mod)(x * ED25519_SQRT_M1, P);
		const useRoot1 = vx2 === u;
		const useRoot2 = vx2 === (0, modular_ts_1.mod)(-u, P);
		const noRoot = vx2 === (0, modular_ts_1.mod)(-u * ED25519_SQRT_M1, P);
		if (useRoot1) x = root1;
		if (useRoot2 || noRoot) x = root2;
		if ((0, modular_ts_1.isNegativeLE)(x, P)) x = (0, modular_ts_1.mod)(-x, P);
		return {
			isValid: useRoot1 || useRoot2,
			value: x
		};
	}
	/** Weird / bogus points, useful for debugging. */
	exports.ED25519_TORSION_SUBGROUP = [
		"0100000000000000000000000000000000000000000000000000000000000000",
		"c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a",
		"0000000000000000000000000000000000000000000000000000000000000080",
		"26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05",
		"ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
		"26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85",
		"0000000000000000000000000000000000000000000000000000000000000000",
		"c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa"
	];
	var Fp = /* @__PURE__ */ (() => (0, modular_ts_1.Field)(ED25519_P, void 0, true))();
	var ed25519Defaults = /* @__PURE__ */ (() => ({
		a: Fp.create(BigInt(-1)),
		d: BigInt("37095705934669439343138083508754565189542113879843219016388785533085940283555"),
		Fp,
		n: BigInt("7237005577332262213973186563042994240857116359379907606001950938285454250989"),
		h: _8n,
		Gx: BigInt("15112221349535400772501151409588531511454012693041857206046113283949847762202"),
		Gy: BigInt("46316835694926478169428394003475163141307993866256225615783033603165251855960"),
		hash: sha2_1.sha512,
		randomBytes: utils_1.randomBytes,
		adjustScalarBytes,
		uvRatio
	}))();
	/**
	* ed25519 curve with EdDSA signatures.
	* @example
	* import { ed25519 } from '@noble/curves/ed25519';
	* const priv = ed25519.utils.randomPrivateKey();
	* const pub = ed25519.getPublicKey(priv);
	* const msg = new TextEncoder().encode('hello');
	* const sig = ed25519.sign(msg, priv);
	* ed25519.verify(sig, msg, pub); // Default mode: follows ZIP215
	* ed25519.verify(sig, msg, pub, { zip215: false }); // RFC8032 / FIPS 186-5
	*/
	exports.ed25519 = (() => (0, edwards_ts_1.twistedEdwards)(ed25519Defaults))();
	function ed25519_domain(data, ctx, phflag) {
		if (ctx.length > 255) throw new Error("Context is too big");
		return (0, utils_1.concatBytes)((0, utils_1.utf8ToBytes)("SigEd25519 no Ed25519 collisions"), new Uint8Array([phflag ? 1 : 0, ctx.length]), ctx, data);
	}
	exports.ed25519ctx = (() => (0, edwards_ts_1.twistedEdwards)({
		...ed25519Defaults,
		domain: ed25519_domain
	}))();
	exports.ed25519ph = (() => (0, edwards_ts_1.twistedEdwards)(Object.assign({}, ed25519Defaults, {
		domain: ed25519_domain,
		prehash: sha2_1.sha512
	})))();
	/**
	* ECDH using curve25519 aka x25519.
	* @example
	* import { x25519 } from '@noble/curves/ed25519';
	* const priv = 'a546e36bf0527c9d3b16154b82465edd62144c0ac1fc5a18506a2244ba449ac4';
	* const pub = 'e6db6867583030db3594c1a424b15f7c726624ec26b3353b10a903a6d0ab1c4c';
	* x25519.getSharedSecret(priv, pub) === x25519.scalarMult(priv, pub); // aliases
	* x25519.getPublicKey(priv) === x25519.scalarMultBase(priv);
	* x25519.getPublicKey(x25519.utils.randomPrivateKey());
	*/
	exports.x25519 = (() => (0, montgomery_ts_1.montgomery)({
		P: ED25519_P,
		type: "x25519",
		powPminus2: (x) => {
			const P = ED25519_P;
			const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
			return (0, modular_ts_1.mod)((0, modular_ts_1.pow2)(pow_p_5_8, _3n, P) * b2, P);
		},
		adjustScalarBytes,
		randomBytes: utils_1.randomBytes
	}))();
	/**
	* Converts ed25519 public key to x25519 public key. Uses formula:
	* * `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
	* * `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
	* @example
	*   const someonesPub = ed25519.getPublicKey(ed25519.utils.randomPrivateKey());
	*   const aPriv = x25519.utils.randomPrivateKey();
	*   x25519.getSharedSecret(aPriv, edwardsToMontgomeryPub(someonesPub))
	*/
	function edwardsToMontgomeryPub(edwardsPub) {
		const { y } = exports.ed25519.ExtendedPoint.fromHex(edwardsPub);
		const _1n = BigInt(1);
		return Fp.toBytes(Fp.create((_1n + y) * Fp.inv(_1n - y)));
	}
	exports.edwardsToMontgomery = edwardsToMontgomeryPub;
	/**
	* Converts ed25519 secret key to x25519 secret key.
	* @example
	*   const someonesPub = x25519.getPublicKey(x25519.utils.randomPrivateKey());
	*   const aPriv = ed25519.utils.randomPrivateKey();
	*   x25519.getSharedSecret(edwardsToMontgomeryPriv(aPriv), someonesPub)
	*/
	function edwardsToMontgomeryPriv(edwardsPriv) {
		const hashed = ed25519Defaults.hash(edwardsPriv.subarray(0, 32));
		return ed25519Defaults.adjustScalarBytes(hashed).subarray(0, 32);
	}
	var ELL2_C1 = /* @__PURE__ */ (() => (Fp.ORDER + _3n) / _8n)();
	var ELL2_C2 = /* @__PURE__ */ (() => Fp.pow(_2n, ELL2_C1))();
	var ELL2_C3 = /* @__PURE__ */ (() => Fp.sqrt(Fp.neg(Fp.ONE)))();
	function map_to_curve_elligator2_curve25519(u) {
		const ELL2_C4 = (Fp.ORDER - _5n) / _8n;
		const ELL2_J = BigInt(486662);
		let tv1 = Fp.sqr(u);
		tv1 = Fp.mul(tv1, _2n);
		let xd = Fp.add(tv1, Fp.ONE);
		let x1n = Fp.neg(ELL2_J);
		let tv2 = Fp.sqr(xd);
		let gxd = Fp.mul(tv2, xd);
		let gx1 = Fp.mul(tv1, ELL2_J);
		gx1 = Fp.mul(gx1, x1n);
		gx1 = Fp.add(gx1, tv2);
		gx1 = Fp.mul(gx1, x1n);
		let tv3 = Fp.sqr(gxd);
		tv2 = Fp.sqr(tv3);
		tv3 = Fp.mul(tv3, gxd);
		tv3 = Fp.mul(tv3, gx1);
		tv2 = Fp.mul(tv2, tv3);
		let y11 = Fp.pow(tv2, ELL2_C4);
		y11 = Fp.mul(y11, tv3);
		let y12 = Fp.mul(y11, ELL2_C3);
		tv2 = Fp.sqr(y11);
		tv2 = Fp.mul(tv2, gxd);
		let e1 = Fp.eql(tv2, gx1);
		let y1 = Fp.cmov(y12, y11, e1);
		let x2n = Fp.mul(x1n, tv1);
		let y21 = Fp.mul(y11, u);
		y21 = Fp.mul(y21, ELL2_C2);
		let y22 = Fp.mul(y21, ELL2_C3);
		let gx2 = Fp.mul(gx1, tv1);
		tv2 = Fp.sqr(y21);
		tv2 = Fp.mul(tv2, gxd);
		let e2 = Fp.eql(tv2, gx2);
		let y2 = Fp.cmov(y22, y21, e2);
		tv2 = Fp.sqr(y1);
		tv2 = Fp.mul(tv2, gxd);
		let e3 = Fp.eql(tv2, gx1);
		let xn = Fp.cmov(x2n, x1n, e3);
		let y = Fp.cmov(y2, y1, e3);
		let e4 = Fp.isOdd(y);
		y = Fp.cmov(y, Fp.neg(y), e3 !== e4);
		return {
			xMn: xn,
			xMd: xd,
			yMn: y,
			yMd: _1n
		};
	}
	var ELL2_C1_EDWARDS = /* @__PURE__ */ (() => (0, modular_ts_1.FpSqrtEven)(Fp, Fp.neg(BigInt(486664))))();
	function map_to_curve_elligator2_edwards25519(u) {
		const { xMn, xMd, yMn, yMd } = map_to_curve_elligator2_curve25519(u);
		let xn = Fp.mul(xMn, yMd);
		xn = Fp.mul(xn, ELL2_C1_EDWARDS);
		let xd = Fp.mul(xMd, yMn);
		let yn = Fp.sub(xMn, xMd);
		let yd = Fp.add(xMn, xMd);
		let tv1 = Fp.mul(xd, yd);
		let e = Fp.eql(tv1, Fp.ZERO);
		xn = Fp.cmov(xn, Fp.ZERO, e);
		xd = Fp.cmov(xd, Fp.ONE, e);
		yn = Fp.cmov(yn, Fp.ONE, e);
		yd = Fp.cmov(yd, Fp.ONE, e);
		const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(Fp, [xd, yd], true);
		return {
			x: Fp.mul(xn, xd_inv),
			y: Fp.mul(yn, yd_inv)
		};
	}
	exports.ed25519_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.ed25519.ExtendedPoint, (scalars) => map_to_curve_elligator2_edwards25519(scalars[0]), {
		DST: "edwards25519_XMD:SHA-512_ELL2_RO_",
		encodeDST: "edwards25519_XMD:SHA-512_ELL2_NU_",
		p: Fp.ORDER,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_1.sha512
	}))();
	exports.hashToCurve = (() => exports.ed25519_hasher.hashToCurve)();
	exports.encodeToCurve = (() => exports.ed25519_hasher.encodeToCurve)();
	function aristp(other) {
		if (!(other instanceof RistPoint)) throw new Error("RistrettoPoint expected");
	}
	var SQRT_M1 = ED25519_SQRT_M1;
	var SQRT_AD_MINUS_ONE = /* @__PURE__ */ BigInt("25063068953384623474111414158702152701244531502492656460079210482610430750235");
	var INVSQRT_A_MINUS_D = /* @__PURE__ */ BigInt("54469307008909316920995813868745141605393597292927456921205312896311721017578");
	var ONE_MINUS_D_SQ = /* @__PURE__ */ BigInt("1159843021668779879193775521855586647937357759715417654439879720876111806838");
	var D_MINUS_ONE_SQ = /* @__PURE__ */ BigInt("40440834346308536858101042469323190826248399146238708352240133220865137265952");
	var invertSqrt = (number) => uvRatio(_1n, number);
	var MAX_255B = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
	var bytes255ToNumberLE = (bytes) => exports.ed25519.CURVE.Fp.create((0, utils_ts_1.bytesToNumberLE)(bytes) & MAX_255B);
	/**
	* Computes Elligator map for Ristretto255.
	* Described in [RFC9380](https://www.rfc-editor.org/rfc/rfc9380#appendix-B) and on
	* the [website](https://ristretto.group/formulas/elligator.html).
	*/
	function calcElligatorRistrettoMap(r0) {
		const { d } = exports.ed25519.CURVE;
		const P = exports.ed25519.CURVE.Fp.ORDER;
		const mod = exports.ed25519.CURVE.Fp.create;
		const r = mod(SQRT_M1 * r0 * r0);
		const Ns = mod((r + _1n) * ONE_MINUS_D_SQ);
		let c = BigInt(-1);
		const D = mod((c - d * r) * mod(r + d));
		let { isValid: Ns_D_is_sq, value: s } = uvRatio(Ns, D);
		let s_ = mod(s * r0);
		if (!(0, modular_ts_1.isNegativeLE)(s_, P)) s_ = mod(-s_);
		if (!Ns_D_is_sq) s = s_;
		if (!Ns_D_is_sq) c = r;
		const Nt = mod(c * (r - _1n) * D_MINUS_ONE_SQ - D);
		const s2 = s * s;
		const W0 = mod((s + s) * D);
		const W1 = mod(Nt * SQRT_AD_MINUS_ONE);
		const W2 = mod(_1n - s2);
		const W3 = mod(_1n + s2);
		return new exports.ed25519.ExtendedPoint(mod(W0 * W3), mod(W2 * W1), mod(W1 * W3), mod(W0 * W2));
	}
	/**
	* Each ed25519/ExtendedPoint has 8 different equivalent points. This can be
	* a source of bugs for protocols like ring signatures. Ristretto was created to solve this.
	* Ristretto point operates in X:Y:Z:T extended coordinates like ExtendedPoint,
	* but it should work in its own namespace: do not combine those two.
	* See [RFC9496](https://www.rfc-editor.org/rfc/rfc9496).
	*/
	var RistPoint = class RistPoint {
		constructor(ep) {
			this.ep = ep;
		}
		static fromAffine(ap) {
			return new RistPoint(exports.ed25519.ExtendedPoint.fromAffine(ap));
		}
		/**
		* Takes uniform output of 64-byte hash function like sha512 and converts it to `RistrettoPoint`.
		* The hash-to-group operation applies Elligator twice and adds the results.
		* **Note:** this is one-way map, there is no conversion from point to hash.
		* Described in [RFC9380](https://www.rfc-editor.org/rfc/rfc9380#appendix-B) and on
		* the [website](https://ristretto.group/formulas/elligator.html).
		* @param hex 64-byte output of a hash function
		*/
		static hashToCurve(hex) {
			hex = (0, utils_ts_1.ensureBytes)("ristrettoHash", hex, 64);
			const R1 = calcElligatorRistrettoMap(bytes255ToNumberLE(hex.slice(0, 32)));
			const R2 = calcElligatorRistrettoMap(bytes255ToNumberLE(hex.slice(32, 64)));
			return new RistPoint(R1.add(R2));
		}
		/**
		* Converts ristretto-encoded string to ristretto point.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-decode).
		* @param hex Ristretto-encoded 32 bytes. Not every 32-byte string is valid ristretto encoding
		*/
		static fromHex(hex) {
			hex = (0, utils_ts_1.ensureBytes)("ristrettoHex", hex, 32);
			const { a, d } = exports.ed25519.CURVE;
			const P = exports.ed25519.CURVE.Fp.ORDER;
			const mod = exports.ed25519.CURVE.Fp.create;
			const emsg = "RistrettoPoint.fromHex: the hex is not valid encoding of RistrettoPoint";
			const s = bytes255ToNumberLE(hex);
			if (!(0, utils_ts_1.equalBytes)((0, utils_ts_1.numberToBytesLE)(s, 32), hex) || (0, modular_ts_1.isNegativeLE)(s, P)) throw new Error(emsg);
			const s2 = mod(s * s);
			const u1 = mod(_1n + a * s2);
			const u2 = mod(_1n - a * s2);
			const u1_2 = mod(u1 * u1);
			const u2_2 = mod(u2 * u2);
			const v = mod(a * d * u1_2 - u2_2);
			const { isValid, value: I } = invertSqrt(mod(v * u2_2));
			const Dx = mod(I * u2);
			const Dy = mod(I * Dx * v);
			let x = mod((s + s) * Dx);
			if ((0, modular_ts_1.isNegativeLE)(x, P)) x = mod(-x);
			const y = mod(u1 * Dy);
			const t = mod(x * y);
			if (!isValid || (0, modular_ts_1.isNegativeLE)(t, P) || y === _0n) throw new Error(emsg);
			return new RistPoint(new exports.ed25519.ExtendedPoint(x, y, _1n, t));
		}
		static msm(points, scalars) {
			const Fn = (0, modular_ts_1.Field)(exports.ed25519.CURVE.n, exports.ed25519.CURVE.nBitLength);
			return (0, curve_ts_1.pippenger)(RistPoint, Fn, points, scalars);
		}
		/**
		* Encodes ristretto point to Uint8Array.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-encode).
		*/
		toRawBytes() {
			let { ex: x, ey: y, ez: z, et: t } = this.ep;
			const P = exports.ed25519.CURVE.Fp.ORDER;
			const mod = exports.ed25519.CURVE.Fp.create;
			const u1 = mod(mod(z + y) * mod(z - y));
			const u2 = mod(x * y);
			const { value: invsqrt } = invertSqrt(mod(u1 * mod(u2 * u2)));
			const D1 = mod(invsqrt * u1);
			const D2 = mod(invsqrt * u2);
			const zInv = mod(D1 * D2 * t);
			let D;
			if ((0, modular_ts_1.isNegativeLE)(t * zInv, P)) {
				let _x = mod(y * SQRT_M1);
				let _y = mod(x * SQRT_M1);
				x = _x;
				y = _y;
				D = mod(D1 * INVSQRT_A_MINUS_D);
			} else D = D2;
			if ((0, modular_ts_1.isNegativeLE)(x * zInv, P)) y = mod(-y);
			let s = mod((z - y) * D);
			if ((0, modular_ts_1.isNegativeLE)(s, P)) s = mod(-s);
			return (0, utils_ts_1.numberToBytesLE)(s, 32);
		}
		toHex() {
			return (0, utils_ts_1.bytesToHex)(this.toRawBytes());
		}
		toString() {
			return this.toHex();
		}
		/**
		* Compares two Ristretto points.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-equals).
		*/
		equals(other) {
			aristp(other);
			const { ex: X1, ey: Y1 } = this.ep;
			const { ex: X2, ey: Y2 } = other.ep;
			const mod = exports.ed25519.CURVE.Fp.create;
			const one = mod(X1 * Y2) === mod(Y1 * X2);
			const two = mod(Y1 * Y2) === mod(X1 * X2);
			return one || two;
		}
		add(other) {
			aristp(other);
			return new RistPoint(this.ep.add(other.ep));
		}
		subtract(other) {
			aristp(other);
			return new RistPoint(this.ep.subtract(other.ep));
		}
		multiply(scalar) {
			return new RistPoint(this.ep.multiply(scalar));
		}
		multiplyUnsafe(scalar) {
			return new RistPoint(this.ep.multiplyUnsafe(scalar));
		}
		double() {
			return new RistPoint(this.ep.double());
		}
		negate() {
			return new RistPoint(this.ep.negate());
		}
	};
	/**
	* Wrapper over Edwards Point for ristretto255 from
	* [RFC9496](https://www.rfc-editor.org/rfc/rfc9496).
	*/
	exports.RistrettoPoint = (() => {
		if (!RistPoint.BASE) RistPoint.BASE = new RistPoint(exports.ed25519.ExtendedPoint.BASE);
		if (!RistPoint.ZERO) RistPoint.ZERO = new RistPoint(exports.ed25519.ExtendedPoint.ZERO);
		return RistPoint;
	})();
	/**
	* hash-to-curve for ristretto255.
	* Described in [RFC9380](https://www.rfc-editor.org/rfc/rfc9380#appendix-B).
	*/
	var hashToRistretto255 = (msg, options) => {
		const d = options.DST;
		const DST = typeof d === "string" ? (0, utils_1.utf8ToBytes)(d) : d;
		const uniform_bytes = (0, hash_to_curve_ts_1.expand_message_xmd)(msg, DST, 64, sha2_1.sha512);
		return RistPoint.hashToCurve(uniform_bytes);
	};
	exports.hashToRistretto255 = hashToRistretto255;
	/** @deprecated */
	exports.hash_to_ristretto255 = exports.hashToRistretto255;
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/cryptoNode.js
var require_cryptoNode = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.crypto = void 0;
	/**
	* Internal webcrypto alias.
	* We prefer WebCrypto aka globalThis.crypto, which exists in node.js 16+.
	* Falls back to Node.js built-in crypto for Node.js <=v14.
	* See utils.ts for details.
	* @module
	*/
	var nc = __require("node:crypto");
	exports.crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && "randomBytes" in nc ? nc : void 0;
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/utils.js
var require_utils$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.Hash = exports.nextTick = exports.swap32IfBE = exports.byteSwapIfBE = exports.swap8IfBE = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.rotr = rotr;
	exports.rotl = rotl;
	exports.byteSwap = byteSwap;
	exports.byteSwap32 = byteSwap32;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.asyncLoop = asyncLoop;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.kdfInputToBytes = kdfInputToBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.createHasher = createHasher;
	exports.createOptHasher = createOptHasher;
	exports.createXOFer = createXOFer;
	exports.randomBytes = randomBytes;
	var crypto_1 = require_cryptoNode();
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is positive integer. */
	function anumber(n) {
		if (!Number.isSafeInteger(n) || n < 0) throw new Error("positive integer expected, got " + n);
	}
	/** Asserts something is Uint8Array. */
	function abytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Uint8Array expected");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
	}
	/** Asserts something is hash */
	function ahash(h) {
		if (typeof h !== "function" || typeof h.create !== "function") throw new Error("Hash should be wrapped by utils.createHasher");
		anumber(h.outputLen);
		anumber(h.blockLen);
	}
	/** Asserts a hash instance has not been destroyed / finished */
	function aexists(instance, checkFinished = true) {
		if (instance.destroyed) throw new Error("Hash instance has been destroyed");
		if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
	}
	/** Asserts output is properly-sized byte array */
	function aoutput(out, instance) {
		abytes(out);
		const min = instance.outputLen;
		if (out.length < min) throw new Error("digestInto() expects output buffer of length at least " + min);
	}
	/** Cast u8 / u16 / u32 to u8. */
	function u8(arr) {
		return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** Cast u8 / u16 / u32 to u32. */
	function u32(arr) {
		return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
	}
	/** Zeroize a byte array. Warning: JS provides no guarantees. */
	function clean(...arrays) {
		for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
	}
	/** Create DataView of an array for easy byte-level manipulation. */
	function createView(arr) {
		return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** The rotate right (circular right shift) operation for uint32 */
	function rotr(word, shift) {
		return word << 32 - shift | word >>> shift;
	}
	/** The rotate left (circular left shift) operation for uint32 */
	function rotl(word, shift) {
		return word << shift | word >>> 32 - shift >>> 0;
	}
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
	/** The byte swap operation for uint32 */
	function byteSwap(word) {
		return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
	}
	/** Conditionally byte swap if on a big-endian platform */
	exports.swap8IfBE = exports.isLE ? (n) => n : (n) => byteSwap(n);
	/** @deprecated */
	exports.byteSwapIfBE = exports.swap8IfBE;
	/** In place byte swap for Uint32Array */
	function byteSwap32(arr) {
		for (let i = 0; i < arr.length; i++) arr[i] = byteSwap(arr[i]);
		return arr;
	}
	exports.swap32IfBE = exports.isLE ? (u) => u : byteSwap32;
	var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Convert byte array to hex string. Uses built-in function, when available.
	* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
	*/
	function bytesToHex(bytes) {
		abytes(bytes);
		if (hasHexBuiltin) return bytes.toHex();
		let hex = "";
		for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
		return hex;
	}
	var asciis = {
		_0: 48,
		_9: 57,
		A: 65,
		F: 70,
		a: 97,
		f: 102
	};
	function asciiToBase16(ch) {
		if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
		if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
		if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
	}
	/**
	* Convert hex string to byte array. Uses built-in function, when available.
	* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
	*/
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		if (hasHexBuiltin) return Uint8Array.fromHex(hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	/**
	* There is no setImmediate in browser and setTimeout is slow.
	* Call of async fn will return Promise, which will be fullfiled only on
	* next scheduler queue processing step and this is exactly what we need.
	*/
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/** Returns control to thread each 'tick' ms to avoid blocking. */
	async function asyncLoop(iters, tick, cb) {
		let ts = Date.now();
		for (let i = 0; i < iters; i++) {
			cb(i);
			const diff = Date.now() - ts;
			if (diff >= 0 && diff < tick) continue;
			await (0, exports.nextTick)();
			ts += diff;
		}
	}
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // Uint8Array.from([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	function bytesToUtf8(bytes) {
		return new TextDecoder().decode(bytes);
	}
	/**
	* Normalizes (non-hex) string or Uint8Array to Uint8Array.
	* Warning: when Uint8Array is passed, it would NOT get copied.
	* Keep in mind for future mutable operations.
	*/
	function toBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/**
	* Helper for KDFs: consumes uint8array or string.
	* When string is passed, does utf8 decoding, using TextDecoder.
	*/
	function kdfInputToBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/** Copies several Uint8Arrays into one. */
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			abytes(a);
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	function checkOpts(defaults, opts) {
		if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]") throw new Error("options should be object or undefined");
		return Object.assign(defaults, opts);
	}
	/** For runtime check if class implements interface */
	var Hash = class {};
	exports.Hash = Hash;
	/** Wraps hash function, creating an interface on top of it */
	function createHasher(hashCons) {
		const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
		const tmp = hashCons();
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = () => hashCons();
		return hashC;
	}
	function createOptHasher(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	function createXOFer(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	exports.wrapConstructor = createHasher;
	exports.wrapConstructorWithOpts = createOptHasher;
	exports.wrapXOFConstructorWithOpts = createXOFer;
	/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
	function randomBytes(bytesLength = 32) {
		if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
		if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
		throw new Error("crypto.getRandomValues must be defined");
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.notImplemented = exports.bitMask = exports.utf8ToBytes = exports.randomBytes = exports.isBytes = exports.hexToBytes = exports.concatBytes = exports.bytesToUtf8 = exports.bytesToHex = exports.anumber = exports.abytes = void 0;
	exports.abool = abool;
	exports._abool2 = _abool2;
	exports._abytes2 = _abytes2;
	exports.numberToHexUnpadded = numberToHexUnpadded;
	exports.hexToNumber = hexToNumber;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.bytesToNumberLE = bytesToNumberLE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.numberToBytesLE = numberToBytesLE;
	exports.numberToVarBytesBE = numberToVarBytesBE;
	exports.ensureBytes = ensureBytes;
	exports.equalBytes = equalBytes;
	exports.copyBytes = copyBytes;
	exports.asciiToBytes = asciiToBytes;
	exports.inRange = inRange;
	exports.aInRange = aInRange;
	exports.bitLen = bitLen;
	exports.bitGet = bitGet;
	exports.bitSet = bitSet;
	exports.createHmacDrbg = createHmacDrbg;
	exports.validateObject = validateObject;
	exports.isHash = isHash;
	exports._validateObject = _validateObject;
	exports.memoized = memoized;
	/**
	* Hex, bytes and number utilities.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_js_1 = require_utils$2();
	var utils_js_2 = require_utils$2();
	Object.defineProperty(exports, "abytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.abytes;
		}
	});
	Object.defineProperty(exports, "anumber", {
		enumerable: true,
		get: function() {
			return utils_js_2.anumber;
		}
	});
	Object.defineProperty(exports, "bytesToHex", {
		enumerable: true,
		get: function() {
			return utils_js_2.bytesToHex;
		}
	});
	Object.defineProperty(exports, "bytesToUtf8", {
		enumerable: true,
		get: function() {
			return utils_js_2.bytesToUtf8;
		}
	});
	Object.defineProperty(exports, "concatBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.concatBytes;
		}
	});
	Object.defineProperty(exports, "hexToBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.hexToBytes;
		}
	});
	Object.defineProperty(exports, "isBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.isBytes;
		}
	});
	Object.defineProperty(exports, "randomBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.randomBytes;
		}
	});
	Object.defineProperty(exports, "utf8ToBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.utf8ToBytes;
		}
	});
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = /* @__PURE__ */ BigInt(1);
	function abool(title, value) {
		if (typeof value !== "boolean") throw new Error(title + " boolean expected, got " + value);
	}
	function _abool2(value, title = "") {
		if (typeof value !== "boolean") {
			const prefix = title && `"${title}"`;
			throw new Error(prefix + "expected boolean, got type=" + typeof value);
		}
		return value;
	}
	/** Asserts something is Uint8Array. */
	function _abytes2(value, length, title = "") {
		const bytes = (0, utils_js_1.isBytes)(value);
		const len = value?.length;
		const needsLen = length !== void 0;
		if (!bytes || needsLen && len !== length) {
			const prefix = title && `"${title}" `;
			const ofLen = needsLen ? ` of length ${length}` : "";
			const got = bytes ? `length=${len}` : `type=${typeof value}`;
			throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
		}
		return value;
	}
	function numberToHexUnpadded(num) {
		const hex = num.toString(16);
		return hex.length & 1 ? "0" + hex : hex;
	}
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return hex === "" ? _0n : BigInt("0x" + hex);
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber((0, utils_js_1.bytesToHex)(bytes));
	}
	function bytesToNumberLE(bytes) {
		(0, utils_js_1.abytes)(bytes);
		return hexToNumber((0, utils_js_1.bytesToHex)(Uint8Array.from(bytes).reverse()));
	}
	function numberToBytesBE(n, len) {
		return (0, utils_js_1.hexToBytes)(n.toString(16).padStart(len * 2, "0"));
	}
	function numberToBytesLE(n, len) {
		return numberToBytesBE(n, len).reverse();
	}
	function numberToVarBytesBE(n) {
		return (0, utils_js_1.hexToBytes)(numberToHexUnpadded(n));
	}
	/**
	* Takes hex string or Uint8Array, converts to Uint8Array.
	* Validates output length.
	* Will throw error for other types.
	* @param title descriptive title for an error e.g. 'secret key'
	* @param hex hex string or Uint8Array
	* @param expectedLength optional, will compare to result array's length
	* @returns
	*/
	function ensureBytes(title, hex, expectedLength) {
		let res;
		if (typeof hex === "string") try {
			res = (0, utils_js_1.hexToBytes)(hex);
		} catch (e) {
			throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
		}
		else if ((0, utils_js_1.isBytes)(hex)) res = Uint8Array.from(hex);
		else throw new Error(title + " must be hex string or Uint8Array");
		const len = res.length;
		if (typeof expectedLength === "number" && len !== expectedLength) throw new Error(title + " of length " + expectedLength + " expected, got " + len);
		return res;
	}
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/**
	* Copies Uint8Array. We can't use u8a.slice(), because u8a can be Buffer,
	* and Buffer#slice creates mutable copy. Never use Buffers!
	*/
	function copyBytes(bytes) {
		return Uint8Array.from(bytes);
	}
	/**
	* Decodes 7-bit ASCII string to Uint8Array, throws on non-ascii symbols
	* Should be safe to use for things expected to be ASCII.
	* Returns exact same result as utf8ToBytes for ASCII or throws.
	*/
	function asciiToBytes(ascii) {
		return Uint8Array.from(ascii, (c, i) => {
			const charCode = c.charCodeAt(0);
			if (c.length !== 1 || charCode > 127) throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
			return charCode;
		});
	}
	/**
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
	function inRange(n, min, max) {
		return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
	}
	/**
	* Asserts min <= n < max. NOTE: It's < max and not <= max.
	* @example
	* aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
	*/
	function aInRange(title, n, min, max) {
		if (!inRange(n, min, max)) throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
	}
	/**
	* Calculates amount of bits in a bigint.
	* Same as `n.toString(2).length`
	* TODO: merge with nLength in modular
	*/
	function bitLen(n) {
		let len = 0;
		for (; n > _0n; n >>= _1n, len += 1);
		return len;
	}
	/**
	* Gets single bit at position.
	* NOTE: first bit position is 0 (same as arrays)
	* Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
	*/
	function bitGet(n, pos) {
		return n >> BigInt(pos) & _1n;
	}
	/**
	* Sets single bit at position.
	*/
	function bitSet(n, pos, value) {
		return n | (value ? _1n : _0n) << BigInt(pos);
	}
	/**
	* Calculate mask for N bits. Not using ** operator with bigints because of old engines.
	* Same as BigInt(`0b${Array(i).fill('1').join('')}`)
	*/
	var bitMask = (n) => (_1n << BigInt(n)) - _1n;
	exports.bitMask = bitMask;
	/**
	* Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
	* @returns function that will call DRBG until 2nd arg returns something meaningful
	* @example
	*   const drbg = createHmacDRBG<Key>(32, 32, hmac);
	*   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
	*/
	function createHmacDrbg(hashLen, qByteLen, hmacFn) {
		if (typeof hashLen !== "number" || hashLen < 2) throw new Error("hashLen must be a number");
		if (typeof qByteLen !== "number" || qByteLen < 2) throw new Error("qByteLen must be a number");
		if (typeof hmacFn !== "function") throw new Error("hmacFn must be a function");
		const u8n = (len) => new Uint8Array(len);
		const u8of = (byte) => Uint8Array.of(byte);
		let v = u8n(hashLen);
		let k = u8n(hashLen);
		let i = 0;
		const reset = () => {
			v.fill(1);
			k.fill(0);
			i = 0;
		};
		const h = (...b) => hmacFn(k, v, ...b);
		const reseed = (seed = u8n(0)) => {
			k = h(u8of(0), seed);
			v = h();
			if (seed.length === 0) return;
			k = h(u8of(1), seed);
			v = h();
		};
		const gen = () => {
			if (i++ >= 1e3) throw new Error("drbg: tried 1000 values");
			let len = 0;
			const out = [];
			while (len < qByteLen) {
				v = h();
				const sl = v.slice();
				out.push(sl);
				len += v.length;
			}
			return (0, utils_js_1.concatBytes)(...out);
		};
		const genUntil = (seed, pred) => {
			reset();
			reseed(seed);
			let res = void 0;
			while (!(res = pred(gen()))) reseed();
			reset();
			return res;
		};
		return genUntil;
	}
	var validatorFns = {
		bigint: (val) => typeof val === "bigint",
		function: (val) => typeof val === "function",
		boolean: (val) => typeof val === "boolean",
		string: (val) => typeof val === "string",
		stringOrUint8Array: (val) => typeof val === "string" || (0, utils_js_1.isBytes)(val),
		isSafeInteger: (val) => Number.isSafeInteger(val),
		array: (val) => Array.isArray(val),
		field: (val, object) => object.Fp.isValid(val),
		hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
	};
	function validateObject(object, validators, optValidators = {}) {
		const checkField = (fieldName, type, isOptional) => {
			const checkVal = validatorFns[type];
			if (typeof checkVal !== "function") throw new Error("invalid validator function");
			const val = object[fieldName];
			if (isOptional && val === void 0) return;
			if (!checkVal(val, object)) throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
		};
		for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);
		for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);
		return object;
	}
	function isHash(val) {
		return typeof val === "function" && Number.isSafeInteger(val.outputLen);
	}
	function _validateObject(object, fields, optFields = {}) {
		if (!object || typeof object !== "object") throw new Error("expected valid options object");
		function checkField(fieldName, expectedType, isOpt) {
			const val = object[fieldName];
			if (isOpt && val === void 0) return;
			const current = typeof val;
			if (current !== expectedType || val === null) throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
		}
		Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
		Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
	}
	/**
	* throws not implemented error
	*/
	var notImplemented = () => {
		throw new Error("not implemented");
	};
	exports.notImplemented = notImplemented;
	/**
	* Memoizes (caches) computation result.
	* Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
	*/
	function memoized(fn) {
		const map = /* @__PURE__ */ new WeakMap();
		return (arg, ...args) => {
			const val = map.get(arg);
			if (val !== void 0) return val;
			const computed = fn(arg, ...args);
			map.set(arg, computed);
			return computed;
		};
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/abstract/modular.js
var require_modular$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNegativeLE = void 0;
	exports.mod = mod;
	exports.pow = pow;
	exports.pow2 = pow2;
	exports.invert = invert;
	exports.tonelliShanks = tonelliShanks;
	exports.FpSqrt = FpSqrt;
	exports.validateField = validateField;
	exports.FpPow = FpPow;
	exports.FpInvertBatch = FpInvertBatch;
	exports.FpDiv = FpDiv;
	exports.FpLegendre = FpLegendre;
	exports.FpIsSquare = FpIsSquare;
	exports.nLength = nLength;
	exports.Field = Field;
	exports.FpSqrtOdd = FpSqrtOdd;
	exports.FpSqrtEven = FpSqrtEven;
	exports.hashToPrivateScalar = hashToPrivateScalar;
	exports.getFieldBytesLength = getFieldBytesLength;
	exports.getMinHashLength = getMinHashLength;
	exports.mapHashToField = mapHashToField;
	/**
	* Utils for modular division and fields.
	* Field over 11 is a finite (Galois) field is integer number operations `mod 11`.
	* There is no division: it is replaced by modular multiplicative inverse.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils$1();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = /* @__PURE__ */ BigInt(2);
	var _3n = /* @__PURE__ */ BigInt(3);
	var _4n = /* @__PURE__ */ BigInt(4);
	var _5n = /* @__PURE__ */ BigInt(5);
	var _7n = /* @__PURE__ */ BigInt(7);
	var _8n = /* @__PURE__ */ BigInt(8);
	var _9n = /* @__PURE__ */ BigInt(9);
	var _16n = /* @__PURE__ */ BigInt(16);
	function mod(a, b) {
		const result = a % b;
		return result >= _0n ? result : b + result;
	}
	/**
	* Efficiently raise num to power and do modular division.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	* @example
	* pow(2n, 6n, 11n) // 64n % 11n == 9n
	*/
	function pow(num, power, modulo) {
		return FpPow(Field(modulo), num, power);
	}
	/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
	function pow2(x, power, modulo) {
		let res = x;
		while (power-- > _0n) {
			res *= res;
			res %= modulo;
		}
		return res;
	}
	/**
	* Inverses number over modulo.
	* Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
	*/
	function invert(number, modulo) {
		if (number === _0n) throw new Error("invert: expected non-zero number");
		if (modulo <= _0n) throw new Error("invert: expected positive modulus, got " + modulo);
		let a = mod(number, modulo);
		let b = modulo;
		let x = _0n, y = _1n, u = _1n, v = _0n;
		while (a !== _0n) {
			const q = b / a;
			const r = b % a;
			const m = x - u * q;
			const n = y - v * q;
			b = a, a = r, x = u, y = v, u = m, v = n;
		}
		if (b !== _1n) throw new Error("invert: does not exist");
		return mod(x, modulo);
	}
	function assertIsSquare(Fp, root, n) {
		if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
	}
	function sqrt3mod4(Fp, n) {
		const p1div4 = (Fp.ORDER + _1n) / _4n;
		const root = Fp.pow(n, p1div4);
		assertIsSquare(Fp, root, n);
		return root;
	}
	function sqrt5mod8(Fp, n) {
		const p5div8 = (Fp.ORDER - _5n) / _8n;
		const n2 = Fp.mul(n, _2n);
		const v = Fp.pow(n2, p5div8);
		const nv = Fp.mul(n, v);
		const i = Fp.mul(Fp.mul(nv, _2n), v);
		const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
		assertIsSquare(Fp, root, n);
		return root;
	}
	function sqrt9mod16(P) {
		const Fp_ = Field(P);
		const tn = tonelliShanks(P);
		const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
		const c2 = tn(Fp_, c1);
		const c3 = tn(Fp_, Fp_.neg(c1));
		const c4 = (P + _7n) / _16n;
		return (Fp, n) => {
			let tv1 = Fp.pow(n, c4);
			let tv2 = Fp.mul(tv1, c1);
			const tv3 = Fp.mul(tv1, c2);
			const tv4 = Fp.mul(tv1, c3);
			const e1 = Fp.eql(Fp.sqr(tv2), n);
			const e2 = Fp.eql(Fp.sqr(tv3), n);
			tv1 = Fp.cmov(tv1, tv2, e1);
			tv2 = Fp.cmov(tv4, tv3, e2);
			const e3 = Fp.eql(Fp.sqr(tv2), n);
			const root = Fp.cmov(tv1, tv2, e3);
			assertIsSquare(Fp, root, n);
			return root;
		};
	}
	/**
	* Tonelli-Shanks square root search algorithm.
	* 1. https://eprint.iacr.org/2012/685.pdf (page 12)
	* 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
	* @param P field order
	* @returns function that takes field Fp (created from P) and number n
	*/
	function tonelliShanks(P) {
		if (P < _3n) throw new Error("sqrt is not defined for small field");
		let Q = P - _1n;
		let S = 0;
		while (Q % _2n === _0n) {
			Q /= _2n;
			S++;
		}
		let Z = _2n;
		const _Fp = Field(P);
		while (FpLegendre(_Fp, Z) === 1) if (Z++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
		if (S === 1) return sqrt3mod4;
		let cc = _Fp.pow(Z, Q);
		const Q1div2 = (Q + _1n) / _2n;
		return function tonelliSlow(Fp, n) {
			if (Fp.is0(n)) return n;
			if (FpLegendre(Fp, n) !== 1) throw new Error("Cannot find square root");
			let M = S;
			let c = Fp.mul(Fp.ONE, cc);
			let t = Fp.pow(n, Q);
			let R = Fp.pow(n, Q1div2);
			while (!Fp.eql(t, Fp.ONE)) {
				if (Fp.is0(t)) return Fp.ZERO;
				let i = 1;
				let t_tmp = Fp.sqr(t);
				while (!Fp.eql(t_tmp, Fp.ONE)) {
					i++;
					t_tmp = Fp.sqr(t_tmp);
					if (i === M) throw new Error("Cannot find square root");
				}
				const exponent = _1n << BigInt(M - i - 1);
				const b = Fp.pow(c, exponent);
				M = i;
				c = Fp.sqr(b);
				t = Fp.mul(t, c);
				R = Fp.mul(R, b);
			}
			return R;
		};
	}
	/**
	* Square root for a finite field. Will try optimized versions first:
	*
	* 1. P ≡ 3 (mod 4)
	* 2. P ≡ 5 (mod 8)
	* 3. P ≡ 9 (mod 16)
	* 4. Tonelli-Shanks algorithm
	*
	* Different algorithms can give different roots, it is up to user to decide which one they want.
	* For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
	*/
	function FpSqrt(P) {
		if (P % _4n === _3n) return sqrt3mod4;
		if (P % _8n === _5n) return sqrt5mod8;
		if (P % _16n === _9n) return sqrt9mod16(P);
		return tonelliShanks(P);
	}
	var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;
	exports.isNegativeLE = isNegativeLE;
	var FIELD_FIELDS = [
		"create",
		"isValid",
		"is0",
		"neg",
		"inv",
		"sqrt",
		"sqr",
		"eql",
		"add",
		"sub",
		"mul",
		"pow",
		"div",
		"addN",
		"subN",
		"mulN",
		"sqrN"
	];
	function validateField(field) {
		const opts = FIELD_FIELDS.reduce((map, val) => {
			map[val] = "function";
			return map;
		}, {
			ORDER: "bigint",
			MASK: "bigint",
			BYTES: "number",
			BITS: "number"
		});
		(0, utils_ts_1._validateObject)(field, opts);
		return field;
	}
	/**
	* Same as `pow` but for Fp: non-constant-time.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	*/
	function FpPow(Fp, num, power) {
		if (power < _0n) throw new Error("invalid exponent, negatives unsupported");
		if (power === _0n) return Fp.ONE;
		if (power === _1n) return num;
		let p = Fp.ONE;
		let d = num;
		while (power > _0n) {
			if (power & _1n) p = Fp.mul(p, d);
			d = Fp.sqr(d);
			power >>= _1n;
		}
		return p;
	}
	/**
	* Efficiently invert an array of Field elements.
	* Exception-free. Will return `undefined` for 0 elements.
	* @param passZero map 0 to 0 (instead of undefined)
	*/
	function FpInvertBatch(Fp, nums, passZero = false) {
		const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
		const multipliedAcc = nums.reduce((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = acc;
			return Fp.mul(acc, num);
		}, Fp.ONE);
		const invertedAcc = Fp.inv(multipliedAcc);
		nums.reduceRight((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = Fp.mul(acc, inverted[i]);
			return Fp.mul(acc, num);
		}, invertedAcc);
		return inverted;
	}
	function FpDiv(Fp, lhs, rhs) {
		return Fp.mul(lhs, typeof rhs === "bigint" ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
	}
	/**
	* Legendre symbol.
	* Legendre constant is used to calculate Legendre symbol (a | p)
	* which denotes the value of a^((p-1)/2) (mod p).
	*
	* * (a | p) ≡ 1    if a is a square (mod p), quadratic residue
	* * (a | p) ≡ -1   if a is not a square (mod p), quadratic non residue
	* * (a | p) ≡ 0    if a ≡ 0 (mod p)
	*/
	function FpLegendre(Fp, n) {
		const p1mod2 = (Fp.ORDER - _1n) / _2n;
		const powered = Fp.pow(n, p1mod2);
		const yes = Fp.eql(powered, Fp.ONE);
		const zero = Fp.eql(powered, Fp.ZERO);
		const no = Fp.eql(powered, Fp.neg(Fp.ONE));
		if (!yes && !zero && !no) throw new Error("invalid Legendre symbol result");
		return yes ? 1 : zero ? 0 : -1;
	}
	function FpIsSquare(Fp, n) {
		return FpLegendre(Fp, n) === 1;
	}
	function nLength(n, nBitLength) {
		if (nBitLength !== void 0) (0, utils_ts_1.anumber)(nBitLength);
		const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
		return {
			nBitLength: _nBitLength,
			nByteLength: Math.ceil(_nBitLength / 8)
		};
	}
	/**
	* Creates a finite field. Major performance optimizations:
	* * 1. Denormalized operations like mulN instead of mul.
	* * 2. Identical object shape: never add or remove keys.
	* * 3. `Object.freeze`.
	* Fragile: always run a benchmark on a change.
	* Security note: operations don't check 'isValid' for all elements for performance reasons,
	* it is caller responsibility to check this.
	* This is low-level code, please make sure you know what you're doing.
	*
	* Note about field properties:
	* * CHARACTERISTIC p = prime number, number of elements in main subgroup.
	* * ORDER q = similar to cofactor in curves, may be composite `q = p^m`.
	*
	* @param ORDER field order, probably prime, or could be composite
	* @param bitLen how many bits the field consumes
	* @param isLE (default: false) if encoding / decoding should be in little-endian
	* @param redef optional faster redefinitions of sqrt and other methods
	*/
	function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
		if (ORDER <= _0n) throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
		let _nbitLength = void 0;
		let _sqrt = void 0;
		let modFromBytes = false;
		let allowedLengths = void 0;
		if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
			if (opts.sqrt || isLE) throw new Error("cannot specify opts in two arguments");
			const _opts = bitLenOrOpts;
			if (_opts.BITS) _nbitLength = _opts.BITS;
			if (_opts.sqrt) _sqrt = _opts.sqrt;
			if (typeof _opts.isLE === "boolean") isLE = _opts.isLE;
			if (typeof _opts.modFromBytes === "boolean") modFromBytes = _opts.modFromBytes;
			allowedLengths = _opts.allowedLengths;
		} else {
			if (typeof bitLenOrOpts === "number") _nbitLength = bitLenOrOpts;
			if (opts.sqrt) _sqrt = opts.sqrt;
		}
		const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
		if (BYTES > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
		let sqrtP;
		const f = Object.freeze({
			ORDER,
			isLE,
			BITS,
			BYTES,
			MASK: (0, utils_ts_1.bitMask)(BITS),
			ZERO: _0n,
			ONE: _1n,
			allowedLengths,
			create: (num) => mod(num, ORDER),
			isValid: (num) => {
				if (typeof num !== "bigint") throw new Error("invalid field element: expected bigint, got " + typeof num);
				return _0n <= num && num < ORDER;
			},
			is0: (num) => num === _0n,
			isValidNot0: (num) => !f.is0(num) && f.isValid(num),
			isOdd: (num) => (num & _1n) === _1n,
			neg: (num) => mod(-num, ORDER),
			eql: (lhs, rhs) => lhs === rhs,
			sqr: (num) => mod(num * num, ORDER),
			add: (lhs, rhs) => mod(lhs + rhs, ORDER),
			sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
			mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
			pow: (num, power) => FpPow(f, num, power),
			div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
			sqrN: (num) => num * num,
			addN: (lhs, rhs) => lhs + rhs,
			subN: (lhs, rhs) => lhs - rhs,
			mulN: (lhs, rhs) => lhs * rhs,
			inv: (num) => invert(num, ORDER),
			sqrt: _sqrt || ((n) => {
				if (!sqrtP) sqrtP = FpSqrt(ORDER);
				return sqrtP(f, n);
			}),
			toBytes: (num) => isLE ? (0, utils_ts_1.numberToBytesLE)(num, BYTES) : (0, utils_ts_1.numberToBytesBE)(num, BYTES),
			fromBytes: (bytes, skipValidation = true) => {
				if (allowedLengths) {
					if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
					const padded = new Uint8Array(BYTES);
					padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
					bytes = padded;
				}
				if (bytes.length !== BYTES) throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
				let scalar = isLE ? (0, utils_ts_1.bytesToNumberLE)(bytes) : (0, utils_ts_1.bytesToNumberBE)(bytes);
				if (modFromBytes) scalar = mod(scalar, ORDER);
				if (!skipValidation) {
					if (!f.isValid(scalar)) throw new Error("invalid field element: outside of range 0..ORDER");
				}
				return scalar;
			},
			invertBatch: (lst) => FpInvertBatch(f, lst),
			cmov: (a, b, c) => c ? b : a
		});
		return Object.freeze(f);
	}
	function FpSqrtOdd(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? root : Fp.neg(root);
	}
	function FpSqrtEven(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? Fp.neg(root) : root;
	}
	/**
	* "Constant-time" private key generation utility.
	* Same as mapKeyToField, but accepts less bytes (40 instead of 48 for 32-byte field).
	* Which makes it slightly more biased, less secure.
	* @deprecated use `mapKeyToField` instead
	*/
	function hashToPrivateScalar(hash, groupOrder, isLE = false) {
		hash = (0, utils_ts_1.ensureBytes)("privateHash", hash);
		const hashLen = hash.length;
		const minLen = nLength(groupOrder).nByteLength + 8;
		if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error("hashToPrivateScalar: expected " + minLen + "-1024 bytes of input, got " + hashLen);
		return mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(hash) : (0, utils_ts_1.bytesToNumberBE)(hash), groupOrder - _1n) + _1n;
	}
	/**
	* Returns total number of bytes consumed by the field element.
	* For example, 32 bytes for usual 256-bit weierstrass curve.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of field
	*/
	function getFieldBytesLength(fieldOrder) {
		if (typeof fieldOrder !== "bigint") throw new Error("field order must be bigint");
		const bitLength = fieldOrder.toString(2).length;
		return Math.ceil(bitLength / 8);
	}
	/**
	* Returns minimal amount of bytes that can be safely reduced
	* by field order.
	* Should be 2^-128 for 128-bit curve such as P256.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of target hash
	*/
	function getMinHashLength(fieldOrder) {
		const length = getFieldBytesLength(fieldOrder);
		return length + Math.ceil(length / 2);
	}
	/**
	* "Constant-time" private key generation utility.
	* Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
	* and convert them into private scalar, with the modulo bias being negligible.
	* Needs at least 48 bytes of input for 32-byte private key.
	* https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
	* FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
	* RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
	* @param hash hash output from SHA3 or a similar function
	* @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
	* @param isLE interpret hash bytes as LE num
	* @returns valid private scalar
	*/
	function mapHashToField(key, fieldOrder, isLE = false) {
		const len = key.length;
		const fieldLen = getFieldBytesLength(fieldOrder);
		const minLen = getMinHashLength(fieldOrder);
		if (len < 16 || len < minLen || len > 1024) throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
		const reduced = mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(key) : (0, utils_ts_1.bytesToNumberBE)(key), fieldOrder - _1n) + _1n;
		return isLE ? (0, utils_ts_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_ts_1.numberToBytesBE)(reduced, fieldLen);
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/_md.js
var require__md$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SHA512_IV = exports.SHA384_IV = exports.SHA224_IV = exports.SHA256_IV = exports.HashMD = void 0;
	exports.setBigUint64 = setBigUint64;
	exports.Chi = Chi;
	exports.Maj = Maj;
	/**
	* Internal Merkle-Damgard hash utils.
	* @module
	*/
	var utils_ts_1 = require_utils$2();
	/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
	function setBigUint64(view, byteOffset, value, isLE) {
		if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE);
		const _32n = BigInt(32);
		const _u32_max = BigInt(4294967295);
		const wh = Number(value >> _32n & _u32_max);
		const wl = Number(value & _u32_max);
		const h = isLE ? 4 : 0;
		const l = isLE ? 0 : 4;
		view.setUint32(byteOffset + h, wh, isLE);
		view.setUint32(byteOffset + l, wl, isLE);
	}
	/** Choice: a ? b : c */
	function Chi(a, b, c) {
		return a & b ^ ~a & c;
	}
	/** Majority function, true if any two inputs is true. */
	function Maj(a, b, c) {
		return a & b ^ a & c ^ b & c;
	}
	/**
	* Merkle-Damgard hash construction base class.
	* Could be used to create MD5, RIPEMD, SHA1, SHA2.
	*/
	var HashMD = class extends utils_ts_1.Hash {
		constructor(blockLen, outputLen, padOffset, isLE) {
			super();
			this.finished = false;
			this.length = 0;
			this.pos = 0;
			this.destroyed = false;
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.padOffset = padOffset;
			this.isLE = isLE;
			this.buffer = new Uint8Array(blockLen);
			this.view = (0, utils_ts_1.createView)(this.buffer);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { view, buffer, blockLen } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					const dataView = (0, utils_ts_1.createView)(data);
					for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(view, 0);
					this.pos = 0;
				}
			}
			this.length += data.length;
			this.roundClean();
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { buffer, view, blockLen, isLE } = this;
			let { pos } = this;
			buffer[pos++] = 128;
			(0, utils_ts_1.clean)(this.buffer.subarray(pos));
			if (this.padOffset > blockLen - pos) {
				this.process(view, 0);
				pos = 0;
			}
			for (let i = pos; i < blockLen; i++) buffer[i] = 0;
			setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
			this.process(view, 0);
			const oview = (0, utils_ts_1.createView)(out);
			const len = this.outputLen;
			if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
			const outLen = len / 4;
			const state = this.get();
			if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
			for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			to || (to = new this.constructor());
			to.set(...this.get());
			const { blockLen, buffer, length, finished, destroyed, pos } = this;
			to.destroyed = destroyed;
			to.finished = finished;
			to.length = length;
			to.pos = pos;
			if (length % blockLen) to.buffer.set(buffer);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
	};
	exports.HashMD = HashMD;
	/**
	* Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
	* Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
	*/
	/** Initial SHA256 state. Bits 0..32 of frac part of sqrt of primes 2..19 */
	exports.SHA256_IV = Uint32Array.from([
		1779033703,
		3144134277,
		1013904242,
		2773480762,
		1359893119,
		2600822924,
		528734635,
		1541459225
	]);
	/** Initial SHA224 state. Bits 32..64 of frac part of sqrt of primes 23..53 */
	exports.SHA224_IV = Uint32Array.from([
		3238371032,
		914150663,
		812702999,
		4144912697,
		4290775857,
		1750603025,
		1694076839,
		3204075428
	]);
	/** Initial SHA384 state. Bits 0..64 of frac part of sqrt of primes 23..53 */
	exports.SHA384_IV = Uint32Array.from([
		3418070365,
		3238371032,
		1654270250,
		914150663,
		2438529370,
		812702999,
		355462360,
		4144912697,
		1731405415,
		4290775857,
		2394180231,
		1750603025,
		3675008525,
		1694076839,
		1203062813,
		3204075428
	]);
	/** Initial SHA512 state. Bits 0..64 of frac part of sqrt of primes 2..19 */
	exports.SHA512_IV = Uint32Array.from([
		1779033703,
		4089235720,
		3144134277,
		2227873595,
		1013904242,
		4271175723,
		2773480762,
		1595750129,
		1359893119,
		2917565137,
		2600822924,
		725511199,
		528734635,
		4215389547,
		1541459225,
		327033209
	]);
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/_u64.js
var require__u64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBig = exports.shrSL = exports.shrSH = exports.rotrSL = exports.rotrSH = exports.rotrBL = exports.rotrBH = exports.rotr32L = exports.rotr32H = exports.rotlSL = exports.rotlSH = exports.rotlBL = exports.rotlBH = exports.add5L = exports.add5H = exports.add4L = exports.add4H = exports.add3L = exports.add3H = void 0;
	exports.add = add;
	exports.fromBig = fromBig;
	exports.split = split;
	/**
	* Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
	* @todo re-check https://issues.chromium.org/issues/42212588
	* @module
	*/
	var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
	var _32n = /* @__PURE__ */ BigInt(32);
	function fromBig(n, le = false) {
		if (le) return {
			h: Number(n & U32_MASK64),
			l: Number(n >> _32n & U32_MASK64)
		};
		return {
			h: Number(n >> _32n & U32_MASK64) | 0,
			l: Number(n & U32_MASK64) | 0
		};
	}
	function split(lst, le = false) {
		const len = lst.length;
		let Ah = new Uint32Array(len);
		let Al = new Uint32Array(len);
		for (let i = 0; i < len; i++) {
			const { h, l } = fromBig(lst[i], le);
			[Ah[i], Al[i]] = [h, l];
		}
		return [Ah, Al];
	}
	var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
	exports.toBig = toBig;
	var shrSH = (h, _l, s) => h >>> s;
	exports.shrSH = shrSH;
	var shrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.shrSL = shrSL;
	var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
	exports.rotrSH = rotrSH;
	var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.rotrSL = rotrSL;
	var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
	exports.rotrBH = rotrBH;
	var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
	exports.rotrBL = rotrBL;
	var rotr32H = (_h, l) => l;
	exports.rotr32H = rotr32H;
	var rotr32L = (h, _l) => h;
	exports.rotr32L = rotr32L;
	var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
	exports.rotlSH = rotlSH;
	var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
	exports.rotlSL = rotlSL;
	var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
	exports.rotlBH = rotlBH;
	var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
	exports.rotlBL = rotlBL;
	function add(Ah, Al, Bh, Bl) {
		const l = (Al >>> 0) + (Bl >>> 0);
		return {
			h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
			l: l | 0
		};
	}
	var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
	exports.add3L = add3L;
	var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
	exports.add3H = add3H;
	var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
	exports.add4L = add4L;
	var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
	exports.add4H = add4H;
	var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
	exports.add5L = add5L;
	var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
	exports.add5H = add5H;
	exports.default = {
		fromBig,
		split,
		toBig,
		shrSH,
		shrSL,
		rotrSH,
		rotrSL,
		rotrBH,
		rotrBL,
		rotr32H,
		rotr32L,
		rotlSH,
		rotlSL,
		rotlBH,
		rotlBL,
		add,
		add3L,
		add3H,
		add4L,
		add4H,
		add5H,
		add5L
	};
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/sha2.js
var require_sha2$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512_224 = exports.sha512_256 = exports.sha384 = exports.sha512 = exports.sha224 = exports.sha256 = exports.SHA512_256 = exports.SHA512_224 = exports.SHA384 = exports.SHA512 = exports.SHA224 = exports.SHA256 = void 0;
	/**
	* SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
	* SHA256 is the fastest hash implementable in JS, even faster than Blake3.
	* Check out [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and
	* [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
	* @module
	*/
	var _md_ts_1 = require__md$1();
	var u64 = require__u64();
	var utils_ts_1 = require_utils$2();
	/**
	* Round constants:
	* First 32 bits of fractional parts of the cube roots of the first 64 primes 2..311)
	*/
	var SHA256_K = /* @__PURE__ */ Uint32Array.from([
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	]);
	/** Reusable temporary buffer. "W" comes straight from spec. */
	var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
	var SHA256 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 32) {
			super(64, outputLen, 8, false);
			this.A = _md_ts_1.SHA256_IV[0] | 0;
			this.B = _md_ts_1.SHA256_IV[1] | 0;
			this.C = _md_ts_1.SHA256_IV[2] | 0;
			this.D = _md_ts_1.SHA256_IV[3] | 0;
			this.E = _md_ts_1.SHA256_IV[4] | 0;
			this.F = _md_ts_1.SHA256_IV[5] | 0;
			this.G = _md_ts_1.SHA256_IV[6] | 0;
			this.H = _md_ts_1.SHA256_IV[7] | 0;
		}
		get() {
			const { A, B, C, D, E, F, G, H } = this;
			return [
				A,
				B,
				C,
				D,
				E,
				F,
				G,
				H
			];
		}
		set(A, B, C, D, E, F, G, H) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
			this.F = F | 0;
			this.G = G | 0;
			this.H = H | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 64; i++) {
				const W15 = SHA256_W[i - 15];
				const W2 = SHA256_W[i - 2];
				const s0 = (0, utils_ts_1.rotr)(W15, 7) ^ (0, utils_ts_1.rotr)(W15, 18) ^ W15 >>> 3;
				const s1 = (0, utils_ts_1.rotr)(W2, 17) ^ (0, utils_ts_1.rotr)(W2, 19) ^ W2 >>> 10;
				SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
			}
			let { A, B, C, D, E, F, G, H } = this;
			for (let i = 0; i < 64; i++) {
				const sigma1 = (0, utils_ts_1.rotr)(E, 6) ^ (0, utils_ts_1.rotr)(E, 11) ^ (0, utils_ts_1.rotr)(E, 25);
				const T1 = H + sigma1 + (0, _md_ts_1.Chi)(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
				const T2 = ((0, utils_ts_1.rotr)(A, 2) ^ (0, utils_ts_1.rotr)(A, 13) ^ (0, utils_ts_1.rotr)(A, 22)) + (0, _md_ts_1.Maj)(A, B, C) | 0;
				H = G;
				G = F;
				F = E;
				E = D + T1 | 0;
				D = C;
				C = B;
				B = A;
				A = T1 + T2 | 0;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			F = F + this.F | 0;
			G = G + this.G | 0;
			H = H + this.H | 0;
			this.set(A, B, C, D, E, F, G, H);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA256_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA256 = SHA256;
	var SHA224 = class extends SHA256 {
		constructor() {
			super(28);
			this.A = _md_ts_1.SHA224_IV[0] | 0;
			this.B = _md_ts_1.SHA224_IV[1] | 0;
			this.C = _md_ts_1.SHA224_IV[2] | 0;
			this.D = _md_ts_1.SHA224_IV[3] | 0;
			this.E = _md_ts_1.SHA224_IV[4] | 0;
			this.F = _md_ts_1.SHA224_IV[5] | 0;
			this.G = _md_ts_1.SHA224_IV[6] | 0;
			this.H = _md_ts_1.SHA224_IV[7] | 0;
		}
	};
	exports.SHA224 = SHA224;
	var K512 = /* @__PURE__ */ (() => u64.split([
		"0x428a2f98d728ae22",
		"0x7137449123ef65cd",
		"0xb5c0fbcfec4d3b2f",
		"0xe9b5dba58189dbbc",
		"0x3956c25bf348b538",
		"0x59f111f1b605d019",
		"0x923f82a4af194f9b",
		"0xab1c5ed5da6d8118",
		"0xd807aa98a3030242",
		"0x12835b0145706fbe",
		"0x243185be4ee4b28c",
		"0x550c7dc3d5ffb4e2",
		"0x72be5d74f27b896f",
		"0x80deb1fe3b1696b1",
		"0x9bdc06a725c71235",
		"0xc19bf174cf692694",
		"0xe49b69c19ef14ad2",
		"0xefbe4786384f25e3",
		"0x0fc19dc68b8cd5b5",
		"0x240ca1cc77ac9c65",
		"0x2de92c6f592b0275",
		"0x4a7484aa6ea6e483",
		"0x5cb0a9dcbd41fbd4",
		"0x76f988da831153b5",
		"0x983e5152ee66dfab",
		"0xa831c66d2db43210",
		"0xb00327c898fb213f",
		"0xbf597fc7beef0ee4",
		"0xc6e00bf33da88fc2",
		"0xd5a79147930aa725",
		"0x06ca6351e003826f",
		"0x142929670a0e6e70",
		"0x27b70a8546d22ffc",
		"0x2e1b21385c26c926",
		"0x4d2c6dfc5ac42aed",
		"0x53380d139d95b3df",
		"0x650a73548baf63de",
		"0x766a0abb3c77b2a8",
		"0x81c2c92e47edaee6",
		"0x92722c851482353b",
		"0xa2bfe8a14cf10364",
		"0xa81a664bbc423001",
		"0xc24b8b70d0f89791",
		"0xc76c51a30654be30",
		"0xd192e819d6ef5218",
		"0xd69906245565a910",
		"0xf40e35855771202a",
		"0x106aa07032bbd1b8",
		"0x19a4c116b8d2d0c8",
		"0x1e376c085141ab53",
		"0x2748774cdf8eeb99",
		"0x34b0bcb5e19b48a8",
		"0x391c0cb3c5c95a63",
		"0x4ed8aa4ae3418acb",
		"0x5b9cca4f7763e373",
		"0x682e6ff3d6b2b8a3",
		"0x748f82ee5defb2fc",
		"0x78a5636f43172f60",
		"0x84c87814a1f0ab72",
		"0x8cc702081a6439ec",
		"0x90befffa23631e28",
		"0xa4506cebde82bde9",
		"0xbef9a3f7b2c67915",
		"0xc67178f2e372532b",
		"0xca273eceea26619c",
		"0xd186b8c721c0c207",
		"0xeada7dd6cde0eb1e",
		"0xf57d4f7fee6ed178",
		"0x06f067aa72176fba",
		"0x0a637dc5a2c898a6",
		"0x113f9804bef90dae",
		"0x1b710b35131c471b",
		"0x28db77f523047d84",
		"0x32caab7b40c72493",
		"0x3c9ebe0a15c9bebc",
		"0x431d67c49c100d4c",
		"0x4cc5d4becb3e42b6",
		"0x597f299cfc657e2a",
		"0x5fcb6fab3ad6faec",
		"0x6c44198c4a475817"
	].map((n) => BigInt(n))))();
	var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
	var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
	var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
	var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
	var SHA512 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 64) {
			super(128, outputLen, 16, false);
			this.Ah = _md_ts_1.SHA512_IV[0] | 0;
			this.Al = _md_ts_1.SHA512_IV[1] | 0;
			this.Bh = _md_ts_1.SHA512_IV[2] | 0;
			this.Bl = _md_ts_1.SHA512_IV[3] | 0;
			this.Ch = _md_ts_1.SHA512_IV[4] | 0;
			this.Cl = _md_ts_1.SHA512_IV[5] | 0;
			this.Dh = _md_ts_1.SHA512_IV[6] | 0;
			this.Dl = _md_ts_1.SHA512_IV[7] | 0;
			this.Eh = _md_ts_1.SHA512_IV[8] | 0;
			this.El = _md_ts_1.SHA512_IV[9] | 0;
			this.Fh = _md_ts_1.SHA512_IV[10] | 0;
			this.Fl = _md_ts_1.SHA512_IV[11] | 0;
			this.Gh = _md_ts_1.SHA512_IV[12] | 0;
			this.Gl = _md_ts_1.SHA512_IV[13] | 0;
			this.Hh = _md_ts_1.SHA512_IV[14] | 0;
			this.Hl = _md_ts_1.SHA512_IV[15] | 0;
		}
		get() {
			const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			return [
				Ah,
				Al,
				Bh,
				Bl,
				Ch,
				Cl,
				Dh,
				Dl,
				Eh,
				El,
				Fh,
				Fl,
				Gh,
				Gl,
				Hh,
				Hl
			];
		}
		set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
			this.Ah = Ah | 0;
			this.Al = Al | 0;
			this.Bh = Bh | 0;
			this.Bl = Bl | 0;
			this.Ch = Ch | 0;
			this.Cl = Cl | 0;
			this.Dh = Dh | 0;
			this.Dl = Dl | 0;
			this.Eh = Eh | 0;
			this.El = El | 0;
			this.Fh = Fh | 0;
			this.Fl = Fl | 0;
			this.Gh = Gh | 0;
			this.Gl = Gl | 0;
			this.Hh = Hh | 0;
			this.Hl = Hl | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) {
				SHA512_W_H[i] = view.getUint32(offset);
				SHA512_W_L[i] = view.getUint32(offset += 4);
			}
			for (let i = 16; i < 80; i++) {
				const W15h = SHA512_W_H[i - 15] | 0;
				const W15l = SHA512_W_L[i - 15] | 0;
				const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
				const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
				const W2h = SHA512_W_H[i - 2] | 0;
				const W2l = SHA512_W_L[i - 2] | 0;
				const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
				const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
				const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
				const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
				SHA512_W_H[i] = SUMh | 0;
				SHA512_W_L[i] = SUMl | 0;
			}
			let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			for (let i = 0; i < 80; i++) {
				const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
				const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
				const CHIh = Eh & Fh ^ ~Eh & Gh;
				const CHIl = El & Fl ^ ~El & Gl;
				const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
				const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
				const T1l = T1ll | 0;
				const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
				const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
				const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
				const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
				Hh = Gh | 0;
				Hl = Gl | 0;
				Gh = Fh | 0;
				Gl = Fl | 0;
				Fh = Eh | 0;
				Fl = El | 0;
				({h: Eh, l: El} = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
				Dh = Ch | 0;
				Dl = Cl | 0;
				Ch = Bh | 0;
				Cl = Bl | 0;
				Bh = Ah | 0;
				Bl = Al | 0;
				const All = u64.add3L(T1l, sigma0l, MAJl);
				Ah = u64.add3H(All, T1h, sigma0h, MAJh);
				Al = All | 0;
			}
			({h: Ah, l: Al} = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
			({h: Bh, l: Bl} = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
			({h: Ch, l: Cl} = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
			({h: Dh, l: Dl} = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
			({h: Eh, l: El} = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
			({h: Fh, l: Fl} = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
			({h: Gh, l: Gl} = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
			({h: Hh, l: Hl} = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
			this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA512_W_H, SHA512_W_L);
		}
		destroy() {
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.SHA512 = SHA512;
	var SHA384 = class extends SHA512 {
		constructor() {
			super(48);
			this.Ah = _md_ts_1.SHA384_IV[0] | 0;
			this.Al = _md_ts_1.SHA384_IV[1] | 0;
			this.Bh = _md_ts_1.SHA384_IV[2] | 0;
			this.Bl = _md_ts_1.SHA384_IV[3] | 0;
			this.Ch = _md_ts_1.SHA384_IV[4] | 0;
			this.Cl = _md_ts_1.SHA384_IV[5] | 0;
			this.Dh = _md_ts_1.SHA384_IV[6] | 0;
			this.Dl = _md_ts_1.SHA384_IV[7] | 0;
			this.Eh = _md_ts_1.SHA384_IV[8] | 0;
			this.El = _md_ts_1.SHA384_IV[9] | 0;
			this.Fh = _md_ts_1.SHA384_IV[10] | 0;
			this.Fl = _md_ts_1.SHA384_IV[11] | 0;
			this.Gh = _md_ts_1.SHA384_IV[12] | 0;
			this.Gl = _md_ts_1.SHA384_IV[13] | 0;
			this.Hh = _md_ts_1.SHA384_IV[14] | 0;
			this.Hl = _md_ts_1.SHA384_IV[15] | 0;
		}
	};
	exports.SHA384 = SHA384;
	/**
	* Truncated SHA512/256 and SHA512/224.
	* SHA512_IV is XORed with 0xa5a5a5a5a5a5a5a5, then used as "intermediary" IV of SHA512/t.
	* Then t hashes string to produce result IV.
	* See `test/misc/sha2-gen-iv.js`.
	*/
	/** SHA512/224 IV */
	var T224_IV = /* @__PURE__ */ Uint32Array.from([
		2352822216,
		424955298,
		1944164710,
		2312950998,
		502970286,
		855612546,
		1738396948,
		1479516111,
		258812777,
		2077511080,
		2011393907,
		79989058,
		1067287976,
		1780299464,
		286451373,
		2446758561
	]);
	/** SHA512/256 IV */
	var T256_IV = /* @__PURE__ */ Uint32Array.from([
		573645204,
		4230739756,
		2673172387,
		3360449730,
		596883563,
		1867755857,
		2520282905,
		1497426621,
		2519219938,
		2827943907,
		3193839141,
		1401305490,
		721525244,
		746961066,
		246885852,
		2177182882
	]);
	var SHA512_224 = class extends SHA512 {
		constructor() {
			super(28);
			this.Ah = T224_IV[0] | 0;
			this.Al = T224_IV[1] | 0;
			this.Bh = T224_IV[2] | 0;
			this.Bl = T224_IV[3] | 0;
			this.Ch = T224_IV[4] | 0;
			this.Cl = T224_IV[5] | 0;
			this.Dh = T224_IV[6] | 0;
			this.Dl = T224_IV[7] | 0;
			this.Eh = T224_IV[8] | 0;
			this.El = T224_IV[9] | 0;
			this.Fh = T224_IV[10] | 0;
			this.Fl = T224_IV[11] | 0;
			this.Gh = T224_IV[12] | 0;
			this.Gl = T224_IV[13] | 0;
			this.Hh = T224_IV[14] | 0;
			this.Hl = T224_IV[15] | 0;
		}
	};
	exports.SHA512_224 = SHA512_224;
	var SHA512_256 = class extends SHA512 {
		constructor() {
			super(32);
			this.Ah = T256_IV[0] | 0;
			this.Al = T256_IV[1] | 0;
			this.Bh = T256_IV[2] | 0;
			this.Bl = T256_IV[3] | 0;
			this.Ch = T256_IV[4] | 0;
			this.Cl = T256_IV[5] | 0;
			this.Dh = T256_IV[6] | 0;
			this.Dl = T256_IV[7] | 0;
			this.Eh = T256_IV[8] | 0;
			this.El = T256_IV[9] | 0;
			this.Fh = T256_IV[10] | 0;
			this.Fl = T256_IV[11] | 0;
			this.Gh = T256_IV[12] | 0;
			this.Gl = T256_IV[13] | 0;
			this.Hh = T256_IV[14] | 0;
			this.Hl = T256_IV[15] | 0;
		}
	};
	exports.SHA512_256 = SHA512_256;
	/**
	* SHA2-256 hash function from RFC 4634.
	*
	* It is the fastest JS hash, even faster than Blake3.
	* To break sha256 using birthday attack, attackers need to try 2^128 hashes.
	* BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
	*/
	exports.sha256 = (0, utils_ts_1.createHasher)(() => new SHA256());
	/** SHA2-224 hash function from RFC 4634 */
	exports.sha224 = (0, utils_ts_1.createHasher)(() => new SHA224());
	/** SHA2-512 hash function from RFC 4634. */
	exports.sha512 = (0, utils_ts_1.createHasher)(() => new SHA512());
	/** SHA2-384 hash function from RFC 4634. */
	exports.sha384 = (0, utils_ts_1.createHasher)(() => new SHA384());
	/**
	* SHA2-512/256 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_256 = (0, utils_ts_1.createHasher)(() => new SHA512_256());
	/**
	* SHA2-512/224 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_224 = (0, utils_ts_1.createHasher)(() => new SHA512_224());
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/hmac.js
var require_hmac$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac = exports.HMAC = void 0;
	/**
	* HMAC: RFC2104 message authentication code.
	* @module
	*/
	var utils_ts_1 = require_utils$2();
	var HMAC = class extends utils_ts_1.Hash {
		constructor(hash, _key) {
			super();
			this.finished = false;
			this.destroyed = false;
			(0, utils_ts_1.ahash)(hash);
			const key = (0, utils_ts_1.toBytes)(_key);
			this.iHash = hash.create();
			if (typeof this.iHash.update !== "function") throw new Error("Expected instance of class which extends utils.Hash");
			this.blockLen = this.iHash.blockLen;
			this.outputLen = this.iHash.outputLen;
			const blockLen = this.blockLen;
			const pad = new Uint8Array(blockLen);
			pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
			for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
			this.iHash.update(pad);
			this.oHash = hash.create();
			for (let i = 0; i < pad.length; i++) pad[i] ^= 106;
			this.oHash.update(pad);
			(0, utils_ts_1.clean)(pad);
		}
		update(buf) {
			(0, utils_ts_1.aexists)(this);
			this.iHash.update(buf);
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.abytes)(out, this.outputLen);
			this.finished = true;
			this.iHash.digestInto(out);
			this.oHash.update(out);
			this.oHash.digestInto(out);
			this.destroy();
		}
		digest() {
			const out = new Uint8Array(this.oHash.outputLen);
			this.digestInto(out);
			return out;
		}
		_cloneInto(to) {
			to || (to = Object.create(Object.getPrototypeOf(this), {}));
			const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
			to = to;
			to.finished = finished;
			to.destroyed = destroyed;
			to.blockLen = blockLen;
			to.outputLen = outputLen;
			to.oHash = oHash._cloneInto(to.oHash);
			to.iHash = iHash._cloneInto(to.iHash);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
		destroy() {
			this.destroyed = true;
			this.oHash.destroy();
			this.iHash.destroy();
		}
	};
	exports.HMAC = HMAC;
	/**
	* HMAC: RFC2104 message authentication code.
	* @param hash - function that would be used e.g. sha256
	* @param key - message key
	* @param message - message data
	* @example
	* import { hmac } from '@noble/hashes/hmac';
	* import { sha256 } from '@noble/hashes/sha2';
	* const mac1 = hmac(sha256, 'key', 'message');
	*/
	var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
	exports.hmac = hmac;
	exports.hmac.create = (hash, key) => new HMAC(hash, key);
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/abstract/curve.js
var require_curve$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wNAF = void 0;
	exports.negateCt = negateCt;
	exports.normalizeZ = normalizeZ;
	exports.mulEndoUnsafe = mulEndoUnsafe;
	exports.pippenger = pippenger;
	exports.precomputeMSMUnsafe = precomputeMSMUnsafe;
	exports.validateBasic = validateBasic;
	exports._createCurveFields = _createCurveFields;
	/**
	* Methods for elliptic curve multiplication by scalars.
	* Contains wNAF, pippenger.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils$1();
	var modular_ts_1 = require_modular$1();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	function negateCt(condition, item) {
		const neg = item.negate();
		return condition ? neg : item;
	}
	/**
	* Takes a bunch of Projective Points but executes only one
	* inversion on all of them. Inversion is very slow operation,
	* so this improves performance massively.
	* Optimization: converts a list of projective points to a list of identical points with Z=1.
	*/
	function normalizeZ(c, points) {
		const invertedZs = (0, modular_ts_1.FpInvertBatch)(c.Fp, points.map((p) => p.Z));
		return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
	}
	function validateW(W, bits) {
		if (!Number.isSafeInteger(W) || W <= 0 || W > bits) throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
	}
	function calcWOpts(W, scalarBits) {
		validateW(W, scalarBits);
		const windows = Math.ceil(scalarBits / W) + 1;
		const windowSize = 2 ** (W - 1);
		const maxNumber = 2 ** W;
		return {
			windows,
			windowSize,
			mask: (0, utils_ts_1.bitMask)(W),
			maxNumber,
			shiftBy: BigInt(W)
		};
	}
	function calcOffsets(n, window, wOpts) {
		const { windowSize, mask, maxNumber, shiftBy } = wOpts;
		let wbits = Number(n & mask);
		let nextN = n >> shiftBy;
		if (wbits > windowSize) {
			wbits -= maxNumber;
			nextN += _1n;
		}
		const offsetStart = window * windowSize;
		const offset = offsetStart + Math.abs(wbits) - 1;
		const isZero = wbits === 0;
		const isNeg = wbits < 0;
		const isNegF = window % 2 !== 0;
		return {
			nextN,
			offset,
			isZero,
			isNeg,
			isNegF,
			offsetF: offsetStart
		};
	}
	function validateMSMPoints(points, c) {
		if (!Array.isArray(points)) throw new Error("array expected");
		points.forEach((p, i) => {
			if (!(p instanceof c)) throw new Error("invalid point at index " + i);
		});
	}
	function validateMSMScalars(scalars, field) {
		if (!Array.isArray(scalars)) throw new Error("array of scalars expected");
		scalars.forEach((s, i) => {
			if (!field.isValid(s)) throw new Error("invalid scalar at index " + i);
		});
	}
	var pointPrecomputes = /* @__PURE__ */ new WeakMap();
	var pointWindowSizes = /* @__PURE__ */ new WeakMap();
	function getW(P) {
		return pointWindowSizes.get(P) || 1;
	}
	function assert0(n) {
		if (n !== _0n) throw new Error("invalid wNAF");
	}
	/**
	* Elliptic curve multiplication of Point by scalar. Fragile.
	* Table generation takes **30MB of ram and 10ms on high-end CPU**,
	* but may take much longer on slow devices. Actual generation will happen on
	* first call of `multiply()`. By default, `BASE` point is precomputed.
	*
	* Scalars should always be less than curve order: this should be checked inside of a curve itself.
	* Creates precomputation tables for fast multiplication:
	* - private scalar is split by fixed size windows of W bits
	* - every window point is collected from window's table & added to accumulator
	* - since windows are different, same point inside tables won't be accessed more than once per calc
	* - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
	* - +1 window is neccessary for wNAF
	* - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
	*
	* @todo Research returning 2d JS array of windows, instead of a single window.
	* This would allow windows to be in different memory locations
	*/
	var wNAF = class {
		constructor(Point, bits) {
			this.BASE = Point.BASE;
			this.ZERO = Point.ZERO;
			this.Fn = Point.Fn;
			this.bits = bits;
		}
		_unsafeLadder(elm, n, p = this.ZERO) {
			let d = elm;
			while (n > _0n) {
				if (n & _1n) p = p.add(d);
				d = d.double();
				n >>= _1n;
			}
			return p;
		}
		/**
		* Creates a wNAF precomputation window. Used for caching.
		* Default window size is set by `utils.precompute()` and is equal to 8.
		* Number of precomputed points depends on the curve size:
		* 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
		* - 𝑊 is the window size
		* - 𝑛 is the bitlength of the curve order.
		* For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
		* @param point Point instance
		* @param W window size
		* @returns precomputed point tables flattened to a single array
		*/
		precomputeWindow(point, W) {
			const { windows, windowSize } = calcWOpts(W, this.bits);
			const points = [];
			let p = point;
			let base = p;
			for (let window = 0; window < windows; window++) {
				base = p;
				points.push(base);
				for (let i = 1; i < windowSize; i++) {
					base = base.add(p);
					points.push(base);
				}
				p = base.double();
			}
			return points;
		}
		/**
		* Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
		* More compact implementation:
		* https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
		* @returns real and fake (for const-time) points
		*/
		wNAF(W, precomputes, n) {
			if (!this.Fn.isValid(n)) throw new Error("invalid scalar");
			let p = this.ZERO;
			let f = this.BASE;
			const wo = calcWOpts(W, this.bits);
			for (let window = 0; window < wo.windows; window++) {
				const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
				n = nextN;
				if (isZero) f = f.add(negateCt(isNegF, precomputes[offsetF]));
				else p = p.add(negateCt(isNeg, precomputes[offset]));
			}
			assert0(n);
			return {
				p,
				f
			};
		}
		/**
		* Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
		* @param acc accumulator point to add result of multiplication
		* @returns point
		*/
		wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
			const wo = calcWOpts(W, this.bits);
			for (let window = 0; window < wo.windows; window++) {
				if (n === _0n) break;
				const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
				n = nextN;
				if (isZero) continue;
				else {
					const item = precomputes[offset];
					acc = acc.add(isNeg ? item.negate() : item);
				}
			}
			assert0(n);
			return acc;
		}
		getPrecomputes(W, point, transform) {
			let comp = pointPrecomputes.get(point);
			if (!comp) {
				comp = this.precomputeWindow(point, W);
				if (W !== 1) {
					if (typeof transform === "function") comp = transform(comp);
					pointPrecomputes.set(point, comp);
				}
			}
			return comp;
		}
		cached(point, scalar, transform) {
			const W = getW(point);
			return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
		}
		unsafe(point, scalar, transform, prev) {
			const W = getW(point);
			if (W === 1) return this._unsafeLadder(point, scalar, prev);
			return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
		}
		createCache(P, W) {
			validateW(W, this.bits);
			pointWindowSizes.set(P, W);
			pointPrecomputes.delete(P);
		}
		hasCache(elm) {
			return getW(elm) !== 1;
		}
	};
	exports.wNAF = wNAF;
	/**
	* Endomorphism-specific multiplication for Koblitz curves.
	* Cost: 128 dbl, 0-256 adds.
	*/
	function mulEndoUnsafe(Point, point, k1, k2) {
		let acc = point;
		let p1 = Point.ZERO;
		let p2 = Point.ZERO;
		while (k1 > _0n || k2 > _0n) {
			if (k1 & _1n) p1 = p1.add(acc);
			if (k2 & _1n) p2 = p2.add(acc);
			acc = acc.double();
			k1 >>= _1n;
			k2 >>= _1n;
		}
		return {
			p1,
			p2
		};
	}
	/**
	* Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* 30x faster vs naive addition on L=4096, 10x faster than precomputes.
	* For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
	* Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @param scalars array of L scalars (aka secret keys / bigints)
	*/
	function pippenger(c, fieldN, points, scalars) {
		validateMSMPoints(points, c);
		validateMSMScalars(scalars, fieldN);
		const plength = points.length;
		const slength = scalars.length;
		if (plength !== slength) throw new Error("arrays of points and scalars must have equal length");
		const zero = c.ZERO;
		const wbits = (0, utils_ts_1.bitLen)(BigInt(plength));
		let windowSize = 1;
		if (wbits > 12) windowSize = wbits - 3;
		else if (wbits > 4) windowSize = wbits - 2;
		else if (wbits > 0) windowSize = 2;
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const buckets = new Array(Number(MASK) + 1).fill(zero);
		const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
		let sum = zero;
		for (let i = lastBits; i >= 0; i -= windowSize) {
			buckets.fill(zero);
			for (let j = 0; j < slength; j++) {
				const scalar = scalars[j];
				const wbits = Number(scalar >> BigInt(i) & MASK);
				buckets[wbits] = buckets[wbits].add(points[j]);
			}
			let resI = zero;
			for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
				sumI = sumI.add(buckets[j]);
				resI = resI.add(sumI);
			}
			sum = sum.add(resI);
			if (i !== 0) for (let j = 0; j < windowSize; j++) sum = sum.double();
		}
		return sum;
	}
	/**
	* Precomputed multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @returns function which multiplies points with scaars
	*/
	function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
		/**
		* Performance Analysis of Window-based Precomputation
		*
		* Base Case (256-bit scalar, 8-bit window):
		* - Standard precomputation requires:
		*   - 31 additions per scalar × 256 scalars = 7,936 ops
		*   - Plus 255 summary additions = 8,191 total ops
		*   Note: Summary additions can be optimized via accumulator
		*
		* Chunked Precomputation Analysis:
		* - Using 32 chunks requires:
		*   - 255 additions per chunk
		*   - 256 doublings
		*   - Total: (255 × 32) + 256 = 8,416 ops
		*
		* Memory Usage Comparison:
		* Window Size | Standard Points | Chunked Points
		* ------------|-----------------|---------------
		*     4-bit   |     520         |      15
		*     8-bit   |    4,224        |     255
		*    10-bit   |   13,824        |   1,023
		*    16-bit   |  557,056        |  65,535
		*
		* Key Advantages:
		* 1. Enables larger window sizes due to reduced memory overhead
		* 2. More efficient for smaller scalar counts:
		*    - 16 chunks: (16 × 255) + 256 = 4,336 ops
		*    - ~2x faster than standard 8,191 ops
		*
		* Limitations:
		* - Not suitable for plain precomputes (requires 256 constant doublings)
		* - Performance degrades with larger scalar counts:
		*   - Optimal for ~256 scalars
		*   - Less efficient for 4096+ scalars (Pippenger preferred)
		*/
		validateW(windowSize, fieldN.BITS);
		validateMSMPoints(points, c);
		const zero = c.ZERO;
		const tableSize = 2 ** windowSize - 1;
		const chunks = Math.ceil(fieldN.BITS / windowSize);
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const tables = points.map((p) => {
			const res = [];
			for (let i = 0, acc = p; i < tableSize; i++) {
				res.push(acc);
				acc = acc.add(p);
			}
			return res;
		});
		return (scalars) => {
			validateMSMScalars(scalars, fieldN);
			if (scalars.length > points.length) throw new Error("array of scalars must be smaller than array of points");
			let res = zero;
			for (let i = 0; i < chunks; i++) {
				if (res !== zero) for (let j = 0; j < windowSize; j++) res = res.double();
				const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
				for (let j = 0; j < scalars.length; j++) {
					const n = scalars[j];
					const curr = Number(n >> shiftBy & MASK);
					if (!curr) continue;
					res = res.add(tables[j][curr - 1]);
				}
			}
			return res;
		};
	}
	/** @deprecated */
	function validateBasic(curve) {
		(0, modular_ts_1.validateField)(curve.Fp);
		(0, utils_ts_1.validateObject)(curve, {
			n: "bigint",
			h: "bigint",
			Gx: "field",
			Gy: "field"
		}, {
			nBitLength: "isSafeInteger",
			nByteLength: "isSafeInteger"
		});
		return Object.freeze({
			...(0, modular_ts_1.nLength)(curve.n, curve.nBitLength),
			...curve,
			p: curve.Fp.ORDER
		});
	}
	function createField(order, field, isLE) {
		if (field) {
			if (field.ORDER !== order) throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
			(0, modular_ts_1.validateField)(field);
			return field;
		} else return (0, modular_ts_1.Field)(order, { isLE });
	}
	/** Validates CURVE opts and creates fields */
	function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
		if (FpFnLE === void 0) FpFnLE = type === "edwards";
		if (!CURVE || typeof CURVE !== "object") throw new Error(`expected valid ${type} CURVE object`);
		for (const p of [
			"p",
			"n",
			"h"
		]) {
			const val = CURVE[p];
			if (!(typeof val === "bigint" && val > _0n)) throw new Error(`CURVE.${p} must be positive bigint`);
		}
		const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
		const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
		const params = [
			"Gx",
			"Gy",
			"a",
			type === "weierstrass" ? "b" : "d"
		];
		for (const p of params) if (!Fp.isValid(CURVE[p])) throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
		CURVE = Object.freeze(Object.assign({}, CURVE));
		return {
			CURVE,
			Fp,
			Fn
		};
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/abstract/weierstrass.js
var require_weierstrass$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DER = exports.DERErr = void 0;
	exports._splitEndoScalar = _splitEndoScalar;
	exports._normFnElement = _normFnElement;
	exports.weierstrassN = weierstrassN;
	exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
	exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
	exports.ecdh = ecdh;
	exports.ecdsa = ecdsa;
	exports.weierstrassPoints = weierstrassPoints;
	exports._legacyHelperEquat = _legacyHelperEquat;
	exports.weierstrass = weierstrass;
	/**
	* Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
	*
	* ### Design rationale for types
	*
	* * Interaction between classes from different curves should fail:
	*   `k256.Point.BASE.add(p256.Point.BASE)`
	* * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
	* * Different calls of `curve()` would return different classes -
	*   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
	*   it won't affect others
	*
	* TypeScript can't infer types for classes created inside a function. Classes is one instance
	* of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
	* unique type for every function call.
	*
	* We can use generic types via some param, like curve opts, but that would:
	*     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
	*     which is hard to debug.
	*     2. Params can be generic and we can't enforce them to be constant value:
	*     if somebody creates curve from non-constant params,
	*     it would be allowed to interact with other curves with non-constant params
	*
	* @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var hmac_js_1 = require_hmac$1();
	var utils_1 = require_utils$2();
	var utils_ts_1 = require_utils$1();
	var curve_ts_1 = require_curve$1();
	var modular_ts_1 = require_modular$1();
	var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n) / den;
	/**
	* Splits scalar for GLV endomorphism.
	*/
	function _splitEndoScalar(k, basis, n) {
		const [[a1, b1], [a2, b2]] = basis;
		const c1 = divNearest(b2 * k, n);
		const c2 = divNearest(-b1 * k, n);
		let k1 = k - c1 * a1 - c2 * a2;
		let k2 = -c1 * b1 - c2 * b2;
		const k1neg = k1 < _0n;
		const k2neg = k2 < _0n;
		if (k1neg) k1 = -k1;
		if (k2neg) k2 = -k2;
		const MAX_NUM = (0, utils_ts_1.bitMask)(Math.ceil((0, utils_ts_1.bitLen)(n) / 2)) + _1n;
		if (k1 < _0n || k1 >= MAX_NUM || k2 < _0n || k2 >= MAX_NUM) throw new Error("splitScalar (endomorphism): failed, k=" + k);
		return {
			k1neg,
			k1,
			k2neg,
			k2
		};
	}
	function validateSigFormat(format) {
		if (![
			"compact",
			"recovered",
			"der"
		].includes(format)) throw new Error("Signature format must be \"compact\", \"recovered\", or \"der\"");
		return format;
	}
	function validateSigOpts(opts, def) {
		const optsn = {};
		for (let optName of Object.keys(def)) optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
		(0, utils_ts_1._abool2)(optsn.lowS, "lowS");
		(0, utils_ts_1._abool2)(optsn.prehash, "prehash");
		if (optsn.format !== void 0) validateSigFormat(optsn.format);
		return optsn;
	}
	var DERErr = class extends Error {
		constructor(m = "") {
			super(m);
		}
	};
	exports.DERErr = DERErr;
	/**
	* ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
	*
	*     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
	*
	* Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
	*/
	exports.DER = {
		Err: DERErr,
		_tlv: {
			encode: (tag, data) => {
				const { Err: E } = exports.DER;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length & 1) throw new E("tlv.encode: unpadded data");
				const dataLen = data.length / 2;
				const len = (0, utils_ts_1.numberToHexUnpadded)(dataLen);
				if (len.length / 2 & 128) throw new E("tlv.encode: long form length too big");
				const lenLen = dataLen > 127 ? (0, utils_ts_1.numberToHexUnpadded)(len.length / 2 | 128) : "";
				return (0, utils_ts_1.numberToHexUnpadded)(tag) + lenLen + len + data;
			},
			decode(tag, data) {
				const { Err: E } = exports.DER;
				let pos = 0;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length < 2 || data[pos++] !== tag) throw new E("tlv.decode: wrong tlv");
				const first = data[pos++];
				const isLong = !!(first & 128);
				let length = 0;
				if (!isLong) length = first;
				else {
					const lenLen = first & 127;
					if (!lenLen) throw new E("tlv.decode(long): indefinite length not supported");
					if (lenLen > 4) throw new E("tlv.decode(long): byte length is too big");
					const lengthBytes = data.subarray(pos, pos + lenLen);
					if (lengthBytes.length !== lenLen) throw new E("tlv.decode: length bytes not complete");
					if (lengthBytes[0] === 0) throw new E("tlv.decode(long): zero leftmost byte");
					for (const b of lengthBytes) length = length << 8 | b;
					pos += lenLen;
					if (length < 128) throw new E("tlv.decode(long): not minimal encoding");
				}
				const v = data.subarray(pos, pos + length);
				if (v.length !== length) throw new E("tlv.decode: wrong value length");
				return {
					v,
					l: data.subarray(pos + length)
				};
			}
		},
		_int: {
			encode(num) {
				const { Err: E } = exports.DER;
				if (num < _0n) throw new E("integer: negative integers are not allowed");
				let hex = (0, utils_ts_1.numberToHexUnpadded)(num);
				if (Number.parseInt(hex[0], 16) & 8) hex = "00" + hex;
				if (hex.length & 1) throw new E("unexpected DER parsing assertion: unpadded hex");
				return hex;
			},
			decode(data) {
				const { Err: E } = exports.DER;
				if (data[0] & 128) throw new E("invalid signature integer: negative");
				if (data[0] === 0 && !(data[1] & 128)) throw new E("invalid signature integer: unnecessary leading zero");
				return (0, utils_ts_1.bytesToNumberBE)(data);
			}
		},
		toSig(hex) {
			const { Err: E, _int: int, _tlv: tlv } = exports.DER;
			const data = (0, utils_ts_1.ensureBytes)("signature", hex);
			const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
			if (seqLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
			const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
			if (sLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			return {
				r: int.decode(rBytes),
				s: int.decode(sBytes)
			};
		},
		hexFromSig(sig) {
			const { _tlv: tlv, _int: int } = exports.DER;
			const seq = tlv.encode(2, int.encode(sig.r)) + tlv.encode(2, int.encode(sig.s));
			return tlv.encode(48, seq);
		}
	};
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	var _4n = BigInt(4);
	function _normFnElement(Fn, key) {
		const { BYTES: expected } = Fn;
		let num;
		if (typeof key === "bigint") num = key;
		else {
			let bytes = (0, utils_ts_1.ensureBytes)("private key", key);
			try {
				num = Fn.fromBytes(bytes);
			} catch (error) {
				throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
			}
		}
		if (!Fn.isValidNot0(num)) throw new Error("invalid private key: out of range [1..N-1]");
		return num;
	}
	/**
	* Creates weierstrass Point constructor, based on specified curve options.
	*
	* @example
	```js
	const opts = {
	p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
	n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
	h: BigInt(1),
	a: BigInt('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'),
	b: BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'),
	Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
	Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'),
	};
	const p256_Point = weierstrass(opts);
	```
	*/
	function weierstrassN(params, extraOpts = {}) {
		const validated = (0, curve_ts_1._createCurveFields)("weierstrass", params, extraOpts);
		const { Fp, Fn } = validated;
		let CURVE = validated.CURVE;
		const { h: cofactor, n: CURVE_ORDER } = CURVE;
		(0, utils_ts_1._validateObject)(extraOpts, {}, {
			allowInfinityPoint: "boolean",
			clearCofactor: "function",
			isTorsionFree: "function",
			fromBytes: "function",
			toBytes: "function",
			endo: "object",
			wrapPrivateKey: "boolean"
		});
		const { endo } = extraOpts;
		if (endo) {
			if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) throw new Error("invalid endo: expected \"beta\": bigint and \"basises\": array");
		}
		const lengths = getWLengths(Fp, Fn);
		function assertCompressionIsSupported() {
			if (!Fp.isOdd) throw new Error("compression is not supported: Field does not have .isOdd()");
		}
		function pointToBytes(_c, point, isCompressed) {
			const { x, y } = point.toAffine();
			const bx = Fp.toBytes(x);
			(0, utils_ts_1._abool2)(isCompressed, "isCompressed");
			if (isCompressed) {
				assertCompressionIsSupported();
				const hasEvenY = !Fp.isOdd(y);
				return (0, utils_ts_1.concatBytes)(pprefix(hasEvenY), bx);
			} else return (0, utils_ts_1.concatBytes)(Uint8Array.of(4), bx, Fp.toBytes(y));
		}
		function pointFromBytes(bytes) {
			(0, utils_ts_1._abytes2)(bytes, void 0, "Point");
			const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
			const length = bytes.length;
			const head = bytes[0];
			const tail = bytes.subarray(1);
			if (length === comp && (head === 2 || head === 3)) {
				const x = Fp.fromBytes(tail);
				if (!Fp.isValid(x)) throw new Error("bad point: is not on curve, wrong x");
				const y2 = weierstrassEquation(x);
				let y;
				try {
					y = Fp.sqrt(y2);
				} catch (sqrtError) {
					const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
					throw new Error("bad point: is not on curve, sqrt error" + err);
				}
				assertCompressionIsSupported();
				const isYOdd = Fp.isOdd(y);
				if ((head & 1) === 1 !== isYOdd) y = Fp.neg(y);
				return {
					x,
					y
				};
			} else if (length === uncomp && head === 4) {
				const L = Fp.BYTES;
				const x = Fp.fromBytes(tail.subarray(0, L));
				const y = Fp.fromBytes(tail.subarray(L, L * 2));
				if (!isValidXY(x, y)) throw new Error("bad point: is not on curve");
				return {
					x,
					y
				};
			} else throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
		}
		const encodePoint = extraOpts.toBytes || pointToBytes;
		const decodePoint = extraOpts.fromBytes || pointFromBytes;
		function weierstrassEquation(x) {
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
		}
		/** Checks whether equation holds for given x, y: y² == x³ + ax + b */
		function isValidXY(x, y) {
			const left = Fp.sqr(y);
			const right = weierstrassEquation(x);
			return Fp.eql(left, right);
		}
		if (!isValidXY(CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
		const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
		if (Fp.is0(Fp.add(_4a3, _27b2))) throw new Error("bad curve params: a or b");
		/** Asserts coordinate is valid: 0 <= n < Fp.ORDER. */
		function acoord(title, n, banZero = false) {
			if (!Fp.isValid(n) || banZero && Fp.is0(n)) throw new Error(`bad point coordinate ${title}`);
			return n;
		}
		function aprjpoint(other) {
			if (!(other instanceof Point)) throw new Error("ProjectivePoint expected");
		}
		function splitEndoScalarN(k) {
			if (!endo || !endo.basises) throw new Error("no endo");
			return _splitEndoScalar(k, endo.basises, Fn.ORDER);
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { X, Y, Z } = p;
			if (Fp.eql(Z, Fp.ONE)) return {
				x: X,
				y: Y
			};
			const is0 = p.is0();
			if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(Z);
			const x = Fp.mul(X, iz);
			const y = Fp.mul(Y, iz);
			const zz = Fp.mul(Z, iz);
			if (is0) return {
				x: Fp.ZERO,
				y: Fp.ZERO
			};
			if (!Fp.eql(zz, Fp.ONE)) throw new Error("invZ was invalid");
			return {
				x,
				y
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			if (p.is0()) {
				if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y)) return;
				throw new Error("bad point: ZERO");
			}
			const { x, y } = p.toAffine();
			if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error("bad point: x or y not field elements");
			if (!isValidXY(x, y)) throw new Error("bad point: equation left != right");
			if (!p.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
			return true;
		});
		function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
			k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
			k1p = (0, curve_ts_1.negateCt)(k1neg, k1p);
			k2p = (0, curve_ts_1.negateCt)(k2neg, k2p);
			return k1p.add(k2p);
		}
		/**
		* Projective Point works in 3d / projective (homogeneous) coordinates:(X, Y, Z) ∋ (x=X/Z, y=Y/Z).
		* Default Point works in 2d / affine coordinates: (x, y).
		* We're doing calculations in projective, because its operations don't require costly inversion.
		*/
		class Point {
			/** Does NOT validate if the point is valid. Use `.assertValidity()`. */
			constructor(X, Y, Z) {
				this.X = acoord("x", X);
				this.Y = acoord("y", Y, true);
				this.Z = acoord("z", Z);
				Object.freeze(this);
			}
			static CURVE() {
				return CURVE;
			}
			/** Does NOT validate if the point is valid. Use `.assertValidity()`. */
			static fromAffine(p) {
				const { x, y } = p || {};
				if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error("invalid affine point");
				if (p instanceof Point) throw new Error("projective point not allowed");
				if (Fp.is0(x) && Fp.is0(y)) return Point.ZERO;
				return new Point(x, y, Fp.ONE);
			}
			static fromBytes(bytes) {
				const P = Point.fromAffine(decodePoint((0, utils_ts_1._abytes2)(bytes, void 0, "point")));
				P.assertValidity();
				return P;
			}
			static fromHex(hex) {
				return Point.fromBytes((0, utils_ts_1.ensureBytes)("pointHex", hex));
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			/**
			*
			* @param windowSize
			* @param isLazy true will defer table computation until the first multiplication
			* @returns
			*/
			precompute(windowSize = 8, isLazy = true) {
				wnaf.createCache(this, windowSize);
				if (!isLazy) this.multiply(_3n);
				return this;
			}
			/** A point on curve is valid if it conforms to equation. */
			assertValidity() {
				assertValidMemo(this);
			}
			hasEvenY() {
				const { y } = this.toAffine();
				if (!Fp.isOdd) throw new Error("Field doesn't support isOdd");
				return !Fp.isOdd(y);
			}
			/** Compare one point to another. */
			equals(other) {
				aprjpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
				const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
				return U1 && U2;
			}
			/** Flips point to one corresponding to (x, -y) in Affine coordinates. */
			negate() {
				return new Point(this.X, Fp.neg(this.Y), this.Z);
			}
			double() {
				const { a, b } = CURVE;
				const b3 = Fp.mul(b, _3n);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				let t0 = Fp.mul(X1, X1);
				let t1 = Fp.mul(Y1, Y1);
				let t2 = Fp.mul(Z1, Z1);
				let t3 = Fp.mul(X1, Y1);
				t3 = Fp.add(t3, t3);
				Z3 = Fp.mul(X1, Z1);
				Z3 = Fp.add(Z3, Z3);
				X3 = Fp.mul(a, Z3);
				Y3 = Fp.mul(b3, t2);
				Y3 = Fp.add(X3, Y3);
				X3 = Fp.sub(t1, Y3);
				Y3 = Fp.add(t1, Y3);
				Y3 = Fp.mul(X3, Y3);
				X3 = Fp.mul(t3, X3);
				Z3 = Fp.mul(b3, Z3);
				t2 = Fp.mul(a, t2);
				t3 = Fp.sub(t0, t2);
				t3 = Fp.mul(a, t3);
				t3 = Fp.add(t3, Z3);
				Z3 = Fp.add(t0, t0);
				t0 = Fp.add(Z3, t0);
				t0 = Fp.add(t0, t2);
				t0 = Fp.mul(t0, t3);
				Y3 = Fp.add(Y3, t0);
				t2 = Fp.mul(Y1, Z1);
				t2 = Fp.add(t2, t2);
				t0 = Fp.mul(t2, t3);
				X3 = Fp.sub(X3, t0);
				Z3 = Fp.mul(t2, t1);
				Z3 = Fp.add(Z3, Z3);
				Z3 = Fp.add(Z3, Z3);
				return new Point(X3, Y3, Z3);
			}
			add(other) {
				aprjpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				const a = CURVE.a;
				const b3 = Fp.mul(CURVE.b, _3n);
				let t0 = Fp.mul(X1, X2);
				let t1 = Fp.mul(Y1, Y2);
				let t2 = Fp.mul(Z1, Z2);
				let t3 = Fp.add(X1, Y1);
				let t4 = Fp.add(X2, Y2);
				t3 = Fp.mul(t3, t4);
				t4 = Fp.add(t0, t1);
				t3 = Fp.sub(t3, t4);
				t4 = Fp.add(X1, Z1);
				let t5 = Fp.add(X2, Z2);
				t4 = Fp.mul(t4, t5);
				t5 = Fp.add(t0, t2);
				t4 = Fp.sub(t4, t5);
				t5 = Fp.add(Y1, Z1);
				X3 = Fp.add(Y2, Z2);
				t5 = Fp.mul(t5, X3);
				X3 = Fp.add(t1, t2);
				t5 = Fp.sub(t5, X3);
				Z3 = Fp.mul(a, t4);
				X3 = Fp.mul(b3, t2);
				Z3 = Fp.add(X3, Z3);
				X3 = Fp.sub(t1, Z3);
				Z3 = Fp.add(t1, Z3);
				Y3 = Fp.mul(X3, Z3);
				t1 = Fp.add(t0, t0);
				t1 = Fp.add(t1, t0);
				t2 = Fp.mul(a, t2);
				t4 = Fp.mul(b3, t4);
				t1 = Fp.add(t1, t2);
				t2 = Fp.sub(t0, t2);
				t2 = Fp.mul(a, t2);
				t4 = Fp.add(t4, t2);
				t0 = Fp.mul(t1, t4);
				Y3 = Fp.add(Y3, t0);
				t0 = Fp.mul(t5, t4);
				X3 = Fp.mul(t3, X3);
				X3 = Fp.sub(X3, t0);
				t0 = Fp.mul(t3, t1);
				Z3 = Fp.mul(t5, Z3);
				Z3 = Fp.add(Z3, t0);
				return new Point(X3, Y3, Z3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			/**
			* Constant time multiplication.
			* Uses wNAF method. Windowed method may be 10% faster,
			* but takes 2x longer to generate and consumes 2x memory.
			* Uses precomputes when available.
			* Uses endomorphism for Koblitz curves.
			* @param scalar by which the point would be multiplied
			* @returns New point
			*/
			multiply(scalar) {
				const { endo } = extraOpts;
				if (!Fn.isValidNot0(scalar)) throw new Error("invalid scalar: out of range");
				let point, fake;
				const mul = (n) => wnaf.cached(this, n, (p) => (0, curve_ts_1.normalizeZ)(Point, p));
				/** See docs for {@link EndomorphismOpts} */
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
					const { p: k1p, f: k1f } = mul(k1);
					const { p: k2p, f: k2f } = mul(k2);
					fake = k1f.add(k2f);
					point = finishEndo(endo.beta, k1p, k2p, k1neg, k2neg);
				} else {
					const { p, f } = mul(scalar);
					point = p;
					fake = f;
				}
				return (0, curve_ts_1.normalizeZ)(Point, [point, fake])[0];
			}
			/**
			* Non-constant-time multiplication. Uses double-and-add algorithm.
			* It's faster, but should only be used when you don't care about
			* an exposed secret key e.g. sig verification, which works over *public* keys.
			*/
			multiplyUnsafe(sc) {
				const { endo } = extraOpts;
				const p = this;
				if (!Fn.isValid(sc)) throw new Error("invalid scalar: out of range");
				if (sc === _0n || p.is0()) return Point.ZERO;
				if (sc === _1n) return p;
				if (wnaf.hasCache(this)) return this.multiply(sc);
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
					const { p1, p2 } = (0, curve_ts_1.mulEndoUnsafe)(Point, p, k1, k2);
					return finishEndo(endo.beta, p1, p2, k1neg, k2neg);
				} else return wnaf.unsafe(p, sc);
			}
			multiplyAndAddUnsafe(Q, a, b) {
				const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
				return sum.is0() ? void 0 : sum;
			}
			/**
			* Converts Projective point to affine (x, y) coordinates.
			* @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
			*/
			toAffine(invertedZ) {
				return toAffineMemo(this, invertedZ);
			}
			/**
			* Checks whether Point is free of torsion elements (is in prime subgroup).
			* Always torsion-free for cofactor=1 curves.
			*/
			isTorsionFree() {
				const { isTorsionFree } = extraOpts;
				if (cofactor === _1n) return true;
				if (isTorsionFree) return isTorsionFree(Point, this);
				return wnaf.unsafe(this, CURVE_ORDER).is0();
			}
			clearCofactor() {
				const { clearCofactor } = extraOpts;
				if (cofactor === _1n) return this;
				if (clearCofactor) return clearCofactor(Point, this);
				return this.multiplyUnsafe(cofactor);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			toBytes(isCompressed = true) {
				(0, utils_ts_1._abool2)(isCompressed, "isCompressed");
				this.assertValidity();
				return encodePoint(Point, this, isCompressed);
			}
			toHex(isCompressed = true) {
				return (0, utils_ts_1.bytesToHex)(this.toBytes(isCompressed));
			}
			toString() {
				return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
			}
			get px() {
				return this.X;
			}
			get py() {
				return this.X;
			}
			get pz() {
				return this.Z;
			}
			toRawBytes(isCompressed = true) {
				return this.toBytes(isCompressed);
			}
			_setWindowSize(windowSize) {
				this.precompute(windowSize);
			}
			static normalizeZ(points) {
				return (0, curve_ts_1.normalizeZ)(Point, points);
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			static fromPrivateKey(privateKey) {
				return Point.BASE.multiply(_normFnElement(Fn, privateKey));
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
		Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
		Point.Fp = Fp;
		Point.Fn = Fn;
		const bits = Fn.BITS;
		const wnaf = new curve_ts_1.wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
		Point.BASE.precompute(8);
		return Point;
	}
	function pprefix(hasEvenY) {
		return Uint8Array.of(hasEvenY ? 2 : 3);
	}
	/**
	* Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
	* TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
	* b = True and y = sqrt(u / v) if (u / v) is square in F, and
	* b = False and y = sqrt(Z * (u / v)) otherwise.
	* @param Fp
	* @param Z
	* @returns
	*/
	function SWUFpSqrtRatio(Fp, Z) {
		const q = Fp.ORDER;
		let l = _0n;
		for (let o = q - _1n; o % _2n === _0n; o /= _2n) l += _1n;
		const c1 = l;
		const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;
		const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
		const c2 = (q - _1n) / _2n_pow_c1;
		const c3 = (c2 - _1n) / _2n;
		const c4 = _2n_pow_c1 - _1n;
		const c5 = _2n_pow_c1_1;
		const c6 = Fp.pow(Z, c2);
		const c7 = Fp.pow(Z, (c2 + _1n) / _2n);
		let sqrtRatio = (u, v) => {
			let tv1 = c6;
			let tv2 = Fp.pow(v, c4);
			let tv3 = Fp.sqr(tv2);
			tv3 = Fp.mul(tv3, v);
			let tv5 = Fp.mul(u, tv3);
			tv5 = Fp.pow(tv5, c3);
			tv5 = Fp.mul(tv5, tv2);
			tv2 = Fp.mul(tv5, v);
			tv3 = Fp.mul(tv5, u);
			let tv4 = Fp.mul(tv3, tv2);
			tv5 = Fp.pow(tv4, c5);
			let isQR = Fp.eql(tv5, Fp.ONE);
			tv2 = Fp.mul(tv3, c7);
			tv5 = Fp.mul(tv4, tv1);
			tv3 = Fp.cmov(tv2, tv3, isQR);
			tv4 = Fp.cmov(tv5, tv4, isQR);
			for (let i = c1; i > _1n; i--) {
				let tv5 = i - _2n;
				tv5 = _2n << tv5 - _1n;
				let tvv5 = Fp.pow(tv4, tv5);
				const e1 = Fp.eql(tvv5, Fp.ONE);
				tv2 = Fp.mul(tv3, tv1);
				tv1 = Fp.mul(tv1, tv1);
				tvv5 = Fp.mul(tv4, tv1);
				tv3 = Fp.cmov(tv2, tv3, e1);
				tv4 = Fp.cmov(tvv5, tv4, e1);
			}
			return {
				isValid: isQR,
				value: tv3
			};
		};
		if (Fp.ORDER % _4n === _3n) {
			const c1 = (Fp.ORDER - _3n) / _4n;
			const c2 = Fp.sqrt(Fp.neg(Z));
			sqrtRatio = (u, v) => {
				let tv1 = Fp.sqr(v);
				const tv2 = Fp.mul(u, v);
				tv1 = Fp.mul(tv1, tv2);
				let y1 = Fp.pow(tv1, c1);
				y1 = Fp.mul(y1, tv2);
				const y2 = Fp.mul(y1, c2);
				const tv3 = Fp.mul(Fp.sqr(y1), v);
				const isQR = Fp.eql(tv3, u);
				return {
					isValid: isQR,
					value: Fp.cmov(y2, y1, isQR)
				};
			};
		}
		return sqrtRatio;
	}
	/**
	* Simplified Shallue-van de Woestijne-Ulas Method
	* https://www.rfc-editor.org/rfc/rfc9380#section-6.6.2
	*/
	function mapToCurveSimpleSWU(Fp, opts) {
		(0, modular_ts_1.validateField)(Fp);
		const { A, B, Z } = opts;
		if (!Fp.isValid(A) || !Fp.isValid(B) || !Fp.isValid(Z)) throw new Error("mapToCurveSimpleSWU: invalid opts");
		const sqrtRatio = SWUFpSqrtRatio(Fp, Z);
		if (!Fp.isOdd) throw new Error("Field does not have .isOdd()");
		return (u) => {
			let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
			tv1 = Fp.sqr(u);
			tv1 = Fp.mul(tv1, Z);
			tv2 = Fp.sqr(tv1);
			tv2 = Fp.add(tv2, tv1);
			tv3 = Fp.add(tv2, Fp.ONE);
			tv3 = Fp.mul(tv3, B);
			tv4 = Fp.cmov(Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
			tv4 = Fp.mul(tv4, A);
			tv2 = Fp.sqr(tv3);
			tv6 = Fp.sqr(tv4);
			tv5 = Fp.mul(tv6, A);
			tv2 = Fp.add(tv2, tv5);
			tv2 = Fp.mul(tv2, tv3);
			tv6 = Fp.mul(tv6, tv4);
			tv5 = Fp.mul(tv6, B);
			tv2 = Fp.add(tv2, tv5);
			x = Fp.mul(tv1, tv3);
			const { isValid, value } = sqrtRatio(tv2, tv6);
			y = Fp.mul(tv1, u);
			y = Fp.mul(y, value);
			x = Fp.cmov(x, tv3, isValid);
			y = Fp.cmov(y, value, isValid);
			const e1 = Fp.isOdd(u) === Fp.isOdd(y);
			y = Fp.cmov(Fp.neg(y), y, e1);
			const tv4_inv = (0, modular_ts_1.FpInvertBatch)(Fp, [tv4], true)[0];
			x = Fp.mul(x, tv4_inv);
			return {
				x,
				y
			};
		};
	}
	function getWLengths(Fp, Fn) {
		return {
			secretKey: Fn.BYTES,
			publicKey: 1 + Fp.BYTES,
			publicKeyUncompressed: 1 + 2 * Fp.BYTES,
			publicKeyHasPrefix: true,
			signature: 2 * Fn.BYTES
		};
	}
	/**
	* Sometimes users only need getPublicKey, getSharedSecret, and secret key handling.
	* This helper ensures no signature functionality is present. Less code, smaller bundle size.
	*/
	function ecdh(Point, ecdhOpts = {}) {
		const { Fn } = Point;
		const randomBytes_ = ecdhOpts.randomBytes || utils_ts_1.randomBytes;
		const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: (0, modular_ts_1.getMinHashLength)(Fn.ORDER) });
		function isValidSecretKey(secretKey) {
			try {
				return !!_normFnElement(Fn, secretKey);
			} catch (error) {
				return false;
			}
		}
		function isValidPublicKey(publicKey, isCompressed) {
			const { publicKey: comp, publicKeyUncompressed } = lengths;
			try {
				const l = publicKey.length;
				if (isCompressed === true && l !== comp) return false;
				if (isCompressed === false && l !== publicKeyUncompressed) return false;
				return !!Point.fromBytes(publicKey);
			} catch (error) {
				return false;
			}
		}
		/**
		* Produces cryptographically secure secret key from random of size
		* (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
		*/
		function randomSecretKey(seed = randomBytes_(lengths.seed)) {
			return (0, modular_ts_1.mapHashToField)((0, utils_ts_1._abytes2)(seed, lengths.seed, "seed"), Fn.ORDER);
		}
		/**
		* Computes public key for a secret key. Checks for validity of the secret key.
		* @param isCompressed whether to return compact (default), or full key
		* @returns Public key, full when isCompressed=false; short when isCompressed=true
		*/
		function getPublicKey(secretKey, isCompressed = true) {
			return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
		}
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: getPublicKey(secretKey)
			};
		}
		/**
		* Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
		*/
		function isProbPub(item) {
			if (typeof item === "bigint") return false;
			if (item instanceof Point) return true;
			const { secretKey, publicKey, publicKeyUncompressed } = lengths;
			if (Fn.allowedLengths || secretKey === publicKey) return void 0;
			const l = (0, utils_ts_1.ensureBytes)("key", item).length;
			return l === publicKey || l === publicKeyUncompressed;
		}
		/**
		* ECDH (Elliptic Curve Diffie Hellman).
		* Computes shared public key from secret key A and public key B.
		* Checks: 1) secret key validity 2) shared key is on-curve.
		* Does NOT hash the result.
		* @param isCompressed whether to return compact (default), or full key
		* @returns shared public key
		*/
		function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
			if (isProbPub(secretKeyA) === true) throw new Error("first arg must be private key");
			if (isProbPub(publicKeyB) === false) throw new Error("second arg must be public key");
			const s = _normFnElement(Fn, secretKeyA);
			return Point.fromHex(publicKeyB).multiply(s).toBytes(isCompressed);
		}
		return Object.freeze({
			getPublicKey,
			getSharedSecret,
			keygen,
			Point,
			utils: {
				isValidSecretKey,
				isValidPublicKey,
				randomSecretKey,
				isValidPrivateKey: isValidSecretKey,
				randomPrivateKey: randomSecretKey,
				normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
				precompute(windowSize = 8, point = Point.BASE) {
					return point.precompute(windowSize, false);
				}
			},
			lengths
		});
	}
	/**
	* Creates ECDSA signing interface for given elliptic curve `Point` and `hash` function.
	* We need `hash` for 2 features:
	* 1. Message prehash-ing. NOT used if `sign` / `verify` are called with `prehash: false`
	* 2. k generation in `sign`, using HMAC-drbg(hash)
	*
	* ECDSAOpts are only rarely needed.
	*
	* @example
	* ```js
	* const p256_Point = weierstrass(...);
	* const p256_sha256 = ecdsa(p256_Point, sha256);
	* const p256_sha224 = ecdsa(p256_Point, sha224);
	* const p256_sha224_r = ecdsa(p256_Point, sha224, { randomBytes: (length) => { ... } });
	* ```
	*/
	function ecdsa(Point, hash, ecdsaOpts = {}) {
		(0, utils_1.ahash)(hash);
		(0, utils_ts_1._validateObject)(ecdsaOpts, {}, {
			hmac: "function",
			lowS: "boolean",
			randomBytes: "function",
			bits2int: "function",
			bits2int_modN: "function"
		});
		const randomBytes = ecdsaOpts.randomBytes || utils_ts_1.randomBytes;
		const hmac = ecdsaOpts.hmac || ((key, ...msgs) => (0, hmac_js_1.hmac)(hash, key, (0, utils_ts_1.concatBytes)(...msgs)));
		const { Fp, Fn } = Point;
		const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
		const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
		const defaultSigOpts = {
			prehash: false,
			lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
			format: void 0,
			extraEntropy: false
		};
		const defaultSigOpts_format = "compact";
		function isBiggerThanHalfOrder(number) {
			return number > CURVE_ORDER >> _1n;
		}
		function validateRS(title, num) {
			if (!Fn.isValidNot0(num)) throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
			return num;
		}
		function validateSigLength(bytes, format) {
			validateSigFormat(format);
			const size = lengths.signature;
			const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
			return (0, utils_ts_1._abytes2)(bytes, sizer, `${format} signature`);
		}
		/**
		* ECDSA signature with its (r, s) properties. Supports compact, recovered & DER representations.
		*/
		class Signature {
			constructor(r, s, recovery) {
				this.r = validateRS("r", r);
				this.s = validateRS("s", s);
				if (recovery != null) this.recovery = recovery;
				Object.freeze(this);
			}
			static fromBytes(bytes, format = defaultSigOpts_format) {
				validateSigLength(bytes, format);
				let recid;
				if (format === "der") {
					const { r, s } = exports.DER.toSig((0, utils_ts_1._abytes2)(bytes));
					return new Signature(r, s);
				}
				if (format === "recovered") {
					recid = bytes[0];
					format = "compact";
					bytes = bytes.subarray(1);
				}
				const L = Fn.BYTES;
				const r = bytes.subarray(0, L);
				const s = bytes.subarray(L, L * 2);
				return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
			}
			static fromHex(hex, format) {
				return this.fromBytes((0, utils_ts_1.hexToBytes)(hex), format);
			}
			addRecoveryBit(recovery) {
				return new Signature(this.r, this.s, recovery);
			}
			recoverPublicKey(messageHash) {
				const FIELD_ORDER = Fp.ORDER;
				const { r, s, recovery: rec } = this;
				if (rec == null || ![
					0,
					1,
					2,
					3
				].includes(rec)) throw new Error("recovery id invalid");
				if (CURVE_ORDER * _2n < FIELD_ORDER && rec > 1) throw new Error("recovery id is ambiguous for h>1 curve");
				const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
				if (!Fp.isValid(radj)) throw new Error("recovery id 2 or 3 invalid");
				const x = Fp.toBytes(radj);
				const R = Point.fromBytes((0, utils_ts_1.concatBytes)(pprefix((rec & 1) === 0), x));
				const ir = Fn.inv(radj);
				const h = bits2int_modN((0, utils_ts_1.ensureBytes)("msgHash", messageHash));
				const u1 = Fn.create(-h * ir);
				const u2 = Fn.create(s * ir);
				const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
				if (Q.is0()) throw new Error("point at infinify");
				Q.assertValidity();
				return Q;
			}
			hasHighS() {
				return isBiggerThanHalfOrder(this.s);
			}
			toBytes(format = defaultSigOpts_format) {
				validateSigFormat(format);
				if (format === "der") return (0, utils_ts_1.hexToBytes)(exports.DER.hexFromSig(this));
				const r = Fn.toBytes(this.r);
				const s = Fn.toBytes(this.s);
				if (format === "recovered") {
					if (this.recovery == null) throw new Error("recovery bit must be present");
					return (0, utils_ts_1.concatBytes)(Uint8Array.of(this.recovery), r, s);
				}
				return (0, utils_ts_1.concatBytes)(r, s);
			}
			toHex(format) {
				return (0, utils_ts_1.bytesToHex)(this.toBytes(format));
			}
			assertValidity() {}
			static fromCompact(hex) {
				return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "compact");
			}
			static fromDER(hex) {
				return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "der");
			}
			normalizeS() {
				return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
			}
			toDERRawBytes() {
				return this.toBytes("der");
			}
			toDERHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes("der"));
			}
			toCompactRawBytes() {
				return this.toBytes("compact");
			}
			toCompactHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes("compact"));
			}
		}
		const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
			if (bytes.length > 8192) throw new Error("input is too large");
			const num = (0, utils_ts_1.bytesToNumberBE)(bytes);
			const delta = bytes.length * 8 - fnBits;
			return delta > 0 ? num >> BigInt(delta) : num;
		};
		const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
			return Fn.create(bits2int(bytes));
		};
		const ORDER_MASK = (0, utils_ts_1.bitMask)(fnBits);
		/** Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`. */
		function int2octets(num) {
			(0, utils_ts_1.aInRange)("num < 2^" + fnBits, num, _0n, ORDER_MASK);
			return Fn.toBytes(num);
		}
		function validateMsgAndHash(message, prehash) {
			(0, utils_ts_1._abytes2)(message, void 0, "message");
			return prehash ? (0, utils_ts_1._abytes2)(hash(message), void 0, "prehashed message") : message;
		}
		/**
		* Steps A, D of RFC6979 3.2.
		* Creates RFC6979 seed; converts msg/privKey to numbers.
		* Used only in sign, not in verify.
		*
		* Warning: we cannot assume here that message has same amount of bytes as curve order,
		* this will be invalid at least for P521. Also it can be bigger for P224 + SHA256.
		*/
		function prepSig(message, privateKey, opts) {
			if (["recovered", "canonical"].some((k) => k in opts)) throw new Error("sign() legacy options not supported");
			const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
			message = validateMsgAndHash(message, prehash);
			const h1int = bits2int_modN(message);
			const d = _normFnElement(Fn, privateKey);
			const seedArgs = [int2octets(d), int2octets(h1int)];
			if (extraEntropy != null && extraEntropy !== false) {
				const e = extraEntropy === true ? randomBytes(lengths.secretKey) : extraEntropy;
				seedArgs.push((0, utils_ts_1.ensureBytes)("extraEntropy", e));
			}
			const seed = (0, utils_ts_1.concatBytes)(...seedArgs);
			const m = h1int;
			function k2sig(kBytes) {
				const k = bits2int(kBytes);
				if (!Fn.isValidNot0(k)) return;
				const ik = Fn.inv(k);
				const q = Point.BASE.multiply(k).toAffine();
				const r = Fn.create(q.x);
				if (r === _0n) return;
				const s = Fn.create(ik * Fn.create(m + r * d));
				if (s === _0n) return;
				let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n);
				let normS = s;
				if (lowS && isBiggerThanHalfOrder(s)) {
					normS = Fn.neg(s);
					recovery ^= 1;
				}
				return new Signature(r, normS, recovery);
			}
			return {
				seed,
				k2sig
			};
		}
		/**
		* Signs message hash with a secret key.
		*
		* ```
		* sign(m, d) where
		*   k = rfc6979_hmac_drbg(m, d)
		*   (x, y) = G × k
		*   r = x mod n
		*   s = (m + dr) / k mod n
		* ```
		*/
		function sign(message, secretKey, opts = {}) {
			message = (0, utils_ts_1.ensureBytes)("message", message);
			const { seed, k2sig } = prepSig(message, secretKey, opts);
			return (0, utils_ts_1.createHmacDrbg)(hash.outputLen, Fn.BYTES, hmac)(seed, k2sig);
		}
		function tryParsingSig(sg) {
			let sig = void 0;
			const isHex = typeof sg === "string" || (0, utils_ts_1.isBytes)(sg);
			const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
			if (!isHex && !isObj) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
			if (isObj) sig = new Signature(sg.r, sg.s);
			else if (isHex) {
				try {
					sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "der");
				} catch (derError) {
					if (!(derError instanceof exports.DER.Err)) throw derError;
				}
				if (!sig) try {
					sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "compact");
				} catch (error) {
					return false;
				}
			}
			if (!sig) return false;
			return sig;
		}
		/**
		* Verifies a signature against message and public key.
		* Rejects lowS signatures by default: see {@link ECDSAVerifyOpts}.
		* Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
		*
		* ```
		* verify(r, s, h, P) where
		*   u1 = hs^-1 mod n
		*   u2 = rs^-1 mod n
		*   R = u1⋅G + u2⋅P
		*   mod(R.x, n) == r
		* ```
		*/
		function verify(signature, message, publicKey, opts = {}) {
			const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey);
			message = validateMsgAndHash((0, utils_ts_1.ensureBytes)("message", message), prehash);
			if ("strict" in opts) throw new Error("options.strict was renamed to lowS");
			const sig = format === void 0 ? tryParsingSig(signature) : Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", signature), format);
			if (sig === false) return false;
			try {
				const P = Point.fromBytes(publicKey);
				if (lowS && sig.hasHighS()) return false;
				const { r, s } = sig;
				const h = bits2int_modN(message);
				const is = Fn.inv(s);
				const u1 = Fn.create(h * is);
				const u2 = Fn.create(r * is);
				const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
				if (R.is0()) return false;
				return Fn.create(R.x) === r;
			} catch (e) {
				return false;
			}
		}
		function recoverPublicKey(signature, message, opts = {}) {
			const { prehash } = validateSigOpts(opts, defaultSigOpts);
			message = validateMsgAndHash(message, prehash);
			return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
		}
		return Object.freeze({
			keygen,
			getPublicKey,
			getSharedSecret,
			utils,
			lengths,
			Point,
			sign,
			verify,
			recoverPublicKey,
			Signature,
			hash
		});
	}
	/** @deprecated use `weierstrass` in newer releases */
	function weierstrassPoints(c) {
		const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
		return _weierstrass_new_output_to_legacy(c, weierstrassN(CURVE, curveOpts));
	}
	function _weierstrass_legacy_opts_to_new(c) {
		const CURVE = {
			a: c.a,
			b: c.b,
			p: c.Fp.ORDER,
			n: c.n,
			h: c.h,
			Gx: c.Gx,
			Gy: c.Gy
		};
		const Fp = c.Fp;
		let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
		return {
			CURVE,
			curveOpts: {
				Fp,
				Fn: (0, modular_ts_1.Field)(CURVE.n, {
					BITS: c.nBitLength,
					allowedLengths,
					modFromBytes: c.wrapPrivateKey
				}),
				allowInfinityPoint: c.allowInfinityPoint,
				endo: c.endo,
				isTorsionFree: c.isTorsionFree,
				clearCofactor: c.clearCofactor,
				fromBytes: c.fromBytes,
				toBytes: c.toBytes
			}
		};
	}
	function _ecdsa_legacy_opts_to_new(c) {
		const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
		const ecdsaOpts = {
			hmac: c.hmac,
			randomBytes: c.randomBytes,
			lowS: c.lowS,
			bits2int: c.bits2int,
			bits2int_modN: c.bits2int_modN
		};
		return {
			CURVE,
			curveOpts,
			hash: c.hash,
			ecdsaOpts
		};
	}
	function _legacyHelperEquat(Fp, a, b) {
		/**
		* y² = x³ + ax + b: Short weierstrass curve formula. Takes x, returns y².
		* @returns y²
		*/
		function weierstrassEquation(x) {
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
		}
		return weierstrassEquation;
	}
	function _weierstrass_new_output_to_legacy(c, Point) {
		const { Fp, Fn } = Point;
		function isWithinCurveOrder(num) {
			return (0, utils_ts_1.inRange)(num, _1n, Fn.ORDER);
		}
		const weierstrassEquation = _legacyHelperEquat(Fp, c.a, c.b);
		return Object.assign({}, {
			CURVE: c,
			Point,
			ProjectivePoint: Point,
			normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
			weierstrassEquation,
			isWithinCurveOrder
		});
	}
	function _ecdsa_new_output_to_legacy(c, _ecdsa) {
		const Point = _ecdsa.Point;
		return Object.assign({}, _ecdsa, {
			ProjectivePoint: Point,
			CURVE: Object.assign({}, c, (0, modular_ts_1.nLength)(Point.Fn.ORDER, Point.Fn.BITS))
		});
	}
	function weierstrass(c) {
		const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
		return _ecdsa_new_output_to_legacy(c, ecdsa(weierstrassN(CURVE, curveOpts), hash, ecdsaOpts));
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/_shortw_utils.js
var require__shortw_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getHash = getHash;
	exports.createCurve = createCurve;
	/**
	* Utilities for short weierstrass curves, combined with noble-hashes.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var weierstrass_ts_1 = require_weierstrass$1();
	/** connects noble-curves to noble-hashes */
	function getHash(hash) {
		return { hash };
	}
	/** @deprecated use new `weierstrass()` and `ecdsa()` methods */
	function createCurve(curveDef, defHash) {
		const create = (hash) => (0, weierstrass_ts_1.weierstrass)({
			...curveDef,
			hash
		});
		return {
			...create(defHash),
			create
		};
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/abstract/hash-to-curve.js
var require_hash_to_curve$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._DST_scalar = void 0;
	exports.expand_message_xmd = expand_message_xmd;
	exports.expand_message_xof = expand_message_xof;
	exports.hash_to_field = hash_to_field;
	exports.isogenyMap = isogenyMap;
	exports.createHasher = createHasher;
	var utils_ts_1 = require_utils$1();
	var modular_ts_1 = require_modular$1();
	var os2ip = utils_ts_1.bytesToNumberBE;
	function i2osp(value, length) {
		anum(value);
		anum(length);
		if (value < 0 || value >= 1 << 8 * length) throw new Error("invalid I2OSP input: " + value);
		const res = Array.from({ length }).fill(0);
		for (let i = length - 1; i >= 0; i--) {
			res[i] = value & 255;
			value >>>= 8;
		}
		return new Uint8Array(res);
	}
	function strxor(a, b) {
		const arr = new Uint8Array(a.length);
		for (let i = 0; i < a.length; i++) arr[i] = a[i] ^ b[i];
		return arr;
	}
	function anum(item) {
		if (!Number.isSafeInteger(item)) throw new Error("number expected");
	}
	function normDST(DST) {
		if (!(0, utils_ts_1.isBytes)(DST) && typeof DST !== "string") throw new Error("DST must be Uint8Array or string");
		return typeof DST === "string" ? (0, utils_ts_1.utf8ToBytes)(DST) : DST;
	}
	/**
	* Produces a uniformly random byte string using a cryptographic hash function H that outputs b bits.
	* [RFC 9380 5.3.1](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.1).
	*/
	function expand_message_xmd(msg, DST, lenInBytes, H) {
		(0, utils_ts_1.abytes)(msg);
		anum(lenInBytes);
		DST = normDST(DST);
		if (DST.length > 255) DST = H((0, utils_ts_1.concatBytes)((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-"), DST));
		const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
		const ell = Math.ceil(lenInBytes / b_in_bytes);
		if (lenInBytes > 65535 || ell > 255) throw new Error("expand_message_xmd: invalid lenInBytes");
		const DST_prime = (0, utils_ts_1.concatBytes)(DST, i2osp(DST.length, 1));
		const Z_pad = i2osp(0, r_in_bytes);
		const l_i_b_str = i2osp(lenInBytes, 2);
		const b = new Array(ell);
		const b_0 = H((0, utils_ts_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
		b[0] = H((0, utils_ts_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
		for (let i = 1; i <= ell; i++) {
			const args = [
				strxor(b_0, b[i - 1]),
				i2osp(i + 1, 1),
				DST_prime
			];
			b[i] = H((0, utils_ts_1.concatBytes)(...args));
		}
		return (0, utils_ts_1.concatBytes)(...b).slice(0, lenInBytes);
	}
	/**
	* Produces a uniformly random byte string using an extendable-output function (XOF) H.
	* 1. The collision resistance of H MUST be at least k bits.
	* 2. H MUST be an XOF that has been proved indifferentiable from
	*    a random oracle under a reasonable cryptographic assumption.
	* [RFC 9380 5.3.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.2).
	*/
	function expand_message_xof(msg, DST, lenInBytes, k, H) {
		(0, utils_ts_1.abytes)(msg);
		anum(lenInBytes);
		DST = normDST(DST);
		if (DST.length > 255) {
			const dkLen = Math.ceil(2 * k / 8);
			DST = H.create({ dkLen }).update((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-")).update(DST).digest();
		}
		if (lenInBytes > 65535 || DST.length > 255) throw new Error("expand_message_xof: invalid lenInBytes");
		return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
	}
	/**
	* Hashes arbitrary-length byte strings to a list of one or more elements of a finite field F.
	* [RFC 9380 5.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.2).
	* @param msg a byte string containing the message to hash
	* @param count the number of elements of F to output
	* @param options `{DST: string, p: bigint, m: number, k: number, expand: 'xmd' | 'xof', hash: H}`, see above
	* @returns [u_0, ..., u_(count - 1)], a list of field elements.
	*/
	function hash_to_field(msg, count, options) {
		(0, utils_ts_1._validateObject)(options, {
			p: "bigint",
			m: "number",
			k: "number",
			hash: "function"
		});
		const { p, k, m, hash, expand, DST } = options;
		if (!(0, utils_ts_1.isHash)(options.hash)) throw new Error("expected valid hash");
		(0, utils_ts_1.abytes)(msg);
		anum(count);
		const log2p = p.toString(2).length;
		const L = Math.ceil((log2p + k) / 8);
		const len_in_bytes = count * m * L;
		let prb;
		if (expand === "xmd") prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
		else if (expand === "xof") prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
		else if (expand === "_internal_pass") prb = msg;
		else throw new Error("expand must be \"xmd\" or \"xof\"");
		const u = new Array(count);
		for (let i = 0; i < count; i++) {
			const e = new Array(m);
			for (let j = 0; j < m; j++) {
				const elm_offset = L * (j + i * m);
				const tv = prb.subarray(elm_offset, elm_offset + L);
				e[j] = (0, modular_ts_1.mod)(os2ip(tv), p);
			}
			u[i] = e;
		}
		return u;
	}
	function isogenyMap(field, map) {
		const coeff = map.map((i) => Array.from(i).reverse());
		return (x, y) => {
			const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
			const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(field, [xd, yd], true);
			x = field.mul(xn, xd_inv);
			y = field.mul(y, field.mul(yn, yd_inv));
			return {
				x,
				y
			};
		};
	}
	exports._DST_scalar = (0, utils_ts_1.utf8ToBytes)("HashToScalar-");
	/** Creates hash-to-curve methods from EC Point and mapToCurve function. See {@link H2CHasher}. */
	function createHasher(Point, mapToCurve, defaults) {
		if (typeof mapToCurve !== "function") throw new Error("mapToCurve() must be defined");
		function map(num) {
			return Point.fromAffine(mapToCurve(num));
		}
		function clear(initial) {
			const P = initial.clearCofactor();
			if (P.equals(Point.ZERO)) return Point.ZERO;
			P.assertValidity();
			return P;
		}
		return {
			defaults,
			hashToCurve(msg, options) {
				const u = hash_to_field(msg, 2, Object.assign({}, defaults, options));
				const u0 = map(u[0]);
				const u1 = map(u[1]);
				return clear(u0.add(u1));
			},
			encodeToCurve(msg, options) {
				const optsDst = defaults.encodeDST ? { DST: defaults.encodeDST } : {};
				return clear(map(hash_to_field(msg, 1, Object.assign({}, defaults, optsDst, options))[0]));
			},
			/** See {@link H2CHasher} */
			mapToCurve(scalars) {
				if (!Array.isArray(scalars)) throw new Error("expected array of bigints");
				for (const i of scalars) if (typeof i !== "bigint") throw new Error("expected array of bigints");
				return clear(map(scalars));
			},
			hashToScalar(msg, options) {
				const N = Point.Fn.ORDER;
				return hash_to_field(msg, 1, Object.assign({}, defaults, {
					p: N,
					m: 1,
					DST: exports._DST_scalar
				}, options))[0][0];
			}
		};
	}
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/curves/secp256k1.js
var require_secp256k1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeToCurve = exports.hashToCurve = exports.secp256k1_hasher = exports.schnorr = exports.secp256k1 = void 0;
	/**
	* SECG secp256k1. See [pdf](https://www.secg.org/sec2-v2.pdf).
	*
	* Belongs to Koblitz curves: it has efficiently-computable GLV endomorphism ψ,
	* check out {@link EndomorphismOpts}. Seems to be rigid (not backdoored).
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_js_1 = require_sha2$1();
	var utils_js_1 = require_utils$2();
	var _shortw_utils_ts_1 = require__shortw_utils$1();
	var hash_to_curve_ts_1 = require_hash_to_curve$1();
	var modular_ts_1 = require_modular$1();
	var weierstrass_ts_1 = require_weierstrass$1();
	var utils_ts_1 = require_utils$1();
	var secp256k1_CURVE = {
		p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
		n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
		h: BigInt(1),
		a: BigInt(0),
		b: BigInt(7),
		Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
		Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
	};
	var secp256k1_ENDO = {
		beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
		basises: [[BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")], [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]]
	};
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = /* @__PURE__ */ BigInt(1);
	var _2n = /* @__PURE__ */ BigInt(2);
	/**
	* √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
	* (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
	*/
	function sqrtMod(y) {
		const P = secp256k1_CURVE.p;
		const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
		const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
		const b2 = y * y * y % P;
		const b3 = b2 * b2 * y % P;
		const b6 = (0, modular_ts_1.pow2)(b3, _3n, P) * b3 % P;
		const b9 = (0, modular_ts_1.pow2)(b6, _3n, P) * b3 % P;
		const b11 = (0, modular_ts_1.pow2)(b9, _2n, P) * b2 % P;
		const b22 = (0, modular_ts_1.pow2)(b11, _11n, P) * b11 % P;
		const b44 = (0, modular_ts_1.pow2)(b22, _22n, P) * b22 % P;
		const b88 = (0, modular_ts_1.pow2)(b44, _44n, P) * b44 % P;
		const b176 = (0, modular_ts_1.pow2)(b88, _88n, P) * b88 % P;
		const b220 = (0, modular_ts_1.pow2)(b176, _44n, P) * b44 % P;
		const b223 = (0, modular_ts_1.pow2)(b220, _3n, P) * b3 % P;
		const t1 = (0, modular_ts_1.pow2)(b223, _23n, P) * b22 % P;
		const t2 = (0, modular_ts_1.pow2)(t1, _6n, P) * b2 % P;
		const root = (0, modular_ts_1.pow2)(t2, _2n, P);
		if (!Fpk1.eql(Fpk1.sqr(root), y)) throw new Error("Cannot find square root");
		return root;
	}
	var Fpk1 = (0, modular_ts_1.Field)(secp256k1_CURVE.p, { sqrt: sqrtMod });
	/**
	* secp256k1 curve, ECDSA and ECDH methods.
	*
	* Field: `2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n`
	*
	* @example
	* ```js
	* import { secp256k1 } from '@noble/curves/secp256k1';
	* const { secretKey, publicKey } = secp256k1.keygen();
	* const msg = new TextEncoder().encode('hello');
	* const sig = secp256k1.sign(msg, secretKey);
	* const isValid = secp256k1.verify(sig, msg, publicKey) === true;
	* ```
	*/
	exports.secp256k1 = (0, _shortw_utils_ts_1.createCurve)({
		...secp256k1_CURVE,
		Fp: Fpk1,
		lowS: true,
		endo: secp256k1_ENDO
	}, sha2_js_1.sha256);
	/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
	var TAGGED_HASH_PREFIXES = {};
	function taggedHash(tag, ...messages) {
		let tagP = TAGGED_HASH_PREFIXES[tag];
		if (tagP === void 0) {
			const tagH = (0, sha2_js_1.sha256)((0, utils_ts_1.utf8ToBytes)(tag));
			tagP = (0, utils_ts_1.concatBytes)(tagH, tagH);
			TAGGED_HASH_PREFIXES[tag] = tagP;
		}
		return (0, sha2_js_1.sha256)((0, utils_ts_1.concatBytes)(tagP, ...messages));
	}
	var pointToBytes = (point) => point.toBytes(true).slice(1);
	var Pointk1 = /* @__PURE__ */ (() => exports.secp256k1.Point)();
	var hasEven = (y) => y % _2n === _0n;
	function schnorrGetExtPubKey(priv) {
		const { Fn, BASE } = Pointk1;
		const d_ = (0, weierstrass_ts_1._normFnElement)(Fn, priv);
		const p = BASE.multiply(d_);
		return {
			scalar: hasEven(p.y) ? d_ : Fn.neg(d_),
			bytes: pointToBytes(p)
		};
	}
	/**
	* lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
	* @returns valid point checked for being on-curve
	*/
	function lift_x(x) {
		const Fp = Fpk1;
		if (!Fp.isValidNot0(x)) throw new Error("invalid x: Fail if x ≥ p");
		const xx = Fp.create(x * x);
		const c = Fp.create(xx * x + BigInt(7));
		let y = Fp.sqrt(c);
		if (!hasEven(y)) y = Fp.neg(y);
		const p = Pointk1.fromAffine({
			x,
			y
		});
		p.assertValidity();
		return p;
	}
	var num = utils_ts_1.bytesToNumberBE;
	/**
	* Create tagged hash, convert it to bigint, reduce modulo-n.
	*/
	function challenge(...args) {
		return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
	}
	/**
	* Schnorr public key is just `x` coordinate of Point as per BIP340.
	*/
	function schnorrGetPublicKey(secretKey) {
		return schnorrGetExtPubKey(secretKey).bytes;
	}
	/**
	* Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
	* auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
	*/
	function schnorrSign(message, secretKey, auxRand = (0, utils_js_1.randomBytes)(32)) {
		const { Fn } = Pointk1;
		const m = (0, utils_ts_1.ensureBytes)("message", message);
		const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
		const a = (0, utils_ts_1.ensureBytes)("auxRand", auxRand, 32);
		const { bytes: rx, scalar: k } = schnorrGetExtPubKey(taggedHash("BIP0340/nonce", Fn.toBytes(d ^ num(taggedHash("BIP0340/aux", a))), px, m));
		const e = challenge(rx, px, m);
		const sig = /* @__PURE__ */ new Uint8Array(64);
		sig.set(rx, 0);
		sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
		if (!schnorrVerify(sig, m, px)) throw new Error("sign: Invalid signature produced");
		return sig;
	}
	/**
	* Verifies Schnorr signature.
	* Will swallow errors & return false except for initial type validation of arguments.
	*/
	function schnorrVerify(signature, message, publicKey) {
		const { Fn, BASE } = Pointk1;
		const sig = (0, utils_ts_1.ensureBytes)("signature", signature, 64);
		const m = (0, utils_ts_1.ensureBytes)("message", message);
		const pub = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, 32);
		try {
			const P = lift_x(num(pub));
			const r = num(sig.subarray(0, 32));
			if (!(0, utils_ts_1.inRange)(r, _1n, secp256k1_CURVE.p)) return false;
			const s = num(sig.subarray(32, 64));
			if (!(0, utils_ts_1.inRange)(s, _1n, secp256k1_CURVE.n)) return false;
			const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
			const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
			const { x, y } = R.toAffine();
			if (R.is0() || !hasEven(y) || x !== r) return false;
			return true;
		} catch (error) {
			return false;
		}
	}
	/**
	* Schnorr signatures over secp256k1.
	* https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
	* @example
	* ```js
	* import { schnorr } from '@noble/curves/secp256k1';
	* const { secretKey, publicKey } = schnorr.keygen();
	* // const publicKey = schnorr.getPublicKey(secretKey);
	* const msg = new TextEncoder().encode('hello');
	* const sig = schnorr.sign(msg, secretKey);
	* const isValid = schnorr.verify(sig, msg, publicKey);
	* ```
	*/
	exports.schnorr = (() => {
		const size = 32;
		const seedLength = 48;
		const randomSecretKey = (seed = (0, utils_js_1.randomBytes)(seedLength)) => {
			return (0, modular_ts_1.mapHashToField)(seed, secp256k1_CURVE.n);
		};
		exports.secp256k1.utils.randomSecretKey;
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: schnorrGetPublicKey(secretKey)
			};
		}
		return {
			keygen,
			getPublicKey: schnorrGetPublicKey,
			sign: schnorrSign,
			verify: schnorrVerify,
			Point: Pointk1,
			utils: {
				randomSecretKey,
				randomPrivateKey: randomSecretKey,
				taggedHash,
				lift_x,
				pointToBytes,
				numberToBytesBE: utils_ts_1.numberToBytesBE,
				bytesToNumberBE: utils_ts_1.bytesToNumberBE,
				mod: modular_ts_1.mod
			},
			lengths: {
				secretKey: size,
				publicKey: size,
				publicKeyHasPrefix: false,
				signature: 64,
				seed: seedLength
			}
		};
	})();
	var isoMap = /* @__PURE__ */ (() => (0, hash_to_curve_ts_1.isogenyMap)(Fpk1, [
		[
			"0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
			"0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
			"0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
			"0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
		],
		[
			"0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
			"0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
			"0x0000000000000000000000000000000000000000000000000000000000000001"
		],
		[
			"0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
			"0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
			"0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
			"0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
		],
		[
			"0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
			"0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
			"0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
			"0x0000000000000000000000000000000000000000000000000000000000000001"
		]
	].map((i) => i.map((j) => BigInt(j)))))();
	var mapSWU = /* @__PURE__ */ (() => (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fpk1, {
		A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
		B: BigInt("1771"),
		Z: Fpk1.create(BigInt("-11"))
	}))();
	/** Hashing / encoding to secp256k1 points / field. RFC 9380 methods. */
	exports.secp256k1_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.secp256k1.Point, (scalars) => {
		const { x, y } = mapSWU(Fpk1.create(scalars[0]));
		return isoMap(x, y);
	}, {
		DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
		encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
		p: Fpk1.ORDER,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_js_1.sha256
	}))();
	/** @deprecated use `import { secp256k1_hasher } from '@noble/curves/secp256k1.js';` */
	exports.hashToCurve = (() => exports.secp256k1_hasher.hashToCurve)();
	/** @deprecated use `import { secp256k1_hasher } from '@noble/curves/secp256k1.js';` */
	exports.encodeToCurve = (() => exports.secp256k1_hasher.encodeToCurve)();
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/nist.js
var require_nist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p521_hasher = exports.secp521r1 = exports.p521 = exports.p384_hasher = exports.secp384r1 = exports.p384 = exports.p256_hasher = exports.secp256r1 = exports.p256 = void 0;
	/**
	* Internal module for NIST P256, P384, P521 curves.
	* Do not use for now.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_1 = require_sha2$2();
	var _shortw_utils_ts_1 = require__shortw_utils$2();
	var hash_to_curve_ts_1 = require_hash_to_curve$2();
	var modular_ts_1 = require_modular$2();
	var weierstrass_ts_1 = require_weierstrass$2();
	var Fp256 = (0, modular_ts_1.Field)(BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"));
	var p256_a = Fp256.create(BigInt("-3"));
	var p256_b = BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b");
	/**
	* secp256r1 curve, ECDSA and ECDH methods.
	* Field: `2n**224n * (2n**32n-1n) + 2n**192n + 2n**96n-1n`
	*/
	exports.p256 = (0, _shortw_utils_ts_1.createCurve)({
		a: p256_a,
		b: p256_b,
		Fp: Fp256,
		n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
		Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
		Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
		h: BigInt(1),
		lowS: false
	}, sha2_1.sha256);
	/** Alias to p256. */
	exports.secp256r1 = exports.p256;
	var p256_mapSWU = /* @__PURE__ */ (() => (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fp256, {
		A: p256_a,
		B: p256_b,
		Z: Fp256.create(BigInt("-10"))
	}))();
	/** Hashing / encoding to p256 points / field. RFC 9380 methods. */
	exports.p256_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.secp256r1.ProjectivePoint, (scalars) => p256_mapSWU(scalars[0]), {
		DST: "P256_XMD:SHA-256_SSWU_RO_",
		encodeDST: "P256_XMD:SHA-256_SSWU_NU_",
		p: Fp256.ORDER,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_1.sha256
	}))();
	var Fp384 = (0, modular_ts_1.Field)(BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"));
	var p384_a = Fp384.create(BigInt("-3"));
	var p384_b = BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef");
	/**
	* secp384r1 curve, ECDSA and ECDH methods.
	* Field: `2n**384n - 2n**128n - 2n**96n + 2n**32n - 1n`.
	* */
	exports.p384 = (0, _shortw_utils_ts_1.createCurve)({
		a: p384_a,
		b: p384_b,
		Fp: Fp384,
		n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
		Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
		Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
		h: BigInt(1),
		lowS: false
	}, sha2_1.sha384);
	/** Alias to p384. */
	exports.secp384r1 = exports.p384;
	var p384_mapSWU = /* @__PURE__ */ (() => (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fp384, {
		A: p384_a,
		B: p384_b,
		Z: Fp384.create(BigInt("-12"))
	}))();
	/** Hashing / encoding to p384 points / field. RFC 9380 methods. */
	exports.p384_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.secp384r1.ProjectivePoint, (scalars) => p384_mapSWU(scalars[0]), {
		DST: "P384_XMD:SHA-384_SSWU_RO_",
		encodeDST: "P384_XMD:SHA-384_SSWU_NU_",
		p: Fp384.ORDER,
		m: 1,
		k: 192,
		expand: "xmd",
		hash: sha2_1.sha384
	}))();
	var Fp521 = (0, modular_ts_1.Field)(BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
	var p521_a = Fp521.create(BigInt("-3"));
	var p521_b = BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00");
	/**
	* NIST secp521r1 aka p521 curve, ECDSA and ECDH methods.
	* Field: `2n**521n - 1n`.
	*/
	exports.p521 = (0, _shortw_utils_ts_1.createCurve)({
		a: p521_a,
		b: p521_b,
		Fp: Fp521,
		n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
		Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
		Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650"),
		h: BigInt(1),
		lowS: false,
		allowedPrivateKeyLengths: [
			130,
			131,
			132
		]
	}, sha2_1.sha512);
	/** Alias to p521. */
	exports.secp521r1 = exports.p521;
	var p521_mapSWU = /* @__PURE__ */ (() => (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fp521, {
		A: p521_a,
		B: p521_b,
		Z: Fp521.create(BigInt("-4"))
	}))();
	/** Hashing / encoding to p521 points / field. RFC 9380 methods. */
	exports.p521_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.secp521r1.ProjectivePoint, (scalars) => p521_mapSWU(scalars[0]), {
		DST: "P521_XMD:SHA-512_SSWU_RO_",
		encodeDST: "P521_XMD:SHA-512_SSWU_NU_",
		p: Fp521.ORDER,
		m: 1,
		k: 256,
		expand: "xmd",
		hash: sha2_1.sha512
	}))();
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/curves/p256.js
var require_p256$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeToCurve = exports.hashToCurve = exports.secp256r1 = exports.p256 = void 0;
	var nist_ts_1 = require_nist$1();
	exports.p256 = nist_ts_1.p256;
	exports.secp256r1 = nist_ts_1.p256;
	exports.hashToCurve = (() => nist_ts_1.p256_hasher.hashToCurve)();
	exports.encodeToCurve = (() => nist_ts_1.p256_hasher.encodeToCurve)();
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/_md.js
var require__md = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SHA512_IV = exports.SHA384_IV = exports.SHA224_IV = exports.SHA256_IV = exports.HashMD = void 0;
	exports.setBigUint64 = setBigUint64;
	exports.Chi = Chi;
	exports.Maj = Maj;
	/**
	* Internal Merkle-Damgard hash utils.
	* @module
	*/
	var utils_ts_1 = require_utils$5();
	/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
	function setBigUint64(view, byteOffset, value, isLE) {
		if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE);
		const _32n = BigInt(32);
		const _u32_max = BigInt(4294967295);
		const wh = Number(value >> _32n & _u32_max);
		const wl = Number(value & _u32_max);
		const h = isLE ? 4 : 0;
		const l = isLE ? 0 : 4;
		view.setUint32(byteOffset + h, wh, isLE);
		view.setUint32(byteOffset + l, wl, isLE);
	}
	/** Choice: a ? b : c */
	function Chi(a, b, c) {
		return a & b ^ ~a & c;
	}
	/** Majority function, true if any two inputs is true. */
	function Maj(a, b, c) {
		return a & b ^ a & c ^ b & c;
	}
	/**
	* Merkle-Damgard hash construction base class.
	* Could be used to create MD5, RIPEMD, SHA1, SHA2.
	*/
	var HashMD = class extends utils_ts_1.Hash {
		constructor(blockLen, outputLen, padOffset, isLE) {
			super();
			this.finished = false;
			this.length = 0;
			this.pos = 0;
			this.destroyed = false;
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.padOffset = padOffset;
			this.isLE = isLE;
			this.buffer = new Uint8Array(blockLen);
			this.view = (0, utils_ts_1.createView)(this.buffer);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { view, buffer, blockLen } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					const dataView = (0, utils_ts_1.createView)(data);
					for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(view, 0);
					this.pos = 0;
				}
			}
			this.length += data.length;
			this.roundClean();
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { buffer, view, blockLen, isLE } = this;
			let { pos } = this;
			buffer[pos++] = 128;
			(0, utils_ts_1.clean)(this.buffer.subarray(pos));
			if (this.padOffset > blockLen - pos) {
				this.process(view, 0);
				pos = 0;
			}
			for (let i = pos; i < blockLen; i++) buffer[i] = 0;
			setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
			this.process(view, 0);
			const oview = (0, utils_ts_1.createView)(out);
			const len = this.outputLen;
			if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
			const outLen = len / 4;
			const state = this.get();
			if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
			for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			to || (to = new this.constructor());
			to.set(...this.get());
			const { blockLen, buffer, length, finished, destroyed, pos } = this;
			to.destroyed = destroyed;
			to.finished = finished;
			to.length = length;
			to.pos = pos;
			if (length % blockLen) to.buffer.set(buffer);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
	};
	exports.HashMD = HashMD;
	/**
	* Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
	* Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
	*/
	/** Initial SHA256 state. Bits 0..32 of frac part of sqrt of primes 2..19 */
	exports.SHA256_IV = Uint32Array.from([
		1779033703,
		3144134277,
		1013904242,
		2773480762,
		1359893119,
		2600822924,
		528734635,
		1541459225
	]);
	/** Initial SHA224 state. Bits 32..64 of frac part of sqrt of primes 23..53 */
	exports.SHA224_IV = Uint32Array.from([
		3238371032,
		914150663,
		812702999,
		4144912697,
		4290775857,
		1750603025,
		1694076839,
		3204075428
	]);
	/** Initial SHA384 state. Bits 0..64 of frac part of sqrt of primes 23..53 */
	exports.SHA384_IV = Uint32Array.from([
		3418070365,
		3238371032,
		1654270250,
		914150663,
		2438529370,
		812702999,
		355462360,
		4144912697,
		1731405415,
		4290775857,
		2394180231,
		1750603025,
		3675008525,
		1694076839,
		1203062813,
		3204075428
	]);
	/** Initial SHA512 state. Bits 0..64 of frac part of sqrt of primes 2..19 */
	exports.SHA512_IV = Uint32Array.from([
		1779033703,
		4089235720,
		3144134277,
		2227873595,
		1013904242,
		4271175723,
		2773480762,
		1595750129,
		1359893119,
		2917565137,
		2600822924,
		725511199,
		528734635,
		4215389547,
		1541459225,
		327033209
	]);
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/sha2.js
var require_sha2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512_224 = exports.sha512_256 = exports.sha384 = exports.sha512 = exports.sha224 = exports.sha256 = exports.SHA512_256 = exports.SHA512_224 = exports.SHA384 = exports.SHA512 = exports.SHA224 = exports.SHA256 = void 0;
	/**
	* SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
	* SHA256 is the fastest hash implementable in JS, even faster than Blake3.
	* Check out [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and
	* [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
	* @module
	*/
	var _md_ts_1 = require__md();
	var u64 = require__u64$2();
	var utils_ts_1 = require_utils$5();
	/**
	* Round constants:
	* First 32 bits of fractional parts of the cube roots of the first 64 primes 2..311)
	*/
	var SHA256_K = /* @__PURE__ */ Uint32Array.from([
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	]);
	/** Reusable temporary buffer. "W" comes straight from spec. */
	var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
	var SHA256 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 32) {
			super(64, outputLen, 8, false);
			this.A = _md_ts_1.SHA256_IV[0] | 0;
			this.B = _md_ts_1.SHA256_IV[1] | 0;
			this.C = _md_ts_1.SHA256_IV[2] | 0;
			this.D = _md_ts_1.SHA256_IV[3] | 0;
			this.E = _md_ts_1.SHA256_IV[4] | 0;
			this.F = _md_ts_1.SHA256_IV[5] | 0;
			this.G = _md_ts_1.SHA256_IV[6] | 0;
			this.H = _md_ts_1.SHA256_IV[7] | 0;
		}
		get() {
			const { A, B, C, D, E, F, G, H } = this;
			return [
				A,
				B,
				C,
				D,
				E,
				F,
				G,
				H
			];
		}
		set(A, B, C, D, E, F, G, H) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
			this.F = F | 0;
			this.G = G | 0;
			this.H = H | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 64; i++) {
				const W15 = SHA256_W[i - 15];
				const W2 = SHA256_W[i - 2];
				const s0 = (0, utils_ts_1.rotr)(W15, 7) ^ (0, utils_ts_1.rotr)(W15, 18) ^ W15 >>> 3;
				const s1 = (0, utils_ts_1.rotr)(W2, 17) ^ (0, utils_ts_1.rotr)(W2, 19) ^ W2 >>> 10;
				SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
			}
			let { A, B, C, D, E, F, G, H } = this;
			for (let i = 0; i < 64; i++) {
				const sigma1 = (0, utils_ts_1.rotr)(E, 6) ^ (0, utils_ts_1.rotr)(E, 11) ^ (0, utils_ts_1.rotr)(E, 25);
				const T1 = H + sigma1 + (0, _md_ts_1.Chi)(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
				const T2 = ((0, utils_ts_1.rotr)(A, 2) ^ (0, utils_ts_1.rotr)(A, 13) ^ (0, utils_ts_1.rotr)(A, 22)) + (0, _md_ts_1.Maj)(A, B, C) | 0;
				H = G;
				G = F;
				F = E;
				E = D + T1 | 0;
				D = C;
				C = B;
				B = A;
				A = T1 + T2 | 0;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			F = F + this.F | 0;
			G = G + this.G | 0;
			H = H + this.H | 0;
			this.set(A, B, C, D, E, F, G, H);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA256_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA256 = SHA256;
	var SHA224 = class extends SHA256 {
		constructor() {
			super(28);
			this.A = _md_ts_1.SHA224_IV[0] | 0;
			this.B = _md_ts_1.SHA224_IV[1] | 0;
			this.C = _md_ts_1.SHA224_IV[2] | 0;
			this.D = _md_ts_1.SHA224_IV[3] | 0;
			this.E = _md_ts_1.SHA224_IV[4] | 0;
			this.F = _md_ts_1.SHA224_IV[5] | 0;
			this.G = _md_ts_1.SHA224_IV[6] | 0;
			this.H = _md_ts_1.SHA224_IV[7] | 0;
		}
	};
	exports.SHA224 = SHA224;
	var K512 = /* @__PURE__ */ (() => u64.split([
		"0x428a2f98d728ae22",
		"0x7137449123ef65cd",
		"0xb5c0fbcfec4d3b2f",
		"0xe9b5dba58189dbbc",
		"0x3956c25bf348b538",
		"0x59f111f1b605d019",
		"0x923f82a4af194f9b",
		"0xab1c5ed5da6d8118",
		"0xd807aa98a3030242",
		"0x12835b0145706fbe",
		"0x243185be4ee4b28c",
		"0x550c7dc3d5ffb4e2",
		"0x72be5d74f27b896f",
		"0x80deb1fe3b1696b1",
		"0x9bdc06a725c71235",
		"0xc19bf174cf692694",
		"0xe49b69c19ef14ad2",
		"0xefbe4786384f25e3",
		"0x0fc19dc68b8cd5b5",
		"0x240ca1cc77ac9c65",
		"0x2de92c6f592b0275",
		"0x4a7484aa6ea6e483",
		"0x5cb0a9dcbd41fbd4",
		"0x76f988da831153b5",
		"0x983e5152ee66dfab",
		"0xa831c66d2db43210",
		"0xb00327c898fb213f",
		"0xbf597fc7beef0ee4",
		"0xc6e00bf33da88fc2",
		"0xd5a79147930aa725",
		"0x06ca6351e003826f",
		"0x142929670a0e6e70",
		"0x27b70a8546d22ffc",
		"0x2e1b21385c26c926",
		"0x4d2c6dfc5ac42aed",
		"0x53380d139d95b3df",
		"0x650a73548baf63de",
		"0x766a0abb3c77b2a8",
		"0x81c2c92e47edaee6",
		"0x92722c851482353b",
		"0xa2bfe8a14cf10364",
		"0xa81a664bbc423001",
		"0xc24b8b70d0f89791",
		"0xc76c51a30654be30",
		"0xd192e819d6ef5218",
		"0xd69906245565a910",
		"0xf40e35855771202a",
		"0x106aa07032bbd1b8",
		"0x19a4c116b8d2d0c8",
		"0x1e376c085141ab53",
		"0x2748774cdf8eeb99",
		"0x34b0bcb5e19b48a8",
		"0x391c0cb3c5c95a63",
		"0x4ed8aa4ae3418acb",
		"0x5b9cca4f7763e373",
		"0x682e6ff3d6b2b8a3",
		"0x748f82ee5defb2fc",
		"0x78a5636f43172f60",
		"0x84c87814a1f0ab72",
		"0x8cc702081a6439ec",
		"0x90befffa23631e28",
		"0xa4506cebde82bde9",
		"0xbef9a3f7b2c67915",
		"0xc67178f2e372532b",
		"0xca273eceea26619c",
		"0xd186b8c721c0c207",
		"0xeada7dd6cde0eb1e",
		"0xf57d4f7fee6ed178",
		"0x06f067aa72176fba",
		"0x0a637dc5a2c898a6",
		"0x113f9804bef90dae",
		"0x1b710b35131c471b",
		"0x28db77f523047d84",
		"0x32caab7b40c72493",
		"0x3c9ebe0a15c9bebc",
		"0x431d67c49c100d4c",
		"0x4cc5d4becb3e42b6",
		"0x597f299cfc657e2a",
		"0x5fcb6fab3ad6faec",
		"0x6c44198c4a475817"
	].map((n) => BigInt(n))))();
	var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
	var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
	var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
	var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
	var SHA512 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 64) {
			super(128, outputLen, 16, false);
			this.Ah = _md_ts_1.SHA512_IV[0] | 0;
			this.Al = _md_ts_1.SHA512_IV[1] | 0;
			this.Bh = _md_ts_1.SHA512_IV[2] | 0;
			this.Bl = _md_ts_1.SHA512_IV[3] | 0;
			this.Ch = _md_ts_1.SHA512_IV[4] | 0;
			this.Cl = _md_ts_1.SHA512_IV[5] | 0;
			this.Dh = _md_ts_1.SHA512_IV[6] | 0;
			this.Dl = _md_ts_1.SHA512_IV[7] | 0;
			this.Eh = _md_ts_1.SHA512_IV[8] | 0;
			this.El = _md_ts_1.SHA512_IV[9] | 0;
			this.Fh = _md_ts_1.SHA512_IV[10] | 0;
			this.Fl = _md_ts_1.SHA512_IV[11] | 0;
			this.Gh = _md_ts_1.SHA512_IV[12] | 0;
			this.Gl = _md_ts_1.SHA512_IV[13] | 0;
			this.Hh = _md_ts_1.SHA512_IV[14] | 0;
			this.Hl = _md_ts_1.SHA512_IV[15] | 0;
		}
		get() {
			const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			return [
				Ah,
				Al,
				Bh,
				Bl,
				Ch,
				Cl,
				Dh,
				Dl,
				Eh,
				El,
				Fh,
				Fl,
				Gh,
				Gl,
				Hh,
				Hl
			];
		}
		set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
			this.Ah = Ah | 0;
			this.Al = Al | 0;
			this.Bh = Bh | 0;
			this.Bl = Bl | 0;
			this.Ch = Ch | 0;
			this.Cl = Cl | 0;
			this.Dh = Dh | 0;
			this.Dl = Dl | 0;
			this.Eh = Eh | 0;
			this.El = El | 0;
			this.Fh = Fh | 0;
			this.Fl = Fl | 0;
			this.Gh = Gh | 0;
			this.Gl = Gl | 0;
			this.Hh = Hh | 0;
			this.Hl = Hl | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) {
				SHA512_W_H[i] = view.getUint32(offset);
				SHA512_W_L[i] = view.getUint32(offset += 4);
			}
			for (let i = 16; i < 80; i++) {
				const W15h = SHA512_W_H[i - 15] | 0;
				const W15l = SHA512_W_L[i - 15] | 0;
				const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
				const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
				const W2h = SHA512_W_H[i - 2] | 0;
				const W2l = SHA512_W_L[i - 2] | 0;
				const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
				const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
				const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
				const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
				SHA512_W_H[i] = SUMh | 0;
				SHA512_W_L[i] = SUMl | 0;
			}
			let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			for (let i = 0; i < 80; i++) {
				const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
				const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
				const CHIh = Eh & Fh ^ ~Eh & Gh;
				const CHIl = El & Fl ^ ~El & Gl;
				const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
				const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
				const T1l = T1ll | 0;
				const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
				const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
				const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
				const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
				Hh = Gh | 0;
				Hl = Gl | 0;
				Gh = Fh | 0;
				Gl = Fl | 0;
				Fh = Eh | 0;
				Fl = El | 0;
				({h: Eh, l: El} = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
				Dh = Ch | 0;
				Dl = Cl | 0;
				Ch = Bh | 0;
				Cl = Bl | 0;
				Bh = Ah | 0;
				Bl = Al | 0;
				const All = u64.add3L(T1l, sigma0l, MAJl);
				Ah = u64.add3H(All, T1h, sigma0h, MAJh);
				Al = All | 0;
			}
			({h: Ah, l: Al} = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
			({h: Bh, l: Bl} = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
			({h: Ch, l: Cl} = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
			({h: Dh, l: Dl} = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
			({h: Eh, l: El} = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
			({h: Fh, l: Fl} = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
			({h: Gh, l: Gl} = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
			({h: Hh, l: Hl} = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
			this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA512_W_H, SHA512_W_L);
		}
		destroy() {
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.SHA512 = SHA512;
	var SHA384 = class extends SHA512 {
		constructor() {
			super(48);
			this.Ah = _md_ts_1.SHA384_IV[0] | 0;
			this.Al = _md_ts_1.SHA384_IV[1] | 0;
			this.Bh = _md_ts_1.SHA384_IV[2] | 0;
			this.Bl = _md_ts_1.SHA384_IV[3] | 0;
			this.Ch = _md_ts_1.SHA384_IV[4] | 0;
			this.Cl = _md_ts_1.SHA384_IV[5] | 0;
			this.Dh = _md_ts_1.SHA384_IV[6] | 0;
			this.Dl = _md_ts_1.SHA384_IV[7] | 0;
			this.Eh = _md_ts_1.SHA384_IV[8] | 0;
			this.El = _md_ts_1.SHA384_IV[9] | 0;
			this.Fh = _md_ts_1.SHA384_IV[10] | 0;
			this.Fl = _md_ts_1.SHA384_IV[11] | 0;
			this.Gh = _md_ts_1.SHA384_IV[12] | 0;
			this.Gl = _md_ts_1.SHA384_IV[13] | 0;
			this.Hh = _md_ts_1.SHA384_IV[14] | 0;
			this.Hl = _md_ts_1.SHA384_IV[15] | 0;
		}
	};
	exports.SHA384 = SHA384;
	/**
	* Truncated SHA512/256 and SHA512/224.
	* SHA512_IV is XORed with 0xa5a5a5a5a5a5a5a5, then used as "intermediary" IV of SHA512/t.
	* Then t hashes string to produce result IV.
	* See `test/misc/sha2-gen-iv.js`.
	*/
	/** SHA512/224 IV */
	var T224_IV = /* @__PURE__ */ Uint32Array.from([
		2352822216,
		424955298,
		1944164710,
		2312950998,
		502970286,
		855612546,
		1738396948,
		1479516111,
		258812777,
		2077511080,
		2011393907,
		79989058,
		1067287976,
		1780299464,
		286451373,
		2446758561
	]);
	/** SHA512/256 IV */
	var T256_IV = /* @__PURE__ */ Uint32Array.from([
		573645204,
		4230739756,
		2673172387,
		3360449730,
		596883563,
		1867755857,
		2520282905,
		1497426621,
		2519219938,
		2827943907,
		3193839141,
		1401305490,
		721525244,
		746961066,
		246885852,
		2177182882
	]);
	var SHA512_224 = class extends SHA512 {
		constructor() {
			super(28);
			this.Ah = T224_IV[0] | 0;
			this.Al = T224_IV[1] | 0;
			this.Bh = T224_IV[2] | 0;
			this.Bl = T224_IV[3] | 0;
			this.Ch = T224_IV[4] | 0;
			this.Cl = T224_IV[5] | 0;
			this.Dh = T224_IV[6] | 0;
			this.Dl = T224_IV[7] | 0;
			this.Eh = T224_IV[8] | 0;
			this.El = T224_IV[9] | 0;
			this.Fh = T224_IV[10] | 0;
			this.Fl = T224_IV[11] | 0;
			this.Gh = T224_IV[12] | 0;
			this.Gl = T224_IV[13] | 0;
			this.Hh = T224_IV[14] | 0;
			this.Hl = T224_IV[15] | 0;
		}
	};
	exports.SHA512_224 = SHA512_224;
	var SHA512_256 = class extends SHA512 {
		constructor() {
			super(32);
			this.Ah = T256_IV[0] | 0;
			this.Al = T256_IV[1] | 0;
			this.Bh = T256_IV[2] | 0;
			this.Bl = T256_IV[3] | 0;
			this.Ch = T256_IV[4] | 0;
			this.Cl = T256_IV[5] | 0;
			this.Dh = T256_IV[6] | 0;
			this.Dl = T256_IV[7] | 0;
			this.Eh = T256_IV[8] | 0;
			this.El = T256_IV[9] | 0;
			this.Fh = T256_IV[10] | 0;
			this.Fl = T256_IV[11] | 0;
			this.Gh = T256_IV[12] | 0;
			this.Gl = T256_IV[13] | 0;
			this.Hh = T256_IV[14] | 0;
			this.Hl = T256_IV[15] | 0;
		}
	};
	exports.SHA512_256 = SHA512_256;
	/**
	* SHA2-256 hash function from RFC 4634.
	*
	* It is the fastest JS hash, even faster than Blake3.
	* To break sha256 using birthday attack, attackers need to try 2^128 hashes.
	* BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
	*/
	exports.sha256 = (0, utils_ts_1.createHasher)(() => new SHA256());
	/** SHA2-224 hash function from RFC 4634 */
	exports.sha224 = (0, utils_ts_1.createHasher)(() => new SHA224());
	/** SHA2-512 hash function from RFC 4634. */
	exports.sha512 = (0, utils_ts_1.createHasher)(() => new SHA512());
	/** SHA2-384 hash function from RFC 4634. */
	exports.sha384 = (0, utils_ts_1.createHasher)(() => new SHA384());
	/**
	* SHA2-512/256 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_256 = (0, utils_ts_1.createHasher)(() => new SHA512_256());
	/**
	* SHA2-512/224 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_224 = (0, utils_ts_1.createHasher)(() => new SHA512_224());
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/hmac.js
var require_hmac = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac = exports.HMAC = void 0;
	/**
	* HMAC: RFC2104 message authentication code.
	* @module
	*/
	var utils_ts_1 = require_utils$5();
	var HMAC = class extends utils_ts_1.Hash {
		constructor(hash, _key) {
			super();
			this.finished = false;
			this.destroyed = false;
			(0, utils_ts_1.ahash)(hash);
			const key = (0, utils_ts_1.toBytes)(_key);
			this.iHash = hash.create();
			if (typeof this.iHash.update !== "function") throw new Error("Expected instance of class which extends utils.Hash");
			this.blockLen = this.iHash.blockLen;
			this.outputLen = this.iHash.outputLen;
			const blockLen = this.blockLen;
			const pad = new Uint8Array(blockLen);
			pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
			for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
			this.iHash.update(pad);
			this.oHash = hash.create();
			for (let i = 0; i < pad.length; i++) pad[i] ^= 106;
			this.oHash.update(pad);
			(0, utils_ts_1.clean)(pad);
		}
		update(buf) {
			(0, utils_ts_1.aexists)(this);
			this.iHash.update(buf);
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.abytes)(out, this.outputLen);
			this.finished = true;
			this.iHash.digestInto(out);
			this.oHash.update(out);
			this.oHash.digestInto(out);
			this.destroy();
		}
		digest() {
			const out = new Uint8Array(this.oHash.outputLen);
			this.digestInto(out);
			return out;
		}
		_cloneInto(to) {
			to || (to = Object.create(Object.getPrototypeOf(this), {}));
			const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
			to = to;
			to.finished = finished;
			to.destroyed = destroyed;
			to.blockLen = blockLen;
			to.outputLen = outputLen;
			to.oHash = oHash._cloneInto(to.oHash);
			to.iHash = iHash._cloneInto(to.iHash);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
		destroy() {
			this.destroyed = true;
			this.oHash.destroy();
			this.iHash.destroy();
		}
	};
	exports.HMAC = HMAC;
	/**
	* HMAC: RFC2104 message authentication code.
	* @param hash - function that would be used e.g. sha256
	* @param key - message key
	* @param message - message data
	* @example
	* import { hmac } from '@noble/hashes/hmac';
	* import { sha256 } from '@noble/hashes/sha2';
	* const mac1 = hmac(sha256, 'key', 'message');
	*/
	var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
	exports.hmac = hmac;
	exports.hmac.create = (hash, key) => new HMAC(hash, key);
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.notImplemented = exports.bitMask = exports.utf8ToBytes = exports.randomBytes = exports.isBytes = exports.hexToBytes = exports.concatBytes = exports.bytesToUtf8 = exports.bytesToHex = exports.anumber = exports.abytes = void 0;
	exports.abool = abool;
	exports._abool2 = _abool2;
	exports._abytes2 = _abytes2;
	exports.numberToHexUnpadded = numberToHexUnpadded;
	exports.hexToNumber = hexToNumber;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.bytesToNumberLE = bytesToNumberLE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.numberToBytesLE = numberToBytesLE;
	exports.numberToVarBytesBE = numberToVarBytesBE;
	exports.ensureBytes = ensureBytes;
	exports.equalBytes = equalBytes;
	exports.copyBytes = copyBytes;
	exports.asciiToBytes = asciiToBytes;
	exports.inRange = inRange;
	exports.aInRange = aInRange;
	exports.bitLen = bitLen;
	exports.bitGet = bitGet;
	exports.bitSet = bitSet;
	exports.createHmacDrbg = createHmacDrbg;
	exports.validateObject = validateObject;
	exports.isHash = isHash;
	exports._validateObject = _validateObject;
	exports.memoized = memoized;
	/**
	* Hex, bytes and number utilities.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_js_1 = require_utils$5();
	var utils_js_2 = require_utils$5();
	Object.defineProperty(exports, "abytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.abytes;
		}
	});
	Object.defineProperty(exports, "anumber", {
		enumerable: true,
		get: function() {
			return utils_js_2.anumber;
		}
	});
	Object.defineProperty(exports, "bytesToHex", {
		enumerable: true,
		get: function() {
			return utils_js_2.bytesToHex;
		}
	});
	Object.defineProperty(exports, "bytesToUtf8", {
		enumerable: true,
		get: function() {
			return utils_js_2.bytesToUtf8;
		}
	});
	Object.defineProperty(exports, "concatBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.concatBytes;
		}
	});
	Object.defineProperty(exports, "hexToBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.hexToBytes;
		}
	});
	Object.defineProperty(exports, "isBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.isBytes;
		}
	});
	Object.defineProperty(exports, "randomBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.randomBytes;
		}
	});
	Object.defineProperty(exports, "utf8ToBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.utf8ToBytes;
		}
	});
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = /* @__PURE__ */ BigInt(1);
	function abool(title, value) {
		if (typeof value !== "boolean") throw new Error(title + " boolean expected, got " + value);
	}
	function _abool2(value, title = "") {
		if (typeof value !== "boolean") {
			const prefix = title && `"${title}"`;
			throw new Error(prefix + "expected boolean, got type=" + typeof value);
		}
		return value;
	}
	/** Asserts something is Uint8Array. */
	function _abytes2(value, length, title = "") {
		const bytes = (0, utils_js_1.isBytes)(value);
		const len = value?.length;
		const needsLen = length !== void 0;
		if (!bytes || needsLen && len !== length) {
			const prefix = title && `"${title}" `;
			const ofLen = needsLen ? ` of length ${length}` : "";
			const got = bytes ? `length=${len}` : `type=${typeof value}`;
			throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
		}
		return value;
	}
	function numberToHexUnpadded(num) {
		const hex = num.toString(16);
		return hex.length & 1 ? "0" + hex : hex;
	}
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return hex === "" ? _0n : BigInt("0x" + hex);
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber((0, utils_js_1.bytesToHex)(bytes));
	}
	function bytesToNumberLE(bytes) {
		(0, utils_js_1.abytes)(bytes);
		return hexToNumber((0, utils_js_1.bytesToHex)(Uint8Array.from(bytes).reverse()));
	}
	function numberToBytesBE(n, len) {
		return (0, utils_js_1.hexToBytes)(n.toString(16).padStart(len * 2, "0"));
	}
	function numberToBytesLE(n, len) {
		return numberToBytesBE(n, len).reverse();
	}
	function numberToVarBytesBE(n) {
		return (0, utils_js_1.hexToBytes)(numberToHexUnpadded(n));
	}
	/**
	* Takes hex string or Uint8Array, converts to Uint8Array.
	* Validates output length.
	* Will throw error for other types.
	* @param title descriptive title for an error e.g. 'secret key'
	* @param hex hex string or Uint8Array
	* @param expectedLength optional, will compare to result array's length
	* @returns
	*/
	function ensureBytes(title, hex, expectedLength) {
		let res;
		if (typeof hex === "string") try {
			res = (0, utils_js_1.hexToBytes)(hex);
		} catch (e) {
			throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
		}
		else if ((0, utils_js_1.isBytes)(hex)) res = Uint8Array.from(hex);
		else throw new Error(title + " must be hex string or Uint8Array");
		const len = res.length;
		if (typeof expectedLength === "number" && len !== expectedLength) throw new Error(title + " of length " + expectedLength + " expected, got " + len);
		return res;
	}
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/**
	* Copies Uint8Array. We can't use u8a.slice(), because u8a can be Buffer,
	* and Buffer#slice creates mutable copy. Never use Buffers!
	*/
	function copyBytes(bytes) {
		return Uint8Array.from(bytes);
	}
	/**
	* Decodes 7-bit ASCII string to Uint8Array, throws on non-ascii symbols
	* Should be safe to use for things expected to be ASCII.
	* Returns exact same result as utf8ToBytes for ASCII or throws.
	*/
	function asciiToBytes(ascii) {
		return Uint8Array.from(ascii, (c, i) => {
			const charCode = c.charCodeAt(0);
			if (c.length !== 1 || charCode > 127) throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
			return charCode;
		});
	}
	/**
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
	function inRange(n, min, max) {
		return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
	}
	/**
	* Asserts min <= n < max. NOTE: It's < max and not <= max.
	* @example
	* aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
	*/
	function aInRange(title, n, min, max) {
		if (!inRange(n, min, max)) throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
	}
	/**
	* Calculates amount of bits in a bigint.
	* Same as `n.toString(2).length`
	* TODO: merge with nLength in modular
	*/
	function bitLen(n) {
		let len = 0;
		for (; n > _0n; n >>= _1n, len += 1);
		return len;
	}
	/**
	* Gets single bit at position.
	* NOTE: first bit position is 0 (same as arrays)
	* Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
	*/
	function bitGet(n, pos) {
		return n >> BigInt(pos) & _1n;
	}
	/**
	* Sets single bit at position.
	*/
	function bitSet(n, pos, value) {
		return n | (value ? _1n : _0n) << BigInt(pos);
	}
	/**
	* Calculate mask for N bits. Not using ** operator with bigints because of old engines.
	* Same as BigInt(`0b${Array(i).fill('1').join('')}`)
	*/
	var bitMask = (n) => (_1n << BigInt(n)) - _1n;
	exports.bitMask = bitMask;
	/**
	* Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
	* @returns function that will call DRBG until 2nd arg returns something meaningful
	* @example
	*   const drbg = createHmacDRBG<Key>(32, 32, hmac);
	*   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
	*/
	function createHmacDrbg(hashLen, qByteLen, hmacFn) {
		if (typeof hashLen !== "number" || hashLen < 2) throw new Error("hashLen must be a number");
		if (typeof qByteLen !== "number" || qByteLen < 2) throw new Error("qByteLen must be a number");
		if (typeof hmacFn !== "function") throw new Error("hmacFn must be a function");
		const u8n = (len) => new Uint8Array(len);
		const u8of = (byte) => Uint8Array.of(byte);
		let v = u8n(hashLen);
		let k = u8n(hashLen);
		let i = 0;
		const reset = () => {
			v.fill(1);
			k.fill(0);
			i = 0;
		};
		const h = (...b) => hmacFn(k, v, ...b);
		const reseed = (seed = u8n(0)) => {
			k = h(u8of(0), seed);
			v = h();
			if (seed.length === 0) return;
			k = h(u8of(1), seed);
			v = h();
		};
		const gen = () => {
			if (i++ >= 1e3) throw new Error("drbg: tried 1000 values");
			let len = 0;
			const out = [];
			while (len < qByteLen) {
				v = h();
				const sl = v.slice();
				out.push(sl);
				len += v.length;
			}
			return (0, utils_js_1.concatBytes)(...out);
		};
		const genUntil = (seed, pred) => {
			reset();
			reseed(seed);
			let res = void 0;
			while (!(res = pred(gen()))) reseed();
			reset();
			return res;
		};
		return genUntil;
	}
	var validatorFns = {
		bigint: (val) => typeof val === "bigint",
		function: (val) => typeof val === "function",
		boolean: (val) => typeof val === "boolean",
		string: (val) => typeof val === "string",
		stringOrUint8Array: (val) => typeof val === "string" || (0, utils_js_1.isBytes)(val),
		isSafeInteger: (val) => Number.isSafeInteger(val),
		array: (val) => Array.isArray(val),
		field: (val, object) => object.Fp.isValid(val),
		hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
	};
	function validateObject(object, validators, optValidators = {}) {
		const checkField = (fieldName, type, isOptional) => {
			const checkVal = validatorFns[type];
			if (typeof checkVal !== "function") throw new Error("invalid validator function");
			const val = object[fieldName];
			if (isOptional && val === void 0) return;
			if (!checkVal(val, object)) throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
		};
		for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);
		for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);
		return object;
	}
	function isHash(val) {
		return typeof val === "function" && Number.isSafeInteger(val.outputLen);
	}
	function _validateObject(object, fields, optFields = {}) {
		if (!object || typeof object !== "object") throw new Error("expected valid options object");
		function checkField(fieldName, expectedType, isOpt) {
			const val = object[fieldName];
			if (isOpt && val === void 0) return;
			const current = typeof val;
			if (current !== expectedType || val === null) throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
		}
		Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
		Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
	}
	/**
	* throws not implemented error
	*/
	var notImplemented = () => {
		throw new Error("not implemented");
	};
	exports.notImplemented = notImplemented;
	/**
	* Memoizes (caches) computation result.
	* Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
	*/
	function memoized(fn) {
		const map = /* @__PURE__ */ new WeakMap();
		return (arg, ...args) => {
			const val = map.get(arg);
			if (val !== void 0) return val;
			const computed = fn(arg, ...args);
			map.set(arg, computed);
			return computed;
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/abstract/modular.js
var require_modular = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNegativeLE = void 0;
	exports.mod = mod;
	exports.pow = pow;
	exports.pow2 = pow2;
	exports.invert = invert;
	exports.tonelliShanks = tonelliShanks;
	exports.FpSqrt = FpSqrt;
	exports.validateField = validateField;
	exports.FpPow = FpPow;
	exports.FpInvertBatch = FpInvertBatch;
	exports.FpDiv = FpDiv;
	exports.FpLegendre = FpLegendre;
	exports.FpIsSquare = FpIsSquare;
	exports.nLength = nLength;
	exports.Field = Field;
	exports.FpSqrtOdd = FpSqrtOdd;
	exports.FpSqrtEven = FpSqrtEven;
	exports.hashToPrivateScalar = hashToPrivateScalar;
	exports.getFieldBytesLength = getFieldBytesLength;
	exports.getMinHashLength = getMinHashLength;
	exports.mapHashToField = mapHashToField;
	/**
	* Utils for modular division and fields.
	* Field over 11 is a finite (Galois) field is integer number operations `mod 11`.
	* There is no division: it is replaced by modular multiplicative inverse.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = /* @__PURE__ */ BigInt(2);
	var _3n = /* @__PURE__ */ BigInt(3);
	var _4n = /* @__PURE__ */ BigInt(4);
	var _5n = /* @__PURE__ */ BigInt(5);
	var _7n = /* @__PURE__ */ BigInt(7);
	var _8n = /* @__PURE__ */ BigInt(8);
	var _9n = /* @__PURE__ */ BigInt(9);
	var _16n = /* @__PURE__ */ BigInt(16);
	function mod(a, b) {
		const result = a % b;
		return result >= _0n ? result : b + result;
	}
	/**
	* Efficiently raise num to power and do modular division.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	* @example
	* pow(2n, 6n, 11n) // 64n % 11n == 9n
	*/
	function pow(num, power, modulo) {
		return FpPow(Field(modulo), num, power);
	}
	/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
	function pow2(x, power, modulo) {
		let res = x;
		while (power-- > _0n) {
			res *= res;
			res %= modulo;
		}
		return res;
	}
	/**
	* Inverses number over modulo.
	* Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
	*/
	function invert(number, modulo) {
		if (number === _0n) throw new Error("invert: expected non-zero number");
		if (modulo <= _0n) throw new Error("invert: expected positive modulus, got " + modulo);
		let a = mod(number, modulo);
		let b = modulo;
		let x = _0n, y = _1n, u = _1n, v = _0n;
		while (a !== _0n) {
			const q = b / a;
			const r = b % a;
			const m = x - u * q;
			const n = y - v * q;
			b = a, a = r, x = u, y = v, u = m, v = n;
		}
		if (b !== _1n) throw new Error("invert: does not exist");
		return mod(x, modulo);
	}
	function assertIsSquare(Fp, root, n) {
		if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
	}
	function sqrt3mod4(Fp, n) {
		const p1div4 = (Fp.ORDER + _1n) / _4n;
		const root = Fp.pow(n, p1div4);
		assertIsSquare(Fp, root, n);
		return root;
	}
	function sqrt5mod8(Fp, n) {
		const p5div8 = (Fp.ORDER - _5n) / _8n;
		const n2 = Fp.mul(n, _2n);
		const v = Fp.pow(n2, p5div8);
		const nv = Fp.mul(n, v);
		const i = Fp.mul(Fp.mul(nv, _2n), v);
		const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
		assertIsSquare(Fp, root, n);
		return root;
	}
	function sqrt9mod16(P) {
		const Fp_ = Field(P);
		const tn = tonelliShanks(P);
		const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
		const c2 = tn(Fp_, c1);
		const c3 = tn(Fp_, Fp_.neg(c1));
		const c4 = (P + _7n) / _16n;
		return (Fp, n) => {
			let tv1 = Fp.pow(n, c4);
			let tv2 = Fp.mul(tv1, c1);
			const tv3 = Fp.mul(tv1, c2);
			const tv4 = Fp.mul(tv1, c3);
			const e1 = Fp.eql(Fp.sqr(tv2), n);
			const e2 = Fp.eql(Fp.sqr(tv3), n);
			tv1 = Fp.cmov(tv1, tv2, e1);
			tv2 = Fp.cmov(tv4, tv3, e2);
			const e3 = Fp.eql(Fp.sqr(tv2), n);
			const root = Fp.cmov(tv1, tv2, e3);
			assertIsSquare(Fp, root, n);
			return root;
		};
	}
	/**
	* Tonelli-Shanks square root search algorithm.
	* 1. https://eprint.iacr.org/2012/685.pdf (page 12)
	* 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
	* @param P field order
	* @returns function that takes field Fp (created from P) and number n
	*/
	function tonelliShanks(P) {
		if (P < _3n) throw new Error("sqrt is not defined for small field");
		let Q = P - _1n;
		let S = 0;
		while (Q % _2n === _0n) {
			Q /= _2n;
			S++;
		}
		let Z = _2n;
		const _Fp = Field(P);
		while (FpLegendre(_Fp, Z) === 1) if (Z++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
		if (S === 1) return sqrt3mod4;
		let cc = _Fp.pow(Z, Q);
		const Q1div2 = (Q + _1n) / _2n;
		return function tonelliSlow(Fp, n) {
			if (Fp.is0(n)) return n;
			if (FpLegendre(Fp, n) !== 1) throw new Error("Cannot find square root");
			let M = S;
			let c = Fp.mul(Fp.ONE, cc);
			let t = Fp.pow(n, Q);
			let R = Fp.pow(n, Q1div2);
			while (!Fp.eql(t, Fp.ONE)) {
				if (Fp.is0(t)) return Fp.ZERO;
				let i = 1;
				let t_tmp = Fp.sqr(t);
				while (!Fp.eql(t_tmp, Fp.ONE)) {
					i++;
					t_tmp = Fp.sqr(t_tmp);
					if (i === M) throw new Error("Cannot find square root");
				}
				const exponent = _1n << BigInt(M - i - 1);
				const b = Fp.pow(c, exponent);
				M = i;
				c = Fp.sqr(b);
				t = Fp.mul(t, c);
				R = Fp.mul(R, b);
			}
			return R;
		};
	}
	/**
	* Square root for a finite field. Will try optimized versions first:
	*
	* 1. P ≡ 3 (mod 4)
	* 2. P ≡ 5 (mod 8)
	* 3. P ≡ 9 (mod 16)
	* 4. Tonelli-Shanks algorithm
	*
	* Different algorithms can give different roots, it is up to user to decide which one they want.
	* For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
	*/
	function FpSqrt(P) {
		if (P % _4n === _3n) return sqrt3mod4;
		if (P % _8n === _5n) return sqrt5mod8;
		if (P % _16n === _9n) return sqrt9mod16(P);
		return tonelliShanks(P);
	}
	var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;
	exports.isNegativeLE = isNegativeLE;
	var FIELD_FIELDS = [
		"create",
		"isValid",
		"is0",
		"neg",
		"inv",
		"sqrt",
		"sqr",
		"eql",
		"add",
		"sub",
		"mul",
		"pow",
		"div",
		"addN",
		"subN",
		"mulN",
		"sqrN"
	];
	function validateField(field) {
		const opts = FIELD_FIELDS.reduce((map, val) => {
			map[val] = "function";
			return map;
		}, {
			ORDER: "bigint",
			MASK: "bigint",
			BYTES: "number",
			BITS: "number"
		});
		(0, utils_ts_1._validateObject)(field, opts);
		return field;
	}
	/**
	* Same as `pow` but for Fp: non-constant-time.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	*/
	function FpPow(Fp, num, power) {
		if (power < _0n) throw new Error("invalid exponent, negatives unsupported");
		if (power === _0n) return Fp.ONE;
		if (power === _1n) return num;
		let p = Fp.ONE;
		let d = num;
		while (power > _0n) {
			if (power & _1n) p = Fp.mul(p, d);
			d = Fp.sqr(d);
			power >>= _1n;
		}
		return p;
	}
	/**
	* Efficiently invert an array of Field elements.
	* Exception-free. Will return `undefined` for 0 elements.
	* @param passZero map 0 to 0 (instead of undefined)
	*/
	function FpInvertBatch(Fp, nums, passZero = false) {
		const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
		const multipliedAcc = nums.reduce((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = acc;
			return Fp.mul(acc, num);
		}, Fp.ONE);
		const invertedAcc = Fp.inv(multipliedAcc);
		nums.reduceRight((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = Fp.mul(acc, inverted[i]);
			return Fp.mul(acc, num);
		}, invertedAcc);
		return inverted;
	}
	function FpDiv(Fp, lhs, rhs) {
		return Fp.mul(lhs, typeof rhs === "bigint" ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
	}
	/**
	* Legendre symbol.
	* Legendre constant is used to calculate Legendre symbol (a | p)
	* which denotes the value of a^((p-1)/2) (mod p).
	*
	* * (a | p) ≡ 1    if a is a square (mod p), quadratic residue
	* * (a | p) ≡ -1   if a is not a square (mod p), quadratic non residue
	* * (a | p) ≡ 0    if a ≡ 0 (mod p)
	*/
	function FpLegendre(Fp, n) {
		const p1mod2 = (Fp.ORDER - _1n) / _2n;
		const powered = Fp.pow(n, p1mod2);
		const yes = Fp.eql(powered, Fp.ONE);
		const zero = Fp.eql(powered, Fp.ZERO);
		const no = Fp.eql(powered, Fp.neg(Fp.ONE));
		if (!yes && !zero && !no) throw new Error("invalid Legendre symbol result");
		return yes ? 1 : zero ? 0 : -1;
	}
	function FpIsSquare(Fp, n) {
		return FpLegendre(Fp, n) === 1;
	}
	function nLength(n, nBitLength) {
		if (nBitLength !== void 0) (0, utils_ts_1.anumber)(nBitLength);
		const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
		return {
			nBitLength: _nBitLength,
			nByteLength: Math.ceil(_nBitLength / 8)
		};
	}
	/**
	* Creates a finite field. Major performance optimizations:
	* * 1. Denormalized operations like mulN instead of mul.
	* * 2. Identical object shape: never add or remove keys.
	* * 3. `Object.freeze`.
	* Fragile: always run a benchmark on a change.
	* Security note: operations don't check 'isValid' for all elements for performance reasons,
	* it is caller responsibility to check this.
	* This is low-level code, please make sure you know what you're doing.
	*
	* Note about field properties:
	* * CHARACTERISTIC p = prime number, number of elements in main subgroup.
	* * ORDER q = similar to cofactor in curves, may be composite `q = p^m`.
	*
	* @param ORDER field order, probably prime, or could be composite
	* @param bitLen how many bits the field consumes
	* @param isLE (default: false) if encoding / decoding should be in little-endian
	* @param redef optional faster redefinitions of sqrt and other methods
	*/
	function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
		if (ORDER <= _0n) throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
		let _nbitLength = void 0;
		let _sqrt = void 0;
		let modFromBytes = false;
		let allowedLengths = void 0;
		if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
			if (opts.sqrt || isLE) throw new Error("cannot specify opts in two arguments");
			const _opts = bitLenOrOpts;
			if (_opts.BITS) _nbitLength = _opts.BITS;
			if (_opts.sqrt) _sqrt = _opts.sqrt;
			if (typeof _opts.isLE === "boolean") isLE = _opts.isLE;
			if (typeof _opts.modFromBytes === "boolean") modFromBytes = _opts.modFromBytes;
			allowedLengths = _opts.allowedLengths;
		} else {
			if (typeof bitLenOrOpts === "number") _nbitLength = bitLenOrOpts;
			if (opts.sqrt) _sqrt = opts.sqrt;
		}
		const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
		if (BYTES > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
		let sqrtP;
		const f = Object.freeze({
			ORDER,
			isLE,
			BITS,
			BYTES,
			MASK: (0, utils_ts_1.bitMask)(BITS),
			ZERO: _0n,
			ONE: _1n,
			allowedLengths,
			create: (num) => mod(num, ORDER),
			isValid: (num) => {
				if (typeof num !== "bigint") throw new Error("invalid field element: expected bigint, got " + typeof num);
				return _0n <= num && num < ORDER;
			},
			is0: (num) => num === _0n,
			isValidNot0: (num) => !f.is0(num) && f.isValid(num),
			isOdd: (num) => (num & _1n) === _1n,
			neg: (num) => mod(-num, ORDER),
			eql: (lhs, rhs) => lhs === rhs,
			sqr: (num) => mod(num * num, ORDER),
			add: (lhs, rhs) => mod(lhs + rhs, ORDER),
			sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
			mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
			pow: (num, power) => FpPow(f, num, power),
			div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
			sqrN: (num) => num * num,
			addN: (lhs, rhs) => lhs + rhs,
			subN: (lhs, rhs) => lhs - rhs,
			mulN: (lhs, rhs) => lhs * rhs,
			inv: (num) => invert(num, ORDER),
			sqrt: _sqrt || ((n) => {
				if (!sqrtP) sqrtP = FpSqrt(ORDER);
				return sqrtP(f, n);
			}),
			toBytes: (num) => isLE ? (0, utils_ts_1.numberToBytesLE)(num, BYTES) : (0, utils_ts_1.numberToBytesBE)(num, BYTES),
			fromBytes: (bytes, skipValidation = true) => {
				if (allowedLengths) {
					if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
					const padded = new Uint8Array(BYTES);
					padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
					bytes = padded;
				}
				if (bytes.length !== BYTES) throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
				let scalar = isLE ? (0, utils_ts_1.bytesToNumberLE)(bytes) : (0, utils_ts_1.bytesToNumberBE)(bytes);
				if (modFromBytes) scalar = mod(scalar, ORDER);
				if (!skipValidation) {
					if (!f.isValid(scalar)) throw new Error("invalid field element: outside of range 0..ORDER");
				}
				return scalar;
			},
			invertBatch: (lst) => FpInvertBatch(f, lst),
			cmov: (a, b, c) => c ? b : a
		});
		return Object.freeze(f);
	}
	function FpSqrtOdd(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? root : Fp.neg(root);
	}
	function FpSqrtEven(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? Fp.neg(root) : root;
	}
	/**
	* "Constant-time" private key generation utility.
	* Same as mapKeyToField, but accepts less bytes (40 instead of 48 for 32-byte field).
	* Which makes it slightly more biased, less secure.
	* @deprecated use `mapKeyToField` instead
	*/
	function hashToPrivateScalar(hash, groupOrder, isLE = false) {
		hash = (0, utils_ts_1.ensureBytes)("privateHash", hash);
		const hashLen = hash.length;
		const minLen = nLength(groupOrder).nByteLength + 8;
		if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error("hashToPrivateScalar: expected " + minLen + "-1024 bytes of input, got " + hashLen);
		return mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(hash) : (0, utils_ts_1.bytesToNumberBE)(hash), groupOrder - _1n) + _1n;
	}
	/**
	* Returns total number of bytes consumed by the field element.
	* For example, 32 bytes for usual 256-bit weierstrass curve.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of field
	*/
	function getFieldBytesLength(fieldOrder) {
		if (typeof fieldOrder !== "bigint") throw new Error("field order must be bigint");
		const bitLength = fieldOrder.toString(2).length;
		return Math.ceil(bitLength / 8);
	}
	/**
	* Returns minimal amount of bytes that can be safely reduced
	* by field order.
	* Should be 2^-128 for 128-bit curve such as P256.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of target hash
	*/
	function getMinHashLength(fieldOrder) {
		const length = getFieldBytesLength(fieldOrder);
		return length + Math.ceil(length / 2);
	}
	/**
	* "Constant-time" private key generation utility.
	* Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
	* and convert them into private scalar, with the modulo bias being negligible.
	* Needs at least 48 bytes of input for 32-byte private key.
	* https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
	* FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
	* RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
	* @param hash hash output from SHA3 or a similar function
	* @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
	* @param isLE interpret hash bytes as LE num
	* @returns valid private scalar
	*/
	function mapHashToField(key, fieldOrder, isLE = false) {
		const len = key.length;
		const fieldLen = getFieldBytesLength(fieldOrder);
		const minLen = getMinHashLength(fieldOrder);
		if (len < 16 || len < minLen || len > 1024) throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
		const reduced = mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(key) : (0, utils_ts_1.bytesToNumberBE)(key), fieldOrder - _1n) + _1n;
		return isLE ? (0, utils_ts_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_ts_1.numberToBytesBE)(reduced, fieldLen);
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/abstract/curve.js
var require_curve = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wNAF = void 0;
	exports.negateCt = negateCt;
	exports.normalizeZ = normalizeZ;
	exports.mulEndoUnsafe = mulEndoUnsafe;
	exports.pippenger = pippenger;
	exports.precomputeMSMUnsafe = precomputeMSMUnsafe;
	exports.validateBasic = validateBasic;
	exports._createCurveFields = _createCurveFields;
	/**
	* Methods for elliptic curve multiplication by scalars.
	* Contains wNAF, pippenger.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils();
	var modular_ts_1 = require_modular();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	function negateCt(condition, item) {
		const neg = item.negate();
		return condition ? neg : item;
	}
	/**
	* Takes a bunch of Projective Points but executes only one
	* inversion on all of them. Inversion is very slow operation,
	* so this improves performance massively.
	* Optimization: converts a list of projective points to a list of identical points with Z=1.
	*/
	function normalizeZ(c, points) {
		const invertedZs = (0, modular_ts_1.FpInvertBatch)(c.Fp, points.map((p) => p.Z));
		return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
	}
	function validateW(W, bits) {
		if (!Number.isSafeInteger(W) || W <= 0 || W > bits) throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
	}
	function calcWOpts(W, scalarBits) {
		validateW(W, scalarBits);
		const windows = Math.ceil(scalarBits / W) + 1;
		const windowSize = 2 ** (W - 1);
		const maxNumber = 2 ** W;
		return {
			windows,
			windowSize,
			mask: (0, utils_ts_1.bitMask)(W),
			maxNumber,
			shiftBy: BigInt(W)
		};
	}
	function calcOffsets(n, window, wOpts) {
		const { windowSize, mask, maxNumber, shiftBy } = wOpts;
		let wbits = Number(n & mask);
		let nextN = n >> shiftBy;
		if (wbits > windowSize) {
			wbits -= maxNumber;
			nextN += _1n;
		}
		const offsetStart = window * windowSize;
		const offset = offsetStart + Math.abs(wbits) - 1;
		const isZero = wbits === 0;
		const isNeg = wbits < 0;
		const isNegF = window % 2 !== 0;
		return {
			nextN,
			offset,
			isZero,
			isNeg,
			isNegF,
			offsetF: offsetStart
		};
	}
	function validateMSMPoints(points, c) {
		if (!Array.isArray(points)) throw new Error("array expected");
		points.forEach((p, i) => {
			if (!(p instanceof c)) throw new Error("invalid point at index " + i);
		});
	}
	function validateMSMScalars(scalars, field) {
		if (!Array.isArray(scalars)) throw new Error("array of scalars expected");
		scalars.forEach((s, i) => {
			if (!field.isValid(s)) throw new Error("invalid scalar at index " + i);
		});
	}
	var pointPrecomputes = /* @__PURE__ */ new WeakMap();
	var pointWindowSizes = /* @__PURE__ */ new WeakMap();
	function getW(P) {
		return pointWindowSizes.get(P) || 1;
	}
	function assert0(n) {
		if (n !== _0n) throw new Error("invalid wNAF");
	}
	/**
	* Elliptic curve multiplication of Point by scalar. Fragile.
	* Table generation takes **30MB of ram and 10ms on high-end CPU**,
	* but may take much longer on slow devices. Actual generation will happen on
	* first call of `multiply()`. By default, `BASE` point is precomputed.
	*
	* Scalars should always be less than curve order: this should be checked inside of a curve itself.
	* Creates precomputation tables for fast multiplication:
	* - private scalar is split by fixed size windows of W bits
	* - every window point is collected from window's table & added to accumulator
	* - since windows are different, same point inside tables won't be accessed more than once per calc
	* - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
	* - +1 window is neccessary for wNAF
	* - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
	*
	* @todo Research returning 2d JS array of windows, instead of a single window.
	* This would allow windows to be in different memory locations
	*/
	var wNAF = class {
		constructor(Point, bits) {
			this.BASE = Point.BASE;
			this.ZERO = Point.ZERO;
			this.Fn = Point.Fn;
			this.bits = bits;
		}
		_unsafeLadder(elm, n, p = this.ZERO) {
			let d = elm;
			while (n > _0n) {
				if (n & _1n) p = p.add(d);
				d = d.double();
				n >>= _1n;
			}
			return p;
		}
		/**
		* Creates a wNAF precomputation window. Used for caching.
		* Default window size is set by `utils.precompute()` and is equal to 8.
		* Number of precomputed points depends on the curve size:
		* 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
		* - 𝑊 is the window size
		* - 𝑛 is the bitlength of the curve order.
		* For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
		* @param point Point instance
		* @param W window size
		* @returns precomputed point tables flattened to a single array
		*/
		precomputeWindow(point, W) {
			const { windows, windowSize } = calcWOpts(W, this.bits);
			const points = [];
			let p = point;
			let base = p;
			for (let window = 0; window < windows; window++) {
				base = p;
				points.push(base);
				for (let i = 1; i < windowSize; i++) {
					base = base.add(p);
					points.push(base);
				}
				p = base.double();
			}
			return points;
		}
		/**
		* Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
		* More compact implementation:
		* https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
		* @returns real and fake (for const-time) points
		*/
		wNAF(W, precomputes, n) {
			if (!this.Fn.isValid(n)) throw new Error("invalid scalar");
			let p = this.ZERO;
			let f = this.BASE;
			const wo = calcWOpts(W, this.bits);
			for (let window = 0; window < wo.windows; window++) {
				const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
				n = nextN;
				if (isZero) f = f.add(negateCt(isNegF, precomputes[offsetF]));
				else p = p.add(negateCt(isNeg, precomputes[offset]));
			}
			assert0(n);
			return {
				p,
				f
			};
		}
		/**
		* Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
		* @param acc accumulator point to add result of multiplication
		* @returns point
		*/
		wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
			const wo = calcWOpts(W, this.bits);
			for (let window = 0; window < wo.windows; window++) {
				if (n === _0n) break;
				const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
				n = nextN;
				if (isZero) continue;
				else {
					const item = precomputes[offset];
					acc = acc.add(isNeg ? item.negate() : item);
				}
			}
			assert0(n);
			return acc;
		}
		getPrecomputes(W, point, transform) {
			let comp = pointPrecomputes.get(point);
			if (!comp) {
				comp = this.precomputeWindow(point, W);
				if (W !== 1) {
					if (typeof transform === "function") comp = transform(comp);
					pointPrecomputes.set(point, comp);
				}
			}
			return comp;
		}
		cached(point, scalar, transform) {
			const W = getW(point);
			return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
		}
		unsafe(point, scalar, transform, prev) {
			const W = getW(point);
			if (W === 1) return this._unsafeLadder(point, scalar, prev);
			return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
		}
		createCache(P, W) {
			validateW(W, this.bits);
			pointWindowSizes.set(P, W);
			pointPrecomputes.delete(P);
		}
		hasCache(elm) {
			return getW(elm) !== 1;
		}
	};
	exports.wNAF = wNAF;
	/**
	* Endomorphism-specific multiplication for Koblitz curves.
	* Cost: 128 dbl, 0-256 adds.
	*/
	function mulEndoUnsafe(Point, point, k1, k2) {
		let acc = point;
		let p1 = Point.ZERO;
		let p2 = Point.ZERO;
		while (k1 > _0n || k2 > _0n) {
			if (k1 & _1n) p1 = p1.add(acc);
			if (k2 & _1n) p2 = p2.add(acc);
			acc = acc.double();
			k1 >>= _1n;
			k2 >>= _1n;
		}
		return {
			p1,
			p2
		};
	}
	/**
	* Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* 30x faster vs naive addition on L=4096, 10x faster than precomputes.
	* For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
	* Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @param scalars array of L scalars (aka secret keys / bigints)
	*/
	function pippenger(c, fieldN, points, scalars) {
		validateMSMPoints(points, c);
		validateMSMScalars(scalars, fieldN);
		const plength = points.length;
		const slength = scalars.length;
		if (plength !== slength) throw new Error("arrays of points and scalars must have equal length");
		const zero = c.ZERO;
		const wbits = (0, utils_ts_1.bitLen)(BigInt(plength));
		let windowSize = 1;
		if (wbits > 12) windowSize = wbits - 3;
		else if (wbits > 4) windowSize = wbits - 2;
		else if (wbits > 0) windowSize = 2;
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const buckets = new Array(Number(MASK) + 1).fill(zero);
		const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
		let sum = zero;
		for (let i = lastBits; i >= 0; i -= windowSize) {
			buckets.fill(zero);
			for (let j = 0; j < slength; j++) {
				const scalar = scalars[j];
				const wbits = Number(scalar >> BigInt(i) & MASK);
				buckets[wbits] = buckets[wbits].add(points[j]);
			}
			let resI = zero;
			for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
				sumI = sumI.add(buckets[j]);
				resI = resI.add(sumI);
			}
			sum = sum.add(resI);
			if (i !== 0) for (let j = 0; j < windowSize; j++) sum = sum.double();
		}
		return sum;
	}
	/**
	* Precomputed multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @returns function which multiplies points with scaars
	*/
	function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
		/**
		* Performance Analysis of Window-based Precomputation
		*
		* Base Case (256-bit scalar, 8-bit window):
		* - Standard precomputation requires:
		*   - 31 additions per scalar × 256 scalars = 7,936 ops
		*   - Plus 255 summary additions = 8,191 total ops
		*   Note: Summary additions can be optimized via accumulator
		*
		* Chunked Precomputation Analysis:
		* - Using 32 chunks requires:
		*   - 255 additions per chunk
		*   - 256 doublings
		*   - Total: (255 × 32) + 256 = 8,416 ops
		*
		* Memory Usage Comparison:
		* Window Size | Standard Points | Chunked Points
		* ------------|-----------------|---------------
		*     4-bit   |     520         |      15
		*     8-bit   |    4,224        |     255
		*    10-bit   |   13,824        |   1,023
		*    16-bit   |  557,056        |  65,535
		*
		* Key Advantages:
		* 1. Enables larger window sizes due to reduced memory overhead
		* 2. More efficient for smaller scalar counts:
		*    - 16 chunks: (16 × 255) + 256 = 4,336 ops
		*    - ~2x faster than standard 8,191 ops
		*
		* Limitations:
		* - Not suitable for plain precomputes (requires 256 constant doublings)
		* - Performance degrades with larger scalar counts:
		*   - Optimal for ~256 scalars
		*   - Less efficient for 4096+ scalars (Pippenger preferred)
		*/
		validateW(windowSize, fieldN.BITS);
		validateMSMPoints(points, c);
		const zero = c.ZERO;
		const tableSize = 2 ** windowSize - 1;
		const chunks = Math.ceil(fieldN.BITS / windowSize);
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const tables = points.map((p) => {
			const res = [];
			for (let i = 0, acc = p; i < tableSize; i++) {
				res.push(acc);
				acc = acc.add(p);
			}
			return res;
		});
		return (scalars) => {
			validateMSMScalars(scalars, fieldN);
			if (scalars.length > points.length) throw new Error("array of scalars must be smaller than array of points");
			let res = zero;
			for (let i = 0; i < chunks; i++) {
				if (res !== zero) for (let j = 0; j < windowSize; j++) res = res.double();
				const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
				for (let j = 0; j < scalars.length; j++) {
					const n = scalars[j];
					const curr = Number(n >> shiftBy & MASK);
					if (!curr) continue;
					res = res.add(tables[j][curr - 1]);
				}
			}
			return res;
		};
	}
	/** @deprecated */
	function validateBasic(curve) {
		(0, modular_ts_1.validateField)(curve.Fp);
		(0, utils_ts_1.validateObject)(curve, {
			n: "bigint",
			h: "bigint",
			Gx: "field",
			Gy: "field"
		}, {
			nBitLength: "isSafeInteger",
			nByteLength: "isSafeInteger"
		});
		return Object.freeze({
			...(0, modular_ts_1.nLength)(curve.n, curve.nBitLength),
			...curve,
			p: curve.Fp.ORDER
		});
	}
	function createField(order, field, isLE) {
		if (field) {
			if (field.ORDER !== order) throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
			(0, modular_ts_1.validateField)(field);
			return field;
		} else return (0, modular_ts_1.Field)(order, { isLE });
	}
	/** Validates CURVE opts and creates fields */
	function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
		if (FpFnLE === void 0) FpFnLE = type === "edwards";
		if (!CURVE || typeof CURVE !== "object") throw new Error(`expected valid ${type} CURVE object`);
		for (const p of [
			"p",
			"n",
			"h"
		]) {
			const val = CURVE[p];
			if (!(typeof val === "bigint" && val > _0n)) throw new Error(`CURVE.${p} must be positive bigint`);
		}
		const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
		const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
		const params = [
			"Gx",
			"Gy",
			"a",
			type === "weierstrass" ? "b" : "d"
		];
		for (const p of params) if (!Fp.isValid(CURVE[p])) throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
		CURVE = Object.freeze(Object.assign({}, CURVE));
		return {
			CURVE,
			Fp,
			Fn
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/abstract/edwards.js
var require_edwards = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PrimeEdwardsPoint = void 0;
	exports.edwards = edwards;
	exports.eddsa = eddsa;
	exports.twistedEdwards = twistedEdwards;
	/**
	* Twisted Edwards curve. The formula is: ax² + y² = 1 + dx²y².
	* For design rationale of types / exports, see weierstrass module documentation.
	* Untwisted Edwards curves exist, but they aren't used in real-world protocols.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils();
	var curve_ts_1 = require_curve();
	var modular_ts_1 = require_modular();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _8n = BigInt(8);
	function isEdValidXY(Fp, CURVE, x, y) {
		const x2 = Fp.sqr(x);
		const y2 = Fp.sqr(y);
		const left = Fp.add(Fp.mul(CURVE.a, x2), y2);
		const right = Fp.add(Fp.ONE, Fp.mul(CURVE.d, Fp.mul(x2, y2)));
		return Fp.eql(left, right);
	}
	function edwards(params, extraOpts = {}) {
		const validated = (0, curve_ts_1._createCurveFields)("edwards", params, extraOpts, extraOpts.FpFnLE);
		const { Fp, Fn } = validated;
		let CURVE = validated.CURVE;
		const { h: cofactor } = CURVE;
		(0, utils_ts_1._validateObject)(extraOpts, {}, { uvRatio: "function" });
		const MASK = _2n << BigInt(Fn.BYTES * 8) - _1n;
		const modP = (n) => Fp.create(n);
		const uvRatio = extraOpts.uvRatio || ((u, v) => {
			try {
				return {
					isValid: true,
					value: Fp.sqrt(Fp.div(u, v))
				};
			} catch (e) {
				return {
					isValid: false,
					value: _0n
				};
			}
		});
		if (!isEdValidXY(Fp, CURVE, CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		/**
		* Asserts coordinate is valid: 0 <= n < MASK.
		* Coordinates >= Fp.ORDER are allowed for zip215.
		*/
		function acoord(title, n, banZero = false) {
			const min = banZero ? _1n : _0n;
			(0, utils_ts_1.aInRange)("coordinate " + title, n, min, MASK);
			return n;
		}
		function aextpoint(other) {
			if (!(other instanceof Point)) throw new Error("ExtendedPoint expected");
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { X, Y, Z } = p;
			const is0 = p.is0();
			if (iz == null) iz = is0 ? _8n : Fp.inv(Z);
			const x = modP(X * iz);
			const y = modP(Y * iz);
			const zz = Fp.mul(Z, iz);
			if (is0) return {
				x: _0n,
				y: _1n
			};
			if (zz !== _1n) throw new Error("invZ was invalid");
			return {
				x,
				y
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			const { a, d } = CURVE;
			if (p.is0()) throw new Error("bad point: ZERO");
			const { X, Y, Z, T } = p;
			const X2 = modP(X * X);
			const Y2 = modP(Y * Y);
			const Z2 = modP(Z * Z);
			const Z4 = modP(Z2 * Z2);
			const aX2 = modP(X2 * a);
			if (modP(Z2 * modP(aX2 + Y2)) !== modP(Z4 + modP(d * modP(X2 * Y2)))) throw new Error("bad point: equation left != right (1)");
			if (modP(X * Y) !== modP(Z * T)) throw new Error("bad point: equation left != right (2)");
			return true;
		});
		class Point {
			constructor(X, Y, Z, T) {
				this.X = acoord("x", X);
				this.Y = acoord("y", Y);
				this.Z = acoord("z", Z, true);
				this.T = acoord("t", T);
				Object.freeze(this);
			}
			static CURVE() {
				return CURVE;
			}
			static fromAffine(p) {
				if (p instanceof Point) throw new Error("extended point not allowed");
				const { x, y } = p || {};
				acoord("x", x);
				acoord("y", y);
				return new Point(x, y, _1n, modP(x * y));
			}
			static fromBytes(bytes, zip215 = false) {
				const len = Fp.BYTES;
				const { a, d } = CURVE;
				bytes = (0, utils_ts_1.copyBytes)((0, utils_ts_1._abytes2)(bytes, len, "point"));
				(0, utils_ts_1._abool2)(zip215, "zip215");
				const normed = (0, utils_ts_1.copyBytes)(bytes);
				const lastByte = bytes[len - 1];
				normed[len - 1] = lastByte & -129;
				const y = (0, utils_ts_1.bytesToNumberLE)(normed);
				const max = zip215 ? MASK : Fp.ORDER;
				(0, utils_ts_1.aInRange)("point.y", y, _0n, max);
				const y2 = modP(y * y);
				const u = modP(y2 - _1n);
				const v = modP(d * y2 - a);
				let { isValid, value: x } = uvRatio(u, v);
				if (!isValid) throw new Error("bad point: invalid y coordinate");
				const isXOdd = (x & _1n) === _1n;
				const isLastByteOdd = (lastByte & 128) !== 0;
				if (!zip215 && x === _0n && isLastByteOdd) throw new Error("bad point: x=0 and x_0=1");
				if (isLastByteOdd !== isXOdd) x = modP(-x);
				return Point.fromAffine({
					x,
					y
				});
			}
			static fromHex(bytes, zip215 = false) {
				return Point.fromBytes((0, utils_ts_1.ensureBytes)("point", bytes), zip215);
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			precompute(windowSize = 8, isLazy = true) {
				wnaf.createCache(this, windowSize);
				if (!isLazy) this.multiply(_2n);
				return this;
			}
			assertValidity() {
				assertValidMemo(this);
			}
			equals(other) {
				aextpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				const X1Z2 = modP(X1 * Z2);
				const X2Z1 = modP(X2 * Z1);
				const Y1Z2 = modP(Y1 * Z2);
				const Y2Z1 = modP(Y2 * Z1);
				return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			negate() {
				return new Point(modP(-this.X), this.Y, this.Z, modP(-this.T));
			}
			double() {
				const { a } = CURVE;
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const A = modP(X1 * X1);
				const B = modP(Y1 * Y1);
				const C = modP(_2n * modP(Z1 * Z1));
				const D = modP(a * A);
				const x1y1 = X1 + Y1;
				const E = modP(modP(x1y1 * x1y1) - A - B);
				const G = D + B;
				const F = G - C;
				const H = D - B;
				const X3 = modP(E * F);
				const Y3 = modP(G * H);
				const T3 = modP(E * H);
				const Z3 = modP(F * G);
				return new Point(X3, Y3, Z3, T3);
			}
			add(other) {
				aextpoint(other);
				const { a, d } = CURVE;
				const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
				const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
				const A = modP(X1 * X2);
				const B = modP(Y1 * Y2);
				const C = modP(T1 * d * T2);
				const D = modP(Z1 * Z2);
				const E = modP((X1 + Y1) * (X2 + Y2) - A - B);
				const F = D - C;
				const G = D + C;
				const H = modP(B - a * A);
				const X3 = modP(E * F);
				const Y3 = modP(G * H);
				const T3 = modP(E * H);
				const Z3 = modP(F * G);
				return new Point(X3, Y3, Z3, T3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			multiply(scalar) {
				if (!Fn.isValidNot0(scalar)) throw new Error("invalid scalar: expected 1 <= sc < curve.n");
				const { p, f } = wnaf.cached(this, scalar, (p) => (0, curve_ts_1.normalizeZ)(Point, p));
				return (0, curve_ts_1.normalizeZ)(Point, [p, f])[0];
			}
			multiplyUnsafe(scalar, acc = Point.ZERO) {
				if (!Fn.isValid(scalar)) throw new Error("invalid scalar: expected 0 <= sc < curve.n");
				if (scalar === _0n) return Point.ZERO;
				if (this.is0() || scalar === _1n) return this;
				return wnaf.unsafe(this, scalar, (p) => (0, curve_ts_1.normalizeZ)(Point, p), acc);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			isTorsionFree() {
				return wnaf.unsafe(this, CURVE.n).is0();
			}
			toAffine(invertedZ) {
				return toAffineMemo(this, invertedZ);
			}
			clearCofactor() {
				if (cofactor === _1n) return this;
				return this.multiplyUnsafe(cofactor);
			}
			toBytes() {
				const { x, y } = this.toAffine();
				const bytes = Fp.toBytes(y);
				bytes[bytes.length - 1] |= x & _1n ? 128 : 0;
				return bytes;
			}
			toHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes());
			}
			toString() {
				return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
			}
			get ex() {
				return this.X;
			}
			get ey() {
				return this.Y;
			}
			get ez() {
				return this.Z;
			}
			get et() {
				return this.T;
			}
			static normalizeZ(points) {
				return (0, curve_ts_1.normalizeZ)(Point, points);
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			_setWindowSize(windowSize) {
				this.precompute(windowSize);
			}
			toRawBytes() {
				return this.toBytes();
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n, modP(CURVE.Gx * CURVE.Gy));
		Point.ZERO = new Point(_0n, _1n, _1n, _0n);
		Point.Fp = Fp;
		Point.Fn = Fn;
		const wnaf = new curve_ts_1.wNAF(Point, Fn.BITS);
		Point.BASE.precompute(8);
		return Point;
	}
	/**
	* Base class for prime-order points like Ristretto255 and Decaf448.
	* These points eliminate cofactor issues by representing equivalence classes
	* of Edwards curve points.
	*/
	var PrimeEdwardsPoint = class {
		constructor(ep) {
			this.ep = ep;
		}
		static fromBytes(_bytes) {
			(0, utils_ts_1.notImplemented)();
		}
		static fromHex(_hex) {
			(0, utils_ts_1.notImplemented)();
		}
		get x() {
			return this.toAffine().x;
		}
		get y() {
			return this.toAffine().y;
		}
		clearCofactor() {
			return this;
		}
		assertValidity() {
			this.ep.assertValidity();
		}
		toAffine(invertedZ) {
			return this.ep.toAffine(invertedZ);
		}
		toHex() {
			return (0, utils_ts_1.bytesToHex)(this.toBytes());
		}
		toString() {
			return this.toHex();
		}
		isTorsionFree() {
			return true;
		}
		isSmallOrder() {
			return false;
		}
		add(other) {
			this.assertSame(other);
			return this.init(this.ep.add(other.ep));
		}
		subtract(other) {
			this.assertSame(other);
			return this.init(this.ep.subtract(other.ep));
		}
		multiply(scalar) {
			return this.init(this.ep.multiply(scalar));
		}
		multiplyUnsafe(scalar) {
			return this.init(this.ep.multiplyUnsafe(scalar));
		}
		double() {
			return this.init(this.ep.double());
		}
		negate() {
			return this.init(this.ep.negate());
		}
		precompute(windowSize, isLazy) {
			return this.init(this.ep.precompute(windowSize, isLazy));
		}
		/** @deprecated use `toBytes` */
		toRawBytes() {
			return this.toBytes();
		}
	};
	exports.PrimeEdwardsPoint = PrimeEdwardsPoint;
	/**
	* Initializes EdDSA signatures over given Edwards curve.
	*/
	function eddsa(Point, cHash, eddsaOpts = {}) {
		if (typeof cHash !== "function") throw new Error("\"hash\" function param is required");
		(0, utils_ts_1._validateObject)(eddsaOpts, {}, {
			adjustScalarBytes: "function",
			randomBytes: "function",
			domain: "function",
			prehash: "function",
			mapToCurve: "function"
		});
		const { prehash } = eddsaOpts;
		const { BASE, Fp, Fn } = Point;
		const randomBytes = eddsaOpts.randomBytes || utils_ts_1.randomBytes;
		const adjustScalarBytes = eddsaOpts.adjustScalarBytes || ((bytes) => bytes);
		const domain = eddsaOpts.domain || ((data, ctx, phflag) => {
			(0, utils_ts_1._abool2)(phflag, "phflag");
			if (ctx.length || phflag) throw new Error("Contexts/pre-hash are not supported");
			return data;
		});
		function modN_LE(hash) {
			return Fn.create((0, utils_ts_1.bytesToNumberLE)(hash));
		}
		function getPrivateScalar(key) {
			const len = lengths.secretKey;
			key = (0, utils_ts_1.ensureBytes)("private key", key, len);
			const hashed = (0, utils_ts_1.ensureBytes)("hashed private key", cHash(key), 2 * len);
			const head = adjustScalarBytes(hashed.slice(0, len));
			return {
				head,
				prefix: hashed.slice(len, 2 * len),
				scalar: modN_LE(head)
			};
		}
		/** Convenience method that creates public key from scalar. RFC8032 5.1.5 */
		function getExtendedPublicKey(secretKey) {
			const { head, prefix, scalar } = getPrivateScalar(secretKey);
			const point = BASE.multiply(scalar);
			return {
				head,
				prefix,
				scalar,
				point,
				pointBytes: point.toBytes()
			};
		}
		/** Calculates EdDSA pub key. RFC8032 5.1.5. */
		function getPublicKey(secretKey) {
			return getExtendedPublicKey(secretKey).pointBytes;
		}
		function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
			const msg = (0, utils_ts_1.concatBytes)(...msgs);
			return modN_LE(cHash(domain(msg, (0, utils_ts_1.ensureBytes)("context", context), !!prehash)));
		}
		/** Signs message with privateKey. RFC8032 5.1.6 */
		function sign(msg, secretKey, options = {}) {
			msg = (0, utils_ts_1.ensureBytes)("message", msg);
			if (prehash) msg = prehash(msg);
			const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
			const r = hashDomainToScalar(options.context, prefix, msg);
			const R = BASE.multiply(r).toBytes();
			const k = hashDomainToScalar(options.context, R, pointBytes, msg);
			const s = Fn.create(r + k * scalar);
			if (!Fn.isValid(s)) throw new Error("sign failed: invalid s");
			const rs = (0, utils_ts_1.concatBytes)(R, Fn.toBytes(s));
			return (0, utils_ts_1._abytes2)(rs, lengths.signature, "result");
		}
		const verifyOpts = { zip215: true };
		/**
		* Verifies EdDSA signature against message and public key. RFC8032 5.1.7.
		* An extended group equation is checked.
		*/
		function verify(sig, msg, publicKey, options = verifyOpts) {
			const { context, zip215 } = options;
			const len = lengths.signature;
			sig = (0, utils_ts_1.ensureBytes)("signature", sig, len);
			msg = (0, utils_ts_1.ensureBytes)("message", msg);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, lengths.publicKey);
			if (zip215 !== void 0) (0, utils_ts_1._abool2)(zip215, "zip215");
			if (prehash) msg = prehash(msg);
			const mid = len / 2;
			const r = sig.subarray(0, mid);
			const s = (0, utils_ts_1.bytesToNumberLE)(sig.subarray(mid, len));
			let A, R, SB;
			try {
				A = Point.fromBytes(publicKey, zip215);
				R = Point.fromBytes(r, zip215);
				SB = BASE.multiplyUnsafe(s);
			} catch (error) {
				return false;
			}
			if (!zip215 && A.isSmallOrder()) return false;
			const k = hashDomainToScalar(context, R.toBytes(), A.toBytes(), msg);
			return R.add(A.multiplyUnsafe(k)).subtract(SB).clearCofactor().is0();
		}
		const _size = Fp.BYTES;
		const lengths = {
			secretKey: _size,
			publicKey: _size,
			signature: 2 * _size,
			seed: _size
		};
		function randomSecretKey(seed = randomBytes(lengths.seed)) {
			return (0, utils_ts_1._abytes2)(seed, lengths.seed, "seed");
		}
		function keygen(seed) {
			const secretKey = utils.randomSecretKey(seed);
			return {
				secretKey,
				publicKey: getPublicKey(secretKey)
			};
		}
		function isValidSecretKey(key) {
			return (0, utils_ts_1.isBytes)(key) && key.length === Fn.BYTES;
		}
		function isValidPublicKey(key, zip215) {
			try {
				return !!Point.fromBytes(key, zip215);
			} catch (error) {
				return false;
			}
		}
		const utils = {
			getExtendedPublicKey,
			randomSecretKey,
			isValidSecretKey,
			isValidPublicKey,
			/**
			* Converts ed public key to x public key. Uses formula:
			* - ed25519:
			*   - `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
			*   - `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
			* - ed448:
			*   - `(u, v) = ((y-1)/(y+1), sqrt(156324)*u/x)`
			*   - `(x, y) = (sqrt(156324)*u/v, (1+u)/(1-u))`
			*/
			toMontgomery(publicKey) {
				const { y } = Point.fromBytes(publicKey);
				const size = lengths.publicKey;
				const is25519 = size === 32;
				if (!is25519 && size !== 57) throw new Error("only defined for 25519 and 448");
				const u = is25519 ? Fp.div(_1n + y, _1n - y) : Fp.div(y - _1n, y + _1n);
				return Fp.toBytes(u);
			},
			toMontgomerySecret(secretKey) {
				const size = lengths.secretKey;
				(0, utils_ts_1._abytes2)(secretKey, size);
				const hashed = cHash(secretKey.subarray(0, size));
				return adjustScalarBytes(hashed).subarray(0, size);
			},
			/** @deprecated */
			randomPrivateKey: randomSecretKey,
			/** @deprecated */
			precompute(windowSize = 8, point = Point.BASE) {
				return point.precompute(windowSize, false);
			}
		};
		return Object.freeze({
			keygen,
			getPublicKey,
			sign,
			verify,
			utils,
			Point,
			lengths
		});
	}
	function _eddsa_legacy_opts_to_new(c) {
		const CURVE = {
			a: c.a,
			d: c.d,
			p: c.Fp.ORDER,
			n: c.n,
			h: c.h,
			Gx: c.Gx,
			Gy: c.Gy
		};
		const curveOpts = {
			Fp: c.Fp,
			Fn: (0, modular_ts_1.Field)(CURVE.n, c.nBitLength, true),
			uvRatio: c.uvRatio
		};
		const eddsaOpts = {
			randomBytes: c.randomBytes,
			adjustScalarBytes: c.adjustScalarBytes,
			domain: c.domain,
			prehash: c.prehash,
			mapToCurve: c.mapToCurve
		};
		return {
			CURVE,
			curveOpts,
			hash: c.hash,
			eddsaOpts
		};
	}
	function _eddsa_new_output_to_legacy(c, eddsa) {
		const Point = eddsa.Point;
		return Object.assign({}, eddsa, {
			ExtendedPoint: Point,
			CURVE: c,
			nBitLength: Point.Fn.BITS,
			nByteLength: Point.Fn.BYTES
		});
	}
	function twistedEdwards(c) {
		const { CURVE, curveOpts, hash, eddsaOpts } = _eddsa_legacy_opts_to_new(c);
		return _eddsa_new_output_to_legacy(c, eddsa(edwards(CURVE, curveOpts), hash, eddsaOpts));
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/abstract/hash-to-curve.js
var require_hash_to_curve = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._DST_scalar = void 0;
	exports.expand_message_xmd = expand_message_xmd;
	exports.expand_message_xof = expand_message_xof;
	exports.hash_to_field = hash_to_field;
	exports.isogenyMap = isogenyMap;
	exports.createHasher = createHasher;
	var utils_ts_1 = require_utils();
	var modular_ts_1 = require_modular();
	var os2ip = utils_ts_1.bytesToNumberBE;
	function i2osp(value, length) {
		anum(value);
		anum(length);
		if (value < 0 || value >= 1 << 8 * length) throw new Error("invalid I2OSP input: " + value);
		const res = Array.from({ length }).fill(0);
		for (let i = length - 1; i >= 0; i--) {
			res[i] = value & 255;
			value >>>= 8;
		}
		return new Uint8Array(res);
	}
	function strxor(a, b) {
		const arr = new Uint8Array(a.length);
		for (let i = 0; i < a.length; i++) arr[i] = a[i] ^ b[i];
		return arr;
	}
	function anum(item) {
		if (!Number.isSafeInteger(item)) throw new Error("number expected");
	}
	function normDST(DST) {
		if (!(0, utils_ts_1.isBytes)(DST) && typeof DST !== "string") throw new Error("DST must be Uint8Array or string");
		return typeof DST === "string" ? (0, utils_ts_1.utf8ToBytes)(DST) : DST;
	}
	/**
	* Produces a uniformly random byte string using a cryptographic hash function H that outputs b bits.
	* [RFC 9380 5.3.1](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.1).
	*/
	function expand_message_xmd(msg, DST, lenInBytes, H) {
		(0, utils_ts_1.abytes)(msg);
		anum(lenInBytes);
		DST = normDST(DST);
		if (DST.length > 255) DST = H((0, utils_ts_1.concatBytes)((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-"), DST));
		const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
		const ell = Math.ceil(lenInBytes / b_in_bytes);
		if (lenInBytes > 65535 || ell > 255) throw new Error("expand_message_xmd: invalid lenInBytes");
		const DST_prime = (0, utils_ts_1.concatBytes)(DST, i2osp(DST.length, 1));
		const Z_pad = i2osp(0, r_in_bytes);
		const l_i_b_str = i2osp(lenInBytes, 2);
		const b = new Array(ell);
		const b_0 = H((0, utils_ts_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
		b[0] = H((0, utils_ts_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
		for (let i = 1; i <= ell; i++) {
			const args = [
				strxor(b_0, b[i - 1]),
				i2osp(i + 1, 1),
				DST_prime
			];
			b[i] = H((0, utils_ts_1.concatBytes)(...args));
		}
		return (0, utils_ts_1.concatBytes)(...b).slice(0, lenInBytes);
	}
	/**
	* Produces a uniformly random byte string using an extendable-output function (XOF) H.
	* 1. The collision resistance of H MUST be at least k bits.
	* 2. H MUST be an XOF that has been proved indifferentiable from
	*    a random oracle under a reasonable cryptographic assumption.
	* [RFC 9380 5.3.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.2).
	*/
	function expand_message_xof(msg, DST, lenInBytes, k, H) {
		(0, utils_ts_1.abytes)(msg);
		anum(lenInBytes);
		DST = normDST(DST);
		if (DST.length > 255) {
			const dkLen = Math.ceil(2 * k / 8);
			DST = H.create({ dkLen }).update((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-")).update(DST).digest();
		}
		if (lenInBytes > 65535 || DST.length > 255) throw new Error("expand_message_xof: invalid lenInBytes");
		return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
	}
	/**
	* Hashes arbitrary-length byte strings to a list of one or more elements of a finite field F.
	* [RFC 9380 5.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.2).
	* @param msg a byte string containing the message to hash
	* @param count the number of elements of F to output
	* @param options `{DST: string, p: bigint, m: number, k: number, expand: 'xmd' | 'xof', hash: H}`, see above
	* @returns [u_0, ..., u_(count - 1)], a list of field elements.
	*/
	function hash_to_field(msg, count, options) {
		(0, utils_ts_1._validateObject)(options, {
			p: "bigint",
			m: "number",
			k: "number",
			hash: "function"
		});
		const { p, k, m, hash, expand, DST } = options;
		if (!(0, utils_ts_1.isHash)(options.hash)) throw new Error("expected valid hash");
		(0, utils_ts_1.abytes)(msg);
		anum(count);
		const log2p = p.toString(2).length;
		const L = Math.ceil((log2p + k) / 8);
		const len_in_bytes = count * m * L;
		let prb;
		if (expand === "xmd") prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
		else if (expand === "xof") prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
		else if (expand === "_internal_pass") prb = msg;
		else throw new Error("expand must be \"xmd\" or \"xof\"");
		const u = new Array(count);
		for (let i = 0; i < count; i++) {
			const e = new Array(m);
			for (let j = 0; j < m; j++) {
				const elm_offset = L * (j + i * m);
				const tv = prb.subarray(elm_offset, elm_offset + L);
				e[j] = (0, modular_ts_1.mod)(os2ip(tv), p);
			}
			u[i] = e;
		}
		return u;
	}
	function isogenyMap(field, map) {
		const coeff = map.map((i) => Array.from(i).reverse());
		return (x, y) => {
			const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
			const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(field, [xd, yd], true);
			x = field.mul(xn, xd_inv);
			y = field.mul(y, field.mul(yn, yd_inv));
			return {
				x,
				y
			};
		};
	}
	exports._DST_scalar = (0, utils_ts_1.utf8ToBytes)("HashToScalar-");
	/** Creates hash-to-curve methods from EC Point and mapToCurve function. See {@link H2CHasher}. */
	function createHasher(Point, mapToCurve, defaults) {
		if (typeof mapToCurve !== "function") throw new Error("mapToCurve() must be defined");
		function map(num) {
			return Point.fromAffine(mapToCurve(num));
		}
		function clear(initial) {
			const P = initial.clearCofactor();
			if (P.equals(Point.ZERO)) return Point.ZERO;
			P.assertValidity();
			return P;
		}
		return {
			defaults,
			hashToCurve(msg, options) {
				const u = hash_to_field(msg, 2, Object.assign({}, defaults, options));
				const u0 = map(u[0]);
				const u1 = map(u[1]);
				return clear(u0.add(u1));
			},
			encodeToCurve(msg, options) {
				const optsDst = defaults.encodeDST ? { DST: defaults.encodeDST } : {};
				return clear(map(hash_to_field(msg, 1, Object.assign({}, defaults, optsDst, options))[0]));
			},
			/** See {@link H2CHasher} */
			mapToCurve(scalars) {
				if (!Array.isArray(scalars)) throw new Error("expected array of bigints");
				for (const i of scalars) if (typeof i !== "bigint") throw new Error("expected array of bigints");
				return clear(map(scalars));
			},
			hashToScalar(msg, options) {
				const N = Point.Fn.ORDER;
				return hash_to_field(msg, 1, Object.assign({}, defaults, {
					p: N,
					m: 1,
					DST: exports._DST_scalar
				}, options))[0][0];
			}
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/abstract/montgomery.js
var require_montgomery = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.montgomery = montgomery;
	/**
	* Montgomery curve methods. It's not really whole montgomery curve,
	* just bunch of very specific methods for X25519 / X448 from
	* [RFC 7748](https://www.rfc-editor.org/rfc/rfc7748)
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils();
	var modular_ts_1 = require_modular();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	function validateOpts(curve) {
		(0, utils_ts_1._validateObject)(curve, {
			adjustScalarBytes: "function",
			powPminus2: "function"
		});
		return Object.freeze({ ...curve });
	}
	function montgomery(curveDef) {
		const { P, type, adjustScalarBytes, powPminus2, randomBytes: rand } = validateOpts(curveDef);
		const is25519 = type === "x25519";
		if (!is25519 && type !== "x448") throw new Error("invalid type");
		const randomBytes_ = rand || utils_ts_1.randomBytes;
		const montgomeryBits = is25519 ? 255 : 448;
		const fieldLen = is25519 ? 32 : 56;
		const Gu = is25519 ? BigInt(9) : BigInt(5);
		const a24 = is25519 ? BigInt(121665) : BigInt(39081);
		const minScalar = is25519 ? _2n ** BigInt(254) : _2n ** BigInt(447);
		const maxScalar = minScalar + (is25519 ? BigInt(8) * _2n ** BigInt(251) - _1n : BigInt(4) * _2n ** BigInt(445) - _1n) + _1n;
		const modP = (n) => (0, modular_ts_1.mod)(n, P);
		const GuBytes = encodeU(Gu);
		function encodeU(u) {
			return (0, utils_ts_1.numberToBytesLE)(modP(u), fieldLen);
		}
		function decodeU(u) {
			const _u = (0, utils_ts_1.ensureBytes)("u coordinate", u, fieldLen);
			if (is25519) _u[31] &= 127;
			return modP((0, utils_ts_1.bytesToNumberLE)(_u));
		}
		function decodeScalar(scalar) {
			return (0, utils_ts_1.bytesToNumberLE)(adjustScalarBytes((0, utils_ts_1.ensureBytes)("scalar", scalar, fieldLen)));
		}
		function scalarMult(scalar, u) {
			const pu = montgomeryLadder(decodeU(u), decodeScalar(scalar));
			if (pu === _0n) throw new Error("invalid private or public key received");
			return encodeU(pu);
		}
		function scalarMultBase(scalar) {
			return scalarMult(scalar, GuBytes);
		}
		function cswap(swap, x_2, x_3) {
			const dummy = modP(swap * (x_2 - x_3));
			x_2 = modP(x_2 - dummy);
			x_3 = modP(x_3 + dummy);
			return {
				x_2,
				x_3
			};
		}
		/**
		* Montgomery x-only multiplication ladder.
		* @param pointU u coordinate (x) on Montgomery Curve 25519
		* @param scalar by which the point would be multiplied
		* @returns new Point on Montgomery curve
		*/
		function montgomeryLadder(u, scalar) {
			(0, utils_ts_1.aInRange)("u", u, _0n, P);
			(0, utils_ts_1.aInRange)("scalar", scalar, minScalar, maxScalar);
			const k = scalar;
			const x_1 = u;
			let x_2 = _1n;
			let z_2 = _0n;
			let x_3 = u;
			let z_3 = _1n;
			let swap = _0n;
			for (let t = BigInt(montgomeryBits - 1); t >= _0n; t--) {
				const k_t = k >> t & _1n;
				swap ^= k_t;
				({x_2, x_3} = cswap(swap, x_2, x_3));
				({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
				swap = k_t;
				const A = x_2 + z_2;
				const AA = modP(A * A);
				const B = x_2 - z_2;
				const BB = modP(B * B);
				const E = AA - BB;
				const C = x_3 + z_3;
				const D = x_3 - z_3;
				const DA = modP(D * A);
				const CB = modP(C * B);
				const dacb = DA + CB;
				const da_cb = DA - CB;
				x_3 = modP(dacb * dacb);
				z_3 = modP(x_1 * modP(da_cb * da_cb));
				x_2 = modP(AA * BB);
				z_2 = modP(E * (AA + modP(a24 * E)));
			}
			({x_2, x_3} = cswap(swap, x_2, x_3));
			({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
			const z2 = powPminus2(z_2);
			return modP(x_2 * z2);
		}
		const lengths = {
			secretKey: fieldLen,
			publicKey: fieldLen,
			seed: fieldLen
		};
		const randomSecretKey = (seed = randomBytes_(fieldLen)) => {
			(0, utils_ts_1.abytes)(seed, lengths.seed);
			return seed;
		};
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: scalarMultBase(secretKey)
			};
		}
		return {
			keygen,
			getSharedSecret: (secretKey, publicKey) => scalarMult(secretKey, publicKey),
			getPublicKey: (secretKey) => scalarMultBase(secretKey),
			scalarMult,
			scalarMultBase,
			utils: {
				randomSecretKey,
				randomPrivateKey: randomSecretKey
			},
			GuBytes: GuBytes.slice(),
			lengths
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/ed25519.js
var require_ed25519 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hash_to_ristretto255 = exports.hashToRistretto255 = exports.encodeToCurve = exports.hashToCurve = exports.RistrettoPoint = exports.edwardsToMontgomery = exports.ED25519_TORSION_SUBGROUP = exports.ristretto255_hasher = exports.ristretto255 = exports.ed25519_hasher = exports.x25519 = exports.ed25519ph = exports.ed25519ctx = exports.ed25519 = void 0;
	exports.edwardsToMontgomeryPub = edwardsToMontgomeryPub;
	exports.edwardsToMontgomeryPriv = edwardsToMontgomeryPriv;
	/**
	* ed25519 Twisted Edwards curve with following addons:
	* - X25519 ECDH
	* - Ristretto cofactor elimination
	* - Elligator hash-to-group / point indistinguishability
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_js_1 = require_sha2();
	var utils_js_1 = require_utils$5();
	var curve_ts_1 = require_curve();
	var edwards_ts_1 = require_edwards();
	var hash_to_curve_ts_1 = require_hash_to_curve();
	var modular_ts_1 = require_modular();
	var montgomery_ts_1 = require_montgomery();
	var utils_ts_1 = require_utils();
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	var _5n = BigInt(5);
	var _8n = BigInt(8);
	var ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
	var ed25519_CURVE = /* @__PURE__ */ (() => ({
		p: ed25519_CURVE_p,
		n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
		h: _8n,
		a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
		d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
		Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
		Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
	}))();
	function ed25519_pow_2_252_3(x) {
		const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
		const P = ed25519_CURVE_p;
		const b2 = x * x % P * x % P;
		const b4 = (0, modular_ts_1.pow2)(b2, _2n, P) * b2 % P;
		const b5 = (0, modular_ts_1.pow2)(b4, _1n, P) * x % P;
		const b10 = (0, modular_ts_1.pow2)(b5, _5n, P) * b5 % P;
		const b20 = (0, modular_ts_1.pow2)(b10, _10n, P) * b10 % P;
		const b40 = (0, modular_ts_1.pow2)(b20, _20n, P) * b20 % P;
		const b80 = (0, modular_ts_1.pow2)(b40, _40n, P) * b40 % P;
		const b160 = (0, modular_ts_1.pow2)(b80, _80n, P) * b80 % P;
		const b240 = (0, modular_ts_1.pow2)(b160, _80n, P) * b80 % P;
		const b250 = (0, modular_ts_1.pow2)(b240, _10n, P) * b10 % P;
		return {
			pow_p_5_8: (0, modular_ts_1.pow2)(b250, _2n, P) * x % P,
			b2
		};
	}
	function adjustScalarBytes(bytes) {
		bytes[0] &= 248;
		bytes[31] &= 127;
		bytes[31] |= 64;
		return bytes;
	}
	var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
	function uvRatio(u, v) {
		const P = ed25519_CURVE_p;
		const v3 = (0, modular_ts_1.mod)(v * v * v, P);
		const pow = ed25519_pow_2_252_3(u * (0, modular_ts_1.mod)(v3 * v3 * v, P)).pow_p_5_8;
		let x = (0, modular_ts_1.mod)(u * v3 * pow, P);
		const vx2 = (0, modular_ts_1.mod)(v * x * x, P);
		const root1 = x;
		const root2 = (0, modular_ts_1.mod)(x * ED25519_SQRT_M1, P);
		const useRoot1 = vx2 === u;
		const useRoot2 = vx2 === (0, modular_ts_1.mod)(-u, P);
		const noRoot = vx2 === (0, modular_ts_1.mod)(-u * ED25519_SQRT_M1, P);
		if (useRoot1) x = root1;
		if (useRoot2 || noRoot) x = root2;
		if ((0, modular_ts_1.isNegativeLE)(x, P)) x = (0, modular_ts_1.mod)(-x, P);
		return {
			isValid: useRoot1 || useRoot2,
			value: x
		};
	}
	var Fp = /* @__PURE__ */ (() => (0, modular_ts_1.Field)(ed25519_CURVE.p, { isLE: true }))();
	var Fn = /* @__PURE__ */ (() => (0, modular_ts_1.Field)(ed25519_CURVE.n, { isLE: true }))();
	var ed25519Defaults = /* @__PURE__ */ (() => ({
		...ed25519_CURVE,
		Fp,
		hash: sha2_js_1.sha512,
		adjustScalarBytes,
		uvRatio
	}))();
	/**
	* ed25519 curve with EdDSA signatures.
	* @example
	* import { ed25519 } from '@noble/curves/ed25519';
	* const { secretKey, publicKey } = ed25519.keygen();
	* const msg = new TextEncoder().encode('hello');
	* const sig = ed25519.sign(msg, priv);
	* ed25519.verify(sig, msg, pub); // Default mode: follows ZIP215
	* ed25519.verify(sig, msg, pub, { zip215: false }); // RFC8032 / FIPS 186-5
	*/
	exports.ed25519 = (() => (0, edwards_ts_1.twistedEdwards)(ed25519Defaults))();
	function ed25519_domain(data, ctx, phflag) {
		if (ctx.length > 255) throw new Error("Context is too big");
		return (0, utils_js_1.concatBytes)((0, utils_js_1.utf8ToBytes)("SigEd25519 no Ed25519 collisions"), new Uint8Array([phflag ? 1 : 0, ctx.length]), ctx, data);
	}
	/** Context of ed25519. Uses context for domain separation. */
	exports.ed25519ctx = (() => (0, edwards_ts_1.twistedEdwards)({
		...ed25519Defaults,
		domain: ed25519_domain
	}))();
	/** Prehashed version of ed25519. Accepts already-hashed messages in sign() and verify(). */
	exports.ed25519ph = (() => (0, edwards_ts_1.twistedEdwards)(Object.assign({}, ed25519Defaults, {
		domain: ed25519_domain,
		prehash: sha2_js_1.sha512
	})))();
	/**
	* ECDH using curve25519 aka x25519.
	* @example
	* import { x25519 } from '@noble/curves/ed25519';
	* const priv = 'a546e36bf0527c9d3b16154b82465edd62144c0ac1fc5a18506a2244ba449ac4';
	* const pub = 'e6db6867583030db3594c1a424b15f7c726624ec26b3353b10a903a6d0ab1c4c';
	* x25519.getSharedSecret(priv, pub) === x25519.scalarMult(priv, pub); // aliases
	* x25519.getPublicKey(priv) === x25519.scalarMultBase(priv);
	* x25519.getPublicKey(x25519.utils.randomSecretKey());
	*/
	exports.x25519 = (() => {
		const P = Fp.ORDER;
		return (0, montgomery_ts_1.montgomery)({
			P,
			type: "x25519",
			powPminus2: (x) => {
				const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
				return (0, modular_ts_1.mod)((0, modular_ts_1.pow2)(pow_p_5_8, _3n, P) * b2, P);
			},
			adjustScalarBytes
		});
	})();
	var ELL2_C1 = /* @__PURE__ */ (() => (ed25519_CURVE_p + _3n) / _8n)();
	var ELL2_C2 = /* @__PURE__ */ (() => Fp.pow(_2n, ELL2_C1))();
	var ELL2_C3 = /* @__PURE__ */ (() => Fp.sqrt(Fp.neg(Fp.ONE)))();
	function map_to_curve_elligator2_curve25519(u) {
		const ELL2_C4 = (ed25519_CURVE_p - _5n) / _8n;
		const ELL2_J = BigInt(486662);
		let tv1 = Fp.sqr(u);
		tv1 = Fp.mul(tv1, _2n);
		let xd = Fp.add(tv1, Fp.ONE);
		let x1n = Fp.neg(ELL2_J);
		let tv2 = Fp.sqr(xd);
		let gxd = Fp.mul(tv2, xd);
		let gx1 = Fp.mul(tv1, ELL2_J);
		gx1 = Fp.mul(gx1, x1n);
		gx1 = Fp.add(gx1, tv2);
		gx1 = Fp.mul(gx1, x1n);
		let tv3 = Fp.sqr(gxd);
		tv2 = Fp.sqr(tv3);
		tv3 = Fp.mul(tv3, gxd);
		tv3 = Fp.mul(tv3, gx1);
		tv2 = Fp.mul(tv2, tv3);
		let y11 = Fp.pow(tv2, ELL2_C4);
		y11 = Fp.mul(y11, tv3);
		let y12 = Fp.mul(y11, ELL2_C3);
		tv2 = Fp.sqr(y11);
		tv2 = Fp.mul(tv2, gxd);
		let e1 = Fp.eql(tv2, gx1);
		let y1 = Fp.cmov(y12, y11, e1);
		let x2n = Fp.mul(x1n, tv1);
		let y21 = Fp.mul(y11, u);
		y21 = Fp.mul(y21, ELL2_C2);
		let y22 = Fp.mul(y21, ELL2_C3);
		let gx2 = Fp.mul(gx1, tv1);
		tv2 = Fp.sqr(y21);
		tv2 = Fp.mul(tv2, gxd);
		let e2 = Fp.eql(tv2, gx2);
		let y2 = Fp.cmov(y22, y21, e2);
		tv2 = Fp.sqr(y1);
		tv2 = Fp.mul(tv2, gxd);
		let e3 = Fp.eql(tv2, gx1);
		let xn = Fp.cmov(x2n, x1n, e3);
		let y = Fp.cmov(y2, y1, e3);
		let e4 = Fp.isOdd(y);
		y = Fp.cmov(y, Fp.neg(y), e3 !== e4);
		return {
			xMn: xn,
			xMd: xd,
			yMn: y,
			yMd: _1n
		};
	}
	var ELL2_C1_EDWARDS = /* @__PURE__ */ (() => (0, modular_ts_1.FpSqrtEven)(Fp, Fp.neg(BigInt(486664))))();
	function map_to_curve_elligator2_edwards25519(u) {
		const { xMn, xMd, yMn, yMd } = map_to_curve_elligator2_curve25519(u);
		let xn = Fp.mul(xMn, yMd);
		xn = Fp.mul(xn, ELL2_C1_EDWARDS);
		let xd = Fp.mul(xMd, yMn);
		let yn = Fp.sub(xMn, xMd);
		let yd = Fp.add(xMn, xMd);
		let tv1 = Fp.mul(xd, yd);
		let e = Fp.eql(tv1, Fp.ZERO);
		xn = Fp.cmov(xn, Fp.ZERO, e);
		xd = Fp.cmov(xd, Fp.ONE, e);
		yn = Fp.cmov(yn, Fp.ONE, e);
		yd = Fp.cmov(yd, Fp.ONE, e);
		const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(Fp, [xd, yd], true);
		return {
			x: Fp.mul(xn, xd_inv),
			y: Fp.mul(yn, yd_inv)
		};
	}
	/** Hashing to ed25519 points / field. RFC 9380 methods. */
	exports.ed25519_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports.ed25519.Point, (scalars) => map_to_curve_elligator2_edwards25519(scalars[0]), {
		DST: "edwards25519_XMD:SHA-512_ELL2_RO_",
		encodeDST: "edwards25519_XMD:SHA-512_ELL2_NU_",
		p: ed25519_CURVE_p,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_js_1.sha512
	}))();
	var SQRT_M1 = ED25519_SQRT_M1;
	var SQRT_AD_MINUS_ONE = /* @__PURE__ */ BigInt("25063068953384623474111414158702152701244531502492656460079210482610430750235");
	var INVSQRT_A_MINUS_D = /* @__PURE__ */ BigInt("54469307008909316920995813868745141605393597292927456921205312896311721017578");
	var ONE_MINUS_D_SQ = /* @__PURE__ */ BigInt("1159843021668779879193775521855586647937357759715417654439879720876111806838");
	var D_MINUS_ONE_SQ = /* @__PURE__ */ BigInt("40440834346308536858101042469323190826248399146238708352240133220865137265952");
	var invertSqrt = (number) => uvRatio(_1n, number);
	var MAX_255B = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
	var bytes255ToNumberLE = (bytes) => exports.ed25519.Point.Fp.create((0, utils_ts_1.bytesToNumberLE)(bytes) & MAX_255B);
	/**
	* Computes Elligator map for Ristretto255.
	* Described in [RFC9380](https://www.rfc-editor.org/rfc/rfc9380#appendix-B) and on
	* the [website](https://ristretto.group/formulas/elligator.html).
	*/
	function calcElligatorRistrettoMap(r0) {
		const { d } = ed25519_CURVE;
		const P = ed25519_CURVE_p;
		const mod = (n) => Fp.create(n);
		const r = mod(SQRT_M1 * r0 * r0);
		const Ns = mod((r + _1n) * ONE_MINUS_D_SQ);
		let c = BigInt(-1);
		const D = mod((c - d * r) * mod(r + d));
		let { isValid: Ns_D_is_sq, value: s } = uvRatio(Ns, D);
		let s_ = mod(s * r0);
		if (!(0, modular_ts_1.isNegativeLE)(s_, P)) s_ = mod(-s_);
		if (!Ns_D_is_sq) s = s_;
		if (!Ns_D_is_sq) c = r;
		const Nt = mod(c * (r - _1n) * D_MINUS_ONE_SQ - D);
		const s2 = s * s;
		const W0 = mod((s + s) * D);
		const W1 = mod(Nt * SQRT_AD_MINUS_ONE);
		const W2 = mod(_1n - s2);
		const W3 = mod(_1n + s2);
		return new exports.ed25519.Point(mod(W0 * W3), mod(W2 * W1), mod(W1 * W3), mod(W0 * W2));
	}
	function ristretto255_map(bytes) {
		(0, utils_js_1.abytes)(bytes, 64);
		const R1 = calcElligatorRistrettoMap(bytes255ToNumberLE(bytes.subarray(0, 32)));
		const R2 = calcElligatorRistrettoMap(bytes255ToNumberLE(bytes.subarray(32, 64)));
		return new _RistrettoPoint(R1.add(R2));
	}
	/**
	* Wrapper over Edwards Point for ristretto255.
	*
	* Each ed25519/ExtendedPoint has 8 different equivalent points. This can be
	* a source of bugs for protocols like ring signatures. Ristretto was created to solve this.
	* Ristretto point operates in X:Y:Z:T extended coordinates like ExtendedPoint,
	* but it should work in its own namespace: do not combine those two.
	* See [RFC9496](https://www.rfc-editor.org/rfc/rfc9496).
	*/
	var _RistrettoPoint = class _RistrettoPoint extends edwards_ts_1.PrimeEdwardsPoint {
		constructor(ep) {
			super(ep);
		}
		static fromAffine(ap) {
			return new _RistrettoPoint(exports.ed25519.Point.fromAffine(ap));
		}
		assertSame(other) {
			if (!(other instanceof _RistrettoPoint)) throw new Error("RistrettoPoint expected");
		}
		init(ep) {
			return new _RistrettoPoint(ep);
		}
		/** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
		static hashToCurve(hex) {
			return ristretto255_map((0, utils_ts_1.ensureBytes)("ristrettoHash", hex, 64));
		}
		static fromBytes(bytes) {
			(0, utils_js_1.abytes)(bytes, 32);
			const { a, d } = ed25519_CURVE;
			const P = ed25519_CURVE_p;
			const mod = (n) => Fp.create(n);
			const s = bytes255ToNumberLE(bytes);
			if (!(0, utils_ts_1.equalBytes)(Fp.toBytes(s), bytes) || (0, modular_ts_1.isNegativeLE)(s, P)) throw new Error("invalid ristretto255 encoding 1");
			const s2 = mod(s * s);
			const u1 = mod(_1n + a * s2);
			const u2 = mod(_1n - a * s2);
			const u1_2 = mod(u1 * u1);
			const u2_2 = mod(u2 * u2);
			const v = mod(a * d * u1_2 - u2_2);
			const { isValid, value: I } = invertSqrt(mod(v * u2_2));
			const Dx = mod(I * u2);
			const Dy = mod(I * Dx * v);
			let x = mod((s + s) * Dx);
			if ((0, modular_ts_1.isNegativeLE)(x, P)) x = mod(-x);
			const y = mod(u1 * Dy);
			const t = mod(x * y);
			if (!isValid || (0, modular_ts_1.isNegativeLE)(t, P) || y === _0n) throw new Error("invalid ristretto255 encoding 2");
			return new _RistrettoPoint(new exports.ed25519.Point(x, y, _1n, t));
		}
		/**
		* Converts ristretto-encoded string to ristretto point.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-decode).
		* @param hex Ristretto-encoded 32 bytes. Not every 32-byte string is valid ristretto encoding
		*/
		static fromHex(hex) {
			return _RistrettoPoint.fromBytes((0, utils_ts_1.ensureBytes)("ristrettoHex", hex, 32));
		}
		static msm(points, scalars) {
			return (0, curve_ts_1.pippenger)(_RistrettoPoint, exports.ed25519.Point.Fn, points, scalars);
		}
		/**
		* Encodes ristretto point to Uint8Array.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-encode).
		*/
		toBytes() {
			let { X, Y, Z, T } = this.ep;
			const P = ed25519_CURVE_p;
			const mod = (n) => Fp.create(n);
			const u1 = mod(mod(Z + Y) * mod(Z - Y));
			const u2 = mod(X * Y);
			const { value: invsqrt } = invertSqrt(mod(u1 * mod(u2 * u2)));
			const D1 = mod(invsqrt * u1);
			const D2 = mod(invsqrt * u2);
			const zInv = mod(D1 * D2 * T);
			let D;
			if ((0, modular_ts_1.isNegativeLE)(T * zInv, P)) {
				let _x = mod(Y * SQRT_M1);
				let _y = mod(X * SQRT_M1);
				X = _x;
				Y = _y;
				D = mod(D1 * INVSQRT_A_MINUS_D);
			} else D = D2;
			if ((0, modular_ts_1.isNegativeLE)(X * zInv, P)) Y = mod(-Y);
			let s = mod((Z - Y) * D);
			if ((0, modular_ts_1.isNegativeLE)(s, P)) s = mod(-s);
			return Fp.toBytes(s);
		}
		/**
		* Compares two Ristretto points.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-equals).
		*/
		equals(other) {
			this.assertSame(other);
			const { X: X1, Y: Y1 } = this.ep;
			const { X: X2, Y: Y2 } = other.ep;
			const mod = (n) => Fp.create(n);
			const one = mod(X1 * Y2) === mod(Y1 * X2);
			const two = mod(Y1 * Y2) === mod(X1 * X2);
			return one || two;
		}
		is0() {
			return this.equals(_RistrettoPoint.ZERO);
		}
	};
	_RistrettoPoint.BASE = /* @__PURE__ */ (() => new _RistrettoPoint(exports.ed25519.Point.BASE))();
	_RistrettoPoint.ZERO = /* @__PURE__ */ (() => new _RistrettoPoint(exports.ed25519.Point.ZERO))();
	_RistrettoPoint.Fp = /* @__PURE__ */ (() => Fp)();
	_RistrettoPoint.Fn = /* @__PURE__ */ (() => Fn)();
	exports.ristretto255 = { Point: _RistrettoPoint };
	/** Hashing to ristretto255 points / field. RFC 9380 methods. */
	exports.ristretto255_hasher = {
		hashToCurve(msg, options) {
			const DST = options?.DST || "ristretto255_XMD:SHA-512_R255MAP_RO_";
			return ristretto255_map((0, hash_to_curve_ts_1.expand_message_xmd)(msg, DST, 64, sha2_js_1.sha512));
		},
		hashToScalar(msg, options = { DST: hash_to_curve_ts_1._DST_scalar }) {
			const xmd = (0, hash_to_curve_ts_1.expand_message_xmd)(msg, options.DST, 64, sha2_js_1.sha512);
			return Fn.create((0, utils_ts_1.bytesToNumberLE)(xmd));
		}
	};
	/**
	* Weird / bogus points, useful for debugging.
	* All 8 ed25519 points of 8-torsion subgroup can be generated from the point
	* T = `26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05`.
	* ⟨T⟩ = { O, T, 2T, 3T, 4T, 5T, 6T, 7T }
	*/
	exports.ED25519_TORSION_SUBGROUP = [
		"0100000000000000000000000000000000000000000000000000000000000000",
		"c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a",
		"0000000000000000000000000000000000000000000000000000000000000080",
		"26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05",
		"ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
		"26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85",
		"0000000000000000000000000000000000000000000000000000000000000000",
		"c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa"
	];
	/** @deprecated use `ed25519.utils.toMontgomery` */
	function edwardsToMontgomeryPub(edwardsPub) {
		return exports.ed25519.utils.toMontgomery((0, utils_ts_1.ensureBytes)("pub", edwardsPub));
	}
	/** @deprecated use `ed25519.utils.toMontgomery` */
	exports.edwardsToMontgomery = edwardsToMontgomeryPub;
	/** @deprecated use `ed25519.utils.toMontgomerySecret` */
	function edwardsToMontgomeryPriv(edwardsPriv) {
		return exports.ed25519.utils.toMontgomerySecret((0, utils_ts_1.ensureBytes)("pub", edwardsPriv));
	}
	/** @deprecated use `ristretto255.Point` */
	exports.RistrettoPoint = _RistrettoPoint;
	/** @deprecated use `import { ed25519_hasher } from '@noble/curves/ed25519.js';` */
	exports.hashToCurve = (() => exports.ed25519_hasher.hashToCurve)();
	/** @deprecated use `import { ed25519_hasher } from '@noble/curves/ed25519.js';` */
	exports.encodeToCurve = (() => exports.ed25519_hasher.encodeToCurve)();
	/** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
	exports.hashToRistretto255 = (() => exports.ristretto255_hasher.hashToCurve)();
	/** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
	exports.hash_to_ristretto255 = (() => exports.ristretto255_hasher.hashToCurve)();
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/abstract/weierstrass.js
var require_weierstrass = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DER = exports.DERErr = void 0;
	exports._splitEndoScalar = _splitEndoScalar;
	exports._normFnElement = _normFnElement;
	exports.weierstrassN = weierstrassN;
	exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
	exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
	exports.ecdh = ecdh;
	exports.ecdsa = ecdsa;
	exports.weierstrassPoints = weierstrassPoints;
	exports._legacyHelperEquat = _legacyHelperEquat;
	exports.weierstrass = weierstrass;
	/**
	* Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
	*
	* ### Design rationale for types
	*
	* * Interaction between classes from different curves should fail:
	*   `k256.Point.BASE.add(p256.Point.BASE)`
	* * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
	* * Different calls of `curve()` would return different classes -
	*   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
	*   it won't affect others
	*
	* TypeScript can't infer types for classes created inside a function. Classes is one instance
	* of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
	* unique type for every function call.
	*
	* We can use generic types via some param, like curve opts, but that would:
	*     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
	*     which is hard to debug.
	*     2. Params can be generic and we can't enforce them to be constant value:
	*     if somebody creates curve from non-constant params,
	*     it would be allowed to interact with other curves with non-constant params
	*
	* @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var hmac_js_1 = require_hmac();
	var utils_1 = require_utils$5();
	var utils_ts_1 = require_utils();
	var curve_ts_1 = require_curve();
	var modular_ts_1 = require_modular();
	var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n) / den;
	/**
	* Splits scalar for GLV endomorphism.
	*/
	function _splitEndoScalar(k, basis, n) {
		const [[a1, b1], [a2, b2]] = basis;
		const c1 = divNearest(b2 * k, n);
		const c2 = divNearest(-b1 * k, n);
		let k1 = k - c1 * a1 - c2 * a2;
		let k2 = -c1 * b1 - c2 * b2;
		const k1neg = k1 < _0n;
		const k2neg = k2 < _0n;
		if (k1neg) k1 = -k1;
		if (k2neg) k2 = -k2;
		const MAX_NUM = (0, utils_ts_1.bitMask)(Math.ceil((0, utils_ts_1.bitLen)(n) / 2)) + _1n;
		if (k1 < _0n || k1 >= MAX_NUM || k2 < _0n || k2 >= MAX_NUM) throw new Error("splitScalar (endomorphism): failed, k=" + k);
		return {
			k1neg,
			k1,
			k2neg,
			k2
		};
	}
	function validateSigFormat(format) {
		if (![
			"compact",
			"recovered",
			"der"
		].includes(format)) throw new Error("Signature format must be \"compact\", \"recovered\", or \"der\"");
		return format;
	}
	function validateSigOpts(opts, def) {
		const optsn = {};
		for (let optName of Object.keys(def)) optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
		(0, utils_ts_1._abool2)(optsn.lowS, "lowS");
		(0, utils_ts_1._abool2)(optsn.prehash, "prehash");
		if (optsn.format !== void 0) validateSigFormat(optsn.format);
		return optsn;
	}
	var DERErr = class extends Error {
		constructor(m = "") {
			super(m);
		}
	};
	exports.DERErr = DERErr;
	/**
	* ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
	*
	*     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
	*
	* Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
	*/
	exports.DER = {
		Err: DERErr,
		_tlv: {
			encode: (tag, data) => {
				const { Err: E } = exports.DER;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length & 1) throw new E("tlv.encode: unpadded data");
				const dataLen = data.length / 2;
				const len = (0, utils_ts_1.numberToHexUnpadded)(dataLen);
				if (len.length / 2 & 128) throw new E("tlv.encode: long form length too big");
				const lenLen = dataLen > 127 ? (0, utils_ts_1.numberToHexUnpadded)(len.length / 2 | 128) : "";
				return (0, utils_ts_1.numberToHexUnpadded)(tag) + lenLen + len + data;
			},
			decode(tag, data) {
				const { Err: E } = exports.DER;
				let pos = 0;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length < 2 || data[pos++] !== tag) throw new E("tlv.decode: wrong tlv");
				const first = data[pos++];
				const isLong = !!(first & 128);
				let length = 0;
				if (!isLong) length = first;
				else {
					const lenLen = first & 127;
					if (!lenLen) throw new E("tlv.decode(long): indefinite length not supported");
					if (lenLen > 4) throw new E("tlv.decode(long): byte length is too big");
					const lengthBytes = data.subarray(pos, pos + lenLen);
					if (lengthBytes.length !== lenLen) throw new E("tlv.decode: length bytes not complete");
					if (lengthBytes[0] === 0) throw new E("tlv.decode(long): zero leftmost byte");
					for (const b of lengthBytes) length = length << 8 | b;
					pos += lenLen;
					if (length < 128) throw new E("tlv.decode(long): not minimal encoding");
				}
				const v = data.subarray(pos, pos + length);
				if (v.length !== length) throw new E("tlv.decode: wrong value length");
				return {
					v,
					l: data.subarray(pos + length)
				};
			}
		},
		_int: {
			encode(num) {
				const { Err: E } = exports.DER;
				if (num < _0n) throw new E("integer: negative integers are not allowed");
				let hex = (0, utils_ts_1.numberToHexUnpadded)(num);
				if (Number.parseInt(hex[0], 16) & 8) hex = "00" + hex;
				if (hex.length & 1) throw new E("unexpected DER parsing assertion: unpadded hex");
				return hex;
			},
			decode(data) {
				const { Err: E } = exports.DER;
				if (data[0] & 128) throw new E("invalid signature integer: negative");
				if (data[0] === 0 && !(data[1] & 128)) throw new E("invalid signature integer: unnecessary leading zero");
				return (0, utils_ts_1.bytesToNumberBE)(data);
			}
		},
		toSig(hex) {
			const { Err: E, _int: int, _tlv: tlv } = exports.DER;
			const data = (0, utils_ts_1.ensureBytes)("signature", hex);
			const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
			if (seqLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
			const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
			if (sLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			return {
				r: int.decode(rBytes),
				s: int.decode(sBytes)
			};
		},
		hexFromSig(sig) {
			const { _tlv: tlv, _int: int } = exports.DER;
			const seq = tlv.encode(2, int.encode(sig.r)) + tlv.encode(2, int.encode(sig.s));
			return tlv.encode(48, seq);
		}
	};
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _3n = BigInt(3);
	var _4n = BigInt(4);
	function _normFnElement(Fn, key) {
		const { BYTES: expected } = Fn;
		let num;
		if (typeof key === "bigint") num = key;
		else {
			let bytes = (0, utils_ts_1.ensureBytes)("private key", key);
			try {
				num = Fn.fromBytes(bytes);
			} catch (error) {
				throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
			}
		}
		if (!Fn.isValidNot0(num)) throw new Error("invalid private key: out of range [1..N-1]");
		return num;
	}
	/**
	* Creates weierstrass Point constructor, based on specified curve options.
	*
	* @example
	```js
	const opts = {
	p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
	n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
	h: BigInt(1),
	a: BigInt('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'),
	b: BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'),
	Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
	Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'),
	};
	const p256_Point = weierstrass(opts);
	```
	*/
	function weierstrassN(params, extraOpts = {}) {
		const validated = (0, curve_ts_1._createCurveFields)("weierstrass", params, extraOpts);
		const { Fp, Fn } = validated;
		let CURVE = validated.CURVE;
		const { h: cofactor, n: CURVE_ORDER } = CURVE;
		(0, utils_ts_1._validateObject)(extraOpts, {}, {
			allowInfinityPoint: "boolean",
			clearCofactor: "function",
			isTorsionFree: "function",
			fromBytes: "function",
			toBytes: "function",
			endo: "object",
			wrapPrivateKey: "boolean"
		});
		const { endo } = extraOpts;
		if (endo) {
			if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) throw new Error("invalid endo: expected \"beta\": bigint and \"basises\": array");
		}
		const lengths = getWLengths(Fp, Fn);
		function assertCompressionIsSupported() {
			if (!Fp.isOdd) throw new Error("compression is not supported: Field does not have .isOdd()");
		}
		function pointToBytes(_c, point, isCompressed) {
			const { x, y } = point.toAffine();
			const bx = Fp.toBytes(x);
			(0, utils_ts_1._abool2)(isCompressed, "isCompressed");
			if (isCompressed) {
				assertCompressionIsSupported();
				const hasEvenY = !Fp.isOdd(y);
				return (0, utils_ts_1.concatBytes)(pprefix(hasEvenY), bx);
			} else return (0, utils_ts_1.concatBytes)(Uint8Array.of(4), bx, Fp.toBytes(y));
		}
		function pointFromBytes(bytes) {
			(0, utils_ts_1._abytes2)(bytes, void 0, "Point");
			const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
			const length = bytes.length;
			const head = bytes[0];
			const tail = bytes.subarray(1);
			if (length === comp && (head === 2 || head === 3)) {
				const x = Fp.fromBytes(tail);
				if (!Fp.isValid(x)) throw new Error("bad point: is not on curve, wrong x");
				const y2 = weierstrassEquation(x);
				let y;
				try {
					y = Fp.sqrt(y2);
				} catch (sqrtError) {
					const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
					throw new Error("bad point: is not on curve, sqrt error" + err);
				}
				assertCompressionIsSupported();
				const isYOdd = Fp.isOdd(y);
				if ((head & 1) === 1 !== isYOdd) y = Fp.neg(y);
				return {
					x,
					y
				};
			} else if (length === uncomp && head === 4) {
				const L = Fp.BYTES;
				const x = Fp.fromBytes(tail.subarray(0, L));
				const y = Fp.fromBytes(tail.subarray(L, L * 2));
				if (!isValidXY(x, y)) throw new Error("bad point: is not on curve");
				return {
					x,
					y
				};
			} else throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
		}
		const encodePoint = extraOpts.toBytes || pointToBytes;
		const decodePoint = extraOpts.fromBytes || pointFromBytes;
		function weierstrassEquation(x) {
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
		}
		/** Checks whether equation holds for given x, y: y² == x³ + ax + b */
		function isValidXY(x, y) {
			const left = Fp.sqr(y);
			const right = weierstrassEquation(x);
			return Fp.eql(left, right);
		}
		if (!isValidXY(CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
		const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
		if (Fp.is0(Fp.add(_4a3, _27b2))) throw new Error("bad curve params: a or b");
		/** Asserts coordinate is valid: 0 <= n < Fp.ORDER. */
		function acoord(title, n, banZero = false) {
			if (!Fp.isValid(n) || banZero && Fp.is0(n)) throw new Error(`bad point coordinate ${title}`);
			return n;
		}
		function aprjpoint(other) {
			if (!(other instanceof Point)) throw new Error("ProjectivePoint expected");
		}
		function splitEndoScalarN(k) {
			if (!endo || !endo.basises) throw new Error("no endo");
			return _splitEndoScalar(k, endo.basises, Fn.ORDER);
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { X, Y, Z } = p;
			if (Fp.eql(Z, Fp.ONE)) return {
				x: X,
				y: Y
			};
			const is0 = p.is0();
			if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(Z);
			const x = Fp.mul(X, iz);
			const y = Fp.mul(Y, iz);
			const zz = Fp.mul(Z, iz);
			if (is0) return {
				x: Fp.ZERO,
				y: Fp.ZERO
			};
			if (!Fp.eql(zz, Fp.ONE)) throw new Error("invZ was invalid");
			return {
				x,
				y
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			if (p.is0()) {
				if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y)) return;
				throw new Error("bad point: ZERO");
			}
			const { x, y } = p.toAffine();
			if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error("bad point: x or y not field elements");
			if (!isValidXY(x, y)) throw new Error("bad point: equation left != right");
			if (!p.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
			return true;
		});
		function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
			k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
			k1p = (0, curve_ts_1.negateCt)(k1neg, k1p);
			k2p = (0, curve_ts_1.negateCt)(k2neg, k2p);
			return k1p.add(k2p);
		}
		/**
		* Projective Point works in 3d / projective (homogeneous) coordinates:(X, Y, Z) ∋ (x=X/Z, y=Y/Z).
		* Default Point works in 2d / affine coordinates: (x, y).
		* We're doing calculations in projective, because its operations don't require costly inversion.
		*/
		class Point {
			/** Does NOT validate if the point is valid. Use `.assertValidity()`. */
			constructor(X, Y, Z) {
				this.X = acoord("x", X);
				this.Y = acoord("y", Y, true);
				this.Z = acoord("z", Z);
				Object.freeze(this);
			}
			static CURVE() {
				return CURVE;
			}
			/** Does NOT validate if the point is valid. Use `.assertValidity()`. */
			static fromAffine(p) {
				const { x, y } = p || {};
				if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error("invalid affine point");
				if (p instanceof Point) throw new Error("projective point not allowed");
				if (Fp.is0(x) && Fp.is0(y)) return Point.ZERO;
				return new Point(x, y, Fp.ONE);
			}
			static fromBytes(bytes) {
				const P = Point.fromAffine(decodePoint((0, utils_ts_1._abytes2)(bytes, void 0, "point")));
				P.assertValidity();
				return P;
			}
			static fromHex(hex) {
				return Point.fromBytes((0, utils_ts_1.ensureBytes)("pointHex", hex));
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			/**
			*
			* @param windowSize
			* @param isLazy true will defer table computation until the first multiplication
			* @returns
			*/
			precompute(windowSize = 8, isLazy = true) {
				wnaf.createCache(this, windowSize);
				if (!isLazy) this.multiply(_3n);
				return this;
			}
			/** A point on curve is valid if it conforms to equation. */
			assertValidity() {
				assertValidMemo(this);
			}
			hasEvenY() {
				const { y } = this.toAffine();
				if (!Fp.isOdd) throw new Error("Field doesn't support isOdd");
				return !Fp.isOdd(y);
			}
			/** Compare one point to another. */
			equals(other) {
				aprjpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
				const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
				return U1 && U2;
			}
			/** Flips point to one corresponding to (x, -y) in Affine coordinates. */
			negate() {
				return new Point(this.X, Fp.neg(this.Y), this.Z);
			}
			double() {
				const { a, b } = CURVE;
				const b3 = Fp.mul(b, _3n);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				let t0 = Fp.mul(X1, X1);
				let t1 = Fp.mul(Y1, Y1);
				let t2 = Fp.mul(Z1, Z1);
				let t3 = Fp.mul(X1, Y1);
				t3 = Fp.add(t3, t3);
				Z3 = Fp.mul(X1, Z1);
				Z3 = Fp.add(Z3, Z3);
				X3 = Fp.mul(a, Z3);
				Y3 = Fp.mul(b3, t2);
				Y3 = Fp.add(X3, Y3);
				X3 = Fp.sub(t1, Y3);
				Y3 = Fp.add(t1, Y3);
				Y3 = Fp.mul(X3, Y3);
				X3 = Fp.mul(t3, X3);
				Z3 = Fp.mul(b3, Z3);
				t2 = Fp.mul(a, t2);
				t3 = Fp.sub(t0, t2);
				t3 = Fp.mul(a, t3);
				t3 = Fp.add(t3, Z3);
				Z3 = Fp.add(t0, t0);
				t0 = Fp.add(Z3, t0);
				t0 = Fp.add(t0, t2);
				t0 = Fp.mul(t0, t3);
				Y3 = Fp.add(Y3, t0);
				t2 = Fp.mul(Y1, Z1);
				t2 = Fp.add(t2, t2);
				t0 = Fp.mul(t2, t3);
				X3 = Fp.sub(X3, t0);
				Z3 = Fp.mul(t2, t1);
				Z3 = Fp.add(Z3, Z3);
				Z3 = Fp.add(Z3, Z3);
				return new Point(X3, Y3, Z3);
			}
			add(other) {
				aprjpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				const a = CURVE.a;
				const b3 = Fp.mul(CURVE.b, _3n);
				let t0 = Fp.mul(X1, X2);
				let t1 = Fp.mul(Y1, Y2);
				let t2 = Fp.mul(Z1, Z2);
				let t3 = Fp.add(X1, Y1);
				let t4 = Fp.add(X2, Y2);
				t3 = Fp.mul(t3, t4);
				t4 = Fp.add(t0, t1);
				t3 = Fp.sub(t3, t4);
				t4 = Fp.add(X1, Z1);
				let t5 = Fp.add(X2, Z2);
				t4 = Fp.mul(t4, t5);
				t5 = Fp.add(t0, t2);
				t4 = Fp.sub(t4, t5);
				t5 = Fp.add(Y1, Z1);
				X3 = Fp.add(Y2, Z2);
				t5 = Fp.mul(t5, X3);
				X3 = Fp.add(t1, t2);
				t5 = Fp.sub(t5, X3);
				Z3 = Fp.mul(a, t4);
				X3 = Fp.mul(b3, t2);
				Z3 = Fp.add(X3, Z3);
				X3 = Fp.sub(t1, Z3);
				Z3 = Fp.add(t1, Z3);
				Y3 = Fp.mul(X3, Z3);
				t1 = Fp.add(t0, t0);
				t1 = Fp.add(t1, t0);
				t2 = Fp.mul(a, t2);
				t4 = Fp.mul(b3, t4);
				t1 = Fp.add(t1, t2);
				t2 = Fp.sub(t0, t2);
				t2 = Fp.mul(a, t2);
				t4 = Fp.add(t4, t2);
				t0 = Fp.mul(t1, t4);
				Y3 = Fp.add(Y3, t0);
				t0 = Fp.mul(t5, t4);
				X3 = Fp.mul(t3, X3);
				X3 = Fp.sub(X3, t0);
				t0 = Fp.mul(t3, t1);
				Z3 = Fp.mul(t5, Z3);
				Z3 = Fp.add(Z3, t0);
				return new Point(X3, Y3, Z3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			/**
			* Constant time multiplication.
			* Uses wNAF method. Windowed method may be 10% faster,
			* but takes 2x longer to generate and consumes 2x memory.
			* Uses precomputes when available.
			* Uses endomorphism for Koblitz curves.
			* @param scalar by which the point would be multiplied
			* @returns New point
			*/
			multiply(scalar) {
				const { endo } = extraOpts;
				if (!Fn.isValidNot0(scalar)) throw new Error("invalid scalar: out of range");
				let point, fake;
				const mul = (n) => wnaf.cached(this, n, (p) => (0, curve_ts_1.normalizeZ)(Point, p));
				/** See docs for {@link EndomorphismOpts} */
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
					const { p: k1p, f: k1f } = mul(k1);
					const { p: k2p, f: k2f } = mul(k2);
					fake = k1f.add(k2f);
					point = finishEndo(endo.beta, k1p, k2p, k1neg, k2neg);
				} else {
					const { p, f } = mul(scalar);
					point = p;
					fake = f;
				}
				return (0, curve_ts_1.normalizeZ)(Point, [point, fake])[0];
			}
			/**
			* Non-constant-time multiplication. Uses double-and-add algorithm.
			* It's faster, but should only be used when you don't care about
			* an exposed secret key e.g. sig verification, which works over *public* keys.
			*/
			multiplyUnsafe(sc) {
				const { endo } = extraOpts;
				const p = this;
				if (!Fn.isValid(sc)) throw new Error("invalid scalar: out of range");
				if (sc === _0n || p.is0()) return Point.ZERO;
				if (sc === _1n) return p;
				if (wnaf.hasCache(this)) return this.multiply(sc);
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
					const { p1, p2 } = (0, curve_ts_1.mulEndoUnsafe)(Point, p, k1, k2);
					return finishEndo(endo.beta, p1, p2, k1neg, k2neg);
				} else return wnaf.unsafe(p, sc);
			}
			multiplyAndAddUnsafe(Q, a, b) {
				const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
				return sum.is0() ? void 0 : sum;
			}
			/**
			* Converts Projective point to affine (x, y) coordinates.
			* @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
			*/
			toAffine(invertedZ) {
				return toAffineMemo(this, invertedZ);
			}
			/**
			* Checks whether Point is free of torsion elements (is in prime subgroup).
			* Always torsion-free for cofactor=1 curves.
			*/
			isTorsionFree() {
				const { isTorsionFree } = extraOpts;
				if (cofactor === _1n) return true;
				if (isTorsionFree) return isTorsionFree(Point, this);
				return wnaf.unsafe(this, CURVE_ORDER).is0();
			}
			clearCofactor() {
				const { clearCofactor } = extraOpts;
				if (cofactor === _1n) return this;
				if (clearCofactor) return clearCofactor(Point, this);
				return this.multiplyUnsafe(cofactor);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			toBytes(isCompressed = true) {
				(0, utils_ts_1._abool2)(isCompressed, "isCompressed");
				this.assertValidity();
				return encodePoint(Point, this, isCompressed);
			}
			toHex(isCompressed = true) {
				return (0, utils_ts_1.bytesToHex)(this.toBytes(isCompressed));
			}
			toString() {
				return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
			}
			get px() {
				return this.X;
			}
			get py() {
				return this.X;
			}
			get pz() {
				return this.Z;
			}
			toRawBytes(isCompressed = true) {
				return this.toBytes(isCompressed);
			}
			_setWindowSize(windowSize) {
				this.precompute(windowSize);
			}
			static normalizeZ(points) {
				return (0, curve_ts_1.normalizeZ)(Point, points);
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			static fromPrivateKey(privateKey) {
				return Point.BASE.multiply(_normFnElement(Fn, privateKey));
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
		Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
		Point.Fp = Fp;
		Point.Fn = Fn;
		const bits = Fn.BITS;
		const wnaf = new curve_ts_1.wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
		Point.BASE.precompute(8);
		return Point;
	}
	function pprefix(hasEvenY) {
		return Uint8Array.of(hasEvenY ? 2 : 3);
	}
	/**
	* Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
	* TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
	* b = True and y = sqrt(u / v) if (u / v) is square in F, and
	* b = False and y = sqrt(Z * (u / v)) otherwise.
	* @param Fp
	* @param Z
	* @returns
	*/
	function SWUFpSqrtRatio(Fp, Z) {
		const q = Fp.ORDER;
		let l = _0n;
		for (let o = q - _1n; o % _2n === _0n; o /= _2n) l += _1n;
		const c1 = l;
		const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;
		const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
		const c2 = (q - _1n) / _2n_pow_c1;
		const c3 = (c2 - _1n) / _2n;
		const c4 = _2n_pow_c1 - _1n;
		const c5 = _2n_pow_c1_1;
		const c6 = Fp.pow(Z, c2);
		const c7 = Fp.pow(Z, (c2 + _1n) / _2n);
		let sqrtRatio = (u, v) => {
			let tv1 = c6;
			let tv2 = Fp.pow(v, c4);
			let tv3 = Fp.sqr(tv2);
			tv3 = Fp.mul(tv3, v);
			let tv5 = Fp.mul(u, tv3);
			tv5 = Fp.pow(tv5, c3);
			tv5 = Fp.mul(tv5, tv2);
			tv2 = Fp.mul(tv5, v);
			tv3 = Fp.mul(tv5, u);
			let tv4 = Fp.mul(tv3, tv2);
			tv5 = Fp.pow(tv4, c5);
			let isQR = Fp.eql(tv5, Fp.ONE);
			tv2 = Fp.mul(tv3, c7);
			tv5 = Fp.mul(tv4, tv1);
			tv3 = Fp.cmov(tv2, tv3, isQR);
			tv4 = Fp.cmov(tv5, tv4, isQR);
			for (let i = c1; i > _1n; i--) {
				let tv5 = i - _2n;
				tv5 = _2n << tv5 - _1n;
				let tvv5 = Fp.pow(tv4, tv5);
				const e1 = Fp.eql(tvv5, Fp.ONE);
				tv2 = Fp.mul(tv3, tv1);
				tv1 = Fp.mul(tv1, tv1);
				tvv5 = Fp.mul(tv4, tv1);
				tv3 = Fp.cmov(tv2, tv3, e1);
				tv4 = Fp.cmov(tvv5, tv4, e1);
			}
			return {
				isValid: isQR,
				value: tv3
			};
		};
		if (Fp.ORDER % _4n === _3n) {
			const c1 = (Fp.ORDER - _3n) / _4n;
			const c2 = Fp.sqrt(Fp.neg(Z));
			sqrtRatio = (u, v) => {
				let tv1 = Fp.sqr(v);
				const tv2 = Fp.mul(u, v);
				tv1 = Fp.mul(tv1, tv2);
				let y1 = Fp.pow(tv1, c1);
				y1 = Fp.mul(y1, tv2);
				const y2 = Fp.mul(y1, c2);
				const tv3 = Fp.mul(Fp.sqr(y1), v);
				const isQR = Fp.eql(tv3, u);
				return {
					isValid: isQR,
					value: Fp.cmov(y2, y1, isQR)
				};
			};
		}
		return sqrtRatio;
	}
	/**
	* Simplified Shallue-van de Woestijne-Ulas Method
	* https://www.rfc-editor.org/rfc/rfc9380#section-6.6.2
	*/
	function mapToCurveSimpleSWU(Fp, opts) {
		(0, modular_ts_1.validateField)(Fp);
		const { A, B, Z } = opts;
		if (!Fp.isValid(A) || !Fp.isValid(B) || !Fp.isValid(Z)) throw new Error("mapToCurveSimpleSWU: invalid opts");
		const sqrtRatio = SWUFpSqrtRatio(Fp, Z);
		if (!Fp.isOdd) throw new Error("Field does not have .isOdd()");
		return (u) => {
			let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
			tv1 = Fp.sqr(u);
			tv1 = Fp.mul(tv1, Z);
			tv2 = Fp.sqr(tv1);
			tv2 = Fp.add(tv2, tv1);
			tv3 = Fp.add(tv2, Fp.ONE);
			tv3 = Fp.mul(tv3, B);
			tv4 = Fp.cmov(Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
			tv4 = Fp.mul(tv4, A);
			tv2 = Fp.sqr(tv3);
			tv6 = Fp.sqr(tv4);
			tv5 = Fp.mul(tv6, A);
			tv2 = Fp.add(tv2, tv5);
			tv2 = Fp.mul(tv2, tv3);
			tv6 = Fp.mul(tv6, tv4);
			tv5 = Fp.mul(tv6, B);
			tv2 = Fp.add(tv2, tv5);
			x = Fp.mul(tv1, tv3);
			const { isValid, value } = sqrtRatio(tv2, tv6);
			y = Fp.mul(tv1, u);
			y = Fp.mul(y, value);
			x = Fp.cmov(x, tv3, isValid);
			y = Fp.cmov(y, value, isValid);
			const e1 = Fp.isOdd(u) === Fp.isOdd(y);
			y = Fp.cmov(Fp.neg(y), y, e1);
			const tv4_inv = (0, modular_ts_1.FpInvertBatch)(Fp, [tv4], true)[0];
			x = Fp.mul(x, tv4_inv);
			return {
				x,
				y
			};
		};
	}
	function getWLengths(Fp, Fn) {
		return {
			secretKey: Fn.BYTES,
			publicKey: 1 + Fp.BYTES,
			publicKeyUncompressed: 1 + 2 * Fp.BYTES,
			publicKeyHasPrefix: true,
			signature: 2 * Fn.BYTES
		};
	}
	/**
	* Sometimes users only need getPublicKey, getSharedSecret, and secret key handling.
	* This helper ensures no signature functionality is present. Less code, smaller bundle size.
	*/
	function ecdh(Point, ecdhOpts = {}) {
		const { Fn } = Point;
		const randomBytes_ = ecdhOpts.randomBytes || utils_ts_1.randomBytes;
		const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: (0, modular_ts_1.getMinHashLength)(Fn.ORDER) });
		function isValidSecretKey(secretKey) {
			try {
				return !!_normFnElement(Fn, secretKey);
			} catch (error) {
				return false;
			}
		}
		function isValidPublicKey(publicKey, isCompressed) {
			const { publicKey: comp, publicKeyUncompressed } = lengths;
			try {
				const l = publicKey.length;
				if (isCompressed === true && l !== comp) return false;
				if (isCompressed === false && l !== publicKeyUncompressed) return false;
				return !!Point.fromBytes(publicKey);
			} catch (error) {
				return false;
			}
		}
		/**
		* Produces cryptographically secure secret key from random of size
		* (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
		*/
		function randomSecretKey(seed = randomBytes_(lengths.seed)) {
			return (0, modular_ts_1.mapHashToField)((0, utils_ts_1._abytes2)(seed, lengths.seed, "seed"), Fn.ORDER);
		}
		/**
		* Computes public key for a secret key. Checks for validity of the secret key.
		* @param isCompressed whether to return compact (default), or full key
		* @returns Public key, full when isCompressed=false; short when isCompressed=true
		*/
		function getPublicKey(secretKey, isCompressed = true) {
			return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
		}
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: getPublicKey(secretKey)
			};
		}
		/**
		* Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
		*/
		function isProbPub(item) {
			if (typeof item === "bigint") return false;
			if (item instanceof Point) return true;
			const { secretKey, publicKey, publicKeyUncompressed } = lengths;
			if (Fn.allowedLengths || secretKey === publicKey) return void 0;
			const l = (0, utils_ts_1.ensureBytes)("key", item).length;
			return l === publicKey || l === publicKeyUncompressed;
		}
		/**
		* ECDH (Elliptic Curve Diffie Hellman).
		* Computes shared public key from secret key A and public key B.
		* Checks: 1) secret key validity 2) shared key is on-curve.
		* Does NOT hash the result.
		* @param isCompressed whether to return compact (default), or full key
		* @returns shared public key
		*/
		function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
			if (isProbPub(secretKeyA) === true) throw new Error("first arg must be private key");
			if (isProbPub(publicKeyB) === false) throw new Error("second arg must be public key");
			const s = _normFnElement(Fn, secretKeyA);
			return Point.fromHex(publicKeyB).multiply(s).toBytes(isCompressed);
		}
		return Object.freeze({
			getPublicKey,
			getSharedSecret,
			keygen,
			Point,
			utils: {
				isValidSecretKey,
				isValidPublicKey,
				randomSecretKey,
				isValidPrivateKey: isValidSecretKey,
				randomPrivateKey: randomSecretKey,
				normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
				precompute(windowSize = 8, point = Point.BASE) {
					return point.precompute(windowSize, false);
				}
			},
			lengths
		});
	}
	/**
	* Creates ECDSA signing interface for given elliptic curve `Point` and `hash` function.
	* We need `hash` for 2 features:
	* 1. Message prehash-ing. NOT used if `sign` / `verify` are called with `prehash: false`
	* 2. k generation in `sign`, using HMAC-drbg(hash)
	*
	* ECDSAOpts are only rarely needed.
	*
	* @example
	* ```js
	* const p256_Point = weierstrass(...);
	* const p256_sha256 = ecdsa(p256_Point, sha256);
	* const p256_sha224 = ecdsa(p256_Point, sha224);
	* const p256_sha224_r = ecdsa(p256_Point, sha224, { randomBytes: (length) => { ... } });
	* ```
	*/
	function ecdsa(Point, hash, ecdsaOpts = {}) {
		(0, utils_1.ahash)(hash);
		(0, utils_ts_1._validateObject)(ecdsaOpts, {}, {
			hmac: "function",
			lowS: "boolean",
			randomBytes: "function",
			bits2int: "function",
			bits2int_modN: "function"
		});
		const randomBytes = ecdsaOpts.randomBytes || utils_ts_1.randomBytes;
		const hmac = ecdsaOpts.hmac || ((key, ...msgs) => (0, hmac_js_1.hmac)(hash, key, (0, utils_ts_1.concatBytes)(...msgs)));
		const { Fp, Fn } = Point;
		const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
		const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
		const defaultSigOpts = {
			prehash: false,
			lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
			format: void 0,
			extraEntropy: false
		};
		const defaultSigOpts_format = "compact";
		function isBiggerThanHalfOrder(number) {
			return number > CURVE_ORDER >> _1n;
		}
		function validateRS(title, num) {
			if (!Fn.isValidNot0(num)) throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
			return num;
		}
		function validateSigLength(bytes, format) {
			validateSigFormat(format);
			const size = lengths.signature;
			const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
			return (0, utils_ts_1._abytes2)(bytes, sizer, `${format} signature`);
		}
		/**
		* ECDSA signature with its (r, s) properties. Supports compact, recovered & DER representations.
		*/
		class Signature {
			constructor(r, s, recovery) {
				this.r = validateRS("r", r);
				this.s = validateRS("s", s);
				if (recovery != null) this.recovery = recovery;
				Object.freeze(this);
			}
			static fromBytes(bytes, format = defaultSigOpts_format) {
				validateSigLength(bytes, format);
				let recid;
				if (format === "der") {
					const { r, s } = exports.DER.toSig((0, utils_ts_1._abytes2)(bytes));
					return new Signature(r, s);
				}
				if (format === "recovered") {
					recid = bytes[0];
					format = "compact";
					bytes = bytes.subarray(1);
				}
				const L = Fn.BYTES;
				const r = bytes.subarray(0, L);
				const s = bytes.subarray(L, L * 2);
				return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
			}
			static fromHex(hex, format) {
				return this.fromBytes((0, utils_ts_1.hexToBytes)(hex), format);
			}
			addRecoveryBit(recovery) {
				return new Signature(this.r, this.s, recovery);
			}
			recoverPublicKey(messageHash) {
				const FIELD_ORDER = Fp.ORDER;
				const { r, s, recovery: rec } = this;
				if (rec == null || ![
					0,
					1,
					2,
					3
				].includes(rec)) throw new Error("recovery id invalid");
				if (CURVE_ORDER * _2n < FIELD_ORDER && rec > 1) throw new Error("recovery id is ambiguous for h>1 curve");
				const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
				if (!Fp.isValid(radj)) throw new Error("recovery id 2 or 3 invalid");
				const x = Fp.toBytes(radj);
				const R = Point.fromBytes((0, utils_ts_1.concatBytes)(pprefix((rec & 1) === 0), x));
				const ir = Fn.inv(radj);
				const h = bits2int_modN((0, utils_ts_1.ensureBytes)("msgHash", messageHash));
				const u1 = Fn.create(-h * ir);
				const u2 = Fn.create(s * ir);
				const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
				if (Q.is0()) throw new Error("point at infinify");
				Q.assertValidity();
				return Q;
			}
			hasHighS() {
				return isBiggerThanHalfOrder(this.s);
			}
			toBytes(format = defaultSigOpts_format) {
				validateSigFormat(format);
				if (format === "der") return (0, utils_ts_1.hexToBytes)(exports.DER.hexFromSig(this));
				const r = Fn.toBytes(this.r);
				const s = Fn.toBytes(this.s);
				if (format === "recovered") {
					if (this.recovery == null) throw new Error("recovery bit must be present");
					return (0, utils_ts_1.concatBytes)(Uint8Array.of(this.recovery), r, s);
				}
				return (0, utils_ts_1.concatBytes)(r, s);
			}
			toHex(format) {
				return (0, utils_ts_1.bytesToHex)(this.toBytes(format));
			}
			assertValidity() {}
			static fromCompact(hex) {
				return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "compact");
			}
			static fromDER(hex) {
				return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "der");
			}
			normalizeS() {
				return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
			}
			toDERRawBytes() {
				return this.toBytes("der");
			}
			toDERHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes("der"));
			}
			toCompactRawBytes() {
				return this.toBytes("compact");
			}
			toCompactHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes("compact"));
			}
		}
		const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
			if (bytes.length > 8192) throw new Error("input is too large");
			const num = (0, utils_ts_1.bytesToNumberBE)(bytes);
			const delta = bytes.length * 8 - fnBits;
			return delta > 0 ? num >> BigInt(delta) : num;
		};
		const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
			return Fn.create(bits2int(bytes));
		};
		const ORDER_MASK = (0, utils_ts_1.bitMask)(fnBits);
		/** Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`. */
		function int2octets(num) {
			(0, utils_ts_1.aInRange)("num < 2^" + fnBits, num, _0n, ORDER_MASK);
			return Fn.toBytes(num);
		}
		function validateMsgAndHash(message, prehash) {
			(0, utils_ts_1._abytes2)(message, void 0, "message");
			return prehash ? (0, utils_ts_1._abytes2)(hash(message), void 0, "prehashed message") : message;
		}
		/**
		* Steps A, D of RFC6979 3.2.
		* Creates RFC6979 seed; converts msg/privKey to numbers.
		* Used only in sign, not in verify.
		*
		* Warning: we cannot assume here that message has same amount of bytes as curve order,
		* this will be invalid at least for P521. Also it can be bigger for P224 + SHA256.
		*/
		function prepSig(message, privateKey, opts) {
			if (["recovered", "canonical"].some((k) => k in opts)) throw new Error("sign() legacy options not supported");
			const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
			message = validateMsgAndHash(message, prehash);
			const h1int = bits2int_modN(message);
			const d = _normFnElement(Fn, privateKey);
			const seedArgs = [int2octets(d), int2octets(h1int)];
			if (extraEntropy != null && extraEntropy !== false) {
				const e = extraEntropy === true ? randomBytes(lengths.secretKey) : extraEntropy;
				seedArgs.push((0, utils_ts_1.ensureBytes)("extraEntropy", e));
			}
			const seed = (0, utils_ts_1.concatBytes)(...seedArgs);
			const m = h1int;
			function k2sig(kBytes) {
				const k = bits2int(kBytes);
				if (!Fn.isValidNot0(k)) return;
				const ik = Fn.inv(k);
				const q = Point.BASE.multiply(k).toAffine();
				const r = Fn.create(q.x);
				if (r === _0n) return;
				const s = Fn.create(ik * Fn.create(m + r * d));
				if (s === _0n) return;
				let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n);
				let normS = s;
				if (lowS && isBiggerThanHalfOrder(s)) {
					normS = Fn.neg(s);
					recovery ^= 1;
				}
				return new Signature(r, normS, recovery);
			}
			return {
				seed,
				k2sig
			};
		}
		/**
		* Signs message hash with a secret key.
		*
		* ```
		* sign(m, d) where
		*   k = rfc6979_hmac_drbg(m, d)
		*   (x, y) = G × k
		*   r = x mod n
		*   s = (m + dr) / k mod n
		* ```
		*/
		function sign(message, secretKey, opts = {}) {
			message = (0, utils_ts_1.ensureBytes)("message", message);
			const { seed, k2sig } = prepSig(message, secretKey, opts);
			return (0, utils_ts_1.createHmacDrbg)(hash.outputLen, Fn.BYTES, hmac)(seed, k2sig);
		}
		function tryParsingSig(sg) {
			let sig = void 0;
			const isHex = typeof sg === "string" || (0, utils_ts_1.isBytes)(sg);
			const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
			if (!isHex && !isObj) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
			if (isObj) sig = new Signature(sg.r, sg.s);
			else if (isHex) {
				try {
					sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "der");
				} catch (derError) {
					if (!(derError instanceof exports.DER.Err)) throw derError;
				}
				if (!sig) try {
					sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "compact");
				} catch (error) {
					return false;
				}
			}
			if (!sig) return false;
			return sig;
		}
		/**
		* Verifies a signature against message and public key.
		* Rejects lowS signatures by default: see {@link ECDSAVerifyOpts}.
		* Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
		*
		* ```
		* verify(r, s, h, P) where
		*   u1 = hs^-1 mod n
		*   u2 = rs^-1 mod n
		*   R = u1⋅G + u2⋅P
		*   mod(R.x, n) == r
		* ```
		*/
		function verify(signature, message, publicKey, opts = {}) {
			const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey);
			message = validateMsgAndHash((0, utils_ts_1.ensureBytes)("message", message), prehash);
			if ("strict" in opts) throw new Error("options.strict was renamed to lowS");
			const sig = format === void 0 ? tryParsingSig(signature) : Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", signature), format);
			if (sig === false) return false;
			try {
				const P = Point.fromBytes(publicKey);
				if (lowS && sig.hasHighS()) return false;
				const { r, s } = sig;
				const h = bits2int_modN(message);
				const is = Fn.inv(s);
				const u1 = Fn.create(h * is);
				const u2 = Fn.create(r * is);
				const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
				if (R.is0()) return false;
				return Fn.create(R.x) === r;
			} catch (e) {
				return false;
			}
		}
		function recoverPublicKey(signature, message, opts = {}) {
			const { prehash } = validateSigOpts(opts, defaultSigOpts);
			message = validateMsgAndHash(message, prehash);
			return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
		}
		return Object.freeze({
			keygen,
			getPublicKey,
			getSharedSecret,
			utils,
			lengths,
			Point,
			sign,
			verify,
			recoverPublicKey,
			Signature,
			hash
		});
	}
	/** @deprecated use `weierstrass` in newer releases */
	function weierstrassPoints(c) {
		const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
		return _weierstrass_new_output_to_legacy(c, weierstrassN(CURVE, curveOpts));
	}
	function _weierstrass_legacy_opts_to_new(c) {
		const CURVE = {
			a: c.a,
			b: c.b,
			p: c.Fp.ORDER,
			n: c.n,
			h: c.h,
			Gx: c.Gx,
			Gy: c.Gy
		};
		const Fp = c.Fp;
		let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
		return {
			CURVE,
			curveOpts: {
				Fp,
				Fn: (0, modular_ts_1.Field)(CURVE.n, {
					BITS: c.nBitLength,
					allowedLengths,
					modFromBytes: c.wrapPrivateKey
				}),
				allowInfinityPoint: c.allowInfinityPoint,
				endo: c.endo,
				isTorsionFree: c.isTorsionFree,
				clearCofactor: c.clearCofactor,
				fromBytes: c.fromBytes,
				toBytes: c.toBytes
			}
		};
	}
	function _ecdsa_legacy_opts_to_new(c) {
		const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
		const ecdsaOpts = {
			hmac: c.hmac,
			randomBytes: c.randomBytes,
			lowS: c.lowS,
			bits2int: c.bits2int,
			bits2int_modN: c.bits2int_modN
		};
		return {
			CURVE,
			curveOpts,
			hash: c.hash,
			ecdsaOpts
		};
	}
	function _legacyHelperEquat(Fp, a, b) {
		/**
		* y² = x³ + ax + b: Short weierstrass curve formula. Takes x, returns y².
		* @returns y²
		*/
		function weierstrassEquation(x) {
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
		}
		return weierstrassEquation;
	}
	function _weierstrass_new_output_to_legacy(c, Point) {
		const { Fp, Fn } = Point;
		function isWithinCurveOrder(num) {
			return (0, utils_ts_1.inRange)(num, _1n, Fn.ORDER);
		}
		const weierstrassEquation = _legacyHelperEquat(Fp, c.a, c.b);
		return Object.assign({}, {
			CURVE: c,
			Point,
			ProjectivePoint: Point,
			normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
			weierstrassEquation,
			isWithinCurveOrder
		});
	}
	function _ecdsa_new_output_to_legacy(c, _ecdsa) {
		const Point = _ecdsa.Point;
		return Object.assign({}, _ecdsa, {
			ProjectivePoint: Point,
			CURVE: Object.assign({}, c, (0, modular_ts_1.nLength)(Point.Fn.ORDER, Point.Fn.BITS))
		});
	}
	function weierstrass(c) {
		const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
		return _ecdsa_new_output_to_legacy(c, ecdsa(weierstrassN(CURVE, curveOpts), hash, ecdsaOpts));
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/_shortw_utils.js
var require__shortw_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getHash = getHash;
	exports.createCurve = createCurve;
	/**
	* Utilities for short weierstrass curves, combined with noble-hashes.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var weierstrass_ts_1 = require_weierstrass();
	/** connects noble-curves to noble-hashes */
	function getHash(hash) {
		return { hash };
	}
	/** @deprecated use new `weierstrass()` and `ecdsa()` methods */
	function createCurve(curveDef, defHash) {
		const create = (hash) => (0, weierstrass_ts_1.weierstrass)({
			...curveDef,
			hash
		});
		return {
			...create(defHash),
			create
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/nist.js
var require_nist = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p521_hasher = exports.secp521r1 = exports.secp384r1 = exports.secp256r1 = exports.p521 = exports.p384_hasher = exports.p384 = exports.p256_hasher = exports.p256 = void 0;
	/**
	* Internal module for NIST P256, P384, P521 curves.
	* Do not use for now.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_js_1 = require_sha2();
	var _shortw_utils_ts_1 = require__shortw_utils();
	var hash_to_curve_ts_1 = require_hash_to_curve();
	var modular_ts_1 = require_modular();
	var weierstrass_ts_1 = require_weierstrass();
	var p256_CURVE = {
		p: BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"),
		n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
		h: BigInt(1),
		a: BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"),
		b: BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
		Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
		Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")
	};
	var p384_CURVE = {
		p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"),
		n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
		h: BigInt(1),
		a: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc"),
		b: BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef"),
		Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
		Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f")
	};
	var p521_CURVE = {
		p: BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
		n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
		h: BigInt(1),
		a: BigInt("0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc"),
		b: BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00"),
		Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
		Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650")
	};
	var Fp256 = (0, modular_ts_1.Field)(p256_CURVE.p);
	var Fp384 = (0, modular_ts_1.Field)(p384_CURVE.p);
	var Fp521 = (0, modular_ts_1.Field)(p521_CURVE.p);
	function createSWU(Point, opts) {
		const map = (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Point.Fp, opts);
		return (scalars) => map(scalars[0]);
	}
	/** NIST P256 (aka secp256r1, prime256v1) curve, ECDSA and ECDH methods. */
	exports.p256 = (0, _shortw_utils_ts_1.createCurve)({
		...p256_CURVE,
		Fp: Fp256,
		lowS: false
	}, sha2_js_1.sha256);
	/** Hashing / encoding to p256 points / field. RFC 9380 methods. */
	exports.p256_hasher = (() => {
		return (0, hash_to_curve_ts_1.createHasher)(exports.p256.Point, createSWU(exports.p256.Point, {
			A: p256_CURVE.a,
			B: p256_CURVE.b,
			Z: exports.p256.Point.Fp.create(BigInt("-10"))
		}), {
			DST: "P256_XMD:SHA-256_SSWU_RO_",
			encodeDST: "P256_XMD:SHA-256_SSWU_NU_",
			p: p256_CURVE.p,
			m: 1,
			k: 128,
			expand: "xmd",
			hash: sha2_js_1.sha256
		});
	})();
	/** NIST P384 (aka secp384r1) curve, ECDSA and ECDH methods. */
	exports.p384 = (0, _shortw_utils_ts_1.createCurve)({
		...p384_CURVE,
		Fp: Fp384,
		lowS: false
	}, sha2_js_1.sha384);
	/** Hashing / encoding to p384 points / field. RFC 9380 methods. */
	exports.p384_hasher = (() => {
		return (0, hash_to_curve_ts_1.createHasher)(exports.p384.Point, createSWU(exports.p384.Point, {
			A: p384_CURVE.a,
			B: p384_CURVE.b,
			Z: exports.p384.Point.Fp.create(BigInt("-12"))
		}), {
			DST: "P384_XMD:SHA-384_SSWU_RO_",
			encodeDST: "P384_XMD:SHA-384_SSWU_NU_",
			p: p384_CURVE.p,
			m: 1,
			k: 192,
			expand: "xmd",
			hash: sha2_js_1.sha384
		});
	})();
	/** NIST P521 (aka secp521r1) curve, ECDSA and ECDH methods. */
	exports.p521 = (0, _shortw_utils_ts_1.createCurve)({
		...p521_CURVE,
		Fp: Fp521,
		lowS: false,
		allowedPrivateKeyLengths: [
			130,
			131,
			132
		]
	}, sha2_js_1.sha512);
	/** @deprecated use `p256` for consistency with `p256_hasher` */
	exports.secp256r1 = exports.p256;
	/** @deprecated use `p384` for consistency with `p384_hasher` */
	exports.secp384r1 = exports.p384;
	/** @deprecated use `p521` for consistency with `p521_hasher` */
	exports.secp521r1 = exports.p521;
	/** Hashing / encoding to p521 points / field. RFC 9380 methods. */
	exports.p521_hasher = (() => {
		return (0, hash_to_curve_ts_1.createHasher)(exports.p521.Point, createSWU(exports.p521.Point, {
			A: p521_CURVE.a,
			B: p521_CURVE.b,
			Z: exports.p521.Point.Fp.create(BigInt("-4"))
		}), {
			DST: "P521_XMD:SHA-512_SSWU_RO_",
			encodeDST: "P521_XMD:SHA-512_SSWU_NU_",
			p: p521_CURVE.p,
			m: 1,
			k: 256,
			expand: "xmd",
			hash: sha2_js_1.sha512
		});
	})();
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/curves/p256.js
var require_p256 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeToCurve = exports.hashToCurve = exports.secp256r1 = exports.p256 = void 0;
	var nist_ts_1 = require_nist();
	/** @deprecated use `import { p256 } from '@noble/curves/nist.js';` */
	exports.p256 = nist_ts_1.p256;
	/** @deprecated use `import { p256 } from '@noble/curves/nist.js';` */
	exports.secp256r1 = nist_ts_1.p256;
	/** @deprecated use `import { p256_hasher } from '@noble/curves/nist.js';` */
	exports.hashToCurve = (() => nist_ts_1.p256_hasher.hashToCurve)();
	/** @deprecated use `import { p256_hasher } from '@noble/curves/nist.js';` */
	exports.encodeToCurve = (() => nist_ts_1.p256_hasher.encodeToCurve)();
}));
//#endregion
export { require__u64$2 as C, require_utils$5 as S, require_utils$3 as _, require__md as a, require__md$2 as b, require_hmac$1 as c, require_modular$1 as d, require_utils$2 as f, require_hmac$2 as g, require_secp256k1$1 as h, require_sha2 as i, require_sha2$1 as l, require_bls12_381 as m, require_ed25519 as n, require_p256$1 as o, require_ed25519$1 as p, require_hmac as r, require_secp256k1 as s, require_p256 as t, require__md$1 as u, require_sha2$2 as v, require_utils$4 as x, require__u64$1 as y };
