import { a as __require, t as __commonJSMin } from "../_runtime.mjs";
import { C as require__u64$1, S as require_utils$1, a as require__md$3, b as require__md$1, f as require_utils$3, g as require_hmac$1, i as require_sha2$2, r as require_hmac$2, u as require__md$2, v as require_sha2$1, x as require_utils$2, y as require__u64$2 } from "./noble__curves+noble__hashes.mjs";
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/sha3.js
var require_sha3$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shake256 = exports.shake128 = exports.keccak_512 = exports.keccak_384 = exports.keccak_256 = exports.keccak_224 = exports.sha3_512 = exports.sha3_384 = exports.sha3_256 = exports.sha3_224 = exports.Keccak = void 0;
	exports.keccakP = keccakP;
	/**
	* SHA3 (keccak) hash function, based on a new "Sponge function" design.
	* Different from older hashes, the internal state is bigger than output size.
	*
	* Check out [FIPS-202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf),
	* [Website](https://keccak.team/keccak.html),
	* [the differences between SHA-3 and Keccak](https://crypto.stackexchange.com/questions/15727/what-are-the-key-differences-between-the-draft-sha-3-standard-and-the-keccak-sub).
	*
	* Check out `sha3-addons` module for cSHAKE, k12, and others.
	* @module
	*/
	var _u64_ts_1 = require__u64$1();
	var utils_ts_1 = require_utils$1();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _7n = BigInt(7);
	var _256n = BigInt(256);
	var _0x71n = BigInt(113);
	var SHA3_PI = [];
	var SHA3_ROTL = [];
	var _SHA3_IOTA = [];
	for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
		[x, y] = [y, (2 * x + 3 * y) % 5];
		SHA3_PI.push(2 * (5 * y + x));
		SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
		let t = _0n;
		for (let j = 0; j < 7; j++) {
			R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
			if (R & _2n) t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
		}
		_SHA3_IOTA.push(t);
	}
	var IOTAS = (0, _u64_ts_1.split)(_SHA3_IOTA, true);
	var SHA3_IOTA_H = IOTAS[0];
	var SHA3_IOTA_L = IOTAS[1];
	var rotlH = (h, l, s) => s > 32 ? (0, _u64_ts_1.rotlBH)(h, l, s) : (0, _u64_ts_1.rotlSH)(h, l, s);
	var rotlL = (h, l, s) => s > 32 ? (0, _u64_ts_1.rotlBL)(h, l, s) : (0, _u64_ts_1.rotlSL)(h, l, s);
	/** `keccakf1600` internal function, additionally allows to adjust round count. */
	function keccakP(s, rounds = 24) {
		const B = /* @__PURE__ */ new Uint32Array(10);
		for (let round = 24 - rounds; round < 24; round++) {
			for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
			for (let x = 0; x < 10; x += 2) {
				const idx1 = (x + 8) % 10;
				const idx0 = (x + 2) % 10;
				const B0 = B[idx0];
				const B1 = B[idx0 + 1];
				const Th = rotlH(B0, B1, 1) ^ B[idx1];
				const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
				for (let y = 0; y < 50; y += 10) {
					s[x + y] ^= Th;
					s[x + y + 1] ^= Tl;
				}
			}
			let curH = s[2];
			let curL = s[3];
			for (let t = 0; t < 24; t++) {
				const shift = SHA3_ROTL[t];
				const Th = rotlH(curH, curL, shift);
				const Tl = rotlL(curH, curL, shift);
				const PI = SHA3_PI[t];
				curH = s[PI];
				curL = s[PI + 1];
				s[PI] = Th;
				s[PI + 1] = Tl;
			}
			for (let y = 0; y < 50; y += 10) {
				for (let x = 0; x < 10; x++) B[x] = s[y + x];
				for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
			}
			s[0] ^= SHA3_IOTA_H[round];
			s[1] ^= SHA3_IOTA_L[round];
		}
		(0, utils_ts_1.clean)(B);
	}
	/** Keccak sponge function. */
	var Keccak = class Keccak extends utils_ts_1.Hash {
		constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
			super();
			this.pos = 0;
			this.posOut = 0;
			this.finished = false;
			this.destroyed = false;
			this.enableXOF = false;
			this.blockLen = blockLen;
			this.suffix = suffix;
			this.outputLen = outputLen;
			this.enableXOF = enableXOF;
			this.rounds = rounds;
			(0, utils_ts_1.anumber)(outputLen);
			if (!(0 < blockLen && blockLen < 200)) throw new Error("only keccak-f1600 function is supported");
			this.state = /* @__PURE__ */ new Uint8Array(200);
			this.state32 = (0, utils_ts_1.u32)(this.state);
		}
		clone() {
			return this._cloneInto();
		}
		keccak() {
			(0, utils_ts_1.swap32IfBE)(this.state32);
			keccakP(this.state32, this.rounds);
			(0, utils_ts_1.swap32IfBE)(this.state32);
			this.posOut = 0;
			this.pos = 0;
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { blockLen, state } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
				if (this.pos === blockLen) this.keccak();
			}
			return this;
		}
		finish() {
			if (this.finished) return;
			this.finished = true;
			const { state, suffix, pos, blockLen } = this;
			state[pos] ^= suffix;
			if ((suffix & 128) !== 0 && pos === blockLen - 1) this.keccak();
			state[blockLen - 1] ^= 128;
			this.keccak();
		}
		writeInto(out) {
			(0, utils_ts_1.aexists)(this, false);
			(0, utils_ts_1.abytes)(out);
			this.finish();
			const bufferOut = this.state;
			const { blockLen } = this;
			for (let pos = 0, len = out.length; pos < len;) {
				if (this.posOut >= blockLen) this.keccak();
				const take = Math.min(blockLen - this.posOut, len - pos);
				out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
				this.posOut += take;
				pos += take;
			}
			return out;
		}
		xofInto(out) {
			if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
			return this.writeInto(out);
		}
		xof(bytes) {
			(0, utils_ts_1.anumber)(bytes);
			return this.xofInto(new Uint8Array(bytes));
		}
		digestInto(out) {
			(0, utils_ts_1.aoutput)(out, this);
			if (this.finished) throw new Error("digest() was already called");
			this.writeInto(out);
			this.destroy();
			return out;
		}
		digest() {
			return this.digestInto(new Uint8Array(this.outputLen));
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.state);
		}
		_cloneInto(to) {
			const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
			to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
			to.state32.set(this.state32);
			to.pos = this.pos;
			to.posOut = this.posOut;
			to.finished = this.finished;
			to.rounds = rounds;
			to.suffix = suffix;
			to.outputLen = outputLen;
			to.enableXOF = enableXOF;
			to.destroyed = this.destroyed;
			return to;
		}
	};
	exports.Keccak = Keccak;
	var gen = (suffix, blockLen, outputLen) => (0, utils_ts_1.createHasher)(() => new Keccak(blockLen, suffix, outputLen));
	/** SHA3-224 hash function. */
	exports.sha3_224 = (() => gen(6, 144, 28))();
	/** SHA3-256 hash function. Different from keccak-256. */
	exports.sha3_256 = (() => gen(6, 136, 32))();
	/** SHA3-384 hash function. */
	exports.sha3_384 = (() => gen(6, 104, 48))();
	/** SHA3-512 hash function. */
	exports.sha3_512 = (() => gen(6, 72, 64))();
	/** keccak-224 hash function. */
	exports.keccak_224 = (() => gen(1, 144, 28))();
	/** keccak-256 hash function. Different from SHA3-256. */
	exports.keccak_256 = (() => gen(1, 136, 32))();
	/** keccak-384 hash function. */
	exports.keccak_384 = (() => gen(1, 104, 48))();
	/** keccak-512 hash function. */
	exports.keccak_512 = (() => gen(1, 72, 64))();
	var genShake = (suffix, blockLen, outputLen) => (0, utils_ts_1.createXOFer)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true));
	/** SHAKE128 XOF with 128-bit security. */
	exports.shake128 = (() => genShake(31, 168, 16))();
	/** SHAKE256 XOF with 256-bit security. */
	exports.shake256 = (() => genShake(31, 136, 32))();
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/legacy.js
var require_legacy$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ripemd160 = exports.RIPEMD160 = exports.md5 = exports.MD5 = exports.sha1 = exports.SHA1 = void 0;
	/**
	
	SHA1 (RFC 3174), MD5 (RFC 1321) and RIPEMD160 (RFC 2286) legacy, weak hash functions.
	Don't use them in a new protocol. What "weak" means:
	
	- Collisions can be made with 2^18 effort in MD5, 2^60 in SHA1, 2^80 in RIPEMD160.
	- No practical pre-image attacks (only theoretical, 2^123.4)
	- HMAC seems kinda ok: https://datatracker.ietf.org/doc/html/rfc6151
	* @module
	*/
	var _md_ts_1 = require__md$1();
	var utils_ts_1 = require_utils$2();
	/** Initial SHA1 state */
	var SHA1_IV = /* @__PURE__ */ Uint32Array.from([
		1732584193,
		4023233417,
		2562383102,
		271733878,
		3285377520
	]);
	var SHA1_W = /* @__PURE__ */ new Uint32Array(80);
	/** SHA1 legacy hash class. */
	var SHA1 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 20, 8, false);
			this.A = SHA1_IV[0] | 0;
			this.B = SHA1_IV[1] | 0;
			this.C = SHA1_IV[2] | 0;
			this.D = SHA1_IV[3] | 0;
			this.E = SHA1_IV[4] | 0;
		}
		get() {
			const { A, B, C, D, E } = this;
			return [
				A,
				B,
				C,
				D,
				E
			];
		}
		set(A, B, C, D, E) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA1_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 80; i++) SHA1_W[i] = (0, utils_ts_1.rotl)(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
			let { A, B, C, D, E } = this;
			for (let i = 0; i < 80; i++) {
				let F, K;
				if (i < 20) {
					F = (0, _md_ts_1.Chi)(B, C, D);
					K = 1518500249;
				} else if (i < 40) {
					F = B ^ C ^ D;
					K = 1859775393;
				} else if (i < 60) {
					F = (0, _md_ts_1.Maj)(B, C, D);
					K = 2400959708;
				} else {
					F = B ^ C ^ D;
					K = 3395469782;
				}
				const T = (0, utils_ts_1.rotl)(A, 5) + F + E + K + SHA1_W[i] | 0;
				E = D;
				D = C;
				C = (0, utils_ts_1.rotl)(B, 30);
				B = A;
				A = T;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			this.set(A, B, C, D, E);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA1_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA1 = SHA1;
	/** SHA1 (RFC 3174) legacy hash function. It was cryptographically broken. */
	exports.sha1 = (0, utils_ts_1.createHasher)(() => new SHA1());
	/** Per-round constants */
	var p32 = /* @__PURE__ */ Math.pow(2, 32);
	var K = /* @__PURE__ */ Array.from({ length: 64 }, (_, i) => Math.floor(p32 * Math.abs(Math.sin(i + 1))));
	/** md5 initial state: same as sha1, but 4 u32 instead of 5. */
	var MD5_IV = /* @__PURE__ */ SHA1_IV.slice(0, 4);
	var MD5_W = /* @__PURE__ */ new Uint32Array(16);
	/** MD5 legacy hash class. */
	var MD5 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 16, 8, true);
			this.A = MD5_IV[0] | 0;
			this.B = MD5_IV[1] | 0;
			this.C = MD5_IV[2] | 0;
			this.D = MD5_IV[3] | 0;
		}
		get() {
			const { A, B, C, D } = this;
			return [
				A,
				B,
				C,
				D
			];
		}
		set(A, B, C, D) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) MD5_W[i] = view.getUint32(offset, true);
			let { A, B, C, D } = this;
			for (let i = 0; i < 64; i++) {
				let F, g, s;
				if (i < 16) {
					F = (0, _md_ts_1.Chi)(B, C, D);
					g = i;
					s = [
						7,
						12,
						17,
						22
					];
				} else if (i < 32) {
					F = (0, _md_ts_1.Chi)(D, B, C);
					g = (5 * i + 1) % 16;
					s = [
						5,
						9,
						14,
						20
					];
				} else if (i < 48) {
					F = B ^ C ^ D;
					g = (3 * i + 5) % 16;
					s = [
						4,
						11,
						16,
						23
					];
				} else {
					F = C ^ (B | ~D);
					g = 7 * i % 16;
					s = [
						6,
						10,
						15,
						21
					];
				}
				F = F + A + K[i] + MD5_W[g];
				A = D;
				D = C;
				C = B;
				B = B + (0, utils_ts_1.rotl)(F, s[i % 4]);
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			this.set(A, B, C, D);
		}
		roundClean() {
			(0, utils_ts_1.clean)(MD5_W);
		}
		destroy() {
			this.set(0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.MD5 = MD5;
	/**
	* MD5 (RFC 1321) legacy hash function. It was cryptographically broken.
	* MD5 architecture is similar to SHA1, with some differences:
	* - Reduced output length: 16 bytes (128 bit) instead of 20
	* - 64 rounds, instead of 80
	* - Little-endian: could be faster, but will require more code
	* - Non-linear index selection: huge speed-up for unroll
	* - Per round constants: more memory accesses, additional speed-up for unroll
	*/
	exports.md5 = (0, utils_ts_1.createHasher)(() => new MD5());
	var Rho160 = /* @__PURE__ */ Uint8Array.from([
		7,
		4,
		13,
		1,
		10,
		6,
		15,
		3,
		12,
		0,
		9,
		5,
		2,
		14,
		11,
		8
	]);
	var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
	var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
	var idxLR = /* @__PURE__ */ (() => {
		const res = [[Id160], [Pi160]];
		for (let i = 0; i < 4; i++) for (let j of res) j.push(j[i].map((k) => Rho160[k]));
		return res;
	})();
	var idxL = /* @__PURE__ */ (() => idxLR[0])();
	var idxR = /* @__PURE__ */ (() => idxLR[1])();
	var shifts160 = /* @__PURE__ */ [
		[
			11,
			14,
			15,
			12,
			5,
			8,
			7,
			9,
			11,
			13,
			14,
			15,
			6,
			7,
			9,
			8
		],
		[
			12,
			13,
			11,
			15,
			6,
			9,
			9,
			7,
			12,
			15,
			11,
			13,
			7,
			8,
			7,
			7
		],
		[
			13,
			15,
			14,
			11,
			7,
			7,
			6,
			8,
			13,
			14,
			13,
			12,
			5,
			5,
			6,
			9
		],
		[
			14,
			11,
			12,
			14,
			8,
			6,
			5,
			5,
			15,
			12,
			15,
			14,
			9,
			9,
			8,
			6
		],
		[
			15,
			12,
			13,
			13,
			9,
			5,
			8,
			6,
			14,
			11,
			12,
			11,
			8,
			6,
			5,
			5
		]
	].map((i) => Uint8Array.from(i));
	var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
	var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
	var Kl160 = /* @__PURE__ */ Uint32Array.from([
		0,
		1518500249,
		1859775393,
		2400959708,
		2840853838
	]);
	var Kr160 = /* @__PURE__ */ Uint32Array.from([
		1352829926,
		1548603684,
		1836072691,
		2053994217,
		0
	]);
	function ripemd_f(group, x, y, z) {
		if (group === 0) return x ^ y ^ z;
		if (group === 1) return x & y | ~x & z;
		if (group === 2) return (x | ~y) ^ z;
		if (group === 3) return x & z | y & ~z;
		return x ^ (y | ~z);
	}
	var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
	var RIPEMD160 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 20, 8, true);
			this.h0 = 1732584193;
			this.h1 = -271733879;
			this.h2 = -1732584194;
			this.h3 = 271733878;
			this.h4 = -1009589776;
		}
		get() {
			const { h0, h1, h2, h3, h4 } = this;
			return [
				h0,
				h1,
				h2,
				h3,
				h4
			];
		}
		set(h0, h1, h2, h3, h4) {
			this.h0 = h0 | 0;
			this.h1 = h1 | 0;
			this.h2 = h2 | 0;
			this.h3 = h3 | 0;
			this.h4 = h4 | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) BUF_160[i] = view.getUint32(offset, true);
			let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
			for (let group = 0; group < 5; group++) {
				const rGroup = 4 - group;
				const hbl = Kl160[group], hbr = Kr160[group];
				const rl = idxL[group], rr = idxR[group];
				const sl = shiftsL160[group], sr = shiftsR160[group];
				for (let i = 0; i < 16; i++) {
					const tl = (0, utils_ts_1.rotl)(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
					al = el, el = dl, dl = (0, utils_ts_1.rotl)(cl, 10) | 0, cl = bl, bl = tl;
				}
				for (let i = 0; i < 16; i++) {
					const tr = (0, utils_ts_1.rotl)(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
					ar = er, er = dr, dr = (0, utils_ts_1.rotl)(cr, 10) | 0, cr = br, br = tr;
				}
			}
			this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
		}
		roundClean() {
			(0, utils_ts_1.clean)(BUF_160);
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0);
		}
	};
	exports.RIPEMD160 = RIPEMD160;
	/**
	* RIPEMD-160 - a legacy hash function from 1990s.
	* * https://homes.esat.kuleuven.be/~bosselae/ripemd160.html
	* * https://homes.esat.kuleuven.be/~bosselae/ripemd160/pdf/AB-9601/AB-9601.pdf
	*/
	exports.ripemd160 = (0, utils_ts_1.createHasher)(() => new RIPEMD160());
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/ripemd160.js
var require_ripemd160 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ripemd160 = exports.RIPEMD160 = void 0;
	/**
	* RIPEMD-160 legacy hash function.
	* https://homes.esat.kuleuven.be/~bosselae/ripemd160.html
	* https://homes.esat.kuleuven.be/~bosselae/ripemd160/pdf/AB-9601/AB-9601.pdf
	* @module
	* @deprecated
	*/
	var legacy_ts_1 = require_legacy$1();
	/** @deprecated Use import from `noble/hashes/legacy` module */
	exports.RIPEMD160 = legacy_ts_1.RIPEMD160;
	/** @deprecated Use import from `noble/hashes/legacy` module */
	exports.ripemd160 = legacy_ts_1.ripemd160;
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/sha3.js
var require_sha3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shake256 = exports.shake128 = exports.keccak_512 = exports.keccak_384 = exports.keccak_256 = exports.keccak_224 = exports.sha3_512 = exports.sha3_384 = exports.sha3_256 = exports.sha3_224 = exports.Keccak = void 0;
	exports.keccakP = keccakP;
	/**
	* SHA3 (keccak) hash function, based on a new "Sponge function" design.
	* Different from older hashes, the internal state is bigger than output size.
	*
	* Check out [FIPS-202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf),
	* [Website](https://keccak.team/keccak.html),
	* [the differences between SHA-3 and Keccak](https://crypto.stackexchange.com/questions/15727/what-are-the-key-differences-between-the-draft-sha-3-standard-and-the-keccak-sub).
	*
	* Check out `sha3-addons` module for cSHAKE, k12, and others.
	* @module
	*/
	var _u64_ts_1 = require__u64$2();
	var utils_ts_1 = require_utils$2();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _7n = BigInt(7);
	var _256n = BigInt(256);
	var _0x71n = BigInt(113);
	var SHA3_PI = [];
	var SHA3_ROTL = [];
	var _SHA3_IOTA = [];
	for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
		[x, y] = [y, (2 * x + 3 * y) % 5];
		SHA3_PI.push(2 * (5 * y + x));
		SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
		let t = _0n;
		for (let j = 0; j < 7; j++) {
			R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
			if (R & _2n) t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
		}
		_SHA3_IOTA.push(t);
	}
	var IOTAS = (0, _u64_ts_1.split)(_SHA3_IOTA, true);
	var SHA3_IOTA_H = IOTAS[0];
	var SHA3_IOTA_L = IOTAS[1];
	var rotlH = (h, l, s) => s > 32 ? (0, _u64_ts_1.rotlBH)(h, l, s) : (0, _u64_ts_1.rotlSH)(h, l, s);
	var rotlL = (h, l, s) => s > 32 ? (0, _u64_ts_1.rotlBL)(h, l, s) : (0, _u64_ts_1.rotlSL)(h, l, s);
	/** `keccakf1600` internal function, additionally allows to adjust round count. */
	function keccakP(s, rounds = 24) {
		const B = /* @__PURE__ */ new Uint32Array(10);
		for (let round = 24 - rounds; round < 24; round++) {
			for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
			for (let x = 0; x < 10; x += 2) {
				const idx1 = (x + 8) % 10;
				const idx0 = (x + 2) % 10;
				const B0 = B[idx0];
				const B1 = B[idx0 + 1];
				const Th = rotlH(B0, B1, 1) ^ B[idx1];
				const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
				for (let y = 0; y < 50; y += 10) {
					s[x + y] ^= Th;
					s[x + y + 1] ^= Tl;
				}
			}
			let curH = s[2];
			let curL = s[3];
			for (let t = 0; t < 24; t++) {
				const shift = SHA3_ROTL[t];
				const Th = rotlH(curH, curL, shift);
				const Tl = rotlL(curH, curL, shift);
				const PI = SHA3_PI[t];
				curH = s[PI];
				curL = s[PI + 1];
				s[PI] = Th;
				s[PI + 1] = Tl;
			}
			for (let y = 0; y < 50; y += 10) {
				for (let x = 0; x < 10; x++) B[x] = s[y + x];
				for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
			}
			s[0] ^= SHA3_IOTA_H[round];
			s[1] ^= SHA3_IOTA_L[round];
		}
		(0, utils_ts_1.clean)(B);
	}
	/** Keccak sponge function. */
	var Keccak = class Keccak extends utils_ts_1.Hash {
		constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
			super();
			this.pos = 0;
			this.posOut = 0;
			this.finished = false;
			this.destroyed = false;
			this.enableXOF = false;
			this.blockLen = blockLen;
			this.suffix = suffix;
			this.outputLen = outputLen;
			this.enableXOF = enableXOF;
			this.rounds = rounds;
			(0, utils_ts_1.anumber)(outputLen);
			if (!(0 < blockLen && blockLen < 200)) throw new Error("only keccak-f1600 function is supported");
			this.state = /* @__PURE__ */ new Uint8Array(200);
			this.state32 = (0, utils_ts_1.u32)(this.state);
		}
		clone() {
			return this._cloneInto();
		}
		keccak() {
			(0, utils_ts_1.swap32IfBE)(this.state32);
			keccakP(this.state32, this.rounds);
			(0, utils_ts_1.swap32IfBE)(this.state32);
			this.posOut = 0;
			this.pos = 0;
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { blockLen, state } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
				if (this.pos === blockLen) this.keccak();
			}
			return this;
		}
		finish() {
			if (this.finished) return;
			this.finished = true;
			const { state, suffix, pos, blockLen } = this;
			state[pos] ^= suffix;
			if ((suffix & 128) !== 0 && pos === blockLen - 1) this.keccak();
			state[blockLen - 1] ^= 128;
			this.keccak();
		}
		writeInto(out) {
			(0, utils_ts_1.aexists)(this, false);
			(0, utils_ts_1.abytes)(out);
			this.finish();
			const bufferOut = this.state;
			const { blockLen } = this;
			for (let pos = 0, len = out.length; pos < len;) {
				if (this.posOut >= blockLen) this.keccak();
				const take = Math.min(blockLen - this.posOut, len - pos);
				out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
				this.posOut += take;
				pos += take;
			}
			return out;
		}
		xofInto(out) {
			if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
			return this.writeInto(out);
		}
		xof(bytes) {
			(0, utils_ts_1.anumber)(bytes);
			return this.xofInto(new Uint8Array(bytes));
		}
		digestInto(out) {
			(0, utils_ts_1.aoutput)(out, this);
			if (this.finished) throw new Error("digest() was already called");
			this.writeInto(out);
			this.destroy();
			return out;
		}
		digest() {
			return this.digestInto(new Uint8Array(this.outputLen));
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.state);
		}
		_cloneInto(to) {
			const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
			to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
			to.state32.set(this.state32);
			to.pos = this.pos;
			to.posOut = this.posOut;
			to.finished = this.finished;
			to.rounds = rounds;
			to.suffix = suffix;
			to.outputLen = outputLen;
			to.enableXOF = enableXOF;
			to.destroyed = this.destroyed;
			return to;
		}
	};
	exports.Keccak = Keccak;
	var gen = (suffix, blockLen, outputLen) => (0, utils_ts_1.createHasher)(() => new Keccak(blockLen, suffix, outputLen));
	/** SHA3-224 hash function. */
	exports.sha3_224 = (() => gen(6, 144, 28))();
	/** SHA3-256 hash function. Different from keccak-256. */
	exports.sha3_256 = (() => gen(6, 136, 32))();
	/** SHA3-384 hash function. */
	exports.sha3_384 = (() => gen(6, 104, 48))();
	/** SHA3-512 hash function. */
	exports.sha3_512 = (() => gen(6, 72, 64))();
	/** keccak-224 hash function. */
	exports.keccak_224 = (() => gen(1, 144, 28))();
	/** keccak-256 hash function. Different from SHA3-256. */
	exports.keccak_256 = (() => gen(1, 136, 32))();
	/** keccak-384 hash function. */
	exports.keccak_384 = (() => gen(1, 104, 48))();
	/** keccak-512 hash function. */
	exports.keccak_512 = (() => gen(1, 72, 64))();
	var genShake = (suffix, blockLen, outputLen) => (0, utils_ts_1.createXOFer)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true));
	/** SHAKE128 XOF with 128-bit security. */
	exports.shake128 = (() => genShake(31, 168, 16))();
	/** SHAKE256 XOF with 256-bit security. */
	exports.shake256 = (() => genShake(31, 136, 32))();
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/sha256.js
var require_sha256$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha224 = exports.SHA224 = exports.sha256 = exports.SHA256 = void 0;
	/**
	* SHA2-256 a.k.a. sha256. In JS, it is the fastest hash, even faster than Blake3.
	*
	* To break sha256 using birthday attack, attackers need to try 2^128 hashes.
	* BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
	*
	* Check out [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
	* @module
	* @deprecated
	*/
	var sha2_ts_1 = require_sha2$1();
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.SHA256 = sha2_ts_1.SHA256;
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.sha256 = sha2_ts_1.sha256;
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.SHA224 = sha2_ts_1.SHA224;
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.sha224 = sha2_ts_1.sha224;
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/_blake.js
var require__blake$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BSIGMA = void 0;
	exports.G1s = G1s;
	exports.G2s = G2s;
	/**
	* Internal helpers for blake hash.
	* @module
	*/
	var utils_ts_1 = require_utils$2();
	/**
	* Internal blake variable.
	* For BLAKE2b, the two extra permutations for rounds 10 and 11 are SIGMA[10..11] = SIGMA[0..1].
	*/
	exports.BSIGMA = Uint8Array.from([
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		14,
		10,
		4,
		8,
		9,
		15,
		13,
		6,
		1,
		12,
		0,
		2,
		11,
		7,
		5,
		3,
		11,
		8,
		12,
		0,
		5,
		2,
		15,
		13,
		10,
		14,
		3,
		6,
		7,
		1,
		9,
		4,
		7,
		9,
		3,
		1,
		13,
		12,
		11,
		14,
		2,
		6,
		5,
		10,
		4,
		0,
		15,
		8,
		9,
		0,
		5,
		7,
		2,
		4,
		10,
		15,
		14,
		1,
		11,
		12,
		6,
		8,
		3,
		13,
		2,
		12,
		6,
		10,
		0,
		11,
		8,
		3,
		4,
		13,
		7,
		5,
		15,
		14,
		1,
		9,
		12,
		5,
		1,
		15,
		14,
		13,
		4,
		10,
		0,
		7,
		6,
		3,
		9,
		2,
		8,
		11,
		13,
		11,
		7,
		14,
		12,
		1,
		3,
		9,
		5,
		0,
		15,
		4,
		8,
		6,
		2,
		10,
		6,
		15,
		14,
		9,
		11,
		3,
		0,
		8,
		12,
		2,
		13,
		7,
		1,
		4,
		10,
		5,
		10,
		2,
		8,
		4,
		7,
		6,
		1,
		5,
		15,
		11,
		9,
		14,
		3,
		12,
		13,
		0,
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		14,
		10,
		4,
		8,
		9,
		15,
		13,
		6,
		1,
		12,
		0,
		2,
		11,
		7,
		5,
		3,
		11,
		8,
		12,
		0,
		5,
		2,
		15,
		13,
		10,
		14,
		3,
		6,
		7,
		1,
		9,
		4,
		7,
		9,
		3,
		1,
		13,
		12,
		11,
		14,
		2,
		6,
		5,
		10,
		4,
		0,
		15,
		8,
		9,
		0,
		5,
		7,
		2,
		4,
		10,
		15,
		14,
		1,
		11,
		12,
		6,
		8,
		3,
		13,
		2,
		12,
		6,
		10,
		0,
		11,
		8,
		3,
		4,
		13,
		7,
		5,
		15,
		14,
		1,
		9
	]);
	function G1s(a, b, c, d, x) {
		a = a + b + x | 0;
		d = (0, utils_ts_1.rotr)(d ^ a, 16);
		c = c + d | 0;
		b = (0, utils_ts_1.rotr)(b ^ c, 12);
		return {
			a,
			b,
			c,
			d
		};
	}
	function G2s(a, b, c, d, x) {
		a = a + b + x | 0;
		d = (0, utils_ts_1.rotr)(d ^ a, 8);
		c = c + d | 0;
		b = (0, utils_ts_1.rotr)(b ^ c, 7);
		return {
			a,
			b,
			c,
			d
		};
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/blake2.js
var require_blake2$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.blake2s = exports.BLAKE2s = exports.blake2b = exports.BLAKE2b = exports.BLAKE2 = void 0;
	exports.compress = compress;
	/**
	* blake2b (64-bit) & blake2s (8 to 32-bit) hash functions.
	* b could have been faster, but there is no fast u64 in js, so s is 1.5x faster.
	* @module
	*/
	var _blake_ts_1 = require__blake$1();
	var _md_ts_1 = require__md$1();
	var u64 = require__u64$2();
	var utils_ts_1 = require_utils$2();
	var B2B_IV = /* @__PURE__ */ Uint32Array.from([
		4089235720,
		1779033703,
		2227873595,
		3144134277,
		4271175723,
		1013904242,
		1595750129,
		2773480762,
		2917565137,
		1359893119,
		725511199,
		2600822924,
		4215389547,
		528734635,
		327033209,
		1541459225
	]);
	var BBUF = /* @__PURE__ */ new Uint32Array(32);
	function G1b(a, b, c, d, msg, x) {
		const Xl = msg[x], Xh = msg[x + 1];
		let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
		let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
		let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
		let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
		let ll = u64.add3L(Al, Bl, Xl);
		Ah = u64.add3H(ll, Ah, Bh, Xh);
		Al = ll | 0;
		({Dh, Dl} = {
			Dh: Dh ^ Ah,
			Dl: Dl ^ Al
		});
		({Dh, Dl} = {
			Dh: u64.rotr32H(Dh, Dl),
			Dl: u64.rotr32L(Dh, Dl)
		});
		({h: Ch, l: Cl} = u64.add(Ch, Cl, Dh, Dl));
		({Bh, Bl} = {
			Bh: Bh ^ Ch,
			Bl: Bl ^ Cl
		});
		({Bh, Bl} = {
			Bh: u64.rotrSH(Bh, Bl, 24),
			Bl: u64.rotrSL(Bh, Bl, 24)
		});
		BBUF[2 * a] = Al, BBUF[2 * a + 1] = Ah;
		BBUF[2 * b] = Bl, BBUF[2 * b + 1] = Bh;
		BBUF[2 * c] = Cl, BBUF[2 * c + 1] = Ch;
		BBUF[2 * d] = Dl, BBUF[2 * d + 1] = Dh;
	}
	function G2b(a, b, c, d, msg, x) {
		const Xl = msg[x], Xh = msg[x + 1];
		let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
		let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
		let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
		let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
		let ll = u64.add3L(Al, Bl, Xl);
		Ah = u64.add3H(ll, Ah, Bh, Xh);
		Al = ll | 0;
		({Dh, Dl} = {
			Dh: Dh ^ Ah,
			Dl: Dl ^ Al
		});
		({Dh, Dl} = {
			Dh: u64.rotrSH(Dh, Dl, 16),
			Dl: u64.rotrSL(Dh, Dl, 16)
		});
		({h: Ch, l: Cl} = u64.add(Ch, Cl, Dh, Dl));
		({Bh, Bl} = {
			Bh: Bh ^ Ch,
			Bl: Bl ^ Cl
		});
		({Bh, Bl} = {
			Bh: u64.rotrBH(Bh, Bl, 63),
			Bl: u64.rotrBL(Bh, Bl, 63)
		});
		BBUF[2 * a] = Al, BBUF[2 * a + 1] = Ah;
		BBUF[2 * b] = Bl, BBUF[2 * b + 1] = Bh;
		BBUF[2 * c] = Cl, BBUF[2 * c + 1] = Ch;
		BBUF[2 * d] = Dl, BBUF[2 * d + 1] = Dh;
	}
	function checkBlake2Opts(outputLen, opts = {}, keyLen, saltLen, persLen) {
		(0, utils_ts_1.anumber)(keyLen);
		if (outputLen < 0 || outputLen > keyLen) throw new Error("outputLen bigger than keyLen");
		const { key, salt, personalization } = opts;
		if (key !== void 0 && (key.length < 1 || key.length > keyLen)) throw new Error("key length must be undefined or 1.." + keyLen);
		if (salt !== void 0 && salt.length !== saltLen) throw new Error("salt must be undefined or " + saltLen);
		if (personalization !== void 0 && personalization.length !== persLen) throw new Error("personalization must be undefined or " + persLen);
	}
	/** Class, from which others are subclassed. */
	var BLAKE2 = class extends utils_ts_1.Hash {
		constructor(blockLen, outputLen) {
			super();
			this.finished = false;
			this.destroyed = false;
			this.length = 0;
			this.pos = 0;
			(0, utils_ts_1.anumber)(blockLen);
			(0, utils_ts_1.anumber)(outputLen);
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.buffer = new Uint8Array(blockLen);
			this.buffer32 = (0, utils_ts_1.u32)(this.buffer);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { blockLen, buffer, buffer32 } = this;
			const len = data.length;
			const offset = data.byteOffset;
			const buf = data.buffer;
			for (let pos = 0; pos < len;) {
				if (this.pos === blockLen) {
					(0, utils_ts_1.swap32IfBE)(buffer32);
					this.compress(buffer32, 0, false);
					(0, utils_ts_1.swap32IfBE)(buffer32);
					this.pos = 0;
				}
				const take = Math.min(blockLen - this.pos, len - pos);
				const dataOffset = offset + pos;
				if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
					const data32 = new Uint32Array(buf, dataOffset, Math.floor((len - pos) / 4));
					(0, utils_ts_1.swap32IfBE)(data32);
					for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
						this.length += blockLen;
						this.compress(data32, pos32, false);
					}
					(0, utils_ts_1.swap32IfBE)(data32);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				this.length += take;
				pos += take;
			}
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			const { pos, buffer32 } = this;
			this.finished = true;
			(0, utils_ts_1.clean)(this.buffer.subarray(pos));
			(0, utils_ts_1.swap32IfBE)(buffer32);
			this.compress(buffer32, 0, true);
			(0, utils_ts_1.swap32IfBE)(buffer32);
			const out32 = (0, utils_ts_1.u32)(out);
			this.get().forEach((v, i) => out32[i] = (0, utils_ts_1.swap8IfBE)(v));
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			const { buffer, length, finished, destroyed, outputLen, pos } = this;
			to || (to = new this.constructor({ dkLen: outputLen }));
			to.set(...this.get());
			to.buffer.set(buffer);
			to.destroyed = destroyed;
			to.finished = finished;
			to.length = length;
			to.pos = pos;
			to.outputLen = outputLen;
			return to;
		}
		clone() {
			return this._cloneInto();
		}
	};
	exports.BLAKE2 = BLAKE2;
	var BLAKE2b = class extends BLAKE2 {
		constructor(opts = {}) {
			const olen = opts.dkLen === void 0 ? 64 : opts.dkLen;
			super(128, olen);
			this.v0l = B2B_IV[0] | 0;
			this.v0h = B2B_IV[1] | 0;
			this.v1l = B2B_IV[2] | 0;
			this.v1h = B2B_IV[3] | 0;
			this.v2l = B2B_IV[4] | 0;
			this.v2h = B2B_IV[5] | 0;
			this.v3l = B2B_IV[6] | 0;
			this.v3h = B2B_IV[7] | 0;
			this.v4l = B2B_IV[8] | 0;
			this.v4h = B2B_IV[9] | 0;
			this.v5l = B2B_IV[10] | 0;
			this.v5h = B2B_IV[11] | 0;
			this.v6l = B2B_IV[12] | 0;
			this.v6h = B2B_IV[13] | 0;
			this.v7l = B2B_IV[14] | 0;
			this.v7h = B2B_IV[15] | 0;
			checkBlake2Opts(olen, opts, 64, 16, 16);
			let { key, personalization, salt } = opts;
			let keyLength = 0;
			if (key !== void 0) {
				key = (0, utils_ts_1.toBytes)(key);
				keyLength = key.length;
			}
			this.v0l ^= this.outputLen | keyLength << 8 | 16842752;
			if (salt !== void 0) {
				salt = (0, utils_ts_1.toBytes)(salt);
				const slt = (0, utils_ts_1.u32)(salt);
				this.v4l ^= (0, utils_ts_1.swap8IfBE)(slt[0]);
				this.v4h ^= (0, utils_ts_1.swap8IfBE)(slt[1]);
				this.v5l ^= (0, utils_ts_1.swap8IfBE)(slt[2]);
				this.v5h ^= (0, utils_ts_1.swap8IfBE)(slt[3]);
			}
			if (personalization !== void 0) {
				personalization = (0, utils_ts_1.toBytes)(personalization);
				const pers = (0, utils_ts_1.u32)(personalization);
				this.v6l ^= (0, utils_ts_1.swap8IfBE)(pers[0]);
				this.v6h ^= (0, utils_ts_1.swap8IfBE)(pers[1]);
				this.v7l ^= (0, utils_ts_1.swap8IfBE)(pers[2]);
				this.v7h ^= (0, utils_ts_1.swap8IfBE)(pers[3]);
			}
			if (key !== void 0) {
				const tmp = new Uint8Array(this.blockLen);
				tmp.set(key);
				this.update(tmp);
			}
		}
		get() {
			let { v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h } = this;
			return [
				v0l,
				v0h,
				v1l,
				v1h,
				v2l,
				v2h,
				v3l,
				v3h,
				v4l,
				v4h,
				v5l,
				v5h,
				v6l,
				v6h,
				v7l,
				v7h
			];
		}
		set(v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h) {
			this.v0l = v0l | 0;
			this.v0h = v0h | 0;
			this.v1l = v1l | 0;
			this.v1h = v1h | 0;
			this.v2l = v2l | 0;
			this.v2h = v2h | 0;
			this.v3l = v3l | 0;
			this.v3h = v3h | 0;
			this.v4l = v4l | 0;
			this.v4h = v4h | 0;
			this.v5l = v5l | 0;
			this.v5h = v5h | 0;
			this.v6l = v6l | 0;
			this.v6h = v6h | 0;
			this.v7l = v7l | 0;
			this.v7h = v7h | 0;
		}
		compress(msg, offset, isLast) {
			this.get().forEach((v, i) => BBUF[i] = v);
			BBUF.set(B2B_IV, 16);
			let { h, l } = u64.fromBig(BigInt(this.length));
			BBUF[24] = B2B_IV[8] ^ l;
			BBUF[25] = B2B_IV[9] ^ h;
			if (isLast) {
				BBUF[28] = ~BBUF[28];
				BBUF[29] = ~BBUF[29];
			}
			let j = 0;
			const s = _blake_ts_1.BSIGMA;
			for (let i = 0; i < 12; i++) {
				G1b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
				G2b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
				G1b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
				G2b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
				G1b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
				G2b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
				G1b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
				G2b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
				G1b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
				G2b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
				G1b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
				G2b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
				G1b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
				G2b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
				G1b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
				G2b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
			}
			this.v0l ^= BBUF[0] ^ BBUF[16];
			this.v0h ^= BBUF[1] ^ BBUF[17];
			this.v1l ^= BBUF[2] ^ BBUF[18];
			this.v1h ^= BBUF[3] ^ BBUF[19];
			this.v2l ^= BBUF[4] ^ BBUF[20];
			this.v2h ^= BBUF[5] ^ BBUF[21];
			this.v3l ^= BBUF[6] ^ BBUF[22];
			this.v3h ^= BBUF[7] ^ BBUF[23];
			this.v4l ^= BBUF[8] ^ BBUF[24];
			this.v4h ^= BBUF[9] ^ BBUF[25];
			this.v5l ^= BBUF[10] ^ BBUF[26];
			this.v5h ^= BBUF[11] ^ BBUF[27];
			this.v6l ^= BBUF[12] ^ BBUF[28];
			this.v6h ^= BBUF[13] ^ BBUF[29];
			this.v7l ^= BBUF[14] ^ BBUF[30];
			this.v7h ^= BBUF[15] ^ BBUF[31];
			(0, utils_ts_1.clean)(BBUF);
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer32);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.BLAKE2b = BLAKE2b;
	/**
	* Blake2b hash function. 64-bit. 1.5x slower than blake2s in JS.
	* @param msg - message that would be hashed
	* @param opts - dkLen output length, key for MAC mode, salt, personalization
	*/
	exports.blake2b = (0, utils_ts_1.createOptHasher)((opts) => new BLAKE2b(opts));
	function compress(s, offset, msg, rounds, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
		let j = 0;
		for (let i = 0; i < rounds; i++) {
			({a: v0, b: v4, c: v8, d: v12} = (0, _blake_ts_1.G1s)(v0, v4, v8, v12, msg[offset + s[j++]]));
			({a: v0, b: v4, c: v8, d: v12} = (0, _blake_ts_1.G2s)(v0, v4, v8, v12, msg[offset + s[j++]]));
			({a: v1, b: v5, c: v9, d: v13} = (0, _blake_ts_1.G1s)(v1, v5, v9, v13, msg[offset + s[j++]]));
			({a: v1, b: v5, c: v9, d: v13} = (0, _blake_ts_1.G2s)(v1, v5, v9, v13, msg[offset + s[j++]]));
			({a: v2, b: v6, c: v10, d: v14} = (0, _blake_ts_1.G1s)(v2, v6, v10, v14, msg[offset + s[j++]]));
			({a: v2, b: v6, c: v10, d: v14} = (0, _blake_ts_1.G2s)(v2, v6, v10, v14, msg[offset + s[j++]]));
			({a: v3, b: v7, c: v11, d: v15} = (0, _blake_ts_1.G1s)(v3, v7, v11, v15, msg[offset + s[j++]]));
			({a: v3, b: v7, c: v11, d: v15} = (0, _blake_ts_1.G2s)(v3, v7, v11, v15, msg[offset + s[j++]]));
			({a: v0, b: v5, c: v10, d: v15} = (0, _blake_ts_1.G1s)(v0, v5, v10, v15, msg[offset + s[j++]]));
			({a: v0, b: v5, c: v10, d: v15} = (0, _blake_ts_1.G2s)(v0, v5, v10, v15, msg[offset + s[j++]]));
			({a: v1, b: v6, c: v11, d: v12} = (0, _blake_ts_1.G1s)(v1, v6, v11, v12, msg[offset + s[j++]]));
			({a: v1, b: v6, c: v11, d: v12} = (0, _blake_ts_1.G2s)(v1, v6, v11, v12, msg[offset + s[j++]]));
			({a: v2, b: v7, c: v8, d: v13} = (0, _blake_ts_1.G1s)(v2, v7, v8, v13, msg[offset + s[j++]]));
			({a: v2, b: v7, c: v8, d: v13} = (0, _blake_ts_1.G2s)(v2, v7, v8, v13, msg[offset + s[j++]]));
			({a: v3, b: v4, c: v9, d: v14} = (0, _blake_ts_1.G1s)(v3, v4, v9, v14, msg[offset + s[j++]]));
			({a: v3, b: v4, c: v9, d: v14} = (0, _blake_ts_1.G2s)(v3, v4, v9, v14, msg[offset + s[j++]]));
		}
		return {
			v0,
			v1,
			v2,
			v3,
			v4,
			v5,
			v6,
			v7,
			v8,
			v9,
			v10,
			v11,
			v12,
			v13,
			v14,
			v15
		};
	}
	var B2S_IV = _md_ts_1.SHA256_IV;
	var BLAKE2s = class extends BLAKE2 {
		constructor(opts = {}) {
			const olen = opts.dkLen === void 0 ? 32 : opts.dkLen;
			super(64, olen);
			this.v0 = B2S_IV[0] | 0;
			this.v1 = B2S_IV[1] | 0;
			this.v2 = B2S_IV[2] | 0;
			this.v3 = B2S_IV[3] | 0;
			this.v4 = B2S_IV[4] | 0;
			this.v5 = B2S_IV[5] | 0;
			this.v6 = B2S_IV[6] | 0;
			this.v7 = B2S_IV[7] | 0;
			checkBlake2Opts(olen, opts, 32, 8, 8);
			let { key, personalization, salt } = opts;
			let keyLength = 0;
			if (key !== void 0) {
				key = (0, utils_ts_1.toBytes)(key);
				keyLength = key.length;
			}
			this.v0 ^= this.outputLen | keyLength << 8 | 16842752;
			if (salt !== void 0) {
				salt = (0, utils_ts_1.toBytes)(salt);
				const slt = (0, utils_ts_1.u32)(salt);
				this.v4 ^= (0, utils_ts_1.swap8IfBE)(slt[0]);
				this.v5 ^= (0, utils_ts_1.swap8IfBE)(slt[1]);
			}
			if (personalization !== void 0) {
				personalization = (0, utils_ts_1.toBytes)(personalization);
				const pers = (0, utils_ts_1.u32)(personalization);
				this.v6 ^= (0, utils_ts_1.swap8IfBE)(pers[0]);
				this.v7 ^= (0, utils_ts_1.swap8IfBE)(pers[1]);
			}
			if (key !== void 0) {
				(0, utils_ts_1.abytes)(key);
				const tmp = new Uint8Array(this.blockLen);
				tmp.set(key);
				this.update(tmp);
			}
		}
		get() {
			const { v0, v1, v2, v3, v4, v5, v6, v7 } = this;
			return [
				v0,
				v1,
				v2,
				v3,
				v4,
				v5,
				v6,
				v7
			];
		}
		set(v0, v1, v2, v3, v4, v5, v6, v7) {
			this.v0 = v0 | 0;
			this.v1 = v1 | 0;
			this.v2 = v2 | 0;
			this.v3 = v3 | 0;
			this.v4 = v4 | 0;
			this.v5 = v5 | 0;
			this.v6 = v6 | 0;
			this.v7 = v7 | 0;
		}
		compress(msg, offset, isLast) {
			const { h, l } = u64.fromBig(BigInt(this.length));
			const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 } = compress(_blake_ts_1.BSIGMA, offset, msg, 10, this.v0, this.v1, this.v2, this.v3, this.v4, this.v5, this.v6, this.v7, B2S_IV[0], B2S_IV[1], B2S_IV[2], B2S_IV[3], l ^ B2S_IV[4], h ^ B2S_IV[5], isLast ? ~B2S_IV[6] : B2S_IV[6], B2S_IV[7]);
			this.v0 ^= v0 ^ v8;
			this.v1 ^= v1 ^ v9;
			this.v2 ^= v2 ^ v10;
			this.v3 ^= v3 ^ v11;
			this.v4 ^= v4 ^ v12;
			this.v5 ^= v5 ^ v13;
			this.v6 ^= v6 ^ v14;
			this.v7 ^= v7 ^ v15;
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer32);
			this.set(0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.BLAKE2s = BLAKE2s;
	/**
	* Blake2s hash function. Focuses on 8-bit to 32-bit platforms. 1.5x faster than blake2b in JS.
	* @param msg - message that would be hashed
	* @param opts - dkLen output length, key for MAC mode, salt, personalization
	*/
	exports.blake2s = (0, utils_ts_1.createOptHasher)((opts) => new BLAKE2s(opts));
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/blake3.js
var require_blake3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.blake3 = exports.BLAKE3 = void 0;
	/**
	* Blake3 fast hash is Blake2 with reduced security (round count). Can also be used as MAC & KDF.
	*
	* It is advertised as "the fastest cryptographic hash". However, it isn't true in JS.
	* Why is this so slow? While it should be 6x faster than blake2b, perf diff is only 20%:
	*
	* * There is only 30% reduction in number of rounds from blake2s
	* * Speed-up comes from tree structure, which is parallelized using SIMD & threading.
	*   These features are not present in JS, so we only get overhead from trees.
	* * Parallelization only happens on 1024-byte chunks: there is no benefit for small inputs.
	* * It is still possible to make it faster using: a) loop unrolling b) web workers c) wasm
	* @module
	*/
	var _md_ts_1 = require__md$1();
	var _u64_ts_1 = require__u64$2();
	var blake2_ts_1 = require_blake2$1();
	var utils_ts_1 = require_utils$2();
	var B3_Flags = {
		CHUNK_START: 1,
		CHUNK_END: 2,
		PARENT: 4,
		ROOT: 8,
		KEYED_HASH: 16,
		DERIVE_KEY_CONTEXT: 32,
		DERIVE_KEY_MATERIAL: 64
	};
	var B3_IV = _md_ts_1.SHA256_IV.slice();
	var B3_SIGMA = /* @__PURE__ */ (() => {
		const Id = Array.from({ length: 16 }, (_, i) => i);
		const permute = (arr) => [
			2,
			6,
			3,
			10,
			7,
			0,
			4,
			13,
			1,
			11,
			12,
			5,
			9,
			14,
			15,
			8
		].map((i) => arr[i]);
		const res = [];
		for (let i = 0, v = Id; i < 7; i++, v = permute(v)) res.push(...v);
		return Uint8Array.from(res);
	})();
	/** Blake3 hash. Can be used as MAC and KDF. */
	var BLAKE3 = class BLAKE3 extends blake2_ts_1.BLAKE2 {
		constructor(opts = {}, flags = 0) {
			super(64, opts.dkLen === void 0 ? 32 : opts.dkLen);
			this.chunkPos = 0;
			this.chunksDone = 0;
			this.flags = 0;
			this.stack = [];
			this.posOut = 0;
			this.bufferOut32 = /* @__PURE__ */ new Uint32Array(16);
			this.chunkOut = 0;
			this.enableXOF = true;
			const { key, context } = opts;
			const hasContext = context !== void 0;
			if (key !== void 0) {
				if (hasContext) throw new Error("Only \"key\" or \"context\" can be specified at same time");
				const k = (0, utils_ts_1.toBytes)(key).slice();
				(0, utils_ts_1.abytes)(k, 32);
				this.IV = (0, utils_ts_1.u32)(k);
				(0, utils_ts_1.swap32IfBE)(this.IV);
				this.flags = flags | B3_Flags.KEYED_HASH;
			} else if (hasContext) {
				const ctx = (0, utils_ts_1.toBytes)(context);
				const contextKey = new BLAKE3({ dkLen: 32 }, B3_Flags.DERIVE_KEY_CONTEXT).update(ctx).digest();
				this.IV = (0, utils_ts_1.u32)(contextKey);
				(0, utils_ts_1.swap32IfBE)(this.IV);
				this.flags = flags | B3_Flags.DERIVE_KEY_MATERIAL;
			} else {
				this.IV = B3_IV.slice();
				this.flags = flags;
			}
			this.state = this.IV.slice();
			this.bufferOut = (0, utils_ts_1.u8)(this.bufferOut32);
		}
		get() {
			return [];
		}
		set() {}
		b2Compress(counter, flags, buf, bufPos = 0) {
			const { state: s, pos } = this;
			const { h, l } = (0, _u64_ts_1.fromBig)(BigInt(counter), true);
			const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 } = (0, blake2_ts_1.compress)(B3_SIGMA, bufPos, buf, 7, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], B3_IV[0], B3_IV[1], B3_IV[2], B3_IV[3], h, l, pos, flags);
			s[0] = v0 ^ v8;
			s[1] = v1 ^ v9;
			s[2] = v2 ^ v10;
			s[3] = v3 ^ v11;
			s[4] = v4 ^ v12;
			s[5] = v5 ^ v13;
			s[6] = v6 ^ v14;
			s[7] = v7 ^ v15;
		}
		compress(buf, bufPos = 0, isLast = false) {
			let flags = this.flags;
			if (!this.chunkPos) flags |= B3_Flags.CHUNK_START;
			if (this.chunkPos === 15 || isLast) flags |= B3_Flags.CHUNK_END;
			if (!isLast) this.pos = this.blockLen;
			this.b2Compress(this.chunksDone, flags, buf, bufPos);
			this.chunkPos += 1;
			if (this.chunkPos === 16 || isLast) {
				let chunk = this.state;
				this.state = this.IV.slice();
				for (let last, chunks = this.chunksDone + 1; isLast || !(chunks & 1); chunks >>= 1) {
					if (!(last = this.stack.pop())) break;
					this.buffer32.set(last, 0);
					this.buffer32.set(chunk, 8);
					this.pos = this.blockLen;
					this.b2Compress(0, this.flags | B3_Flags.PARENT, this.buffer32, 0);
					chunk = this.state;
					this.state = this.IV.slice();
				}
				this.chunksDone++;
				this.chunkPos = 0;
				this.stack.push(chunk);
			}
			this.pos = 0;
		}
		_cloneInto(to) {
			to = super._cloneInto(to);
			const { IV, flags, state, chunkPos, posOut, chunkOut, stack, chunksDone } = this;
			to.state.set(state.slice());
			to.stack = stack.map((i) => Uint32Array.from(i));
			to.IV.set(IV);
			to.flags = flags;
			to.chunkPos = chunkPos;
			to.chunksDone = chunksDone;
			to.posOut = posOut;
			to.chunkOut = chunkOut;
			to.enableXOF = this.enableXOF;
			to.bufferOut32.set(this.bufferOut32);
			return to;
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.state, this.buffer32, this.IV, this.bufferOut32);
			(0, utils_ts_1.clean)(...this.stack);
		}
		b2CompressOut() {
			const { state: s, pos, flags, buffer32, bufferOut32: out32 } = this;
			const { h, l } = (0, _u64_ts_1.fromBig)(BigInt(this.chunkOut++));
			(0, utils_ts_1.swap32IfBE)(buffer32);
			const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 } = (0, blake2_ts_1.compress)(B3_SIGMA, 0, buffer32, 7, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], B3_IV[0], B3_IV[1], B3_IV[2], B3_IV[3], l, h, pos, flags);
			out32[0] = v0 ^ v8;
			out32[1] = v1 ^ v9;
			out32[2] = v2 ^ v10;
			out32[3] = v3 ^ v11;
			out32[4] = v4 ^ v12;
			out32[5] = v5 ^ v13;
			out32[6] = v6 ^ v14;
			out32[7] = v7 ^ v15;
			out32[8] = s[0] ^ v8;
			out32[9] = s[1] ^ v9;
			out32[10] = s[2] ^ v10;
			out32[11] = s[3] ^ v11;
			out32[12] = s[4] ^ v12;
			out32[13] = s[5] ^ v13;
			out32[14] = s[6] ^ v14;
			out32[15] = s[7] ^ v15;
			(0, utils_ts_1.swap32IfBE)(buffer32);
			(0, utils_ts_1.swap32IfBE)(out32);
			this.posOut = 0;
		}
		finish() {
			if (this.finished) return;
			this.finished = true;
			(0, utils_ts_1.clean)(this.buffer.subarray(this.pos));
			let flags = this.flags | B3_Flags.ROOT;
			if (this.stack.length) {
				flags |= B3_Flags.PARENT;
				(0, utils_ts_1.swap32IfBE)(this.buffer32);
				this.compress(this.buffer32, 0, true);
				(0, utils_ts_1.swap32IfBE)(this.buffer32);
				this.chunksDone = 0;
				this.pos = this.blockLen;
			} else flags |= (!this.chunkPos ? B3_Flags.CHUNK_START : 0) | B3_Flags.CHUNK_END;
			this.flags = flags;
			this.b2CompressOut();
		}
		writeInto(out) {
			(0, utils_ts_1.aexists)(this, false);
			(0, utils_ts_1.abytes)(out);
			this.finish();
			const { blockLen, bufferOut } = this;
			for (let pos = 0, len = out.length; pos < len;) {
				if (this.posOut >= blockLen) this.b2CompressOut();
				const take = Math.min(blockLen - this.posOut, len - pos);
				out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
				this.posOut += take;
				pos += take;
			}
			return out;
		}
		xofInto(out) {
			if (!this.enableXOF) throw new Error("XOF is not possible after digest call");
			return this.writeInto(out);
		}
		xof(bytes) {
			(0, utils_ts_1.anumber)(bytes);
			return this.xofInto(new Uint8Array(bytes));
		}
		digestInto(out) {
			(0, utils_ts_1.aoutput)(out, this);
			if (this.finished) throw new Error("digest() was already called");
			this.enableXOF = false;
			this.writeInto(out);
			this.destroy();
			return out;
		}
		digest() {
			return this.digestInto(new Uint8Array(this.outputLen));
		}
	};
	exports.BLAKE3 = BLAKE3;
	/**
	* BLAKE3 hash function. Can be used as MAC and KDF.
	* @param msg - message that would be hashed
	* @param opts - `dkLen` for output length, `key` for MAC mode, `context` for KDF mode
	* @example
	* const data = new Uint8Array(32);
	* const hash = blake3(data);
	* const mac = blake3(data, { key: new Uint8Array(32) });
	* const kdf = blake3(data, { context: 'application name' });
	*/
	exports.blake3 = (0, utils_ts_1.createXOFer)((opts) => new BLAKE3(opts));
}));
//#endregion
//#region node_modules/@scure/bip32/node_modules/@noble/hashes/legacy.js
var require_legacy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ripemd160 = exports.RIPEMD160 = exports.md5 = exports.MD5 = exports.sha1 = exports.SHA1 = void 0;
	/**
	
	SHA1 (RFC 3174), MD5 (RFC 1321) and RIPEMD160 (RFC 2286) legacy, weak hash functions.
	Don't use them in a new protocol. What "weak" means:
	
	- Collisions can be made with 2^18 effort in MD5, 2^60 in SHA1, 2^80 in RIPEMD160.
	- No practical pre-image attacks (only theoretical, 2^123.4)
	- HMAC seems kinda ok: https://datatracker.ietf.org/doc/html/rfc6151
	* @module
	*/
	var _md_ts_1 = require__md$2();
	var utils_ts_1 = require_utils$3();
	/** Initial SHA1 state */
	var SHA1_IV = /* @__PURE__ */ Uint32Array.from([
		1732584193,
		4023233417,
		2562383102,
		271733878,
		3285377520
	]);
	var SHA1_W = /* @__PURE__ */ new Uint32Array(80);
	/** SHA1 legacy hash class. */
	var SHA1 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 20, 8, false);
			this.A = SHA1_IV[0] | 0;
			this.B = SHA1_IV[1] | 0;
			this.C = SHA1_IV[2] | 0;
			this.D = SHA1_IV[3] | 0;
			this.E = SHA1_IV[4] | 0;
		}
		get() {
			const { A, B, C, D, E } = this;
			return [
				A,
				B,
				C,
				D,
				E
			];
		}
		set(A, B, C, D, E) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA1_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 80; i++) SHA1_W[i] = (0, utils_ts_1.rotl)(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
			let { A, B, C, D, E } = this;
			for (let i = 0; i < 80; i++) {
				let F, K;
				if (i < 20) {
					F = (0, _md_ts_1.Chi)(B, C, D);
					K = 1518500249;
				} else if (i < 40) {
					F = B ^ C ^ D;
					K = 1859775393;
				} else if (i < 60) {
					F = (0, _md_ts_1.Maj)(B, C, D);
					K = 2400959708;
				} else {
					F = B ^ C ^ D;
					K = 3395469782;
				}
				const T = (0, utils_ts_1.rotl)(A, 5) + F + E + K + SHA1_W[i] | 0;
				E = D;
				D = C;
				C = (0, utils_ts_1.rotl)(B, 30);
				B = A;
				A = T;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			this.set(A, B, C, D, E);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA1_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA1 = SHA1;
	/** SHA1 (RFC 3174) legacy hash function. It was cryptographically broken. */
	exports.sha1 = (0, utils_ts_1.createHasher)(() => new SHA1());
	/** Per-round constants */
	var p32 = /* @__PURE__ */ Math.pow(2, 32);
	var K = /* @__PURE__ */ Array.from({ length: 64 }, (_, i) => Math.floor(p32 * Math.abs(Math.sin(i + 1))));
	/** md5 initial state: same as sha1, but 4 u32 instead of 5. */
	var MD5_IV = /* @__PURE__ */ SHA1_IV.slice(0, 4);
	var MD5_W = /* @__PURE__ */ new Uint32Array(16);
	/** MD5 legacy hash class. */
	var MD5 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 16, 8, true);
			this.A = MD5_IV[0] | 0;
			this.B = MD5_IV[1] | 0;
			this.C = MD5_IV[2] | 0;
			this.D = MD5_IV[3] | 0;
		}
		get() {
			const { A, B, C, D } = this;
			return [
				A,
				B,
				C,
				D
			];
		}
		set(A, B, C, D) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) MD5_W[i] = view.getUint32(offset, true);
			let { A, B, C, D } = this;
			for (let i = 0; i < 64; i++) {
				let F, g, s;
				if (i < 16) {
					F = (0, _md_ts_1.Chi)(B, C, D);
					g = i;
					s = [
						7,
						12,
						17,
						22
					];
				} else if (i < 32) {
					F = (0, _md_ts_1.Chi)(D, B, C);
					g = (5 * i + 1) % 16;
					s = [
						5,
						9,
						14,
						20
					];
				} else if (i < 48) {
					F = B ^ C ^ D;
					g = (3 * i + 5) % 16;
					s = [
						4,
						11,
						16,
						23
					];
				} else {
					F = C ^ (B | ~D);
					g = 7 * i % 16;
					s = [
						6,
						10,
						15,
						21
					];
				}
				F = F + A + K[i] + MD5_W[g];
				A = D;
				D = C;
				C = B;
				B = B + (0, utils_ts_1.rotl)(F, s[i % 4]);
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			this.set(A, B, C, D);
		}
		roundClean() {
			(0, utils_ts_1.clean)(MD5_W);
		}
		destroy() {
			this.set(0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.MD5 = MD5;
	/**
	* MD5 (RFC 1321) legacy hash function. It was cryptographically broken.
	* MD5 architecture is similar to SHA1, with some differences:
	* - Reduced output length: 16 bytes (128 bit) instead of 20
	* - 64 rounds, instead of 80
	* - Little-endian: could be faster, but will require more code
	* - Non-linear index selection: huge speed-up for unroll
	* - Per round constants: more memory accesses, additional speed-up for unroll
	*/
	exports.md5 = (0, utils_ts_1.createHasher)(() => new MD5());
	var Rho160 = /* @__PURE__ */ Uint8Array.from([
		7,
		4,
		13,
		1,
		10,
		6,
		15,
		3,
		12,
		0,
		9,
		5,
		2,
		14,
		11,
		8
	]);
	var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
	var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
	var idxLR = /* @__PURE__ */ (() => {
		const res = [[Id160], [Pi160]];
		for (let i = 0; i < 4; i++) for (let j of res) j.push(j[i].map((k) => Rho160[k]));
		return res;
	})();
	var idxL = /* @__PURE__ */ (() => idxLR[0])();
	var idxR = /* @__PURE__ */ (() => idxLR[1])();
	var shifts160 = /* @__PURE__ */ [
		[
			11,
			14,
			15,
			12,
			5,
			8,
			7,
			9,
			11,
			13,
			14,
			15,
			6,
			7,
			9,
			8
		],
		[
			12,
			13,
			11,
			15,
			6,
			9,
			9,
			7,
			12,
			15,
			11,
			13,
			7,
			8,
			7,
			7
		],
		[
			13,
			15,
			14,
			11,
			7,
			7,
			6,
			8,
			13,
			14,
			13,
			12,
			5,
			5,
			6,
			9
		],
		[
			14,
			11,
			12,
			14,
			8,
			6,
			5,
			5,
			15,
			12,
			15,
			14,
			9,
			9,
			8,
			6
		],
		[
			15,
			12,
			13,
			13,
			9,
			5,
			8,
			6,
			14,
			11,
			12,
			11,
			8,
			6,
			5,
			5
		]
	].map((i) => Uint8Array.from(i));
	var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
	var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
	var Kl160 = /* @__PURE__ */ Uint32Array.from([
		0,
		1518500249,
		1859775393,
		2400959708,
		2840853838
	]);
	var Kr160 = /* @__PURE__ */ Uint32Array.from([
		1352829926,
		1548603684,
		1836072691,
		2053994217,
		0
	]);
	function ripemd_f(group, x, y, z) {
		if (group === 0) return x ^ y ^ z;
		if (group === 1) return x & y | ~x & z;
		if (group === 2) return (x | ~y) ^ z;
		if (group === 3) return x & z | y & ~z;
		return x ^ (y | ~z);
	}
	var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
	var RIPEMD160 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 20, 8, true);
			this.h0 = 1732584193;
			this.h1 = -271733879;
			this.h2 = -1732584194;
			this.h3 = 271733878;
			this.h4 = -1009589776;
		}
		get() {
			const { h0, h1, h2, h3, h4 } = this;
			return [
				h0,
				h1,
				h2,
				h3,
				h4
			];
		}
		set(h0, h1, h2, h3, h4) {
			this.h0 = h0 | 0;
			this.h1 = h1 | 0;
			this.h2 = h2 | 0;
			this.h3 = h3 | 0;
			this.h4 = h4 | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) BUF_160[i] = view.getUint32(offset, true);
			let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
			for (let group = 0; group < 5; group++) {
				const rGroup = 4 - group;
				const hbl = Kl160[group], hbr = Kr160[group];
				const rl = idxL[group], rr = idxR[group];
				const sl = shiftsL160[group], sr = shiftsR160[group];
				for (let i = 0; i < 16; i++) {
					const tl = (0, utils_ts_1.rotl)(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
					al = el, el = dl, dl = (0, utils_ts_1.rotl)(cl, 10) | 0, cl = bl, bl = tl;
				}
				for (let i = 0; i < 16; i++) {
					const tr = (0, utils_ts_1.rotl)(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
					ar = er, er = dr, dr = (0, utils_ts_1.rotl)(cr, 10) | 0, cr = br, br = tr;
				}
			}
			this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
		}
		roundClean() {
			(0, utils_ts_1.clean)(BUF_160);
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0);
		}
	};
	exports.RIPEMD160 = RIPEMD160;
	/**
	* RIPEMD-160 - a legacy hash function from 1990s.
	* * https://homes.esat.kuleuven.be/~bosselae/ripemd160.html
	* * https://homes.esat.kuleuven.be/~bosselae/ripemd160/pdf/AB-9601/AB-9601.pdf
	*/
	exports.ripemd160 = (0, utils_ts_1.createHasher)(() => new RIPEMD160());
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/pbkdf2.js
var require_pbkdf2$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pbkdf2 = pbkdf2;
	exports.pbkdf2Async = pbkdf2Async;
	/**
	* PBKDF (RFC 2898). Can be used to create a key from password and salt.
	* @module
	*/
	var hmac_ts_1 = require_hmac$1();
	var utils_ts_1 = require_utils$2();
	function pbkdf2Init(hash, _password, _salt, _opts) {
		(0, utils_ts_1.ahash)(hash);
		const { c, dkLen, asyncTick } = (0, utils_ts_1.checkOpts)({
			dkLen: 32,
			asyncTick: 10
		}, _opts);
		(0, utils_ts_1.anumber)(c);
		(0, utils_ts_1.anumber)(dkLen);
		(0, utils_ts_1.anumber)(asyncTick);
		if (c < 1) throw new Error("iterations (c) should be >= 1");
		const password = (0, utils_ts_1.kdfInputToBytes)(_password);
		const salt = (0, utils_ts_1.kdfInputToBytes)(_salt);
		const DK = new Uint8Array(dkLen);
		const PRF = hmac_ts_1.hmac.create(hash, password);
		return {
			c,
			dkLen,
			asyncTick,
			DK,
			PRF,
			PRFSalt: PRF._cloneInto().update(salt)
		};
	}
	function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
		PRF.destroy();
		PRFSalt.destroy();
		if (prfW) prfW.destroy();
		(0, utils_ts_1.clean)(u);
		return DK;
	}
	/**
	* PBKDF2-HMAC: RFC 2898 key derivation function
	* @param hash - hash function that would be used e.g. sha256
	* @param password - password from which a derived key is generated
	* @param salt - cryptographic salt
	* @param opts - {c, dkLen} where c is work factor and dkLen is output message size
	* @example
	* const key = pbkdf2(sha256, 'password', 'salt', { dkLen: 32, c: Math.pow(2, 18) });
	*/
	function pbkdf2(hash, password, salt, opts) {
		const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
		let prfW;
		const arr = /* @__PURE__ */ new Uint8Array(4);
		const view = (0, utils_ts_1.createView)(arr);
		const u = new Uint8Array(PRF.outputLen);
		for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
			const Ti = DK.subarray(pos, pos + PRF.outputLen);
			view.setInt32(0, ti, false);
			(prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
			Ti.set(u.subarray(0, Ti.length));
			for (let ui = 1; ui < c; ui++) {
				PRF._cloneInto(prfW).update(u).digestInto(u);
				for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
			}
		}
		return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
	}
	/**
	* PBKDF2-HMAC: RFC 2898 key derivation function. Async version.
	* @example
	* await pbkdf2Async(sha256, 'password', 'salt', { dkLen: 32, c: 500_000 });
	*/
	async function pbkdf2Async(hash, password, salt, opts) {
		const { c, dkLen, asyncTick, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
		let prfW;
		const arr = /* @__PURE__ */ new Uint8Array(4);
		const view = (0, utils_ts_1.createView)(arr);
		const u = new Uint8Array(PRF.outputLen);
		for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
			const Ti = DK.subarray(pos, pos + PRF.outputLen);
			view.setInt32(0, ti, false);
			(prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
			Ti.set(u.subarray(0, Ti.length));
			await (0, utils_ts_1.asyncLoop)(c - 1, asyncTick, () => {
				PRF._cloneInto(prfW).update(u).digestInto(u);
				for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
			});
		}
		return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
	}
}));
//#endregion
//#region node_modules/ox/node_modules/@noble/hashes/scrypt.js
var require_scrypt = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.scrypt = scrypt;
	exports.scryptAsync = scryptAsync;
	/**
	* RFC 7914 Scrypt KDF. Can be used to create a key from password and salt.
	* @module
	*/
	var pbkdf2_ts_1 = require_pbkdf2$1();
	var sha2_ts_1 = require_sha2$1();
	var utils_ts_1 = require_utils$2();
	function XorAndSalsa(prev, pi, input, ii, out, oi) {
		let y00 = prev[pi++] ^ input[ii++], y01 = prev[pi++] ^ input[ii++];
		let y02 = prev[pi++] ^ input[ii++], y03 = prev[pi++] ^ input[ii++];
		let y04 = prev[pi++] ^ input[ii++], y05 = prev[pi++] ^ input[ii++];
		let y06 = prev[pi++] ^ input[ii++], y07 = prev[pi++] ^ input[ii++];
		let y08 = prev[pi++] ^ input[ii++], y09 = prev[pi++] ^ input[ii++];
		let y10 = prev[pi++] ^ input[ii++], y11 = prev[pi++] ^ input[ii++];
		let y12 = prev[pi++] ^ input[ii++], y13 = prev[pi++] ^ input[ii++];
		let y14 = prev[pi++] ^ input[ii++], y15 = prev[pi++] ^ input[ii++];
		let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
		for (let i = 0; i < 8; i += 2) {
			x04 ^= (0, utils_ts_1.rotl)(x00 + x12 | 0, 7);
			x08 ^= (0, utils_ts_1.rotl)(x04 + x00 | 0, 9);
			x12 ^= (0, utils_ts_1.rotl)(x08 + x04 | 0, 13);
			x00 ^= (0, utils_ts_1.rotl)(x12 + x08 | 0, 18);
			x09 ^= (0, utils_ts_1.rotl)(x05 + x01 | 0, 7);
			x13 ^= (0, utils_ts_1.rotl)(x09 + x05 | 0, 9);
			x01 ^= (0, utils_ts_1.rotl)(x13 + x09 | 0, 13);
			x05 ^= (0, utils_ts_1.rotl)(x01 + x13 | 0, 18);
			x14 ^= (0, utils_ts_1.rotl)(x10 + x06 | 0, 7);
			x02 ^= (0, utils_ts_1.rotl)(x14 + x10 | 0, 9);
			x06 ^= (0, utils_ts_1.rotl)(x02 + x14 | 0, 13);
			x10 ^= (0, utils_ts_1.rotl)(x06 + x02 | 0, 18);
			x03 ^= (0, utils_ts_1.rotl)(x15 + x11 | 0, 7);
			x07 ^= (0, utils_ts_1.rotl)(x03 + x15 | 0, 9);
			x11 ^= (0, utils_ts_1.rotl)(x07 + x03 | 0, 13);
			x15 ^= (0, utils_ts_1.rotl)(x11 + x07 | 0, 18);
			x01 ^= (0, utils_ts_1.rotl)(x00 + x03 | 0, 7);
			x02 ^= (0, utils_ts_1.rotl)(x01 + x00 | 0, 9);
			x03 ^= (0, utils_ts_1.rotl)(x02 + x01 | 0, 13);
			x00 ^= (0, utils_ts_1.rotl)(x03 + x02 | 0, 18);
			x06 ^= (0, utils_ts_1.rotl)(x05 + x04 | 0, 7);
			x07 ^= (0, utils_ts_1.rotl)(x06 + x05 | 0, 9);
			x04 ^= (0, utils_ts_1.rotl)(x07 + x06 | 0, 13);
			x05 ^= (0, utils_ts_1.rotl)(x04 + x07 | 0, 18);
			x11 ^= (0, utils_ts_1.rotl)(x10 + x09 | 0, 7);
			x08 ^= (0, utils_ts_1.rotl)(x11 + x10 | 0, 9);
			x09 ^= (0, utils_ts_1.rotl)(x08 + x11 | 0, 13);
			x10 ^= (0, utils_ts_1.rotl)(x09 + x08 | 0, 18);
			x12 ^= (0, utils_ts_1.rotl)(x15 + x14 | 0, 7);
			x13 ^= (0, utils_ts_1.rotl)(x12 + x15 | 0, 9);
			x14 ^= (0, utils_ts_1.rotl)(x13 + x12 | 0, 13);
			x15 ^= (0, utils_ts_1.rotl)(x14 + x13 | 0, 18);
		}
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
	function BlockMix(input, ii, out, oi, r) {
		let head = oi + 0;
		let tail = oi + 16 * r;
		for (let i = 0; i < 16; i++) out[tail + i] = input[ii + (2 * r - 1) * 16 + i];
		for (let i = 0; i < r; i++, head += 16, ii += 16) {
			XorAndSalsa(out, tail, input, ii, out, head);
			if (i > 0) tail += 16;
			XorAndSalsa(out, head, input, ii += 16, out, tail);
		}
	}
	function scryptInit(password, salt, _opts) {
		const { N, r, p, dkLen, asyncTick, maxmem, onProgress } = (0, utils_ts_1.checkOpts)({
			dkLen: 32,
			asyncTick: 10,
			maxmem: 1024 ** 3 + 1024
		}, _opts);
		(0, utils_ts_1.anumber)(N);
		(0, utils_ts_1.anumber)(r);
		(0, utils_ts_1.anumber)(p);
		(0, utils_ts_1.anumber)(dkLen);
		(0, utils_ts_1.anumber)(asyncTick);
		(0, utils_ts_1.anumber)(maxmem);
		if (onProgress !== void 0 && typeof onProgress !== "function") throw new Error("progressCb should be function");
		const blockSize = 128 * r;
		const blockSize32 = blockSize / 4;
		const pow32 = Math.pow(2, 32);
		if (N <= 1 || (N & N - 1) !== 0 || N > pow32) throw new Error("Scrypt: N must be larger than 1, a power of 2, and less than 2^32");
		if (p < 0 || p > (pow32 - 1) * 32 / blockSize) throw new Error("Scrypt: p must be a positive integer less than or equal to ((2^32 - 1) * 32) / (128 * r)");
		if (dkLen < 0 || dkLen > (pow32 - 1) * 32) throw new Error("Scrypt: dkLen should be positive integer less than or equal to (2^32 - 1) * 32");
		if (blockSize * (N + p) > maxmem) throw new Error("Scrypt: memused is bigger than maxMem. Expected 128 * r * (N + p) > maxmem of " + maxmem);
		const B = (0, pbkdf2_ts_1.pbkdf2)(sha2_ts_1.sha256, password, salt, {
			c: 1,
			dkLen: blockSize * p
		});
		const B32 = (0, utils_ts_1.u32)(B);
		const V = (0, utils_ts_1.u32)(new Uint8Array(blockSize * N));
		const tmp = (0, utils_ts_1.u32)(new Uint8Array(blockSize));
		let blockMixCb = () => {};
		if (onProgress) {
			const totalBlockMix = 2 * N * p;
			const callbackPer = Math.max(Math.floor(totalBlockMix / 1e4), 1);
			let blockMixCnt = 0;
			blockMixCb = () => {
				blockMixCnt++;
				if (onProgress && (!(blockMixCnt % callbackPer) || blockMixCnt === totalBlockMix)) onProgress(blockMixCnt / totalBlockMix);
			};
		}
		return {
			N,
			r,
			p,
			dkLen,
			blockSize32,
			V,
			B32,
			B,
			tmp,
			blockMixCb,
			asyncTick
		};
	}
	function scryptOutput(password, dkLen, B, V, tmp) {
		const res = (0, pbkdf2_ts_1.pbkdf2)(sha2_ts_1.sha256, password, B, {
			c: 1,
			dkLen
		});
		(0, utils_ts_1.clean)(B, V, tmp);
		return res;
	}
	/**
	* Scrypt KDF from RFC 7914.
	* @param password - pass
	* @param salt - salt
	* @param opts - parameters
	* - `N` is cpu/mem work factor (power of 2 e.g. 2**18)
	* - `r` is block size (8 is common), fine-tunes sequential memory read size and performance
	* - `p` is parallelization factor (1 is common)
	* - `dkLen` is output key length in bytes e.g. 32.
	* - `asyncTick` - (default: 10) max time in ms for which async function can block execution
	* - `maxmem` - (default: `1024 ** 3 + 1024` aka 1GB+1KB). A limit that the app could use for scrypt
	* - `onProgress` - callback function that would be executed for progress report
	* @returns Derived key
	* @example
	* scrypt('password', 'salt', { N: 2**18, r: 8, p: 1, dkLen: 32 });
	*/
	function scrypt(password, salt, opts) {
		const { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb } = scryptInit(password, salt, opts);
		(0, utils_ts_1.swap32IfBE)(B32);
		for (let pi = 0; pi < p; pi++) {
			const Pi = blockSize32 * pi;
			for (let i = 0; i < blockSize32; i++) V[i] = B32[Pi + i];
			for (let i = 0, pos = 0; i < N - 1; i++) {
				BlockMix(V, pos, V, pos += blockSize32, r);
				blockMixCb();
			}
			BlockMix(V, (N - 1) * blockSize32, B32, Pi, r);
			blockMixCb();
			for (let i = 0; i < N; i++) {
				const j = B32[Pi + blockSize32 - 16] % N;
				for (let k = 0; k < blockSize32; k++) tmp[k] = B32[Pi + k] ^ V[j * blockSize32 + k];
				BlockMix(tmp, 0, B32, Pi, r);
				blockMixCb();
			}
		}
		(0, utils_ts_1.swap32IfBE)(B32);
		return scryptOutput(password, dkLen, B, V, tmp);
	}
	/**
	* Scrypt KDF from RFC 7914. Async version.
	* @example
	* await scryptAsync('password', 'salt', { N: 2**18, r: 8, p: 1, dkLen: 32 });
	*/
	async function scryptAsync(password, salt, opts) {
		const { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb, asyncTick } = scryptInit(password, salt, opts);
		(0, utils_ts_1.swap32IfBE)(B32);
		for (let pi = 0; pi < p; pi++) {
			const Pi = blockSize32 * pi;
			for (let i = 0; i < blockSize32; i++) V[i] = B32[Pi + i];
			let pos = 0;
			await (0, utils_ts_1.asyncLoop)(N - 1, asyncTick, () => {
				BlockMix(V, pos, V, pos += blockSize32, r);
				blockMixCb();
			});
			BlockMix(V, (N - 1) * blockSize32, B32, Pi, r);
			blockMixCb();
			await (0, utils_ts_1.asyncLoop)(N, asyncTick, () => {
				const j = B32[Pi + blockSize32 - 16] % N;
				for (let k = 0; k < blockSize32; k++) tmp[k] = B32[Pi + k] ^ V[j * blockSize32 + k];
				BlockMix(tmp, 0, B32, Pi, r);
				blockMixCb();
			});
		}
		(0, utils_ts_1.swap32IfBE)(B32);
		return scryptOutput(password, dkLen, B, V, tmp);
	}
}));
//#endregion
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/cryptoNode.js
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
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
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
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/hmac.js
var require_hmac = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac = exports.HMAC = void 0;
	/**
	* HMAC: RFC2104 message authentication code.
	* @module
	*/
	var utils_ts_1 = require_utils();
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
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/pbkdf2.js
var require_pbkdf2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pbkdf2 = pbkdf2;
	exports.pbkdf2Async = pbkdf2Async;
	/**
	* PBKDF (RFC 2898). Can be used to create a key from password and salt.
	* @module
	*/
	var hmac_ts_1 = require_hmac();
	var utils_ts_1 = require_utils();
	function pbkdf2Init(hash, _password, _salt, _opts) {
		(0, utils_ts_1.ahash)(hash);
		const { c, dkLen, asyncTick } = (0, utils_ts_1.checkOpts)({
			dkLen: 32,
			asyncTick: 10
		}, _opts);
		(0, utils_ts_1.anumber)(c);
		(0, utils_ts_1.anumber)(dkLen);
		(0, utils_ts_1.anumber)(asyncTick);
		if (c < 1) throw new Error("iterations (c) should be >= 1");
		const password = (0, utils_ts_1.kdfInputToBytes)(_password);
		const salt = (0, utils_ts_1.kdfInputToBytes)(_salt);
		const DK = new Uint8Array(dkLen);
		const PRF = hmac_ts_1.hmac.create(hash, password);
		return {
			c,
			dkLen,
			asyncTick,
			DK,
			PRF,
			PRFSalt: PRF._cloneInto().update(salt)
		};
	}
	function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
		PRF.destroy();
		PRFSalt.destroy();
		if (prfW) prfW.destroy();
		(0, utils_ts_1.clean)(u);
		return DK;
	}
	/**
	* PBKDF2-HMAC: RFC 2898 key derivation function
	* @param hash - hash function that would be used e.g. sha256
	* @param password - password from which a derived key is generated
	* @param salt - cryptographic salt
	* @param opts - {c, dkLen} where c is work factor and dkLen is output message size
	* @example
	* const key = pbkdf2(sha256, 'password', 'salt', { dkLen: 32, c: Math.pow(2, 18) });
	*/
	function pbkdf2(hash, password, salt, opts) {
		const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
		let prfW;
		const arr = /* @__PURE__ */ new Uint8Array(4);
		const view = (0, utils_ts_1.createView)(arr);
		const u = new Uint8Array(PRF.outputLen);
		for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
			const Ti = DK.subarray(pos, pos + PRF.outputLen);
			view.setInt32(0, ti, false);
			(prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
			Ti.set(u.subarray(0, Ti.length));
			for (let ui = 1; ui < c; ui++) {
				PRF._cloneInto(prfW).update(u).digestInto(u);
				for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
			}
		}
		return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
	}
	/**
	* PBKDF2-HMAC: RFC 2898 key derivation function. Async version.
	* @example
	* await pbkdf2Async(sha256, 'password', 'salt', { dkLen: 32, c: 500_000 });
	*/
	async function pbkdf2Async(hash, password, salt, opts) {
		const { c, dkLen, asyncTick, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
		let prfW;
		const arr = /* @__PURE__ */ new Uint8Array(4);
		const view = (0, utils_ts_1.createView)(arr);
		const u = new Uint8Array(PRF.outputLen);
		for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
			const Ti = DK.subarray(pos, pos + PRF.outputLen);
			view.setInt32(0, ti, false);
			(prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
			Ti.set(u.subarray(0, Ti.length));
			await (0, utils_ts_1.asyncLoop)(c - 1, asyncTick, () => {
				PRF._cloneInto(prfW).update(u).digestInto(u);
				for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
			});
		}
		return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
	}
}));
//#endregion
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/_md.js
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
	var utils_ts_1 = require_utils();
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
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/_u64.js
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
//#region node_modules/@scure/bip39/node_modules/@noble/hashes/sha2.js
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
	var u64 = require__u64();
	var utils_ts_1 = require_utils();
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
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/_blake.js
var require__blake = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BSIGMA = void 0;
	exports.G1s = G1s;
	exports.G2s = G2s;
	/**
	* Internal helpers for blake hash.
	* @module
	*/
	var utils_ts_1 = require_utils$1();
	/**
	* Internal blake variable.
	* For BLAKE2b, the two extra permutations for rounds 10 and 11 are SIGMA[10..11] = SIGMA[0..1].
	*/
	exports.BSIGMA = Uint8Array.from([
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		14,
		10,
		4,
		8,
		9,
		15,
		13,
		6,
		1,
		12,
		0,
		2,
		11,
		7,
		5,
		3,
		11,
		8,
		12,
		0,
		5,
		2,
		15,
		13,
		10,
		14,
		3,
		6,
		7,
		1,
		9,
		4,
		7,
		9,
		3,
		1,
		13,
		12,
		11,
		14,
		2,
		6,
		5,
		10,
		4,
		0,
		15,
		8,
		9,
		0,
		5,
		7,
		2,
		4,
		10,
		15,
		14,
		1,
		11,
		12,
		6,
		8,
		3,
		13,
		2,
		12,
		6,
		10,
		0,
		11,
		8,
		3,
		4,
		13,
		7,
		5,
		15,
		14,
		1,
		9,
		12,
		5,
		1,
		15,
		14,
		13,
		4,
		10,
		0,
		7,
		6,
		3,
		9,
		2,
		8,
		11,
		13,
		11,
		7,
		14,
		12,
		1,
		3,
		9,
		5,
		0,
		15,
		4,
		8,
		6,
		2,
		10,
		6,
		15,
		14,
		9,
		11,
		3,
		0,
		8,
		12,
		2,
		13,
		7,
		1,
		4,
		10,
		5,
		10,
		2,
		8,
		4,
		7,
		6,
		1,
		5,
		15,
		11,
		9,
		14,
		3,
		12,
		13,
		0,
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		14,
		10,
		4,
		8,
		9,
		15,
		13,
		6,
		1,
		12,
		0,
		2,
		11,
		7,
		5,
		3,
		11,
		8,
		12,
		0,
		5,
		2,
		15,
		13,
		10,
		14,
		3,
		6,
		7,
		1,
		9,
		4,
		7,
		9,
		3,
		1,
		13,
		12,
		11,
		14,
		2,
		6,
		5,
		10,
		4,
		0,
		15,
		8,
		9,
		0,
		5,
		7,
		2,
		4,
		10,
		15,
		14,
		1,
		11,
		12,
		6,
		8,
		3,
		13,
		2,
		12,
		6,
		10,
		0,
		11,
		8,
		3,
		4,
		13,
		7,
		5,
		15,
		14,
		1,
		9
	]);
	function G1s(a, b, c, d, x) {
		a = a + b + x | 0;
		d = (0, utils_ts_1.rotr)(d ^ a, 16);
		c = c + d | 0;
		b = (0, utils_ts_1.rotr)(b ^ c, 12);
		return {
			a,
			b,
			c,
			d
		};
	}
	function G2s(a, b, c, d, x) {
		a = a + b + x | 0;
		d = (0, utils_ts_1.rotr)(d ^ a, 8);
		c = c + d | 0;
		b = (0, utils_ts_1.rotr)(b ^ c, 7);
		return {
			a,
			b,
			c,
			d
		};
	}
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/blake2.js
var require_blake2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.blake2s = exports.BLAKE2s = exports.blake2b = exports.BLAKE2b = exports.BLAKE2 = void 0;
	exports.compress = compress;
	/**
	* blake2b (64-bit) & blake2s (8 to 32-bit) hash functions.
	* b could have been faster, but there is no fast u64 in js, so s is 1.5x faster.
	* @module
	*/
	var _blake_ts_1 = require__blake();
	var _md_ts_1 = require__md$3();
	var u64 = require__u64$1();
	var utils_ts_1 = require_utils$1();
	var B2B_IV = /* @__PURE__ */ Uint32Array.from([
		4089235720,
		1779033703,
		2227873595,
		3144134277,
		4271175723,
		1013904242,
		1595750129,
		2773480762,
		2917565137,
		1359893119,
		725511199,
		2600822924,
		4215389547,
		528734635,
		327033209,
		1541459225
	]);
	var BBUF = /* @__PURE__ */ new Uint32Array(32);
	function G1b(a, b, c, d, msg, x) {
		const Xl = msg[x], Xh = msg[x + 1];
		let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
		let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
		let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
		let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
		let ll = u64.add3L(Al, Bl, Xl);
		Ah = u64.add3H(ll, Ah, Bh, Xh);
		Al = ll | 0;
		({Dh, Dl} = {
			Dh: Dh ^ Ah,
			Dl: Dl ^ Al
		});
		({Dh, Dl} = {
			Dh: u64.rotr32H(Dh, Dl),
			Dl: u64.rotr32L(Dh, Dl)
		});
		({h: Ch, l: Cl} = u64.add(Ch, Cl, Dh, Dl));
		({Bh, Bl} = {
			Bh: Bh ^ Ch,
			Bl: Bl ^ Cl
		});
		({Bh, Bl} = {
			Bh: u64.rotrSH(Bh, Bl, 24),
			Bl: u64.rotrSL(Bh, Bl, 24)
		});
		BBUF[2 * a] = Al, BBUF[2 * a + 1] = Ah;
		BBUF[2 * b] = Bl, BBUF[2 * b + 1] = Bh;
		BBUF[2 * c] = Cl, BBUF[2 * c + 1] = Ch;
		BBUF[2 * d] = Dl, BBUF[2 * d + 1] = Dh;
	}
	function G2b(a, b, c, d, msg, x) {
		const Xl = msg[x], Xh = msg[x + 1];
		let Al = BBUF[2 * a], Ah = BBUF[2 * a + 1];
		let Bl = BBUF[2 * b], Bh = BBUF[2 * b + 1];
		let Cl = BBUF[2 * c], Ch = BBUF[2 * c + 1];
		let Dl = BBUF[2 * d], Dh = BBUF[2 * d + 1];
		let ll = u64.add3L(Al, Bl, Xl);
		Ah = u64.add3H(ll, Ah, Bh, Xh);
		Al = ll | 0;
		({Dh, Dl} = {
			Dh: Dh ^ Ah,
			Dl: Dl ^ Al
		});
		({Dh, Dl} = {
			Dh: u64.rotrSH(Dh, Dl, 16),
			Dl: u64.rotrSL(Dh, Dl, 16)
		});
		({h: Ch, l: Cl} = u64.add(Ch, Cl, Dh, Dl));
		({Bh, Bl} = {
			Bh: Bh ^ Ch,
			Bl: Bl ^ Cl
		});
		({Bh, Bl} = {
			Bh: u64.rotrBH(Bh, Bl, 63),
			Bl: u64.rotrBL(Bh, Bl, 63)
		});
		BBUF[2 * a] = Al, BBUF[2 * a + 1] = Ah;
		BBUF[2 * b] = Bl, BBUF[2 * b + 1] = Bh;
		BBUF[2 * c] = Cl, BBUF[2 * c + 1] = Ch;
		BBUF[2 * d] = Dl, BBUF[2 * d + 1] = Dh;
	}
	function checkBlake2Opts(outputLen, opts = {}, keyLen, saltLen, persLen) {
		(0, utils_ts_1.anumber)(keyLen);
		if (outputLen < 0 || outputLen > keyLen) throw new Error("outputLen bigger than keyLen");
		const { key, salt, personalization } = opts;
		if (key !== void 0 && (key.length < 1 || key.length > keyLen)) throw new Error("key length must be undefined or 1.." + keyLen);
		if (salt !== void 0 && salt.length !== saltLen) throw new Error("salt must be undefined or " + saltLen);
		if (personalization !== void 0 && personalization.length !== persLen) throw new Error("personalization must be undefined or " + persLen);
	}
	/** Class, from which others are subclassed. */
	var BLAKE2 = class extends utils_ts_1.Hash {
		constructor(blockLen, outputLen) {
			super();
			this.finished = false;
			this.destroyed = false;
			this.length = 0;
			this.pos = 0;
			(0, utils_ts_1.anumber)(blockLen);
			(0, utils_ts_1.anumber)(outputLen);
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.buffer = new Uint8Array(blockLen);
			this.buffer32 = (0, utils_ts_1.u32)(this.buffer);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { blockLen, buffer, buffer32 } = this;
			const len = data.length;
			const offset = data.byteOffset;
			const buf = data.buffer;
			for (let pos = 0; pos < len;) {
				if (this.pos === blockLen) {
					(0, utils_ts_1.swap32IfBE)(buffer32);
					this.compress(buffer32, 0, false);
					(0, utils_ts_1.swap32IfBE)(buffer32);
					this.pos = 0;
				}
				const take = Math.min(blockLen - this.pos, len - pos);
				const dataOffset = offset + pos;
				if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
					const data32 = new Uint32Array(buf, dataOffset, Math.floor((len - pos) / 4));
					(0, utils_ts_1.swap32IfBE)(data32);
					for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
						this.length += blockLen;
						this.compress(data32, pos32, false);
					}
					(0, utils_ts_1.swap32IfBE)(data32);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				this.length += take;
				pos += take;
			}
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			const { pos, buffer32 } = this;
			this.finished = true;
			(0, utils_ts_1.clean)(this.buffer.subarray(pos));
			(0, utils_ts_1.swap32IfBE)(buffer32);
			this.compress(buffer32, 0, true);
			(0, utils_ts_1.swap32IfBE)(buffer32);
			const out32 = (0, utils_ts_1.u32)(out);
			this.get().forEach((v, i) => out32[i] = (0, utils_ts_1.swap8IfBE)(v));
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			const { buffer, length, finished, destroyed, outputLen, pos } = this;
			to || (to = new this.constructor({ dkLen: outputLen }));
			to.set(...this.get());
			to.buffer.set(buffer);
			to.destroyed = destroyed;
			to.finished = finished;
			to.length = length;
			to.pos = pos;
			to.outputLen = outputLen;
			return to;
		}
		clone() {
			return this._cloneInto();
		}
	};
	exports.BLAKE2 = BLAKE2;
	var BLAKE2b = class extends BLAKE2 {
		constructor(opts = {}) {
			const olen = opts.dkLen === void 0 ? 64 : opts.dkLen;
			super(128, olen);
			this.v0l = B2B_IV[0] | 0;
			this.v0h = B2B_IV[1] | 0;
			this.v1l = B2B_IV[2] | 0;
			this.v1h = B2B_IV[3] | 0;
			this.v2l = B2B_IV[4] | 0;
			this.v2h = B2B_IV[5] | 0;
			this.v3l = B2B_IV[6] | 0;
			this.v3h = B2B_IV[7] | 0;
			this.v4l = B2B_IV[8] | 0;
			this.v4h = B2B_IV[9] | 0;
			this.v5l = B2B_IV[10] | 0;
			this.v5h = B2B_IV[11] | 0;
			this.v6l = B2B_IV[12] | 0;
			this.v6h = B2B_IV[13] | 0;
			this.v7l = B2B_IV[14] | 0;
			this.v7h = B2B_IV[15] | 0;
			checkBlake2Opts(olen, opts, 64, 16, 16);
			let { key, personalization, salt } = opts;
			let keyLength = 0;
			if (key !== void 0) {
				key = (0, utils_ts_1.toBytes)(key);
				keyLength = key.length;
			}
			this.v0l ^= this.outputLen | keyLength << 8 | 16842752;
			if (salt !== void 0) {
				salt = (0, utils_ts_1.toBytes)(salt);
				const slt = (0, utils_ts_1.u32)(salt);
				this.v4l ^= (0, utils_ts_1.swap8IfBE)(slt[0]);
				this.v4h ^= (0, utils_ts_1.swap8IfBE)(slt[1]);
				this.v5l ^= (0, utils_ts_1.swap8IfBE)(slt[2]);
				this.v5h ^= (0, utils_ts_1.swap8IfBE)(slt[3]);
			}
			if (personalization !== void 0) {
				personalization = (0, utils_ts_1.toBytes)(personalization);
				const pers = (0, utils_ts_1.u32)(personalization);
				this.v6l ^= (0, utils_ts_1.swap8IfBE)(pers[0]);
				this.v6h ^= (0, utils_ts_1.swap8IfBE)(pers[1]);
				this.v7l ^= (0, utils_ts_1.swap8IfBE)(pers[2]);
				this.v7h ^= (0, utils_ts_1.swap8IfBE)(pers[3]);
			}
			if (key !== void 0) {
				const tmp = new Uint8Array(this.blockLen);
				tmp.set(key);
				this.update(tmp);
			}
		}
		get() {
			let { v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h } = this;
			return [
				v0l,
				v0h,
				v1l,
				v1h,
				v2l,
				v2h,
				v3l,
				v3h,
				v4l,
				v4h,
				v5l,
				v5h,
				v6l,
				v6h,
				v7l,
				v7h
			];
		}
		set(v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h) {
			this.v0l = v0l | 0;
			this.v0h = v0h | 0;
			this.v1l = v1l | 0;
			this.v1h = v1h | 0;
			this.v2l = v2l | 0;
			this.v2h = v2h | 0;
			this.v3l = v3l | 0;
			this.v3h = v3h | 0;
			this.v4l = v4l | 0;
			this.v4h = v4h | 0;
			this.v5l = v5l | 0;
			this.v5h = v5h | 0;
			this.v6l = v6l | 0;
			this.v6h = v6h | 0;
			this.v7l = v7l | 0;
			this.v7h = v7h | 0;
		}
		compress(msg, offset, isLast) {
			this.get().forEach((v, i) => BBUF[i] = v);
			BBUF.set(B2B_IV, 16);
			let { h, l } = u64.fromBig(BigInt(this.length));
			BBUF[24] = B2B_IV[8] ^ l;
			BBUF[25] = B2B_IV[9] ^ h;
			if (isLast) {
				BBUF[28] = ~BBUF[28];
				BBUF[29] = ~BBUF[29];
			}
			let j = 0;
			const s = _blake_ts_1.BSIGMA;
			for (let i = 0; i < 12; i++) {
				G1b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
				G2b(0, 4, 8, 12, msg, offset + 2 * s[j++]);
				G1b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
				G2b(1, 5, 9, 13, msg, offset + 2 * s[j++]);
				G1b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
				G2b(2, 6, 10, 14, msg, offset + 2 * s[j++]);
				G1b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
				G2b(3, 7, 11, 15, msg, offset + 2 * s[j++]);
				G1b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
				G2b(0, 5, 10, 15, msg, offset + 2 * s[j++]);
				G1b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
				G2b(1, 6, 11, 12, msg, offset + 2 * s[j++]);
				G1b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
				G2b(2, 7, 8, 13, msg, offset + 2 * s[j++]);
				G1b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
				G2b(3, 4, 9, 14, msg, offset + 2 * s[j++]);
			}
			this.v0l ^= BBUF[0] ^ BBUF[16];
			this.v0h ^= BBUF[1] ^ BBUF[17];
			this.v1l ^= BBUF[2] ^ BBUF[18];
			this.v1h ^= BBUF[3] ^ BBUF[19];
			this.v2l ^= BBUF[4] ^ BBUF[20];
			this.v2h ^= BBUF[5] ^ BBUF[21];
			this.v3l ^= BBUF[6] ^ BBUF[22];
			this.v3h ^= BBUF[7] ^ BBUF[23];
			this.v4l ^= BBUF[8] ^ BBUF[24];
			this.v4h ^= BBUF[9] ^ BBUF[25];
			this.v5l ^= BBUF[10] ^ BBUF[26];
			this.v5h ^= BBUF[11] ^ BBUF[27];
			this.v6l ^= BBUF[12] ^ BBUF[28];
			this.v6h ^= BBUF[13] ^ BBUF[29];
			this.v7l ^= BBUF[14] ^ BBUF[30];
			this.v7h ^= BBUF[15] ^ BBUF[31];
			(0, utils_ts_1.clean)(BBUF);
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer32);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.BLAKE2b = BLAKE2b;
	/**
	* Blake2b hash function. 64-bit. 1.5x slower than blake2s in JS.
	* @param msg - message that would be hashed
	* @param opts - dkLen output length, key for MAC mode, salt, personalization
	*/
	exports.blake2b = (0, utils_ts_1.createOptHasher)((opts) => new BLAKE2b(opts));
	function compress(s, offset, msg, rounds, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
		let j = 0;
		for (let i = 0; i < rounds; i++) {
			({a: v0, b: v4, c: v8, d: v12} = (0, _blake_ts_1.G1s)(v0, v4, v8, v12, msg[offset + s[j++]]));
			({a: v0, b: v4, c: v8, d: v12} = (0, _blake_ts_1.G2s)(v0, v4, v8, v12, msg[offset + s[j++]]));
			({a: v1, b: v5, c: v9, d: v13} = (0, _blake_ts_1.G1s)(v1, v5, v9, v13, msg[offset + s[j++]]));
			({a: v1, b: v5, c: v9, d: v13} = (0, _blake_ts_1.G2s)(v1, v5, v9, v13, msg[offset + s[j++]]));
			({a: v2, b: v6, c: v10, d: v14} = (0, _blake_ts_1.G1s)(v2, v6, v10, v14, msg[offset + s[j++]]));
			({a: v2, b: v6, c: v10, d: v14} = (0, _blake_ts_1.G2s)(v2, v6, v10, v14, msg[offset + s[j++]]));
			({a: v3, b: v7, c: v11, d: v15} = (0, _blake_ts_1.G1s)(v3, v7, v11, v15, msg[offset + s[j++]]));
			({a: v3, b: v7, c: v11, d: v15} = (0, _blake_ts_1.G2s)(v3, v7, v11, v15, msg[offset + s[j++]]));
			({a: v0, b: v5, c: v10, d: v15} = (0, _blake_ts_1.G1s)(v0, v5, v10, v15, msg[offset + s[j++]]));
			({a: v0, b: v5, c: v10, d: v15} = (0, _blake_ts_1.G2s)(v0, v5, v10, v15, msg[offset + s[j++]]));
			({a: v1, b: v6, c: v11, d: v12} = (0, _blake_ts_1.G1s)(v1, v6, v11, v12, msg[offset + s[j++]]));
			({a: v1, b: v6, c: v11, d: v12} = (0, _blake_ts_1.G2s)(v1, v6, v11, v12, msg[offset + s[j++]]));
			({a: v2, b: v7, c: v8, d: v13} = (0, _blake_ts_1.G1s)(v2, v7, v8, v13, msg[offset + s[j++]]));
			({a: v2, b: v7, c: v8, d: v13} = (0, _blake_ts_1.G2s)(v2, v7, v8, v13, msg[offset + s[j++]]));
			({a: v3, b: v4, c: v9, d: v14} = (0, _blake_ts_1.G1s)(v3, v4, v9, v14, msg[offset + s[j++]]));
			({a: v3, b: v4, c: v9, d: v14} = (0, _blake_ts_1.G2s)(v3, v4, v9, v14, msg[offset + s[j++]]));
		}
		return {
			v0,
			v1,
			v2,
			v3,
			v4,
			v5,
			v6,
			v7,
			v8,
			v9,
			v10,
			v11,
			v12,
			v13,
			v14,
			v15
		};
	}
	var B2S_IV = _md_ts_1.SHA256_IV;
	var BLAKE2s = class extends BLAKE2 {
		constructor(opts = {}) {
			const olen = opts.dkLen === void 0 ? 32 : opts.dkLen;
			super(64, olen);
			this.v0 = B2S_IV[0] | 0;
			this.v1 = B2S_IV[1] | 0;
			this.v2 = B2S_IV[2] | 0;
			this.v3 = B2S_IV[3] | 0;
			this.v4 = B2S_IV[4] | 0;
			this.v5 = B2S_IV[5] | 0;
			this.v6 = B2S_IV[6] | 0;
			this.v7 = B2S_IV[7] | 0;
			checkBlake2Opts(olen, opts, 32, 8, 8);
			let { key, personalization, salt } = opts;
			let keyLength = 0;
			if (key !== void 0) {
				key = (0, utils_ts_1.toBytes)(key);
				keyLength = key.length;
			}
			this.v0 ^= this.outputLen | keyLength << 8 | 16842752;
			if (salt !== void 0) {
				salt = (0, utils_ts_1.toBytes)(salt);
				const slt = (0, utils_ts_1.u32)(salt);
				this.v4 ^= (0, utils_ts_1.swap8IfBE)(slt[0]);
				this.v5 ^= (0, utils_ts_1.swap8IfBE)(slt[1]);
			}
			if (personalization !== void 0) {
				personalization = (0, utils_ts_1.toBytes)(personalization);
				const pers = (0, utils_ts_1.u32)(personalization);
				this.v6 ^= (0, utils_ts_1.swap8IfBE)(pers[0]);
				this.v7 ^= (0, utils_ts_1.swap8IfBE)(pers[1]);
			}
			if (key !== void 0) {
				(0, utils_ts_1.abytes)(key);
				const tmp = new Uint8Array(this.blockLen);
				tmp.set(key);
				this.update(tmp);
			}
		}
		get() {
			const { v0, v1, v2, v3, v4, v5, v6, v7 } = this;
			return [
				v0,
				v1,
				v2,
				v3,
				v4,
				v5,
				v6,
				v7
			];
		}
		set(v0, v1, v2, v3, v4, v5, v6, v7) {
			this.v0 = v0 | 0;
			this.v1 = v1 | 0;
			this.v2 = v2 | 0;
			this.v3 = v3 | 0;
			this.v4 = v4 | 0;
			this.v5 = v5 | 0;
			this.v6 = v6 | 0;
			this.v7 = v7 | 0;
		}
		compress(msg, offset, isLast) {
			const { h, l } = u64.fromBig(BigInt(this.length));
			const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 } = compress(_blake_ts_1.BSIGMA, offset, msg, 10, this.v0, this.v1, this.v2, this.v3, this.v4, this.v5, this.v6, this.v7, B2S_IV[0], B2S_IV[1], B2S_IV[2], B2S_IV[3], l ^ B2S_IV[4], h ^ B2S_IV[5], isLast ? ~B2S_IV[6] : B2S_IV[6], B2S_IV[7]);
			this.v0 ^= v0 ^ v8;
			this.v1 ^= v1 ^ v9;
			this.v2 ^= v2 ^ v10;
			this.v3 ^= v3 ^ v11;
			this.v4 ^= v4 ^ v12;
			this.v5 ^= v5 ^ v13;
			this.v6 ^= v6 ^ v14;
			this.v7 ^= v7 ^ v15;
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer32);
			this.set(0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.BLAKE2s = BLAKE2s;
	/**
	* Blake2s hash function. Focuses on 8-bit to 32-bit platforms. 1.5x faster than blake2b in JS.
	* @param msg - message that would be hashed
	* @param opts - dkLen output length, key for MAC mode, salt, personalization
	*/
	exports.blake2s = (0, utils_ts_1.createOptHasher)((opts) => new BLAKE2s(opts));
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/hkdf.js
var require_hkdf = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hkdf = void 0;
	exports.extract = extract;
	exports.expand = expand;
	/**
	* HKDF (RFC 5869): extract + expand in one step.
	* See https://soatok.blog/2021/11/17/understanding-hkdf/.
	* @module
	*/
	var hmac_ts_1 = require_hmac$2();
	var utils_ts_1 = require_utils$1();
	/**
	* HKDF-extract from spec. Less important part. `HKDF-Extract(IKM, salt) -> PRK`
	* Arguments position differs from spec (IKM is first one, since it is not optional)
	* @param hash - hash function that would be used (e.g. sha256)
	* @param ikm - input keying material, the initial key
	* @param salt - optional salt value (a non-secret random value)
	*/
	function extract(hash, ikm, salt) {
		(0, utils_ts_1.ahash)(hash);
		if (salt === void 0) salt = new Uint8Array(hash.outputLen);
		return (0, hmac_ts_1.hmac)(hash, (0, utils_ts_1.toBytes)(salt), (0, utils_ts_1.toBytes)(ikm));
	}
	var HKDF_COUNTER = /* @__PURE__ */ Uint8Array.from([0]);
	var EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
	/**
	* HKDF-expand from the spec. The most important part. `HKDF-Expand(PRK, info, L) -> OKM`
	* @param hash - hash function that would be used (e.g. sha256)
	* @param prk - a pseudorandom key of at least HashLen octets (usually, the output from the extract step)
	* @param info - optional context and application specific information (can be a zero-length string)
	* @param length - length of output keying material in bytes
	*/
	function expand(hash, prk, info, length = 32) {
		(0, utils_ts_1.ahash)(hash);
		(0, utils_ts_1.anumber)(length);
		const olen = hash.outputLen;
		if (length > 255 * olen) throw new Error("Length should be <= 255*HashLen");
		const blocks = Math.ceil(length / olen);
		if (info === void 0) info = EMPTY_BUFFER;
		const okm = new Uint8Array(blocks * olen);
		const HMAC = hmac_ts_1.hmac.create(hash, prk);
		const HMACTmp = HMAC._cloneInto();
		const T = new Uint8Array(HMAC.outputLen);
		for (let counter = 0; counter < blocks; counter++) {
			HKDF_COUNTER[0] = counter + 1;
			HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
			okm.set(T, olen * counter);
			HMAC._cloneInto(HMACTmp);
		}
		HMAC.destroy();
		HMACTmp.destroy();
		(0, utils_ts_1.clean)(T, HKDF_COUNTER);
		return okm.slice(0, length);
	}
	/**
	* HKDF (RFC 5869): derive keys from an initial input.
	* Combines hkdf_extract + hkdf_expand in one step
	* @param hash - hash function that would be used (e.g. sha256)
	* @param ikm - input keying material, the initial key
	* @param salt - optional salt value (a non-secret random value)
	* @param info - optional context and application specific information (can be a zero-length string)
	* @param length - length of output keying material in bytes
	* @example
	* import { hkdf } from '@noble/hashes/hkdf';
	* import { sha256 } from '@noble/hashes/sha2';
	* import { randomBytes } from '@noble/hashes/utils';
	* const inputKey = randomBytes(32);
	* const salt = randomBytes(32);
	* const info = 'application-key';
	* const hk1 = hkdf(sha256, inputKey, salt, info, 32);
	*/
	var hkdf = (hash, ikm, salt, info, length) => expand(hash, extract(hash, ikm, salt), info, length);
	exports.hkdf = hkdf;
}));
//#endregion
//#region node_modules/@walletconnect/utils/node_modules/@noble/hashes/sha256.js
var require_sha256 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha224 = exports.SHA224 = exports.sha256 = exports.SHA256 = void 0;
	/**
	* SHA2-256 a.k.a. sha256. In JS, it is the fastest hash, even faster than Blake3.
	*
	* To break sha256 using birthday attack, attackers need to try 2^128 hashes.
	* BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
	*
	* Check out [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
	* @module
	* @deprecated
	*/
	var sha2_ts_1 = require_sha2$2();
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.SHA256 = sha2_ts_1.SHA256;
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.sha256 = sha2_ts_1.sha256;
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.SHA224 = sha2_ts_1.SHA224;
	/** @deprecated Use import from `noble/hashes/sha2` module */
	exports.sha224 = sha2_ts_1.sha224;
}));
//#endregion
export { require_pbkdf2 as a, require_pbkdf2$1 as c, require_sha256$1 as d, require_sha3 as f, require_sha2 as i, require_legacy as l, require_sha3$1 as m, require_hkdf as n, require_utils as o, require_ripemd160 as p, require_blake2 as r, require_scrypt as s, require_sha256 as t, require_blake3 as u };
