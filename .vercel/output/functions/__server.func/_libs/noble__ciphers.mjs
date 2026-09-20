import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/ox/node_modules/@noble/ciphers/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapCipher = exports.Hash = exports.nextTick = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.abool = abool;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.hexToNumber = hexToNumber;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.overlapBytes = overlapBytes;
	exports.complexOverlapBytes = complexOverlapBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.equalBytes = equalBytes;
	exports.getOutput = getOutput;
	exports.setBigUint64 = setBigUint64;
	exports.u64Lengths = u64Lengths;
	exports.isAligned32 = isAligned32;
	exports.copyBytes = copyBytes;
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is boolean. */
	function abool(b) {
		if (typeof b !== "boolean") throw new Error(`boolean expected, not ${b}`);
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
	/**
	* Asserts something is hash
	* TODO: remove
	* @deprecated
	*/
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
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
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
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return BigInt(hex === "" ? "0" : "0x" + hex);
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber(bytesToHex(bytes));
	}
	function numberToBytesBE(n, len) {
		return hexToBytes(n.toString(16).padStart(len * 2, "0"));
	}
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(new Uint8Array([97, 98, 99])) // 'abc'
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
		else if (isBytes(data)) data = copyBytes(data);
		else throw new Error("Uint8Array expected, got " + typeof data);
		return data;
	}
	/**
	* Checks if two U8A use same underlying buffer and overlaps.
	* This is invalid and can corrupt data.
	*/
	function overlapBytes(a, b) {
		return a.buffer === b.buffer && a.byteOffset < b.byteOffset + b.byteLength && b.byteOffset < a.byteOffset + a.byteLength;
	}
	/**
	* If input and output overlap and input starts before output, we will overwrite end of input before
	* we start processing it, so this is not supported for most ciphers (except chacha/salse, which designed with this)
	*/
	function complexOverlapBytes(input, output) {
		if (overlapBytes(input, output) && input.byteOffset < output.byteOffset) throw new Error("complex overlap of input and output is not supported");
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
	function checkOpts(defaults, opts) {
		if (opts == null || typeof opts !== "object") throw new Error("options must be defined");
		return Object.assign(defaults, opts);
	}
	/** Compares 2 uint8array-s in kinda constant time. */
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/** For runtime check if class implements interface. */
	var Hash = class {};
	exports.Hash = Hash;
	/**
	* Wraps a cipher: validates args, ensures encrypt() can only be called once.
	* @__NO_SIDE_EFFECTS__
	*/
	var wrapCipher = (params, constructor) => {
		function wrappedCipher(key, ...args) {
			abytes(key);
			if (!exports.isLE) throw new Error("Non little-endian hardware is not yet supported");
			if (params.nonceLength !== void 0) {
				const nonce = args[0];
				if (!nonce) throw new Error("nonce / iv required");
				if (params.varSizeNonce) abytes(nonce);
				else abytes(nonce, params.nonceLength);
			}
			const tagl = params.tagLength;
			if (tagl && args[1] !== void 0) abytes(args[1]);
			const cipher = constructor(key, ...args);
			const checkOutput = (fnLength, output) => {
				if (output !== void 0) {
					if (fnLength !== 2) throw new Error("cipher output not supported");
					abytes(output);
				}
			};
			let called = false;
			return {
				encrypt(data, output) {
					if (called) throw new Error("cannot encrypt() twice with same key + nonce");
					called = true;
					abytes(data);
					checkOutput(cipher.encrypt.length, output);
					return cipher.encrypt(data, output);
				},
				decrypt(data, output) {
					abytes(data);
					if (tagl && data.length < tagl) throw new Error("invalid ciphertext length: smaller than tagLength=" + tagl);
					checkOutput(cipher.decrypt.length, output);
					return cipher.decrypt(data, output);
				}
			};
		}
		Object.assign(wrappedCipher, params);
		return wrappedCipher;
	};
	exports.wrapCipher = wrapCipher;
	/**
	* By default, returns u8a of length.
	* When out is available, it checks it for validity and uses it.
	*/
	function getOutput(expectedLength, out, onlyAligned = true) {
		if (out === void 0) return new Uint8Array(expectedLength);
		if (out.length !== expectedLength) throw new Error("invalid output length, expected " + expectedLength + ", got: " + out.length);
		if (onlyAligned && !isAligned32(out)) throw new Error("invalid output, must be aligned");
		return out;
	}
	/** Polyfill for Safari 14. */
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
	function u64Lengths(dataLength, aadLength, isLE) {
		abool(isLE);
		const num = /* @__PURE__ */ new Uint8Array(16);
		const view = createView(num);
		setBigUint64(view, 0, BigInt(aadLength), isLE);
		setBigUint64(view, 8, BigInt(dataLength), isLE);
		return num;
	}
	function isAligned32(bytes) {
		return bytes.byteOffset % 4 === 0;
	}
	function copyBytes(bytes) {
		return Uint8Array.from(bytes);
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/ciphers/_polyval.js
var require__polyval = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.polyval = exports.ghash = void 0;
	exports._toGHASHKey = _toGHASHKey;
	/**
	* GHash from AES-GCM and its little-endian "mirror image" Polyval from AES-SIV.
	*
	* Implemented in terms of GHash with conversion function for keys
	* GCM GHASH from
	* [NIST SP800-38d](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf),
	* SIV from
	* [RFC 8452](https://datatracker.ietf.org/doc/html/rfc8452).
	*
	* GHASH   modulo: x^128 + x^7   + x^2   + x     + 1
	* POLYVAL modulo: x^128 + x^127 + x^126 + x^121 + 1
	*
	* @module
	*/
	var utils_ts_1 = require_utils$1();
	var BLOCK_SIZE = 16;
	var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
	var ZEROS32 = (0, utils_ts_1.u32)(ZEROS16);
	var POLY = 225;
	var mul2 = (s0, s1, s2, s3) => {
		const hiBit = s3 & 1;
		return {
			s3: s2 << 31 | s3 >>> 1,
			s2: s1 << 31 | s2 >>> 1,
			s1: s0 << 31 | s1 >>> 1,
			s0: s0 >>> 1 ^ POLY << 24 & -(hiBit & 1)
		};
	};
	var swapLE = (n) => (n >>> 0 & 255) << 24 | (n >>> 8 & 255) << 16 | (n >>> 16 & 255) << 8 | n >>> 24 & 255 | 0;
	/**
	* `mulX_POLYVAL(ByteReverse(H))` from spec
	* @param k mutated in place
	*/
	function _toGHASHKey(k) {
		k.reverse();
		const hiBit = k[15] & 1;
		let carry = 0;
		for (let i = 0; i < k.length; i++) {
			const t = k[i];
			k[i] = t >>> 1 | carry;
			carry = (t & 1) << 7;
		}
		k[0] ^= -hiBit & 225;
		return k;
	}
	var estimateWindow = (bytes) => {
		if (bytes > 65536) return 8;
		if (bytes > 1024) return 4;
		return 2;
	};
	var GHASH = class {
		constructor(key, expectedLength) {
			this.blockLen = BLOCK_SIZE;
			this.outputLen = BLOCK_SIZE;
			this.s0 = 0;
			this.s1 = 0;
			this.s2 = 0;
			this.s3 = 0;
			this.finished = false;
			key = (0, utils_ts_1.toBytes)(key);
			(0, utils_ts_1.abytes)(key, 16);
			const kView = (0, utils_ts_1.createView)(key);
			let k0 = kView.getUint32(0, false);
			let k1 = kView.getUint32(4, false);
			let k2 = kView.getUint32(8, false);
			let k3 = kView.getUint32(12, false);
			const doubles = [];
			for (let i = 0; i < 128; i++) {
				doubles.push({
					s0: swapLE(k0),
					s1: swapLE(k1),
					s2: swapLE(k2),
					s3: swapLE(k3)
				});
				({s0: k0, s1: k1, s2: k2, s3: k3} = mul2(k0, k1, k2, k3));
			}
			const W = estimateWindow(expectedLength || 1024);
			if (![
				1,
				2,
				4,
				8
			].includes(W)) throw new Error("ghash: invalid window size, expected 2, 4 or 8");
			this.W = W;
			const windows = 128 / W;
			const windowSize = this.windowSize = 2 ** W;
			const items = [];
			for (let w = 0; w < windows; w++) for (let byte = 0; byte < windowSize; byte++) {
				let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
				for (let j = 0; j < W; j++) {
					if (!(byte >>> W - j - 1 & 1)) continue;
					const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
					s0 ^= d0, s1 ^= d1, s2 ^= d2, s3 ^= d3;
				}
				items.push({
					s0,
					s1,
					s2,
					s3
				});
			}
			this.t = items;
		}
		_updateBlock(s0, s1, s2, s3) {
			s0 ^= this.s0, s1 ^= this.s1, s2 ^= this.s2, s3 ^= this.s3;
			const { W, t, windowSize } = this;
			let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
			const mask = (1 << W) - 1;
			let w = 0;
			for (const num of [
				s0,
				s1,
				s2,
				s3
			]) for (let bytePos = 0; bytePos < 4; bytePos++) {
				const byte = num >>> 8 * bytePos & 255;
				for (let bitPos = 8 / W - 1; bitPos >= 0; bitPos--) {
					const bit = byte >>> W * bitPos & mask;
					const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
					o0 ^= e0, o1 ^= e1, o2 ^= e2, o3 ^= e3;
					w += 1;
				}
			}
			this.s0 = o0;
			this.s1 = o1;
			this.s2 = o2;
			this.s3 = o3;
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const b32 = (0, utils_ts_1.u32)(data);
			const blocks = Math.floor(data.length / BLOCK_SIZE);
			const left = data.length % BLOCK_SIZE;
			for (let i = 0; i < blocks; i++) this._updateBlock(b32[i * 4 + 0], b32[i * 4 + 1], b32[i * 4 + 2], b32[i * 4 + 3]);
			if (left) {
				ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
				this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3]);
				(0, utils_ts_1.clean)(ZEROS32);
			}
			return this;
		}
		destroy() {
			const { t } = this;
			for (const elm of t) elm.s0 = 0, elm.s1 = 0, elm.s2 = 0, elm.s3 = 0;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { s0, s1, s2, s3 } = this;
			const o32 = (0, utils_ts_1.u32)(out);
			o32[0] = s0;
			o32[1] = s1;
			o32[2] = s2;
			o32[3] = s3;
			return out;
		}
		digest() {
			const res = new Uint8Array(BLOCK_SIZE);
			this.digestInto(res);
			this.destroy();
			return res;
		}
	};
	var Polyval = class extends GHASH {
		constructor(key, expectedLength) {
			key = (0, utils_ts_1.toBytes)(key);
			(0, utils_ts_1.abytes)(key);
			const ghKey = _toGHASHKey((0, utils_ts_1.copyBytes)(key));
			super(ghKey, expectedLength);
			(0, utils_ts_1.clean)(ghKey);
		}
		update(data) {
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.aexists)(this);
			const b32 = (0, utils_ts_1.u32)(data);
			const left = data.length % BLOCK_SIZE;
			const blocks = Math.floor(data.length / BLOCK_SIZE);
			for (let i = 0; i < blocks; i++) this._updateBlock(swapLE(b32[i * 4 + 3]), swapLE(b32[i * 4 + 2]), swapLE(b32[i * 4 + 1]), swapLE(b32[i * 4 + 0]));
			if (left) {
				ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
				this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0]));
				(0, utils_ts_1.clean)(ZEROS32);
			}
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { s0, s1, s2, s3 } = this;
			const o32 = (0, utils_ts_1.u32)(out);
			o32[0] = s0;
			o32[1] = s1;
			o32[2] = s2;
			o32[3] = s3;
			return out.reverse();
		}
	};
	function wrapConstructorWithKey(hashCons) {
		const hashC = (msg, key) => hashCons(key, msg.length).update((0, utils_ts_1.toBytes)(msg)).digest();
		const tmp = hashCons(/* @__PURE__ */ new Uint8Array(16), 0);
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (key, expectedLength) => hashCons(key, expectedLength);
		return hashC;
	}
	/** GHash MAC for AES-GCM. */
	exports.ghash = wrapConstructorWithKey((key, expectedLength) => new GHASH(key, expectedLength));
	/** Polyval MAC for AES-SIV. */
	exports.polyval = wrapConstructorWithKey((key, expectedLength) => new Polyval(key, expectedLength));
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/ciphers/aes.js
var require_aes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unsafe = exports.aeskwp = exports.aeskw = exports.siv = exports.gcmsiv = exports.gcm = exports.cfb = exports.cbc = exports.ecb = exports.ctr = void 0;
	/**
	* [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
	* a.k.a. Advanced Encryption Standard
	* is a variant of Rijndael block cipher, standardized by NIST in 2001.
	* We provide the fastest available pure JS implementation.
	*
	* Data is split into 128-bit blocks. Encrypted in 10/12/14 rounds (128/192/256 bits). In every round:
	* 1. **S-box**, table substitution
	* 2. **Shift rows**, cyclic shift left of all rows of data array
	* 3. **Mix columns**, multiplying every column by fixed polynomial
	* 4. **Add round key**, round_key xor i-th column of array
	*
	* Check out [FIPS-197](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf)
	* and [original proposal](https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/documents/aes-development/rijndael-ammended.pdf)
	* @module
	*/
	var _polyval_ts_1 = require__polyval();
	var utils_ts_1 = require_utils$1();
	var BLOCK_SIZE = 16;
	var BLOCK_SIZE32 = 4;
	var EMPTY_BLOCK = /* @__PURE__ */ new Uint8Array(BLOCK_SIZE);
	var POLY = 283;
	function mul2(n) {
		return n << 1 ^ POLY & -(n >> 7);
	}
	function mul(a, b) {
		let res = 0;
		for (; b > 0; b >>= 1) {
			res ^= a & -(b & 1);
			a = mul2(a);
		}
		return res;
	}
	var sbox = /* @__PURE__ */ (() => {
		const t = /* @__PURE__ */ new Uint8Array(256);
		for (let i = 0, x = 1; i < 256; i++, x ^= mul2(x)) t[i] = x;
		const box = /* @__PURE__ */ new Uint8Array(256);
		box[0] = 99;
		for (let i = 0; i < 255; i++) {
			let x = t[255 - i];
			x |= x << 8;
			box[t[i]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255;
		}
		(0, utils_ts_1.clean)(t);
		return box;
	})();
	var invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
	var rotr32_8 = (n) => n << 24 | n >>> 8;
	var rotl32_8 = (n) => n << 8 | n >>> 24;
	var byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
	function genTtable(sbox, fn) {
		if (sbox.length !== 256) throw new Error("Wrong sbox length");
		const T0 = (/* @__PURE__ */ new Uint32Array(256)).map((_, j) => fn(sbox[j]));
		const T1 = T0.map(rotl32_8);
		const T2 = T1.map(rotl32_8);
		const T3 = T2.map(rotl32_8);
		const T01 = /* @__PURE__ */ new Uint32Array(65536);
		const T23 = /* @__PURE__ */ new Uint32Array(65536);
		const sbox2 = /* @__PURE__ */ new Uint16Array(65536);
		for (let i = 0; i < 256; i++) for (let j = 0; j < 256; j++) {
			const idx = i * 256 + j;
			T01[idx] = T0[i] ^ T1[j];
			T23[idx] = T2[i] ^ T3[j];
			sbox2[idx] = sbox[i] << 8 | sbox[j];
		}
		return {
			sbox,
			sbox2,
			T0,
			T1,
			T2,
			T3,
			T01,
			T23
		};
	}
	var tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
	var tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
	var xPowers = /* @__PURE__ */ (() => {
		const p = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0, x = 1; i < 16; i++, x = mul2(x)) p[i] = x;
		return p;
	})();
	/** Key expansion used in CTR. */
	function expandKeyLE(key) {
		(0, utils_ts_1.abytes)(key);
		const len = key.length;
		if (![
			16,
			24,
			32
		].includes(len)) throw new Error("aes: invalid key size, should be 16, 24 or 32, got " + len);
		const { sbox2 } = tableEncoding;
		const toClean = [];
		if (!(0, utils_ts_1.isAligned32)(key)) toClean.push(key = (0, utils_ts_1.copyBytes)(key));
		const k32 = (0, utils_ts_1.u32)(key);
		const Nk = k32.length;
		const subByte = (n) => applySbox(sbox2, n, n, n, n);
		const xk = new Uint32Array(len + 28);
		xk.set(k32);
		for (let i = Nk; i < xk.length; i++) {
			let t = xk[i - 1];
			if (i % Nk === 0) t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
			else if (Nk > 6 && i % Nk === 4) t = subByte(t);
			xk[i] = xk[i - Nk] ^ t;
		}
		(0, utils_ts_1.clean)(...toClean);
		return xk;
	}
	function expandKeyDecLE(key) {
		const encKey = expandKeyLE(key);
		const xk = encKey.slice();
		const Nk = encKey.length;
		const { sbox2 } = tableEncoding;
		const { T0, T1, T2, T3 } = tableDecoding;
		for (let i = 0; i < Nk; i += 4) for (let j = 0; j < 4; j++) xk[i + j] = encKey[Nk - i - 4 + j];
		(0, utils_ts_1.clean)(encKey);
		for (let i = 4; i < Nk - 4; i++) {
			const x = xk[i];
			const w = applySbox(sbox2, x, x, x, x);
			xk[i] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
		}
		return xk;
	}
	function apply0123(T01, T23, s0, s1, s2, s3) {
		return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
	}
	function applySbox(sbox2, s0, s1, s2, s3) {
		return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
	}
	function encrypt(xk, s0, s1, s2, s3) {
		const { sbox2, T01, T23 } = tableEncoding;
		let k = 0;
		s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
		const rounds = xk.length / 4 - 2;
		for (let i = 0; i < rounds; i++) {
			const t0 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
			const t1 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
			const t2 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
			const t3 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
			s0 = t0, s1 = t1, s2 = t2, s3 = t3;
		}
		return {
			s0: xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3),
			s1: xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0),
			s2: xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1),
			s3: xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2)
		};
	}
	function decrypt(xk, s0, s1, s2, s3) {
		const { sbox2, T01, T23 } = tableDecoding;
		let k = 0;
		s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
		const rounds = xk.length / 4 - 2;
		for (let i = 0; i < rounds; i++) {
			const t0 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
			const t1 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
			const t2 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
			const t3 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
			s0 = t0, s1 = t1, s2 = t2, s3 = t3;
		}
		return {
			s0: xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1),
			s1: xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2),
			s2: xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3),
			s3: xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0)
		};
	}
	function ctrCounter(xk, nonce, src, dst) {
		(0, utils_ts_1.abytes)(nonce, BLOCK_SIZE);
		(0, utils_ts_1.abytes)(src);
		const srcLen = src.length;
		dst = (0, utils_ts_1.getOutput)(srcLen, dst);
		(0, utils_ts_1.complexOverlapBytes)(src, dst);
		const ctr = nonce;
		const c32 = (0, utils_ts_1.u32)(ctr);
		let { s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
		const src32 = (0, utils_ts_1.u32)(src);
		const dst32 = (0, utils_ts_1.u32)(dst);
		for (let i = 0; i + 4 <= src32.length; i += 4) {
			dst32[i + 0] = src32[i + 0] ^ s0;
			dst32[i + 1] = src32[i + 1] ^ s1;
			dst32[i + 2] = src32[i + 2] ^ s2;
			dst32[i + 3] = src32[i + 3] ^ s3;
			let carry = 1;
			for (let i = ctr.length - 1; i >= 0; i--) {
				carry = carry + (ctr[i] & 255) | 0;
				ctr[i] = carry & 255;
				carry >>>= 8;
			}
			({s0, s1, s2, s3} = encrypt(xk, c32[0], c32[1], c32[2], c32[3]));
		}
		const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
		if (start < srcLen) {
			const b32 = new Uint32Array([
				s0,
				s1,
				s2,
				s3
			]);
			const buf = (0, utils_ts_1.u8)(b32);
			for (let i = start, pos = 0; i < srcLen; i++, pos++) dst[i] = src[i] ^ buf[pos];
			(0, utils_ts_1.clean)(b32);
		}
		return dst;
	}
	function ctr32(xk, isLE, nonce, src, dst) {
		(0, utils_ts_1.abytes)(nonce, BLOCK_SIZE);
		(0, utils_ts_1.abytes)(src);
		dst = (0, utils_ts_1.getOutput)(src.length, dst);
		const ctr = nonce;
		const c32 = (0, utils_ts_1.u32)(ctr);
		const view = (0, utils_ts_1.createView)(ctr);
		const src32 = (0, utils_ts_1.u32)(src);
		const dst32 = (0, utils_ts_1.u32)(dst);
		const ctrPos = isLE ? 0 : 12;
		const srcLen = src.length;
		let ctrNum = view.getUint32(ctrPos, isLE);
		let { s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
		for (let i = 0; i + 4 <= src32.length; i += 4) {
			dst32[i + 0] = src32[i + 0] ^ s0;
			dst32[i + 1] = src32[i + 1] ^ s1;
			dst32[i + 2] = src32[i + 2] ^ s2;
			dst32[i + 3] = src32[i + 3] ^ s3;
			ctrNum = ctrNum + 1 >>> 0;
			view.setUint32(ctrPos, ctrNum, isLE);
			({s0, s1, s2, s3} = encrypt(xk, c32[0], c32[1], c32[2], c32[3]));
		}
		const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
		if (start < srcLen) {
			const b32 = new Uint32Array([
				s0,
				s1,
				s2,
				s3
			]);
			const buf = (0, utils_ts_1.u8)(b32);
			for (let i = start, pos = 0; i < srcLen; i++, pos++) dst[i] = src[i] ^ buf[pos];
			(0, utils_ts_1.clean)(b32);
		}
		return dst;
	}
	/**
	* CTR: counter mode. Creates stream cipher.
	* Requires good IV. Parallelizable. OK, but no MAC.
	*/
	exports.ctr = (0, utils_ts_1.wrapCipher)({
		blockSize: 16,
		nonceLength: 16
	}, function aesctr(key, nonce) {
		function processCtr(buf, dst) {
			(0, utils_ts_1.abytes)(buf);
			if (dst !== void 0) {
				(0, utils_ts_1.abytes)(dst);
				if (!(0, utils_ts_1.isAligned32)(dst)) throw new Error("unaligned destination");
			}
			const xk = expandKeyLE(key);
			const n = (0, utils_ts_1.copyBytes)(nonce);
			const toClean = [xk, n];
			if (!(0, utils_ts_1.isAligned32)(buf)) toClean.push(buf = (0, utils_ts_1.copyBytes)(buf));
			const out = ctrCounter(xk, n, buf, dst);
			(0, utils_ts_1.clean)(...toClean);
			return out;
		}
		return {
			encrypt: (plaintext, dst) => processCtr(plaintext, dst),
			decrypt: (ciphertext, dst) => processCtr(ciphertext, dst)
		};
	});
	function validateBlockDecrypt(data) {
		(0, utils_ts_1.abytes)(data);
		if (data.length % BLOCK_SIZE !== 0) throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size 16");
	}
	function validateBlockEncrypt(plaintext, pcks5, dst) {
		(0, utils_ts_1.abytes)(plaintext);
		let outLen = plaintext.length;
		const remaining = outLen % BLOCK_SIZE;
		if (!pcks5 && remaining !== 0) throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
		if (!(0, utils_ts_1.isAligned32)(plaintext)) plaintext = (0, utils_ts_1.copyBytes)(plaintext);
		const b = (0, utils_ts_1.u32)(plaintext);
		if (pcks5) {
			let left = BLOCK_SIZE - remaining;
			if (!left) left = BLOCK_SIZE;
			outLen = outLen + left;
		}
		dst = (0, utils_ts_1.getOutput)(outLen, dst);
		(0, utils_ts_1.complexOverlapBytes)(plaintext, dst);
		return {
			b,
			o: (0, utils_ts_1.u32)(dst),
			out: dst
		};
	}
	function validatePCKS(data, pcks5) {
		if (!pcks5) return data;
		const len = data.length;
		if (!len) throw new Error("aes/pcks5: empty ciphertext not allowed");
		const lastByte = data[len - 1];
		if (lastByte <= 0 || lastByte > 16) throw new Error("aes/pcks5: wrong padding");
		const out = data.subarray(0, -lastByte);
		for (let i = 0; i < lastByte; i++) if (data[len - i - 1] !== lastByte) throw new Error("aes/pcks5: wrong padding");
		return out;
	}
	function padPCKS(left) {
		const tmp = /* @__PURE__ */ new Uint8Array(16);
		const tmp32 = (0, utils_ts_1.u32)(tmp);
		tmp.set(left);
		const paddingByte = BLOCK_SIZE - left.length;
		for (let i = BLOCK_SIZE - paddingByte; i < BLOCK_SIZE; i++) tmp[i] = paddingByte;
		return tmp32;
	}
	/**
	* ECB: Electronic CodeBook. Simple deterministic replacement.
	* Dangerous: always map x to y. See [AES Penguin](https://words.filippo.io/the-ecb-penguin/).
	*/
	exports.ecb = (0, utils_ts_1.wrapCipher)({ blockSize: 16 }, function aesecb(key, opts = {}) {
		const pcks5 = !opts.disablePadding;
		return {
			encrypt(plaintext, dst) {
				const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
				const xk = expandKeyLE(key);
				let i = 0;
				for (; i + 4 <= b.length;) {
					const { s0, s1, s2, s3 } = encrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
					o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
				}
				if (pcks5) {
					const tmp32 = padPCKS(plaintext.subarray(i * 4));
					const { s0, s1, s2, s3 } = encrypt(xk, tmp32[0], tmp32[1], tmp32[2], tmp32[3]);
					o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
				}
				(0, utils_ts_1.clean)(xk);
				return _out;
			},
			decrypt(ciphertext, dst) {
				validateBlockDecrypt(ciphertext);
				const xk = expandKeyDecLE(key);
				dst = (0, utils_ts_1.getOutput)(ciphertext.length, dst);
				const toClean = [xk];
				if (!(0, utils_ts_1.isAligned32)(ciphertext)) toClean.push(ciphertext = (0, utils_ts_1.copyBytes)(ciphertext));
				(0, utils_ts_1.complexOverlapBytes)(ciphertext, dst);
				const b = (0, utils_ts_1.u32)(ciphertext);
				const o = (0, utils_ts_1.u32)(dst);
				for (let i = 0; i + 4 <= b.length;) {
					const { s0, s1, s2, s3 } = decrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
					o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
				}
				(0, utils_ts_1.clean)(...toClean);
				return validatePCKS(dst, pcks5);
			}
		};
	});
	/**
	* CBC: Cipher-Block-Chaining. Key is previous round’s block.
	* Fragile: needs proper padding. Unauthenticated: needs MAC.
	*/
	exports.cbc = (0, utils_ts_1.wrapCipher)({
		blockSize: 16,
		nonceLength: 16
	}, function aescbc(key, iv, opts = {}) {
		const pcks5 = !opts.disablePadding;
		return {
			encrypt(plaintext, dst) {
				const xk = expandKeyLE(key);
				const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
				let _iv = iv;
				const toClean = [xk];
				if (!(0, utils_ts_1.isAligned32)(_iv)) toClean.push(_iv = (0, utils_ts_1.copyBytes)(_iv));
				const n32 = (0, utils_ts_1.u32)(_iv);
				let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
				let i = 0;
				for (; i + 4 <= b.length;) {
					s0 ^= b[i + 0], s1 ^= b[i + 1], s2 ^= b[i + 2], s3 ^= b[i + 3];
					({s0, s1, s2, s3} = encrypt(xk, s0, s1, s2, s3));
					o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
				}
				if (pcks5) {
					const tmp32 = padPCKS(plaintext.subarray(i * 4));
					s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
					({s0, s1, s2, s3} = encrypt(xk, s0, s1, s2, s3));
					o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
				}
				(0, utils_ts_1.clean)(...toClean);
				return _out;
			},
			decrypt(ciphertext, dst) {
				validateBlockDecrypt(ciphertext);
				const xk = expandKeyDecLE(key);
				let _iv = iv;
				const toClean = [xk];
				if (!(0, utils_ts_1.isAligned32)(_iv)) toClean.push(_iv = (0, utils_ts_1.copyBytes)(_iv));
				const n32 = (0, utils_ts_1.u32)(_iv);
				dst = (0, utils_ts_1.getOutput)(ciphertext.length, dst);
				if (!(0, utils_ts_1.isAligned32)(ciphertext)) toClean.push(ciphertext = (0, utils_ts_1.copyBytes)(ciphertext));
				(0, utils_ts_1.complexOverlapBytes)(ciphertext, dst);
				const b = (0, utils_ts_1.u32)(ciphertext);
				const o = (0, utils_ts_1.u32)(dst);
				let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
				for (let i = 0; i + 4 <= b.length;) {
					const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
					s0 = b[i + 0], s1 = b[i + 1], s2 = b[i + 2], s3 = b[i + 3];
					const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
					o[i++] = o0 ^ ps0, o[i++] = o1 ^ ps1, o[i++] = o2 ^ ps2, o[i++] = o3 ^ ps3;
				}
				(0, utils_ts_1.clean)(...toClean);
				return validatePCKS(dst, pcks5);
			}
		};
	});
	/**
	* CFB: Cipher Feedback Mode. The input for the block cipher is the previous cipher output.
	* Unauthenticated: needs MAC.
	*/
	exports.cfb = (0, utils_ts_1.wrapCipher)({
		blockSize: 16,
		nonceLength: 16
	}, function aescfb(key, iv) {
		function processCfb(src, isEncrypt, dst) {
			(0, utils_ts_1.abytes)(src);
			const srcLen = src.length;
			dst = (0, utils_ts_1.getOutput)(srcLen, dst);
			if ((0, utils_ts_1.overlapBytes)(src, dst)) throw new Error("overlapping src and dst not supported.");
			const xk = expandKeyLE(key);
			let _iv = iv;
			const toClean = [xk];
			if (!(0, utils_ts_1.isAligned32)(_iv)) toClean.push(_iv = (0, utils_ts_1.copyBytes)(_iv));
			if (!(0, utils_ts_1.isAligned32)(src)) toClean.push(src = (0, utils_ts_1.copyBytes)(src));
			const src32 = (0, utils_ts_1.u32)(src);
			const dst32 = (0, utils_ts_1.u32)(dst);
			const next32 = isEncrypt ? dst32 : src32;
			const n32 = (0, utils_ts_1.u32)(_iv);
			let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
			for (let i = 0; i + 4 <= src32.length;) {
				const { s0: e0, s1: e1, s2: e2, s3: e3 } = encrypt(xk, s0, s1, s2, s3);
				dst32[i + 0] = src32[i + 0] ^ e0;
				dst32[i + 1] = src32[i + 1] ^ e1;
				dst32[i + 2] = src32[i + 2] ^ e2;
				dst32[i + 3] = src32[i + 3] ^ e3;
				s0 = next32[i++], s1 = next32[i++], s2 = next32[i++], s3 = next32[i++];
			}
			const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
			if (start < srcLen) {
				({s0, s1, s2, s3} = encrypt(xk, s0, s1, s2, s3));
				const buf = (0, utils_ts_1.u8)(new Uint32Array([
					s0,
					s1,
					s2,
					s3
				]));
				for (let i = start, pos = 0; i < srcLen; i++, pos++) dst[i] = src[i] ^ buf[pos];
				(0, utils_ts_1.clean)(buf);
			}
			(0, utils_ts_1.clean)(...toClean);
			return dst;
		}
		return {
			encrypt: (plaintext, dst) => processCfb(plaintext, true, dst),
			decrypt: (ciphertext, dst) => processCfb(ciphertext, false, dst)
		};
	});
	function computeTag(fn, isLE, key, data, AAD) {
		const aadLength = AAD ? AAD.length : 0;
		const h = fn.create(key, data.length + aadLength);
		if (AAD) h.update(AAD);
		const num = (0, utils_ts_1.u64Lengths)(8 * data.length, 8 * aadLength, isLE);
		h.update(data);
		h.update(num);
		const res = h.digest();
		(0, utils_ts_1.clean)(num);
		return res;
	}
	/**
	* GCM: Galois/Counter Mode.
	* Modern, parallel version of CTR, with MAC.
	* Be careful: MACs can be forged.
	* Unsafe to use random nonces under the same key, due to collision chance.
	* As for nonce size, prefer 12-byte, instead of 8-byte.
	*/
	exports.gcm = (0, utils_ts_1.wrapCipher)({
		blockSize: 16,
		nonceLength: 12,
		tagLength: 16,
		varSizeNonce: true
	}, function aesgcm(key, nonce, AAD) {
		if (nonce.length < 8) throw new Error("aes/gcm: invalid nonce length");
		const tagLength = 16;
		function _computeTag(authKey, tagMask, data) {
			const tag = computeTag(_polyval_ts_1.ghash, false, authKey, data, AAD);
			for (let i = 0; i < tagMask.length; i++) tag[i] ^= tagMask[i];
			return tag;
		}
		function deriveKeys() {
			const xk = expandKeyLE(key);
			const authKey = EMPTY_BLOCK.slice();
			const counter = EMPTY_BLOCK.slice();
			ctr32(xk, false, counter, counter, authKey);
			if (nonce.length === 12) counter.set(nonce);
			else {
				const nonceLen = EMPTY_BLOCK.slice();
				const view = (0, utils_ts_1.createView)(nonceLen);
				(0, utils_ts_1.setBigUint64)(view, 8, BigInt(nonce.length * 8), false);
				const g = _polyval_ts_1.ghash.create(authKey).update(nonce).update(nonceLen);
				g.digestInto(counter);
				g.destroy();
			}
			return {
				xk,
				authKey,
				counter,
				tagMask: ctr32(xk, false, counter, EMPTY_BLOCK)
			};
		}
		return {
			encrypt(plaintext) {
				const { xk, authKey, counter, tagMask } = deriveKeys();
				const out = new Uint8Array(plaintext.length + tagLength);
				const toClean = [
					xk,
					authKey,
					counter,
					tagMask
				];
				if (!(0, utils_ts_1.isAligned32)(plaintext)) toClean.push(plaintext = (0, utils_ts_1.copyBytes)(plaintext));
				ctr32(xk, false, counter, plaintext, out.subarray(0, plaintext.length));
				const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
				toClean.push(tag);
				out.set(tag, plaintext.length);
				(0, utils_ts_1.clean)(...toClean);
				return out;
			},
			decrypt(ciphertext) {
				const { xk, authKey, counter, tagMask } = deriveKeys();
				const toClean = [
					xk,
					authKey,
					tagMask,
					counter
				];
				if (!(0, utils_ts_1.isAligned32)(ciphertext)) toClean.push(ciphertext = (0, utils_ts_1.copyBytes)(ciphertext));
				const data = ciphertext.subarray(0, -16);
				const passedTag = ciphertext.subarray(-16);
				const tag = _computeTag(authKey, tagMask, data);
				toClean.push(tag);
				if (!(0, utils_ts_1.equalBytes)(tag, passedTag)) throw new Error("aes/gcm: invalid ghash tag");
				const out = ctr32(xk, false, counter, data);
				(0, utils_ts_1.clean)(...toClean);
				return out;
			}
		};
	});
	var limit = (name, min, max) => (value) => {
		if (!Number.isSafeInteger(value) || min > value || value > max) {
			const minmax = "[" + min + ".." + max + "]";
			throw new Error("" + name + ": expected value in range " + minmax + ", got " + value);
		}
	};
	/**
	* AES-GCM-SIV: classic AES-GCM with nonce-misuse resistance.
	* Guarantees that, when a nonce is repeated, the only security loss is that identical
	* plaintexts will produce identical ciphertexts.
	* RFC 8452, https://datatracker.ietf.org/doc/html/rfc8452
	*/
	exports.gcmsiv = (0, utils_ts_1.wrapCipher)({
		blockSize: 16,
		nonceLength: 12,
		tagLength: 16,
		varSizeNonce: true
	}, function aessiv(key, nonce, AAD) {
		const tagLength = 16;
		const AAD_LIMIT = limit("AAD", 0, 2 ** 36);
		const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 36);
		const NONCE_LIMIT = limit("nonce", 12, 12);
		const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 36 + 16);
		(0, utils_ts_1.abytes)(key, 16, 24, 32);
		NONCE_LIMIT(nonce.length);
		if (AAD !== void 0) AAD_LIMIT(AAD.length);
		function deriveKeys() {
			const xk = expandKeyLE(key);
			const encKey = new Uint8Array(key.length);
			const authKey = /* @__PURE__ */ new Uint8Array(16);
			const toClean = [xk, encKey];
			let _nonce = nonce;
			if (!(0, utils_ts_1.isAligned32)(_nonce)) toClean.push(_nonce = (0, utils_ts_1.copyBytes)(_nonce));
			const n32 = (0, utils_ts_1.u32)(_nonce);
			let s0 = 0, s1 = n32[0], s2 = n32[1], s3 = n32[2];
			let counter = 0;
			for (const derivedKey of [authKey, encKey].map(utils_ts_1.u32)) {
				const d32 = (0, utils_ts_1.u32)(derivedKey);
				for (let i = 0; i < d32.length; i += 2) {
					const { s0: o0, s1: o1 } = encrypt(xk, s0, s1, s2, s3);
					d32[i + 0] = o0;
					d32[i + 1] = o1;
					s0 = ++counter;
				}
			}
			const res = {
				authKey,
				encKey: expandKeyLE(encKey)
			};
			(0, utils_ts_1.clean)(...toClean);
			return res;
		}
		function _computeTag(encKey, authKey, data) {
			const tag = computeTag(_polyval_ts_1.polyval, true, authKey, data, AAD);
			for (let i = 0; i < 12; i++) tag[i] ^= nonce[i];
			tag[15] &= 127;
			const t32 = (0, utils_ts_1.u32)(tag);
			let s0 = t32[0], s1 = t32[1], s2 = t32[2], s3 = t32[3];
			({s0, s1, s2, s3} = encrypt(encKey, s0, s1, s2, s3));
			t32[0] = s0, t32[1] = s1, t32[2] = s2, t32[3] = s3;
			return tag;
		}
		function processSiv(encKey, tag, input) {
			let block = (0, utils_ts_1.copyBytes)(tag);
			block[15] |= 128;
			const res = ctr32(encKey, true, block, input);
			(0, utils_ts_1.clean)(block);
			return res;
		}
		return {
			encrypt(plaintext) {
				PLAIN_LIMIT(plaintext.length);
				const { encKey, authKey } = deriveKeys();
				const tag = _computeTag(encKey, authKey, plaintext);
				const toClean = [
					encKey,
					authKey,
					tag
				];
				if (!(0, utils_ts_1.isAligned32)(plaintext)) toClean.push(plaintext = (0, utils_ts_1.copyBytes)(plaintext));
				const out = new Uint8Array(plaintext.length + tagLength);
				out.set(tag, plaintext.length);
				out.set(processSiv(encKey, tag, plaintext));
				(0, utils_ts_1.clean)(...toClean);
				return out;
			},
			decrypt(ciphertext) {
				CIPHER_LIMIT(ciphertext.length);
				const tag = ciphertext.subarray(-16);
				const { encKey, authKey } = deriveKeys();
				const toClean = [encKey, authKey];
				if (!(0, utils_ts_1.isAligned32)(ciphertext)) toClean.push(ciphertext = (0, utils_ts_1.copyBytes)(ciphertext));
				const plaintext = processSiv(encKey, tag, ciphertext.subarray(0, -16));
				const expectedTag = _computeTag(encKey, authKey, plaintext);
				toClean.push(expectedTag);
				if (!(0, utils_ts_1.equalBytes)(tag, expectedTag)) {
					(0, utils_ts_1.clean)(...toClean);
					throw new Error("invalid polyval tag");
				}
				(0, utils_ts_1.clean)(...toClean);
				return plaintext;
			}
		};
	});
	/**
	* AES-GCM-SIV, not AES-SIV.
	* This is legace name, use `gcmsiv` export instead.
	* @deprecated
	*/
	exports.siv = exports.gcmsiv;
	function isBytes32(a) {
		return a instanceof Uint32Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint32Array";
	}
	function encryptBlock(xk, block) {
		(0, utils_ts_1.abytes)(block, 16);
		if (!isBytes32(xk)) throw new Error("_encryptBlock accepts result of expandKeyLE");
		const b32 = (0, utils_ts_1.u32)(block);
		let { s0, s1, s2, s3 } = encrypt(xk, b32[0], b32[1], b32[2], b32[3]);
		b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
		return block;
	}
	function decryptBlock(xk, block) {
		(0, utils_ts_1.abytes)(block, 16);
		if (!isBytes32(xk)) throw new Error("_decryptBlock accepts result of expandKeyLE");
		const b32 = (0, utils_ts_1.u32)(block);
		let { s0, s1, s2, s3 } = decrypt(xk, b32[0], b32[1], b32[2], b32[3]);
		b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
		return block;
	}
	/**
	* AES-W (base for AESKW/AESKWP).
	* Specs: [SP800-38F](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38F.pdf),
	* [RFC 3394](https://datatracker.ietf.org/doc/rfc3394/),
	* [RFC 5649](https://datatracker.ietf.org/doc/rfc5649/).
	*/
	var AESW = {
		encrypt(kek, out) {
			if (out.length >= 2 ** 32) throw new Error("plaintext should be less than 4gb");
			const xk = expandKeyLE(kek);
			if (out.length === 16) encryptBlock(xk, out);
			else {
				const o32 = (0, utils_ts_1.u32)(out);
				let a0 = o32[0], a1 = o32[1];
				for (let j = 0, ctr = 1; j < 6; j++) for (let pos = 2; pos < o32.length; pos += 2, ctr++) {
					const { s0, s1, s2, s3 } = encrypt(xk, a0, a1, o32[pos], o32[pos + 1]);
					a0 = s0, a1 = s1 ^ byteSwap(ctr), o32[pos] = s2, o32[pos + 1] = s3;
				}
				o32[0] = a0, o32[1] = a1;
			}
			xk.fill(0);
		},
		decrypt(kek, out) {
			if (out.length - 8 >= 2 ** 32) throw new Error("ciphertext should be less than 4gb");
			const xk = expandKeyDecLE(kek);
			const chunks = out.length / 8 - 1;
			if (chunks === 1) decryptBlock(xk, out);
			else {
				const o32 = (0, utils_ts_1.u32)(out);
				let a0 = o32[0], a1 = o32[1];
				for (let j = 0, ctr = chunks * 6; j < 6; j++) for (let pos = chunks * 2; pos >= 1; pos -= 2, ctr--) {
					a1 ^= byteSwap(ctr);
					const { s0, s1, s2, s3 } = decrypt(xk, a0, a1, o32[pos], o32[pos + 1]);
					a0 = s0, a1 = s1, o32[pos] = s2, o32[pos + 1] = s3;
				}
				o32[0] = a0, o32[1] = a1;
			}
			xk.fill(0);
		}
	};
	var AESKW_IV = /* @__PURE__ */ (/* @__PURE__ */ new Uint8Array(8)).fill(166);
	/**
	* AES-KW (key-wrap). Injects static IV into plaintext, adds counter, encrypts 6 times.
	* Reduces block size from 16 to 8 bytes.
	* For padded version, use aeskwp.
	* [RFC 3394](https://datatracker.ietf.org/doc/rfc3394/),
	* [NIST.SP.800-38F](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38F.pdf).
	*/
	exports.aeskw = (0, utils_ts_1.wrapCipher)({ blockSize: 8 }, (kek) => ({
		encrypt(plaintext) {
			if (!plaintext.length || plaintext.length % 8 !== 0) throw new Error("invalid plaintext length");
			if (plaintext.length === 8) throw new Error("8-byte keys not allowed in AESKW, use AESKWP instead");
			const out = (0, utils_ts_1.concatBytes)(AESKW_IV, plaintext);
			AESW.encrypt(kek, out);
			return out;
		},
		decrypt(ciphertext) {
			if (ciphertext.length % 8 !== 0 || ciphertext.length < 24) throw new Error("invalid ciphertext length");
			const out = (0, utils_ts_1.copyBytes)(ciphertext);
			AESW.decrypt(kek, out);
			if (!(0, utils_ts_1.equalBytes)(out.subarray(0, 8), AESKW_IV)) throw new Error("integrity check failed");
			out.subarray(0, 8).fill(0);
			return out.subarray(8);
		}
	}));
	var AESKWP_IV = 2790873510;
	/**
	* AES-KW, but with padding and allows random keys.
	* Second u32 of IV is used as counter for length.
	* [RFC 5649](https://www.rfc-editor.org/rfc/rfc5649)
	*/
	exports.aeskwp = (0, utils_ts_1.wrapCipher)({ blockSize: 8 }, (kek) => ({
		encrypt(plaintext) {
			if (!plaintext.length) throw new Error("invalid plaintext length");
			const padded = Math.ceil(plaintext.length / 8) * 8;
			const out = new Uint8Array(8 + padded);
			out.set(plaintext, 8);
			const out32 = (0, utils_ts_1.u32)(out);
			out32[0] = AESKWP_IV;
			out32[1] = byteSwap(plaintext.length);
			AESW.encrypt(kek, out);
			return out;
		},
		decrypt(ciphertext) {
			if (ciphertext.length < 16) throw new Error("invalid ciphertext length");
			const out = (0, utils_ts_1.copyBytes)(ciphertext);
			const o32 = (0, utils_ts_1.u32)(out);
			AESW.decrypt(kek, out);
			const len = byteSwap(o32[1]) >>> 0;
			const padded = Math.ceil(len / 8) * 8;
			if (o32[0] !== AESKWP_IV || out.length - 8 !== padded) throw new Error("integrity check failed");
			for (let i = len; i < padded; i++) if (out[8 + i] !== 0) throw new Error("integrity check failed");
			out.subarray(0, 8).fill(0);
			return out.subarray(8, 8 + len);
		}
	}));
	/** Unsafe low-level internal methods. May change at any time. */
	exports.unsafe = {
		expandKeyLE,
		expandKeyDecLE,
		encrypt,
		decrypt,
		encryptBlock,
		decryptBlock,
		ctrCounter,
		ctr32
	};
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/ciphers/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapCipher = exports.Hash = exports.nextTick = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.abool = abool;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.hexToNumber = hexToNumber;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.overlapBytes = overlapBytes;
	exports.complexOverlapBytes = complexOverlapBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.equalBytes = equalBytes;
	exports.getOutput = getOutput;
	exports.setBigUint64 = setBigUint64;
	exports.u64Lengths = u64Lengths;
	exports.isAligned32 = isAligned32;
	exports.copyBytes = copyBytes;
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is boolean. */
	function abool(b) {
		if (typeof b !== "boolean") throw new Error(`boolean expected, not ${b}`);
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
	/**
	* Asserts something is hash
	* TODO: remove
	* @deprecated
	*/
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
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
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
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return BigInt(hex === "" ? "0" : "0x" + hex);
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber(bytesToHex(bytes));
	}
	function numberToBytesBE(n, len) {
		return hexToBytes(n.toString(16).padStart(len * 2, "0"));
	}
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(new Uint8Array([97, 98, 99])) // 'abc'
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
		else if (isBytes(data)) data = copyBytes(data);
		else throw new Error("Uint8Array expected, got " + typeof data);
		return data;
	}
	/**
	* Checks if two U8A use same underlying buffer and overlaps.
	* This is invalid and can corrupt data.
	*/
	function overlapBytes(a, b) {
		return a.buffer === b.buffer && a.byteOffset < b.byteOffset + b.byteLength && b.byteOffset < a.byteOffset + a.byteLength;
	}
	/**
	* If input and output overlap and input starts before output, we will overwrite end of input before
	* we start processing it, so this is not supported for most ciphers (except chacha/salse, which designed with this)
	*/
	function complexOverlapBytes(input, output) {
		if (overlapBytes(input, output) && input.byteOffset < output.byteOffset) throw new Error("complex overlap of input and output is not supported");
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
	function checkOpts(defaults, opts) {
		if (opts == null || typeof opts !== "object") throw new Error("options must be defined");
		return Object.assign(defaults, opts);
	}
	/** Compares 2 uint8array-s in kinda constant time. */
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/** For runtime check if class implements interface. */
	var Hash = class {};
	exports.Hash = Hash;
	/**
	* Wraps a cipher: validates args, ensures encrypt() can only be called once.
	* @__NO_SIDE_EFFECTS__
	*/
	var wrapCipher = (params, constructor) => {
		function wrappedCipher(key, ...args) {
			abytes(key);
			if (!exports.isLE) throw new Error("Non little-endian hardware is not yet supported");
			if (params.nonceLength !== void 0) {
				const nonce = args[0];
				if (!nonce) throw new Error("nonce / iv required");
				if (params.varSizeNonce) abytes(nonce);
				else abytes(nonce, params.nonceLength);
			}
			const tagl = params.tagLength;
			if (tagl && args[1] !== void 0) abytes(args[1]);
			const cipher = constructor(key, ...args);
			const checkOutput = (fnLength, output) => {
				if (output !== void 0) {
					if (fnLength !== 2) throw new Error("cipher output not supported");
					abytes(output);
				}
			};
			let called = false;
			return {
				encrypt(data, output) {
					if (called) throw new Error("cannot encrypt() twice with same key + nonce");
					called = true;
					abytes(data);
					checkOutput(cipher.encrypt.length, output);
					return cipher.encrypt(data, output);
				},
				decrypt(data, output) {
					abytes(data);
					if (tagl && data.length < tagl) throw new Error("invalid ciphertext length: smaller than tagLength=" + tagl);
					checkOutput(cipher.decrypt.length, output);
					return cipher.decrypt(data, output);
				}
			};
		}
		Object.assign(wrappedCipher, params);
		return wrappedCipher;
	};
	exports.wrapCipher = wrapCipher;
	/**
	* By default, returns u8a of length.
	* When out is available, it checks it for validity and uses it.
	*/
	function getOutput(expectedLength, out, onlyAligned = true) {
		if (out === void 0) return new Uint8Array(expectedLength);
		if (out.length !== expectedLength) throw new Error("invalid output length, expected " + expectedLength + ", got: " + out.length);
		if (onlyAligned && !isAligned32(out)) throw new Error("invalid output, must be aligned");
		return out;
	}
	/** Polyfill for Safari 14. */
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
	function u64Lengths(dataLength, aadLength, isLE) {
		abool(isLE);
		const num = /* @__PURE__ */ new Uint8Array(16);
		const view = createView(num);
		setBigUint64(view, 0, BigInt(aadLength), isLE);
		setBigUint64(view, 8, BigInt(dataLength), isLE);
		return num;
	}
	function isAligned32(bytes) {
		return bytes.byteOffset % 4 === 0;
	}
	function copyBytes(bytes) {
		return Uint8Array.from(bytes);
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/ciphers/_arx.js
var require__arx = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.rotl = rotl;
	exports.createCipher = createCipher;
	/**
	* Basic utils for ARX (add-rotate-xor) salsa and chacha ciphers.
	
	RFC8439 requires multi-step cipher stream, where
	authKey starts with counter: 0, actual msg with counter: 1.
	
	For this, we need a way to re-use nonce / counter:
	
	const counter = new Uint8Array(4);
	chacha(..., counter, ...); // counter is now 1
	chacha(..., counter, ...); // counter is now 2
	
	This is complicated:
	
	- 32-bit counters are enough, no need for 64-bit: max ArrayBuffer size in JS is 4GB
	- Original papers don't allow mutating counters
	- Counter overflow is undefined [^1]
	- Idea A: allow providing (nonce | counter) instead of just nonce, re-use it
	- Caveat: Cannot be re-used through all cases:
	- * chacha has (counter | nonce)
	- * xchacha has (nonce16 | counter | nonce16)
	- Idea B: separate nonce / counter and provide separate API for counter re-use
	- Caveat: there are different counter sizes depending on an algorithm.
	- salsa & chacha also differ in structures of key & sigma:
	salsa20:      s[0] | k(4) | s[1] | nonce(2) | ctr(2) | s[2] | k(4) | s[3]
	chacha:       s(4) | k(8) | ctr(1) | nonce(3)
	chacha20orig: s(4) | k(8) | ctr(2) | nonce(2)
	- Idea C: helper method such as `setSalsaState(key, nonce, sigma, data)`
	- Caveat: we can't re-use counter array
	
	xchacha [^2] uses the subkey and remaining 8 byte nonce with ChaCha20 as normal
	(prefixed by 4 NUL bytes, since [RFC8439] specifies a 12-byte nonce).
	
	[^1]: https://mailarchive.ietf.org/arch/msg/cfrg/gsOnTJzcbgG6OqD8Sc0GO5aR_tU/
	[^2]: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha#appendix-A.2
	
	* @module
	*/
	var utils_ts_1 = require_utils();
	var _utf8ToBytes = (str) => Uint8Array.from(str.split("").map((c) => c.charCodeAt(0)));
	var sigma16 = _utf8ToBytes("expand 16-byte k");
	var sigma32 = _utf8ToBytes("expand 32-byte k");
	var sigma16_32 = (0, utils_ts_1.u32)(sigma16);
	var sigma32_32 = (0, utils_ts_1.u32)(sigma32);
	function rotl(a, b) {
		return a << b | a >>> 32 - b;
	}
	function isAligned32(b) {
		return b.byteOffset % 4 === 0;
	}
	var BLOCK_LEN = 64;
	var BLOCK_LEN32 = 16;
	var MAX_COUNTER = 2 ** 32 - 1;
	var U32_EMPTY = /* @__PURE__ */ new Uint32Array();
	function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
		const len = data.length;
		const block = new Uint8Array(BLOCK_LEN);
		const b32 = (0, utils_ts_1.u32)(block);
		const isAligned = isAligned32(data) && isAligned32(output);
		const d32 = isAligned ? (0, utils_ts_1.u32)(data) : U32_EMPTY;
		const o32 = isAligned ? (0, utils_ts_1.u32)(output) : U32_EMPTY;
		for (let pos = 0; pos < len; counter++) {
			core(sigma, key, nonce, b32, counter, rounds);
			if (counter >= MAX_COUNTER) throw new Error("arx: counter overflow");
			const take = Math.min(BLOCK_LEN, len - pos);
			if (isAligned && take === BLOCK_LEN) {
				const pos32 = pos / 4;
				if (pos % 4 !== 0) throw new Error("arx: invalid block position");
				for (let j = 0, posj; j < BLOCK_LEN32; j++) {
					posj = pos32 + j;
					o32[posj] = d32[posj] ^ b32[j];
				}
				pos += BLOCK_LEN;
				continue;
			}
			for (let j = 0, posj; j < take; j++) {
				posj = pos + j;
				output[posj] = data[posj] ^ block[j];
			}
			pos += take;
		}
	}
	/** Creates ARX-like (ChaCha, Salsa) cipher stream from core function. */
	function createCipher(core, opts) {
		const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = (0, utils_ts_1.checkOpts)({
			allowShortKeys: false,
			counterLength: 8,
			counterRight: false,
			rounds: 20
		}, opts);
		if (typeof core !== "function") throw new Error("core must be a function");
		(0, utils_ts_1.anumber)(counterLength);
		(0, utils_ts_1.anumber)(rounds);
		(0, utils_ts_1.abool)(counterRight);
		(0, utils_ts_1.abool)(allowShortKeys);
		return (key, nonce, data, output, counter = 0) => {
			(0, utils_ts_1.abytes)(key);
			(0, utils_ts_1.abytes)(nonce);
			(0, utils_ts_1.abytes)(data);
			const len = data.length;
			if (output === void 0) output = new Uint8Array(len);
			(0, utils_ts_1.abytes)(output);
			(0, utils_ts_1.anumber)(counter);
			if (counter < 0 || counter >= MAX_COUNTER) throw new Error("arx: counter overflow");
			if (output.length < len) throw new Error(`arx: output (${output.length}) is shorter than data (${len})`);
			const toClean = [];
			let l = key.length;
			let k;
			let sigma;
			if (l === 32) {
				toClean.push(k = (0, utils_ts_1.copyBytes)(key));
				sigma = sigma32_32;
			} else if (l === 16 && allowShortKeys) {
				k = /* @__PURE__ */ new Uint8Array(32);
				k.set(key);
				k.set(key, 16);
				sigma = sigma16_32;
				toClean.push(k);
			} else throw new Error(`arx: invalid 32-byte key, got length=${l}`);
			if (!isAligned32(nonce)) toClean.push(nonce = (0, utils_ts_1.copyBytes)(nonce));
			const k32 = (0, utils_ts_1.u32)(k);
			if (extendNonceFn) {
				if (nonce.length !== 24) throw new Error(`arx: extended nonce must be 24 bytes`);
				extendNonceFn(sigma, k32, (0, utils_ts_1.u32)(nonce.subarray(0, 16)), k32);
				nonce = nonce.subarray(16);
			}
			const nonceNcLen = 16 - counterLength;
			if (nonceNcLen !== nonce.length) throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
			if (nonceNcLen !== 12) {
				const nc = /* @__PURE__ */ new Uint8Array(12);
				nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
				nonce = nc;
				toClean.push(nonce);
			}
			const n32 = (0, utils_ts_1.u32)(nonce);
			runCipher(core, sigma, k32, n32, data, output, counter, rounds);
			(0, utils_ts_1.clean)(...toClean);
			return output;
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/ciphers/_poly1305.js
var require__poly1305 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.poly1305 = void 0;
	exports.wrapConstructorWithKey = wrapConstructorWithKey;
	/**
	* Poly1305 ([PDF](https://cr.yp.to/mac/poly1305-20050329.pdf),
	* [wiki](https://en.wikipedia.org/wiki/Poly1305))
	* is a fast and parallel secret-key message-authentication code suitable for
	* a wide variety of applications. It was standardized in
	* [RFC 8439](https://datatracker.ietf.org/doc/html/rfc8439) and is now used in TLS 1.3.
	*
	* Polynomial MACs are not perfect for every situation:
	* they lack Random Key Robustness: the MAC can be forged, and can't be used in PAKE schemes.
	* See [invisible salamanders attack](https://keymaterial.net/2020/09/07/invisible-salamanders-in-aes-gcm-siv/).
	* To combat invisible salamanders, `hash(key)` can be included in ciphertext,
	* however, this would violate ciphertext indistinguishability:
	* an attacker would know which key was used - so `HKDF(key, i)`
	* could be used instead.
	*
	* Check out [original website](https://cr.yp.to/mac.html).
	* @module
	*/
	var utils_ts_1 = require_utils();
	var u8to16 = (a, i) => a[i++] & 255 | (a[i++] & 255) << 8;
	var Poly1305 = class {
		constructor(key) {
			this.blockLen = 16;
			this.outputLen = 16;
			this.buffer = /* @__PURE__ */ new Uint8Array(16);
			this.r = /* @__PURE__ */ new Uint16Array(10);
			this.h = /* @__PURE__ */ new Uint16Array(10);
			this.pad = /* @__PURE__ */ new Uint16Array(8);
			this.pos = 0;
			this.finished = false;
			key = (0, utils_ts_1.toBytes)(key);
			(0, utils_ts_1.abytes)(key, 32);
			const t0 = u8to16(key, 0);
			const t1 = u8to16(key, 2);
			const t2 = u8to16(key, 4);
			const t3 = u8to16(key, 6);
			const t4 = u8to16(key, 8);
			const t5 = u8to16(key, 10);
			const t6 = u8to16(key, 12);
			const t7 = u8to16(key, 14);
			this.r[0] = t0 & 8191;
			this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
			this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
			this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
			this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
			this.r[5] = t4 >>> 1 & 8190;
			this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
			this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
			this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
			this.r[9] = t7 >>> 5 & 127;
			for (let i = 0; i < 8; i++) this.pad[i] = u8to16(key, 16 + 2 * i);
		}
		process(data, offset, isLast = false) {
			const hibit = isLast ? 0 : 2048;
			const { h, r } = this;
			const r0 = r[0];
			const r1 = r[1];
			const r2 = r[2];
			const r3 = r[3];
			const r4 = r[4];
			const r5 = r[5];
			const r6 = r[6];
			const r7 = r[7];
			const r8 = r[8];
			const r9 = r[9];
			const t0 = u8to16(data, offset + 0);
			const t1 = u8to16(data, offset + 2);
			const t2 = u8to16(data, offset + 4);
			const t3 = u8to16(data, offset + 6);
			const t4 = u8to16(data, offset + 8);
			const t5 = u8to16(data, offset + 10);
			const t6 = u8to16(data, offset + 12);
			const t7 = u8to16(data, offset + 14);
			let h0 = h[0] + (t0 & 8191);
			let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
			let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
			let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
			let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
			let h5 = h[5] + (t4 >>> 1 & 8191);
			let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
			let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
			let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
			let h9 = h[9] + (t7 >>> 5 | hibit);
			let c = 0;
			let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
			c = d0 >>> 13;
			d0 &= 8191;
			d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
			c += d0 >>> 13;
			d0 &= 8191;
			let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
			c = d1 >>> 13;
			d1 &= 8191;
			d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
			c += d1 >>> 13;
			d1 &= 8191;
			let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
			c = d2 >>> 13;
			d2 &= 8191;
			d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
			c += d2 >>> 13;
			d2 &= 8191;
			let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
			c = d3 >>> 13;
			d3 &= 8191;
			d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
			c += d3 >>> 13;
			d3 &= 8191;
			let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
			c = d4 >>> 13;
			d4 &= 8191;
			d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
			c += d4 >>> 13;
			d4 &= 8191;
			let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
			c = d5 >>> 13;
			d5 &= 8191;
			d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
			c += d5 >>> 13;
			d5 &= 8191;
			let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
			c = d6 >>> 13;
			d6 &= 8191;
			d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
			c += d6 >>> 13;
			d6 &= 8191;
			let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
			c = d7 >>> 13;
			d7 &= 8191;
			d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
			c += d7 >>> 13;
			d7 &= 8191;
			let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
			c = d8 >>> 13;
			d8 &= 8191;
			d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
			c += d8 >>> 13;
			d8 &= 8191;
			let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
			c = d9 >>> 13;
			d9 &= 8191;
			d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
			c += d9 >>> 13;
			d9 &= 8191;
			c = (c << 2) + c | 0;
			c = c + d0 | 0;
			d0 = c & 8191;
			c = c >>> 13;
			d1 += c;
			h[0] = d0;
			h[1] = d1;
			h[2] = d2;
			h[3] = d3;
			h[4] = d4;
			h[5] = d5;
			h[6] = d6;
			h[7] = d7;
			h[8] = d8;
			h[9] = d9;
		}
		finalize() {
			const { h, pad } = this;
			const g = /* @__PURE__ */ new Uint16Array(10);
			let c = h[1] >>> 13;
			h[1] &= 8191;
			for (let i = 2; i < 10; i++) {
				h[i] += c;
				c = h[i] >>> 13;
				h[i] &= 8191;
			}
			h[0] += c * 5;
			c = h[0] >>> 13;
			h[0] &= 8191;
			h[1] += c;
			c = h[1] >>> 13;
			h[1] &= 8191;
			h[2] += c;
			g[0] = h[0] + 5;
			c = g[0] >>> 13;
			g[0] &= 8191;
			for (let i = 1; i < 10; i++) {
				g[i] = h[i] + c;
				c = g[i] >>> 13;
				g[i] &= 8191;
			}
			g[9] -= 8192;
			let mask = (c ^ 1) - 1;
			for (let i = 0; i < 10; i++) g[i] &= mask;
			mask = ~mask;
			for (let i = 0; i < 10; i++) h[i] = h[i] & mask | g[i];
			h[0] = (h[0] | h[1] << 13) & 65535;
			h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
			h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
			h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
			h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
			h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
			h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
			h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
			let f = h[0] + pad[0];
			h[0] = f & 65535;
			for (let i = 1; i < 8; i++) {
				f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
				h[i] = f & 65535;
			}
			(0, utils_ts_1.clean)(g);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { buffer, blockLen } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					for (; blockLen <= len - pos; pos += blockLen) this.process(data, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(buffer, 0, false);
					this.pos = 0;
				}
			}
			return this;
		}
		destroy() {
			(0, utils_ts_1.clean)(this.h, this.r, this.buffer, this.pad);
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { buffer, h } = this;
			let { pos } = this;
			if (pos) {
				buffer[pos++] = 1;
				for (; pos < 16; pos++) buffer[pos] = 0;
				this.process(buffer, 0, true);
			}
			this.finalize();
			let opos = 0;
			for (let i = 0; i < 8; i++) {
				out[opos++] = h[i] >>> 0;
				out[opos++] = h[i] >>> 8;
			}
			return out;
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
	};
	function wrapConstructorWithKey(hashCons) {
		const hashC = (msg, key) => hashCons(key).update((0, utils_ts_1.toBytes)(msg)).digest();
		const tmp = hashCons(/* @__PURE__ */ new Uint8Array(32));
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (key) => hashCons(key);
		return hashC;
	}
	/** Poly1305 MAC from RFC 8439. */
	exports.poly1305 = wrapConstructorWithKey((key) => new Poly1305(key));
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/ciphers/chacha.js
var require_chacha = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.xchacha20poly1305 = exports.chacha20poly1305 = exports._poly1305_aead = exports.chacha12 = exports.chacha8 = exports.xchacha20 = exports.chacha20 = exports.chacha20orig = void 0;
	exports.hchacha = hchacha;
	/**
	* [ChaCha20](https://cr.yp.to/chacha.html) stream cipher, released
	* in 2008. Developed after Salsa20, ChaCha aims to increase diffusion per round.
	* It was standardized in [RFC 8439](https://datatracker.ietf.org/doc/html/rfc8439) and
	* is now used in TLS 1.3.
	*
	* [XChaCha20](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha)
	* extended-nonce variant is also provided. Similar to XSalsa, it's safe to use with
	* randomly-generated nonces.
	*
	* Check out [PDF](http://cr.yp.to/chacha/chacha-20080128.pdf) and
	* [wiki](https://en.wikipedia.org/wiki/Salsa20).
	* @module
	*/
	var _arx_ts_1 = require__arx();
	var _poly1305_ts_1 = require__poly1305();
	var utils_ts_1 = require_utils();
	/**
	* ChaCha core function.
	*/
	function chachaCore(s, k, n, out, cnt, rounds = 20) {
		let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
		let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
		for (let r = 0; r < rounds; r += 2) {
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 16);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 12);
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 8);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 7);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 16);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 12);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 8);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 7);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 16);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 12);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 8);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 7);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 16);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 12);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 8);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 7);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 16);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 12);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 8);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 7);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 16);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 12);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 8);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 7);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 16);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 12);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 8);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 7);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 16);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 12);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 8);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 7);
		}
		let oi = 0;
		out[oi++] = y00 + x00 | 0;
		out[oi++] = y01 + x01 | 0;
		out[oi++] = y02 + x02 | 0;
		out[oi++] = y03 + x03 | 0;
		out[oi++] = y04 + x04 | 0;
		out[oi++] = y05 + x05 | 0;
		out[oi++] = y06 + x06 | 0;
		out[oi++] = y07 + x07 | 0;
		out[oi++] = y08 + x08 | 0;
		out[oi++] = y09 + x09 | 0;
		out[oi++] = y10 + x10 | 0;
		out[oi++] = y11 + x11 | 0;
		out[oi++] = y12 + x12 | 0;
		out[oi++] = y13 + x13 | 0;
		out[oi++] = y14 + x14 | 0;
		out[oi++] = y15 + x15 | 0;
	}
	/**
	* hchacha helper method, used primarily in xchacha, to hash
	* key and nonce into key' and nonce'.
	* Same as chachaCore, but there doesn't seem to be a way to move the block
	* out without 25% performance hit.
	*/
	function hchacha(s, k, i, o32) {
		let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
		for (let r = 0; r < 20; r += 2) {
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 16);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 12);
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 8);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 7);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 16);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 12);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 8);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 7);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 16);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 12);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 8);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 7);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 16);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 12);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 8);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 7);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 16);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 12);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 8);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 7);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 16);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 12);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 8);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 7);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 16);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 12);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 8);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 7);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 16);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 12);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 8);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 7);
		}
		let oi = 0;
		o32[oi++] = x00;
		o32[oi++] = x01;
		o32[oi++] = x02;
		o32[oi++] = x03;
		o32[oi++] = x12;
		o32[oi++] = x13;
		o32[oi++] = x14;
		o32[oi++] = x15;
	}
	/**
	* Original, non-RFC chacha20 from DJB. 8-byte nonce, 8-byte counter.
	*/
	exports.chacha20orig = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 8,
		allowShortKeys: true
	});
	/**
	* ChaCha stream cipher. Conforms to RFC 8439 (IETF, TLS). 12-byte nonce, 4-byte counter.
	* With 12-byte nonce, it's not safe to use fill it with random (CSPRNG), due to collision chance.
	*/
	exports.chacha20 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 4,
		allowShortKeys: false
	});
	/**
	* XChaCha eXtended-nonce ChaCha. 24-byte nonce.
	* With 24-byte nonce, it's safe to use fill it with random (CSPRNG).
	* https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha
	*/
	exports.xchacha20 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 8,
		extendNonceFn: hchacha,
		allowShortKeys: false
	});
	/**
	* Reduced 8-round chacha, described in original paper.
	*/
	exports.chacha8 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 4,
		rounds: 8
	});
	/**
	* Reduced 12-round chacha, described in original paper.
	*/
	exports.chacha12 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 4,
		rounds: 12
	});
	var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
	var updatePadded = (h, msg) => {
		h.update(msg);
		const left = msg.length % 16;
		if (left) h.update(ZEROS16.subarray(left));
	};
	var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
	function computeTag(fn, key, nonce, data, AAD) {
		const authKey = fn(key, nonce, ZEROS32);
		const h = _poly1305_ts_1.poly1305.create(authKey);
		if (AAD) updatePadded(h, AAD);
		updatePadded(h, data);
		const num = (0, utils_ts_1.u64Lengths)(data.length, AAD ? AAD.length : 0, true);
		h.update(num);
		const res = h.digest();
		(0, utils_ts_1.clean)(authKey, num);
		return res;
	}
	/**
	* AEAD algorithm from RFC 8439.
	* Salsa20 and chacha (RFC 8439) use poly1305 differently.
	* We could have composed them similar to:
	* https://github.com/paulmillr/scure-base/blob/b266c73dde977b1dd7ef40ef7a23cc15aab526b3/index.ts#L250
	* But it's hard because of authKey:
	* In salsa20, authKey changes position in salsa stream.
	* In chacha, authKey can't be computed inside computeTag, it modifies the counter.
	*/
	var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
		const tagLength = 16;
		return {
			encrypt(plaintext, output) {
				const plength = plaintext.length;
				output = (0, utils_ts_1.getOutput)(plength + tagLength, output, false);
				output.set(plaintext);
				const oPlain = output.subarray(0, -16);
				xorStream(key, nonce, oPlain, oPlain, 1);
				const tag = computeTag(xorStream, key, nonce, oPlain, AAD);
				output.set(tag, plength);
				(0, utils_ts_1.clean)(tag);
				return output;
			},
			decrypt(ciphertext, output) {
				output = (0, utils_ts_1.getOutput)(ciphertext.length - tagLength, output, false);
				const data = ciphertext.subarray(0, -16);
				const passedTag = ciphertext.subarray(-16);
				const tag = computeTag(xorStream, key, nonce, data, AAD);
				if (!(0, utils_ts_1.equalBytes)(passedTag, tag)) throw new Error("invalid tag");
				output.set(ciphertext.subarray(0, -16));
				xorStream(key, nonce, output, output, 1);
				(0, utils_ts_1.clean)(tag);
				return output;
			}
		};
	};
	exports._poly1305_aead = _poly1305_aead;
	/**
	* ChaCha20-Poly1305 from RFC 8439.
	*
	* Unsafe to use random nonces under the same key, due to collision chance.
	* Prefer XChaCha instead.
	*/
	exports.chacha20poly1305 = (0, utils_ts_1.wrapCipher)({
		blockSize: 64,
		nonceLength: 12,
		tagLength: 16
	}, (0, exports._poly1305_aead)(exports.chacha20));
	/**
	* XChaCha20-Poly1305 extended-nonce chacha.
	*
	* Can be safely used with random nonces (CSPRNG).
	* See [IRTF draft](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha).
	*/
	exports.xchacha20poly1305 = (0, utils_ts_1.wrapCipher)({
		blockSize: 64,
		nonceLength: 24,
		tagLength: 16
	}, (0, exports._poly1305_aead)(exports.xchacha20));
}));
//#endregion
export { require_aes as n, require_chacha as t };
