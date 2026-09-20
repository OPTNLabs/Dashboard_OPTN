//#region node_modules/@bitauth/libauth/build/lib/format/error.js
/**
* A simple method used throughout Libauth to format error messages. By
* formatting errors this way, downstream consumers can detect specific error
* types by matching the `errorType`. For example, the error:
*
* ```ts
* formatError(SomeTypeOfError.exceedsMaximum, `Provided value: ${value}`);
* ```
*
* Can be detected with `String.includes()`, even if the
* `SomeTypeOfError.exceedsMaximum` error message changes:
* ```ts
* error.includes(SomeTypeOfError.exceedsMaximum);
* // => true
* ```
*
* Using this method ensures consistency across the library.
*
* @remarks
* In Libauth, expected errors use the type `string` rather than `Error` (or
* other objects that inherit from `Error`) to simplify the resulting types and
* typechecking requirements. This ensures consistency of returned errors in all
* environments, avoids exposing internal details like stack traces and line
* numbers, and allows error messages to be recorded or used as text without an
* intermediate `toString()` method.
*
* @param errorType - the error enum member representing this error type
* @param errorDetails - optional, additional details to include in the error
* message
* @param throwError - if `true`, the function will throw an `Error` rather than
* returning the string (defaults to `false`).
*/
var formatError = (errorType, errorDetails, throwError = false) => {
	const message = `${errorType}${errorDetails === void 0 ? "" : ` ${errorDetails}`}`;
	if (throwError) throw new Error(message);
	return message;
};
/**
*
* @param value - the unexpected value
* @param message - an optional error message
*/
var unknownValue = (value, message = `Received an unknown value; this should have been caught by TypeScript - are your types correct?`) => formatError(message, String(value), true);
/**
* A utility to handle error results by throwing an `Error` object.
*
* If the provided value is of type `string`, the contents of the string are
* thrown as a new `Error`, otherwise, the value is returned unmodified.
*
* This method is useful for eliminating `string` as a possible type from a
* resulting value, particularly in places where an error is never expected to
* occur in practice (i.e. no user or runtime input is involved), e.g.:
*
* ```ts
* import { assertSuccess, decodeCashAddress, binToHex } from '@bitauth/libauth';
* const address = 'bitcoincash:zq2azmyyv6dtgczexyalqar70q036yund5j2mspghf';
*
* // Might be either a string or a decoded address:
* const decoded = decodeCashAddress(address);
* // Now guaranteed to be a decoded address (error messages are thrown):
* const tokenAddress = assertSuccess(decoded);
* // The result can be used immediately:
* console.log(binToHex(tokenAddress.payload));
* ```
*
* @param result - A result which might be a string.
* @param expectation - An optional, descriptive prefix for the error message
* thrown in failure cases. By default,
* `Expected a successful result, but encountered an error: `.
*/
var assertSuccess = (result, expectation = "Expected a successful result, but encountered an error: ") => {
	if (typeof result === "string") throw new Error(`${expectation}${result}`);
	return result;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/base-convert.js
var BaseConverterCreationError;
(function(BaseConverterCreationError) {
	BaseConverterCreationError["tooLong"] = "Base converter creation error: an alphabet may be no longer than 254 characters.";
	BaseConverterCreationError["ambiguousCharacter"] = "Base converter creation error: a character code may only appear once in a single alphabet.";
})(BaseConverterCreationError || (BaseConverterCreationError = {}));
var BaseConversionError;
(function(BaseConversionError) {
	BaseConversionError["unknownCharacter"] = "Base conversion error: encountered an unknown character for this alphabet.";
})(BaseConversionError || (BaseConversionError = {}));
/**
* Create a {@link BaseConverter}, exposing methods for encoding and decoding
* `Uint8Array`s using bitcoin-style padding: each leading zero in the input is
* replaced with the zero-index character of the `alphabet`, then the remainder
* of the input is encoded as a large number in the specified alphabet.
*
* For example, using the alphabet `01`, the input `[0, 15]` is encoded `01111`
* – a single `0` represents the leading padding, followed by the base2 encoded
* `0x1111` (15). With the same alphabet, the input `[0, 0, 255]` is encoded
* `0011111111` - only two `0` characters are required to represent both
* leading zeros, followed by the base2 encoded `0x11111111` (255).
*
* **This is not compatible with `RFC 3548`'s `Base16`, `Base32`, or `Base64`.**
*
* If the alphabet is malformed, this method returns the error as a `string`.
*
* @param alphabet - an ordered string that maps each index to a character,
* e.g. `0123456789`.
*/
var createBaseConverter = (alphabet) => {
	const undefinedValue = 255;
	const uint8ArrayBase = 256;
	if (alphabet.length >= undefinedValue) return formatError(BaseConverterCreationError.tooLong, `Alphabet length: ${alphabet.length}`);
	const alphabetMap = new Uint8Array(uint8ArrayBase).fill(undefinedValue);
	for (let index = 0; index < alphabet.length; index++) {
		const characterCode = alphabet.charCodeAt(index);
		if (alphabetMap[characterCode] !== undefinedValue) return formatError(BaseConverterCreationError.ambiguousCharacter, `Ambiguous character: ${alphabetMap[characterCode]}`);
		alphabetMap[characterCode] = index;
	}
	const base = alphabet.length;
	const paddingCharacter = alphabet.charAt(0);
	const factor = Math.log(base) / Math.log(uint8ArrayBase);
	const inverseFactor = Math.log(uint8ArrayBase) / Math.log(base);
	return {
		decode: (input) => {
			if (input.length === 0) return Uint8Array.of();
			const firstNonZeroIndex = input.split("").findIndex((character) => character !== paddingCharacter);
			if (firstNonZeroIndex === -1) return new Uint8Array(input.length);
			const requiredLength = Math.floor((input.length - firstNonZeroIndex) * factor + 1);
			const decoded = new Uint8Array(requiredLength);
			let nextByte = firstNonZeroIndex;
			let remainingBytes = 0;
			while (input[nextByte] !== void 0) {
				let carry = alphabetMap[input.charCodeAt(nextByte)];
				if (carry === undefinedValue) return formatError(BaseConversionError.unknownCharacter, `Unknown character: "${input[nextByte]}".`);
				let digit = 0;
				for (let steps = requiredLength - 1; (carry !== 0 || digit < remainingBytes) && steps !== -1; steps--, digit++) {
					carry += Math.floor(base * decoded[steps]);
					decoded[steps] = Math.floor(carry % uint8ArrayBase);
					carry = Math.floor(carry / uint8ArrayBase);
				}
				remainingBytes = digit;
				nextByte++;
			}
			const firstNonZeroResultDigit = decoded.findIndex((value) => value !== 0);
			const bin = new Uint8Array(firstNonZeroIndex + (requiredLength - firstNonZeroResultDigit));
			bin.set(decoded.slice(firstNonZeroResultDigit), firstNonZeroIndex);
			return bin;
		},
		encode: (input) => {
			if (input.length === 0) return "";
			const firstNonZeroIndex = input.findIndex((byte) => byte !== 0);
			if (firstNonZeroIndex === -1) return paddingCharacter.repeat(input.length);
			const requiredLength = Math.floor((input.length - firstNonZeroIndex) * inverseFactor + 1);
			const encoded = new Uint8Array(requiredLength);
			let nextByte = firstNonZeroIndex;
			let remainingBytes = 0;
			while (nextByte !== input.length) {
				let carry = input[nextByte];
				let digit = 0;
				for (let steps = requiredLength - 1; (carry !== 0 || digit < remainingBytes) && steps !== -1; steps--, digit++) {
					carry += Math.floor(uint8ArrayBase * encoded[steps]);
					encoded[steps] = Math.floor(carry % base);
					carry = Math.floor(carry / base);
				}
				remainingBytes = digit;
				nextByte++;
			}
			const firstNonZeroResultDigit = encoded.findIndex((value) => value !== 0);
			const padding = paddingCharacter.repeat(firstNonZeroIndex);
			return encoded.slice(firstNonZeroResultDigit).reduce((all, digit) => all + alphabet.charAt(digit), padding);
		}
	};
};
var base58 = createBaseConverter("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
/**
* Convert a bitcoin-style base58-encoded string to a Uint8Array.
*
* For the reverse, see {@link binToBase58}.
*
* See {@link createBaseConverter} for format details.
* @param input - a valid base58-encoded string to decode
*/
var base58ToBin = base58.decode;
/**
* Convert a Uint8Array to a bitcoin-style base58-encoded string.
*
* For the reverse, see {@link base58ToBin}.
*
* See {@link createBaseConverter} for format details.
* @param input - the Uint8Array to base58 encode
*/
var binToBase58 = base58.encode;
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/base64.js
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
new RegExp(`[^${chars}=]`, "u");
/**
* Convert a base64-encoded string to a Uint8Array.
*
* Note, this method always completes. If `validBase64` is not valid base64, an
* incorrect result will be returned. If `validBase64` is potentially malformed,
* check it with {@link isBase64} before calling this method.
*
* For the reverse, see {@link binToBase64}.
*
* @param validBase64 - a valid base64-encoded string to decode
*/
var base64ToBin = (validBase64) => {
	const lookup = /* @__PURE__ */ new Uint8Array(123);
	for (let i = 0; i < 64; i++) lookup[chars.charCodeAt(i)] = i;
	const bufferLengthEstimate = validBase64.length * .75;
	const stringLength = validBase64.length;
	const bufferLength = validBase64[validBase64.length - 1] === "=" ? validBase64[validBase64.length - 2] === "=" ? bufferLengthEstimate - 2 : bufferLengthEstimate - 1 : bufferLengthEstimate;
	const buffer = new ArrayBuffer(bufferLength);
	const bytes = new Uint8Array(buffer);
	let p = 0;
	for (let i = 0; i < stringLength; i += 4) {
		const encoded1 = lookup[validBase64.charCodeAt(i)];
		const encoded2 = lookup[validBase64.charCodeAt(i + 1)];
		const encoded3 = lookup[validBase64.charCodeAt(i + 2)];
		const encoded4 = lookup[validBase64.charCodeAt(i + 3)];
		bytes[p++] = encoded1 << 2 | encoded2 >> 4;
		bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
		bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	}
	return bytes;
};
/**
* Convert a Uint8Array to a base64-encoded string.
*
* For the reverse, see {@link base64ToBin}.
*
* @param bytes - the Uint8Array to base64 encode
*/
var binToBase64 = (bytes) => {
	let result = "";
	for (let i = 0; i < bytes.length; i += 3) {
		result += chars[bytes[i] >> 2];
		result += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
		result += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
		result += chars[bytes[i + 2] & 63];
	}
	return bytes.length % 3 === 2 ? `${result.substring(0, result.length - 1)}=` : bytes.length % 3 === 1 ? `${result.substring(0, result.length - 2)}==` : result;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/hex.js
/**
* Returns an array of incrementing values starting at `begin` and incrementing
* by one for `length`.
*
* E.g.: `range(3)` → `[0, 1, 2]` and `range(3, 1)` → `[1, 2, 3]`
*
* @param length - the number of elements in the array
* @param begin - the index at which the range starts (default: `0`)
*/
var range = (length, begin = 0) => Array.from({ length }, (_, index) => begin + index);
/**
* Split a string into an array of `chunkLength` strings. The final string may
* have a length between 1 and `chunkLength`.
*
* E.g.: `splitEvery('abcde', 2)` → `['ab', 'cd', 'e']`
*/
var splitEvery = (input, chunkLength) => range(Math.ceil(input.length / chunkLength)).map((index) => index * chunkLength).map((begin) => input.slice(begin, begin + chunkLength));
var hexByteWidth = 2;
var hexadecimal = 16;
/**
* Decode a hexadecimal-encoded string into a Uint8Array.
*
* E.g.: `hexToBin('2a64ff')` → `new Uint8Array([42, 100, 255])`
*
* Note, this method always completes. If `validHex` is not divisible by 2,
* the final byte will be parsed as if it were prepended with a `0` (e.g. `aaa`
* is interpreted as `aa0a`). If `validHex` is potentially malformed, check
* it with {@link isHex} before calling this method.
*
* For the reverse, see {@link binToHex}.
*
* @param validHex - a string of valid, hexadecimal-encoded data
*/
var hexToBin = (validHex) => Uint8Array.from(splitEvery(validHex, hexByteWidth).map((byte) => parseInt(byte, hexadecimal)));
/**
* Encode a Uint8Array into a hexadecimal-encoded string.
*
* E.g.: `binToHex(new Uint8Array([42, 100, 255]))` → `'2a64ff'`
*
* For the reverse, see {@link hexToBin}.
*
* @param bytes - a Uint8Array to encode
*/
var binToHex = (bytes) => bytes.reduce((str, byte) => str + byte.toString(hexadecimal).padStart(hexByteWidth, "0"), "");
/**
* Reduce an array of `Uint8Array`s into a single `Uint8Array`.
* @param array - the array of `Uint8Array`s to flatten
*/
var flattenBinArray = (array) => {
	const totalLength = array.reduce((total, bin) => total + bin.length, 0);
	const flattened = new Uint8Array(totalLength);
	array.reduce((index, bin) => {
		flattened.set(bin, index);
		return index + bin.length;
	}, 0);
	return flattened;
};
/**
* Compare to `Uint8Array`s, return true if their contents are exactly the same,
* otherwise return false.
* @param a - the first Uint8Array
* @param b - the second Uint8Array
*/
var binsAreEqual = (a, b) => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/bin-string.js
var binaryByteWidth = 8;
var binary = 2;
/**
* Decode a binary-encoded string into a Uint8Array.
*
* E.g.: `binStringToBin('0010101001100100')` → `new Uint8Array([42, 100])`
*
* Note, this method always completes. If `binaryDigits` is not divisible by 8,
* the final byte will be parsed as if it were prepended with `0`s (e.g. `1`
* is interpreted as `00000001`). If `binaryDigits` is potentially malformed,
* check it with `isBinString` before calling this method.
*
* For the reverse, see {@link binToBinString}.
*
* @param binaryDigits - a string of `0`s and `1`s with a length divisible by 8
*/
var binStringToBin = (binaryDigits) => Uint8Array.from(splitEvery(binaryDigits, binaryByteWidth).map((byteString) => parseInt(byteString, binary)));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/number.js
/**
* Fill a new Uint8Array of a specific byte-length with the contents of a given
* Uint8Array, truncating or padding the Uint8Array with zeros.
*
* @param bin - the Uint8Array to resize
* @param bytes - the desired byte-length
*/
var binToFixedLength = (bin, bytes) => {
	const fixedBytes = new Uint8Array(bytes);
	bin.length > bytes ? fixedBytes.fill(255) : fixedBytes.set(bin);
	return fixedBytes;
};
/**
* Encode a positive integer as a 2-byte Uint16LE Uint8Array.
*
* This method will return an incorrect result for values outside of the range
* `0` to `0xffff` (`65535`). If applicable, applications should handle such
* cases prior to calling this method.
*
* For an alternative overflow behavior, see {@link numberToBinUint16LEClamped}.
*
* For the reverse, see {@link binToNumberUint16LE}.
*
* @param value - the number to encode
*/
var numberToBinUint16LE = (value) => {
	const bin = /* @__PURE__ */ new Uint8Array(2);
	new DataView(bin.buffer, bin.byteOffset, bin.byteLength).setUint16(0, value, true);
	return bin;
};
/**
* Encode a positive number as a 4-byte Uint32LE Uint8Array.
*
* This method will return an incorrect result for values outside of the range
* `0` to `0xffffffff` (`4294967295`). If applicable, applications should handle
* such cases prior to calling this method.
*
* For an alternative overflow behavior, see {@link numberToBinUint32LEClamped}.
*
* For the reverse, see {@link binToNumberUint32LE}.
*
* @param value - the number to encode
*/
var numberToBinUint32LE = (value) => {
	const bin = /* @__PURE__ */ new Uint8Array(4);
	new DataView(bin.buffer, bin.byteOffset, bin.byteLength).setUint32(0, value, true);
	return bin;
};
/**
* Encode a positive number as a 4-byte Uint32BE Uint8Array.
*
* This method will return an incorrect result for values outside of the range
* `0` to `0xffffffff` (`4294967295`). If applicable, applications should handle
* such cases prior to calling this method.
*
* For the reverse, reverse the result of {@link binToNumberUint32LE}.
*
* @param value - the number to encode
*/
var numberToBinUint32BE = (value) => {
	const bin = /* @__PURE__ */ new Uint8Array(4);
	new DataView(bin.buffer, bin.byteOffset, bin.byteLength).setUint32(0, value, false);
	return bin;
};
/**
* Encode a positive BigInt as little-endian Uint8Array. Negative values will
* return the same result as `0`.
*
* For the reverse, see {@link binToBigIntUintLE}.
*
* @param value - the number to encode
*/
var bigIntToBinUintLE = (value) => {
	const base = BigInt(256);
	const result = [];
	let remaining = value;
	while (remaining >= base) {
		result.push(Number(remaining % base));
		remaining /= base;
	}
	if (remaining > 0n) result.push(Number(remaining));
	return Uint8Array.from(result.length > 0 ? result : [0]);
};
/**
* Encode a positive BigInt as an 8-byte Uint64LE Uint8Array, clamping the
* results – values exceeding `0xffff_ffff_ffff_ffff` (`18446744073709551615`)
* return the same result as `0xffff_ffff_ffff_ffff`, negative values return the
* same result as `0`.
*
* For an alternative overflow behavior, see {@link bigIntToBinUint64LE}.
*
* For the reverse, see {@link binToBigIntUint64LE}.
*
* @param value - the number to encode
*/
var bigIntToBinUint64LEClamped = (value) => {
	return binToFixedLength(bigIntToBinUintLE(value), 8);
};
/**
* Encode a positive BigInt as an 8-byte Uint64LE Uint8Array.
*
* This method will return an incorrect result for values outside of the range
* `0` to `0xffff_ffff_ffff_ffff` (`18446744073709551615`).
*
* For an alternative overflow behavior, see {@link bigIntToBinUint64LEClamped}.
*
* For the reverse, see {@link binToBigIntUint64LE}.
*
* @param value - the number to encode
*/
var bigIntToBinUint64LE = (value) => {
	return bigIntToBinUint64LEClamped(BigInt.asUintN(64, value));
};
/**
* Decode a 4-byte Uint32LE Uint8Array into a number.
*
* Throws if `bin` is shorter than 4 bytes.
*
* For the reverse, see {@link numberToBinUint32LE}.
*
* @param bin - the Uint8Array to decode
*/
var binToNumberUint32LE = (bin) => {
	return new DataView(bin.buffer, bin.byteOffset, bin.byteLength).getUint32(0, true);
};
/**
* Encode a positive BigInt into an unsigned 32-byte big-endian Uint8Array. This
* can be used to encoded numbers for cryptographic primitives like private
* keys, public keys, curve parameters, and signature points.
*
* Negative values will return the same result as `0`, values higher than
* 2^256-1 will return the maximum expressible unsigned 256-bit value
* (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`).
*
* For the reverse, see {@link binToBigIntUint256BE}.
*
* @param value - the BigInt to encode
*/
var bigIntToBinUint256BEClamped = (value) => {
	return binToFixedLength(bigIntToBinUintLE(value), 32).reverse();
};
/**
* Decode a little-endian Uint8Array of any length into a BigInt.
*
* The `bytes` parameter can be set to constrain the expected length (default:
* `bin.length`). This method throws if `bin.length` is not equal to `bytes`.
*
* For the reverse, see {@link bigIntToBinUintLE}.
*
* @param bin - the Uint8Array to decode
* @param bytes - the number of bytes to read (default: `bin.length`)
*/
var binToBigIntUintLE = (bin, bytes = bin.length) => {
	const bitsInAByte = 8;
	if (bin.length !== bytes) throw new TypeError(`Bin length must be ${bytes}.`);
	return new Uint8Array(bin.buffer, bin.byteOffset, bin.length).reduceRight((accumulated, byte) => accumulated << BigInt(bitsInAByte) | BigInt(byte), 0n);
};
/**
* Decode an 8-byte Uint64LE Uint8Array into a BigInt.
*
* Throws if `bin` is shorter than 8 bytes.
*
* For the reverse, see {@link bigIntToBinUint64LE}
* or {@link bigIntToBinUint64LEClamped}.
*
* @param bin - the Uint8Array to decode
*/
var binToBigIntUint64LE = (bin) => {
	const uint64LengthInBytes = 8;
	return binToBigIntUintLE(bin.length > uint64LengthInBytes ? bin.slice(0, uint64LengthInBytes) : bin, uint64LengthInBytes);
};
/**
* Decode an {@link Output.valueSatoshis} into a `BigInt`. This is an alias for
* {@link binToBigIntUint64LE}.
*
* Throws if the provided value is shorter than 8 bytes.
*
* For the reverse, see {@link valueSatoshisToBin}.
*/
var binToValueSatoshis = binToBigIntUint64LE;
/**
* Encode a `BigInt` into an {@link Output.valueSatoshis}. This is an alias for
* {@link bigIntToBinUint64LE}.
*
* This method will return an incorrect result for values outside of the range 0
* to 0xffff_ffff_ffff_ffff (`18446744073709551615`).
*
* For the reverse, see {@link binToValueSatoshis}.
*/
var valueSatoshisToBin = bigIntToBinUint64LE;
/**
* Get the expected byte length of a CompactUint given a first byte.
*
* @param firstByte - the first byte of the CompactUint
*/
var compactUintPrefixToLength = (firstByte) => {
	switch (firstByte) {
		case 253: return 3;
		case 254: return 5;
		case 255: return 9;
		default: return 1;
	}
};
var CompactUintError;
(function(CompactUintError) {
	CompactUintError["noPrefix"] = "Error reading CompactUint: requires at least one byte.";
	CompactUintError["insufficientBytes"] = "Error reading CompactUint: insufficient bytes.";
	CompactUintError["nonMinimal"] = "Error reading CompactUint: CompactUint is not minimally encoded.";
	CompactUintError["excessiveBytes"] = "Error decoding CompactUint: unexpected bytes after CompactUint.";
})(CompactUintError || (CompactUintError = {}));
/**
* Read a non-minimally-encoded `CompactUint` (see {@link bigIntToCompactUint})
* from the provided {@link ReadPosition}, returning either an error message (as
* a string) or an object containing the value and the
* next {@link ReadPosition}.
*
* Rather than this function, most applications should
* use {@link readCompactUintMinimal}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* `CompactUint`
*/
var readCompactUint = (position) => {
	const { bin, index } = position;
	const prefix = bin[index];
	if (prefix === void 0) return formatError(CompactUintError.noPrefix);
	const bytes = compactUintPrefixToLength(prefix);
	if (bin.length - index < bytes) return formatError(CompactUintError.insufficientBytes, `CompactUint prefix ${prefix} requires at least ${bytes} bytes. Remaining bytes: ${bin.length - index}`);
	const contents = bytes !== 1 ? bin.subarray(index + 1, index + bytes) : bin.subarray(index, index + bytes);
	return {
		position: {
			bin,
			index: index + bytes
		},
		result: binToBigIntUintLE(contents)
	};
};
/**
* Encode a positive BigInt as a `CompactUint` (Satoshi's variable-length,
* positive integer format).
*
* Note: the maximum value of a CompactUint is `0xffff_ffff_ffff_ffff`
* (`18446744073709551615`). This method will return an incorrect result for
* values outside of the range `0` to `0xffff_ffff_ffff_ffff`. If applicable,
* applications should handle such cases prior to calling this method.
*
* For the reverse, see {@link compactUintToBigInt}.
*
* @param value - the BigInt to encode (must be no larger than
* `0xffff_ffff_ffff_ffff`)
*/
var bigIntToCompactUint = (value) => value <= BigInt(252) ? Uint8Array.of(Number(value)) : value <= BigInt(65535) ? Uint8Array.from([253, ...numberToBinUint16LE(Number(value))]) : value <= BigInt(4294967295) ? Uint8Array.from([254, ...numberToBinUint32LE(Number(value))]) : Uint8Array.from([255, ...bigIntToBinUint64LE(value)]);
/**
* Read a minimally-encoded `CompactUint` from the provided
* {@link ReadPosition}, returning either an error message (as a string) or an
* object containing the value and the next {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* `CompactUint`
*/
var readCompactUintMinimal = (position) => {
	const read = readCompactUint(position);
	if (typeof read === "string") return read;
	const readLength = read.position.index - position.index;
	const canonicalEncoding = bigIntToCompactUint(read.result);
	if (readLength !== canonicalEncoding.length) return formatError(CompactUintError.nonMinimal, `Value: ${read.result.toString()}, encoded length: ${readLength}, canonical length: ${canonicalEncoding.length}`);
	return read;
};
/**
* Convert an unsigned integer into it's two's compliment signed equivalent,
* e.g. `0b11111111111111111111111111111110` is `4294967294` as an unsigned
* integer or `-2` as a signed integer.
*
* For the reverse, see {@link int32SignedToUnsigned}.
*
* @param int32 - the number to convert
*/
var int32UnsignedToSigned = (int32) => Int32Array.from(Uint32Array.of(int32))[0];
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/read.js
/**
* Given an initial {@link ReadPosition} and a list of {@link ReadFunction}s,
* apply each {@link ReadFunction} in order, aggregating each result and passing
* the next {@link ReadPosition} into the next {@link ReadFunction}. If an error
* occurs, immediately return the error message (`string`), otherwise, return
* the array of results.
*
* @param position - the {@link ReadPosition} at which to start the first read
* @param readFunctions - the ordered list of {@link ReadFunction}s to apply to
* the {@link ReadPosition}
*/
var readMultiple = (position, readFunctions) => {
	let nextPosition = position;
	const results = [];
	for (const readFunction of readFunctions) {
		const out = readFunction(nextPosition);
		if (typeof out === "string") return out;
		results.push(out.result);
		nextPosition = out.position;
	}
	return {
		position: nextPosition,
		result: results
	};
};
var ReadItemCountError;
(function(ReadItemCountError) {
	ReadItemCountError["itemCount"] = "Error reading item count.";
	ReadItemCountError["item"] = "Error reading item.";
})(ReadItemCountError || (ReadItemCountError = {}));
/**
* Read a count of items indicated by the CompactUint at {@link ReadPosition}.
* The CompactUint will be read to determine the number of items, and the read
* function will be applied in series, aggregated each result and passing the
* next {@link ReadPosition} into each iteration. If an error occurs,
* immediately return the error message (`string`), otherwise, return the array
* of results.
*/
var readItemCount = (position, readFunction) => {
	const countRead = readCompactUintMinimal(position);
	if (typeof countRead === "string") return formatError(ReadItemCountError.itemCount, countRead);
	let nextPosition = countRead.position;
	const result = [];
	for (let remaining = Number(countRead.result); remaining > 0; remaining--) {
		const read = readFunction(nextPosition);
		if (typeof read === "string") return formatError(ReadItemCountError.item, read);
		result.push(read.result);
		nextPosition = read.position;
	}
	return {
		position: nextPosition,
		result
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/format/utf8.js
var utf8Encoder = new TextEncoder();
/**
* Interpret a string as UTF-8 and encode it as a Uint8Array.
*
* For the reverse, see {@link binToUtf8}.
*
* @param utf8 - the string to encode
*/
var utf8ToBin = (utf8) => utf8Encoder.encode(utf8);
new TextDecoder();
/**
* Normalize a string using Unicode Normalization Form KC (NFKC): compatibility
* decomposition, followed by canonical composition. NFKC is the preferred form
* for applications in which disambiguation between characters is critical. In
* Libauth, all message formats designed for transmission between trust centers
* are NFKC-normalized to hinder exploits in which lookalike characters are used
* to deceive counterparties.
*
* E.g.:
* ```
* console.log(lossyNormalize('ﬁt🚀👫👨‍👩‍👧‍👦')); // 'fit🚀👫👨‍👩‍👧‍👦'
* ```
*/
var lossyNormalize = (utf8) => utf8.normalize("NFKC");
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/hashes.js
/**
* Note, most of this method is translated and boiled-down from the wasm-pack
* workflow. Significant changes to wasm-bindgen or wasm-pack build will likely
* require modifications to this method.
*/
var instantiateRustWasm = async (webassemblyBytes, expectedImportModuleName, hashExportName, initExportName, updateExportName, finalExportName) => {
	const wasm = (await WebAssembly.instantiate(webassemblyBytes, { [expectedImportModuleName]: { 
	/**
	* This would only be called in cases where a `__wbindgen_malloc` failed.
	* Since `__wbindgen_malloc` isn't exposed to consumers, this error
	* can only be encountered if the code below is broken.
	*/
	/* c8 ignore next 10 */
__wbindgen_throw: (ptr, len) => {
		throw new Error(Array.from(getUint8Memory().subarray(ptr, ptr + len)).map((num) => String.fromCharCode(num)).join(""));
	} } })).instance.exports;
	let cachedUint8Memory;
	let cachedUint32Memory;
	let cachedGlobalArgumentPtr;
	const globalArgumentPtr = () => {
		if (cachedGlobalArgumentPtr === void 0) cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
		return cachedGlobalArgumentPtr;
	};
	/**
	* Must be hoisted for `__wbindgen_throw`.
	*/
	function getUint8Memory() {
		if (cachedUint8Memory === void 0 || cachedUint8Memory.buffer !== wasm.memory.buffer) cachedUint8Memory = new Uint8Array(wasm.memory.buffer);
		return cachedUint8Memory;
	}
	const getUint32Memory = () => {
		if (cachedUint32Memory === void 0 || cachedUint32Memory.buffer !== wasm.memory.buffer) cachedUint32Memory = new Uint32Array(wasm.memory.buffer);
		return cachedUint32Memory;
	};
	const passArray8ToWasm = (array) => {
		const ptr = wasm.__wbindgen_malloc(array.length);
		getUint8Memory().set(array, ptr);
		return [ptr, array.length];
	};
	const getArrayU8FromWasm = (ptr, len) => getUint8Memory().subarray(ptr, ptr + len);
	const hash = (input) => {
		const [ptr0, len0] = passArray8ToWasm(input);
		const retPtr = globalArgumentPtr();
		try {
			wasm[hashExportName](retPtr, ptr0, len0);
			const mem = getUint32Memory();
			const ptr = mem[retPtr / 4];
			const len = mem[retPtr / 4 + 1];
			const realRet = getArrayU8FromWasm(ptr, len).slice();
			wasm.__wbindgen_free(ptr, len);
			return realRet;
		} finally {
			wasm.__wbindgen_free(ptr0, len0);
		}
	};
	const init = () => {
		const retPtr = globalArgumentPtr();
		wasm[initExportName](retPtr);
		const mem = getUint32Memory();
		const ptr = mem[retPtr / 4];
		const len = mem[retPtr / 4 + 1];
		const realRet = getArrayU8FromWasm(ptr, len).slice();
		wasm.__wbindgen_free(ptr, len);
		return realRet;
	};
	const update = (rawState, input) => {
		const [ptr0, len0] = passArray8ToWasm(rawState);
		const [ptr1, len1] = passArray8ToWasm(input);
		const retPtr = globalArgumentPtr();
		try {
			wasm[updateExportName](retPtr, ptr0, len0, ptr1, len1);
			const mem = getUint32Memory();
			const ptr = mem[retPtr / 4];
			const len = mem[retPtr / 4 + 1];
			const realRet = getArrayU8FromWasm(ptr, len).slice();
			wasm.__wbindgen_free(ptr, len);
			return realRet;
		} finally {
			rawState.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
			wasm.__wbindgen_free(ptr0, len0);
			wasm.__wbindgen_free(ptr1, len1);
		}
	};
	const final = (rawState) => {
		const [ptr0, len0] = passArray8ToWasm(rawState);
		const retPtr = globalArgumentPtr();
		try {
			wasm[finalExportName](retPtr, ptr0, len0);
			const mem = getUint32Memory();
			const ptr = mem[retPtr / 4];
			const len = mem[retPtr / 4 + 1];
			const realRet = getArrayU8FromWasm(ptr, len).slice();
			wasm.__wbindgen_free(ptr, len);
			return realRet;
		} finally {
			rawState.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
			wasm.__wbindgen_free(ptr0, len0);
		}
	};
	return {
		final,
		hash,
		init,
		update
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/ripemd160/ripemd160.base64.js
/**
* @hidden
*/
var ripemd160Base64Bytes = "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AgQMBQsgAEH8EigCACACaiICQQFyNgIEQYQTIAA2AgBB/BIgAjYCACAAIAJqIAI2AgAMBAsgAxAgDAELQewPQewPKAIAQX4gAUEDdndxNgIACyAEIAJqIQIgAyAEaiEDCyADIAMoAgRBfnE2AgQgACACQQFyNgIEIAAgAmogAjYCAAJ/AkAgAkH/AU0EQCACQQN2IgFBA3RB9A9qIQJB7A8oAgAiA0EBIAFBH3F0IgFxRQ0BIAJBCGohAyACKAIIDAILIAAgAhAhDAILQewPIAMgAXI2AgAgAkEIaiEDIAILIQEgAyAANgIAIAEgADYCDCAAIAI2AgwgACABNgIICyAFQQhqDwtBgBMgACACayIBNgIAQYgTQYgTKAIAIgAgAmoiAzYCACADIAFBAXI2AgQgACACQQNyNgIEIABBCGoLpQEBAn9BAiEFAkACQAJAAkACQCAAKAIEIgYgAWsgAk8NACABIAJqIgIgAUkhAQJAIAQEQEEAIQUgAQ0CIAZBAXQiASACIAIgAUkbIQIMAQtBACEFIAENAQsgAkEASA0AIAZFDQEgACgCACACEBMiAUUNAgwDCyAFDwsgAhAEIgENAQsgAw0BCyABBEAgACABNgIAIABBBGogAjYCAEECDwtBAQ8LAAsIAEGMFBAHAAtmAgF/A34jAEEwayIBJAAgACkCECECIAApAgghAyAAKQIAIQQgAUEUakEANgIAIAEgBDcDGCABQgE3AgQgAUH0DDYCECABIAFBGGo2AgAgASADNwMgIAEgAjcDKCABIAFBIGoQJQALuAEBAX8jAEHgAWsiAyQAIANBOGpBzAgoAgA2AgAgA0EwakHECCkCADcDACADQgA3AyAgA0G8CCkCADcDKCADQTxqQQBBxAAQKhogA0EgaiABIAIQCSADQYABaiADQSBqQeAAECgaIANBCGogA0GAAWoQCiADQSBqIANBCGpBFBADIANBiAFqIANBKGooAgA2AgAgAyADKQMgNwOAASADIANBgAFqEAsgACADKQMANwIAIANB4AFqJAALlwMBBH8jAEFAaiIDJAAgACAAKQMAIAKtfDcDACADIABBCGo2AiggAyADQShqNgIsAkACQAJAAkACQAJAIAAoAhwiBQRAQcAAIAVrIgQgAk0NASADQRhqIAUgBSACaiIEIABBIGoQFiADKAIcIAJHDQUgAygCGCABIAIQKBoMAwsgAiEEDAELIANBMGogASACIAQQFyADQTxqKAIAIQQgAygCOCEBIAMoAjAhBSADKAI0IQIgA0EgaiAAQSBqIgYgACgCHBAYIAIgAygCJEcNBCADKAIgIAUgAhAoGiAAQRxqQQA2AgAgA0EsaiAGEBkLIANBPGohAiADQThqIQUCQANAIARBP00NASADQTBqIAEgBEHAABAXIAIoAgAhBCAFKAIAIQEgA0EIakEAQcAAIAMoAjAgAygCNBAaIANBLGogAygCCBAZDAALAAsgA0EQaiAAQSBqIAQQGyADKAIUIARHDQEgAygCECABIAQQKBoLIABBHGogBDYCACADQUBrJAAPC0H0ExAHAAtB9BMQBwALQfQTEAcAC+MCAgR/AX4jAEFAaiICJAAgAiABQQhqIgU2AiQgASkDACEGIAEoAhwhAyACIAJBJGo2AigCQCADQT9NBEAgAUEgaiIEIANqQYABOgAAIAEgASgCHEEBaiIDNgIcIAJBGGogBCADEBggAigCGEEAIAIoAhwQKhpBwAAgASgCHGtBB00EQCACQShqIAQQGSACQRBqIAQgAUEcaigCABAbIAIoAhBBACACKAIUECoaCyACQQhqIARBOBAYIAIoAgxBCEcNASACKAIIIAZCA4Y3AAAgAkEoaiAEEBkgAUEcakEANgIAIAJBADYCKEEEIQECQANAIAFBGEYNASACQShqIAFqQQA6AAAgAiACKAIoQQFqNgIoIAFBAWohAQwACwALIAAgBSkAADcAACAAQRBqIAVBEGooAAA2AAAgAEEIaiAFQQhqKQAANwAAIAJBQGskAA8LQcwTIANBwAAQHQALQdwTEAcAC2MBAn8gASgCACECAkACQCABKAIEIgMgASgCCCIBRgRAIAMhAQwBCyADIAFJDQEgAQRAIAIgARATIgINAQALIAIgAxARQQEhAkEAIQELIAAgATYCBCAAIAI2AgAPC0G0ExAHAAuQAQEBfyMAQYABayIBJAAgAUEwakHECCkCADcDACABQThqQcwIKAIANgIAIAFCADcDICABQbwIKQIANwMoIAFBPGpBAEHEABAqGiABQRBqIAFBIGpB4AAQAyABQShqIAFBGGooAgA2AgAgASABKQMQNwMgIAFBCGogAUEgahALIAAgASkDCDcCACABQYABaiQAC4YB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";
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/secp256k1/secp256k1-wasm-types.js
/**
* bitflags used in secp256k1's public API (translated from secp256k1.h)
*/
/** All flags' lower 8 bits indicate what they're for. Do not use directly. */
var SECP256K1_FLAGS_TYPE_CONTEXT = 1;
var SECP256K1_FLAGS_TYPE_COMPRESSION = 2;
/** Flags to pass to secp256k1_context_create. */
var SECP256K1_CONTEXT_VERIFY = 257;
var SECP256K1_CONTEXT_SIGN = 513;
var SECP256K1_CONTEXT_NONE = SECP256K1_FLAGS_TYPE_CONTEXT;
/** Flag to pass to secp256k1_ec_pubkey_serialize and secp256k1_ec_privkey_export. */
var SECP256K1_EC_COMPRESSED = 258;
var SECP256K1_EC_UNCOMPRESSED = SECP256K1_FLAGS_TYPE_COMPRESSION;
/**
* Flag to pass to a Secp256k1.contextCreate method.
*
* The purpose of context structures is to cache large precomputed data tables
* that are expensive to construct, and also to maintain the randomization data
* for blinding.
*
* You can create a context with only VERIFY or only SIGN capabilities, or you
* can use BOTH. (NONE can be used for conversion/serialization.)
*/
var ContextFlag;
(function(ContextFlag) {
	ContextFlag[ContextFlag["NONE"] = SECP256K1_CONTEXT_NONE] = "NONE";
	ContextFlag[ContextFlag["VERIFY"] = SECP256K1_CONTEXT_VERIFY] = "VERIFY";
	ContextFlag[ContextFlag["SIGN"] = SECP256K1_CONTEXT_SIGN] = "SIGN";
	ContextFlag[ContextFlag["BOTH"] = 769] = "BOTH";
})(ContextFlag || (ContextFlag = {}));
/**
* Flag to pass a Secp256k1 public key serialization method.
*
* You can indicate COMPRESSED (33 bytes, header byte 0x02 or 0x03) or
* UNCOMPRESSED (65 bytes, header byte 0x04) format.
*/
var CompressionFlag;
(function(CompressionFlag) {
	CompressionFlag[CompressionFlag["COMPRESSED"] = SECP256K1_EC_COMPRESSED] = "COMPRESSED";
	CompressionFlag[CompressionFlag["UNCOMPRESSED"] = SECP256K1_EC_UNCOMPRESSED] = "UNCOMPRESSED";
})(CompressionFlag || (CompressionFlag = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/secp256k1/secp256k1.base64.js
/**
* @hidden
*/
var secp256k1Base64Bytes = "AGFzbQEAAAABXg5gAn9/AGAGf39/f39/AX9gAX8AYAABf2AAAGADf39/AX9gAX8Bf2ACf38Bf2AEf39/fwF/YAV/f39/fwF/YAN/f38AYAd/f39/f39/AX9gBH9/f38AYAV/f39/fwAC5wEMA2VudgZtZW1vcnkCAYACgAIDZW52BXRhYmxlAXABBgYDZW52CXRhYmxlQmFzZQN/AANlbnYORFlOQU1JQ1RPUF9QVFIDfwADZW52CFNUQUNLVE9QA38AA2VudgVhYm9ydAACA2Vudg1lbmxhcmdlTWVtb3J5AAMDZW52DmdldFRvdGFsTWVtb3J5AAMDZW52F2Fib3J0T25DYW5ub3RHcm93TWVtb3J5AAMDZW52C19fX3NldEVyck5vAAIDZW52Bl9hYm9ydAAEA2VudhZfZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAUDSUgAAAYKBQAKCgIMAAYABwACBgUNCgAKAAoAAAcHAAAAAgYMCgoFAAUFAAULAQYFAwcBCAgBCAgKBwUFBQUHAQEIBQUFCAUICQgGCwJ/ASMBC38BIwILB/QGGxFfX19lcnJub19sb2NhdGlvbgA1BV9mcmVlACYHX21hbGxvYwAnGV9zZWNwMjU2azFfY29udGV4dF9jcmVhdGUAMxxfc2VjcDI1NmsxX2NvbnRleHRfcmFuZG9taXplAD4fX3NlY3AyNTZrMV9lY19wcml2a2V5X3R3ZWFrX2FkZABCH19zZWNwMjU2azFfZWNfcHJpdmtleV90d2Vha19tdWwAQBtfc2VjcDI1NmsxX2VjX3B1YmtleV9jcmVhdGUAMBpfc2VjcDI1NmsxX2VjX3B1YmtleV9wYXJzZQBOHl9zZWNwMjU2azFfZWNfcHVia2V5X3NlcmlhbGl6ZQBNHl9zZWNwMjU2azFfZWNfcHVia2V5X3R3ZWFrX2FkZABBHl9zZWNwMjU2azFfZWNfcHVia2V5X3R3ZWFrX211bAA/G19zZWNwMjU2azFfZWNfc2Vja2V5X3ZlcmlmeQBDGF9zZWNwMjU2azFfZWNkc2FfcmVjb3ZlcgA5NF9zZWNwMjU2azFfZWNkc2FfcmVjb3ZlcmFibGVfc2lnbmF0dXJlX3BhcnNlX2NvbXBhY3QAPDhfc2VjcDI1NmsxX2VjZHNhX3JlY292ZXJhYmxlX3NpZ25h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iCEuIAogLadJIAkgLKdJaiALICinSWogISAbRXFqIBkgE0VxaiAaIBRFcWogDiAbSWogByATSWogBSAUSWogECAISWogESAGSSAqQgGGpyIJciAiaiITaiIOIBIgBEkgK0IBhqciCnIgF2oiFGoiByAMIANJICVCAYanIgtyIBVqIhBqIgUgDSACSSAkQgGGpyIIciAWaiIRaiIGICOnIgRBAXQiEmoiASASSSEZIB8oAgCtICd+IiNCIIghLCABICOnIgNBAXQiDGoiASAMSSEaIBgoAgCtICZ+IiNCIIghKCABICOnIgJBAXQiDWoiASANSSEbIAogK6dJIAkgKqdJaiALICWnSWogCCAkp0lqICIgE0VxaiAOIBNJaiAXIBRFcWogByAUSWogFSAQRXFqIAUgEElqIBYgEUVxaiAGIBFJaiASIARJIC5CAYanIg5yIBlqIhVqIgogDCADSSAsQgGGpyIHciAaaiIWaiILIA0gAkkgKEIBhqciBXIgG2oiEGoiCCABIB4oAgCtIiQgJH4iI6ciAmoiASACSSAjQiCIp2oiBmohESAPIAE2AiAgICgCAK0iKSAcKAIArX4iI0IgiCEtIBEgI6ciBEEBdCIMaiIBIAxJIRMgHygCAK0iJyAdKAIArSImfiIjQiCIISogASAjpyIDQQF0Ig1qIgEgDUkhFCAYKAIArSIlICR+IiNCIIghJCABICOnIgJBAXQiCWoiASAJSSESIA8gATYCJCApICZ+IiNCIIghKyAHICynSSAOIC6nSWogBSAop0lqIBkgFUVxaiAaIBZFcWogGyAQRXFqIAogFUlqIAsgFklqIAggEElqIBEgBklqIAwgBEkgLUIBhqciB3IgE2oiDGoiCyANIANJICpCAYanIgVyIBRqIg1qIgggCSACSSAkQgGGpyIGciASaiIJaiIEICOnIgNBAXQiDmoiASAOSSEQICcgHigCAK0iJn4iI0IgiCEoIAEgI6ciAkEBdCIKaiIBIApJIREgBSAqp0kgByAtp0lqIAYgJKdJaiATIAxFcWogCyAMSWogFCANRXFqIAggDUlqIBIgCUVxaiAEIAlJaiAOIANJICtCAYanIgtyIBBqIhJqIgUgCiACSSAoQgGGpyIIciARaiIMaiIGIAEgJSAlfiIjpyICaiIBIAJJICNCIIinaiIEaiENIA8g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QUBrIAJB////H3EiAkHRB2pBGnZqQf///x9LIAYgAXEgB3EgCHEgBEH///8fcSIEcSAJcSALcUH///8fRiAFQf///wFGcXFyIgprQdEHcSACaiECIApBBnQgA2ogAkEadmoiA0EadiABQf///x9xaiIKQRp2IAZB////H3FqIgZBGnYgB0H///8fcWoiB0EadiAIQf///x9xaiIIQRp2IARqIgRBGnYgCUH///8fcWoiCUEadiALQf///x9xaiEBIAAgAkH///8fcTYCACANIANB////H3E2AgAgDiAKQf///x9xNgIAIA8gBkH///8fcTYCACAQIAdB////H3E2AgAgESAIQf///x9xNgIAIBIgBEH///8fcTYCACATIAlB////H3E2AgAgFCABQf///x9xNgIAIAwgAUEadiAFakH///8BcTYCAAuhFwEnfyMEIQQjBEHAA2okBCACKAJQIQYgASgCeARAIAAgBjYCeCAAIAIpAgA3AgAgACACKQIINwIIIAAgAikCEDcCECAAIAIpAhg3AhggACACKQIgNwIgIABBKGoiAyACQShqIgEpAgA3AgAgAyABKQIINwIIIAMgASkCEDcCECADIAEpAhg3AhggAyABKQIgNwIgIABBATYCUCAAQdQAaiIAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAEEANgIgIAQkBA8LIAYEQCADBEAgA0EBNgIAIANBBGoiAkIANwIAIAJCADcCCCACQgA3AhAgAkIANwIYIAJBADYCIAsgACABKQIANwIAIAAgASkCCDcCCCAAIAEpAhA3AhAgACABKQIYNwIYIAAgASkCIDcCICAAIAEpAig3AiggACABKQIwNwIwIAAgASkCODcCOCAAQUBrIAFBQGspAgA3AgAgACABKQJINwJIIAAgASkCUDcCUCAAIAEpAlg3AlggACABKQJgNwJgIAAgASkCaDcCaCAAIAEpAnA3AnAgACABKAJ4NgJ4IAQkBA8LIARB+ABqIQwgBEHQAGohJCAEQShqIQogAEH4AGoiKUEANgIAIARBkANqIiUgAUHQAGoiJhAHIARB6AJqIgggASkCADcCACAIIAEpAgg3AgggCCABKQIQNwIQIAggASkCGDcCGCAIIAEpAiA3AiAgCEEkaiIdKAIAIhNBFnYiBkHRB2wgCCgCAGohGyAGQQZ0IAhBBGoiFygCAGogG0EadmoiGEEadiAIQQhqIhkoAgBqIhpBGnYgCEEMaiIFKAIAaiIHQRp2IAhBEGoiDSgCAGoiFEEadiAIQRRqIhUoAgBqIg5BGnYgCEEYaiIPKAIAaiIQQRp2IAhBHGoiESgCAGoiEkEadiAIQSBqIgYoAgBqIRwgCCAbQf///x9xIio2AgAgFyAYQf///x9xIgs2AgAgGSAaQf///x9xIh42AgAgBSAHQf///x9xIh82AgAgDSAUQf///x9xIiA2AgAgFSAOQf///x9xIiE2AgAgDyAQQf///x9xIiI2AgAgESASQf///x9xIiM2AgAgBiAcQf///x9xIhs2AgAgHSAcQRp2IBNB////AXFqIhw2AgAgBEHAAmoiFiACICUQCiAEQZgCaiIJIAFBKGoiBikCADcCACAJIAYpAgg3AgggCSAGKQIQNwIQIAkgBikCGDcCGCAJIAYpAiA3AiAgCUEkaiInKAIAIh1BFnYiBkHRB2wgCSgCAGohDSAGQQZ0IAlBBGoiEygCAGogDUEadmoiFEEadiAJQQhqIhcoAgBqIhVBGnYgCUEMaiIYKAIAaiIOQRp2IAlBEGoiGSgCAGoiD0EadiAJQRRqIhooAgBqIhBBGnYgCUEYaiIFKAIAaiIRQRp2IAlBHGoiBygCAGoiEkEadiAJQSBqIgYoAgBqISggCSANQf///x9xIg02AgAgEyAUQf///x9xIhQ2AgAgFyAVQf///x9xIhU2AgAgGCAOQf///x9xIg42AgAgGSAPQf///x9xIg82AgAgGiAQQf///x9xIhA2AgAgBSARQf///x9xIhE2AgAgByASQf///x9xIhI2AgAgBiAoQf///x9xIgY2AgAgJyAoQRp2IB1B////AXFqNgIAIARB8AFqIgcgAkEoaiAlEAogByAHICYQCiAEQcgBaiIFQbzh//8AICprIBYoAgBqNgIAIAVB/P3//wAgC2sgFigCBGo2AgQgBUH8////ACAeayAWKAIIajYCCCAFQfz///8AIB9rIBYoAgxqNgIMIAVB/P///wAgIGsgFigCEGo2AhAgBUH8////ACAhayAWKAIUajYCFCAFQfz///8AICJrIBYoAhhqNgIYIAVB/P///wAgI2sgFigCHGo2AhwgBUH8////ACAbayAWKAIgajYCICAFQfz//wcgHGsgFigCJGo2AiRB/P//ByAnKAIAayECIARBoAFqIgtBvOH//wAgDWsgBygCAGo2AgAgC0H8/f//ACAUayAHKAIEajYCBCALQfz///8AIBVrIAcoAghqNgIIIAtB/P///wAgDmsgBygCDGo2AgwgC0H8////ACAPayAHKAIQajYCECALQfz///8AIBBrIAcoAhRqNgIUIAtB/P///wAgEWsgBygCGGo2AhggC0H8////ACASayAHKAIcajYCHCALQfz///8AIAZrIAcoAiBqNgIgIAsgAiAHKAIkajYCJCAFEBdFBEAgDCALEAcgJCAFEAcgCiAFICQQCiADBEAgAyAFKQIANwIAIAMgBSkCCDcCCCADIAUpAhA3AhAgAyAFKQIYNwIYIAMgBSkCIDcCIAsgAEHQAGogJiAFEAogBCAIICQQCiAAIAQpAgA3AgAgACAEKQIINwIIIAAgBCkCEDcCECAAIAQpAhg3AhggACAEKQIgNwIgQfj7//8BIABBBGoiEygCAEEBdCAKQQRqIh4oAgBqayEOQfj///8BIABBCGoiFygCAEEBdCAKQQhqIh8oAgBqayEPQfj///8BIABBDGoiGCgCAEEBdCAKQQxqIiAoAgBqayEQQfj///8BIABBEGoiGSgCAEEBdCAKQRBqIiEoAgBqayERQfj///8BIABBFGoiGigCAEEBdCAKQRRqIiIoAgBqayESQfj///8BIABBGGoiBSgCAEEBdCAKQRhqIiMoAgBqayEGQfj///8BIABBHGoiBygCAEEBdCAKQRxqIhsoAgBqayEDQfj///8BIABBIGoiDSgCAEEBdCAKQSBqIhwoAgBqayECQfj//w8gAEEkaiIUKAIAQQF0IApBJGoiHSgCAGprIQEgAEH4wv//ASAAKAIAQQF0IAooAgBqayAMKAIAaiIVNgIAIBMgDiAMKAIEaiIONgIAIBcgDyAMKAIIaiIPNgIAIBggECAMKAIMaiIQNgIAIBkgESAMKAIQaiIRNgIAIBogEiAMKAIUaiISNgIAIAUgBiAMKAIYaiIGNgIAIAcgAyAMKAIcaiIDNgIAIA0gAiAMKAIgaiICNgIAIBQgASAMKAIkaiIBNgIAIABBKGoiE0G0pP//AiAVayAEKAIAajYCACAAQSxqIhdB9Pn//wIgDmsgBCgCBGo2AgAgAEEwaiIYQfT///8CIA9rIAQoAghqNgIAIABBNGoiGUH0////AiAQayAEKAIMajYCACAAQThqIhpB9P///wIgEWsgBCgCEGo2AgAgAEE8aiIFQfT///8CIBJrIAQoAhRqNgIAIABBQGsiB0H0////AiAGayAEKAIYajYCACAAQcQAaiINQfT///8CIANrIAQoAhxqNgIAIABByABqIhRB9P///wIgAmsgBCgCIGo2AgAgAEHMAGoiFUH0//8XIAFrIAQoAiRqNgIAIBMgEyALEAogCiAKIAkQCiAKQbzh//8AIAooAgBrIg42AgAgHkH8/f//ACAeKAIAayIPNgIAIB9B/P///wAgHygCAGsiEDYCACAgQfz///8AICAoAgBrIhE2AgAgIUH8////ACAhKAIAayISNgIAICJB/P///wAgIigCAGsiBjYCACAjQfz///8AICMoAgBrIgM2AgAgG0H8////ACAbKAIAayICNgIAIBxB/P///wAgHCgCAGsiATYCACAdQfz//wcgHSgCAGsiADYCACATIBMoAgAgDmo2AgAgFyAXKAIAIA9qNgIAIBggGCgCACAQajYCACAZIBkoAgAgEWo2AgAgGiAaKAIAIBJqNgIAIAUgBSgCACAGajYCACAHIAcoAgAgA2o2AgAgDSANKAIAIAJqNgIAIBQgFCgCACABajYCACAVIBUoAgAgAGo2AgAgBCQEDwsgCxAXBEAgACABIAMQGiAEJAQPCyADBEAgA0IANwIAIANCADcCCCADQgA3AhAgA0IANwIYIANCADcCIAsgKUEBNgIAIAQkBAuvAwEBfyAAIAFBHGoiAigCAEEYdjoAACAAIAIoAgBBEHY6AAEgACACKAIAQQh2OgACIAAgAigCADoAAyAAIAFBGGoiAigCAEEYdjoABCAAIAIoAgBBEHY6AAUgACACKAIAQQh2OgAGIAAgAigCADoAByAAIAFBFGoiAigCAEEYdjoACCAAIAIoAgBBEHY6AAkgACACKAIAQQh2OgAKIAAgAigCADoACyAAIAFBEGoiAigCAEEYdjoADCAAIAIoAgBBEHY6AA0gACACKAIAQQh2OgAOIAAgAigCADoADyAAIAFBDGoiAigCAEEYdjoAECAAIAIoAgBBEHY6ABEgACACKAIAQQh2OgASIAAgAigCADoAEyAAIAFBCGoiAigCAEEYdjoA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BxAHIAcgBxAHIAcgBxAHIAcgBxAHIAcgBxAHIAcgByAGEAogBEHIAWoiBSAHKQIANwIAIAUgBykCCDcCCCAFIAcpAhA3AhAgBSAHKQIYNwIYIAUgBykCIDcCICAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUgBxAKIARBoAFqIgIgBSkCADcCACACIAUpAgg3AgggAiAFKQIQNwIQIAIgBSkCGDcCGCACIAUpAiA3AiAgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACIAUQCiAEQfgAaiIJIAIpAgA3AgAgCSACKQIINwIIIAkgAikCEDcCECAJIAIpAhg3AhggCSACKQIgNwIgQQAhBgNAIAkgCRAHIAZBAWoiBkHYAEcNAAsgCSAJIAIQCiADIAkpAgA3AgAgAyAJKQIINwIIIAMgCSkCEDcCECADIAkpAhg3AhggAyAJKQIgNwIgIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAyAFEAogCCADKQIANwIAIAggAykCCDcCCCAIIAMpAhA3AhAgCCADKQIYNwIYIAggAykCIDcCICAIIAgQByAIIAgQByAIIAgQByAIIAggChAKIAQgCCkCADcCACAEIAgpAgg3AgggBCAIKQIQNwIQIAQgCCkCGDcCGCAEIAgpAiA3AiAgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEIAcQCiAEIAQQByAEIAQQByAEIAQQByAEIAQQByAEIAQQByAEIAQgARAKIAQgBBAHIAQgBBAHIAQgBBAHIAQgBCALEAogBCAEEAcgBCAEEAcgACABIAQQCiAEJAQL7gQBG38gAEEkaiILKAIAIgJBFnYiAUHRB2wgACgCAGohBCABQQZ0IABBBGoiDCgCAGogBEEadmoiBUEadiAAQQhqIg0oAgBqIgZB////H3EhByAGQRp2IABBDGoiDigCAGoiCEEadiAAQRBqIg8oAgBqIQEgCEH///8fcSEJIAFB////H3EhCiABQRp2IABBFGoiECgCAGoiEUEadiAAQRhqIhIoAgBqIRMgEUH///8fcSEUIBNBGnYgAEEcaiIVKAIAaiIWQRp2IABBIGoiFygCAGohAyAWQf///x9xIRggA0H///8fcSEZIANBGnYgAkH///8BcWoiAkEWdiAFQf///x9xIgVBQGsgBEH///8fcSIEQdEHaiIaQRp2IhtqQf///x9LIAggBnEgAXEgEXEgE0H///8fcSIBcSAWcSADcUH///8fRiACQf///wFGcXFyIgNFBEAgACAENgIAIAwgBTYCACANIAc2AgAgDiAJNgIAIA8gCjYCACAQIBQ2AgAgEiABNgIAIBUgGDYCACAXIBk2AgAgCyACNgIADwsgGyAFaiADQQZ0aiIDQRp2IAdqIgRBGnYgCWoiBkEadiAKaiIHQRp2IBRqIghBGnYgAWoiAUEadiAYaiIJQRp2IBlqIgpBGnYgAmpB////AXEhAiAAIBpB////H3E2AgAgDCADQf///x9xNgIAIA0gBEH///8fcTYCACAOIAZB////H3E2AgAgDyAHQf///x9xNgIAIBAgCEH///8fcTYCACASIAFB////H3E2AgAgFSAJQf///x9xNgIAIBcgCkH///8fcTYCACALIAI2AgALsAIBCn8gACgCJCIBQRZ2IgJB0QdsIAAoAgBqIgNB////H3EiBEHQB3MhBSAEQQBHIAVB////H0dxBEBBAA8LIANBGnYgAkEGdHIgACgCBGoiAkEadiAAKAIIaiIDQRp2IAAoAgxqIgZBGnYgACgCEGoiB0EadiAAKAIUaiIIQRp2IAAoAhhqIglBGnYgACgCHGoiCkEadiAAKAIgaiIAQRp2IAFB////AXFqIQEgAkHAAHMgBXEgA3EgBnEgB3EgCHEgCXEgCnEgAHEgAUGAgIAec3FB////H0YEf0EBBSACQf///x9xIARyIANB////H3FyIAZB////H3FyIAdB////H3FyIAhB////H3FyIAlB////H3FyIApB////H3FyIABB////H3FyIAFyRQtBAXELmAIBBH8gACACaiEEIAFB/wFxIQEgAkHDAE4EQANAIABBA3EEQCAAIAE6AAAgAEEBaiEADAELCyAEQXxxIgVBQGohBiABIAFBCHRyIAFBEHRyIAFBGHRyIQMDQCAAIAZMBEAgACADNgIAIAAgAzYCBCAAIAM2AgggACADNgIMIAAgAzYCECAAIAM2AhQgACADNgIYIAAgAzYCHCAAIAM2AiAgACADNgIkIAAgAzYCKCAAIAM2AiwgACADNgIwIAAgAzYCNCAAIAM2AjggACADNgI8IABBQGshAAwBCwsDQCAAIAVIBEAgACADNgIAIABBBGohAAwBCwsLA0AgACAESARAIAAgAToAACAAQQFqIQAMAQsLIAQgAmsLqy8BnwF/IwQhDSMEQbAmaiQEIA1BgCZqIQ4gDUHYJWohESANQdgkaiEGIA1BhCRqIRIgDUGwI2ohDCANQcgfaiEWIA1ByBdqIUkgDUHoD2ohBSANQagNaiEJIA1BiAhqIQsCfwJAIAMoAgQgAygCAHIgAygCCHIgAygCDHIgAygCEHIgAygCFHIgAygCGHIgAygCHHJFDQAgAigCeA0AIA1BhAhqIgpBADYCACANQYAIaiANIANBBRArIgM2AgAgBiACIAooAgAiD0H8AGxqIhBBABAaIAwgBikCADcCACAMIAYpAgg3AgggDCAGKQIQNwIQIAwgBikCGDcCGCAMIAYpAiA3AiAgDEEoaiIKIAZBKGoiCCkCADcCACAKIAgpAgg3AgggCiAIKQIQNwIQIAogCCkCGDcCGCAKIAgpAiA3AiAgDEEANgJQIA4gBkHQAGoiChAHIBEgDiAKEAogEiAQIA4QCiASQShqIgggAiAPQfwAbGpBKGogERAKIBIgAiAPQfwAbGooAng2AlAgBSASKQIANwIAIAUgEikCCDcCCCAFIBIpAhA3AhAgBSASKQIYNwIYIAUgEikCIDcCICAFQShqIhAgCCkCADcCACAQIAgpAgg3AgggECAIKQIQNwIQIBAgCCkCGDcCGCAQIAgpAiA3AiAgBUHQAGoiCCACIA9B/ABsakHQAGoiAikCADcCACAIIAIpAgg3AgggCCACKQIQNwIQIAggAikCGDcCGCAIIAIpAiA3AiAgBUH4AGoiE0EANgIAIAkgCikCADcCACAJIAopAgg3AgggCSAKKQIQNwIQIAkgCikCGDcCGCAJIAopAiA3AiAgBUH8AGoiAiAFIAwgCUEoaiIUEBAgBUH4AWoiCCACIAwgCUHQAGoiBxAQIAVB9AJqIgIgCCAMIAlB+ABqIh0QECAFQfADaiIIIAIgDCAJQaABaiIeEBAgBUHsBGoiAiAIIAwgCUHIAWoiHxAQIAVB6AVqIg8gAiAMIAlB8AFqIiEQECAFQeQGaiIIIA8gDCAJQZgCaiIPEBAgBUG0B2oiAiACIAoQCiALQcwEaiIJIAgpAgA3AgAgCSAIKQIINwIIIAkgCCkCEDcCECAJIAgpAhg3AhggCSAIKQIgNwIgIAtB9ARqIgkgBUGMB2oiCikCADcCACAJIAopAgg3AgggCSAKKQIQNwIQIAkgCikCGDcCGCAJIAopAiA3AiAgC0GYBWoiIigCACIjQRZ2IghB0QdsIAkoAgBqIQogCEEGdCALQfgEaiIkKAIAaiAKQRp2aiIlQRp2IAtB/ARqIiYoAgBqIidBGnYgC0GABWoiKCgCAGoiKUEadiALQYQFaiIqKAIAaiIrQRp2IAtBiAVqIiwoAgBqIi1BGnYgC0GMBWoiLigCAGoiL0EadiALQZAFaiIwKAIAaiIxQRp2IAtBlAVqIjIoAgBqIQggCSAKQf///x9xNgIAICQgJUH///8fcTYCACAmICdB////H3E2AgAgKCApQf///x9xNgIAICogK0H///8fcTYCACAsIC1B////H3E2AgAgLiAvQf///x9xNgIAIDAgMUH///8fcTYCACAyIAhB////H3E2AgAgIiAIQRp2ICNB////AXFqNgIAIBYgAikCADcCACAWIAIpAgg3AgggFiACKQIQNwIQIBYgAikCGDcCGCAWIAIpAiA3AiAgC0EANgKcBSAGIA8pAgA3AgAgBiAPKQIINwIIIAYgDykCEDcCECAGIA8pAhg3AhggBiAPKQIgNwIgIA4gBhAHIBEgDiAGEAogC0H4A2ogBUHoBWogDhAKIAtBoARqIAVBkAZqIBEQCiALIAUoAuAGNgLIBCAGIAYgIRAKIA4gBhAHIBEgDiAGEAogC0GkA2ogBUHsBGogDhAKIAtBzANqIAVBlAVqIBEQCiALIAUoAuQFNgL0AyAGIAYgHxAKIA4gBhAHIBEgDiAGEAogC0HQAmogBUHwA2ogDhAKIAtB+AJqIAVBmARqIBEQCiALIAUoAugENgKgAyAGIAYgHhAKIA4gBhAHIBEgDiAGEAogC0H8AWogBUH0AmogDhAKIAtBpAJqIAVBnANqIBEQCiALIAUoAuwDNgLMAiAGIAYgHRAKIA4gBhAHIBEgDiAGEAogC0GoAWogBUH4AWogDhAKIAtB0AFqIAVBoAJqIBEQCiALIAUoAvACNgL4ASAGIAYgBxAKIA4gBhAHIBEgDiAGEAogC0HUAGogBUH8AGogDhAKIAtB/ABqIAVBpAFqIBEQCiALIAUoAvQBNgKkASAGIAYgFBAKIA4gBhAHIBEgDiAGEAogCyAFIA4QCiALQShqIBAgERAKIAsgEygCADYCUEEBIUogA0EASgR/IAMFQQALDAELIBZBATYCACAWQQRqIgJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCACQQA2AiBBASFLQQALIQIgBARAIEkgBEEPECsiAyFMIAMgAkoEQCADIQILCyABQfgAaiIdQQE2AgAgAUIANwIAIAFCADcCCCABQgA3AhAgAUIANwIYIAFCADcCICABQgA3AiggAUIANwIwIAFCADcCOCABQUBrQgA3AgAgAUIANwJIIAFCADcCUCABQgA3AlggAUIANwJgIAFCADcCaCABQgA3AnAgAkEATARAIA0kBA8LIA1B6CFqISsgDUHwIGohLCANQcggaiFNIA1B8B9qIgVB0ABqIWogAUHQAGohHiAGQQRqIU4gBkEIaiFPIAZBDGohUCAGQRBqIVEgBkEUaiFSIAZBGGohUyAGQRxqIVQgBkEgaiFVIAZBJGohViABQShqIRMgDEEEaiFXIAxBCGohWCAMQQxqIVkgDEEQaiFaIAxBFGohWyAMQRhqIVwgDEEcaiFdIAxBIGohXiAMQSRqIV8gBUEoaiFgIA1B4CJqIghBBGohayAIQQhqIWwgCEEMaiFtIAhBEGohbiAIQRRqIW8gCEEYaiFwIAhBHGohcSAIQSBqIXIgCEEkaiFzIBJBBGohdCASQQhqIXUgEkEMaiF2IBJBEGohdyASQRRqIXggEkEYaiF5IBJBHGoheiASQSBqIXsgEkEkaiF8IA1BuCJqIhBBBGohfSAQQQhqIX4gEEEMaiF/IBBBEGohgAEgEEEUaiGBASAQQRhqIYIBIBBBHGohgwEgEEEgaiGEASAQQSRqIYUBIA1BiCNqIg9BBGohhgEgD0EIaiGHASAPQQxqIYgBIA9BEGohiQEgD0EUaiGKASAPQRhqIYsBIA9BHGohjAEgD0EgaiGNASAPQSRqIY4BIAFBBGohYSABQQhqIWIgAUEMaiFjIAFBEGohZCABQRRqIWUgAUEYaiFmIAFBHGohZyABQSBqIWggAUEkaiFpIA1BwCFqIgpBBGohLSAKQQhqIS4gCkEMaiEvIApBEGohMCAKQRRqITEgCkEYaiEyIApBHGohOSAKQSBqITogCkEkaiE7IA1BkCJqIhRBBGohjwEgFEEIaiGQASAUQQxqIZEBIBRBEGohkgEgFEEUaiGTASAUQRhqIZQBIBRBHGohlQEgFEEgaiGWASAUQSRqIZcBIAFBLGohPCABQTBqIT0gAUE0aiE+IAFBOGohPyABQTxqIUAgAUFAayFBIAFBxABqIUIgAUHIAGohQyABQcwAaiFEIA1BmCFqIglBBGohmAEgCUEIaiGZASAJQQxqIZoBIAlBEGohmwEgCUEUaiGcASAJQRhqIZ0BIAlBHGohngEgCUEgaiGfASAJQSRqIaABIAFB0ABqIaEBIAFB1ABqIR8gBUEoaiEhIAVBLGohIiAFQTBqISMgBUE0aiEkIAVBOGohJSAFQTxqISYgBUFAayEnIAVBxABqISggBUHIAGohKSAFQcwAaiEqIA1BgAhqKAIAIaIBA0AgAkF/aiEEIAEgAUEAEBogSyACIKIBSnJFBEBBACEDA0AgDSADQYgIbGogBEECdGooAgAiBwRAIAsgA0EDdEHUAGxqIRUgB0EASgRAIAUgFSAHQX9qQQJtQdQAbGoiBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAHKQIoNwIoIAUgBykCMDcCMCAFIAcpAjg3AjggBUFAayAHQUBrKQIANwIAIAUgBykCSDcCSCAFIAcoAlA2AlAFIAUgFSAHQX9zQQJtQdQAbGoiBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAHKQIoNwIoIAUgBykCMDcCMCAFIAcpAjg3AjggBUFAayAHQUBrKQIANwIAIAUgBykCSDcCSCAFIAcoAlA2AlAgIUG84f//ACAhKAIAazYCACAiQfz9//8AICIoAgBrNgIAICNB/P///wAgIygCAGs2AgAgJEH8////ACAkKAIAazYCACAlQfz///8AICUoAgBrNgIAICZB/P///wAgJigCAGs2AgAgJ0H8////ACAnKAIAazYCACAoQfz///8AICgoAgBrNgIAIClB/P///wAgKSgCAGs2AgAgKkH8//8HICooAgBrNgIACyABIAEgBUEAEBALIANBAWoiAyBKRw0ACwsgAiBMTARAIEkgBEECdGooAgAiAwRAIAAoAgAhByADQQBKBEAgBSAHIANBf2pBAm1BBnRqECMFIAUgByADQX9zQQJtQQZ0ahAjICFBvOH//wAgISgCAGs2AgAgIkH8/f//ACAiKAIAazYCACAjQfz///8AICMoAgBrNgIAICRB/P///wAgJCgCAGs2AgAgJUH8////ACAlKAIAazYCACAmQfz///8AICYoAgBrNgIAICdB/P///wAgJygCAGs2AgAgKEH8////ACAoKAIAazYCACApQfz///8AICkoAgBrNgIAICpB/P//ByAqKAIAazYCAAsCQCBqKAIARQRAIB0oAgAEQCAdQQA2AgAgLCAWEAcgTSAsIBYQCiABIAUgLBAKIBMgYCBNEAogoQFBATYCACAfQgA3AgAgH0IANwIIIB9CADcCECAfQgA3AhggH0EANgIgDAILIB1BADYCACAOIB4gFhAKIBEgDhAHIAYgASkCADcCACAGIAEpAgg3AgggBiABKQIQNwIQIAYgASkCGDcCGCAGIAEpAiA3AiAgVigCACIVQRZ2IgdB0QdsIAYoAgBqIQMgB0EGdCBOKAIAaiADQRp2aiIXQRp2IE8oAgBqIhhBGnYgUCgCAGoiGUEadiBRKAIAaiIaQRp2IFIoAgBqIhtBGnYgUygCAGoiHEEadiBUKAIAaiIgQRp2IFUoAgBqIQcgBiADQf///x9xIkU2AgAgTiAXQf///x9xIhc2AgAgTyAYQf///x9xIhg2AgAgUCAZQf///x9xIhk2AgAgUSAaQf///x9xIho2AgAgUiAbQf///x9xIhs2AgAgUyAcQf///x9xIhw2AgAgVCAgQf///x9xIiA2AgAgVSAHQf///x9xIkY2AgAgViAHQRp2IBVB////AXFqIhU2AgAgEiAFIBEQCiAMIBMpAgA3AgAgDCATKQIINwIIIAwgEykCEDcCECAMIBMpAhg3AhggDCATKQIgNwIgIF8oAgAiR0EWdiIHQdEHbCAMKAIAaiEDIAdBBnQgVygCAGogA0EadmoiM0EadiBYKAIAaiI0QRp2IFkoAgBqIjVBGnYgWigCAGoiNkEadiBbKAIAaiI3QRp2IFwoAgBqIjhBGnYgXSgCAGoiSEEadiBeKAIAaiEHIAwgA0H///8fcSIDNgIAIFcgM0H///8fcSIzNgIAIFggNEH///8fcSI0NgIAIFkgNUH///8fcSI1NgIAIFogNkH///8fcSI2NgIAIFsgN0H///8fcSI3NgIAIFwgOEH///8fcSI4NgIAIF0gSEH///8fcSJINgIAIF4gB0H///8fcSKjATYCACBfIAdBGnYgR0H///8BcWoiBzYCACAPIGAgERAKIA8gDyAOEAogCEG84f//ACBFayASKAIAajYCACBrQfz9//8AIBdrIHQoAgBqNgIAIGxB/P///wAgGGsgdSgCAGo2AgAgbUH8////ACAZayB2KAIAajYCACBuQfz///8AIBprIHcoAgBqNgIAIG9B/P///wAgG2sgeCgCAGo2AgAgcEH8////ACAcayB5KAIAajYCACBxQfz///8AICBrIHooAgBqNgIAIHJB/P///wAgRmsgeygCAGo2AgAgc0H8//8HIBVrIHwoAgBqNgIAIBBBvOH//wAgA2sgDygCAGo2AgAgfUH8/f//ACAzayCGASgCAGo2AgAgfkH8////ACA0ayCHASgCAGo2AgAgf0H8////ACA1ayCIASgCAGo2AgAggAFB/P///wAgNmsgiQEoAgBqNgIAIIEBQfz///8AIDdrIIoBKAIAajYCACCCAUH8////ACA4ayCLASgCAGo2AgAggwFB/P///wAgSGsgjAEoAgBqNgIAIIQBQfz///8AIKMBayCNASgCAGo2AgAghQFB/P//ByAHayCOASgCAGo2AgAgCBAXRQRAIBQgEBAHICsgCBAHIAogCCArEAogHiAeIAgQCiAJIAYgKxAKIAEgCSkCADcCACABIAkpAgg3AgggASAJKQIQNwIQIAEgCSkCGDcCGCABIAkpAiA3AiAgLSgCACEDIC4oAgAhByAvKAIAIRUgMCgCACEXIDEoAgAhGCAyKAIAIRkgOSgCACEaIDooAgAhGyA7KAIAIRwgYSgCAEF+bCEgIGIoAgBBfmwhRSBjKAIAQX5sIUYgZCgCAEF+bCFHIGUoAgBBfmwhMyBmKAIAQX5sITQgZygCAEF+bCE1IGgoAgBBfmwhNiBpKAIAQX5sITcgASABKAIAQX5sQfjC//8BaiAKKAIAayAUKAIAaiI4NgIAIGEgIEH4+///AWogA2sgjwEoAgBqIgM2AgAgYiBFQfj///8BaiAHayCQASgCAGoiBzYCACBjIEZB+P///wFqIBVrIJEBKAIAaiIVNgIAIGQgR0H4////AWogF2sgkgEoAgBqIhc2AgAgZSAzQfj///8BaiAYayCTASgCAGoiGDYCACBmIDRB+P///wFqIBlrIJQBKAIAaiIZNgIAIGcgNUH4////AWogGmsglQEoAgBqIho2AgAgaCA2Qfj///8BaiAbayCWASgCAGoiGzYCACBpIDdB+P//D2ogHGsglwEoAgBqIhw2AgAgE0G0pP//AiA4ayAJKAIAajYCACA8QfT5//8CIANrIJgBKAIAajYCACA9QfT///8CIAdrIJkBKAIAajYCACA+QfT///8CIBVrIJoBKAIAajYCACA/QfT///8CIBdrIJsBKAIAajYCACBAQfT/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NwIIIAAgAykCEDcCECAAIAMpAhg3AhggACADKQIgNwIgQfb6/78CIABBBGoiASgCAEECdGshD0H2//+/AiAAQQhqIhAoAgBBAnRrIRFB9v//vwIgAEEMaiIbKAIAQQJ0ayEcQfb//78CIABBEGoiHSgCAEECdGshHkH2//+/AiAAQRRqIh8oAgBBAnRrISBB9v//vwIgAEEYaiIhKAIAQQJ0ayEiQfb//78CIABBHGoiIygCAEECdGshJEH2//+/AiAAQSBqIiUoAgBBAnRrISZB9v//EyAAQSRqIicoAgBBAnRrISggAEHWs/+/AiAAKAIAQQJ0ayAHKAIAIilqNgIAIAEgDyAHQQRqIg8oAgAiAWo2AgAgECARIAdBCGoiECgCACIRajYCACAbIBwgB0EMaiIbKAIAIhxqNgIAIB0gHiAHQRBqIh0oAgAiHmo2AgAgHyAgIAdBFGoiHygCACIgajYCACAhICIgB0EYaiIhKAIAIiJqNgIAICMgJCAHQRxqIiMoAgAiJGo2AgAgJSAmIAdBIGoiJSgCACImajYCACAnICggB0EkaiInKAIAIihqNgIAIAIoAgBBBmwhKiAGKAIAQQZsISsgCCgCAEEGbCEsIAkoAgBBBmwhLSAKKAIAQQZsIS4gCygCAEEGbCEvIAwoAgBBBmwhMCANKAIAQQZsITEgDigCAEEGbCEyIAMgAygCAEEGbEG84f//ACApa2o2AgAgAiAqQfz9//8AIAFrajYCACAGICtB/P///wAgEWtqNgIAIAggLEH8////ACAca2o2AgAgCSAtQfz///8AIB5rajYCACAKIC5B/P///wAgIGtqNgIAIAsgL0H8////ACAia2o2AgAgDCAwQfz///8AICRrajYCACANIDFB/P///wAgJmtqNgIAIA4gMkH8//8HIChrajYCACAAQShqIgEgBSADEAogB0Ga0v+/ASAEKAIAayICNgIAIA9B+vz/vwEgEigCAGsiAzYCACAQQfr//78BIBMoAgBrIgU2AgAgG0H6//+/ASAUKAIAayIHNgIAIB1B+v//vwEgFSgCAGsiBjYCACAfQfr//78BIBYoAgBrIgg2AgAgIUH6//+/ASAXKAIAayIJNgIAICNB+v//vwEgGCgCAGsiCjYCACAlQfr//78BIBkoAgBrIgs2AgAgJ0H6//8LIBooAgBr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BGohBCAGIAgQDEEBIANrIgNBwABJBH8gBAUgAkGBf2oiDUFAcSIOIAJrQcSSBGohBSADIQIgBCEDA0AgCCADKQAANwAAIAggAykACDcACCAIIAMpABA3ABAgCCADKQAYNwAYIAggAykAIDcAICAIIAMpACg3ACggCCADKQAwNwAwIAggAykAODcAOCADQUBrIQMgBiAIEAwgAkFAaiICQcAATw0ACyANIA5rIQMgBQshAiADBEAgAiEEQQAhAgwCCwsMAQsgCCACaiAEIAMQCxoLIAogECgCACICQR12QRh0NgIAIAogAkELdEGAgPwHcSACQRt0ciACQQV2QYD+A3FyIAJBFXZB/wFxcjYCBCAQIAJBNyACa0E/cUEBaiIDajYCACAGQSBqIQUCQAJAIANBwAAgAkE/cSICayIESQRAQfmMBCEEDAEFIAUgAmpB+YwEIAQQCxogBEH5jARqIQIgBiAFEAwgAyAEayIDQcAATwRAA0AgBSACKQAANwAAIAUgAikACDcACCAFIAIpABA3ABAgBSACKQAYNwAYIAUgAikAIDcAICAFIAIpACg3ACggBSACKQAwNwAwIAUgAikAODcAOCACQUBrIQIgBiAFEAwgA0FAaiIDQcAATw0ACwsgAwRAIAIhBEEAIQIMAgsLDAELIAUgAmogBCADEAsaCyAQKAIAIgJBP3EhBCAQIAJBCGo2AgAgBkEgaiEFAkACQEHAACAEayIDQQhLBEAgCiECQQghAwwBBSAFIARqIAogAxALGiAKIANqIQIgBiAFEAxBCCADayIDQcAATwRAA0AgBSACKQAANwAAIAUgAikACDcACCAFIAIpABA3ABAgBSACKQAYNwAYIAUgAikAIDcAICAFIAIpACg3ACggBSACKQAwNwAwIAUgAikAODcAOCACQUBrIQIgBiAFEAwgA0FAaiIDQcAATw0ACwsgAwRAQQAhBAwCCwsMAQsgBSAEaiACIAMQCxoLIAYoAgAQCSESIAZBADYCACAGQQRqIh4oAgAQCSEIIB5BADYCACAGQQhqIh8oAgAQCSENIB9BADYCACAGQQxqIiAoAgAQCSEOICBBADYCACAGQRBqIiEoAgAQCSEFICFBADYCACAGQRRqIiMoAgAQCSEEICNBADYCACAGQRhqIhMoAgAQCSEDIBNBADYCACAGQRxqIh0oAgAQ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EAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADIAIQDSAEQaABaiICIAMQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAJEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAYQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAKEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAoQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBhANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAQQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAsQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAYQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiALEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAoQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAMEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAQQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiALEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAEQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCAAIAIgBxANIAQkBAvYAwETfyMEIQIjBEHQAGokBCACIAFB0ABqEAcgAiACIAAQCiABKAIkIgZBFnYiAEHRB2wgASgCAGohBCAAQQZ0IAEoAgRqIARBGnZqIgdBGnYgASgCCGoiCEEadiABKAIMaiIJQRp2IAEoAhBqIgpBGnYgASgCFGoiC0EadiABKAIYaiIMQRp2IAEoAhxqIg1BGnYgASgCIGohBUH8/f//ACACKAIEayEOQfz///8AIAIoAghrIQ9B/P///wAgAigCDGshEEH8////ACACKAIQayERQfz///8AIAIoAhRrIRJB/P///wAgAigCGGshE0H8////ACACKAIcayEUQfz///8AIAIoAiBrIQEgAigCJCEAIAJBKGoiA0G84f//ACACKAIAayAEQf///x9xajYCACADIA4gB0H///8fcWo2AgQgAyAPIAhB////H3FqNgIIIAMgECAJQf///x9xajYCDCADIBEgCkH///8fcWo2AhAgAyASIAtB////H3FqNgIUIAMgEyAMQf///x9xajYCGCADIBQgDUH///8fcWo2AhwgAyABIAVB////H3FqNgIgIAMgBkH///8BcUH8//8HaiAAayAFQRp2ajYCJCADEBchACACJAQgAAuXEAEKfyMEIQQjBEHgA2okBCAEQdAAaiEDIARBKGohCCAEQbgDaiILIAEQByALIAsgARAKIARBkANqIgogCxAHIAogCiABEAogBEHoAmoiBiAKKQIANwIAIAYgCikCCDcCCCAGIAopAhA3AhAgBiAKKQIYNwIYIAYgCikCIDcCICAGIAYQByAGIAYQByAGIAYQByAGIAYgChAKIARBwAJqIgIgBikCADcCACACIAYpAgg3AgggAiAGKQIQNwIQIAIgBikCGDcCGCACIAYpAiA3AiAgAiACEAcgAiACEAcgAiACEAcgAiACIAoQCiAEQZgCaiIGIAIpAgA3AgAgBiACKQIINwIIIAYgAikCEDcCECAGIAIpAhg3AhggBiACKQIgNwIgIAYgBhAHIAYgBhAHIAYgBiALEAogBEHwAWoiByAGKQIANwIAIAcgBikCCDcCCCAHIAYpAhA3AhAgByAGKQIYNwIYIAcgBikCIDcCICAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcgBhAKIARByAFqIgUgBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFIAcQCiAEQaABaiICIAUpAgA3AgAgAiAFKQIINwIIIAIgBSkCEDcCECACIAUpAhg3AhggAiAFKQIgNwIgIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAiAFEAogBEH4AGoiCSACKQIANwIAIAkgAikCCDcCCCAJIAIpAhA3AhAgCSACKQIYNwIYIAkgAikCIDcCIEEAIQYDQCAJIAkQByAGQQFqIgZB2ABHDQALIAkgCSACEAogAyAJKQIANwIAIAMgCSkCCDcCCCADIAkpAhA3AhAgAyAJKQIYNwIYIAMgCSkCIDcCICADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMgBRAKIAggAykCADcCACAIIAMpAgg3AgggCCADKQIQNwIQIAggAykCGDcCGCAIIAMpAiA3AiAgCCAIEAcgCCAIEAcgCCAIEAcgCCAIIAoQCiAEIAgpAgA3AgAgBCAIKQIINwIIIAQgCCkCEDcCECAEIAgpAhg3AhggBCAIKQIgNwIgIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBCAHEAogBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEIAsQCiAEIAQQByAAIAQQByAEIAAQB0G84f//ACAEKAIAayABKAIAaiABKAIkQfz//wcgBCgCJGtqIgpBFnYiBkHRB2xqIQBB/P///wAgBCgCIGsgASgC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ACggBCABKQAwNwAwIAQgASkAODcAOCABQUBrIQEgBiAEEAwgAkFAaiICQcAATw0ACwsgAgRAQQAhAwwCCwsMAQsgBCADaiABIAIQCxoLIAYoAgAQCSEIIAZBADYCACAKKAIAEAkhCSAKQQA2AgAgCygCABAJIQogC0EANgIAIAwoAgAQCSELIAxBADYCACANKAIAEAkhByANQQA2AgAgDigCABAJIQMgDkEANgIAIA8oAgAQCSECIA9BADYCACARKAIAEAkhASAFIAg2AgAgBSAJNgIEIAUgCjYCCCAFIAs2AgwgBSAHNgIQIAUgAzYCFCAFIAI2AhggBSABNgIcIAAgBSAQEA4gBSQEC+YBAQN/IABB4ABqIgMoAgAiBEE/cSEFIAMgBCACajYCAEHAACAFayIEIAJNBEAgAEEgaiIDIAVqIAEgBBALGiABIARqIQEgACADEAwgAiAEayICQcAASQRAQQAhBQUDQCADIAEpAAA3AAAgAyABKQAINwAIIAMgASkAEDcAECADIAEpABg3ABggAyABKQAgNwAgIAMgASkAKDcAKCADIAEpADA3ADAgAyABKQA4NwA4IAFBQGshASAAIAMQDCACQUBqIgJBwABPDQBBACEFCwsLIAJFBEAPCyAAQSBqIAVqIAEgAhALGgvASwEzfyMEIQkjBEHwAWokBCAAQoGChIiQoMCAATcCACAAQoGChIiQoMCAATcCCCAAQoGChIiQoMCAATcCECAAQoGChIiQoMCAATcCGCAAQSBqIhlCADcCACAZQgA3AgggGUIANwIQIBlCADcCGCAJIgogGRATIApB4ABqIg0oAgAiCUE/cSEEIA0gCUEgajYCACAKQSBqIQsCQAJAQcAAIARrIglBIEsEQCAAIQkgBCEDQSAhCAwBBSALIARqIAAgCRALGiAAIAlqIQMgCiALEAxBICAJayIIQcAASQR/IAMFIABB5ABqIARBoH9qIgdBQHEiBkEcciAEa2ohBCAIIQkgAyEIA0AgCyAIKQAANwAAIAsgCCkACDcACCALIAgpABA3ABAgCyAIKQAYNwAYIAsgCCkAIDcAICALIAgpACg3ACggCyAIKQAwNwAwIAsgCCkAODcAOCAIQUBrIQggCiALEAwgCUFAaiIJQcAATw0ACyAHIAZrIQggBAshCSAIBEBBACEDDAILCwwBCyAL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cXIgAUEVdkH/AXFyNgIEIA0gAUE3IAFrQT9xQQFqIgJqNgIAIApBIGohBAJAAkAgAkHAACABQT9xIgFrIgNJBEBB+YwEIQMMAQUgBCABakH5jAQgAxALGiADQfmMBGohASAKIAQQDCACIANrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEAgASEDQQAhAQwCCwsMAQsgBCABaiADIAIQCxoLIA0oAgAiAUE/cSEDIA0gAUEIajYCACAKQSBqIQQCQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAQgA2ogCSACEAsaIAkgAmohASAKIAQQDEEIIAJrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAEIANqIAEgAhALGgsgCigCABAJIQ4gCkEANgIAIBooAgAQCSELIBpBADYCACAbKAIAEAkhByAbQQA2AgAgHCgCABAJIQYgHEEANgIAIB0oAgAQCSEEIB1BADYCACAeKAIAEAkhAyAeQQA2AgAgHygCABAJIQIgH0EANgIAICAoAgAQCSEBICBBADYCACAIIA42AgAgIiALNgIAICMgBzYCACAkIAY2AgAgJSAENgIAICYgAzYCACAnIAI2AgAgKCABNgIAIBEoAgAiAUE/cSEDIBEgAUEgajYCAAJAAkBBwAAgA2siBEEgSwRAIAghASADIQJBICEDDAEFIAUgA2ogCCAEEAsaIAggBGohAiAMIAUQDEEgIARrIgFBwABJBH8gASEDIAIFIANBoH9qIgNBBnZBAXQhBiAEQUBqIQQDQCAFIAIpAAA3AAAgBSACKQAINwAIIAUgAikAEDcAECAFIAIpABg3ABggBSACKQAgNwAgIAUgAikAKDcAKCAFIAIpADA3ADAgBSACKQA4NwA4IAJBQGshAiAMIAUQDCABQUBqIgFBwABPDQALIANBP3EhAyAIIAZBBGpBBXRqIARqCyEBIAMEQEEAIQIMAgsLDAELIAUgAmogASADEAsaCyAJIBEoAgAiAUEddkEYdDYCACAJIAFBC3RBgID8B3EgAUEbdHIgAUEFdkGA/gNxciABQRV2Qf8BcXI2AgQgESABQTcgAWtBP3FBAWoiAmo2AgACQAJAIAJBwAAgAUE/cSIBayIDSQRAQfmMBCEDDAEFIAUgAWpB+YwEIAMQCxogA0H5jARqIQEgDCAFEAwgAiADayICQcAATwRAA0AgBSABKQAANwAAIAUgASkACDcACCAFIAEpABA3ABAgBSABKQAYNwAYIAUgASkAIDcAICAFIAEpACg3ACggBSABKQAwNwAwIAUgASkAODcAOCABQUBrIQEgDCAFEAwgAkFAaiICQcAATw0ACwsgAgRAIAEhA0EAIQEMAgsLDAELIAUgAWogAyACEAsaCyARKAIAIgFBP3EhAyARIAFBCGo2AgACQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAUgA2ogCSACEAsaIAkgAmohASAMIAUQDEEIIAJrIgJBwABPBEADQCAFIAEpAAA3AAAgBSABKQAINwAIIAUgASkAEDcAECAFIAEpABg3ABggBSABKQAgNwAgIAUgASkAKDcAKCAFIAEpADA3ADAgBSABKQA4NwA4IAFBQGshASAMIAUQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAFIANqIAEgAhALGgsgDCgCABAJIQ4gDEEANgIAIBMoAgAQCSELIBNBADYCACAUKAIAEAkhByAUQQA2AgAgFSgCABAJIQYgFUEANgIAIBYoAgAQCSEEIBZBADYCACAXKAIAEAkhAyAXQQA2AgAgGCgCABAJIQIgGEEANgIAICEoAgAQCSEBICFBADYCACAuIA42AAAgLyALNgAAIDAgBzYAACAxIAY2AAAgMiAENgAAIDMgAzYAACA0IAI2AAAgNSABNgAAIAogGRATIA0oAgAiAUE/cSEEIA0gAUEgajYCACAKQSBqIQsCQAJAQcAAIARrIgFBIEsEQCAAIQEgBCEDQSAhAgwBBSALIARqIAAgARALGiAAIAFqIQMgCiALEAxBICABayICQcAASQR/IAMFIABB5ABqIARBoH9qIgdBQHEiBkEcciAEa2ohBCACIQEgAyECA0AgCyACKQAANwAAIAsgAikACDcACCALIAIpABA3ABAgCyACKQAYNwAYIAsgAikAIDcAICALIAIpACg3ACggCyACKQAwNwAwIAsgAikAODcAOCACQUBrIQIgCiALEAwgAUFAaiIBQcAATw0ACyAHIAZrIQIgBAshASACBEBBACEDDAILCwwBCyALIANqIAEgAhALGgsgCSANKAIAIgFBHXZBGHQ2AgAgCSABQQt0QYCA/AdxIAFBG3RyIAFBBXZBgP4DcXIgAUEVdkH/AXFyNgIEIA0gAUE3IAFrQT9xQQFqIgJqNgIAIApBIGohBAJAAkAgAkHAACABQT9xIgFrIgNJBEBB+YwEIQMMAQUgBCABakH5jAQgAxALGiADQfmMBGohASAKIAQQDCACIANrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEAgASEDQQAhAQwCCwsMAQsgBCABaiADIAIQCxoLIA0oAgAiAUE/cSEDIA0gAUEIajYCACAKQSBqIQQCQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAQgA2ogCSACEAsaIAkgAmohASAKIAQQDEEIIAJrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAEIANqIAEgAhALGgsgCigCABAJIQ4gCkEANgIAIBooAgAQCSELIBpBADYCACAbKAIAEAkhByAbQQA2AgAgHCgCABAJIQYgHEEANgIAIB0oAgAQCSEEIB1BADYCACAeKAIAEAkhAyAeQQA2AgAgHygCABAJIQIgH0EANgIAICAoAgAQCSEBICBBADYCACAIIA42AgAgIiALNgIAICMgBzYCACAkIAY2AgAgJSAENgIAICYgAzYCACAnIAI2AgAgKCABNgIAIBEoAgAiAUE/cSEDIBEgAUEgajYC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AEIANwIQIABCADcCGAsgASABKAIAIARqNgIAIAMkBEEBC9YDAQN/IwQhAyMEQYABaiQEIAAgASkCADcCACAAIAEpAgg3AgggACABKQIQNwIQIAAgASkCGDcCGCAAIAEpAiA3AiAgA0HQAGoiBSABEAcgA0EoaiIEIAEgBRAKIABBADYCUCADIAQoAgBBB2o2AgAgAyAEKAIENgIEIAMgBCgCCDYCCCADIAQoAgw2AgwgAyAEKAIQNgIQIAMgBCgCFDYCFCADIAQoAhg2AhggAyAEKAIcNgIcIAMgBCgCIDYCICADIAQoAiQ2AiQgAEEoaiIFIAMQIkUEQCADJARBAA8LIAUQFiAFKAIAIgFBAXEgAkYEQCADJARBAQ8LIAVBvOH//wAgAWs2AgAgAEEsaiIBQfz9//8AIAEoAgBrNgIAIABBMGoiAUH8////ACABKAIAazYCACAAQTRqIgFB/P///wAgASgCAGs2AgAgAEE4aiIBQfz///8AIAEoAgBrNgIAIABBPGoiAUH8////ACABKAIAazYCACAAQUBrIgFB/P///wAgASgCAGs2AgAgAEHEAGoiAUH8////ACABKAIAazYCACAAQcgAaiIBQfz///8AIAEoAgBrNgIAIABBzABqIgBB/P//ByAAKAIAazYCACADJARBAQv2CwIRfwJ+IwQhBSMEQaADaiQEIAVBuAJqIgJCADcAACACQgA3AAggAkIANwAQIAJCADcAGCACQgA3ACAgAkIANwAoIAJCADcAMCACQgA3ADggAUUEQCAAQQA2ApwBIABBJGoiA0GQiAQpAgA3AgAgA0GYiAQpAgA3AgggA0GgiAQpAgA3AhAgA0GoiAQpAgA3AhggA0GwiAQpAgA3AiAgAEEBNgJ0IABB+ABqIgNCADcCACADQgA3AgggA0IANwIQIANCADcCGCADQQA2AiAgAEGEuLznADYCTCAAQf61r/AANgJQIABBuMz59QA2AlQgAEHny/X2ADYCWCAAQcjQi/gANgJcIABB0vvu4wA2AmAgAEG8gMHtADYCZCAAQYbVuecANgJoIABB2bKj7AA2AmwgAEHG4rcHNgJwIABBATYCBCAAQQhqIgNCADcCACADQgA3AgggA0IANwIQIANBADYCGAsgBUH4AmoiBiAAQQRqIg8QESACIAYpAAA3AAAgAiAGKQAINwAIIAIgBikAEDcAECACIAYpABg3ABggAUEARyIHBEAgAkEgaiIDIAEpAAA3AAAgAyABKQAINwAIIAMgASkAEDcAECADIAEpABg3ABgLIAVBkAJqIQggBUHwAWohBCAFQfAAaiEDIAVByABqIQEgBUEEaiIQIAIgBwR/QcAABUEgCxAqIAJCADcAACACQgA3AAggAkIANwAQIAJCADcAGCACQgA3ACAgAkIANwAoIAJCADcAMCACQgA3ADggAUEEaiECIAFBCGohByABQQxqIQkgAUEQaiEKIAFBFGohCyABQRhqIQwgAUEcaiENIAFBIGohESABQSRqIRIDQCAQIAYQHyAFIAEgBhAURSIONgIAIA4EQCAFQQE2AgAMAQUgBSACKAIAIAEoAgByIAcoAgByIAkoAgByIAooAgByIAsoAgByIAwoAgByIA0oAgByIBEoAgByIBIoAgByRSIONgIAIA4NAQsLIAggARAHIABBJGoiAiACIAgQCiAAQcwAaiIHIAcgCBAKIAcgByABEAogAEH0AGoiCCAIIAEQCiABQgA3AgAgAUIANwIIIAFCADcCECABQgA3AhggAUIANwIgIARBBGohASAEQQhqIQggBEEMaiEHIARBEGohCSAEQRRqIQogBEEYaiELIARBHGohDANAIBAgBhAfIAQgBiAFEA4gBSgCAARAIAVBATYCAAwBBSAFIAEoAgAgBCgCAHIgCCgCAHIgBygCAHIgCSgCAHIgCigCAHIgCygCAHIgDCgCAHJFIg02AgAgDQ0BCwsgBkIANwAAIAZCADcACCAGQgA3ABAgBkIANwAYIAAgAyAEEB4gBCAEKAIAIgBBf3OtQsKC2YENfCITIAEoAgAiBiAAciAIKAIAIgByIAcoAgAiEHIgCSgCACINciAKKAIAIhFyIAsoAgAiEnIgDCgCACIOckEAR0EfdEEfda0iFIM+AgAgASATQiCIQoy9yf4LhCAGQX9zrXwiEyAUgz4CACAIIABBf3OtQrvAovoKfCATQiCIfCITIBSDPgIAIAcgEEF/c61C5rm71Qt8IBNCIIh8IhMgFIM+AgAgCSANQX9zrUL+////D3wgE0IgiHwiEyAUgz4CACAKIBFBf3OtQv////8PfCATQiCIfCITIBSDPgIAIAsgEkF/c61C/////w98IBNCIIh8IhMgFIM+AgAgDCAO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KSAGQQhqISogBkEMaiErIAZBEGohLCAGQRRqIS0gBkEYaiEuIAZBHGohLyAGQSBqITAgBkEkaiExIANBBGohMiADQQhqITMgA0EMaiE0IANBEGohNSADQRRqITYgA0EYaiE3IANBHGohOCADQSBqITkgA0EkaiE6IARBBGohOyAEQQhqIQkgBEEMaiEMIARBEGohDiAEQRRqIQ8gBEEYaiERIARBHGohEiAEQSBqIRMgBEEkaiEVIA0oAgBBvOH//wBqIRYgDSgCBEH8/f//AGohFyANKAIIQfz///8AaiEYIA0oAgxB/P///wBqIRkgDSgCEEH8////AGohGiANKAIUQfz///8AaiEbIA0oAhhB/P///wBqIRwgDSgCHEH8////AGohHSANKAIgQfz///8AaiEeIA0oAiRB/P//B2ohH0H/PyEBA0AgBiAHIAFBf2oiAkEGdGoiIBAjIBAgECAGEAogFCAQEAcgKCAUIBAQCiAGIAYgFBAKICkoAgAhISAqKAIAISIgKygCACEjICwoAgAhJCAtKAIAISUgLigCACEmIC8oAgAhJyAwKAIAIQsgMSgCACEFIAYgFiAGKAIAazYCACApIBcgIWs2AgAgKiAYICJrNgIAICsgGSAjazYCACAsIBogJGs2AgAgLSAbICVrNgIAIC4gHCAmazYCACAvIB0gJ2s2AgAgMCAeIAtrNgIAIDEgHyAFazYCACAKIAogKBAKIAMgBikCADcCACADIAYpAgg3AgggAyAGKQIQNwIQIAMgBikCGDcCGCADIAYpAiA3AiAgAxAPIAQgCikCADcCACAEIAopAgg3AgggBCAKKQIQNwIQIAQgCikCGDcCGCAEIAopAiA3AiAgBBAPICAgMigCACILQRp0IAMoAgByNgIAIAcgAkEGdGogMygCACIFQRR0IAtBBnZyNgIEIAcgAkEGdGogNCgCACILQQ50IAVBDHZyNgIIIAcgAkEGdGogNSgCACIFQQh0IAtBEnZyNgIMIAcgAkEGdGogNigCAEECdCAFQRh2ciA3KAIAIgVBHHRyNgIQIAcgAkEGdGogOCgCACILQRZ0IAVBBHZyNgIUIAcgAkEGdGogOSgCACIFQRB0IAtBCnZyNgIYIAcgAkEGdGogOigCAEEKdCAFQRB2cjYCHCAHIAJBBnRqIDsoAgAiC0EadCAEKAIA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IAYoAgBFBEAgBygCBCAHKAIAciAHKAIIciAHKAIMciAHKAIQciAHKAIUciAHKAIYciAHKAIccgRAIAkgAkEAEA4CQCAMIAIgA0EAIAVBACAOQQFxEQEAIgAEQCAIQQRqIRAgCEEIaiERIAhBDGohEiAIQRBqIRMgCEEUaiEUIAhBGGohFSAIQRxqIRZBACEEA0AgCCAMIAYQDiAGKAIARQRAIBAoAgAgCCgCAHIgESgCAHIgEigCAHIgEygCAHIgFCgCAHIgFSgCAHIgFigCAHIEQCAPIAogCyAHIAkgCCANEDENBAsLIAwgAiADQQAgBSAEQQFqIgQgDkEBcREBACIADQBBACEACwVBACEACwsgCUIANwIAIAlCADcCCCAJQgA3AhAgCUIANwIYIAhCADcCACAIQgA3AgggCEIANwIQIAhCADcCGCAHQgA3AgAgB0IANwIIIAdCADcCECAHQgA3AhggAARAIA0oAgAhAyABIAopAAA3AAAgASAKKQAINwAIIAEgCikAEDcAECABIAopABg3ABggAUEgaiICIAspAAA3AAAgAiALKQAINwAIIAIgCykAEDcAECACIAspABg3ABggAUFAayADOgAAIAYkBCAADwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAFBQGtBADoAACAGJARBAAv+AQECfyMEIQQjBEFAayQEIAFFBEBByooEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgA0UEQEGuigQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyAEQSBqIQUgAgR/IAUgAykAADcAACAFIAMpAAg3AAggBSADKQAQNwAQIAUgAykAGDcAGCAEIANBIGoiACkAADcAACAEIAApAAg3AAggBCAAKQAQNwAQIAQgACkAGDcAGCACIANBQGstAAA2AgAgASAFEBEgAUEgaiAEEBEgBCQEQQEFQb6MBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAAsL7wIBA38jBCEEIwRB0ABqJAQgBEEANgIAIAFFBEBBrooEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgAkUEQEG6igQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyADQQNLBEBBpYwEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgBEEoaiIFIAIgBBAOIAQoAgAhACAEQQhqIgYgAkEgaiAEEA4gBCgCACAAckUiACECIAAEfyABIAUpAAA3AAAgASAFKQAINwAIIAEgBSkAEDcAECABIAUpABg3ABggAUEgaiIAIAYpAAA3AAAgACAGKQAINwAIIAAgBikAEDcAECAAIAYpABg3ABggAUFAayADOgAAIAQkBCACBSABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAFBQGtBADoAACAEJAQgAgsLlCoBX38jBCEHIwRBwANqJAQgB0GgAWohCCAHQfgAaiEKIAFB+ABqIUAgB0GQA2oiBiABQdAAaiI9EAcgB0HoAmoiAyABKQIANwIAIAMgASkCCDcCCCADIAEpAhA3AhAgAyABKQIYNwIYIAMgASkCIDcCICADQSRqIiUoAgAiFEEWdiIEQdEHbCADKAIAaiEFIARBBnQgA0EEaiImKAIAaiAFQRp2aiIVQRp2IANBCGoiJygCAGoiFkEadiADQQxqIhwoAgBqIhdBGnYgA0EQaiIdKAIAaiIYQRp2IANBFGoiMSgCAGoiDkEadiADQRhqIjIoAgBqIiBBGnYgA0EcaiIzKAIAaiIhQRp2IANBIGoiNCgCAGohBCADIAVB////H3E2AgAgJiAVQf///x9xNgIAICcgFkH///8fcTYCACAcIBdB////H3E2AgAgHSAYQf///x9xNgIAIDEgDkH///8fcTYCACAyICBB////H3E2AgAgMyAhQf///x9xNgIAIDQgBEH///8fcTYCACAlIARBGnYgFEH///8BcWo2AgAgB0HAAmoiBCACIAYQCiABKAJMIhlBFnYiBUHRB2wgASgCKGohGiAFQQZ0IAEoAixqIBpBGnZqIihBGnYgASgCMGoiKUEadiABKAI0aiIqQRp2IAEoAjhqIitBGnYgASgCPGoiLEEadiABQUBrKAIAaiItQRp2IAEoAkRqIiJBGnYgASgCSGohHiAHQZgCaiIFIAJBKGoiWCAGEAogBSAFID0QCiAHQfABaiIBIAMpAgA3AgAgASADKQIINwIIIAEgAykCEDcCECABIAMpAhg3AhggASAD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aiI6KAIAayETIDogEzYCAEH8////ACAKQSBqIjsoAgBrIR8gOyAfNgIAQfz//wcgCkEkaiI/KAIAayEbID8gGzYCACAuKAIAIBtqIkJBFnYiPEHRB2wgASgCACAkamohGyA8QQZ0IBQoAgAgCWpqIBtBGnZqIiRBGnYgFSgCACALamoiC0EadiAWKAIAIA9qaiIPQRp2IBcoAgAgDGpqIgxBGnYgGCgCACANamoiDUEadiAOKAIAIBJqaiISQRp2ICAoAgAgE2pqIhNBGnYgISgCACAfamohCSABIBtB////H3EiHzYCACAUICRB////H3EiGzYCACAVIAtB////H3EiCzYCACAWIA9B////H3EiDzYCACAXIAxB////H3EiDDYCACAYIA1B////H3EiDTYCACAOIBJB////H3EiEjYCACAgIBNB////H3EiEzYCACAhIAlB////H3EiJDYCACAuIAlBGnYgQkH///8BcWoiCTYCACAAIAEpAgA3AgAgACABKQIINwIIIAAgASkCEDcCECAAIAEpAhg3AhggACABKQIgNwIgIAEgH0EBdCAKKAIAajYCACAUIBtBAXQgAygCAGo2AgAgFSALQQF0IBAoAgBqNgIAIBYgD0EBdCARKAIAajYCACAXIAxBAXQgIygCAGo2AgAgGCANQQF0IDAoAgBqNgIAIA4gEkEBdCA5KAIAajYCACAgIBNBAXQgOigCAGo2AgAgISAkQQF0IDsoAgBqNgIAIC4gCUEBdCA/KAIAajYCACABIAEgBxAKIAEgASgCACAIKAIAaiIBNgIAIBQgFCgCACAeKAIAaiIDNgIAIBUgFSgCACAZKAIAaiIINgIAIBYgFigCACAlKAIAaiIKNgIAIBcgFygCACAmKAIAaiIUNgIAIBggGCgCACAnKAIAaiIVNgIAIA4gDigCACAcKAIAaiIWNgIAICAgICgCACAdKAIAaiIXNgIAICEgISgCACAiKAIAaiIYNgIAIC4gLigCACAvKAIAaiIONgIAQfj//w8gDmsiD0EWdiIOQdEHbEH4wv//ASABa2ohASAOQQZ0Qfj7//8BIANraiABQRp2aiIcQRp2Qfj///8BIAhraiIdQRp2Qfj///8BIApraiIJQRp2Qfj///8BIBRraiIQQRp2Qfj///8BIBVraiILQRp2Qfj///8BIBZraiIR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FHZyNgIwIAIgEUESdEGAgPAfcSAQQQ52cjYCNCACIAVBGHRBgICAGHEgEUEIdnI2AjggAiAFQQJ2Qf///x9xNgI8IAJBQGsgEkEEdEHw//8fcSAFQRx2cjYCACACIBNBCnRBgPj/H3EgEkEWdnI2AkQgAiAUQRB0QYCA/B9xIBNBEHZyNgJIIAIgFEEKdjYCTCACQdAAaiINQQA2AgAgDiACKAIAciAGciAHciAIciAVciADciAKciALciAMckUEQEHajAQgACgCqAEgACgCpAFBA3FBAmoRAAAgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAEJARBAA8LIARBwAJqIQogBEGYAmohCyAEQfgBaiEIIARB/ABqIQMgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAJKAIEIAkoAgByIAkoAghyIAkoAgxyIAkoAhByIAkoAhRyIAkoAhhyIAkoAhxyBH8gCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIANB+ABqIgxBADYCACADIAIpAgA3AgAgAyACKQIINwIIIAMgAikCEDcCECADIAIpAhg3AhggAyACKQIgNwIgIANBKGoiBSACQShqIgYpAgA3AgAgBSAGKQIINwIIIAUgBikCEDcCECAFIAYpAhg3AhggBSAGKQIgNwIgIANBATYCUCADQdQAaiIHQgA3AgAgB0IANwIIIAdCADcCECAHQgA3AhggB0EANgIgIAAgAyADIAkgCBAZIA0gDCgCADYCACADQdAAaiIAIAAQFSAKIAAQByALIAAgChAKIAMgAyAKEAogBSAFIAsQCiAAQQE2AgAgB0IANwIAIAdCADcCCCAHQgA3AhAgB0IANwIYIAdBADYCICACIAMpAgA3AgAgAiADKQIINwIIIAIgAykCEDcCECACIAMpAhg3AhggAiADKQIgNwIgIAYgBSkCADcCACAGIAUpAgg3AgggBiAFKQIQNwIQIAYgBSkCGDcCGCAGIAUpAiA3AiAgASACEBsgBCQEQQEFIAQkBEEACwvhAgEBfyMEIQMjBEHQAGokBCADQQA2AgAgAUUEQEGIjAQgACgCqAEgACgCpAFBA3FBAmoRAAAgAyQEQQAPCyACRQRAQZeMBCAAKAKoASAAKAKkAUEDcUECahEAACADJARBAA8LIANBKGoiACACIAMQDiADQQhqIgIgAUEAEA4gAygCAAR/IAFCADcAACABQgA3AAggAUIANwAQIAFCADcAGEEABSAAKAIEIAAoAgByIAAoAghyIAAoAgxyIAAoAhByIAAoAhRyIAAoAhhyIAAoAhxyBH8gAiACIAAQDSABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggASACEBFBAQUgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYQQALCyEBIAJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCAAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAyQEIAELgAsBE38jBCEEIwRB8AJqJAQgBEEANgIAIAAoAgBFBEBB+IoEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgAUUEQEHkiAQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyACRQRAQZeMBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAA8LIARBCGoiFCACIAQQDiAEKAIABEAgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAEJARBAA8LIAEoAAQhBiABKAAIIQcgASgADCEIIAEoABAhAyABKAAUIQkgASgAGCEKIAEoABwhCyABKAAgIQwgASgAJCENIAEoACghDyABKAAsIRAgASgAMCEFIAEoADQhESABKAA4IRIgASgAPCETIARBKGoiAiABKAAAIg5B////H3E2AgAgAiAGQQZ0QcD//x9xIA5BGnZyIg42AgQgAiAHQQx0QYDg/x9xIAZBFHZyIgY2AgggAiAIQRJ0QYCA8B9xIAdBDnZyIgc2AgwgAiADQRh0QYCAgBhxIAhBCHZyIgg2AhAgAiADQQJ2Qf///x9xIhU2AhQgAiAJQQR0QfD//x9xIANBHHZyIgM2AhggAiAKQQp0QYD4/x9xIAlBFnZyIgk2AhwgAiALQRB0QYCA/B9xIApBEHZyIgo2AiAgAiALQQp2Igs2AiQgAiAMQf///x9xNgIoIAIgDUEGdEHA//8fcSAMQRp2cjYCLCACIA9BDHRBgOD/H3Eg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AWoiBCANQQFxEQEAIgANAEEAIQALBUEAIQALCyAJQgA3AgAgCUIANwIIIAlCADcCECAJQgA3AhggCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIAdCADcCACAHQgA3AgggB0IANwIQIAdCADcCGCAABEAgASAKKQAANwAAIAEgCikACDcACCABIAopABA3ABAgASAKKQAYNwAYIAFBIGoiASALKQAANwAAIAEgCykACDcACCABIAspABA3ABAgASALKQAYNwAYIAYkBCAADwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAYkBEEAC9cCAQJ/IwQhByMEQcABaiQEIAdByABqIgYgAikAADcAACAGIAIpAAg3AAggBiACKQAQNwAQIAYgAikAGDcAGCAGQSBqIgIgASkAADcAACACIAEpAAg3AAggAiABKQAQNwAQIAIgASkAGDcAGCAEBH8gBkFAayIBIAQpAAA3AAAgASAEKQAINwAIIAEgBCkAEDcAECABIAQpABg3ABhB4AAFQcAACyEBIAMEQCAGIAFqIgIgAykAADcAACACIAMpAAg3AAggAUEQciEBCyAHIAYgARAqIAZCADcAACAGQgA3AAggBkIANwAQIAZCADcAGCAGQgA3ACAgBkIANwAoIAZCADcAMCAGQgA3ADggBkFAa0IANwAAIAZCADcASCAGQgA3AFAgBkIANwBYIAZCADcAYCAGQgA3AGhBACEBA0AgByAAEB8gAUEBaiIBIAVNDQALIAckBEEBC90QASl/IwQhBSMEQYAEaiQEIAAoAgBFBEBB+IoEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgAkUEQEGsiwQgACgCqAEgACgCpAFBA3FBAmoRAAAgBSQEQQAPCyABRQRAQa6KBCAAKAKoASAAKAKkAUEDcUECahEAACAFJARBAA8LIANFBEBB5IgEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgBSACQQAQDiAFQUBrIgYgASkAADcAACAGIAEpAAg3AAggBiABKQAQNwAQIAYgASkAGDcAGCAFQSBqIgQgAUEgaiIBKQAANwAAIAQgASkACDcACCAEIAEpABA3ABAgBCABKQAYNwAYIARBGGoi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////HzYCACAGQf///x82AgAgAkH///8BNgIAIAMgBxAhQQBHCwsLCwsLCwsFQQALBUEACwshACAFJAQgAAuYBQIJfwd+IwQhBCMEQSBqJAQgAkUEQEHbigQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyAEIgAgAikAADcAACAAIAIpAAg3AAggACACKQAQNwAQIAAgAikAGDcAGCACKAA4IghBf0cgAigAPCIEQR92IgVBf3MiA3EgBEH/////B0lyIAMgAigANCIJQX9HcXIgAyACKAAwIgpBf0dxciADIAIoACwiA0Hz3N3qBUlxciIGQQFzIANB89zd6gVLcSAFciIHQQFzIAIoACgiBUGdoJG9BUlxIAZyIgtBAXMgBUGdoJG9BUtxIAdyIgdBAXMgAigAJCIGQcbepP99SXEgC3JBf3MiCyAGQcbepP99S3EgB3IgCyACKAAgIgJBoMHswAZLcXIhByABRQRAIAAkBCAHDwsgBwRAIAhBf3OtQv////8PfCAJQX9zrUL/////D3wgCkF/c61C/v///w98IANBf3OtQua5u9ULfCAFQX9zrUK7wKL6CnwgBkF/c61CjL3J/gt8IAJBf3OtQsKC2YENfCIMQiCIfCIOQiCIfCIPQiCIfCIQQiCIfCIRQiCIfCISQiCIfCENIAwgBiACciAFciADciAKciAJciAIciAEckEAR0EfdEEfda0iDIOnIQIgDyAMg6chBSAQIAyDpyEDIBEgDIOnIQogEiAMg6chCSANIAyDpyEIIARBf3OtQv////8PfCANQiCIfCAMg6chBCAOIAyDpyEGCyABIAApAAA3AAAgASAAKQAINwAIIAEgACkAEDcAECABIAApABg3ABggASACNgAgIAEgBjYAJCABIAU2ACggASADNgAsIAEgCjYAMCABIAk2ADQgASAINgA4IAEgBDYAPCAAJAQgBwuDAwIGfwh+IAJFBEBB24oEIAAoAqgBIAAoAqQBQQNxQQJqEQAAQQAPCyABBH8gAigAICIAQX9zrULCgtmBDXwhCiACKAAkIgMgAHIgAigAKCIAciACKAAsIgRyIAIoADAiBXIgAigANCIGciACKAA4IgdyIAIoADwiCHJBAEdBH3RBH3WtIQkgB0F/c61C/////w98IAZBf3OtQv////8PfCAFQX9zrUL+////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";
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/secp256k1/secp256k1-wasm.js
var wrapSecp256k1Wasm$1 = (instance, heapU8, heapU32) => ({
	contextCreate: (context) => instance.exports._secp256k1_context_create(context),
	contextRandomize: (contextPtr, seedPtr) => instance.exports._secp256k1_context_randomize(contextPtr, seedPtr),
	free: (pointer) => instance.exports._free(pointer),
	heapU32,
	heapU8,
	instance,
	malloc: (bytes) => instance.exports._malloc(bytes),
	mallocSizeT: (num) => {
		const pointer = instance.exports._malloc(4);
		const pointerView32 = pointer >> 2;
		heapU32.set([num], pointerView32);
		return pointer;
	},
	mallocUint8Array: (array) => {
		const pointer = instance.exports._malloc(array.length);
		heapU8.set(array, pointer);
		return pointer;
	},
	privkeyTweakAdd: (contextPtr, secretKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_privkey_tweak_add(contextPtr, secretKeyPtr, tweakNum256Ptr),
	privkeyTweakMul: (contextPtr, secretKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_privkey_tweak_mul(contextPtr, secretKeyPtr, tweakNum256Ptr),
	pubkeyCreate: (contextPtr, publicKeyPtr, secretKeyPtr) => instance.exports._secp256k1_ec_pubkey_create(contextPtr, publicKeyPtr, secretKeyPtr),
	pubkeyParse: (contextPtr, publicKeyOutPtr, publicKeyInPtr, publicKeyInLength) => instance.exports._secp256k1_ec_pubkey_parse(contextPtr, publicKeyOutPtr, publicKeyInPtr, publicKeyInLength),
	pubkeySerialize: (contextPtr, outputPtr, outputLengthPtr, publicKeyPtr, compression) => instance.exports._secp256k1_ec_pubkey_serialize(contextPtr, outputPtr, outputLengthPtr, publicKeyPtr, compression),
	pubkeyTweakAdd: (contextPtr, publicKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_pubkey_tweak_add(contextPtr, publicKeyPtr, tweakNum256Ptr),
	pubkeyTweakMul: (contextPtr, publicKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_pubkey_tweak_mul(contextPtr, publicKeyPtr, tweakNum256Ptr),
	readHeapU8: (pointer, bytes) => new Uint8Array(heapU8.buffer, pointer, bytes),
	readSizeT: (pointer) => {
		return heapU32[pointer >> 2];
	},
	recover: (contextPtr, outputPubkeyPointer, rSigPtr, msg32Ptr) => instance.exports._secp256k1_ecdsa_recover(contextPtr, outputPubkeyPointer, rSigPtr, msg32Ptr),
	recoverableSignatureParse: (contextPtr, outputRSigPtr, inputSigPtr, rid) => instance.exports._secp256k1_ecdsa_recoverable_signature_parse_compact(contextPtr, outputRSigPtr, inputSigPtr, rid),
	recoverableSignatureSerialize: (contextPtr, sigOutPtr, recIDOutPtr, rSigPtr) => instance.exports._secp256k1_ecdsa_recoverable_signature_serialize_compact(contextPtr, sigOutPtr, recIDOutPtr, rSigPtr),
	schnorrSign: (contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_schnorr_sign(contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr),
	schnorrVerify: (contextPtr, sigPtr, msg32Ptr, publicKeyPtr) => instance.exports._secp256k1_schnorr_verify(contextPtr, sigPtr, msg32Ptr, publicKeyPtr),
	seckeyVerify: (contextPtr, secretKeyPtr) => instance.exports._secp256k1_ec_seckey_verify(contextPtr, secretKeyPtr),
	sign: (contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_ecdsa_sign(contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr),
	signRecoverable: (contextPtr, outputRSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_ecdsa_sign_recoverable(contextPtr, outputRSigPtr, msg32Ptr, secretKeyPtr),
	signatureMalleate: (contextPtr, outputSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_malleate(contextPtr, outputSigPtr, inputSigPtr),
	signatureNormalize: (contextPtr, outputSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_normalize(contextPtr, outputSigPtr, inputSigPtr),
	signatureParseCompact: (contextPtr, sigOutPtr, compactSigInPtr) => instance.exports._secp256k1_ecdsa_signature_parse_compact(contextPtr, sigOutPtr, compactSigInPtr),
	signatureParseDER: (contextPtr, sigOutPtr, sigDERInPtr, sigDERInLength) => instance.exports._secp256k1_ecdsa_signature_parse_der(contextPtr, sigOutPtr, sigDERInPtr, sigDERInLength),
	signatureSerializeCompact: (contextPtr, outputCompactSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_serialize_compact(contextPtr, outputCompactSigPtr, inputSigPtr),
	signatureSerializeDER: (contextPtr, outputDERSigPtr, outputDERSigLengthPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_serialize_der(contextPtr, outputDERSigPtr, outputDERSigLengthPtr, inputSigPtr),
	verify: (contextPtr, sigPtr, msg32Ptr, pubkeyPtr) => instance.exports._secp256k1_ecdsa_verify(contextPtr, sigPtr, msg32Ptr, pubkeyPtr)
});
/**
* Method extracted from Emscripten's preamble.js
*/
var isLittleEndian = (buffer) => {
	const littleEndian = true;
	const notLittleEndian = false;
	const heap16 = new Int16Array(buffer);
	const heap32 = new Int32Array(buffer);
	const heapU8 = new Uint8Array(buffer);
	heap32[0] = 1668509029;
	heap16[1] = 25459;
	return heapU8[2] !== 115 || heapU8[3] !== 99 ? notLittleEndian : littleEndian;
};
/**
* Method derived from Emscripten's preamble.js
*/
var alignMemory = (factor, size) => Math.ceil(size / factor) * factor;
/**
* The most performant way to instantiate secp256k1 functionality. To avoid
* using Node.js or DOM-specific APIs, you can use {@link instantiateSecp256k1}.
*
* Note, most of this method is translated and boiled-down from Emscripten's
* preamble.js. Significant changes to the WASM build or breaking updates to
* Emscripten will likely require modifications to this method.
*
* @param webassemblyBytes - A buffer containing the secp256k1 binary.
*/
var instantiateSecp256k1WasmBytes = async (webassemblyBytes) => {
	const STACK_ALIGN = 16;
	const GLOBAL_BASE = 1024;
	const WASM_PAGE_SIZE = 65536;
	const TOTAL_STACK = 5242880;
	const TOTAL_MEMORY = 16777216;
	const wasmMemory = new WebAssembly.Memory({
		initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
		maximum: TOTAL_MEMORY / WASM_PAGE_SIZE
	});
	/* c8 ignore next 9 */
	if (!isLittleEndian(wasmMemory.buffer)) throw new Error("Runtime error: expected the system to be little-endian.");
	const STATIC_BASE = GLOBAL_BASE;
	const DYNAMICTOP_PTR = 68736;
	const STACKTOP = alignMemory(STACK_ALIGN, 68752);
	const DYNAMIC_BASE = alignMemory(STACK_ALIGN, STACKTOP + TOTAL_STACK);
	const heapU8 = new Uint8Array(wasmMemory.buffer);
	const heap32 = new Int32Array(wasmMemory.buffer);
	const heapU32 = new Uint32Array(wasmMemory.buffer);
	heap32[17184] = DYNAMIC_BASE;
	const TABLE_SIZE = 6;
	const MAX_TABLE_SIZE = 6;
	let getErrNoLocation;
	const info = {
		env: {
			DYNAMICTOP_PTR,
			STACKTOP,
			/* c8 ignore start */
			___setErrNo: (value) => {
				if (getErrNoLocation !== void 0) heap32[getErrNoLocation() >> 2] = value;
				return value;
			},
			_abort: (err = "Secp256k1 Error") => {
				throw new Error(err);
			},
			_emscripten_memcpy_big: (dest, src, num) => {
				heapU8.set(heapU8.subarray(src, src + num), dest);
				return dest;
			},
			abort: (err = "Secp256k1 Error") => {
				throw new Error(err);
			},
			abortOnCannotGrowMemory: () => {
				throw new Error("Secp256k1 Error: abortOnCannotGrowMemory was called.");
			},
			enlargeMemory: () => {
				throw new Error("Secp256k1 Error: enlargeMemory was called.");
			},
			getTotalMemory: () => TOTAL_MEMORY,
			memory: wasmMemory,
			memoryBase: STATIC_BASE,
			table: new WebAssembly.Table({
				element: "anyfunc",
				initial: TABLE_SIZE,
				maximum: MAX_TABLE_SIZE
			}),
			tableBase: 0
		},
		global: {
			Infinity: Infinity,
			NaN: NaN
		}
	};
	return WebAssembly.instantiate(webassemblyBytes, info).then((result) => {
		getErrNoLocation = result.instance.exports["___errno_location"];
		return wrapSecp256k1Wasm$1(result.instance, heapU8, heapU32);
	});
};
var getEmbeddedSecp256k1Binary = () => base64ToBin(secp256k1Base64Bytes).buffer;
/**
* An ultimately-portable (but slower) version of
* {@link instantiateSecp256k1Bytes} that does not require the consumer to
* provide the secp256k1 binary buffer.
*/
var instantiateSecp256k1Wasm = async () => instantiateSecp256k1WasmBytes(getEmbeddedSecp256k1Binary());
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/sha1/sha1.base64.js
/**
* @hidden
*/
var sha1Base64Bytes = "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cjYCBEG8FCAANgIAQbQUIAI2AgAgACACaiACNgIADAQLIAMQJQwBC0GkEUGkESgCAEF+IAFBA3Z3cTYCAAsgBCACaiECIAMgBGohAwsgAyADKAIEQX5xNgIEIAAgAkEBcjYCBCAAIAJqIAI2AgACfwJAIAJB/wFNBEAgAkEDdiIBQQN0QawRaiECQaQRKAIAIgNBASABQR9xdCIBcUUNASACQQhqIQMgAigCCAwCCyAAIAIQJgwCC0GkESADIAFyNgIAIAJBCGohAyACCyEBIAMgADYCACABIAA2AgwgACACNgIMIAAgATYCCAsgBUEIag8LQbgUIAAgAmsiATYCAEHAFEHAFCgCACIAIAJqIgM2AgAgAyABQQFyNgIEIAAgAkEDcjYCBCAAQQhqC6UBAQJ/QQIhBQJAAkACQAJAAkAgACgCBCIGIAFrIAJPDQAgASACaiICIAFJIQECQCAEBEBBACEFIAENAiAGQQF0IgEgAiACIAFJGyECDAELQQAhBSABDQELIAJBAEgNACAGRQ0BIAAoAgAgAhATIgFFDQIMAwsgBQ8LIAIQBCIBDQELIAMNAQsgAQRAIAAgATYCACAAQQRqIAI2AgBBAg8LQQEPCwALCABB5BUQBwALZgIBfwN+IwBBMGsiASQAIAApAhAhAiAAKQIIIQMgACkCACEEIAFBFGpBADYCACABIAQ3AxggAUIBNwIEIAFBrA42AhAgASABQRhqNgIAIAEgAzcDICABIAI3AyggASABQSBqECIAC7gBAQF/IwBB4AFrIgMkACADQThqQcwIKAIANgIAIANBMGpBxAgpAgA3AwAgA0IANwMgIANBvAgpAgA3AyggA0E8akEAQcQAEC4aIANBIGogASACEAkgA0GAAWogA0EgakHgABAsGiADQQhqIANBgAFqEAogA0EgaiADQQhqQRQQAyADQYgBaiADQShqKAIANgIAIAMgAykDIDcDgAEgAyADQYABahALIAAgAykDADcCACADQeABaiQAC5cDAQR/IwBBQGoiAyQAIAAgACkDACACrXw3AwAgAyAAQQhqNgIoIAMgA0EoajYCLAJAAkACQAJAAkACQCAAKAIcIgUEQEHAACAFayIEIAJNDQEgA0EYaiAFIAUgAmoiBCAAQSBqEBUgAygCHCACRw0FIAMoAhggASACECwaDAMLIAIhBAwB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QcgAaiICKQMANwMAIAEgASkDQDcDcCABIAw2AoQBIAEgFCAZQR53ajYCgAEgASAPNgKIASABIAY2AowBIAFB4ABqIAFB8ABqIAFBgAFqQQAQHiABKAJsIRYgASkCZCEfIAEoAiAhDSABKAIsIRAgASgCKCEKIAEoAiQhESABIAEoAmAiDjYCcCABIB83AnQgASAWNgJ8IAEgETYChAEgASAKNgKIASABIBA2AowBIAEgDSABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBABAeIAIgAUHoAGoiFikDADcDACABIAEpA2A3A0AgASgCPCEHIAEoAjghCCABKAIwIRIgASgCNCEJIBMgAikDADcDACABIAEpA0A3A3AgASAJNgKEASABIBIgDkEed2o2AoABIAEgCDYCiAEgASAHNgKMASABQeAAaiABQfAAaiABQYABakEAEB4gASgCbCEOIAEpAmQhHyABKAJgIRcgASARIAQgC3NzNgKEASABIA0gBSADc3M2AoABIAEgCiAUIAVzczYCiAEgASAQIAwgBHNzNgKMASABQdAAaiABQYABaiAJIAggBxAfIAEgFzYCcCABIB83AnQgASAONgJ8IAEgASgCVCIDNgKEASABIAEoAlgiCzYCiAEgASABKAJcIg42AowBIAEgASgCQEEedyABKAJQIhVqNgKAASABQeAAaiABQfAAaiABQYABakEAEB4gAiAWKQMANwMAIAEgASkDYDcDQCABIAkgBiAMc3M2AoQBIAEgEiAPIBRzczYCgAEgASAIIA0gD3NzNgKIASABIAcgESAGc3M2AowBIAFB8ABqIAFBgAFqIAMgCyAOEB8gASgCfCEEIAEoAnghBSABKAJwIQ8gASgCdCEGIBMgAikDADcDACABIAEpA0A3A3AgASAGNgKEASABIA8gF0Eed2o2AoABIAEgBTYCiAEgASAENgKMASABQeAAaiABQfAAaiABQYABakEBEB4gASgCbCEMIAEpAmQhHyABKAJgIRcgASADIBAgEXNzNgKEASABIBUgCiANc3M2AoABIAEgCyASIApzczYCiAEgASAOIAkgEHNzNgKMASABQfAAaiABQYABaiAGIAUgBBAfIAEoAnAhFCABKAJ8IQ0gASgCeCEQIAEoAnQhCiABIBc2AnAgASAfNwJ0IAEgDDYCfCABIAo2AoQBIAEgEDYCiAEgASANNgKMASABIBQgASgCQEEed2o2AoABIAFB4ABqIAFB8ABqIAFBgAFqQQEQHiACIBYpAwA3AwAgASABKQNgNwNAIAEgBiAHIAlzczYChAEgASAPIAggEnNzNgKAASABIAUgFSAIc3M2AogBIAEgBCADIAdzczYCjAEgAUHwAGogAUGAAWogCiAQIA0QHyABKAJ8IQcgASgCeCEIIAEoAnAhDCABKAJ0IQkgEyACKQMANwMAIAEgASkDQDcDcCABIAk2AoQBIAEgDCAXQR53ajYCgAEgASAINgKIASABIAc2AowBIAFB4ABqIAFB8ABqIAFBgAFqQQEQHiABKAJsIRcgASkCZCEfIAEoAmAhGCABIAogDiADc3M2AoQBIAEgFCALIBVzczYCgAEgASAQIA8gC3NzNgKIASABIA0gBiAOc3M2AowBIAFB8ABqIAFBgAFqIAkgCCAHEB8gASgCcCELIAEoAnwhESABKAJ4IRIgASgCdCEDIAEgGDYCcCABIB83AnQgASAXNgJ8IAEgAzYChAEgASASNgKIASABIBE2AowBIAEgCyABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBARAeIAIgFikDADcDACABIAEpA2A3A0AgASAJIAQgBnNzNgKEASABIAwgBSAPc3M2AoABIAEgCCAUIAVzczYCiAEgASAHIAogBHNzNgKMASABQdAAaiABQYABaiADIBIgERAfIBMgAikDADcDACABIAEpA0A3A3AgASABKAJUIg42AoQBIAEgASgCWCIPNgKIASABIAEoAlwiFTYCjAEgASABKAJQIhcgGEEed2o2AoABIAFB4ABqIAFB8ABqIAFBgAFqQQEQHiABKAJsIRogASkCZCEfIAEoAmAhGCABIAMgDSAKc3M2AoQBIAEgCyAQIBRzczYCgAEgASASIAwgEHNzNgKIASABIBEgCSANc3M2AowBIAFB8ABqIAFBgAFqIA4gDyAVEB8gASgCcCEUIAEoAnwhBCABKAJ4IQUgASgCdCEGIAEgGDYCcCABIB83AnQgASAaNgJ8IAEgBjYChAEgASAFNgKIASABIAQ2AowBIAEgFCABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBAhAeIAIgFikDADcDACABIAEpA2A3A0AgASAOIAcgCXNzNgKEASABIBcgCCAMc3M2AoABIAEgDyALIAhzczYCiAEgASAVIAMgB3NzNgKMASABQfAAaiABQYABaiAGIAUgBBAfIAEoAnwhByABKAJ4IQggASgCcCEMIAEoAnQhCSATIAIpAwA3AwAgASABKQNANwNwIAEgCTYChAEgASAMIBhBHndqNgKAASABIAg2AogBIAEgBzYCjAEgAUHgAGogAUHwAGogAUGAAWpBAhAeIAEoAmwhGiABKQJkIR8gASgCYCEYIAEgBiARIANzczYChAEgASAUIBIgC3NzNgKAASABIAUgFyASc3M2AogBIAEgBCAOIBFzczYCjAEgAUHwAGogAUGAAWogCSAIIAcQHyABKAJwIQsgASgCfCENIAEoAnghECABKAJ0IQogASAYNgJwIAEgHzcCdCABIBo2AnwgASAKNgKEASABIBA2AogBIAEgDTYCjAEgASALIAEoAkBBHndqNgKAASABQeAAaiABQfAAaiABQYABakECEB4gAiAWKQMANwMAIAEgASkDYDcDQCABIAkgFSAOc3M2AoQBIAEgDCAPIBdzczYCgAEgASAIIBQgD3NzNgKIASABIAcgBiAVc3M2AowBIAFB8ABqIAFBgAFqIAogECANEB8gASgCfCERIAEoAnghEiABKAJwIQ4gASgCdCEDIBMgAikDADcDACABIAEpA0A3A3AgASADNgKEASABIA4gGEEed2o2AoABIAEgEjYCiAEgASARNgKMASABQeAAaiABQfAAaiABQYABakECEB4gASgCbCEPIAEpAmQhHyABKAJgIRUgASAKIAQgBnNzNgKEASABIAsgBSAUc3M2AoABIAEgECAMIAVzczYCiAEgASANIAkgBHNzNgKMASABQdAAaiABQYABaiADIBIgERAfIAEgFTYCcCABIB83AnQgASAPNgJ8IAEgASgCVCIENgKEASABIAEoAlgiBTYCiAEgASABKAJcIgY2AowBIAEgASgCQEEedyABKAJQIhRqNgKAASABQeAAaiABQfAAaiABQYABakECEB4gAiAWKQMANwMAIAEgASkDYDcDQCABIAMgByAJc3M2AoQBIAEgDiAIIAxzczYCgAEgASASIAsgCHNzNgKIASABIBEgCiAHc3M2AowBIAFB8ABqIAFBgAFqIAQgBSAGEB8gASgCfCEHIAEoAnghCCABKAJwIQ8gASgCdCEJIBMgAikDADcDACABIAEpA0A3A3AgASAJNgKEASABIA8gFUEed2o2AoABIAEgCDYCiAEgASAHNgKMASABQeAAaiABQfAAaiABQYABakEDEB4gASgCbCEVIAEpAmQhHyABKAJgIQwgASAEIA0gCnNzNgKEASABIBQgECALc3M2AoABIAEgBSAOIBBzczYCiAEgASAGIAMgDXNzNgKMASABQfAAaiABQYABaiAJIAggBxAfIAEoAnAhECABKAJ8IQogASgCeCELIAEoAnQhDSABIAw2AnAgASAfNwJ0IAEgFTYCfCABIA02AoQBIAEgCzYCiAEgASAKNgKMASABIBAgASgCQEEed2o2AoABIAFB4ABqIAFB8ABqIAFBgAFqQQMQHiACIBYpAwA3AwAgASABKQNgNwNAIAEgCSARIANzczYChAEgASAPIBIgDnNzNgKAASABIAggFCASc3M2AogBIAEgByAEIBFzczYCjAEgAUHwAGogAUGAAWogDSALIAoQHyABKAJ8IREgASgCeCESIAEoAnAhDiABKAJ0IQMgEyACKQMANwMAIAEgASkDQDcDcCABIAM2AoQBIAEgDiAMQR53ajYCgAEgASASNgKIASABIBE2AowBIAFB4ABqIAFB8ABqIAFBgAFqQQMQHiABKAJsIRUgASkCZCEfIAEoAmAhDCABIA0gBiAEc3M2AoQBIAEgECAFIBRzczYCgAEgASALIA8gBXNzNgKIASABIAogCSAGc3M2AowBIAFB8ABqIAFBgAFqIAMgEiAREB8gASgCcCEKIAEoAnwhBCABKAJ4IQUgASgCdCEGIAEgDDYCcCABIB83AnQgASAVNgJ8IAEgBjYChAEgASAFNgKIASABIAQ2AowBIAEgCiABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBAxAeIAIgFikDADcDACABIAEpA2A3A0AgASADIAcgCXNzNgKEASABIA4gCCAPc3M2AoABIAEgEiAQIAhzczYCiAEgASARIA0gB3NzNgKMASABQdAAaiABQYABaiAGIAUgBBAfIBMgAikDADcDACABIAEpA0A3A3AgASABKQJUNwKEASABIAEoAlw2AowBIAEgASgCUCAMQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBAxAe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DSAKIABBDHZBD3FB4AFyOgAMQQMMAQsgCiAAQRJ2QfABcjoADCAKIABBP3FBgAFyOgAPIAogAEEMdkE/cUGAAXI6AA0gCiAAQQZ2QT9xQYABcjoADkEECyEIIAEoAhghAkF/IQAgAUEcaigCACIJQQxqIQECQAJAAkADQCAAQQFqIgAgBE8NASACIApBDGogCCABKAIAEQUARQ0ACwwBCyACIAcgBiAJQQxqKAIAIgERBQANAEF/IQADQCAAQQFqIgAgA08NAiACIApBDGogCCABEQUARQ0ACwtBAQwBC0EACyEAIApBEGokACAAC0YCAX8BfiMAQSBrIgIkACABKQIAIQMgAkEUaiABKQIINwIAIAJBlBY2AgQgAkGsDjYCACACIAA2AgggAiADNwIMIAIQJAALUAACQAJAQZARKAIAQQFGBEBBlBFBlBEoAgBBAWoiADYCACAAQQNJDQEMAgtBkBFCgYCAgBA3AwALQZwRKAIAIgBBf0wNAEGcESAANgIACwALPwECfyMAQRBrIgEkAAJ/IAAoAggiAiACDQAaQfwVEAcACxogASAAKQIMNwMAIAEgAEEUaikCADcDCCABECMAC7MCAQV/IAAoAhghAwJAAkACQCAAKAIMIgIgAEcEQCAAKAIIIgEgAjYCDCACIAE2AgggAw0BDAILIABBFGoiASAAQRBqIAEoAgAbIgQoAgAiAQRAAkADQCAEIQUgASICQRRqIgQoAgAiAQRAIAENAQwCCyACQRBqIQQgAigCECIBDQALCyAFQQA2AgAgAw0BDAILQQAhAiADRQ0BCwJAIAAoAhwiBEECdEG0E2oiASgCACAARwRAIANBEGogA0EUaiADKAIQIABGGyACNgIAIAINAQwCCyABIAI2AgAgAkUNAgsgAiADNgIYIAAoAhAiAQRAIAIgATYCECABIAI2AhgLIABBFGooAgAiAUUNACACQRRqIAE2AgAgASACNgIYCw8LQagRQagRKAIAQX4gBHdxNgIAC8UCAQR/IAACf0EAIAFBCHYiA0UNABpBHyICIAFB////B0sNABogAUEmIANnIgJrQR9xdkEBcUEfIAJrQQF0cgsiAjYCHCAAQgA3AhAgAkECdEG0E2ohAwJAAkACQEGoESgCACIEQQEgAkEfcXQiBXEEQCADKAIAIgQoAgRBeHEgAUcNASAEIQIM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LTFlY2M2Mjk5ZGI5ZWM4MjMvYmxvY2stYnVmZmVyLTAuMy4zL3NyYy9saWIucnNkZXN0aW5hdGlvbiBhbmQgc291cmNlIHNsaWNlcyBoYXZlIGRpZmZlcmVudCBsZW5ndGhzL3Jvb3QvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9naXRodWIuY29tLTFlY2M2Mjk5ZGI5ZWM4MjMvc2hhLTEtMC43LjAvc3JjL3V0aWxzLnJzaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZTogdW5rbm93biBpY29zYXJvdW5kIGluZGV4AEHwCwvSBAEAAAAAAAAAIAAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAwAAAGNhcGFjaXR5IG92ZXJmbG93Y2FsbGVkIGBPcHRpb246OnVud3JhcCgpYCBvbiBhIGBOb25lYCB2YWx1ZWxpYmNvcmUvb3B0aW9uLnJzMDAwMTAyMDMwNDA1MDYwNzA4MDkxMDExMTIxMzE0MTUxNjE3MTgxOTIwMjEyMjIzMjQyNTI2MjcyODI5MzAzMTMyMzMzNDM1MzYzNzM4Mzk0MDQxNDI0MzQ0NDU0NjQ3NDg0OTUwNTE1MjUzNTQ1NTU2NTc1ODU5NjA2MTYyNjM2NDY1NjY2NzY4Njk3MDcxNzI3Mzc0NzU3Njc3Nzg3OTgwODE4MjgzODQ4NTg2ODc4ODg5OTA5MTkyOTM5NDk1OTY5Nzk4OTkAAAAAaW5kZXggb3V0IG9mIGJvdW5kczogdGhlIGxlbiBpcyAgYnV0IHRoZSBpbmRleCBpcyBsaWJjb3JlL3NsaWNlL21vZC5ycwABAAAAAAAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAAABAAAAAQAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAABpbmRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggc2xpY2UgaW5kZXggc3RhcnRzIGF0ICBidXQgZW5kcyBhdCBpbnRlcm5hbCBlcnJvcjogZW50ZXJlZCB1bnJlYWNoYWJsZSBjb2RlbGliYWxsb2MvcmF3X3ZlYy5ycwBB7BQLnQIWBAAAJAAAAC8IAAATAAAASAIAAAkAAADQBAAAUwAAAEsAAAARAAAAUAQAACAAAABwBAAAWgAAAB8AAAAFAAAAIwUAADQAAABfBwAAFAAAAG0GAAAJAAAAzwUAABgAAAClBQAAKgAAAFcFAABOAAAAQgAAAA4AAAAUBgAAEQAAAC8IAAATAAAA8gIAAAUAAAAlBgAAKwAAAFAGAAARAAAAWQEAABUAAAADAAAAAAAAAAEAAAAEAAAALQcAACAAAABNBwAAEgAAALwHAAAGAAAAwgcAACIAAABfBwAAFAAAAK0HAAAFAAAA5AcAABYAAAD6BwAADQAAAF8HAAAUAAAAswcAAAUAAAAHCAAAKAAAAC8IAAATAAAA9QEAAB4ADAdsaW5raW5nAwKMDw==";
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/sha256/sha256.base64.js
/**
* @hidden
*/
var sha256Base64Bytes = "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IAJHDQUgAygCGCABIAIQKxoMAwsgAiEEDAELIANBMGogASACIAQQFiADQTxqKAIAIQQgAygCOCEBIAMoAjAhBSADKAI0IQIgA0EgaiAAQQxqIgYgACgCCBAXIAIgAygCJEcNBCADKAIgIAUgAhArGiAAQQhqQQA2AgAgA0EsaiAGEBgLIANBPGohAiADQThqIQUCQANAIARBP00NASADQTBqIAEgBEHAABAWIAIoAgAhBCAFKAIAIQEgA0EIakEAQcAAIAMoAjAgAygCNBAZIANBLGogAygCCBAYDAALAAsgA0EQaiAAQQxqIAQQGiADKAIUIARHDQEgAygCECABIAQQKxoLIABBCGogBDYCACADQUBrJAAPC0GEFBAHAAtBhBQQBwALQYQUEAcAC98EAgN/AX4jAEHQAGsiAiQAIAIgAUHMAGo2AiQgASkDACEFIAEoAgghBCACIAJBJGo2AigCQCAEQT9NBEAgAUEMaiIDIARqQYABOgAAIAEgASgCCEEBaiIENgIIIAJBGGogAyAEEBcgAigCGEEAIAIoAhwQLRpBwAAgASgCCGtBB00EQCACQShqIAMQGCACQRBqIAMgAUEIaigCABAaIAIoAhBBACACKAIUEC0aCyACQQhqIANBOBAXIAIoAgxBCEcNASACKAIIIAVCOIYgBUIohkKAgICAgIDA/wCDhCAFQhiGQoCAgICA4D+DIAVCCIZCgICAgPAfg4SEIAVCCIhCgICA+A+DIAVCGIhCgID8B4OEIAVCKIhCgP4DgyAFQjiIhISENwAAIAJBKGogAxAYIAFBCGpBADYCACACQQA2AiggAkEoakEEciEEQQAhAwJAA0AgA0EgRg0BIAQgA2pBADoAACACIAIoAihBAWo2AiggA0EBaiEDDAALAAsgAkFAayABQeQAaikAADcDACACQThqIAFB3ABqKQAANwMAIAJBMGogAUHUAGopAAA3AwAgAiABKQBMNwMoQQAhAwJAA0AgA0EgRg0BIAJBKGogA2oiBCAEKAIAIgRBGHQgBEEIdEGAgPwHcXIgBEEIdkGA/gNxIARBGHZycjYCACADQQRqIQMMAAsACyAAIAIpAyg3AAAgAEEYaiACQUBrKQMANwAAIABBEGogAkE4aikDADcAACAAQQhqIAJBMGopAwA3AAAgAkHQAGokAA8LQdwTIARBwAAQ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KAJsIQggASAPNgJkIAEgDjYCYCABIBM2AmggASAYNgJsIAEgAjYCdCABIBc2AnAgASAQNgJ4IAEgDDYCfCABQdAAaiABQeAAaiABQfAAaiAHQevZwaJ6aiAIQfr/+4V5ahAeIAEoAlwhByABKAJYIQggASgCUCEKIAEoAlQhESABIAI2AmQgASAXNgJgIAEgEDYCaCABIAw2AmwgASARNgJ0IAEgCjYCcCABIAg2AnggASAHNgJ8IAFB0ABqIAFB4ABqIAFB8ABqIA1B8vHFs3xqIBlB98fm93tqEB4gASgCXCENIAEoAlghGCABKAJQIRMgACAeIAEoAlRqNgIEIAAgEyAdajYCACAAIAogIWo2AgggACARICJqNgIMIAAgGCAcajYCECAAIA0gG2o2AhQgACAIICBqNgIYIAAgByAfajYCHCABQYABaiQAC30BAX8jAEEwayICJAAgAiABNgIEIAIgADYCACACQSxqQQE2AgAgAkEUakECNgIAIAJBHGpBAjYCACACQQE2AiQgAkGMFTYCCCACQQI2AgwgAkHMDTYCECACIAI2AiAgAiACQQRqNgIoIAIgAkEgajYCGCACQQhqQZwVECgAC3wBAX8jAEEwayIDJAAgAyACNgIEIAMgATYCACADQSxqQQE2AgAgA0EUakECNgIAIANBHGpBAjYCACADQQE2AiQgA0HcFDYCCCADQQI2AgwgA0HMDTYCECADIANBBGo2AiAgAyADNgIoIAMgA0EgajYCGCADQQhqIAAQKAAL1gEBBn8gACABKAIAIgggAigCBCIHcyACKAIAIgVxIAggB3FzIAVBHncgBUETd3MgBUEKd3NqIAIoAggiBkEadyAGQRV3cyAGQQd3cyAEaiABKAIMaiABKAIIIgQgAigCDCIJcyAGcSAEc2oiCmoiAjYCBCAAIAogASgCBGoiATYCDCAAIAJBHncgAkETd3MgAkEKd3MgAiAHIAVzcSAHIAVxc2ogBCADaiAJIAEgCSAGc3FzaiABQRp3IAFBFXdzIAFBB3dzaiIFajYCACAAIAUgCGo2AggLeAAgACACQRl3IAJBA3ZzIAJBDndzIAEoAgAiAmo2AgAgACACQRl3IAJBA3ZzIAJBDndzIAEoAgQiAmo2AgQgACACQRl3IAJBA3ZzIAJBDndzIAEoAggiAmo2AgggACACQRl3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";
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/bin/sha512/sha512.base64.js
/**
* @hidden
*/
var sha512Base64Bytes = "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AjYCACAAIAJBAXI2AgQMBQsgAEGsEygCACACaiICQQFyNgIEQbQTIAA2AgBBrBMgAjYCACAAIAJqIAI2AgAMBAsgAxAiDAELQZwQQZwQKAIAQX4gAUEDdndxNgIACyAEIAJqIQIgAyAEaiEDCyADIAMoAgRBfnE2AgQgACACQQFyNgIEIAAgAmogAjYCAAJ/AkAgAkH/AU0EQCACQQN2IgFBA3RBpBBqIQJBnBAoAgAiA0EBIAFBH3F0IgFxRQ0BIAJBCGohAyACKAIIDAILIAAgAhAjDAILQZwQIAMgAXI2AgAgAkEIaiEDIAILIQEgAyAANgIAIAEgADYCDCAAIAI2AgwgACABNgIICyAFQQhqDwtBsBMgACACayIBNgIAQbgTQbgTKAIAIgAgAmoiAzYCACADIAFBAXI2AgQgACACQQNyNgIEIABBCGoLpQEBAn9BAiEFAkACQAJAAkACQCAAKAIEIgYgAWsgAk8NACABIAJqIgIgAUkhAQJAIAQEQEEAIQUgAQ0CIAZBAXQiASACIAIgAUkbIQIMAQtBACEFIAENAQsgAkEASA0AIAZFDQEgACgCACACEBMiAUUNAgwDCyAFDwsgAhAEIgENAQsgAw0BCyABBEAgACABNgIAIABBBGogAjYCAEECDwtBAQ8LAAsIAEG8FBAHAAtmAgF/A34jAEEwayIBJAAgACkCECECIAApAgghAyAAKQIAIQQgAUEUakEANgIAIAEgBDcDGCABQgE3AgQgAUGkDTYCECABIAFBGGo2AgAgASADNwMgIAEgAjcDKCABIAFBIGoQJwALsgEBAn8jAEGABGsiAyQAIANB2ABqIgRCADcDACADQgA3A1AgA0GgAWpBAEGEARAsGiADQeAAakHICkHAABAqGiADQdAAaiABIAIQCSADQagCaiADQdAAakHYARAqGiADQRBqIANBqAJqEAogA0HQAGogA0EQakHAABADIANBsAJqIAQoAgA2AgAgAyADKQNQNwOoAiADQQhqIANBqAJqEAsgACADKQMINwIAIANBgARqJAALuwMCBH8CfiMAQUBqIgMkACAAIAApAwgiByACrUIDhnwiCDcDCCAIIAdUBEAgACAAKQMAQgF8NwMACyADIABBEGo2AiggAyADQShqNgIsAkACQAJAAkACQAJAIAAoAlAiBQRAQYABIAVrIgQg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sBMoAgAgAGoiADYCACABIABBAXI2AgQgAUG0EygCAEYEQEGsE0EANgIAQbQTQQA2AgALQdQTKAIAIABPDQcCQCAAQSlJDQBBxBMhAANAIAAoAgAiAiABTQRAIAIgACgCBGogAUsNAgsgACgCCCIADQALC0EAIQFBzBMoAgAiAEUNBANAIAFBAWohASAAKAIIIgANAAsgAUH/HyABQf8fSxsMBQtBtBMgATYCAEGsE0GsEygCACAAaiIANgIADAcLIAIQIgwBC0GcEEGcECgCAEF+IANBA3Z3cTYCAAsgASAAQQFyNgIEIAEgAGogADYCACABQbQTKAIARw0CQawTIAA2AgAPC0H/HwshAUHUE0F/NgIAQdwTIAE2AgAPC0HcEwJ/AkACfwJAIABB/wFNBEAgAEEDdiICQQN0QaQQaiEAQZwQKAIAIgNBASACQR9xdCICcUUNASAAQQhqIQMgACgCCAwCCyABIAAQI0HcE0HcEygCAEF/aiIBNgIAIAENBEHMEygCACIARQ0CQQAhAQNAIAFBAWohASAAKAIIIgANAAsgAUH/HyABQf8fSxsMAwtBnBAgAyACcjYCACAAQQhqIQMgAAshAiADIAE2AgAgAiABNgIMIAEgADYCDCABIAI2AggPC0H/HwsiATYCAAsPCyABIABBAXI2AgQgASAAaiAANgIACzkAAkAgAiABTwRAIAJBgQFPDQEgACACIAFrNgIEIAAgAyABajYCAA8LIAEgAhAcAAsgAkGAARACAAtNAgF/An4jAEEQayIEJAAgBEEIakEAIAMgASACEBkgBCkDCCEFIAQgAyACIAEgAhAZIAQpAwAhBiAAIAU3AgAgACAGNwIIIARBEGokAAssAQF/IwBBEGsiAyQAIANBCGogAkGAASABEBUgACADKQMINwIAIANBEGokAAsOACAAKAIAKAIAIAEQGws3AAJAIAIgAU8EQCAEIAJJDQEgACACIAFrNgIEIAAgAyABajYCAA8LIAEgAhAcAAsgAiAEEAIACysBAX8jAEEQayIDJAAgA0EIakEAIAIgARAVIAAgAykDCDcCACADQRBqJAALqioCAn8ifiMAQYAPayICJAAgAkGADmogAUGAARAqGkEAIQECQANAIAFBgAFGDQEgAkGADmogAWoiAyADKQMAIhxCOIYgHEIohkKAgICAgIDA/wCD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c2VydGlvbiBmYWlsZWQ6IDggPT0gZHN0LmxlbigpL3Jvb3QvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9naXRodWIuY29tLTFlY2M2Mjk5ZGI5ZWM4MjMvYnl0ZS10b29scy0wLjIuMC9zcmMvd3JpdGVfc2luZ2xlLnJzAEHwCQvKBS9yb290Ly5jYXJnby9yZWdpc3RyeS9zcmMvZ2l0aHViLmNvbS0xZWNjNjI5OWRiOWVjODIzL2Jsb2NrLWJ1ZmZlci0wLjMuMy9zcmMvbGliLnJzAAAAAAAIybzzZ+YJajunyoSFrme7K/iU/nLzbjzxNh1fOvVPpdGC5q1/Ug5RH2w+K4xoBZtrvUH7q9mDH3khfhMZzeBbAAAAAABjYXBhY2l0eSBvdmVyZmxvd2NhbGxlZCBgT3B0aW9uOjp1bndyYXAoKWAgb24gYSBgTm9uZWAgdmFsdWVsaWJjb3JlL29wdGlvbi5yczAwMDEwMjAzMDQwNTA2MDcwODA5MTAxMTEyMTMxNDE1MTYxNzE4MTkyMDIxMjIyMzI0MjUyNjI3MjgyOTMwMzEzMjMzMzQzNTM2MzczODM5NDA0MTQyNDM0NDQ1NDY0NzQ4NDk1MDUxNTI1MzU0NTU1NjU3NTg1OTYwNjE2MjYzNjQ2NTY2Njc2ODY5NzA3MTcyNzM3NDc1NzY3Nzc4Nzk4MDgxODI4Mzg0ODU4Njg3ODg4OTkwOTE5MjkzOTQ5NTk2OTc5ODk5AAAAaW5kZXggb3V0IG9mIGJvdW5kczogdGhlIGxlbiBpcyAgYnV0IHRoZSBpbmRleCBpcyBsaWJjb3JlL3NsaWNlL21vZC5ycwABAAAAAAAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAAABAAAAAQAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAABpbmRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggc2xpY2UgaW5kZXggc3RhcnRzIGF0ICBidXQgZW5kcyBhdCBpbnRlcm5hbCBlcnJvcjogZW50ZXJlZCB1bnJlYWNoYWJsZSBjb2RlbGliYWxsb2MvcmF3X3ZlYy5ycwBB5BML/QEWBAAAJAAAAKcHAAATAAAASAIAAAkAAAA6BAAANAAAANcGAAAUAAAAbQYAAAkAAADwBAAAUwAAAEsAAAARAAAAbgQAACAAAACOBAAAWgAAAB8AAAAFAAAAjQUAABEAAACnBwAAEwAAAPICAAAFAAAAngUAACsAAADJBQAAEQAAAFkBAAAVAAAAAgAAAAAAAAABAAAAAwAAAKUGAAAgAAAAxQYAABIAAAA0BwAABgAAADoHAAAiAAAA1wYAABQAAACtBwAABQAAAFwHAAAWAAAAcgcAAA0AAADXBgAAFAAAALMHAAAFAAAAfwcAACgAAACnBwAAEwAAAPUBAAAeAAwHbGlua2luZwMC5A0=";
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/ripemd160.js
/**
* The most performant way to instantiate ripemd160 functionality. To avoid
* using Node.js or DOM-specific APIs, you can use {@link instantiateRipemd160}.
*
* @param webassemblyBytes - A buffer containing the ripemd160 binary.
*/
var instantiateRipemd160Bytes = async (webassemblyBytes) => {
	const wasm = await instantiateRustWasm(webassemblyBytes, "./ripemd160", "ripemd160", "ripemd160_init", "ripemd160_update", "ripemd160_final");
	return {
		final: wasm.final,
		hash: wasm.hash,
		init: wasm.init,
		update: wasm.update
	};
};
var getEmbeddedRipemd160Binary = () => base64ToBin(ripemd160Base64Bytes).buffer;
/**
* An ultimately-portable (but slower) version of
* {@link instantiateRipemd160Bytes} that does not require the consumer to
* provide the ripemd160 binary buffer.
*/
var instantiateRipemd160 = async () => instantiateRipemd160Bytes(getEmbeddedRipemd160Binary());
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/secp256k1.js
var Secp256k1Error;
(function(Secp256k1Error) {
	Secp256k1Error["unparsableSignature"] = "Failed to parse signature.";
	Secp256k1Error["unparsablePublicKey"] = "Failed to parse public key.";
	Secp256k1Error["derivePublicKeyFromInvalidPrivateKey"] = "Cannot derive public key from invalid private key.";
	Secp256k1Error["signWithInvalidPrivateKey"] = "Failed to sign message hash. The private key is not valid.";
	Secp256k1Error["recoverPublicKeyWithUnparsableSignature"] = "Failed to recover public key. Could not parse signature.";
	Secp256k1Error["recoverPublicKeyInvalidMaterial"] = "Failed to recover public key. The compact signature, recovery, or message hash is invalid.";
	Secp256k1Error["addTweakPrivateKey"] = "Private key is invalid or adding failed.";
	Secp256k1Error["mulTweakPrivateKey"] = "Private key is invalid or multiplying failed.";
	Secp256k1Error["addTweakPublicKey"] = "Failed to tweak public key (by addition).";
	Secp256k1Error["mulTweakPublicKey"] = "Failed to tweak public key (by multiplication).";
})(Secp256k1Error || (Secp256k1Error = {}));
/**
* @param secp256k1Wasm - a Secp256k1Wasm object
* @param randomSeed - a 32-byte random seed used to randomize the context after
* creation
*/
var wrapSecp256k1Wasm = (secp256k1Wasm, randomSeed) => {
	/**
	* Currently, this wrapper creates a context with both SIGN and VERIFY
	* capabilities. For better initialization performance, consumers could
	* re-implement a wrapper with only the capabilities they require.
	*/
	const contextPtr = secp256k1Wasm.contextCreate(ContextFlag.BOTH);
	/**
	* Since all of these methods are single-threaded and synchronous, we can
	* reuse allocated WebAssembly memory for each method without worrying about
	* calls interfering with each other. Likewise, these spaces never need to be
	* `free`d, since we will continue using them until this entire object (and
	* with it, the entire WebAssembly instance) is garbage collected.
	*
	* If malicious javascript gained access to this object, it should be
	* considered a critical vulnerability in the consumer. However, as a best
	* practice, we zero out private keys below when we're finished with them.
	*/
	const sigScratch = secp256k1Wasm.malloc(72);
	const publicKeyScratch = secp256k1Wasm.malloc(65);
	const messageHashScratch = secp256k1Wasm.malloc(32);
	const internalPublicKeyPtr = secp256k1Wasm.malloc(64);
	const internalSigPtr = secp256k1Wasm.malloc(64);
	const schnorrSigPtr = secp256k1Wasm.malloc(64);
	const privateKeyPtr = secp256k1Wasm.malloc(32);
	const internalRSigPtr = secp256k1Wasm.malloc(65);
	const recoveryNumPtr = secp256k1Wasm.malloc(4);
	const recoveryNumPtrView32 = recoveryNumPtr >> 2;
	const getRecoveryNumPtr = () => secp256k1Wasm.heapU32[recoveryNumPtrView32];
	const lengthPtr = secp256k1Wasm.malloc(4);
	const lengthPtrView32 = lengthPtr >> 2;
	const cloneAndPad = (value, expectedLength) => {
		const zeroPaddedValue = new Uint8Array(expectedLength);
		zeroPaddedValue.set(value);
		return zeroPaddedValue;
	};
	const parsePublicKey = (publicKey) => {
		const paddedPublicKey = cloneAndPad(publicKey, 65);
		secp256k1Wasm.heapU8.set(paddedPublicKey, publicKeyScratch);
		return secp256k1Wasm.pubkeyParse(contextPtr, internalPublicKeyPtr, publicKeyScratch, publicKey.length) === 1;
	};
	const setLengthPtr = (value) => {
		secp256k1Wasm.heapU32.set([value], lengthPtrView32);
	};
	const getLengthPtr = () => secp256k1Wasm.heapU32[lengthPtrView32];
	const serializePublicKey = (length, flag) => {
		setLengthPtr(length);
		secp256k1Wasm.pubkeySerialize(contextPtr, publicKeyScratch, lengthPtr, internalPublicKeyPtr, flag);
		return secp256k1Wasm.readHeapU8(publicKeyScratch, getLengthPtr()).slice();
	};
	const getSerializedPublicKey = (compressed) => compressed ? serializePublicKey(33, CompressionFlag.COMPRESSED) : serializePublicKey(65, CompressionFlag.UNCOMPRESSED);
	const convertPublicKey = (compressed) => (publicKey) => {
		if (!parsePublicKey(publicKey)) return Secp256k1Error.unparsablePublicKey;
		return getSerializedPublicKey(compressed);
	};
	const parseSignature = (signature, isDer) => {
		const paddedSignature = cloneAndPad(signature, 72);
		secp256k1Wasm.heapU8.set(paddedSignature, sigScratch);
		return isDer ? secp256k1Wasm.signatureParseDER(contextPtr, internalSigPtr, sigScratch, signature.length) === 1 : secp256k1Wasm.signatureParseCompact(contextPtr, internalSigPtr, sigScratch) === 1;
	};
	const getCompactSig = () => {
		secp256k1Wasm.signatureSerializeCompact(contextPtr, sigScratch, internalSigPtr);
		return secp256k1Wasm.readHeapU8(sigScratch, 64).slice();
	};
	const getDERSig = () => {
		setLengthPtr(72);
		secp256k1Wasm.signatureSerializeDER(contextPtr, sigScratch, lengthPtr, internalSigPtr);
		return secp256k1Wasm.readHeapU8(sigScratch, getLengthPtr()).slice();
	};
	const convertSignature = (wasDER) => (signature) => {
		if (!parseSignature(signature, wasDER)) return Secp256k1Error.unparsableSignature;
		return wasDER ? getCompactSig() : getDERSig();
	};
	const fillPrivateKeyPtr = (privateKey) => {
		const paddedPrivateKey = cloneAndPad(privateKey, 32);
		secp256k1Wasm.heapU8.set(paddedPrivateKey, privateKeyPtr);
	};
	const zeroOutPtr = (pointer, bytes) => {
		secp256k1Wasm.heapU8.fill(0, pointer, pointer + bytes);
	};
	const zeroOutPrivateKeyPtr = () => {
		zeroOutPtr(privateKeyPtr, 32);
	};
	const withPrivateKey = (privateKey, instructions) => {
		fillPrivateKeyPtr(privateKey);
		const ret = instructions();
		zeroOutPrivateKeyPtr();
		return ret;
	};
	const derivePublicKey = (compressed) => (privateKey) => {
		if (withPrivateKey(privateKey, () => secp256k1Wasm.pubkeyCreate(contextPtr, internalPublicKeyPtr, privateKeyPtr) !== 1)) return Secp256k1Error.derivePublicKeyFromInvalidPrivateKey;
		return getSerializedPublicKey(compressed);
	};
	const fillMessageHashScratch = (messageHash) => {
		const paddedMessageHash = cloneAndPad(messageHash, 32);
		secp256k1Wasm.heapU8.set(paddedMessageHash, messageHashScratch);
	};
	const normalizeSignature = () => {
		secp256k1Wasm.signatureNormalize(contextPtr, internalSigPtr, internalSigPtr);
	};
	const modifySignature = (isDer, normalize) => (signature) => {
		if (!parseSignature(signature, isDer)) return Secp256k1Error.unparsableSignature;
		if (normalize) normalizeSignature();
		else secp256k1Wasm.signatureMalleate(contextPtr, internalSigPtr, internalSigPtr);
		return isDer ? getDERSig() : getCompactSig();
	};
	const parseAndNormalizeSignature = (signature, isDer, normalize) => {
		const ret = parseSignature(signature, isDer);
		if (normalize) normalizeSignature();
		return ret;
	};
	const signMessageHash = (isDer) => (privateKey, messageHash) => {
		fillMessageHashScratch(messageHash);
		return withPrivateKey(privateKey, () => {
			if (secp256k1Wasm.sign(contextPtr, internalSigPtr, messageHashScratch, privateKeyPtr) !== 1) return Secp256k1Error.signWithInvalidPrivateKey;
			if (isDer) {
				setLengthPtr(72);
				secp256k1Wasm.signatureSerializeDER(contextPtr, sigScratch, lengthPtr, internalSigPtr);
				return secp256k1Wasm.readHeapU8(sigScratch, getLengthPtr()).slice();
			}
			secp256k1Wasm.signatureSerializeCompact(contextPtr, sigScratch, internalSigPtr);
			return secp256k1Wasm.readHeapU8(sigScratch, 64).slice();
		});
	};
	const signMessageHashSchnorr = () => (privateKey, messageHash) => {
		fillMessageHashScratch(messageHash);
		return withPrivateKey(privateKey, () => {
			if (secp256k1Wasm.schnorrSign(contextPtr, schnorrSigPtr, messageHashScratch, privateKeyPtr) !== 1) return Secp256k1Error.signWithInvalidPrivateKey;
			return secp256k1Wasm.readHeapU8(schnorrSigPtr, 64).slice();
		});
	};
	const verifyMessage = (messageHash) => {
		fillMessageHashScratch(messageHash);
		return secp256k1Wasm.verify(contextPtr, internalSigPtr, messageHashScratch, internalPublicKeyPtr) === 1;
	};
	const verifySignature = (isDer, normalize) => (signature, publicKey, messageHash) => parsePublicKey(publicKey) && parseAndNormalizeSignature(signature, isDer, normalize) && verifyMessage(messageHash);
	const verifyMessageSchnorr = (messageHash, signature) => {
		fillMessageHashScratch(messageHash);
		const paddedSignature = cloneAndPad(signature, 64);
		secp256k1Wasm.heapU8.set(paddedSignature, schnorrSigPtr);
		return secp256k1Wasm.schnorrVerify(contextPtr, schnorrSigPtr, messageHashScratch, internalPublicKeyPtr) === 1;
	};
	const verifySignatureSchnorr = () => (signature, publicKey, messageHash) => parsePublicKey(publicKey) ? verifyMessageSchnorr(messageHash, signature) : false;
	const signMessageHashRecoverable = (privateKey, messageHash) => {
		fillMessageHashScratch(messageHash);
		return withPrivateKey(privateKey, () => {
			if (secp256k1Wasm.signRecoverable(contextPtr, internalRSigPtr, messageHashScratch, privateKeyPtr) !== 1) return Secp256k1Error.signWithInvalidPrivateKey;
			secp256k1Wasm.recoverableSignatureSerialize(contextPtr, sigScratch, recoveryNumPtr, internalRSigPtr);
			return {
				recoveryId: getRecoveryNumPtr(),
				signature: secp256k1Wasm.readHeapU8(sigScratch, 64).slice()
			};
		});
	};
	const recoverPublicKey = (compressed) => (signature, recoveryId, messageHash) => {
		fillMessageHashScratch(messageHash);
		const paddedSignature = cloneAndPad(signature, 72);
		secp256k1Wasm.heapU8.set(paddedSignature, sigScratch);
		if (secp256k1Wasm.recoverableSignatureParse(contextPtr, internalRSigPtr, sigScratch, recoveryId) !== 1) return Secp256k1Error.recoverPublicKeyWithUnparsableSignature;
		if (secp256k1Wasm.recover(contextPtr, internalPublicKeyPtr, internalRSigPtr, messageHashScratch) !== 1) return Secp256k1Error.recoverPublicKeyInvalidMaterial;
		return getSerializedPublicKey(compressed);
	};
	const addTweakPrivateKey = (privateKey, tweakValue) => {
		fillMessageHashScratch(tweakValue);
		return withPrivateKey(privateKey, () => {
			if (secp256k1Wasm.privkeyTweakAdd(contextPtr, privateKeyPtr, messageHashScratch) !== 1) return Secp256k1Error.addTweakPrivateKey;
			return secp256k1Wasm.readHeapU8(privateKeyPtr, 32).slice();
		});
	};
	const mulTweakPrivateKey = (privateKey, tweakValue) => {
		fillMessageHashScratch(tweakValue);
		return withPrivateKey(privateKey, () => {
			if (secp256k1Wasm.privkeyTweakMul(contextPtr, privateKeyPtr, messageHashScratch) !== 1) return Secp256k1Error.mulTweakPrivateKey;
			return secp256k1Wasm.readHeapU8(privateKeyPtr, 32).slice();
		});
	};
	const addTweakPublicKey = (compressed) => (publicKey, tweakValue) => {
		if (!parsePublicKey(publicKey)) return Secp256k1Error.unparsablePublicKey;
		fillMessageHashScratch(tweakValue);
		if (secp256k1Wasm.pubkeyTweakAdd(contextPtr, internalPublicKeyPtr, messageHashScratch) !== 1) return Secp256k1Error.addTweakPublicKey;
		return getSerializedPublicKey(compressed);
	};
	const mulTweakPublicKey = (compressed) => (publicKey, tweakValue) => {
		if (!parsePublicKey(publicKey)) return Secp256k1Error.unparsablePublicKey;
		fillMessageHashScratch(tweakValue);
		if (secp256k1Wasm.pubkeyTweakMul(contextPtr, internalPublicKeyPtr, messageHashScratch) !== 1) return Secp256k1Error.mulTweakPublicKey;
		return getSerializedPublicKey(compressed);
	};
	if (randomSeed !== void 0) {
		const randomSeedPtr = messageHashScratch;
		const paddedRandomSeed = cloneAndPad(randomSeed, 32);
		secp256k1Wasm.heapU8.set(paddedRandomSeed, randomSeedPtr);
		secp256k1Wasm.contextRandomize(contextPtr, randomSeedPtr);
		zeroOutPtr(randomSeedPtr, 32);
	}
	return {
		addTweakPrivateKey,
		addTweakPublicKeyCompressed: addTweakPublicKey(true),
		addTweakPublicKeyUncompressed: addTweakPublicKey(false),
		compressPublicKey: convertPublicKey(true),
		derivePublicKeyCompressed: derivePublicKey(true),
		derivePublicKeyUncompressed: derivePublicKey(false),
		malleateSignatureCompact: modifySignature(false, false),
		malleateSignatureDER: modifySignature(true, false),
		mulTweakPrivateKey,
		mulTweakPublicKeyCompressed: mulTweakPublicKey(true),
		mulTweakPublicKeyUncompressed: mulTweakPublicKey(false),
		normalizeSignatureCompact: modifySignature(false, true),
		normalizeSignatureDER: modifySignature(true, true),
		recoverPublicKeyCompressed: recoverPublicKey(true),
		recoverPublicKeyUncompressed: recoverPublicKey(false),
		signMessageHashCompact: signMessageHash(false),
		signMessageHashDER: signMessageHash(true),
		signMessageHashRecoverableCompact: signMessageHashRecoverable,
		signMessageHashSchnorr: signMessageHashSchnorr(),
		signatureCompactToDER: convertSignature(false),
		signatureDERToCompact: convertSignature(true),
		uncompressPublicKey: convertPublicKey(false),
		validatePrivateKey: (privateKey) => withPrivateKey(privateKey, () => secp256k1Wasm.seckeyVerify(contextPtr, privateKeyPtr) === 1),
		validatePublicKey: parsePublicKey,
		verifySignatureCompact: verifySignature(false, true),
		verifySignatureCompactLowS: verifySignature(false, false),
		verifySignatureDER: verifySignature(true, true),
		verifySignatureDERLowS: verifySignature(true, false),
		verifySignatureSchnorr: verifySignatureSchnorr()
	};
};
/**
* Create and wrap a Secp256k1 WebAssembly instance to expose a set of
* purely-functional Secp256k1 methods. For slightly faster initialization, use
* {@link instantiateSecp256k1Bytes}.
*
* @param randomSeed - a 32-byte random seed used to randomize the secp256k1
* context after creation. See the description in
* {@link instantiateSecp256k1Bytes} for details.
*/
var instantiateSecp256k1 = async (randomSeed) => wrapSecp256k1Wasm(await instantiateSecp256k1Wasm(), randomSeed);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/sha1.js
/**
* The most performant way to instantiate sha1 functionality. To avoid
* using Node.js or DOM-specific APIs, you can use {@link instantiateSha1}.
*
* @param webassemblyBytes - A buffer containing the sha1 binary.
*/
var instantiateSha1Bytes = async (webassemblyBytes) => {
	const wasm = await instantiateRustWasm(webassemblyBytes, "./sha1", "sha1", "sha1_init", "sha1_update", "sha1_final");
	return {
		final: wasm.final,
		hash: wasm.hash,
		init: wasm.init,
		update: wasm.update
	};
};
var getEmbeddedSha1Binary = () => base64ToBin(sha1Base64Bytes).buffer;
/**
* An ultimately-portable (but slower) version of {@link instantiateSha1Bytes}
* that does not require the consumer to provide the sha1 binary buffer.
*/
var instantiateSha1 = async () => instantiateSha1Bytes(getEmbeddedSha1Binary());
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/sha256.js
/**
* The most performant way to instantiate sha256 functionality. To avoid
* using Node.js or DOM-specific APIs, you can use {@link instantiateSha256}.
*
* @param webassemblyBytes - A buffer containing the sha256 binary.
*/
var instantiateSha256Bytes = async (webassemblyBytes) => {
	const wasm = await instantiateRustWasm(webassemblyBytes, "./sha256", "sha256", "sha256_init", "sha256_update", "sha256_final");
	return {
		final: wasm.final,
		hash: wasm.hash,
		init: wasm.init,
		update: wasm.update
	};
};
var getEmbeddedSha256Binary = () => base64ToBin(sha256Base64Bytes).buffer;
/**
* An ultimately-portable (but possibly slower) version of
* {@link instantiateSha256Bytes} which does not require the consumer to provide
* the sha256 binary buffer.
*/
var instantiateSha256 = async () => instantiateSha256Bytes(getEmbeddedSha256Binary());
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/sha512.js
/**
* The most performant way to instantiate sha512 functionality. To avoid
* using Node.js or DOM-specific APIs, you can use {@link instantiateSha512}.
*
* @param webassemblyBytes - A buffer containing the sha512 binary.
*/
var instantiateSha512Bytes = async (webassemblyBytes) => {
	const wasm = await instantiateRustWasm(webassemblyBytes, "./sha512", "sha512", "sha512_init", "sha512_update", "sha512_final");
	return {
		final: wasm.final,
		hash: wasm.hash,
		init: wasm.init,
		update: wasm.update
	};
};
var getEmbeddedSha512Binary = () => base64ToBin(sha512Base64Bytes).buffer;
/**
* An ultimately-portable (but slower) version of {@link instantiateSha512Bytes}
* that does not require the consumer to provide the sha512 binary buffer.
*/
var instantiateSha512 = async () => instantiateSha512Bytes(getEmbeddedSha512Binary());
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/default-crypto-instances.js
var [sha1, sha256, sha512, ripemd160, secp256k1] = await Promise.all([
	instantiateSha1(),
	instantiateSha256(),
	instantiateSha512(),
	instantiateRipemd160(),
	instantiateSecp256k1()
]);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/combinations.js
/**
* Hash the given payload with sha256, then hash the 32-byte result with
* one final round of sha256, returning a 32-byte hash.
*
* This type of hash is used to generate identifiers for transactions and blocks
* (and therefore in block mining).
*
* @param payload - the Uint8Array to hash
*/
var hash256 = (payload, sha256$23 = sha256) => sha256$23.hash(sha256$23.hash(payload));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/crypto/hmac.js
/**
* Instantiate a hash-based message authentication code (HMAC) function as
* specified by RFC 2104.
*
* @param hashFunction - a cryptographic hash function that iterates a basic
* compression function over blocks of data
* @param blockByteLength - the byte-length of blocks used in `hashFunction`
*/
var instantiateHmacFunction = (hashFunction, blockByteLength) => (secret, message) => {
	const key = new Uint8Array(blockByteLength).fill(0);
	key.set(secret.length > blockByteLength ? hashFunction(secret) : secret, 0);
	const innerResult = hashFunction(flattenBinArray([new Uint8Array(blockByteLength).fill(54).map((pad, index) => pad ^ key[index]), message]));
	return hashFunction(flattenBinArray([new Uint8Array(blockByteLength).fill(92).map((pad, index) => pad ^ key[index]), innerResult]));
};
var sha512BlockByteLength = 128;
/**
* Create a hash-based message authentication code using HMAC-SHA512 as
* specified in `RFC 4231`. Returns a 64-byte Uint8Array.
*
* Secrets longer than the block byte-length (128 bytes) are hashed before
* use, shortening their length to the minimum recommended length (64 bytes).
* See `RFC 2104` for details.
*
* @param secret - the secret key (recommended length: 64-128 bytes)
* @param message - the message to authenticate
* @param sha512 - an implementation of Sha512 (defaults to the
* internal WASM implementation)
*/
var hmacSha512 = (secret, message, sha512$1 = sha512) => instantiateHmacFunction(sha512$1.hash, sha512BlockByteLength)(secret, message);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/address/bech32.js
/**
* The list of 32 symbols used in Bech32 encoding.
*/
var bech32CharacterSet = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
/**
* An object mapping each of the 32 symbols used in Bech32 encoding to their respective index in the character set.
*/
var bech32CharacterSetIndex = {
	q: 0,
	p: 1,
	z: 2,
	r: 3,
	y: 4,
	"9": 5,
	x: 6,
	"8": 7,
	g: 8,
	f: 9,
	"2": 10,
	t: 11,
	v: 12,
	d: 13,
	w: 14,
	"0": 15,
	s: 16,
	"3": 17,
	j: 18,
	n: 19,
	"5": 20,
	"4": 21,
	k: 22,
	h: 23,
	c: 24,
	e: 25,
	"6": 26,
	m: 27,
	u: 28,
	a: 29,
	"7": 30,
	l: 31
};
var BitRegroupingError;
(function(BitRegroupingError) {
	BitRegroupingError["integerOutOfRange"] = "An integer provided in the source array is out of the range of the specified source word length.";
	BitRegroupingError["hasDisallowedPadding"] = "Encountered padding when padding was disallowed.";
	BitRegroupingError["requiresDisallowedPadding"] = "Encoding requires padding while padding is disallowed.";
})(BitRegroupingError || (BitRegroupingError = {}));
/**
* Given an array of integers, regroup bits from `sourceWordLength` to
* `resultWordLength`, returning a new array of integers between 0 and
* toWordLength^2.
*
* Note, if `bin` is within the range of `sourceWordLength` and `padding` is
* `true`, this method will never error.
*
* A.K.A. `convertbits`
*/
var regroupBits = ({ bin, sourceWordLength, resultWordLength, allowPadding = true }) => {
	let accumulator = 0;
	let bits = 0;
	const result = [];
	const maxResultInt = (1 << resultWordLength) - 1;
	for (let p = 0; p < bin.length; ++p) {
		const value = bin[p];
		if (value < 0 || value >> sourceWordLength !== 0) return BitRegroupingError.integerOutOfRange;
		accumulator = accumulator << sourceWordLength | value;
		bits += sourceWordLength;
		while (bits >= resultWordLength) {
			bits -= resultWordLength;
			result.push(accumulator >> bits & maxResultInt);
		}
	}
	if (allowPadding) {
		if (bits > 0) result.push(accumulator << resultWordLength - bits & maxResultInt);
	} else if (bits >= sourceWordLength) return BitRegroupingError.hasDisallowedPadding;
	else if ((accumulator << resultWordLength - bits & maxResultInt) > 0) return BitRegroupingError.requiresDisallowedPadding;
	return result;
};
/**
* Encode an array of numbers as a base32 string using the Bech32 character set.
*
* Note, this method always completes. For a valid result, all items in
* `base32IntegerArray` must be between `0` and `32`. To prepare another array
* type for encoding, see {@link regroupBits}.
*
* For the reverse, see {@link decodeBech32}.
*
* @param base32IntegerArray - the array of 5-bit integers to encode
*/
var encodeBech32 = (base32IntegerArray) => {
	let result = "";
	for (let i = 0; i < base32IntegerArray.length; i++) result += bech32CharacterSet[base32IntegerArray[i]];
	return result;
};
/**
* Decode a Bech32-encoded string into an array of 5-bit integers.
*
* Note, this method always completes. If `validBech32` is not valid bech32,
* an incorrect result will be returned. If `validBech32` is potentially
* malformed, check it with {@link isBech32CharacterSet} before calling
* this method.
*
* For the reverse, see {@link encodeBech32}.
*
* @param validBech32 - the bech32-encoded string to decode
*/
var decodeBech32 = (validBech32) => {
	const result = [];
	for (let i = 0; i < validBech32.length; i++) result.push(bech32CharacterSetIndex[validBech32[i]]);
	return result;
};
var nonBech32Characters = new RegExp(`[^${bech32CharacterSet}]`, "u");
/**
* Validate that a string uses only characters from the bech32 character set.
*
* @param maybeBech32 - a string to test for valid Bech32 encoding
*/
var isBech32CharacterSet = (maybeBech32) => !nonBech32Characters.test(maybeBech32);
/**
* Returns an array of the non-Bech32 characters in the provided string; if all
* characters are valid, an empty array is returned.
* @param maybeBech32 - the string to test
*/
var extractNonBech32Characters = (maybeBech32) => [...new Set([...maybeBech32].filter((character) => !bech32CharacterSet.includes(character)))];
var Bech32DecodingError;
(function(Bech32DecodingError) {
	Bech32DecodingError["notBech32CharacterSet"] = "Bech32 decoding error: input contains characters outside of the Bech32 character set.";
})(Bech32DecodingError || (Bech32DecodingError = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/address/cash-address.js
var CashAddressNetworkPrefix;
(function(CashAddressNetworkPrefix) {
	CashAddressNetworkPrefix["mainnet"] = "bitcoincash";
	CashAddressNetworkPrefix["testnet"] = "bchtest";
	CashAddressNetworkPrefix["regtest"] = "bchreg";
})(CashAddressNetworkPrefix || (CashAddressNetworkPrefix = {}));
/**
* The CashAddress specification standardizes the format of the version byte:
* - Most significant bit: reserved, must be `0`
* - next 4 bits: Address Type
* - 3 least significant bits: Payload Length
*
* Two Address Type values are currently standardized:
* - 0 (`0b0000`): P2PKH
* - 1 (`0b0001`): P2SH
*
* And two are proposed by `CHIP-2022-02-CashTokens`:
* - 2 (`0b0010`): P2PKH + Token Support
* - 3 (`0b0011`): P2SH + Token Support
*
* The CashAddress specification standardizes expected payload length using
* {@link CashAddressLengthBits}. Currently, two length bit values are in use by
* standard CashAddress types:
* - `0` (`0b000`): 20 bytes (in use by `p2pkh` and `p2sh20`)
* - `3` (`0b011`): 32 bytes (in use by `p2sh32`)
*/
var CashAddressVersionByte;
(function(CashAddressVersionByte) {
	/**
	* Pay to Public Key Hash (P2PKH): `0b00000000`
	*
	* - Most significant bit: `0` (reserved)
	* - Address Type bits: `0000` (P2PKH)
	* - Length bits: `000` (20 bytes)
	*/
	CashAddressVersionByte[CashAddressVersionByte["p2pkh"] = 0] = "p2pkh";
	/**
	* 20-byte Pay to Script Hash (P2SH20): `0b00001000`
	*
	* - Most significant bit: `0` (reserved)
	* - Address Type bits: `0001` (P2SH)
	* - Length bits: `000` (20 bytes)
	*/
	CashAddressVersionByte[CashAddressVersionByte["p2sh20"] = 8] = "p2sh20";
	/**
	* 32-byte Pay to Script Hash (P2SH20): `0b00001000`
	*
	* - Most significant bit: `0` (reserved)
	* - Address Type bits: `0001` (P2SH)
	* - Length bits: `011` (32 bytes)
	*/
	CashAddressVersionByte[CashAddressVersionByte["p2sh32"] = 11] = "p2sh32";
	/**
	* Pay to Public Key Hash (P2PKH) with token support: `0b00010000`
	*
	* - Most significant bit: `0` (reserved)
	* - Address Type bits: `0010` (P2PKH + Tokens)
	* - Length bits: `000` (20 bytes)
	*/
	CashAddressVersionByte[CashAddressVersionByte["p2pkhWithTokens"] = 16] = "p2pkhWithTokens";
	/**
	* 20-byte Pay to Script Hash (P2SH20) with token support: `0b00011000`
	* - Most significant bit: `0` (reserved)
	* - Address Type bits: `0011` (P2SH + Tokens)
	* - Length bits: `000` (20 bytes)
	*/
	CashAddressVersionByte[CashAddressVersionByte["p2sh20WithTokens"] = 24] = "p2sh20WithTokens";
	/**
	* 32-byte Pay to Script Hash (P2SH32) with token support: `0b00011011`
	* - Most significant bit: `0` (reserved)
	* - Address Type bits: `0011` (P2SH + Tokens)
	* - Length bits: `011` (32 bytes)
	*/
	CashAddressVersionByte[CashAddressVersionByte["p2sh32WithTokens"] = 27] = "p2sh32WithTokens";
})(CashAddressVersionByte || (CashAddressVersionByte = {}));
/**
* The address types currently defined in the CashAddress specification. See
* also: {@link CashAddressVersionByte}.
*/
var CashAddressType;
(function(CashAddressType) {
	/**
	* Pay to Public Key Hash (P2PKH): `0b0000`
	*/
	CashAddressType["p2pkh"] = "p2pkh";
	/**
	* Pay to Script Hash (P2SH): `0b0001`
	*
	* Note, this type is used for both {@link CashAddressVersionByte.p2sh20} and
	* {@link CashAddressVersionByte.p2sh32}.
	*/
	CashAddressType["p2sh"] = "p2sh";
	/**
	* Pay to Public Key Hash (P2PKH) with token support: `0b0010`
	*/
	CashAddressType["p2pkhWithTokens"] = "p2pkhWithTokens";
	/**
	* Pay to Script Hash (P2SH) with token support: `0b0011`
	*
	* Note, this type is used for both
	* {@link CashAddressVersionByte.p2sh20WithTokens} and
	* {@link CashAddressVersionByte.p2sh32WithTokens}.
	*/
	CashAddressType["p2shWithTokens"] = "p2shWithTokens";
})(CashAddressType || (CashAddressType = {}));
/**
* The address type bits currently defined in the CashAddress specification.
* These map to: {@link CashAddressType}.
*/
var CashAddressTypeBits;
(function(CashAddressTypeBits) {
	/**
	* Pay to Public Key Hash (P2PKH)
	*/
	CashAddressTypeBits[CashAddressTypeBits["p2pkh"] = 0] = "p2pkh";
	/**
	* Pay to Script Hash (P2SH)
	*/
	CashAddressTypeBits[CashAddressTypeBits["p2sh"] = 1] = "p2sh";
	/**
	* Pay to Public Key Hash (P2PKH) with token support
	*/
	CashAddressTypeBits[CashAddressTypeBits["p2pkhWithTokens"] = 2] = "p2pkhWithTokens";
	/**
	* Pay to Script Hash (P2SH) with token support
	*/
	CashAddressTypeBits[CashAddressTypeBits["p2shWithTokens"] = 3] = "p2shWithTokens";
})(CashAddressTypeBits || (CashAddressTypeBits = {}));
var cashAddressTypeToTypeBits = {
	[CashAddressType.p2pkh]: CashAddressTypeBits.p2pkh,
	[CashAddressType.p2sh]: CashAddressTypeBits.p2sh,
	[CashAddressType.p2pkhWithTokens]: CashAddressTypeBits.p2pkhWithTokens,
	[CashAddressType.p2shWithTokens]: CashAddressTypeBits.p2shWithTokens
};
var cashAddressTypeBitsToType = {
	[CashAddressTypeBits.p2pkh]: CashAddressType.p2pkh,
	[CashAddressTypeBits.p2sh]: CashAddressType.p2sh,
	[CashAddressTypeBits.p2pkhWithTokens]: CashAddressType.p2pkhWithTokens,
	[CashAddressTypeBits.p2shWithTokens]: CashAddressType.p2shWithTokens
};
var cashAddressLengthBitsToLength = {
	0: 20,
	1: 24,
	2: 28,
	3: 32,
	4: 40,
	5: 48,
	6: 56,
	7: 64
};
var cashAddressLengthToLengthBits = {
	20: 0,
	24: 1,
	28: 2,
	32: 3,
	40: 4,
	48: 5,
	56: 6,
	64: 7
};
/**
* Encode a CashAddress version byte for the given address type and payload
* length. See {@link CashAddressVersionByte} for more information.
*
* The `type` parameter must be a number between `0` and `15`, and `bitLength`
* must be one of the standardized lengths. To use the contents of a variable,
* cast it to {@link CashAddressType} or
* {@link CashAddressSupportedLength} respectively,
* e.g.:
* ```ts
* const type = 3 as CashAddressType;
* const length = 20 as CashAddressSupportedLength;
* getCashAddressVersionByte(type, length);
* ```
*
* For the reverse, see {@link decodeCashAddressVersionByte}.
*
* @param typeBits - The address type bit of the payload being encoded.
* @param length - The length of the payload being encoded.
*/
var encodeCashAddressVersionByte = (typeBits, length) => typeBits << 3 | cashAddressLengthToLengthBits[length];
var CashAddressVersionByteDecodingError;
(function(CashAddressVersionByteDecodingError) {
	CashAddressVersionByteDecodingError["reservedBitSet"] = "Reserved bit is set.";
})(CashAddressVersionByteDecodingError || (CashAddressVersionByteDecodingError = {}));
/**
* Decode a CashAddress version byte. For a list of known versions, see
* {@link CashAddressVersionByte}.
*
* For the reverse, see {@link encodeCashAddressVersionByte}.
*
* @param version - The version byte to decode.
*/
var decodeCashAddressVersionByte = (version) => (version & 128) !== 0 ? CashAddressVersionByteDecodingError.reservedBitSet : {
	length: cashAddressLengthBitsToLength[version & 7],
	typeBits: version >>> 3 & 15
};
/**
* Convert a string into an array of 5-bit numbers, representing the characters
* in a case-insensitive way.
*
* @param prefix - The prefix to mask.
*/
var maskCashAddressPrefix = (prefix) => {
	const result = [];
	for (let i = 0; i < prefix.length; i++) result.push(prefix.charCodeAt(i) & 31);
	return result;
};
var bech32GeneratorMostSignificantByte = [
	152,
	121,
	243,
	174,
	30
];
var bech32GeneratorRemainingBytes = [
	4072443489,
	3077413346,
	1046459332,
	783016616,
	1329849456
];
/**
* Perform the CashAddress polynomial modulo operation, which is based on the
* Bech32 polynomial modulo operation, but the returned checksum is 40 bits,
* rather than 30.
*
* A.K.A. `PolyMod`
*
* @remarks
* Notes from C++ implementation:
* This function will compute what 8 5-bit values to XOR into the last 8 input
* values, in order to make the checksum 0. These 8 values are packed together
* in a single 40-bit integer. The higher bits correspond to earlier values.
*
* The input is interpreted as a list of coefficients of a polynomial over F
* = GF(32), with an implicit 1 in front. If the input is [v0,v1,v2,v3,v4],
* that polynomial is v(x) = 1*x^5 + v0*x^4 + v1*x^3 + v2*x^2 + v3*x + v4.
* The implicit 1 guarantees that [v0,v1,v2,...] has a distinct checksum
* from [0,v0,v1,v2,...].
*
* The output is a 40-bit integer whose 5-bit groups are the coefficients of
* the remainder of v(x) mod g(x), where g(x) is the cashaddr generator, x^8
* + [19]*x^7 + [3]*x^6 + [25]*x^5 + [11]*x^4 + [25]*x^3 + [3]*x^2 + [19]*x
* + [1]. g(x) is chosen in such a way that the resulting code is a BCH
* code, guaranteeing detection of up to 4 errors within a window of 1025
* characters. Among the various possible BCH codes, one was selected to in
* fact guarantee detection of up to 5 errors within a window of 160
* characters and 6 errors within a window of 126 characters. In addition,
* the code guarantee the detection of a burst of up to 8 errors.
*
* Note that the coefficients are elements of GF(32), here represented as
* decimal numbers between []. In this finite field, addition is just XOR of
* the corresponding numbers. For example, [27] + [13] = [27 ^ 13] = [22].
* Multiplication is more complicated, and requires treating the bits of
* values themselves as coefficients of a polynomial over a smaller field,
* GF(2), and multiplying those polynomials mod a^5 + a^3 + 1. For example,
* [5] * [26] = (a^2 + 1) * (a^4 + a^3 + a) = (a^4 + a^3 + a) * a^2 + (a^4 +
* a^3 + a) = a^6 + a^5 + a^4 + a = a^3 + 1 (mod a^5 + a^3 + 1) = [9].
*
* During the course of the loop below, `c` contains the bit-packed
* coefficients of the polynomial constructed from just the values of v that
* were processed so far, mod g(x). In the above example, `c` initially
* corresponds to 1 mod (x), and after processing 2 inputs of v, it
* corresponds to x^2 + v0*x + v1 mod g(x). As 1 mod g(x) = 1, that is the
* starting value for `c`.
*
* @param v - Array of 5-bit integers over which the checksum is to be computed.
*/
var cashAddressPolynomialModulo = (v) => {
	let mostSignificantByte = 0;
	let lowerBytes = 1;
	let c = 0;
	for (let j = 0; j < v.length; j++) {
		c = mostSignificantByte >>> 3;
		mostSignificantByte &= 7;
		mostSignificantByte <<= 5;
		mostSignificantByte |= lowerBytes >>> 27;
		lowerBytes &= 134217727;
		lowerBytes <<= 5;
		lowerBytes ^= v[j];
		for (let i = 0; i < bech32GeneratorMostSignificantByte.length; ++i) if (c & 1 << i) {
			mostSignificantByte ^= bech32GeneratorMostSignificantByte[i];
			lowerBytes ^= bech32GeneratorRemainingBytes[i];
		}
	}
	lowerBytes ^= 1;
	if (lowerBytes < 0) {
		lowerBytes ^= 1 << 31;
		lowerBytes += (1 << 30) * 2;
	}
	return mostSignificantByte * (1 << 30) * 4 + lowerBytes;
};
/**
* Convert the checksum returned by {@link cashAddressPolynomialModulo} to an
* array of 5-bit positive integers that can be Base32 encoded.
* @param checksum - A 40 bit checksum returned by
* {@link cashAddressPolynomialModulo}.
*/
var cashAddressChecksumToUint5Array = (checksum) => {
	const result = [];
	for (let i = 0; i < 8; ++i) {
		result.push(checksum & 31);
		checksum /= 32;
	}
	return result.reverse();
};
var CashAddressFormatEncodingError;
(function(CashAddressFormatEncodingError) {
	CashAddressFormatEncodingError["excessiveVersion"] = "CashAddress format encoding error: version must be 255 or less.";
})(CashAddressFormatEncodingError || (CashAddressFormatEncodingError = {}));
var CashAddressEncodingError;
(function(CashAddressEncodingError) {
	CashAddressEncodingError["noTypeBitsValueStandardizedForP2pk"] = "CashAddress encoding error: no CashAddress type bit has been standardized for P2PK locking bytecode.";
	CashAddressEncodingError["unsupportedPayloadLength"] = "CashAddress encoding error: a payload of this length can not be encoded as a valid CashAddress.";
	CashAddressEncodingError["unknownLockingBytecodeType"] = "CashAddress encoding error: unknown locking bytecode type.";
})(CashAddressEncodingError || (CashAddressEncodingError = {}));
/**
* Encode a payload as a CashAddress-like string using the CashAddress format.
*
* Note that this function defaults to throwing encoding errors. To handle
* errors in a type-safe way, set `throwErrors` to `false`.
*
* For the reverse, see {@link decodeCashAddressFormat}.
*
* To encode a standard CashAddress, use {@link encodeCashAddress}.
*/
var encodeCashAddressFormat = ({ payload, prefix, throwErrors = true, version }) => {
	const checksum40BitPlaceholder = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	if (version > 255) return formatError(CashAddressFormatEncodingError.excessiveVersion, `Version: ${version}.`, throwErrors);
	const payloadContents = regroupBits({
		bin: Uint8Array.from([version, ...payload]),
		resultWordLength: 5,
		sourceWordLength: 8
	});
	const checksum = cashAddressPolynomialModulo([
		...maskCashAddressPrefix(prefix),
		0,
		...payloadContents,
		...checksum40BitPlaceholder
	]);
	return { address: `${prefix}:${encodeBech32([...payloadContents, ...cashAddressChecksumToUint5Array(checksum)])}` };
};
var isValidCashAddressPayloadLength = (length) => cashAddressLengthToLengthBits[length] !== void 0;
/**
* Encode a payload as a CashAddress. This function is similar to
* {@link encodeCashAddress} but supports non-standard `prefix`es and `type`s.
*
* Note that this function defaults to throwing encoding errors. To handle
* errors in a type-safe way, set `throwErrors` to `false`.
*
* For other address standards that closely follow the CashAddress
* specification (but have alternative version byte requirements), use
* {@link encodeCashAddressFormat}.
*
* For the reverse, see {@link decodeCashAddressNonStandard}.
*/
var encodeCashAddressNonStandard = ({ payload, prefix, throwErrors = true, typeBits }) => {
	const { length } = payload;
	if (!isValidCashAddressPayloadLength(length)) return formatError(CashAddressEncodingError.unsupportedPayloadLength, `Payload length: ${length}.`, throwErrors);
	return encodeCashAddressFormat({
		payload,
		prefix,
		throwErrors,
		version: encodeCashAddressVersionByte(typeBits, length)
	});
};
/**
* Encode a payload as a CashAddress.
*
* Note that this function defaults to throwing encoding errors. To handle
* errors in a type-safe way, set `throwErrors` to `false`.
*
* To encode a CashAddress with a custom/unknown prefix or type bit, see
* {@link encodeCashAddressNonStandard}. For other address standards that
* closely follow the CashAddress specification (but have alternative version
* byte requirements), use {@link encodeCashAddressFormat}.
*
* To decode a CashAddress, use {@link decodeCashAddress}.
*
* @returns If `throwErrors` is `true`, the CashAddress as a `string`. If
* `throwErrors` is `false`, a {@link CashAddressResult} on successful encoding
* or an error message as a `string`.
*/
var encodeCashAddress = ({ payload, prefix = "bitcoincash", throwErrors = true, type }) => encodeCashAddressNonStandard({
	payload,
	prefix,
	throwErrors,
	typeBits: cashAddressTypeToTypeBits[type]
});
var CashAddressDecodingError;
(function(CashAddressDecodingError) {
	CashAddressDecodingError["improperPadding"] = "CashAddress decoding error: the payload is improperly padded.";
	CashAddressDecodingError["invalidCharacters"] = "CashAddress decoding error: the payload contains unexpected characters.";
	CashAddressDecodingError["invalidChecksum"] = "CashAddress decoding error: invalid checksum - please review the address for errors.";
	CashAddressDecodingError["invalidFormat"] = "CashAddress decoding error: CashAddresses should be of the form \"prefix:payload\".";
	CashAddressDecodingError["mismatchedPayloadLength"] = "CashAddress decoding error: mismatched payload length for specified address version.";
	CashAddressDecodingError["reservedBit"] = "CashAddress decoding error: unknown CashAddress version, reserved bit set.";
	CashAddressDecodingError["unknownAddressType"] = "CashAddress decoding error: unknown CashAddress type.";
})(CashAddressDecodingError || (CashAddressDecodingError = {}));
/**
* Decode and validate a string using the CashAddress format. This is more
* lenient than {@link decodeCashAddress}, which also validates the contents of
* the version byte.
*
* Note, this method requires `address` to include a network prefix. To
* decode a string with an unknown prefix, try
* {@link decodeCashAddressFormatWithoutPrefix}.
*
* For the reverse, see {@link encodeCashAddressFormat}.
*
* @param address - The CashAddress-like string to decode.
*/
var decodeCashAddressFormat = (address) => {
	const parts = address.toLowerCase().split(":");
	if (parts.length !== 2 || parts[0] === "" || parts[1] === "") return formatError(CashAddressDecodingError.invalidFormat, `Provided address: "${address}".`);
	const [prefix, payload] = parts;
	if (!isBech32CharacterSet(payload)) return formatError(CashAddressDecodingError.invalidCharacters, `Invalid characters: ${extractNonBech32Characters(payload).join(", ")}.`);
	const decodedPayload = decodeBech32(payload);
	if (cashAddressPolynomialModulo([
		...maskCashAddressPrefix(prefix),
		0,
		...decodedPayload
	]) !== 0) return CashAddressDecodingError.invalidChecksum;
	const payloadContents = regroupBits({
		allowPadding: false,
		bin: decodedPayload.slice(0, -8),
		resultWordLength: 8,
		sourceWordLength: 5
	});
	if (typeof payloadContents === "string") return formatError(CashAddressDecodingError.improperPadding, payloadContents);
	const [version, ...contents] = payloadContents;
	return {
		payload: Uint8Array.from(contents),
		prefix,
		version
	};
};
/**
* Decode and validate a CashAddress, strictly checking the version byte
* according to the CashAddress specification. This is important for error
* detection in CashAddresses.
*
* This function is similar to {@link decodeCashAddress} but supports
* non-standard `type`s.
*
* For other address-like standards that closely follow the CashAddress
* specification (but have alternative version byte requirements), use
* {@link decodeCashAddressFormat}.
*
* Note, this method requires that CashAddresses include a network prefix. To
* decode an address with an unknown prefix, try
* {@link decodeCashAddressFormatWithoutPrefix}.
*
* For the reverse, see {@link encodeCashAddressNonStandard}.
*
* @param address - The CashAddress to decode.
*/
var decodeCashAddressNonStandard = (address) => {
	const decoded = decodeCashAddressFormat(address);
	if (typeof decoded === "string") return decoded;
	const info = decodeCashAddressVersionByte(decoded.version);
	if (info === CashAddressVersionByteDecodingError.reservedBitSet) return formatError(CashAddressDecodingError.reservedBit);
	if (decoded.payload.length !== info.length) return formatError(CashAddressDecodingError.mismatchedPayloadLength, `Version byte indicated a byte length of ${info.length}, but the payload is ${decoded.payload.length} bytes.`);
	return {
		payload: decoded.payload,
		prefix: decoded.prefix,
		typeBits: info.typeBits
	};
};
/**
* Decode and validate a CashAddress, strictly checking the version byte
* according to the CashAddress specification. This is important for error
* detection in CashAddresses.
*
* To decode CashAddresses with non-standard `type`s,
* see {@link decodeCashAddressNonStandard}.
*
* For other address-like standards that closely follow the CashAddress
* specification (but have alternative version byte requirements), use
* {@link decodeCashAddressFormat}.
*
* Note, this method requires that CashAddresses include a network prefix. To
* decode an address with an unknown prefix, try
* {@link decodeCashAddressFormatWithoutPrefix}.
*
* To encode a CashAddress, use {@link encodeCashAddress}.
*
* @param address - The CashAddress to decode.
*/
var decodeCashAddress = (address) => {
	const decoded = decodeCashAddressNonStandard(address);
	if (typeof decoded === "string") return decoded;
	const type = cashAddressTypeBitsToType[decoded.typeBits];
	if (type === void 0) return formatError(CashAddressDecodingError.unknownAddressType, `Type bit value: ${decoded.typeBits}.`);
	return {
		payload: decoded.payload,
		prefix: decoded.prefix,
		type
	};
};
var CashAddressFormatCorrectionError;
(function(CashAddressFormatCorrectionError) {
	CashAddressFormatCorrectionError["tooManyErrors"] = "CashAddress format correction error: this address cannot be corrected as it contains more than 2 errors.";
})(CashAddressFormatCorrectionError || (CashAddressFormatCorrectionError = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/address/locking-bytecode.js
/**
* The most common address types used on Bitcoin Cash and similar networks. Each
* address type represents a commonly used locking bytecode pattern.
*
* @remarks
* Addresses are strings that encode information about the network and
* `lockingBytecode` to which a transaction output can pay.
*
* Several address formats exist – `Base58Address` was the format used by the
* original satoshi client, and is still in use on several active chains (see
* {@link encodeBase58Address}). On Bitcoin Cash, the `CashAddress` standard is
* most common (See {@link encodeCashAddress}).
*/
var LockingBytecodeType;
(function(LockingBytecodeType) {
	/**
	* Pay to Public Key (P2PK). This address type is uncommon, and primarily
	* occurs in early blocks because the original satoshi implementation mined
	* rewards to P2PK addresses.
	*
	* There are no standardized address formats for representing a P2PK address.
	* Instead, most applications use the `AddressType.p2pkh` format.
	*/
	LockingBytecodeType["p2pk"] = "P2PK";
	/**
	* Pay to Public Key Hash (P2PKH). The most common address type. P2PKH
	* addresses lock funds using a single private key.
	*/
	LockingBytecodeType["p2pkh"] = "P2PKH";
	/**
	* 20-byte Pay to Script Hash (P2SH20). An address type that locks funds to
	* the 20-byte hash of a script provided in the spending transaction. See
	* BIPs 13 and 16 for details.
	*/
	LockingBytecodeType["p2sh20"] = "P2SH20";
	/**
	* 32-byte Pay to Script Hash (P2SH32). An address type that locks funds to
	* the 32-byte hash of a script provided in the spending transaction.
	*/
	LockingBytecodeType["p2sh32"] = "P2SH32";
})(LockingBytecodeType || (LockingBytecodeType = {}));
var isPayToPublicKeyUncompressed = (lockingBytecode) => lockingBytecode.length === 67 && lockingBytecode[0] === 65 && lockingBytecode[66] === 172;
var isPayToPublicKeyCompressed = (lockingBytecode) => lockingBytecode.length === 35 && lockingBytecode[0] === 33 && lockingBytecode[34] === 172;
var isPayToPublicKey = (lockingBytecode) => isPayToPublicKeyCompressed(lockingBytecode) || isPayToPublicKeyUncompressed(lockingBytecode);
var isPayToPublicKeyHash = (lockingBytecode) => lockingBytecode.length === 25 && lockingBytecode[0] === 118 && lockingBytecode[1] === 169 && lockingBytecode[2] === 20 && lockingBytecode[23] === 136 && lockingBytecode[24] === 172;
var isPayToScriptHash20 = (lockingBytecode) => lockingBytecode.length === 23 && lockingBytecode[0] === 169 && lockingBytecode[1] === 20 && lockingBytecode[22] === 135;
var isPayToScriptHash32 = (lockingBytecode) => lockingBytecode.length === 35 && lockingBytecode[0] === 170 && lockingBytecode[1] === 32 && lockingBytecode[34] === 135;
/**
* Attempt to match a lockingBytecode to a standard address type for use in
* address encoding. (See {@link LockingBytecodeType} for details.)
*
* For a locking bytecode matching the Pay to Public Key Hash (P2PKH) pattern,
* the returned `type` is {@link LockingBytecodeType.p2pkh} and `payload` is the
* `HASH160` of the public key.
*
* For a locking bytecode matching the 20-byte Pay to Script Hash (P2SH20)
* pattern, the returned `type` is {@link LockingBytecodeType.p2sh20} and
* `payload` is the `HASH160` of the redeeming bytecode, A.K.A. "redeem
* script hash".
*
* For a locking bytecode matching the Pay to Public Key (P2PK) pattern, the
* returned `type` is {@link LockingBytecodeType.p2pk} and `payload` is the full
* public key.
*
* Any other locking bytecode will return a `type` of
* {@link LockingBytecodeType.unknown} and a payload of the
* unmodified `bytecode`.
*
* @param bytecode - the locking bytecode to match
*/
var lockingBytecodeToAddressContents = (bytecode) => {
	if (isPayToPublicKeyHash(bytecode)) return {
		payload: bytecode.slice(3, 23),
		type: LockingBytecodeType.p2pkh
	};
	if (isPayToScriptHash20(bytecode)) return {
		payload: bytecode.slice(2, 22),
		type: LockingBytecodeType.p2sh20
	};
	if (isPayToScriptHash32(bytecode)) return {
		payload: bytecode.slice(2, 34),
		type: LockingBytecodeType.p2sh32
	};
	if (isPayToPublicKeyUncompressed(bytecode)) return {
		payload: bytecode.slice(1, 66),
		type: LockingBytecodeType.p2pk
	};
	if (isPayToPublicKeyCompressed(bytecode)) return {
		payload: bytecode.slice(1, 34),
		type: LockingBytecodeType.p2pk
	};
	return {
		payload: bytecode.slice(),
		type: "unknown"
	};
};
/**
* Given the 20-byte {@link hash160} of a compressed public key, return a P2PKH
* locking bytecode:
* `OP_DUP OP_HASH160 OP_PUSHBYTES_20 publicKeyHash OP_EQUALVERIFY OP_CHECKSIG`.
*
* This method does not validate `publicKeyHash` in any way; inputs of incorrect
* lengths will produce incorrect results.
*
* @param publicKeyHash - the 20-byte hash of the compressed public key
* @returns
*/
var encodeLockingBytecodeP2pkh = (publicKeyHash) => Uint8Array.from([
	118,
	169,
	20,
	...publicKeyHash,
	136,
	172
]);
/**
* Given the 20-byte {@link hash160} of a P2SH20 redeem bytecode, encode a
* P2SH20 locking bytecode:
* `OP_HASH160 OP_PUSHBYTES_20 redeemBytecodeHash OP_EQUAL`.
*
* This method does not validate `p2sh20Hash` in any way; inputs of incorrect
* lengths will produce incorrect results.
*
* @param p2sh20Hash - the 20-byte, p2sh20 redeem bytecode hash
*/
var encodeLockingBytecodeP2sh20 = (p2sh20Hash) => Uint8Array.from([
	169,
	20,
	...p2sh20Hash,
	135
]);
/**
* Given the 32-byte {@link hash256} of a P2SH32 redeem bytecode, encode a
* P2SH32 locking bytecode:
* `OP_HASH256 OP_PUSHBYTES_32 redeemBytecodeHash OP_EQUAL`.
*
* This method does not validate `p2sh32Hash` in any way; inputs of incorrect
* lengths will produce incorrect results.
*
* @param p2sh32Hash - the 32-byte, p2sh32 redeem bytecode hash
*/
var encodeLockingBytecodeP2sh32 = (p2sh32Hash) => Uint8Array.from([
	170,
	32,
	...p2sh32Hash,
	135
]);
/**
* Given a 33-byte compressed or 65-byte uncompressed public key, encode a P2PK
* locking bytecode: `OP_PUSHBYTES_33 publicKey OP_CHECKSIG` or
* `OP_PUSHBYTES_65 publicKey OP_CHECKSIG`.
*
* This method does not validate `publicKey` in any way; inputs of incorrect
* lengths will produce incorrect results.
*
* @param publicKey - the 33-byte or 65-byte public key
*/
var encodeLockingBytecodeP2pk = (publicKey) => publicKey.length === 33 ? Uint8Array.from([
	33,
	...publicKey,
	172
]) : Uint8Array.from([
	65,
	...publicKey,
	172
]);
/**
* Get the locking bytecode for a {@link KnownAddressTypeContents}. See
* {@link lockingBytecodeToAddressContents} for details.
*
* @param addressContents - the `AddressContents` to encode
*/
var addressContentsToLockingBytecode = ({ payload, type }) => {
	if (type === LockingBytecodeType.p2pkh) return encodeLockingBytecodeP2pkh(payload);
	if (type === LockingBytecodeType.p2sh20) return encodeLockingBytecodeP2sh20(payload);
	if (type === LockingBytecodeType.p2sh32) return encodeLockingBytecodeP2sh32(payload);
	if (type === LockingBytecodeType.p2pk) return encodeLockingBytecodeP2pk(payload);
	return unknownValue(type, `Unrecognized addressContents type:`);
};
/**
* Encode a locking bytecode as a CashAddress.
*
* If `bytecode` matches a standard pattern, it is encoded using the proper
* address type and returned as a {@link CashAddressResult}.
*
* If `bytecode` cannot be encoded as an address (i.e. because the pattern is
* not standard), an error message is returned as a `string`.
*
* For the reverse, see {@link cashAddressToLockingBytecode}.
*
* Due to the high likelihood of runtime errors in a variety of use cases (e.g.
* attempting to convert P2PK or arbitrary data outputs to CashAddresses for
* display in a transaction viewer or block explorer), this function returns
* encoding errors in a type-safe way (as a `string`) rather than via thrown
* `Error` objects.
*
* For applications in which the input to `lockingBytecodeToCashAddress` is
* trusted (e.g. the application is encoding an address for self-generated
* locking bytecode), consider using `assertSuccess` to simplify error handling:
*
* ```ts
* import {
*   assertSuccess,
*   lockingBytecodeToCashAddress
* } from '@bitauth/libauth';
* import { lockingBytecode, useTheAddress } from './my/app.js';
*
* const { address } = assertSuccess(
*   lockingBytecodeToCashAddress(lockingBytecode)
* );
*
* useTheAddress(address);
* ```
*
* @param bytecode - the locking bytecode to encode
* @param prefix - the network prefix to use, e.g. `bitcoincash`, `bchtest`, or
* `bchreg`, defaults to `bitcoincash`
* @param tokenSupport - If `true`, the address will indicate that the receiver
* accepts CashTokens; defaults to `false`.
*/
var lockingBytecodeToCashAddress = ({ prefix = "bitcoincash", bytecode, tokenSupport = false }) => {
	const { payload, type } = lockingBytecodeToAddressContents(bytecode);
	if (type === LockingBytecodeType.p2pkh) return tokenSupport ? encodeCashAddress({
		payload,
		prefix,
		throwErrors: false,
		type: CashAddressType.p2pkhWithTokens
	}) : encodeCashAddress({
		payload,
		prefix,
		throwErrors: false,
		type: CashAddressType.p2pkh
	});
	if (type === LockingBytecodeType.p2sh20 || type === LockingBytecodeType.p2sh32) return tokenSupport ? encodeCashAddress({
		payload,
		prefix,
		throwErrors: false,
		type: CashAddressType.p2shWithTokens
	}) : encodeCashAddress({
		payload,
		prefix,
		throwErrors: false,
		type: CashAddressType.p2sh
	});
	if (type === "P2PK") return CashAddressEncodingError.noTypeBitsValueStandardizedForP2pk;
	return CashAddressEncodingError.unknownLockingBytecodeType;
};
/**
* Convert a CashAddress to its respective locking bytecode.
*
* This method returns the locking bytecode and network prefix. If an error
* occurs, an error message is returned as a string.
*
* For the reverse, see {@link lockingBytecodeToCashAddress}.
*
* @param address - the CashAddress to convert
*/
var cashAddressToLockingBytecode = (address) => {
	const decoded = decodeCashAddress(address);
	if (typeof decoded === "string") return decoded;
	if (decoded.type === CashAddressType.p2pkh || decoded.type === CashAddressType.p2pkhWithTokens) return {
		bytecode: addressContentsToLockingBytecode({
			payload: decoded.payload,
			type: LockingBytecodeType.p2pkh
		}),
		prefix: decoded.prefix,
		tokenSupport: decoded.type === CashAddressType.p2pkhWithTokens
	};
	if (decoded.type === CashAddressType.p2sh || decoded.type === CashAddressType.p2shWithTokens) return {
		bytecode: addressContentsToLockingBytecode({
			payload: decoded.payload,
			type: decoded.payload.length === 32 ? LockingBytecodeType.p2sh32 : LockingBytecodeType.p2sh20
		}),
		prefix: decoded.prefix,
		tokenSupport: decoded.type === CashAddressType.p2shWithTokens
	};
	/* c8 ignore next 2 */
	return unknownValue(decoded.type);
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/message/read-components.js
var ReadBytesError;
(function(ReadBytesError) {
	ReadBytesError["insufficientLength"] = "Error reading bytes: insufficient length.";
})(ReadBytesError || (ReadBytesError = {}));
/**
* Returns a function that reads the requested number of bytes from a
* {@link ReadPosition}, returning either an error message (as a string) or an
* object containing the `Uint8Array` and the next {@link ReadPosition}.
*
* @param length - the number of bytes to read
*/
var readBytes = (length) => (position) => {
	const nextPosition = {
		bin: position.bin,
		index: position.index + length
	};
	const result = position.bin.slice(position.index, nextPosition.index);
	if (result.length !== length) return formatError(ReadBytesError.insufficientLength, `Bytes requested: ${length}; remaining bytes: ${result.length}`);
	return {
		position: nextPosition,
		result
	};
};
var ReadUint32LEError;
(function(ReadUint32LEError) {
	ReadUint32LEError["insufficientBytes"] = "Error reading Uint32LE: requires 4 bytes.";
})(ReadUint32LEError || (ReadUint32LEError = {}));
/**
* Read a 4-byte, Uint32LE from the provided {@link ReadPosition},
* returning either an error message (as a string) or an object containing the
* number and the next {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading
*/
var readUint32LE = (position) => {
	const nextPosition = {
		bin: position.bin,
		index: position.index + 4
	};
	const uint32LEBin = position.bin.subarray(position.index, nextPosition.index);
	if (uint32LEBin.length !== 4) return formatError(ReadUint32LEError.insufficientBytes, `Remaining bytes: ${uint32LEBin.length}`);
	return {
		position: nextPosition,
		result: binToNumberUint32LE(uint32LEBin)
	};
};
var ReadUint64LEError;
(function(ReadUint64LEError) {
	ReadUint64LEError["insufficientBytes"] = "Error reading Uint64LE: requires 8 bytes.";
})(ReadUint64LEError || (ReadUint64LEError = {}));
/**
* Read {@link Output.valueSatoshis} from the provided {@link ReadPosition},
* returning either an error message (as a string) or an object containing the
* {@link Output.valueSatoshis} and the next {@link ReadPosition}.
* @param position - the {@link ReadPosition} at which to start reading
* {@link Output.valueSatoshis}
*/
var readUint64LE = (position) => {
	const nextPosition = {
		bin: position.bin,
		index: position.index + 8
	};
	const uint64LEBin = position.bin.subarray(position.index, nextPosition.index);
	if (uint64LEBin.length !== 8) return formatError(ReadUint64LEError.insufficientBytes, `Remaining bytes: ${uint64LEBin.length}`);
	return {
		position: nextPosition,
		result: binToBigIntUint64LE(uint64LEBin)
	};
};
var CompactUintPrefixedBinError;
(function(CompactUintPrefixedBinError) {
	CompactUintPrefixedBinError["invalidCompactUint"] = "Error reading CompactUint-prefixed bin: invalid CompactUint.";
	CompactUintPrefixedBinError["insufficientBytes"] = "Error reading CompactUint-prefixed bin: insufficient bytes.";
})(CompactUintPrefixedBinError || (CompactUintPrefixedBinError = {}));
/**
* Read a bin (`Uint8Array`) that is prefixed by a minimally-encoded
* `CompactUint` starting at the provided {@link ReadPosition}, returning either
* an error message (as a string) or an object containing the `Uint8Array` and
* the next {@link ReadPosition}. (In the transaction format,
* `CompactUint`-prefixes are used to indicate the length of unlocking bytecode,
* locking bytecode, and non-fungible token commitments.)
*
* @param position - the {@link ReadPosition} at which to start reading the
* `CompactUint`-prefixed bin (`Uint8Array`)
*/
var readCompactUintPrefixedBin = (position) => {
	const read = readCompactUintMinimal(position);
	if (typeof read === "string") return formatError(CompactUintPrefixedBinError.invalidCompactUint, read);
	const { result, position: p2 } = read;
	const length = Number(result);
	const nextPosition = {
		bin: position.bin,
		index: p2.index + length
	};
	const contents = position.bin.slice(p2.index, nextPosition.index);
	if (contents.length !== length) return formatError(CompactUintPrefixedBinError.insufficientBytes, `Required bytes: ${length}, remaining bytes: ${contents.length}`);
	return {
		position: nextPosition,
		result: contents
	};
};
/**
* Read the remaining bytes from the provided {@link ReadPosition}, returning
* an object containing the `Uint8Array` and the next {@link ReadPosition}
* (with `index === bin.length`).
*
* @param position - the {@link ReadPosition} at which to start reading the
* remaining bytes
*/
var readRemainingBytes = (position) => {
	const nextPosition = {
		bin: position.bin,
		index: position.bin.length
	};
	return {
		position: nextPosition,
		result: position.bin.subarray(position.index, nextPosition.index)
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/message/transaction-types.js
/**
* The capability assigned to a particular non-fungible token.
*/
var NonFungibleTokenCapability;
(function(NonFungibleTokenCapability) {
	/**
	* No capability, i.e. the token is an **immutable token**.
	*/
	NonFungibleTokenCapability["none"] = "none";
	/**
	* The mutable capability (`0x01`), i.e. the token is a **mutable token**.
	*/
	NonFungibleTokenCapability["mutable"] = "mutable";
	/**
	* The minting capability (`0x02`), i.e. the token is a **minting token**.
	*/
	NonFungibleTokenCapability["minting"] = "minting";
})(NonFungibleTokenCapability || (NonFungibleTokenCapability = {}));
Uint8Array.from([
	255,
	255,
	255,
	255,
	255,
	255,
	255,
	255
]);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/message/transaction-encoding.js
/**
* Encode a single input for inclusion in an encoded transaction.
*
* @param input - the input to encode
*/
var encodeTransactionInput = (input) => flattenBinArray([
	input.outpointTransactionHash.slice().reverse(),
	numberToBinUint32LE(input.outpointIndex),
	bigIntToCompactUint(BigInt(input.unlockingBytecode.length)),
	input.unlockingBytecode,
	numberToBinUint32LE(input.sequenceNumber)
]);
var TransactionDecodingError;
(function(TransactionDecodingError) {
	TransactionDecodingError["transaction"] = "Error reading transaction.";
	TransactionDecodingError["endsWithUnexpectedBytes"] = "Error decoding transaction: the provided input includes unexpected bytes after the encoded transaction.";
	TransactionDecodingError["input"] = "Error reading transaction input.";
	TransactionDecodingError["inputs"] = "Error reading transaction inputs.";
	TransactionDecodingError["output"] = "Error reading transaction output.";
	TransactionDecodingError["outputs"] = "Error reading transaction outputs.";
	TransactionDecodingError["outputsEndWithUnexpectedBytes"] = "Error decoding transaction outputs: the provided serialization includes unexpected bytes after the encoded transaction outputs.";
	TransactionDecodingError["lockingBytecodeLength"] = "Error reading locking bytecode length.";
})(TransactionDecodingError || (TransactionDecodingError = {}));
/**
* Read a transaction {@link Input} from the provided {@link ReadPosition},
* returning either an error message (as a string) or an object containing the
* {@link Input} and the next {@link ReadPosition}.
* @param position - the {@link ReadPosition} at which to start reading the
* transaction output
*/
var readTransactionInput = (position) => {
	const inputRead = readMultiple(position, [
		readBytes(32),
		readUint32LE,
		readCompactUintPrefixedBin,
		readUint32LE
	]);
	if (typeof inputRead === "string") return formatError(TransactionDecodingError.input, inputRead);
	const { position: nextPosition, result: [outpointTransactionHash, outpointIndex, unlockingBytecode, sequenceNumber] } = inputRead;
	return {
		position: nextPosition,
		result: {
			outpointIndex,
			outpointTransactionHash: outpointTransactionHash.reverse(),
			sequenceNumber,
			unlockingBytecode
		}
	};
};
/**
* Encode a set of {@link Input}s for inclusion in an encoded transaction
* including the prefixed number of inputs.
*
* Format: [CompactUint: input count] [encoded inputs]
*
* @param inputs - the set of inputs to encode
*/
var encodeTransactionInputs = (inputs) => flattenBinArray([bigIntToCompactUint(BigInt(inputs.length)), ...inputs.map(encodeTransactionInput)]);
/**
* Read a set of transaction {@link Input}s beginning at {@link ReadPosition}.
* A CompactUint will be read to determine the number of inputs, and that
* number of transaction inputs will be read and returned. Returns either an
* error message (as a string) or an object containing the array of inputs and
* the next {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* transaction inputs
*/
var readTransactionInputs = (position) => {
	const inputsRead = readItemCount(position, readTransactionInput);
	if (typeof inputsRead === "string") return formatError(TransactionDecodingError.inputs, inputsRead);
	return inputsRead;
};
var maximumTokenAmount = 9223372036854775807n;
var nftCapabilityNumberToLabel = [
	NonFungibleTokenCapability.none,
	NonFungibleTokenCapability.mutable,
	NonFungibleTokenCapability.minting
];
var nftCapabilityLabelToNumber = {
	[NonFungibleTokenCapability.none]: 0,
	[NonFungibleTokenCapability.mutable]: 1,
	[NonFungibleTokenCapability.minting]: 2
};
var CashTokenDecodingError;
(function(CashTokenDecodingError) {
	CashTokenDecodingError["invalidPrefix"] = "Error reading token prefix.";
	CashTokenDecodingError["insufficientLength"] = "Invalid token prefix: insufficient length.";
	CashTokenDecodingError["reservedBit"] = "Invalid token prefix: reserved bit is set.";
	CashTokenDecodingError["invalidCapability"] = "Invalid token prefix: capability must be none (0), mutable (1), or minting (2).";
	CashTokenDecodingError["commitmentWithoutNft"] = "Invalid token prefix: commitment requires an NFT.";
	CashTokenDecodingError["capabilityWithoutNft"] = "Invalid token prefix: capability requires an NFT.";
	CashTokenDecodingError["commitmentLengthZero"] = "Invalid token prefix: if encoded, commitment length must be greater than 0.";
	CashTokenDecodingError["invalidCommitment"] = "Invalid token prefix: invalid non-fungible token commitment.";
	CashTokenDecodingError["invalidAmountEncoding"] = "Invalid token prefix: invalid fungible token amount encoding.";
	CashTokenDecodingError["zeroAmount"] = "Invalid token prefix: if encoded, fungible token amount must be greater than 0.";
	CashTokenDecodingError["excessiveAmount"] = "Invalid token prefix: exceeds maximum fungible token amount of 9223372036854775807.";
	CashTokenDecodingError["noTokens"] = "Invalid token prefix: must encode at least one token.";
})(CashTokenDecodingError || (CashTokenDecodingError = {}));
/**
* Read a token amount from the provided {@link ReadPosition}, returning either
* an error message (as a string) or an object containing the value and the next
* {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* token amount.
*/
var readTokenAmount = (position) => {
	const amountRead = readCompactUintMinimal(position);
	if (typeof amountRead === "string") return formatError(CashTokenDecodingError.invalidAmountEncoding, amountRead);
	if (amountRead.result > maximumTokenAmount) return formatError(CashTokenDecodingError.excessiveAmount, `Encoded amount: ${amountRead.result}`);
	if (amountRead.result === 0n) return formatError(CashTokenDecodingError.zeroAmount);
	return amountRead;
};
/**
* Attempt to read a transaction {@link Output}'s token prefix from the provided
* {@link ReadPosition}, returning either an error message (as a string) or an
* object containing the (optional) token information and the
* next {@link ReadPosition}.
*
* Rather than using this function directly, most applications
* should use {@link readLockingBytecodeWithPrefix}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* token prefix
*/
var readTokenPrefix = (position) => {
	const { bin, index } = position;
	if (bin[index] !== 239) return {
		position,
		result: {}
	};
	if (bin.length < index + 34) return formatError(CashTokenDecodingError.insufficientLength, `The minimum possible length is 34. Missing bytes: ${34 - (bin.length - index)}`);
	const category = bin.slice(index + 1, index + 33).reverse();
	const tokenBitfield = bin[index + 33];
	const prefixStructure = tokenBitfield & 240;
	if ((prefixStructure & 128) !== 0) return formatError(CashTokenDecodingError.reservedBit, `Bitfield: 0b${tokenBitfield.toString(2)}`);
	const nftCapabilityInt = tokenBitfield & 15;
	if (nftCapabilityInt > 2) return formatError(CashTokenDecodingError.invalidCapability, `Capability value: ${nftCapabilityInt}`);
	const capability = nftCapabilityNumberToLabel[nftCapabilityInt];
	const hasNft = (prefixStructure & 32) !== 0;
	const hasCommitmentLength = (prefixStructure & 64) !== 0;
	if (hasCommitmentLength && !hasNft) return formatError(CashTokenDecodingError.commitmentWithoutNft, `Bitfield: 0b${tokenBitfield.toString(2)}`);
	const hasAmount = (prefixStructure & 16) !== 0;
	const nextPosition = {
		bin,
		index: index + 33 + 1
	};
	if (hasNft) {
		const commitmentRead = hasCommitmentLength ? readCompactUintPrefixedBin(nextPosition) : {
			position: nextPosition,
			result: Uint8Array.of()
		};
		if (typeof commitmentRead === "string") return formatError(CashTokenDecodingError.invalidCommitment, commitmentRead);
		if (hasCommitmentLength && commitmentRead.result.length === 0) return formatError(CashTokenDecodingError.commitmentLengthZero);
		const amountRead = hasAmount ? readTokenAmount(commitmentRead.position) : {
			position: commitmentRead.position,
			result: 0n
		};
		if (typeof amountRead === "string") return amountRead;
		return {
			position: amountRead.position,
			result: { token: {
				amount: amountRead.result,
				category,
				nft: {
					capability,
					commitment: commitmentRead.result
				}
			} }
		};
	}
	if (capability !== NonFungibleTokenCapability.none) return formatError(CashTokenDecodingError.capabilityWithoutNft, `Bitfield: 0b${tokenBitfield.toString(2)}`);
	if (!hasAmount) return formatError(CashTokenDecodingError.noTokens, `Bitfield: 0b${tokenBitfield.toString(2)}`);
	const amountRead = readTokenAmount(nextPosition);
	if (typeof amountRead === "string") return amountRead;
	return {
		position: amountRead.position,
		result: { token: {
			amount: amountRead.result,
			category
		} }
	};
};
/**
* Read the locking bytecode and token prefix (if present) of a transaction
* {@link Output}, beginning at the `CompactUint` indicating the
* combined length.
* @param position - the {@link ReadPosition} at which to start reading the
* optional token prefix and locking bytecode
*/
var readLockingBytecodeWithPrefix = (position) => {
	const bytecodeRead = readCompactUintPrefixedBin(position);
	if (typeof bytecodeRead === "string") return formatError(TransactionDecodingError.lockingBytecodeLength, bytecodeRead);
	const { result: contents, position: nextPosition } = bytecodeRead;
	const contentsRead = readMultiple({
		bin: contents,
		index: 0
	}, [readTokenPrefix, readRemainingBytes]);
	if (typeof contentsRead === "string") return formatError(CashTokenDecodingError.invalidPrefix, contentsRead);
	const { result: [{ token }, lockingBytecode] } = contentsRead;
	return {
		position: nextPosition,
		result: {
			lockingBytecode,
			...token === void 0 ? {} : { token }
		}
	};
};
/**
* Read a transaction {@link Output} from the provided {@link ReadPosition},
* returning either an error message (as a string) or an object containing the
* {@link Output} and the next {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* transaction output
*/
var readTransactionOutput = (position) => {
	const outputRead = readMultiple(position, [readUint64LE, readLockingBytecodeWithPrefix]);
	if (typeof outputRead === "string") return formatError(TransactionDecodingError.output, outputRead);
	const { position: nextPosition, result: [valueSatoshis, { lockingBytecode, token }] } = outputRead;
	return {
		position: nextPosition,
		result: {
			lockingBytecode,
			...token === void 0 ? {} : { token },
			valueSatoshis
		}
	};
};
/**
* Given {@link Output.token} data, encode a token prefix.
*
* This function does not fail, but returns an empty Uint8Array if the token
* data does not encode any tokens (even if `token.category` is set).
*
* @param token - the token data to encode
*/
var encodeTokenPrefix = (token) => {
	if (token === void 0 || token.nft === void 0 && token.amount < 1n) return Uint8Array.of();
	const hasNft = token.nft === void 0 ? 0 : 32;
	const capabilityInt = token.nft === void 0 ? 0 : nftCapabilityLabelToNumber[token.nft.capability];
	const hasCommitmentLength = token.nft !== void 0 && token.nft.commitment.length > 0 ? 64 : 0;
	const hasAmount = token.amount > 0n ? 16 : 0;
	const tokenBitfield = hasNft | hasCommitmentLength | hasAmount | capabilityInt;
	return flattenBinArray([
		Uint8Array.of(239),
		token.category.slice().reverse(),
		Uint8Array.of(tokenBitfield),
		...hasCommitmentLength === 0 ? [] : [bigIntToCompactUint(BigInt(token.nft.commitment.length)), token.nft.commitment],
		...hasAmount === 0 ? [] : [bigIntToCompactUint(token.amount)]
	]);
};
/**
* Encode a single {@link Output} for inclusion in an encoded transaction.
*
* @param output - the output to encode
*/
var encodeTransactionOutput = (output) => {
	const lockingBytecodeField = flattenBinArray([encodeTokenPrefix(output.token), output.lockingBytecode]);
	return flattenBinArray([
		valueSatoshisToBin(output.valueSatoshis),
		bigIntToCompactUint(BigInt(lockingBytecodeField.length)),
		lockingBytecodeField
	]);
};
/**
* Read a set of transaction {@link Output}s beginning at {@link ReadPosition}.
* A CompactUint will be read to determine the number of outputs, and that
* number of transaction outputs will be read and returned. Returns either an
* error message (as a string) or an object containing the array of outputs and
* the next {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* transaction outputs
*/
var readTransactionOutputs = (position) => {
	const outputsRead = readItemCount(position, readTransactionOutput);
	if (typeof outputsRead === "string") return formatError(TransactionDecodingError.outputs, outputsRead);
	return outputsRead;
};
/**
* Encode a set of {@link Output}s for inclusion in an encoded transaction
* including the prefixed number of outputs. Note, this encoding differs from
* {@link encodeTransactionOutputsForSigning} (used for signing serializations).
*
* Format: `[CompactUint: output count] [encoded outputs]`
*
* For the reverse, see {@link decodeTransactionOutputs}.
*
* @param outputs - the set of outputs to encode
*/
var encodeTransactionOutputs = (outputs) => flattenBinArray([bigIntToCompactUint(BigInt(outputs.length)), ...outputs.map(encodeTransactionOutput)]);
/**
* Read a version 1 or 2 transaction beginning at {@link ReadPosition},
* returning either an error message (as a string) or an object containing the
* {@link Transaction} and the next {@link ReadPosition}. Rather than using this
* function directly, most applications should
* use {@link decodeTransactionCommon}.
*
* @param position - the {@link ReadPosition} at which to start reading the
* {@link TransactionCommon}
*/
var readTransactionCommon = (position) => {
	const transactionRead = readMultiple(position, [
		readUint32LE,
		readTransactionInputs,
		readTransactionOutputs,
		readUint32LE
	]);
	if (typeof transactionRead === "string") return formatError(TransactionDecodingError.transaction, transactionRead);
	const { position: nextPosition, result: [version, inputs, outputs, locktime] } = transactionRead;
	return {
		position: nextPosition,
		result: {
			inputs,
			locktime,
			outputs,
			version
		}
	};
};
/**
* Decode a {@link TransactionCommon} according to the version 1/2 P2P network
* transaction format.
*
* This function verifies that the provided `bin` contains only one transaction
* and no additional data. To read a transaction from a specific location within
* a `Uint8Array`, use {@link readTransactionCommon}.
*
* For the reverse, see {@link encodeTransactionCommon}.
*
* @param bin - the encoded transaction to decode
*/
var decodeTransactionCommon = (bin) => {
	const transactionRead = readTransactionCommon({
		bin,
		index: 0
	});
	if (typeof transactionRead === "string") return transactionRead;
	if (transactionRead.position.index !== bin.length) return formatError(TransactionDecodingError.endsWithUnexpectedBytes, `Encoded transaction ends at index ${transactionRead.position.index - 1}, leaving ${bin.length - transactionRead.position.index} remaining bytes.`);
	return transactionRead.result;
};
var decodeTransaction = decodeTransactionCommon;
/**
* Encode a {@link Transaction} using the standard P2P network format. This
* serialization is also used when computing the transaction's hash (A.K.A.
* "transaction ID" or "TXID").
*
* For the reverse, see {@link decodeTransactionCommon}.
*/
var encodeTransactionCommon = (tx) => flattenBinArray([
	numberToBinUint32LE(tx.version),
	encodeTransactionInputs(tx.inputs),
	encodeTransactionOutputs(tx.outputs),
	numberToBinUint32LE(tx.locktime)
]);
var encodeTransactionBCH = encodeTransactionCommon;
var encodeTransaction = encodeTransactionBCH;
/**
* @deprecated use `structuredClone` instead
*/
var cloneTransactionInputsCommon = (inputs) => inputs.map((input) => ({
	outpointIndex: input.outpointIndex,
	outpointTransactionHash: input.outpointTransactionHash.slice(),
	sequenceNumber: input.sequenceNumber,
	unlockingBytecode: input.unlockingBytecode.slice()
}));
/**
* @deprecated use `structuredClone` instead
*/
var cloneTransactionOutputsCommon = (outputs) => outputs.map((output) => ({
	lockingBytecode: output.lockingBytecode.slice(),
	...output.token === void 0 ? {} : { token: {
		amount: output.token.amount,
		category: output.token.category.slice(),
		...output.token.nft === void 0 ? {} : { nft: {
			capability: output.token.nft.capability,
			commitment: output.token.nft.commitment.slice()
		} }
	} },
	valueSatoshis: output.valueSatoshis
}));
/**
* @deprecated use `structuredClone` instead
*/
var cloneTransactionCommon = (transaction) => ({
	inputs: cloneTransactionInputsCommon(transaction.inputs),
	locktime: transaction.locktime,
	outputs: cloneTransactionOutputsCommon(transaction.outputs),
	version: transaction.version
});
/**
* Compute a transaction hash (A.K.A. "transaction ID" or "TXID") from an
* encoded transaction in P2P network message order. This is the byte order
* produced by most sha256 libraries and used by encoded P2P network messages.
* It is also the byte order produced by `OP_SHA256` and `OP_HASH256` in the
* virtual machine.
*
* @returns the transaction hash in P2P network message byte order
*
* @param transaction - the encoded transaction
* @param sha256 - an implementation of sha256
*/
var hashTransactionP2pOrder = (transaction, sha256$18 = sha256) => hash256(transaction, sha256$18);
/**
* Compute a transaction hash (A.K.A. "transaction ID" or "TXID") from an
* encoded transaction in user interface byte order. This is the byte order
* typically used by block explorers, wallets, and other user interfaces.
*
* To return this result as a `string`, use {@link hashTransaction}.
*
* @returns the transaction hash in User Interface byte order
*
* @param transaction - the encoded transaction
* @param sha256 - an implementation of sha256
*/
var hashTransactionUiOrder = (transaction, sha256$19 = sha256) => hashTransactionP2pOrder(transaction, sha256$19).reverse();
/**
* Encode all outpoints in a series of transaction inputs. (For use in
* {@link hashTransactionOutpoints}.)
*
* @param inputs - the series of inputs from which to extract the outpoints
*/
var encodeTransactionOutpoints = (inputs) => flattenBinArray(inputs.map((i) => flattenBinArray([i.outpointTransactionHash.slice().reverse(), numberToBinUint32LE(i.outpointIndex)])));
/**
* Encode an array of transaction {@link Output}s for use in transaction signing
* serializations. Note, this encoding differs from
* {@link encodeTransactionOutputs} (used for encoding full transactions).
*
* @param outputs - the array of outputs to encode
*/
var encodeTransactionOutputsForSigning = (outputs) => flattenBinArray(outputs.map(encodeTransactionOutput));
/**
* Encode the sequence numbers of an array of transaction inputs for use in
* transaction signing serializations.
*
* @param inputs - the array of inputs from which to extract the sequence
* numbers
*/
var encodeTransactionInputSequenceNumbersForSigning = (inputs) => flattenBinArray(inputs.map((i) => numberToBinUint32LE(i.sequenceNumber)));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/signing-serialization.js
/**
* A.K.A. `sighash` flags
*/
var SigningSerializationFlag;
(function(SigningSerializationFlag) {
	/**
	* A.K.A. `SIGHASH_ALL`
	*/
	SigningSerializationFlag[SigningSerializationFlag["allOutputs"] = 1] = "allOutputs";
	/**
	* A.K.A `SIGHASH_NONE`
	*/
	SigningSerializationFlag[SigningSerializationFlag["noOutputs"] = 2] = "noOutputs";
	/**
	* A.K.A. `SIGHASH_SINGLE`
	*/
	SigningSerializationFlag[SigningSerializationFlag["correspondingOutput"] = 3] = "correspondingOutput";
	/**
	* A.K.A. `SIGHASH_UTXOS`
	*/
	SigningSerializationFlag[SigningSerializationFlag["utxos"] = 32] = "utxos";
	SigningSerializationFlag[SigningSerializationFlag["forkId"] = 64] = "forkId";
	/**
	* A.K.A `ANYONE_CAN_PAY`/`SIGHASH_ANYONECANPAY`
	*/
	SigningSerializationFlag[SigningSerializationFlag["singleInput"] = 128] = "singleInput";
})(SigningSerializationFlag || (SigningSerializationFlag = {}));
var SigningSerializationType;
(function(SigningSerializationType) {
	SigningSerializationType[SigningSerializationType["allOutputs"] = 65] = "allOutputs";
	SigningSerializationType[SigningSerializationType["allOutputsAllUtxos"] = 97] = "allOutputsAllUtxos";
	SigningSerializationType[SigningSerializationType["allOutputsSingleInput"] = 193] = "allOutputsSingleInput";
	SigningSerializationType[SigningSerializationType["correspondingOutput"] = 67] = "correspondingOutput";
	SigningSerializationType[SigningSerializationType["correspondingOutputAllUtxos"] = 99] = "correspondingOutputAllUtxos";
	SigningSerializationType[SigningSerializationType["correspondingOutputSingleInput"] = 195] = "correspondingOutputSingleInput";
	SigningSerializationType[SigningSerializationType["noOutputs"] = 66] = "noOutputs";
	SigningSerializationType[SigningSerializationType["noOutputsAllUtxos"] = 98] = "noOutputsAllUtxos";
	SigningSerializationType[SigningSerializationType["noOutputsSingleInput"] = 194] = "noOutputsSingleInput";
})(SigningSerializationType || (SigningSerializationType = {}));
var SigningSerializationTypeBCH = SigningSerializationType;
var match = (type, flag) => (type[0] & flag) !== 0;
var equals = (type, flag) => (type[0] & 31) === flag;
var shouldSerializeSingleInput = (type) => match(type, SigningSerializationFlag.singleInput);
var shouldSerializeCorrespondingOutput = (type) => equals(type, SigningSerializationFlag.correspondingOutput);
var shouldSerializeNoOutputs = (type) => equals(type, SigningSerializationFlag.noOutputs);
var shouldSerializeUtxos = (type) => match(type, SigningSerializationFlag.utxos);
var emptyHash = () => (/* @__PURE__ */ new Uint8Array(32)).fill(0);
/**
* Return the proper `hashPrevouts` value for a given a signing serialization
* type.
*/
var hashPrevouts = ({ signingSerializationType, transactionOutpoints }, sha256$12 = sha256) => shouldSerializeSingleInput(signingSerializationType) ? emptyHash() : hash256(transactionOutpoints, sha256$12);
/**
* Return the proper `hashUtxos` value for a given a signing serialization
* type.
*/
var hashUtxos = ({ signingSerializationType, transactionUtxos }, sha256$13 = sha256) => shouldSerializeUtxos(signingSerializationType) ? hash256(transactionUtxos, sha256$13) : Uint8Array.of();
/**
* Return the proper `hashSequence` value for a given a signing serialization
* type.
*/
var hashSequence = ({ signingSerializationType, transactionSequenceNumbers }, sha256$14 = sha256) => !shouldSerializeSingleInput(signingSerializationType) && !shouldSerializeCorrespondingOutput(signingSerializationType) && !shouldSerializeNoOutputs(signingSerializationType) ? hash256(transactionSequenceNumbers, sha256$14) : emptyHash();
/**
* Return the proper `hashOutputs` value for a given a signing serialization
* type.
*/
var hashOutputs = ({ correspondingOutput, signingSerializationType, transactionOutputs }, sha256$15 = sha256) => !shouldSerializeCorrespondingOutput(signingSerializationType) && !shouldSerializeNoOutputs(signingSerializationType) ? hash256(transactionOutputs, sha256$15) : shouldSerializeCorrespondingOutput(signingSerializationType) ? correspondingOutput === void 0 ? emptyHash() : hash256(correspondingOutput, sha256$15) : emptyHash();
/**
* Encode the signature-protected properties of a transaction following the
* algorithm required by the `signingSerializationType` of a signature.
*
* Note: When validating transactions with multiple signatures,
* performance-critical applications should use a memoized sha256 implementation
* to avoid re-computing hashes.
*/
var encodeSigningSerializationBCH = ({ correspondingOutput, coveredBytecode, forkId = new Uint8Array([
	0,
	0,
	0
]), locktime, outpointIndex, outpointTransactionHash, outputTokenPrefix, outputValue, sequenceNumber, signingSerializationType, transactionOutpoints, transactionOutputs, transactionSequenceNumbers, transactionUtxos, version }, sha256$16 = sha256) => flattenBinArray([
	numberToBinUint32LE(version),
	hashPrevouts({
		signingSerializationType,
		transactionOutpoints
	}, sha256$16),
	hashUtxos({
		signingSerializationType,
		transactionUtxos
	}, sha256$16),
	hashSequence({
		signingSerializationType,
		transactionSequenceNumbers
	}, sha256$16),
	outpointTransactionHash.slice().reverse(),
	numberToBinUint32LE(outpointIndex),
	outputTokenPrefix,
	bigIntToCompactUint(BigInt(coveredBytecode.length)),
	coveredBytecode,
	outputValue,
	numberToBinUint32LE(sequenceNumber),
	hashOutputs({
		correspondingOutput,
		signingSerializationType,
		transactionOutputs
	}, sha256$16),
	numberToBinUint32LE(locktime),
	signingSerializationType,
	forkId
]);
/**
* Generate the encoded components of a BCH signing serialization from
* compilation context.
*/
var generateSigningSerializationComponentsBCH = (context) => ({
	correspondingOutput: context.inputIndex < context.transaction.outputs.length ? encodeTransactionOutput(context.transaction.outputs[context.inputIndex]) : void 0,
	locktime: context.transaction.locktime,
	outpointIndex: context.transaction.inputs[context.inputIndex].outpointIndex,
	outpointTransactionHash: context.transaction.inputs[context.inputIndex].outpointTransactionHash,
	outputTokenPrefix: encodeTokenPrefix(context.sourceOutputs[context.inputIndex].token),
	outputValue: valueSatoshisToBin(context.sourceOutputs[context.inputIndex].valueSatoshis),
	sequenceNumber: context.transaction.inputs[context.inputIndex].sequenceNumber,
	transactionOutpoints: encodeTransactionOutpoints(context.transaction.inputs),
	transactionOutputs: encodeTransactionOutputsForSigning(context.transaction.outputs),
	transactionSequenceNumbers: encodeTransactionInputSequenceNumbersForSigning(context.transaction.inputs),
	transactionUtxos: encodeTransactionOutputsForSigning(context.sourceOutputs),
	version: context.transaction.version
});
/**
* Generate the signing serialization for a particular transaction input
* following the algorithm required by the provided `signingSerializationType`.
*
* Note: When validating transactions with multiple signatures,
* performance-critical applications should use a memoized sha256 implementation
* to avoid re-computing hashes.
*/
var generateSigningSerializationBCH = (context, { coveredBytecode, signingSerializationType }, sha256$17 = sha256) => encodeSigningSerializationBCH({
	...generateSigningSerializationComponentsBCH(context),
	coveredBytecode,
	signingSerializationType
}, sha256$17);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/consensus.js
/**
* Consensus settings for the `BCH_2022_05` instruction set.
*/
var ConsensusCommon;
(function(ConsensusCommon) {
	/**
	* A.K.A. `MAX_SCRIPT_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["maximumBytecodeLength"] = 1e4] = "maximumBytecodeLength";
	/**
	* A.K.A. `MAX_OP_RETURN_RELAY`, `nMaxDatacarrierBytes`
	*/
	ConsensusCommon[ConsensusCommon["maximumDataCarrierBytes"] = 223] = "maximumDataCarrierBytes";
	/**
	* A.K.A. `MAX_OPS_PER_SCRIPT`
	*/
	ConsensusCommon[ConsensusCommon["maximumOperationCount"] = 201] = "maximumOperationCount";
	/**
	* A.K.A. `MAX_STACK_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["maximumStackDepth"] = 1e3] = "maximumStackDepth";
	/**
	* A.K.A. `MAX_SCRIPT_ELEMENT_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["maximumStackItemLength"] = 520] = "maximumStackItemLength";
	/**
	* A.K.A. `MAX_STANDARD_VERSION`
	*/
	ConsensusCommon[ConsensusCommon["maximumStandardVersion"] = 2] = "maximumStandardVersion";
	/**
	* A.K.A. `MAX_TX_IN_SCRIPT_SIG_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["maximumStandardUnlockingBytecodeLength"] = 1650] = "maximumStandardUnlockingBytecodeLength";
	/**
	* A.K.A. `MIN_TX_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["minimumTransactionSize"] = 100] = "minimumTransactionSize";
	/**
	* A.K.A. `MAX_STANDARD_TX_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["maximumStandardTransactionSize"] = 1e5] = "maximumStandardTransactionSize";
	/**
	* A.K.A. `MAX_TX_SIZE`
	*/
	ConsensusCommon[ConsensusCommon["maximumTransactionSize"] = 1e6] = "maximumTransactionSize";
	/**
	* A.K.A. `MAXIMUM_ELEMENT_SIZE_64_BIT`
	*/
	ConsensusCommon[ConsensusCommon["maximumVmNumberLength"] = 8] = "maximumVmNumberLength";
	ConsensusCommon["minVmNumber"] = "-9223372036854775807";
	ConsensusCommon["maxVmNumber"] = "9223372036854775807";
	ConsensusCommon[ConsensusCommon["schnorrSignatureLength"] = 64] = "schnorrSignatureLength";
})(ConsensusCommon || (ConsensusCommon = {}));
var SigningSerializationTypesBCH = [
	SigningSerializationTypeBCH.allOutputs,
	SigningSerializationTypeBCH.allOutputsSingleInput,
	SigningSerializationTypeBCH.correspondingOutput,
	SigningSerializationTypeBCH.correspondingOutputSingleInput,
	SigningSerializationTypeBCH.noOutputs,
	SigningSerializationTypeBCH.noOutputsSingleInput
];
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/errors.js
var AuthenticationErrorCommon;
(function(AuthenticationErrorCommon) {
	AuthenticationErrorCommon["calledReserved"] = "Program called an unassigned, reserved operation.";
	AuthenticationErrorCommon["calledReturn"] = "Program called an OP_RETURN operation.";
	AuthenticationErrorCommon["calledUpgradableNop"] = "Program called a disallowed upgradable non-operation (OP_NOP1-OP_NOP10).";
	AuthenticationErrorCommon["checkSequenceUnavailable"] = "Program called an OP_CHECKSEQUENCEVERIFY operation, but OP_CHECKSEQUENCEVERIFY requires transaction version 2 or higher.";
	AuthenticationErrorCommon["disabledOpcode"] = "Program contains a disabled opcode.";
	AuthenticationErrorCommon["divisionByZero"] = "Program attempted to divide a number by zero.";
	AuthenticationErrorCommon["emptyAlternateStack"] = "Tried to read from an empty alternate stack.";
	AuthenticationErrorCommon["emptyStack"] = "Tried to read from an empty stack.";
	AuthenticationErrorCommon["exceededMaximumBytecodeLengthLocking"] = "The provided locking bytecode exceeds the maximum bytecode length (10,000 bytes).";
	AuthenticationErrorCommon["exceededMaximumBytecodeLengthUnlocking"] = "The provided unlocking bytecode exceeds the maximum bytecode length (10,000 bytes).";
	AuthenticationErrorCommon["exceededMaximumVmNumberLength"] = "Program attempted an OP_BIN2NUM operation on a byte sequence that cannot be encoded within the maximum VM Number length.";
	AuthenticationErrorCommon["exceededMaximumStackDepth"] = "Program exceeded the maximum stack depth (1,000 items).";
	AuthenticationErrorCommon["exceededMaximumStackItemLength"] = "Program attempted to push a stack item that exceeded the maximum stack item length (520 bytes).";
	AuthenticationErrorCommon["exceededMaximumOperationCount"] = "Program exceeded the maximum operation count (201 operations).";
	AuthenticationErrorCommon["exceedsMaximumMultisigPublicKeyCount"] = "Program called an OP_CHECKMULTISIG that exceeds the maximum public key count (20 public keys).";
	AuthenticationErrorCommon["failedVerify"] = "Program failed an OP_VERIFY operation.";
	AuthenticationErrorCommon["invalidStackIndex"] = "Tried to read from an invalid stack index.";
	AuthenticationErrorCommon["incompatibleLocktimeType"] = "Program called an OP_CHECKLOCKTIMEVERIFY operation with an incompatible locktime type. The transaction locktime and required locktime must both refer to either a block height or a block time.";
	AuthenticationErrorCommon["incompatibleSequenceType"] = "Program called an OP_CHECKSEQUENCEVERIFY operation with an incompatible sequence type flag. The input sequence number and required sequence number must both use the same sequence locktime type.";
	AuthenticationErrorCommon["insufficientLength"] = "Program called an OP_NUM2BIN operation with an insufficient byte length to re-encode the provided number.";
	AuthenticationErrorCommon["insufficientPublicKeys"] = "Program called an OP_CHECKMULTISIG operation that requires signatures from more public keys than are provided.";
	AuthenticationErrorCommon["invalidNaturalNumber"] = "Invalid input: the key/signature count inputs for OP_CHECKMULTISIG require a natural number (n > 0).";
	AuthenticationErrorCommon["invalidProtocolBugValue"] = "The OP_CHECKMULTISIG protocol bug value must be a VM Number 0 (to comply with the \"NULLDUMMY\" rule).";
	AuthenticationErrorCommon["invalidPublicKeyEncoding"] = "Encountered an improperly encoded public key.";
	AuthenticationErrorCommon["invalidVmNumber"] = "Invalid input: this operation requires a valid VM Number.";
	AuthenticationErrorCommon["invalidSignatureEncoding"] = "Encountered an improperly encoded signature.";
	AuthenticationErrorCommon["invalidSplitIndex"] = "Program called an OP_SPLIT operation with an invalid index.";
	AuthenticationErrorCommon["invalidTransactionInputIndex"] = "Program attempted to read from an invalid transaction input index.";
	AuthenticationErrorCommon["invalidTransactionOutputIndex"] = "Program attempted to read from an invalid transaction output index.";
	AuthenticationErrorCommon["invalidTransactionUtxoIndex"] = "Program attempted to read from an invalid transaction UTXO index.";
	AuthenticationErrorCommon["locktimeDisabled"] = "Program called an OP_CHECKLOCKTIMEVERIFY operation, but locktime is disabled for this transaction.";
	AuthenticationErrorCommon["mismatchedBitwiseOperandLength"] = "Program attempted a bitwise operation on operands of different lengths.";
	AuthenticationErrorCommon["malformedLockingBytecode"] = "The provided locking bytecode is malformed.";
	AuthenticationErrorCommon["malformedP2shBytecode"] = "Redeem bytecode was malformed prior to P2SH evaluation.";
	AuthenticationErrorCommon["malformedPush"] = "Program must be long enough to push the requested number of bytes.";
	AuthenticationErrorCommon["malformedUnlockingBytecode"] = "The provided unlocking bytecode is malformed.";
	AuthenticationErrorCommon["negativeLocktime"] = "Program called an OP_CHECKLOCKTIMEVERIFY or OP_CHECKSEQUENCEVERIFY operation with a negative locktime.";
	AuthenticationErrorCommon["nonEmptyControlStack"] = "The active bytecode completed with a non-empty control stack (missing `OP_ENDIF`).";
	AuthenticationErrorCommon["nonMinimalPush"] = "Push operations must use the smallest possible encoding.";
	AuthenticationErrorCommon["nonNullSignatureFailure"] = "Program failed a signature verification with a non-null signature (violating the \"NULLFAIL\" rule).";
	AuthenticationErrorCommon["overflowsVmNumberRange"] = "Program attempted an arithmetic operation which exceeds the range of VM Numbers.";
	AuthenticationErrorCommon["requiresCleanStack"] = "Program completed with an unexpected number of items on the stack (must be exactly 1).";
	AuthenticationErrorCommon["requiresPushOnly"] = "Unlocking bytecode may contain only push operations.";
	AuthenticationErrorCommon["schnorrSizedSignatureInCheckMultiSig"] = "Program used a schnorr-sized signature (65 bytes) in an OP_CHECKMULTISIG operation.";
	AuthenticationErrorCommon["unexpectedElse"] = "Encountered an OP_ELSE outside of an OP_IF ... OP_ENDIF block.";
	AuthenticationErrorCommon["unexpectedEndIf"] = "Encountered an OP_ENDIF that is not following a matching OP_IF.";
	AuthenticationErrorCommon["unknownOpcode"] = "Called an unknown opcode.";
	AuthenticationErrorCommon["unmatchedSequenceDisable"] = "Program called an OP_CHECKSEQUENCEVERIFY operation requiring the disable flag, but the input's sequence number is missing the disable flag.";
	AuthenticationErrorCommon["unsatisfiedLocktime"] = "Program called an OP_CHECKLOCKTIMEVERIFY operation that requires a locktime greater than the transaction's locktime.";
	AuthenticationErrorCommon["unsatisfiedSequenceNumber"] = "Program called an OP_CHECKSEQUENCEVERIFY operation that requires a sequence number greater than the input's sequence number.";
	AuthenticationErrorCommon["unsuccessfulEvaluation"] = "Unsuccessful evaluation: completed with a non-truthy value on top of the stack.";
})(AuthenticationErrorCommon || (AuthenticationErrorCommon = {}));
/**
* Applies the `error` to a `state`.
*
* @remarks
* If the state already has an error, this method does not override it.
* (Evaluation should end after the first encountered error, so further errors
* aren't relevant.)
*/
var applyError = (state, errorType, errorDetails) => ({
	...state,
	error: state.error ?? formatError(errorType, errorDetails)
});
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/2023/bch-2023-opcodes.js
/**
* The `BCH_2023_05` instruction set.
*/
var OpcodesBCH2023;
(function(OpcodesBCH2023) {
	/**
	* A.K.A. `OP_FALSE` or `OP_PUSHBYTES_0`
	*/
	OpcodesBCH2023[OpcodesBCH2023["OP_0"] = 0] = "OP_0";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
	OpcodesBCH2023[OpcodesBCH2023["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
	OpcodesBCH2023[OpcodesBCH2023["OP_1NEGATE"] = 79] = "OP_1NEGATE";
	OpcodesBCH2023[OpcodesBCH2023["OP_RESERVED"] = 80] = "OP_RESERVED";
	/**
	* A.K.A. `OP_TRUE`
	*/
	OpcodesBCH2023[OpcodesBCH2023["OP_1"] = 81] = "OP_1";
	OpcodesBCH2023[OpcodesBCH2023["OP_2"] = 82] = "OP_2";
	OpcodesBCH2023[OpcodesBCH2023["OP_3"] = 83] = "OP_3";
	OpcodesBCH2023[OpcodesBCH2023["OP_4"] = 84] = "OP_4";
	OpcodesBCH2023[OpcodesBCH2023["OP_5"] = 85] = "OP_5";
	OpcodesBCH2023[OpcodesBCH2023["OP_6"] = 86] = "OP_6";
	OpcodesBCH2023[OpcodesBCH2023["OP_7"] = 87] = "OP_7";
	OpcodesBCH2023[OpcodesBCH2023["OP_8"] = 88] = "OP_8";
	OpcodesBCH2023[OpcodesBCH2023["OP_9"] = 89] = "OP_9";
	OpcodesBCH2023[OpcodesBCH2023["OP_10"] = 90] = "OP_10";
	OpcodesBCH2023[OpcodesBCH2023["OP_11"] = 91] = "OP_11";
	OpcodesBCH2023[OpcodesBCH2023["OP_12"] = 92] = "OP_12";
	OpcodesBCH2023[OpcodesBCH2023["OP_13"] = 93] = "OP_13";
	OpcodesBCH2023[OpcodesBCH2023["OP_14"] = 94] = "OP_14";
	OpcodesBCH2023[OpcodesBCH2023["OP_15"] = 95] = "OP_15";
	OpcodesBCH2023[OpcodesBCH2023["OP_16"] = 96] = "OP_16";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP"] = 97] = "OP_NOP";
	OpcodesBCH2023[OpcodesBCH2023["OP_VER"] = 98] = "OP_VER";
	OpcodesBCH2023[OpcodesBCH2023["OP_IF"] = 99] = "OP_IF";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOTIF"] = 100] = "OP_NOTIF";
	OpcodesBCH2023[OpcodesBCH2023["OP_VERIF"] = 101] = "OP_VERIF";
	OpcodesBCH2023[OpcodesBCH2023["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
	OpcodesBCH2023[OpcodesBCH2023["OP_ELSE"] = 103] = "OP_ELSE";
	OpcodesBCH2023[OpcodesBCH2023["OP_ENDIF"] = 104] = "OP_ENDIF";
	OpcodesBCH2023[OpcodesBCH2023["OP_VERIFY"] = 105] = "OP_VERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_RETURN"] = 106] = "OP_RETURN";
	OpcodesBCH2023[OpcodesBCH2023["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
	OpcodesBCH2023[OpcodesBCH2023["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
	OpcodesBCH2023[OpcodesBCH2023["OP_2DROP"] = 109] = "OP_2DROP";
	OpcodesBCH2023[OpcodesBCH2023["OP_2DUP"] = 110] = "OP_2DUP";
	OpcodesBCH2023[OpcodesBCH2023["OP_3DUP"] = 111] = "OP_3DUP";
	OpcodesBCH2023[OpcodesBCH2023["OP_2OVER"] = 112] = "OP_2OVER";
	OpcodesBCH2023[OpcodesBCH2023["OP_2ROT"] = 113] = "OP_2ROT";
	OpcodesBCH2023[OpcodesBCH2023["OP_2SWAP"] = 114] = "OP_2SWAP";
	OpcodesBCH2023[OpcodesBCH2023["OP_IFDUP"] = 115] = "OP_IFDUP";
	OpcodesBCH2023[OpcodesBCH2023["OP_DEPTH"] = 116] = "OP_DEPTH";
	OpcodesBCH2023[OpcodesBCH2023["OP_DROP"] = 117] = "OP_DROP";
	OpcodesBCH2023[OpcodesBCH2023["OP_DUP"] = 118] = "OP_DUP";
	OpcodesBCH2023[OpcodesBCH2023["OP_NIP"] = 119] = "OP_NIP";
	OpcodesBCH2023[OpcodesBCH2023["OP_OVER"] = 120] = "OP_OVER";
	OpcodesBCH2023[OpcodesBCH2023["OP_PICK"] = 121] = "OP_PICK";
	OpcodesBCH2023[OpcodesBCH2023["OP_ROLL"] = 122] = "OP_ROLL";
	OpcodesBCH2023[OpcodesBCH2023["OP_ROT"] = 123] = "OP_ROT";
	OpcodesBCH2023[OpcodesBCH2023["OP_SWAP"] = 124] = "OP_SWAP";
	OpcodesBCH2023[OpcodesBCH2023["OP_TUCK"] = 125] = "OP_TUCK";
	OpcodesBCH2023[OpcodesBCH2023["OP_CAT"] = 126] = "OP_CAT";
	OpcodesBCH2023[OpcodesBCH2023["OP_SPLIT"] = 127] = "OP_SPLIT";
	OpcodesBCH2023[OpcodesBCH2023["OP_NUM2BIN"] = 128] = "OP_NUM2BIN";
	OpcodesBCH2023[OpcodesBCH2023["OP_BIN2NUM"] = 129] = "OP_BIN2NUM";
	OpcodesBCH2023[OpcodesBCH2023["OP_SIZE"] = 130] = "OP_SIZE";
	OpcodesBCH2023[OpcodesBCH2023["OP_INVERT"] = 131] = "OP_INVERT";
	OpcodesBCH2023[OpcodesBCH2023["OP_AND"] = 132] = "OP_AND";
	OpcodesBCH2023[OpcodesBCH2023["OP_OR"] = 133] = "OP_OR";
	OpcodesBCH2023[OpcodesBCH2023["OP_XOR"] = 134] = "OP_XOR";
	OpcodesBCH2023[OpcodesBCH2023["OP_EQUAL"] = 135] = "OP_EQUAL";
	OpcodesBCH2023[OpcodesBCH2023["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_RESERVED1"] = 137] = "OP_RESERVED1";
	OpcodesBCH2023[OpcodesBCH2023["OP_RESERVED2"] = 138] = "OP_RESERVED2";
	OpcodesBCH2023[OpcodesBCH2023["OP_1ADD"] = 139] = "OP_1ADD";
	OpcodesBCH2023[OpcodesBCH2023["OP_1SUB"] = 140] = "OP_1SUB";
	OpcodesBCH2023[OpcodesBCH2023["OP_2MUL"] = 141] = "OP_2MUL";
	OpcodesBCH2023[OpcodesBCH2023["OP_2DIV"] = 142] = "OP_2DIV";
	OpcodesBCH2023[OpcodesBCH2023["OP_NEGATE"] = 143] = "OP_NEGATE";
	OpcodesBCH2023[OpcodesBCH2023["OP_ABS"] = 144] = "OP_ABS";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOT"] = 145] = "OP_NOT";
	OpcodesBCH2023[OpcodesBCH2023["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
	OpcodesBCH2023[OpcodesBCH2023["OP_ADD"] = 147] = "OP_ADD";
	OpcodesBCH2023[OpcodesBCH2023["OP_SUB"] = 148] = "OP_SUB";
	OpcodesBCH2023[OpcodesBCH2023["OP_MUL"] = 149] = "OP_MUL";
	OpcodesBCH2023[OpcodesBCH2023["OP_DIV"] = 150] = "OP_DIV";
	OpcodesBCH2023[OpcodesBCH2023["OP_MOD"] = 151] = "OP_MOD";
	OpcodesBCH2023[OpcodesBCH2023["OP_LSHIFT"] = 152] = "OP_LSHIFT";
	OpcodesBCH2023[OpcodesBCH2023["OP_RSHIFT"] = 153] = "OP_RSHIFT";
	OpcodesBCH2023[OpcodesBCH2023["OP_BOOLAND"] = 154] = "OP_BOOLAND";
	OpcodesBCH2023[OpcodesBCH2023["OP_BOOLOR"] = 155] = "OP_BOOLOR";
	OpcodesBCH2023[OpcodesBCH2023["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
	OpcodesBCH2023[OpcodesBCH2023["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
	OpcodesBCH2023[OpcodesBCH2023["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
	OpcodesBCH2023[OpcodesBCH2023["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
	OpcodesBCH2023[OpcodesBCH2023["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
	OpcodesBCH2023[OpcodesBCH2023["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
	OpcodesBCH2023[OpcodesBCH2023["OP_MIN"] = 163] = "OP_MIN";
	OpcodesBCH2023[OpcodesBCH2023["OP_MAX"] = 164] = "OP_MAX";
	OpcodesBCH2023[OpcodesBCH2023["OP_WITHIN"] = 165] = "OP_WITHIN";
	OpcodesBCH2023[OpcodesBCH2023["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
	OpcodesBCH2023[OpcodesBCH2023["OP_SHA1"] = 167] = "OP_SHA1";
	OpcodesBCH2023[OpcodesBCH2023["OP_SHA256"] = 168] = "OP_SHA256";
	OpcodesBCH2023[OpcodesBCH2023["OP_HASH160"] = 169] = "OP_HASH160";
	OpcodesBCH2023[OpcodesBCH2023["OP_HASH256"] = 170] = "OP_HASH256";
	OpcodesBCH2023[OpcodesBCH2023["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP1"] = 176] = "OP_NOP1";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP4"] = 179] = "OP_NOP4";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP5"] = 180] = "OP_NOP5";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP6"] = 181] = "OP_NOP6";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP7"] = 182] = "OP_NOP7";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP8"] = 183] = "OP_NOP8";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP9"] = 184] = "OP_NOP9";
	OpcodesBCH2023[OpcodesBCH2023["OP_NOP10"] = 185] = "OP_NOP10";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKDATASIG"] = 186] = "OP_CHECKDATASIG";
	OpcodesBCH2023[OpcodesBCH2023["OP_CHECKDATASIGVERIFY"] = 187] = "OP_CHECKDATASIGVERIFY";
	OpcodesBCH2023[OpcodesBCH2023["OP_REVERSEBYTES"] = 188] = "OP_REVERSEBYTES";
	/**
	* First codepoint left undefined before nullary introspection operations.
	*/
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
	/**
	* Last codepoint left undefined before nullary introspection operations.
	*/
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
	OpcodesBCH2023[OpcodesBCH2023["OP_INPUTINDEX"] = 192] = "OP_INPUTINDEX";
	OpcodesBCH2023[OpcodesBCH2023["OP_ACTIVEBYTECODE"] = 193] = "OP_ACTIVEBYTECODE";
	OpcodesBCH2023[OpcodesBCH2023["OP_TXVERSION"] = 194] = "OP_TXVERSION";
	OpcodesBCH2023[OpcodesBCH2023["OP_TXINPUTCOUNT"] = 195] = "OP_TXINPUTCOUNT";
	OpcodesBCH2023[OpcodesBCH2023["OP_TXOUTPUTCOUNT"] = 196] = "OP_TXOUTPUTCOUNT";
	OpcodesBCH2023[OpcodesBCH2023["OP_TXLOCKTIME"] = 197] = "OP_TXLOCKTIME";
	OpcodesBCH2023[OpcodesBCH2023["OP_UTXOVALUE"] = 198] = "OP_UTXOVALUE";
	OpcodesBCH2023[OpcodesBCH2023["OP_UTXOBYTECODE"] = 199] = "OP_UTXOBYTECODE";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPOINTTXHASH"] = 200] = "OP_OUTPOINTTXHASH";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPOINTINDEX"] = 201] = "OP_OUTPOINTINDEX";
	OpcodesBCH2023[OpcodesBCH2023["OP_INPUTBYTECODE"] = 202] = "OP_INPUTBYTECODE";
	OpcodesBCH2023[OpcodesBCH2023["OP_INPUTSEQUENCENUMBER"] = 203] = "OP_INPUTSEQUENCENUMBER";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPUTVALUE"] = 204] = "OP_OUTPUTVALUE";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPUTBYTECODE"] = 205] = "OP_OUTPUTBYTECODE";
	OpcodesBCH2023[OpcodesBCH2023["OP_UTXOTOKENCATEGORY"] = 206] = "OP_UTXOTOKENCATEGORY";
	OpcodesBCH2023[OpcodesBCH2023["OP_UTXOTOKENCOMMITMENT"] = 207] = "OP_UTXOTOKENCOMMITMENT";
	OpcodesBCH2023[OpcodesBCH2023["OP_UTXOTOKENAMOUNT"] = 208] = "OP_UTXOTOKENAMOUNT";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPUTTOKENCATEGORY"] = 209] = "OP_OUTPUTTOKENCATEGORY";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPUTTOKENCOMMITMENT"] = 210] = "OP_OUTPUTTOKENCOMMITMENT";
	OpcodesBCH2023[OpcodesBCH2023["OP_OUTPUTTOKENAMOUNT"] = 211] = "OP_OUTPUTTOKENAMOUNT";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
	/**
	* A.K.A. `OP_PREFIX_BEGIN`
	*/
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
	/**
	* A.K.A. `OP_PREFIX_END`
	*/
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN250"] = 250] = "OP_UNKNOWN250";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN251"] = 251] = "OP_UNKNOWN251";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN253"] = 253] = "OP_UNKNOWN253";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN254"] = 254] = "OP_UNKNOWN254";
	OpcodesBCH2023[OpcodesBCH2023["OP_UNKNOWN255"] = 255] = "OP_UNKNOWN255";
})(OpcodesBCH2023 || (OpcodesBCH2023 = {}));
var OpcodesBCH = OpcodesBCH2023;
var Opcodes = OpcodesBCH;
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/instruction-sets-utils.js
/**
* A type-guard that checks if the provided instruction is malformed.
* @param instruction - the instruction to check
*/
var authenticationInstructionIsMalformed = (instruction) => "malformed" in instruction;
/**
* A type-guard that checks if the final instruction in the provided array of
* instructions is malformed. (Only the final instruction can be malformed.)
* @param instructions - the array of instructions to check
*/
var authenticationInstructionsAreMalformed = (instructions) => instructions.length > 0 && authenticationInstructionIsMalformed(instructions[instructions.length - 1]);
var authenticationInstructionsArePushInstructions = (instructions) => instructions.every((instruction) => "data" in instruction);
var uint8Bytes = 1;
var uint16Bytes = 2;
var uint32Bytes = 4;
/**
* Read a little endian number of `length` from the provided
* {@link ReadPosition}.
*
* @param position - the {@link ReadPosition} at which to start reading
* @param length - the length of the little endian number to read
*/
var readLittleEndianNumber = (position, length) => {
	const view = new DataView(position.bin.buffer, position.index, length);
	const readAsLittleEndian = true;
	return length === uint8Bytes ? view.getUint8(0) : length === uint16Bytes ? view.getUint16(0, readAsLittleEndian) : view.getUint32(0, readAsLittleEndian);
};
/**
* Returns the number of bytes used to indicate the length of the push in this
* operation.
* @param opcode - an opcode between 0x00 and 0xff
*/
var opcodeToPushLength = (opcode) => ({
	[76]: uint8Bytes,
	[77]: uint16Bytes,
	[78]: uint32Bytes
})[opcode] ?? 0;
/**
* Decode one virtual machine bytecode instruction from the
* provided {@link ReadPosition}.
*
* Returns an object with an `instruction` referencing a
* {@link AuthenticationInstructionMaybeMalformed} and the next position.
*
* If the next index is greater than or equal to the length of the bytecode, the
* bytecode has been fully decoded.
*
* The final {@link AuthenticationInstructionMaybeMalformed} in the bytecode may
* be malformed if 1) the final operation is a push and 2) too few bytes remain
* for the push operation to complete.
*
* @param position - the {@link ReadPosition} at which to start reading
*/
var readAuthenticationInstruction = (position) => {
	const { bin, index } = position;
	const opcode = bin[index];
	if (opcode > 78) return {
		instruction: { opcode },
		position: {
			bin,
			index: index + 1
		}
	};
	const lengthBytes = opcodeToPushLength(opcode);
	if (lengthBytes !== 0 && index + lengthBytes >= bin.length) {
		const sliceStart = index + 1;
		const sliceEnd = sliceStart + lengthBytes;
		return {
			instruction: {
				expectedLengthBytes: lengthBytes,
				length: bin.slice(sliceStart, sliceEnd),
				malformed: true,
				opcode
			},
			position: {
				bin,
				index: sliceEnd
			}
		};
	}
	const dataBytes = lengthBytes === 0 ? opcode : readLittleEndianNumber({
		bin,
		index: index + 1
	}, lengthBytes);
	const dataStart = index + 1 + lengthBytes;
	const dataEnd = dataStart + dataBytes;
	return {
		instruction: {
			data: bin.slice(dataStart, dataEnd),
			...dataEnd > bin.length ? {
				expectedDataBytes: dataEnd - dataStart,
				malformed: true
			} : void 0,
			opcode
		},
		position: {
			bin,
			index: dataEnd
		}
	};
};
/**
* @param instruction - the {@link AuthenticationInstruction} to clone.
* @returns A copy of the provided {@link AuthenticationInstruction}.
*
* @deprecated use `structuredClone` instead
*/
var cloneAuthenticationInstruction = (instruction) => ({
	..."data" in instruction ? { data: instruction.data } : {},
	opcode: instruction.opcode
});
/**
* Decode authentication virtual machine bytecode (`lockingBytecode` or
* `unlockingBytecode`) into {@link AuthenticationInstructionsMaybeMalformed}.
* The method {@link authenticationInstructionsAreMalformed} can be used to
* check if these instructions include a malformed instruction. If not, they are
* valid {@link AuthenticationInstructions}.
*
* @param bytecode - the authentication virtual machine bytecode to decode
*/
var decodeAuthenticationInstructions = (bytecode) => {
	const instructions = [];
	let i = 0;
	while (i < bytecode.length) {
		const { instruction, position } = readAuthenticationInstruction({
			bin: bytecode,
			index: i
		});
		i = position.index;
		instructions.push(instruction);
	}
	return instructions;
};
var isPushData = (pushOpcode) => pushOpcode >= 76;
/**
* Create an object where each key is an opcode identifier and each value is
* the bytecode value (`Uint8Array`) it represents.
* @param opcodes - An opcode enum, e.g. {@link OpcodesBCH}
*/
var generateBytecodeMap = (opcodes) => Object.entries(opcodes).filter((entry) => typeof entry[1] === "number").reduce((identifiers, pair) => ({
	...identifiers,
	[pair[0]]: Uint8Array.of(pair[1])
}), {});
var getInstructionLengthBytes = (instruction) => {
	const { opcode } = instruction;
	const expectedLength = opcodeToPushLength(opcode);
	return expectedLength === uint8Bytes ? Uint8Array.of(instruction.data.length) : expectedLength === uint16Bytes ? numberToBinUint16LE(instruction.data.length) : numberToBinUint32LE(instruction.data.length);
};
/**
* Re-encode a valid authentication instruction.
* @param instruction - the instruction to encode
*/
var encodeAuthenticationInstruction = (instruction) => Uint8Array.from([instruction.opcode, ..."data" in instruction ? [...isPushData(instruction.opcode) ? getInstructionLengthBytes(instruction) : [], ...instruction.data] : []]);
/**
* Re-encode an array of valid authentication instructions.
* @param instructions - the array of valid instructions to encode
*/
var encodeAuthenticationInstructions = (instructions) => flattenBinArray(instructions.map(encodeAuthenticationInstruction));
var VmNumberError;
(function(VmNumberError) {
	VmNumberError["outOfRange"] = "Failed to decode VM Number: overflows VM Number range.";
	VmNumberError["requiresMinimal"] = "Failed to decode VM Number: the number is not minimally-encoded.";
})(VmNumberError || (VmNumberError = {}));
var isVmNumberError = (value) => value === VmNumberError.outOfRange || value === VmNumberError.requiresMinimal;
var typicalMaximumVmNumberByteLength$1 = 8;
/**
* This method attempts to decode a VM Number, a format in which numeric values
* are represented on the stack. (The Satoshi implementation calls this
* `CScriptNum`.)
*
* If `bytes` is a valid VM Number, this method returns the represented number
* in BigInt format. If `bytes` is not valid, a {@link VmNumberError}
* is returned.
*
* All common operations accepting numeric parameters or pushing numeric values
* to the stack currently use the VM Number format. The binary format of numbers
* wouldn't be important if they could only be operated on by arithmetic
* operators, but since the results of these operations may become input to
* other operations (e.g. hashing), the specific representation is consensus-
* critical.
*
* For the reverse, see {@link bigIntToVmNumber}.
*
* @param bytes - a Uint8Array from the stack
*/
var vmNumberToBigInt = (bytes, { maximumVmNumberByteLength = typicalMaximumVmNumberByteLength$1, requireMinimalEncoding = true } = {
	maximumVmNumberByteLength: typicalMaximumVmNumberByteLength$1,
	requireMinimalEncoding: true
}) => {
	if (bytes.length === 0) return 0n;
	if (bytes.length > maximumVmNumberByteLength) return VmNumberError.outOfRange;
	const mostSignificantByte = bytes[bytes.length - 1];
	const secondMostSignificantByte = bytes[bytes.length - 1 - 1];
	if (requireMinimalEncoding && (mostSignificantByte & 127) === 0 && (bytes.length <= 1 || (secondMostSignificantByte & 128) === 0)) return VmNumberError.requiresMinimal;
	const bitsPerByte = 8;
	const signFlippingByte = 128;
	let result = 0n;
	for (let byte = 0; byte < bytes.length; byte++) result |= BigInt(bytes[byte]) << BigInt(byte * bitsPerByte);
	return (bytes[bytes.length - 1] & signFlippingByte) !== 0 ? -(result & ~(BigInt(signFlippingByte) << BigInt(bitsPerByte * (bytes.length - 1)))) : result;
};
/**
* Convert a BigInt into the VM Number format. See {@link vmNumberToBigInt} for
* more information.
*
* For the reverse, use {@link vmNumberToBigInt}.
*
* @param integer - the BigInt to encode as a VM Number
*/
var bigIntToVmNumber = (integer) => {
	if (integer === 0n) return /* @__PURE__ */ new Uint8Array();
	const bytes = [];
	const isNegative = integer < 0;
	const byteStates = 255;
	const bitsPerByte = 8;
	let remaining = isNegative ? -integer : integer;
	while (remaining > 0) {
		bytes.push(Number(remaining & BigInt(byteStates)));
		remaining >>= BigInt(bitsPerByte);
	}
	const signFlippingByte = 128;
	if ((bytes[bytes.length - 1] & signFlippingByte) > 0) bytes.push(isNegative ? signFlippingByte : 0);
	else if (isNegative) bytes[bytes.length - 1] |= signFlippingByte;
	return new Uint8Array(bytes);
};
/**
* Returns true if the provided stack item is "truthy" in the sense required
* by several operations (anything but zero and "negative zero").
*
* The Satoshi implementation calls this method `CastToBool`.
*
* To cast a boolean value to a stack item (VM number),
* use {@link booleanToVmNumber}.
*
* @param item - the stack item to check for truthiness
*/
var stackItemIsTruthy = (item) => {
	const signFlippingByte = 128;
	for (let i = 0; i < item.length; i++) if (item[i] !== 0) {
		if (i === item.length - 1 && item[i] === signFlippingByte) return false;
		return true;
	}
	return false;
};
/**
* Convert a boolean into VM Number format (the type used to express
* boolean values emitted by several operations).
*
* For the less-strict inverse used by the VM, see {@link stackItemIsTruthy}.
*
* @param value - the boolean value to convert
*/
var booleanToVmNumber = (value) => value ? bigIntToVmNumber(1n) : bigIntToVmNumber(0n);
/**
* From C++ implementation:
* Note that IsPushOnly() *does* consider OP_RESERVED to be a push-type
* opcode, however execution of OP_RESERVED fails, so it's not relevant to
* P2SH/BIP62 as the scriptSig would fail prior to the P2SH special
* validation code being executed.
*/
var isPushOperation = (opcode) => opcode <= 96;
var isPushOnly = (bytecode) => {
	return decodeAuthenticationInstructions(bytecode).every((instruction) => isPushOperation(instruction.opcode));
};
/**
* Test if the provided locking bytecode is an arbitrary data output (A.K.A.
* `TX_NULL_DATA`, "data carrier", or OP_RETURN output).
* @param lockingBytecode - the locking bytecode to test
*/
var isArbitraryDataOutput = (lockingBytecode) => lockingBytecode.length >= 1 && lockingBytecode[0] === 106 && isPushOnly(lockingBytecode.slice(1));
/**
* Given a number of bytes and a fee rate in satoshis-per-kilobyte, return the
* minimum required fee. This calculation is important for standardness in dust
* threshold calculation.
*
* @param length - the number of bytes for which the fee is to be paid
* @param feeRateSatsPerKb - the fee rate in satoshis per 1000 bytes
*/
var getMinimumFee = (length, feeRateSatsPerKb) => {
	if (length < 1n) return 0n;
	const truncated = length * feeRateSatsPerKb / BigInt(1e3);
	return truncated === 0n ? 1n : truncated;
};
/**
* Given an encoded output length, return the minimum output value in satoshis
* required to exceed the dust threshold. See {@link getDustThreshold}
* for details.
*
* Most applications should instead use {@link getDustThreshold} to ensure
* proper encoding and proper treatment of arbitrary data outputs
* ({@link isArbitraryDataOutput}).
*
* @param outputLength - the length of the serialized output
* @param dustRelayFeeSatPerKb - the "dust relay fee", defaults to `1000n`
*/
var getDustThresholdForLength = (outputLength, dustRelayFeeSatPerKb = BigInt(1e3)) => {
	const expectedTotalLength = outputLength + 148;
	return BigInt(3) * getMinimumFee(BigInt(expectedTotalLength), dustRelayFeeSatPerKb);
};
/**
* Given an {@link Output} and (optionally) a dust relay fee in
* satoshis-per-kilobyte, return the minimum satoshi value for this output to
* not be considered a "dust output". **For nodes to relay or mine a transaction
* with this output, the output must have a satoshi value greater than or equal
* to this threshold.**
*
* By standardness, if an output is expected to cost more than 1/3 of it's value
* in fees to spend, it is considered dust. When calculating the expected fee,
* the input size is assumed to be (at least) the size of a typical P2PKH input
* spent using a 72-byte ECDSA signature, 148 bytes:
* - Outpoint transaction hash: 32 bytes
* - Outpoint index: 4 bytes
* - Unlocking bytecode length: 1 byte
* - Push of 72-byte ECDSA signature: 72 + 1 byte
* - Push of public key: 33 + 1 byte
* - Sequence number: 4 bytes
*
* The encoded length of the serialized output is added to 148 bytes, and the
* dust threshold for the output is 3 times the minimum fee for the total bytes.
* For a P2PKH output (34 bytes) and the standard 1000 sat/Kb dust relay fee,
* this results in a dust limit of `546` satoshis (`(34+148)*3*1000/1000`).
*
* Note, arbitrary data outputs are not required to meet the dust limit as
* they are provably unspendable and can be pruned from the UTXO set.
*
* @param output - the output to test
* @param dustRelayFeeSatPerKb - the "dust relay fee", defaults to `1000n`
*/
var getDustThreshold = (output, dustRelayFeeSatPerKb = BigInt(1e3)) => {
	if (isArbitraryDataOutput(output.lockingBytecode)) return 0n;
	const encodedOutputLength = encodeTransactionOutput(output).length;
	return getDustThresholdForLength(encodedOutputLength, dustRelayFeeSatPerKb);
};
/**
* Given an {@link Output} and (optionally) a dust relay fee in
* satoshis-per-kilobyte, return `true` if the provided output is considered
* a "dust output", or `false` otherwise.
*
* @param output - the output to test
* @param dustRelayFeeSatPerKb - the "dust relay fee", defaults to `1000n`
*/
var isDustOutput = (output, dustRelayFeeSatPerKb = BigInt(1e3)) => output.valueSatoshis < getDustThreshold(output, dustRelayFeeSatPerKb);
var isValidUncompressedPublicKeyEncoding = (publicKey) => publicKey.length === 65 && publicKey[0] === 4;
var isValidCompressedPublicKeyEncoding = (publicKey) => publicKey.length === 33 && (publicKey[0] === 2 || publicKey[0] === 3);
var isValidPublicKeyEncoding = (publicKey) => isValidCompressedPublicKeyEncoding(publicKey) || isValidUncompressedPublicKeyEncoding(publicKey);
var pushNumberOpcodeToNumber = (opcode) => {
	if (opcode === 0) return 0;
	if (opcode === 79) return -1;
	if (!Number.isInteger(opcode) || opcode < 81 || opcode > 96) return false;
	return opcode - 80;
};
var isSimpleMultisig = (lockingBytecode) => {
	const instructions = decodeAuthenticationInstructions(lockingBytecode);
	if (authenticationInstructionsAreMalformed(instructions)) return false;
	const lastIndex = instructions.length - 1;
	if (instructions.length < 4 || instructions[lastIndex].opcode !== 174) return false;
	/**
	* The required count of signers (the `m` in `m-of-n`).
	*/
	const m = pushNumberOpcodeToNumber(instructions[0].opcode);
	/**
	* The total count of signers (the `n` in `m-of-n`).
	*/
	const n = pushNumberOpcodeToNumber(instructions[lastIndex - 1].opcode);
	if (n === false || m === false) return false;
	const publicKeyInstructions = instructions.slice(1, -2);
	if (!authenticationInstructionsArePushInstructions(publicKeyInstructions)) return false;
	const publicKeys = publicKeyInstructions.map((instruction) => instruction.data);
	if (publicKeys.some((key) => !isValidPublicKeyEncoding(key))) return false;
	return {
		m,
		n,
		publicKeys
	};
};
var isStandardMultisig = (lockingBytecode) => {
	const multisigProperties = isSimpleMultisig(lockingBytecode);
	if (multisigProperties === false) return false;
	const { m, n } = multisigProperties;
	if (n < 1 || n > 3 || m < 1 || m > n) return false;
	return true;
};
var isStandardOutputBytecode2023 = (lockingBytecode) => isPayToPublicKeyHash(lockingBytecode) || isPayToScriptHash20(lockingBytecode) || isPayToScriptHash32(lockingBytecode) || isPayToPublicKey(lockingBytecode) || isArbitraryDataOutput(lockingBytecode) || isStandardMultisig(lockingBytecode);
/**
* Test a stack item for the SegWit Recovery Rules activated in `BCH_2019_05`.
*
* @param bytecode - the stack item to test
*/
var isWitnessProgram = (bytecode) => {
	const correctLength = bytecode.length >= 4 && bytecode.length <= 42;
	const validVersionPush = bytecode[0] === 0 || bytecode[0] >= 81 && bytecode[0] <= 96;
	const correctLengthByte = bytecode[1] + 2 === bytecode.length;
	return correctLength && validVersionPush && correctLengthByte;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/combinators.js
var incrementOperationCount = (operation) => (state) => {
	const nextState = operation(state);
	nextState.operationCount += 1;
	return nextState;
};
var conditionallyEvaluate = (operation) => (state) => state.controlStack.every((item) => item) ? operation(state) : state;
/**
* Map a function over each operation in an {@link InstructionSet.operations}
* object, assigning the result to the same `opcode` in the resulting object.
* @param operationMap - an operations map from an {@link InstructionSet}
* @param combinators - a list of functions to apply (in order) to
* each operation
*/
var mapOverOperations = (combinators, operationMap) => Object.keys(operationMap).reduce((result, opcode) => ({
	...result,
	[opcode]: combinators.reduce((op, combinator) => combinator(op), operationMap[Number(opcode)])
}), {});
/**
* Pop one stack item off of `state.stack` and provide that item to `operation`.
*/
var useOneStackItem = (state, operation) => {
	const item = state.stack.pop();
	if (item === void 0) return applyError(state, AuthenticationErrorCommon.emptyStack);
	return operation(state, [item]);
};
var useTwoStackItems = (state, operation) => useOneStackItem(state, (nextState, [valueTwo]) => useOneStackItem(nextState, (lastState, [valueTop]) => operation(lastState, [valueTop, valueTwo])));
var useThreeStackItems = (state, operation) => useOneStackItem(state, (nextState, [valueThree]) => useTwoStackItems(nextState, (lastState, [valueTop, valueTwo]) => operation(lastState, [
	valueTop,
	valueTwo,
	valueThree
])));
var useFourStackItems = (state, operation) => useTwoStackItems(state, (nextState, [valueThree, valueFour]) => useTwoStackItems(nextState, (lastState, [valueTop, valueTwo]) => operation(lastState, [
	valueTop,
	valueTwo,
	valueThree,
	valueFour
])));
var useSixStackItems = (state, operation) => useFourStackItems(state, (nextState, [valueThree, valueFour, valueFive, valueSix]) => useTwoStackItems(nextState, (lastState, [valueTop, valueTwo]) => operation(lastState, [
	valueTop,
	valueTwo,
	valueThree,
	valueFour,
	valueFive,
	valueSix
])));
var typicalMaximumVmNumberByteLength = 8;
var useOneVmNumber = (state, operation, { maximumVmNumberByteLength = typicalMaximumVmNumberByteLength, requireMinimalEncoding = true } = {
	maximumVmNumberByteLength: typicalMaximumVmNumberByteLength,
	requireMinimalEncoding: true
}) => useOneStackItem(state, (nextState, [item]) => {
	const value = vmNumberToBigInt(item, {
		maximumVmNumberByteLength,
		requireMinimalEncoding
	});
	if (isVmNumberError(value)) return applyError(state, AuthenticationErrorCommon.invalidVmNumber);
	return operation(nextState, [value]);
});
var useTwoVmNumbers = (state, operation, { maximumVmNumberByteLength = typicalMaximumVmNumberByteLength, requireMinimalEncoding = true } = {
	maximumVmNumberByteLength: typicalMaximumVmNumberByteLength,
	requireMinimalEncoding: true
}) => useOneVmNumber(state, (nextState, [secondValue]) => useOneVmNumber(nextState, (lastState, [firstValue]) => operation(lastState, [firstValue, secondValue]), {
	maximumVmNumberByteLength,
	requireMinimalEncoding
}), {
	maximumVmNumberByteLength,
	requireMinimalEncoding
});
var useThreeVmNumbers = (state, operation, { maximumVmNumberByteLength = typicalMaximumVmNumberByteLength, requireMinimalEncoding = true } = {
	maximumVmNumberByteLength: typicalMaximumVmNumberByteLength,
	requireMinimalEncoding: true
}) => useTwoVmNumbers(state, (nextState, [secondValue, thirdValue]) => useOneVmNumber(nextState, (lastState, [firstValue]) => operation(lastState, [
	firstValue,
	secondValue,
	thirdValue
]), {
	maximumVmNumberByteLength,
	requireMinimalEncoding
}), {
	maximumVmNumberByteLength,
	requireMinimalEncoding
});
/**
* Return the provided state with the provided value pushed to its stack.
* @param state - the state to update and return
* @param data - the value to push to the stack
*/
var pushToStack = (state, ...data) => {
	state.stack.push(...data);
	return state;
};
/**
* If the provided item exceeds the maximum stack item length, apply an error.
* Otherwise, return the provided state with the item pushed to its stack.
* @param state - the state to update and return
* @param item - the value to push to the stack
*/
var pushToStackChecked = (state, item, maximumLength = ConsensusCommon.maximumStackItemLength) => {
	if (item.length > maximumLength) return applyError(state, `${AuthenticationErrorCommon.exceededMaximumStackItemLength} Item length: ${item.length} bytes.`);
	state.stack.push(item);
	return state;
};
/**
* Return the provided state with the VM number pushed to its stack.
* @param state - the state to update and return
* @param vmNumber - the number to push to the stack
*/
var pushToStackVmNumber = (state, vmNumber) => pushToStack(state, bigIntToVmNumber(vmNumber));
/**
* If the provided number is outside the VM number range, apply an error.
* Otherwise, return the provided state with the VM number pushed to its stack.
* @param state - the state to update and return
* @param vmNumber - the VM number to push to the stack
*/
var pushToStackVmNumberChecked = (state, vmNumber, { minVmNumber = BigInt(ConsensusCommon.minVmNumber), maxVmNumber = BigInt(ConsensusCommon.maxVmNumber) } = {}) => {
	if (vmNumber > maxVmNumber || vmNumber < minVmNumber) return applyError(state, AuthenticationErrorCommon.overflowsVmNumberRange);
	return pushToStackVmNumber(state, vmNumber);
};
var combineOperations = (firstOperation, secondOperation) => (state) => secondOperation(firstOperation(state));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/flow-control.js
var opVerify = (state) => useOneStackItem(state, (nextState, [item]) => stackItemIsTruthy(item) ? nextState : applyError(nextState, AuthenticationErrorCommon.failedVerify));
var reservedOperation = (state) => applyError(state, AuthenticationErrorCommon.calledReserved);
var opReturn = (state) => applyError(state, AuthenticationErrorCommon.calledReturn);
var opIf = (state) => {
	if (state.controlStack.every((item) => item)) return useOneStackItem(state, (nextState, [item]) => {
		nextState.controlStack.push(stackItemIsTruthy(item));
		return state;
	});
	state.controlStack.push(false);
	return state;
};
/**
* Note, `OP_NOTIF` is not completely equivalent to `OP_NOT OP_IF`. `OP_NOT`
* operates on a VM Number (as the inverse of `OP_0NOTEQUAL`), while `OP_NOTIF`
* checks the "truthy-ness" of a stack item like `OP_IF`.
*/
var opNotIf = (state) => {
	if (state.controlStack.every((item) => item)) return useOneStackItem(state, (nextState, [item]) => {
		nextState.controlStack.push(!stackItemIsTruthy(item));
		return state;
	});
	state.controlStack.push(false);
	return state;
};
var opEndIf = (state) => {
	if (state.controlStack.pop() === void 0) return applyError(state, AuthenticationErrorCommon.unexpectedEndIf);
	return state;
};
var opElse = (state) => {
	const top = state.controlStack[state.controlStack.length - 1];
	if (top === void 0) return applyError(state, AuthenticationErrorCommon.unexpectedElse);
	state.controlStack[state.controlStack.length - 1] = !top;
	return state;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/arithmetic.js
var op1Add = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStackVmNumberChecked(nextState, value + 1n));
var op1Sub = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, bigIntToVmNumber(value - 1n)));
var opNegate = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, bigIntToVmNumber(-value)));
var opAbs = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, bigIntToVmNumber(value < 0 ? -value : value)));
var opNot = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, value === 0n ? bigIntToVmNumber(1n) : bigIntToVmNumber(0n)));
var op0NotEqual = (state) => useOneVmNumber(state, (nextState, [value]) => pushToStack(nextState, value === 0n ? bigIntToVmNumber(0n) : bigIntToVmNumber(1n)));
var opAdd = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStackVmNumberChecked(nextState, firstValue + secondValue));
var opSub = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, bigIntToVmNumber(firstValue - secondValue)));
var opBoolAnd = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue !== 0n && secondValue !== 0n)));
var opBoolOr = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue !== 0n || secondValue !== 0n)));
var opNumEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue === secondValue)));
var opNumEqualVerify = combineOperations(opNumEqual, opVerify);
var opNumNotEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue !== secondValue)));
var opLessThan = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue < secondValue)));
var opLessThanOrEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue <= secondValue)));
var opGreaterThan = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue > secondValue)));
var opGreaterThanOrEqual = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, booleanToVmNumber(firstValue >= secondValue)));
var opMin = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, bigIntToVmNumber(firstValue < secondValue ? firstValue : secondValue)));
var opMax = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStack(nextState, bigIntToVmNumber(firstValue > secondValue ? firstValue : secondValue)));
var opWithin = (state) => useThreeVmNumbers(state, (nextState, [firstValue, secondValue, thirdValue]) => pushToStack(nextState, booleanToVmNumber(secondValue <= firstValue && firstValue < thirdValue)));
var opMul = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => pushToStackVmNumberChecked(nextState, firstValue * secondValue));
var opDiv = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => secondValue === 0n ? applyError(nextState, AuthenticationErrorCommon.divisionByZero) : pushToStack(nextState, bigIntToVmNumber(firstValue / secondValue)));
var opMod = (state) => useTwoVmNumbers(state, (nextState, [firstValue, secondValue]) => secondValue === 0n ? applyError(nextState, AuthenticationErrorCommon.divisionByZero) : pushToStack(nextState, bigIntToVmNumber(firstValue % secondValue)));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/bitwise.js
var opEqual = (state) => useTwoStackItems(state, (nextState, [element1, element2]) => pushToStack(nextState, booleanToVmNumber(binsAreEqual(element1, element2))));
var opEqualVerify = combineOperations(opEqual, opVerify);
var bitwiseOperation = (combine) => (state) => useTwoStackItems(state, (nextState, [a, b]) => a.length === b.length ? pushToStack(nextState, combine(a, b)) : applyError(nextState, AuthenticationErrorCommon.mismatchedBitwiseOperandLength));
var opAnd = bitwiseOperation((a, b) => a.map((v, i) => v & b[i]));
var opOr = bitwiseOperation((a, b) => a.map((v, i) => v | b[i]));
var opXor = bitwiseOperation((a, b) => a.map((v, i) => v ^ b[i]));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/common-types.js
var undefinedOperation = conditionallyEvaluate((state) => applyError(state, AuthenticationErrorCommon.unknownOpcode));
/**
* @deprecated use `structuredClone` instead
*/
var cloneStack = (stack) => stack.map((item) => item.slice());
var createAuthenticationProgramStateCommon = ({ program, instructions, stack }) => ({
	alternateStack: [],
	controlStack: [],
	instructions,
	ip: 0,
	lastCodeSeparator: -1,
	operationCount: 0,
	program,
	signatureOperationsCount: 0,
	signedMessages: [],
	stack
});
/**
* @deprecated use `structuredClone` instead
*/
var cloneAuthenticationProgramCommon = (program) => ({
	inputIndex: program.inputIndex,
	sourceOutputs: cloneTransactionOutputsCommon(program.sourceOutputs),
	transaction: cloneTransactionCommon(program.transaction)
});
/**
* @deprecated use `structuredClone` instead
*/
var cloneAuthenticationProgramStateCommon = (state) => ({
	...state.error === void 0 ? {} : { error: state.error },
	alternateStack: cloneStack(state.alternateStack),
	controlStack: state.controlStack.slice(),
	instructions: state.instructions.map(cloneAuthenticationInstruction),
	ip: state.ip,
	lastCodeSeparator: state.lastCodeSeparator,
	operationCount: state.operationCount,
	program: cloneAuthenticationProgramCommon(state.program),
	signatureOperationsCount: state.signatureOperationsCount,
	signedMessages: state.signedMessages.map((item) => ({
		digest: item.digest.slice(),
		..."serialization" in item ? { serialization: item.serialization.slice() } : { message: item.message.slice() }
	})),
	stack: cloneStack(state.stack)
});
/**
* @deprecated use `structuredClone` instead
*/
var cloneAuthenticationProgramStateBCH = cloneAuthenticationProgramStateCommon;
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/encoding.js
var isNegative = (value) => (value & 128) !== 0;
var hasUnnecessaryPadding = (length, firstByte, secondByte) => length > 1 && firstByte === 0 && !isNegative(secondByte);
var isValidInteger = (signature, tagIndex, length, valueIndex) => signature[tagIndex] === 2 && length !== 0 && !isNegative(signature[valueIndex]) && !hasUnnecessaryPadding(length, signature[valueIndex], signature[valueIndex + 1]);
/**
* Validate a DER-encoded signature.
*
* @remarks
* This function is consensus-critical since BIP66, but differs from the BIP66
* specification in that it does not validate the existence of a signing
* serialization type byte at the end of the signature (to support
* OP_CHECKDATASIG). To validate a bitcoin-encoded signature (including null
* signatures), use {@link isValidSignatureEncodingBCHTransaction}.
*
* @privateRemarks
* From the Bitcoin ABC C++ implementation:
*
* Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
* total-length: 1-byte length descriptor of everything that follows,
* excluding the sighash byte.
* R-length: 1-byte length descriptor of the R value that follows.
* R: arbitrary-length big-endian encoded R value. It must use the
* shortest possible encoding for a positive integers (which means no null
* bytes at the start, except a single one when the next byte has its highest
* bit set).
* S-length: 1-byte length descriptor of the S value that follows.
* S: arbitrary-length big-endian encoded S value. The same rules apply.
*/
var isValidSignatureEncodingDER = (signature) => {
	const correctLengthRange = signature.length > 8 && signature.length < 72;
	const correctSequenceTagType = signature[0] === 48;
	const correctSequenceLength = signature[1] === signature.length - 2;
	const rLength = signature[3];
	if (rLength === void 0) return false;
	const consistentRLength = rLength <= signature.length - 7;
	const rIsValid = isValidInteger(signature, 2, rLength, 4);
	const sTagIndex = 4 + rLength;
	const sLengthIndex = sTagIndex + 1;
	const sLength = signature[sLengthIndex];
	if (sLength === void 0) return false;
	const sValueIndex = sLengthIndex + 1;
	const consistentSLength = sValueIndex + sLength === signature.length;
	const sIsValid = isValidInteger(signature, sTagIndex, sLength, sValueIndex);
	return correctLengthRange && correctSequenceTagType && correctSequenceLength && consistentRLength && rIsValid && consistentSLength && sIsValid;
};
/**
* Validate the encoding of a transaction signature, including a signing
* serialization type byte (A.K.A. "sighash" byte).
*
* @param transactionSignature - the full transaction signature
*/
var isValidSignatureEncodingBCHTransaction = (transactionSignature, validSigningSerializationTypes) => transactionSignature.length === 0 || validSigningSerializationTypes.includes(transactionSignature[transactionSignature.length - 1]) && (transactionSignature.length === ConsensusCommon.schnorrSignatureLength + 1 || isValidSignatureEncodingDER(transactionSignature.slice(0, transactionSignature.length - 1)));
/**
* Split a bitcoin-encoded signature into a signature and signing serialization
* type.
*
* While a bitcoin-encoded signature only includes a single byte to encode the
* signing serialization type, a 3-byte forkId can be appended to the signing
* serialization to provide replay-protection between different forks. (See
* Bitcoin Cash's Replay Protected Sighash spec for details.)
*
* @param encodedSignature - a signature that passes
* {@link isValidSignatureEncodingBCHTransaction}
*/
var decodeBitcoinSignature = (encodedSignature) => ({
	signature: encodedSignature.slice(0, -1),
	signingSerializationType: encodedSignature.slice(-1)
});
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/crypto.js
var opRipemd160 = ({ ripemd160: ripemd160$2 } = { ripemd160 }) => (state) => useOneStackItem(state, (nextState, [value]) => pushToStack(nextState, ripemd160$2.hash(value)));
var opSha1 = ({ sha1: sha1$2 } = { sha1 }) => (state) => useOneStackItem(state, (nextState, [value]) => pushToStack(nextState, sha1$2.hash(value)));
var opSha256 = ({ sha256: sha256$5 } = { sha256 }) => (state) => useOneStackItem(state, (nextState, [value]) => pushToStack(nextState, sha256$5.hash(value)));
var opHash160 = ({ ripemd160: ripemd160$3, sha256: sha256$6 } = {
	ripemd160,
	sha256
}) => (state) => useOneStackItem(state, (nextState, [value]) => pushToStack(nextState, ripemd160$3.hash(sha256$6.hash(value))));
var opHash256 = ({ sha256: sha256$7 } = { sha256 }) => (state) => useOneStackItem(state, (nextState, [value]) => pushToStack(nextState, hash256(value, sha256$7)));
var opCodeSeparator = (state) => {
	state.lastCodeSeparator = state.ip;
	return state;
};
/**
* Validate the encoding of a raw signature – a signature without a signing
* serialization type byte (A.K.A. "sighash" byte).
*
* @param signature - the raw signature
*/
var isValidSignatureEncodingBCHRaw = (signature) => signature.length === 0 || signature.length === ConsensusCommon.schnorrSignatureLength || isValidSignatureEncodingDER(signature);
var opCheckDataSig = ({ secp256k1, sha256 }) => (state) => useThreeStackItems(state, (nextState, [signature, message, publicKey]) => {
	if (!isValidSignatureEncodingBCHRaw(signature)) return applyError(nextState, AuthenticationErrorCommon.invalidSignatureEncoding, `Data signature: ${binToHex(signature)}`);
	if (!isValidPublicKeyEncoding(publicKey)) return applyError(nextState, AuthenticationErrorCommon.invalidPublicKeyEncoding);
	const digest = sha256.hash(message);
	nextState.signedMessages.push({
		digest,
		message
	});
	const success = signature.length === ConsensusCommon.schnorrSignatureLength ? secp256k1.verifySignatureSchnorr(signature, publicKey, digest) : secp256k1.verifySignatureDERLowS(signature, publicKey, digest);
	return !success && signature.length !== 0 ? applyError(nextState, AuthenticationErrorCommon.nonNullSignatureFailure) : pushToStack(nextState, booleanToVmNumber(success));
});
var opCheckDataSigVerify = ({ secp256k1: secp256k1$8, sha256: sha256$11 } = {
	secp256k1,
	sha256
}) => combineOperations(opCheckDataSig({
	secp256k1: secp256k1$8,
	sha256: sha256$11
}), opVerify);
var opReverseBytes = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, item.slice().reverse()));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/format.js
var opCat = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStackChecked(nextState, flattenBinArray([a, b])));
var opSplit = (state) => useOneVmNumber(state, (nextState, value) => {
	const index = Number(value);
	return useOneStackItem(nextState, (finalState, [item]) => index < 0 || index > item.length ? applyError(finalState, AuthenticationErrorCommon.invalidSplitIndex) : pushToStack(finalState, item.slice(0, index), item.slice(index)));
});
/**
* Pad a minimally-encoded VM number for `OP_NUM2BIN`.
*/
var padMinimallyEncodedVmNumber = (vmNumber, length) => {
	let signBit = 0;
	if (vmNumber.length > 0) {
		signBit = vmNumber[vmNumber.length - 1] & 128;
		vmNumber[vmNumber.length - 1] &= 127;
	}
	const result = Array.from(vmNumber);
	while (result.length < length - 1) result.push(0);
	result.push(signBit);
	return Uint8Array.from(result);
};
var opNum2Bin = (state) => useOneVmNumber(state, (nextState, value) => {
	const targetLength = Number(value);
	return targetLength > ConsensusCommon.maximumStackItemLength ? applyError(nextState, `${AuthenticationErrorCommon.exceededMaximumStackItemLength} Item length: ${targetLength} bytes.`) : useOneVmNumber(nextState, (finalState, [target]) => {
		const minimallyEncoded = bigIntToVmNumber(target);
		return minimallyEncoded.length > targetLength ? applyError(finalState, AuthenticationErrorCommon.insufficientLength) : minimallyEncoded.length === targetLength ? pushToStack(finalState, minimallyEncoded) : pushToStack(finalState, padMinimallyEncodedVmNumber(minimallyEncoded, targetLength));
	}, {
		maximumVmNumberByteLength: ConsensusCommon.maximumStackItemLength,
		requireMinimalEncoding: false
	});
});
var opBin2Num = (state) => useOneVmNumber(state, (nextState, [target]) => {
	const minimallyEncoded = bigIntToVmNumber(target);
	return minimallyEncoded.length > ConsensusCommon.maximumVmNumberLength ? applyError(nextState, AuthenticationErrorCommon.exceededMaximumVmNumberLength) : pushToStack(nextState, minimallyEncoded);
}, {
	maximumVmNumberByteLength: ConsensusCommon.maximumStackItemLength,
	requireMinimalEncoding: false
});
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/inspection.js
var opInputIndex = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.inputIndex));
var opActiveBytecode = (state) => pushToStackChecked(state, encodeAuthenticationInstructions(state.instructions.slice(state.lastCodeSeparator + 1)));
var opTxVersion = (state) => pushToStackVmNumberChecked(state, BigInt(int32UnsignedToSigned(state.program.transaction.version)));
var opTxInputCount = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.transaction.inputs.length));
var opTxOutputCount = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.transaction.outputs.length));
var opTxLocktime = (state) => pushToStackVmNumberChecked(state, BigInt(state.program.transaction.locktime));
var useTransactionUtxo = (state, operation) => useOneVmNumber(state, (nextState, [index]) => {
	const utxo = nextState.program.sourceOutputs[Number(index)];
	if (utxo === void 0) return applyError(nextState, AuthenticationErrorCommon.invalidTransactionUtxoIndex);
	return operation(state, [utxo]);
});
var opUtxoValue = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushToStackVmNumberChecked(nextState, utxo.valueSatoshis));
var opUtxoBytecode = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushToStackChecked(nextState, utxo.lockingBytecode.slice()));
var useTransactionInput = (state, operation) => useOneVmNumber(state, (nextState, [index]) => {
	const input = nextState.program.transaction.inputs[Number(index)];
	if (input === void 0) return applyError(nextState, AuthenticationErrorCommon.invalidTransactionInputIndex);
	return operation(state, [input]);
});
var opOutpointTxHash = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackChecked(nextState, input.outpointTransactionHash.slice().reverse()));
var opOutpointIndex = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackVmNumberChecked(nextState, BigInt(input.outpointIndex)));
var opInputBytecode = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackChecked(nextState, input.unlockingBytecode.slice()));
var opInputSequenceNumber = (state) => useTransactionInput(state, (nextState, [input]) => pushToStackVmNumberChecked(nextState, BigInt(input.sequenceNumber)));
var useTransactionOutput = (state, operation) => useOneVmNumber(state, (nextState, [index]) => {
	const input = nextState.program.transaction.outputs[Number(index)];
	if (input === void 0) return applyError(nextState, AuthenticationErrorCommon.invalidTransactionOutputIndex);
	return operation(state, [input]);
});
var opOutputValue = (state) => useTransactionOutput(state, (nextState, [output]) => pushToStackVmNumberChecked(nextState, output.valueSatoshis));
var opOutputBytecode = (state) => useTransactionOutput(state, (nextState, [output]) => pushToStackChecked(nextState, output.lockingBytecode.slice()));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/nop.js
var opNop = (state) => state;
var opNopDisallowed = (state) => applyError(state, AuthenticationErrorCommon.calledUpgradableNop);
/**
* "Disabled" operations are explicitly forbidden from occurring anywhere in VM
* bytecode, even within an unexecuted branch.
*/
var disabledOperation = (state) => applyError(state, AuthenticationErrorCommon.unknownOpcode);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/push.js
/**
* Returns the minimal bytecode required to push the provided `data` to the
* stack.
*
* @remarks
* This method conservatively encodes a `Uint8Array` as a data push. For VM
* Numbers that can be pushed using a single opcode (-1 through 16), the
* equivalent bytecode value is returned. Other `data` values will be prefixed
* with the proper opcode and push length bytes (if necessary) to create the
* minimal push instruction.
*
* Note, while some single-byte VM Number pushes will be minimally-encoded by
* this method, all larger inputs will be encoded as-is (it cannot be assumed
* that inputs are intended to be used as VM Numbers). To encode the push of a
* VM Number, minimally-encode the number before passing it to this
* method, e.g.:
* `encodeDataPush(bigIntToVmNumber(decodeVmNumber(nonMinimalNumber)))`.
*
* The maximum `bytecode` length that can be encoded for a push in the Bitcoin
* system is `4294967295` (~4GB). This method assumes a smaller input – if
* `bytecode` has the potential to be longer, it should be checked (and the
* error handled) prior to calling this method.
*
* @param data - the Uint8Array to push to the stack
*/
var encodeDataPush = (data) => data.length <= 75 ? data.length === 0 ? Uint8Array.of(0) : data.length === 1 ? data[0] !== 0 && data[0] <= 16 ? Uint8Array.of(data[0] + 80) : data[0] === 129 ? Uint8Array.of(79) : Uint8Array.from([1, ...data]) : Uint8Array.from([data.length, ...data]) : data.length <= 255 ? Uint8Array.from([
	76,
	data.length,
	...data
]) : data.length <= 65535 ? Uint8Array.from([
	77,
	...numberToBinUint16LE(data.length),
	...data
]) : Uint8Array.from([
	78,
	...numberToBinUint32LE(data.length),
	...data
]);
/**
* Returns true if the provided `data` is minimally-encoded by the provided
* `opcode`.
* @param opcode - the opcode used to push `data`
* @param data - the contents of the push
*/
var isMinimalDataPush = (opcode, data) => {
	if (data.length === 0) return opcode === 0;
	if (data.length === 1) {
		if (data[0] >= 1 && data[0] <= 16) return opcode === data[0] + 80;
		if (data[0] === 129) return opcode === 79;
		return true;
	}
	if (data.length <= 75) return opcode === data.length;
	if (data.length <= 255) return opcode === 76;
	if (data.length <= 65535) return opcode === 77;
	if (data.length <= 4294967295) return opcode === 78;
	return false;
};
var executionIsActive = (state) => state.controlStack.every((item) => item);
var pushOperation = (maximumPushSize = ConsensusCommon.maximumStackItemLength) => (state) => {
	const instruction = state.instructions[state.ip];
	return instruction.data.length > maximumPushSize ? applyError(state, `${AuthenticationErrorCommon.exceededMaximumStackItemLength} Item length: ${instruction.data.length} bytes.`) : executionIsActive(state) ? isMinimalDataPush(instruction.opcode, instruction.data) ? pushToStack(state, instruction.data) : applyError(state, AuthenticationErrorCommon.nonMinimalPush) : state;
};
/**
* @param number - the number that is pushed to the stack by this operation.
* @returns an operation that pushes a number to the stack.
*/
var pushNumberOperation = (number) => {
	const value = bigIntToVmNumber(BigInt(number));
	return (state) => pushToStack(state, value);
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/stack.js
var opToAltStack = (state) => useOneStackItem(state, (nextState, [item]) => {
	nextState.alternateStack.push(item);
	return nextState;
});
var opFromAltStack = (state) => {
	const item = state.alternateStack.pop();
	if (item === void 0) return applyError(state, AuthenticationErrorCommon.emptyAlternateStack);
	return pushToStack(state, item);
};
var op2Drop = (state) => useTwoStackItems(state, (nextState) => nextState);
var op2Dup = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, a, b, a.slice(), b.slice()));
var op3Dup = (state) => useThreeStackItems(state, (nextState, [a, b, c]) => pushToStack(nextState, a, b, c, a.slice(), b.slice(), c.slice()));
var op2Over = (state) => useFourStackItems(state, (nextState, [a, b, c, d]) => pushToStack(nextState, a, b, c, d, a.slice(), b.slice()));
var op2Rot = (state) => useSixStackItems(state, (nextState, [a, b, c, d, e, f]) => pushToStack(nextState, c, d, e, f, a, b));
var op2Swap = (state) => useFourStackItems(state, (nextState, [a, b, c, d]) => pushToStack(nextState, c, d, a, b));
var opIfDup = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, ...stackItemIsTruthy(item) ? [item, item.slice()] : [item]));
var opDepth = (state) => pushToStack(state, bigIntToVmNumber(BigInt(state.stack.length)));
var opDrop = (state) => useOneStackItem(state, (nextState) => nextState);
var opDup = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, item, item.slice()));
var opNip = (state) => useTwoStackItems(state, (nextState, [, b]) => pushToStack(nextState, b));
var opOver = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, a, b, a.slice()));
var opPick = (state) => useOneVmNumber(state, (nextState, depth) => {
	const item = nextState.stack[nextState.stack.length - 1 - Number(depth)];
	if (item === void 0) return applyError(state, AuthenticationErrorCommon.invalidStackIndex);
	return pushToStack(nextState, item.slice());
});
var opRoll = (state) => useOneVmNumber(state, (nextState, depth) => {
	const index = nextState.stack.length - 1 - Number(depth);
	if (index < 0 || index > nextState.stack.length - 1) return applyError(state, AuthenticationErrorCommon.invalidStackIndex);
	return pushToStack(nextState, nextState.stack.splice(index, 1)[0]);
});
var opRot = (state) => useThreeStackItems(state, (nextState, [a, b, c]) => pushToStack(nextState, b, c, a));
var opSwap = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, b, a));
var opTuck = (state) => useTwoStackItems(state, (nextState, [a, b]) => pushToStack(nextState, b.slice(), a, b));
var opSize = (state) => useOneStackItem(state, (nextState, [item]) => pushToStack(nextState, item, bigIntToVmNumber(BigInt(item.length))));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/common/time.js
var useLocktime = (state, operation) => {
	const item = state.stack[state.stack.length - 1];
	if (item === void 0) return applyError(state, AuthenticationErrorCommon.emptyStack);
	const decodedLocktime = vmNumberToBigInt(item, {
		maximumVmNumberByteLength: 5,
		requireMinimalEncoding: true
	});
	if (isVmNumberError(decodedLocktime)) return applyError(state, AuthenticationErrorCommon.invalidVmNumber);
	const locktime = Number(decodedLocktime);
	if (locktime < 0) return applyError(state, AuthenticationErrorCommon.negativeLocktime);
	return operation(state, locktime);
};
var locktimeTypesAreCompatible = (locktime, requiredLocktime) => locktime < 5e8 && requiredLocktime < 5e8 || locktime >= 5e8 && requiredLocktime >= 5e8;
var opCheckLockTimeVerify = (state) => useLocktime(state, (nextState, requiredLocktime) => {
	if (!locktimeTypesAreCompatible(nextState.program.transaction.locktime, requiredLocktime)) return applyError(nextState, AuthenticationErrorCommon.incompatibleLocktimeType);
	if (requiredLocktime > nextState.program.transaction.locktime) return applyError(nextState, AuthenticationErrorCommon.unsatisfiedLocktime);
	const { sequenceNumber } = nextState.program.transaction.inputs[nextState.program.inputIndex];
	if (sequenceNumber === 4294967295) return applyError(nextState, AuthenticationErrorCommon.locktimeDisabled);
	return nextState;
});
var includesFlag = (value, flag) => (value & flag) !== 0;
var opCheckSequenceVerify = (state) => useLocktime(state, (nextState, requiredSequence) => {
	const { sequenceNumber } = nextState.program.transaction.inputs[nextState.program.inputIndex];
	if (includesFlag(requiredSequence, 2147483648)) return nextState;
	if (nextState.program.transaction.version < 2) return applyError(nextState, AuthenticationErrorCommon.checkSequenceUnavailable);
	if (includesFlag(sequenceNumber, 2147483648)) return applyError(nextState, AuthenticationErrorCommon.unmatchedSequenceDisable);
	if (includesFlag(requiredSequence, 4194304) !== includesFlag(sequenceNumber, 4194304)) return applyError(nextState, AuthenticationErrorCommon.incompatibleSequenceType);
	if ((requiredSequence & 65535) > (sequenceNumber & 65535)) return applyError(nextState, AuthenticationErrorCommon.unsatisfiedSequenceNumber);
	return nextState;
});
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/2023/bch-2023-consensus.js
/**
* Consensus settings for the `BCH_2023_05` instruction set.
*/
var ConsensusBCH2023;
(function(ConsensusBCH2023) {
	/**
	* A.K.A. `MAX_SCRIPT_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumBytecodeLength"] = 1e4] = "maximumBytecodeLength";
	/**
	* A.K.A. `MAX_OP_RETURN_RELAY`, `nMaxDatacarrierBytes`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumDataCarrierBytes"] = 223] = "maximumDataCarrierBytes";
	/**
	* A.K.A. `MAX_OPS_PER_SCRIPT`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumOperationCount"] = 201] = "maximumOperationCount";
	/**
	* A.K.A. `MAX_STACK_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumStackDepth"] = 1e3] = "maximumStackDepth";
	/**
	* A.K.A. `MAX_SCRIPT_ELEMENT_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumStackItemLength"] = 520] = "maximumStackItemLength";
	/**
	* A.K.A. `MAX_STANDARD_VERSION`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumStandardVersion"] = 2] = "maximumStandardVersion";
	/**
	* A.K.A. `MAX_TX_IN_SCRIPT_SIG_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumStandardUnlockingBytecodeLength"] = 1650] = "maximumStandardUnlockingBytecodeLength";
	/**
	* Transactions smaller than 65 bytes are forbidden to prevent exploits of the
	* transaction Merkle tree design.
	*
	* A.K.A. `MIN_TX_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["minimumTransactionSize"] = 65] = "minimumTransactionSize";
	/**
	* A.K.A. `MAX_STANDARD_TX_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumStandardTransactionSize"] = 1e5] = "maximumStandardTransactionSize";
	/**
	* A.K.A. `MAX_TX_SIZE`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumTransactionSize"] = 1e6] = "maximumTransactionSize";
	/**
	* A.K.A. `MAXIMUM_ELEMENT_SIZE_64_BIT`
	*/
	ConsensusBCH2023[ConsensusBCH2023["maximumVmNumberLength"] = 8] = "maximumVmNumberLength";
	ConsensusBCH2023["minVmNumber"] = "-9223372036854775807";
	ConsensusBCH2023["maxVmNumber"] = "9223372036854775807";
	ConsensusBCH2023[ConsensusBCH2023["schnorrSignatureLength"] = 64] = "schnorrSignatureLength";
	ConsensusBCH2023[ConsensusBCH2023["maximumCommitmentLength"] = 40] = "maximumCommitmentLength";
})(ConsensusBCH2023 || (ConsensusBCH2023 = {}));
var SigningSerializationTypesBCH2023 = [
	...SigningSerializationTypesBCH,
	SigningSerializationTypeBCH.allOutputsAllUtxos,
	SigningSerializationTypeBCH.correspondingOutputAllUtxos,
	SigningSerializationTypeBCH.noOutputsAllUtxos
];
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/2023/bch-2023-crypto.js
var opCheckSigBCH2023 = ({ secp256k1: secp256k1$2, sha256: sha256$2 } = {
	secp256k1,
	sha256
}) => (s) => useTwoStackItems(s, (state, [bitcoinEncodedSignature, publicKey]) => {
	if (!isValidPublicKeyEncoding(publicKey)) return applyError(state, AuthenticationErrorCommon.invalidPublicKeyEncoding);
	if (!isValidSignatureEncodingBCHTransaction(bitcoinEncodedSignature, SigningSerializationTypesBCH2023)) return applyError(state, AuthenticationErrorCommon.invalidSignatureEncoding, `Transaction signature (including signing serialization): ${binToHex(bitcoinEncodedSignature)}`);
	const coveredBytecode = encodeAuthenticationInstructions(state.instructions).subarray(state.lastCodeSeparator + 1);
	const { signingSerializationType, signature } = decodeBitcoinSignature(bitcoinEncodedSignature);
	const serialization = generateSigningSerializationBCH(state.program, {
		coveredBytecode,
		signingSerializationType
	}, sha256$2);
	const digest = hash256(serialization, sha256$2);
	state.signedMessages.push({
		digest,
		serialization
	});
	const success = signature.length === ConsensusCommon.schnorrSignatureLength ? secp256k1$2.verifySignatureSchnorr(signature, publicKey, digest) : secp256k1$2.verifySignatureDERLowS(signature, publicKey, digest);
	return !success && signature.length !== 0 ? applyError(state, AuthenticationErrorCommon.nonNullSignatureFailure) : pushToStack(state, booleanToVmNumber(success));
});
var opCheckMultiSigBCH2023 = ({ secp256k1: secp256k1$3, sha256: sha256$3 } = {
	secp256k1,
	sha256
}) => (s) => useOneVmNumber(s, (state, publicKeysValue) => {
	const potentialPublicKeys = Number(publicKeysValue);
	if (potentialPublicKeys < 0) return applyError(state, AuthenticationErrorCommon.invalidNaturalNumber);
	if (potentialPublicKeys > 20) return applyError(state, AuthenticationErrorCommon.exceedsMaximumMultisigPublicKeyCount);
	const publicKeys = potentialPublicKeys > 0 ? state.stack.splice(-potentialPublicKeys) : [];
	state.operationCount += potentialPublicKeys;
	return state.operationCount > ConsensusCommon.maximumOperationCount ? applyError(state, AuthenticationErrorCommon.exceededMaximumOperationCount) : useOneVmNumber(state, (nextState, approvingKeys) => {
		const requiredApprovingPublicKeys = Number(approvingKeys);
		if (requiredApprovingPublicKeys < 0) return applyError(nextState, AuthenticationErrorCommon.invalidNaturalNumber);
		if (requiredApprovingPublicKeys > potentialPublicKeys) return applyError(nextState, AuthenticationErrorCommon.insufficientPublicKeys);
		const signatures = requiredApprovingPublicKeys > 0 ? nextState.stack.splice(-requiredApprovingPublicKeys) : [];
		return useOneStackItem(nextState, (finalState, [protocolBugValue]) => {
			if (protocolBugValue.length !== 0) return applyError(finalState, AuthenticationErrorCommon.invalidProtocolBugValue);
			const coveredBytecode = encodeAuthenticationInstructions(finalState.instructions).subarray(finalState.lastCodeSeparator + 1);
			let approvingPublicKeys = 0;
			let remainingSignatures = signatures.length;
			let remainingPublicKeys = publicKeys.length;
			while (remainingSignatures > 0 && remainingPublicKeys > 0 && approvingPublicKeys + remainingPublicKeys >= remainingSignatures && approvingPublicKeys !== requiredApprovingPublicKeys) {
				const publicKey = publicKeys[remainingPublicKeys - 1];
				const bitcoinEncodedSignature = signatures[remainingSignatures - 1];
				if (!isValidPublicKeyEncoding(publicKey)) return applyError(finalState, AuthenticationErrorCommon.invalidPublicKeyEncoding);
				if (!isValidSignatureEncodingBCHTransaction(bitcoinEncodedSignature, SigningSerializationTypesBCH2023)) return applyError(finalState, AuthenticationErrorCommon.invalidSignatureEncoding, `Transaction signature (including signing serialization type): ${binToHex(bitcoinEncodedSignature)}`);
				const { signingSerializationType, signature } = decodeBitcoinSignature(bitcoinEncodedSignature);
				const serialization = generateSigningSerializationBCH(state.program, {
					coveredBytecode,
					signingSerializationType
				}, sha256$3);
				const digest = hash256(serialization, sha256$3);
				finalState.signedMessages.push({
					digest,
					serialization
				});
				if (signature.length === ConsensusCommon.schnorrSignatureLength) return applyError(finalState, AuthenticationErrorCommon.schnorrSizedSignatureInCheckMultiSig);
				if (secp256k1$3.verifySignatureDERLowS(signature, publicKey, digest)) {
					approvingPublicKeys += 1;
					remainingSignatures -= 1;
				}
				remainingPublicKeys -= 1;
			}
			const success = approvingPublicKeys === requiredApprovingPublicKeys;
			if (!success && !signatures.every((signature) => signature.length === 0)) return applyError(finalState, AuthenticationErrorCommon.nonNullSignatureFailure);
			return pushToStack(finalState, booleanToVmNumber(success));
		});
	});
});
var opCheckSigVerifyBCH2023 = ({ secp256k1: secp256k1$4, sha256: sha256$4 } = {
	secp256k1,
	sha256
}) => combineOperations(opCheckSigBCH2023({
	secp256k1: secp256k1$4,
	sha256: sha256$4
}), opVerify);
var opCheckMultiSigVerifyBCH2023 = ({ secp256k1, sha256 }) => combineOperations(opCheckMultiSigBCH2023({
	secp256k1,
	sha256
}), opVerify);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/2023/bch-2023-tokens.js
/**
* Given a list of transaction inputs, extract a hex-encoded list of all
* {@link Input.outpointTransactionHash}es from inputs that spend output `0` of
* that transaction (i.e. where {@link Input.outpointIndex} is `0`).
* @param inputs - a list of transaction inputs
* @returns a hex-encoded list of {@link Input.outpointTransactionHash}es
*/
var extractGenesisCategories = (inputs) => inputs.reduce((agg, input) => input.outpointIndex === 0 ? [...agg, binToHex(input.outpointTransactionHash)] : agg, []);
/**
* Given the resolved list of a transaction's source outputs – the Unspent
* Transaction Outputs (UTXOs) spent by the transaction, extract all token data
* for token-aware validation. See CHIP-2022-02-CashTokens for details.
* @param sourceOutputs - a list of resolved source outputs (UTXOs)
* @returns an object containing `availableImmutableTokens`,
* `availableMutableTokensByCategory`, `availableSumsByCategory`, and
* `inputMintingCategories`. See CHIP-2022-02-CashTokens for details.
*/
var extractSourceOutputTokenData = (sourceOutputs) => sourceOutputs.reduce((agg, sourceOutput) => {
	if (sourceOutput.token === void 0) return agg;
	const categoryHex = binToHex(sourceOutput.token.category);
	return {
		availableImmutableTokens: [...agg.availableImmutableTokens, ...sourceOutput.token.nft?.capability === "none" ? [{
			categoryHex: binToHex(sourceOutput.token.category),
			commitmentHex: binToHex(sourceOutput.token.nft.commitment)
		}] : []],
		availableMutableTokensByCategory: sourceOutput.token.nft?.capability === "mutable" ? {
			...agg.availableMutableTokensByCategory,
			[categoryHex]: (agg.availableMutableTokensByCategory[categoryHex] ?? 0) + 1
		} : agg.availableMutableTokensByCategory,
		availableSumsByCategory: {
			...agg.availableSumsByCategory,
			[categoryHex]: (agg.availableSumsByCategory[categoryHex] ?? 0n) + sourceOutput.token.amount
		},
		inputMintingCategories: [...agg.inputMintingCategories, ...sourceOutput.token.nft?.capability === "minting" ? [binToHex(sourceOutput.token.category)] : []]
	};
}, {
	availableImmutableTokens: [],
	availableMutableTokensByCategory: {},
	availableSumsByCategory: {},
	inputMintingCategories: []
});
/**
* Given a transaction's outputs, extract all token data for token-aware
* validation. See CHIP-2022-02-CashTokens for details.
* @param outputs - a list of transaction outputs
* @returns an object containing `outputImmutableTokens`,
* `outputMintingCategories`, `outputMutableTokensByCategory`, and
* `outputSumsByCategory`. See CHIP-2022-02-CashTokens for details.
*/
var extractTransactionOutputTokenData = (outputs) => outputs.reduce((agg, output) => {
	if (output.token === void 0) return agg;
	const categoryHex = binToHex(output.token.category);
	return {
		outputImmutableTokens: [...agg.outputImmutableTokens, ...output.token.nft?.capability === "none" ? [{
			categoryHex: binToHex(output.token.category),
			commitmentHex: binToHex(output.token.nft.commitment)
		}] : []],
		outputMintingCategories: [...agg.outputMintingCategories, ...output.token.nft?.capability === "minting" ? [binToHex(output.token.category)] : []],
		outputMutableTokensByCategory: output.token.nft?.capability === "mutable" ? {
			...agg.outputMutableTokensByCategory,
			[categoryHex]: (agg.outputMutableTokensByCategory[categoryHex] ?? 0) + 1
		} : agg.outputMutableTokensByCategory,
		outputSumsByCategory: {
			...agg.outputSumsByCategory,
			[categoryHex]: (agg.outputSumsByCategory[categoryHex] ?? 0n) + output.token.amount
		}
	};
}, {
	outputImmutableTokens: [],
	outputMintingCategories: [],
	outputMutableTokensByCategory: {},
	outputSumsByCategory: {}
});
/**
* Given a transaction and its resolved source outputs – the Unspent Transaction
* Outputs (UTXOs) it spends – verify that the transaction passes token-aware
* validation.
* @param transaction - the transaction to verify
* @param sourceOutputs - the resolved list of the transaction's source outputs
* @returns `true` on success, or an error message (string) on failure.
*/
var verifyTransactionTokens = (transaction, sourceOutputs) => {
	const excessiveCommitment = [...sourceOutputs, ...transaction.outputs].find((output) => output.token?.nft?.commitment !== void 0 && output.token.nft.commitment.length > ConsensusBCH2023.maximumCommitmentLength);
	if (excessiveCommitment !== void 0) return `Transaction violates token validation: a token commitment exceeds the consensus limit of ${ConsensusBCH2023.maximumCommitmentLength} bytes. Excessive token commitment length: ${excessiveCommitment.token.nft.commitment.length}`;
	const genesisCategories = extractGenesisCategories(transaction.inputs);
	const { availableSumsByCategory, availableMutableTokensByCategory, inputMintingCategories, availableImmutableTokens } = extractSourceOutputTokenData(sourceOutputs);
	const { outputSumsByCategory, outputMutableTokensByCategory, outputMintingCategories, outputImmutableTokens } = extractTransactionOutputTokenData(transaction.outputs);
	const availableMintingCategories = [...genesisCategories, ...inputMintingCategories];
	const missingMintingCategory = outputMintingCategories.find((category) => !availableMintingCategories.includes(category));
	if (missingMintingCategory !== void 0) return `Transaction violates token validation: the transaction outputs include a minting token that is not substantiated by the transaction's inputs. Invalid output minting token category: ${missingMintingCategory}`;
	for (const [categoryHex, sum] of Object.entries(outputSumsByCategory)) {
		if (sum > BigInt(ConsensusBCH2023.maxVmNumber)) return `Transaction violates token validation: the transaction outputs include a sum of fungible tokens for a category exceeding the maximum supply (${ConsensusBCH2023.maxVmNumber}). Category: ${categoryHex}, total amount: ${sum.toString()}.`;
		const availableSum = availableSumsByCategory[categoryHex];
		if (availableSum === void 0 && sum > 0 && !genesisCategories.includes(categoryHex)) return `Transaction violates token validation: the transaction creates new fungible tokens for a category without a matching genesis input. Category: ${categoryHex}, tokens created: ${sum}`;
		if (availableSum !== void 0 && sum > availableSum) return `Transaction violates token validation: the sum of fungible tokens in the transaction's outputs exceed that of the transactions inputs for a category. Category: ${categoryHex}, input amount: ${availableSum}, output amount: ${sum}`;
	}
	const remainingMutableTokens = Object.entries(outputMutableTokensByCategory).reduce((agg, [categoryHex, sum]) => {
		if (availableMintingCategories.includes(categoryHex)) return agg;
		return {
			...agg,
			[categoryHex]: (agg[categoryHex] ?? 0) - sum
		};
	}, availableMutableTokensByCategory);
	for (const [categoryHex, sum] of Object.entries(remainingMutableTokens)) if (sum < 0) return `Transaction violates token validation: the transaction creates more mutable tokens than are available for a category without a matching minting token. Category: ${categoryHex}, excess mutable tokens: ${0 - sum}`;
	const { unmatchedImmutableTokens } = outputImmutableTokens.reduce((agg, token) => {
		const { categoryHex, commitmentHex } = token;
		if (availableMintingCategories.includes(categoryHex)) return agg;
		const firstMatch = availableImmutableTokens.findIndex((available) => available.categoryHex === categoryHex && available.commitmentHex === commitmentHex);
		if (firstMatch === -1) return {
			availableImmutableTokens: agg.availableImmutableTokens,
			unmatchedImmutableTokens: [...agg.unmatchedImmutableTokens, token]
		};
		agg.availableImmutableTokens.splice(firstMatch, 1);
		return agg;
	}, {
		availableImmutableTokens,
		unmatchedImmutableTokens: []
	});
	const requiredMutableTokens = unmatchedImmutableTokens.reduce((agg, token) => ({
		...agg,
		[token.categoryHex]: (agg[token.categoryHex] ?? 0) + 1
	}), {});
	for (const [categoryHex, required] of Object.entries(requiredMutableTokens)) {
		const available = remainingMutableTokens[categoryHex] ?? 0;
		if (available < required) return `Transaction violates token validation: the transaction creates an immutable token for a category without a matching minting token or sufficient mutable tokens. Category ${categoryHex}, available mutable tokens: ${available}, new immutable tokens: ${required}`;
	}
	return true;
};
var pushTokenExtendedCategory = (state, utxo) => {
	const { token } = utxo;
	if (token === void 0) return pushToStackVmNumber(state, 0n);
	const capabilityByte = token.nft?.capability === "minting" ? [2] : token.nft?.capability === "mutable" ? [1] : [];
	return pushToStackChecked(state, flattenBinArray([token.category.slice().reverse(), Uint8Array.from(capabilityByte)]));
};
var pushTokenCommitment = (state, utxo) => {
	const { token } = utxo;
	if (token?.nft === void 0) return pushToStackVmNumber(state, 0n);
	return pushToStackChecked(state, token.nft.commitment);
};
var pushTokenAmount = (state, utxo) => {
	const { token } = utxo;
	if (token === void 0) return pushToStackVmNumber(state, 0n);
	return pushToStackVmNumberChecked(state, token.amount);
};
var opUtxoTokenCategory = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushTokenExtendedCategory(nextState, utxo));
var opUtxoTokenCommitment = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushTokenCommitment(nextState, utxo));
var opUtxoTokenAmount = (state) => useTransactionUtxo(state, (nextState, [utxo]) => pushTokenAmount(nextState, utxo));
var opOutputTokenCategory = (state) => useTransactionOutput(state, (nextState, [output]) => pushTokenExtendedCategory(nextState, output));
var opOutputTokenCommitment = (state) => useTransactionOutput(state, (nextState, [output]) => pushTokenCommitment(nextState, output));
var opOutputTokenAmount = (state) => useTransactionOutput(state, (nextState, [output]) => pushTokenAmount(nextState, output));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/2023/bch-2023-instruction-set.js
/**
* create an instance of the BCH 2023 virtual machine instruction set.
*
* @param standard - If `true`, the additional `isStandard` validations will be
* enabled. Transactions that fail these rules are often called "non-standard"
* and can technically be included by miners in valid blocks, but most network
* nodes will refuse to relay them. (Default: `true`)
*/
var createInstructionSetBCH2023 = (standard = true, { ripemd160: ripemd160$1, secp256k1: secp256k1$1, sha1: sha1$1, sha256: sha256$1 } = {
	ripemd160,
	secp256k1,
	sha1,
	sha256
}) => {
	const conditionallyPush = pushOperation();
	return {
		clone: cloneAuthenticationProgramStateBCH,
		continue: (state) => state.error === void 0 && state.ip < state.instructions.length,
		evaluate: (program, stateEvaluate) => {
			const { unlockingBytecode } = program.transaction.inputs[program.inputIndex];
			const { lockingBytecode } = program.sourceOutputs[program.inputIndex];
			const unlockingInstructions = decodeAuthenticationInstructions(unlockingBytecode);
			const lockingInstructions = decodeAuthenticationInstructions(lockingBytecode);
			const initialState = createAuthenticationProgramStateCommon({
				instructions: unlockingInstructions,
				program,
				stack: []
			});
			if (unlockingBytecode.length > ConsensusBCH2023.maximumBytecodeLength) return applyError(initialState, `The provided unlocking bytecode (${unlockingBytecode.length} bytes) exceeds the maximum bytecode length (${ConsensusBCH2023.maximumBytecodeLength} bytes).`);
			if (authenticationInstructionsAreMalformed(unlockingInstructions)) return applyError(initialState, AuthenticationErrorCommon.malformedUnlockingBytecode);
			if (!isPushOnly(unlockingBytecode)) return applyError(initialState, AuthenticationErrorCommon.requiresPushOnly);
			if (lockingBytecode.length > ConsensusBCH2023.maximumBytecodeLength) return applyError(initialState, AuthenticationErrorCommon.exceededMaximumBytecodeLengthLocking);
			if (authenticationInstructionsAreMalformed(lockingInstructions)) return applyError(initialState, AuthenticationErrorCommon.malformedLockingBytecode);
			const unlockingResult = stateEvaluate(initialState);
			if (unlockingResult.error !== void 0) return unlockingResult;
			if (unlockingResult.controlStack.length !== 0) return applyError(initialState, AuthenticationErrorCommon.nonEmptyControlStack);
			const lockingResult = stateEvaluate(createAuthenticationProgramStateCommon({
				instructions: lockingInstructions,
				program,
				stack: unlockingResult.stack
			}));
			const p2sh20 = isPayToScriptHash20(lockingBytecode);
			const p2sh32 = isPayToScriptHash32(lockingBytecode);
			if (!p2sh20 && !p2sh32) return lockingResult;
			const p2shStack = cloneStack(unlockingResult.stack);
			const p2shScript = p2shStack.pop() ?? Uint8Array.of();
			if (p2sh20 && p2shStack.length === 0 && isWitnessProgram(p2shScript)) return lockingResult;
			const p2shInstructions = decodeAuthenticationInstructions(p2shScript);
			return authenticationInstructionsAreMalformed(p2shInstructions) ? {
				...lockingResult,
				error: AuthenticationErrorCommon.malformedP2shBytecode
			} : stateEvaluate(createAuthenticationProgramStateCommon({
				instructions: p2shInstructions,
				program,
				stack: p2shStack
			}));
		},
		every: (state) => state.stack.length + state.alternateStack.length > ConsensusBCH2023.maximumStackDepth ? applyError(state, AuthenticationErrorCommon.exceededMaximumStackDepth) : state.operationCount > ConsensusBCH2023.maximumOperationCount ? applyError(state, AuthenticationErrorCommon.exceededMaximumOperationCount) : state,
		operations: {
			[OpcodesBCH2023.OP_0]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_1]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_2]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_3]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_4]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_5]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_6]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_7]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_8]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_9]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_10]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_11]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_12]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_13]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_14]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_15]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_16]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_17]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_18]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_19]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_20]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_21]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_22]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_23]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_24]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_25]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_26]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_27]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_28]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_29]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_30]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_31]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_32]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_33]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_34]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_35]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_36]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_37]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_38]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_39]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_40]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_41]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_42]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_43]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_44]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_45]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_46]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_47]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_48]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_49]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_50]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_51]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_52]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_53]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_54]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_55]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_56]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_57]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_58]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_59]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_60]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_61]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_62]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_63]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_64]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_65]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_66]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_67]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_68]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_69]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_70]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_71]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_72]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_73]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_74]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHBYTES_75]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHDATA_1]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHDATA_2]: conditionallyPush,
			[OpcodesBCH2023.OP_PUSHDATA_4]: conditionallyPush,
			[OpcodesBCH2023.OP_1NEGATE]: conditionallyEvaluate(pushNumberOperation(-1)),
			[OpcodesBCH2023.OP_RESERVED]: conditionallyEvaluate(reservedOperation),
			[OpcodesBCH2023.OP_1]: conditionallyEvaluate(pushNumberOperation(1)),
			[OpcodesBCH2023.OP_2]: conditionallyEvaluate(pushNumberOperation(2)),
			[OpcodesBCH2023.OP_3]: conditionallyEvaluate(pushNumberOperation(3)),
			[OpcodesBCH2023.OP_4]: conditionallyEvaluate(pushNumberOperation(4)),
			[OpcodesBCH2023.OP_5]: conditionallyEvaluate(pushNumberOperation(5)),
			[OpcodesBCH2023.OP_6]: conditionallyEvaluate(pushNumberOperation(6)),
			[OpcodesBCH2023.OP_7]: conditionallyEvaluate(pushNumberOperation(7)),
			[OpcodesBCH2023.OP_8]: conditionallyEvaluate(pushNumberOperation(8)),
			[OpcodesBCH2023.OP_9]: conditionallyEvaluate(pushNumberOperation(9)),
			[OpcodesBCH2023.OP_10]: conditionallyEvaluate(pushNumberOperation(10)),
			[OpcodesBCH2023.OP_11]: conditionallyEvaluate(pushNumberOperation(11)),
			[OpcodesBCH2023.OP_12]: conditionallyEvaluate(pushNumberOperation(12)),
			[OpcodesBCH2023.OP_13]: conditionallyEvaluate(pushNumberOperation(13)),
			[OpcodesBCH2023.OP_14]: conditionallyEvaluate(pushNumberOperation(14)),
			[OpcodesBCH2023.OP_15]: conditionallyEvaluate(pushNumberOperation(15)),
			[OpcodesBCH2023.OP_16]: conditionallyEvaluate(pushNumberOperation(16)),
			...mapOverOperations([incrementOperationCount], {
				[OpcodesBCH2023.OP_NOP]: conditionallyEvaluate(opNop),
				[OpcodesBCH2023.OP_VER]: conditionallyEvaluate(reservedOperation),
				[OpcodesBCH2023.OP_IF]: opIf,
				[OpcodesBCH2023.OP_NOTIF]: opNotIf,
				[OpcodesBCH2023.OP_VERIF]: reservedOperation,
				[OpcodesBCH2023.OP_VERNOTIF]: reservedOperation,
				[OpcodesBCH2023.OP_ELSE]: opElse,
				[OpcodesBCH2023.OP_ENDIF]: opEndIf,
				[OpcodesBCH2023.OP_VERIFY]: conditionallyEvaluate(opVerify),
				[OpcodesBCH2023.OP_RETURN]: conditionallyEvaluate(opReturn),
				[OpcodesBCH2023.OP_TOALTSTACK]: conditionallyEvaluate(opToAltStack),
				[OpcodesBCH2023.OP_FROMALTSTACK]: conditionallyEvaluate(opFromAltStack),
				[OpcodesBCH2023.OP_2DROP]: conditionallyEvaluate(op2Drop),
				[OpcodesBCH2023.OP_2DUP]: conditionallyEvaluate(op2Dup),
				[OpcodesBCH2023.OP_3DUP]: conditionallyEvaluate(op3Dup),
				[OpcodesBCH2023.OP_2OVER]: conditionallyEvaluate(op2Over),
				[OpcodesBCH2023.OP_2ROT]: conditionallyEvaluate(op2Rot),
				[OpcodesBCH2023.OP_2SWAP]: conditionallyEvaluate(op2Swap),
				[OpcodesBCH2023.OP_IFDUP]: conditionallyEvaluate(opIfDup),
				[OpcodesBCH2023.OP_DEPTH]: conditionallyEvaluate(opDepth),
				[OpcodesBCH2023.OP_DROP]: conditionallyEvaluate(opDrop),
				[OpcodesBCH2023.OP_DUP]: conditionallyEvaluate(opDup),
				[OpcodesBCH2023.OP_NIP]: conditionallyEvaluate(opNip),
				[OpcodesBCH2023.OP_OVER]: conditionallyEvaluate(opOver),
				[OpcodesBCH2023.OP_PICK]: conditionallyEvaluate(opPick),
				[OpcodesBCH2023.OP_ROLL]: conditionallyEvaluate(opRoll),
				[OpcodesBCH2023.OP_ROT]: conditionallyEvaluate(opRot),
				[OpcodesBCH2023.OP_SWAP]: conditionallyEvaluate(opSwap),
				[OpcodesBCH2023.OP_TUCK]: conditionallyEvaluate(opTuck),
				[OpcodesBCH2023.OP_CAT]: conditionallyEvaluate(opCat),
				[OpcodesBCH2023.OP_SPLIT]: conditionallyEvaluate(opSplit),
				[OpcodesBCH2023.OP_NUM2BIN]: conditionallyEvaluate(opNum2Bin),
				[OpcodesBCH2023.OP_BIN2NUM]: conditionallyEvaluate(opBin2Num),
				[OpcodesBCH2023.OP_SIZE]: conditionallyEvaluate(opSize),
				[OpcodesBCH2023.OP_INVERT]: disabledOperation,
				[OpcodesBCH2023.OP_AND]: conditionallyEvaluate(opAnd),
				[OpcodesBCH2023.OP_OR]: conditionallyEvaluate(opOr),
				[OpcodesBCH2023.OP_XOR]: conditionallyEvaluate(opXor),
				[OpcodesBCH2023.OP_EQUAL]: conditionallyEvaluate(opEqual),
				[OpcodesBCH2023.OP_EQUALVERIFY]: conditionallyEvaluate(opEqualVerify),
				[OpcodesBCH2023.OP_RESERVED1]: conditionallyEvaluate(reservedOperation),
				[OpcodesBCH2023.OP_RESERVED2]: conditionallyEvaluate(reservedOperation),
				[OpcodesBCH2023.OP_1ADD]: conditionallyEvaluate(op1Add),
				[OpcodesBCH2023.OP_1SUB]: conditionallyEvaluate(op1Sub),
				[OpcodesBCH2023.OP_2MUL]: disabledOperation,
				[OpcodesBCH2023.OP_2DIV]: disabledOperation,
				[OpcodesBCH2023.OP_NEGATE]: conditionallyEvaluate(opNegate),
				[OpcodesBCH2023.OP_ABS]: conditionallyEvaluate(opAbs),
				[OpcodesBCH2023.OP_NOT]: conditionallyEvaluate(opNot),
				[OpcodesBCH2023.OP_0NOTEQUAL]: conditionallyEvaluate(op0NotEqual),
				[OpcodesBCH2023.OP_ADD]: conditionallyEvaluate(opAdd),
				[OpcodesBCH2023.OP_SUB]: conditionallyEvaluate(opSub),
				[OpcodesBCH2023.OP_MUL]: conditionallyEvaluate(opMul),
				[OpcodesBCH2023.OP_DIV]: conditionallyEvaluate(opDiv),
				[OpcodesBCH2023.OP_MOD]: conditionallyEvaluate(opMod),
				[OpcodesBCH2023.OP_LSHIFT]: disabledOperation,
				[OpcodesBCH2023.OP_RSHIFT]: disabledOperation,
				[OpcodesBCH2023.OP_BOOLAND]: conditionallyEvaluate(opBoolAnd),
				[OpcodesBCH2023.OP_BOOLOR]: conditionallyEvaluate(opBoolOr),
				[OpcodesBCH2023.OP_NUMEQUAL]: conditionallyEvaluate(opNumEqual),
				[OpcodesBCH2023.OP_NUMEQUALVERIFY]: conditionallyEvaluate(opNumEqualVerify),
				[OpcodesBCH2023.OP_NUMNOTEQUAL]: conditionallyEvaluate(opNumNotEqual),
				[OpcodesBCH2023.OP_LESSTHAN]: conditionallyEvaluate(opLessThan),
				[OpcodesBCH2023.OP_GREATERTHAN]: conditionallyEvaluate(opGreaterThan),
				[OpcodesBCH2023.OP_LESSTHANOREQUAL]: conditionallyEvaluate(opLessThanOrEqual),
				[OpcodesBCH2023.OP_GREATERTHANOREQUAL]: conditionallyEvaluate(opGreaterThanOrEqual),
				[OpcodesBCH2023.OP_MIN]: conditionallyEvaluate(opMin),
				[OpcodesBCH2023.OP_MAX]: conditionallyEvaluate(opMax),
				[OpcodesBCH2023.OP_WITHIN]: conditionallyEvaluate(opWithin),
				[OpcodesBCH2023.OP_RIPEMD160]: conditionallyEvaluate(opRipemd160({ ripemd160: ripemd160$1 })),
				[OpcodesBCH2023.OP_SHA1]: conditionallyEvaluate(opSha1({ sha1: sha1$1 })),
				[OpcodesBCH2023.OP_SHA256]: conditionallyEvaluate(opSha256({ sha256: sha256$1 })),
				[OpcodesBCH2023.OP_HASH160]: conditionallyEvaluate(opHash160({
					ripemd160: ripemd160$1,
					sha256: sha256$1
				})),
				[OpcodesBCH2023.OP_HASH256]: conditionallyEvaluate(opHash256({ sha256: sha256$1 })),
				[OpcodesBCH2023.OP_CODESEPARATOR]: conditionallyEvaluate(opCodeSeparator),
				[OpcodesBCH2023.OP_CHECKSIG]: conditionallyEvaluate(opCheckSigBCH2023({
					secp256k1: secp256k1$1,
					sha256: sha256$1
				})),
				[OpcodesBCH2023.OP_CHECKSIGVERIFY]: conditionallyEvaluate(opCheckSigVerifyBCH2023({
					secp256k1: secp256k1$1,
					sha256: sha256$1
				})),
				[OpcodesBCH2023.OP_CHECKMULTISIG]: conditionallyEvaluate(opCheckMultiSigBCH2023({
					secp256k1: secp256k1$1,
					sha256: sha256$1
				})),
				[OpcodesBCH2023.OP_CHECKMULTISIGVERIFY]: conditionallyEvaluate(opCheckMultiSigVerifyBCH2023({
					secp256k1: secp256k1$1,
					sha256: sha256$1
				})),
				...standard ? {
					[OpcodesBCH2023.OP_NOP1]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_CHECKLOCKTIMEVERIFY]: conditionallyEvaluate(opCheckLockTimeVerify),
					[OpcodesBCH2023.OP_CHECKSEQUENCEVERIFY]: conditionallyEvaluate(opCheckSequenceVerify),
					[OpcodesBCH2023.OP_NOP4]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_NOP5]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_NOP6]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_NOP7]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_NOP8]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_NOP9]: conditionallyEvaluate(opNopDisallowed),
					[OpcodesBCH2023.OP_NOP10]: conditionallyEvaluate(opNopDisallowed)
				} : {
					[OpcodesBCH2023.OP_NOP1]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_CHECKLOCKTIMEVERIFY]: conditionallyEvaluate(opCheckLockTimeVerify),
					[OpcodesBCH2023.OP_CHECKSEQUENCEVERIFY]: conditionallyEvaluate(opCheckSequenceVerify),
					[OpcodesBCH2023.OP_NOP4]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_NOP5]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_NOP6]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_NOP7]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_NOP8]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_NOP9]: conditionallyEvaluate(opNop),
					[OpcodesBCH2023.OP_NOP10]: conditionallyEvaluate(opNop)
				},
				[OpcodesBCH2023.OP_CHECKDATASIG]: conditionallyEvaluate(opCheckDataSig({
					secp256k1: secp256k1$1,
					sha256: sha256$1
				})),
				[OpcodesBCH2023.OP_CHECKDATASIGVERIFY]: conditionallyEvaluate(opCheckDataSigVerify({
					secp256k1: secp256k1$1,
					sha256: sha256$1
				})),
				[OpcodesBCH2023.OP_REVERSEBYTES]: conditionallyEvaluate(opReverseBytes),
				[OpcodesBCH2023.OP_INPUTINDEX]: conditionallyEvaluate(opInputIndex),
				[OpcodesBCH2023.OP_ACTIVEBYTECODE]: conditionallyEvaluate(opActiveBytecode),
				[OpcodesBCH2023.OP_TXVERSION]: conditionallyEvaluate(opTxVersion),
				[OpcodesBCH2023.OP_TXINPUTCOUNT]: conditionallyEvaluate(opTxInputCount),
				[OpcodesBCH2023.OP_TXOUTPUTCOUNT]: conditionallyEvaluate(opTxOutputCount),
				[OpcodesBCH2023.OP_TXLOCKTIME]: conditionallyEvaluate(opTxLocktime),
				[OpcodesBCH2023.OP_UTXOVALUE]: conditionallyEvaluate(opUtxoValue),
				[OpcodesBCH2023.OP_UTXOBYTECODE]: conditionallyEvaluate(opUtxoBytecode),
				[OpcodesBCH2023.OP_OUTPOINTTXHASH]: conditionallyEvaluate(opOutpointTxHash),
				[OpcodesBCH2023.OP_OUTPOINTINDEX]: conditionallyEvaluate(opOutpointIndex),
				[OpcodesBCH2023.OP_INPUTBYTECODE]: conditionallyEvaluate(opInputBytecode),
				[OpcodesBCH2023.OP_INPUTSEQUENCENUMBER]: conditionallyEvaluate(opInputSequenceNumber),
				[OpcodesBCH2023.OP_OUTPUTVALUE]: conditionallyEvaluate(opOutputValue),
				[OpcodesBCH2023.OP_OUTPUTBYTECODE]: conditionallyEvaluate(opOutputBytecode),
				[OpcodesBCH2023.OP_UTXOTOKENCATEGORY]: conditionallyEvaluate(opUtxoTokenCategory),
				[OpcodesBCH2023.OP_UTXOTOKENCOMMITMENT]: conditionallyEvaluate(opUtxoTokenCommitment),
				[OpcodesBCH2023.OP_UTXOTOKENAMOUNT]: conditionallyEvaluate(opUtxoTokenAmount),
				[OpcodesBCH2023.OP_OUTPUTTOKENCATEGORY]: conditionallyEvaluate(opOutputTokenCategory),
				[OpcodesBCH2023.OP_OUTPUTTOKENCOMMITMENT]: conditionallyEvaluate(opOutputTokenCommitment),
				[OpcodesBCH2023.OP_OUTPUTTOKENAMOUNT]: conditionallyEvaluate(opOutputTokenAmount)
			})
		},
		success: (state) => {
			if (state.error !== void 0) return state.error;
			if (state.controlStack.length !== 0) return AuthenticationErrorCommon.nonEmptyControlStack;
			if (state.stack.length !== 1) return AuthenticationErrorCommon.requiresCleanStack;
			if (!stackItemIsTruthy(state.stack[0])) return AuthenticationErrorCommon.unsuccessfulEvaluation;
			return true;
		},
		undefined: undefinedOperation,
		verify: ({ sourceOutputs, transaction }, evaluate, stateSuccess) => {
			if (transaction.inputs.length === 0) return "Transactions must have at least one input.";
			if (transaction.outputs.length === 0) return "Transactions must have at least one output.";
			if (transaction.inputs.length !== sourceOutputs.length) return "Unable to verify transaction: a single spent output must be provided for each transaction input.";
			const transactionSize = encodeTransactionBCH(transaction).length;
			if (transactionSize < ConsensusBCH2023.minimumTransactionSize) return `Invalid transaction size: the transaction is ${transactionSize} bytes, but transactions must be no smaller than ${ConsensusBCH2023.minimumTransactionSize} bytes to prevent an exploit of the transaction Merkle tree design.`;
			if (transactionSize > ConsensusBCH2023.maximumTransactionSize) return `Transaction exceeds maximum size: the transaction is ${transactionSize} bytes, but the maximum transaction size is ${ConsensusBCH2023.maximumTransactionSize} bytes.`;
			const inputValue = sourceOutputs.reduce((sum, utxo) => sum + utxo.valueSatoshis, 0n);
			const outputValue = transaction.outputs.reduce((sum, output) => sum + output.valueSatoshis, 0n);
			if (outputValue > inputValue) return `Unable to verify transaction: the sum of transaction outputs exceeds the sum of transaction inputs. Input value: ${inputValue}, output value: ${outputValue}`;
			const outpointList = transaction.inputs.map((input) => `outpointTransactionHash: ${binToHex(input.outpointTransactionHash)}, outpointIndex: ${input.outpointIndex}`);
			const firstDuplicate = outpointList.find((outpoint, index) => outpointList.lastIndexOf(outpoint) !== index);
			/**
			* This check isn't strictly necessary to perform in the VM (assuming the
			* provider of `sourceOutputs` is checking for double spends), but it's
			* included here for debugging purposes.
			*/
			if (firstDuplicate !== void 0) return `Unable to verify transaction: the transaction attempts to spend the same outpoint in multiple inputs. ${firstDuplicate}`;
			if (standard) {
				if (transaction.version < 1 || transaction.version > ConsensusBCH2023.maximumStandardVersion) return `Standard transactions must have a version no less than 1 and no greater than ${ConsensusBCH2023.maximumStandardVersion}.`;
				if (transactionSize > ConsensusBCH2023.maximumStandardTransactionSize) return `Transaction exceeds maximum standard size: this transaction is ${transactionSize} bytes, but the maximum standard transaction size is ${ConsensusBCH2023.maximumStandardTransactionSize} bytes.`;
				for (const [index, output] of sourceOutputs.entries()) if (!isStandardOutputBytecode2023(output.lockingBytecode)) return `Standard transactions may only spend standard output types, but source output ${index} is non-standard.`;
				let totalArbitraryDataBytes = 0;
				for (const [index, output] of transaction.outputs.entries()) {
					if (!isStandardOutputBytecode2023(output.lockingBytecode)) return `Standard transactions may only create standard output types, but transaction output ${index} is non-standard.`;
					if (isArbitraryDataOutput(output.lockingBytecode)) totalArbitraryDataBytes += output.lockingBytecode.length + 1;
					if (isDustOutput(output)) return `Standard transactions may not have dust outputs, but transaction output ${index} is a dust output. Output ${index} must have a value of at least ${getDustThreshold(output)} satoshis. Current value: ${output.valueSatoshis}`;
				}
				if (totalArbitraryDataBytes > ConsensusBCH2023.maximumDataCarrierBytes) return `Standard transactions may carry no more than ${ConsensusBCH2023.maximumDataCarrierBytes} bytes in arbitrary data outputs; this transaction includes ${totalArbitraryDataBytes} bytes of arbitrary data.`;
				for (const [index, input] of transaction.inputs.entries()) {
					if (input.unlockingBytecode.length > ConsensusBCH2023.maximumStandardUnlockingBytecodeLength) return `Input index ${index} is non-standard: the unlocking bytecode (${input.unlockingBytecode.length} bytes) exceeds the maximum standard unlocking bytecode length (${ConsensusBCH2023.maximumStandardUnlockingBytecodeLength} bytes).`;
					if (!isPushOnly(input.unlockingBytecode)) return `Input index ${index} is non-standard: unlocking bytecode may contain only push operations.`;
				}
			}
			const tokenValidationResult = verifyTransactionTokens(transaction, sourceOutputs);
			if (tokenValidationResult !== true) return tokenValidationResult;
			for (const index of transaction.inputs.keys()) {
				const result = stateSuccess(evaluate({
					inputIndex: index,
					sourceOutputs,
					transaction
				}));
				if (typeof result === "string") return `Error in evaluating input index ${index}: ${result}`;
			}
			return true;
		}
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/virtual-machine.js
/**
* Create an {@link AuthenticationVirtualMachine} to evaluate authentication
* programs constructed from operations in the `instructionSet`.
* @param instructionSet - an {@link InstructionSet}
*/
var createVirtualMachine = (instructionSet) => {
	const operators = range(256).map((codepoint) => instructionSet.operations[codepoint] ?? instructionSet.undefined);
	const getCodepoint = (state) => state.instructions[state.ip];
	const after = (state) => {
		state.ip += 1;
		return state;
	};
	const getOperation = (state) => operators[getCodepoint(state).opcode];
	const noOp = ((state) => state);
	const stateEvery = instructionSet.every ?? noOp;
	const stateStepMutate = (state) => {
		const operator = getOperation(state);
		return after(stateEvery(operator(state)));
	};
	const stateContinue = instructionSet.continue;
	/**
	* When we get real tail call optimization, this can be replaced
	* with recursion.
	*/
	const untilComplete = (state, stepFunction) => {
		while (stateContinue(state)) state = stepFunction(state);
		return state;
	};
	const stateClone = instructionSet.clone;
	const { success } = instructionSet;
	const stateEvaluate = (state) => untilComplete(stateClone(state), stateStepMutate);
	const stateDebugStep = (state) => {
		const operator = getOperation(state);
		return after(stateEvery(operator(stateClone(state))));
	};
	const stateDebug = (state) => {
		const trace = [];
		trace.push(state);
		untilComplete(state, (currentState) => {
			const nextState = stateDebugStep(currentState);
			trace.push(nextState);
			return nextState;
		});
		return trace;
	};
	const stateStep = (state) => stateStepMutate(stateClone(state));
	const evaluate = (program) => instructionSet.evaluate(program, stateEvaluate);
	const debug = (program) => {
		const results = [];
		const proxyDebug = (state) => {
			const debugResult = stateDebug(state);
			results.push(...debugResult);
			return debugResult[debugResult.length - 1] ?? state;
		};
		const finalResult = instructionSet.evaluate(program, proxyDebug);
		return [...results, finalResult];
	};
	const verify = (resolvedTransaction) => instructionSet.verify(resolvedTransaction, evaluate, success);
	return {
		debug,
		evaluate,
		stateClone,
		stateContinue,
		stateDebug,
		stateEvaluate,
		stateStep,
		stateStepMutate,
		stateSuccess: success,
		verify
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/2023/bch-2023-vm.js
/**
* Initialize a virtual machine using the `BCH_2023_05` instruction set.
*
* @param standard - If `true`, the additional `isStandard` validations will be
* enabled. Transactions that fail these rules are often called "non-standard"
* and can technically be included by miners in valid blocks, but most network
* nodes will refuse to relay them. (Default: `true`)
*/
var createVirtualMachineBCH2023 = (standard = true) => createVirtualMachine(createInstructionSetBCH2023(standard));
var createVirtualMachineBCH = createVirtualMachineBCH2023;
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/vm/instruction-sets/bch/chips/bch-chips-opcodes.js
/**
* The `BCH_CHIPs` instruction set.
*
* Note: to maximize script compilation compatibility, this instruction set also
* includes the previous names for new opcodes (e.g. `OP_VERIF` for `OP_BEGIN`).
*/
var OpcodesBCHCHIPs;
(function(OpcodesBCHCHIPs) {
	/**
	* A.K.A. `OP_FALSE` or `OP_PUSHBYTES_0`
	*/
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_0"] = 0] = "OP_0";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_1NEGATE"] = 79] = "OP_1NEGATE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_RESERVED"] = 80] = "OP_RESERVED";
	/**
	* A.K.A. `OP_TRUE`
	*/
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_1"] = 81] = "OP_1";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2"] = 82] = "OP_2";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_3"] = 83] = "OP_3";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_4"] = 84] = "OP_4";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_5"] = 85] = "OP_5";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_6"] = 86] = "OP_6";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_7"] = 87] = "OP_7";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_8"] = 88] = "OP_8";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_9"] = 89] = "OP_9";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_10"] = 90] = "OP_10";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_11"] = 91] = "OP_11";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_12"] = 92] = "OP_12";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_13"] = 93] = "OP_13";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_14"] = 94] = "OP_14";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_15"] = 95] = "OP_15";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_16"] = 96] = "OP_16";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP"] = 97] = "OP_NOP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_VER"] = 98] = "OP_VER";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_IF"] = 99] = "OP_IF";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOTIF"] = 100] = "OP_NOTIF";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_VERIF"] = 101] = "OP_VERIF";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_BEGIN"] = 101] = "OP_BEGIN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNTIL"] = 102] = "OP_UNTIL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ELSE"] = 103] = "OP_ELSE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ENDIF"] = 104] = "OP_ENDIF";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_VERIFY"] = 105] = "OP_VERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_RETURN"] = 106] = "OP_RETURN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2DROP"] = 109] = "OP_2DROP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2DUP"] = 110] = "OP_2DUP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_3DUP"] = 111] = "OP_3DUP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2OVER"] = 112] = "OP_2OVER";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2ROT"] = 113] = "OP_2ROT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2SWAP"] = 114] = "OP_2SWAP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_IFDUP"] = 115] = "OP_IFDUP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_DEPTH"] = 116] = "OP_DEPTH";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_DROP"] = 117] = "OP_DROP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_DUP"] = 118] = "OP_DUP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NIP"] = 119] = "OP_NIP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OVER"] = 120] = "OP_OVER";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_PICK"] = 121] = "OP_PICK";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ROLL"] = 122] = "OP_ROLL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ROT"] = 123] = "OP_ROT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_SWAP"] = 124] = "OP_SWAP";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_TUCK"] = 125] = "OP_TUCK";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CAT"] = 126] = "OP_CAT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_SPLIT"] = 127] = "OP_SPLIT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NUM2BIN"] = 128] = "OP_NUM2BIN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_BIN2NUM"] = 129] = "OP_BIN2NUM";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_SIZE"] = 130] = "OP_SIZE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_INVERT"] = 131] = "OP_INVERT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_AND"] = 132] = "OP_AND";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OR"] = 133] = "OP_OR";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_XOR"] = 134] = "OP_XOR";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_EQUAL"] = 135] = "OP_EQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_RESERVED1"] = 137] = "OP_RESERVED1";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_RESERVED2"] = 138] = "OP_RESERVED2";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_1ADD"] = 139] = "OP_1ADD";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_1SUB"] = 140] = "OP_1SUB";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2MUL"] = 141] = "OP_2MUL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_2DIV"] = 142] = "OP_2DIV";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NEGATE"] = 143] = "OP_NEGATE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ABS"] = 144] = "OP_ABS";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOT"] = 145] = "OP_NOT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_0EQUAL"] = 145] = "OP_0EQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ADD"] = 147] = "OP_ADD";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_SUB"] = 148] = "OP_SUB";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_MUL"] = 149] = "OP_MUL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_DIV"] = 150] = "OP_DIV";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_MOD"] = 151] = "OP_MOD";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_LSHIFT"] = 152] = "OP_LSHIFT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_RSHIFT"] = 153] = "OP_RSHIFT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_BOOLAND"] = 154] = "OP_BOOLAND";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_BOOLOR"] = 155] = "OP_BOOLOR";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_MIN"] = 163] = "OP_MIN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_MAX"] = 164] = "OP_MAX";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_WITHIN"] = 165] = "OP_WITHIN";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_SHA1"] = 167] = "OP_SHA1";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_SHA256"] = 168] = "OP_SHA256";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_HASH160"] = 169] = "OP_HASH160";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_HASH256"] = 170] = "OP_HASH256";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP1"] = 176] = "OP_NOP1";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP4"] = 179] = "OP_NOP4";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP5"] = 180] = "OP_NOP5";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP6"] = 181] = "OP_NOP6";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP7"] = 182] = "OP_NOP7";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP8"] = 183] = "OP_NOP8";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP9"] = 184] = "OP_NOP9";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_NOP10"] = 185] = "OP_NOP10";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKDATASIG"] = 186] = "OP_CHECKDATASIG";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_CHECKDATASIGVERIFY"] = 187] = "OP_CHECKDATASIGVERIFY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_REVERSEBYTES"] = 188] = "OP_REVERSEBYTES";
	/**
	* First codepoint left undefined before nullary introspection operations.
	*/
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
	/**
	* Last codepoint left undefined before nullary introspection operations.
	*/
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_INPUTINDEX"] = 192] = "OP_INPUTINDEX";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_ACTIVEBYTECODE"] = 193] = "OP_ACTIVEBYTECODE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_TXVERSION"] = 194] = "OP_TXVERSION";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_TXINPUTCOUNT"] = 195] = "OP_TXINPUTCOUNT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_TXOUTPUTCOUNT"] = 196] = "OP_TXOUTPUTCOUNT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_TXLOCKTIME"] = 197] = "OP_TXLOCKTIME";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UTXOVALUE"] = 198] = "OP_UTXOVALUE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UTXOBYTECODE"] = 199] = "OP_UTXOBYTECODE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPOINTTXHASH"] = 200] = "OP_OUTPOINTTXHASH";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPOINTINDEX"] = 201] = "OP_OUTPOINTINDEX";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_INPUTBYTECODE"] = 202] = "OP_INPUTBYTECODE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_INPUTSEQUENCENUMBER"] = 203] = "OP_INPUTSEQUENCENUMBER";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPUTVALUE"] = 204] = "OP_OUTPUTVALUE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPUTBYTECODE"] = 205] = "OP_OUTPUTBYTECODE";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UTXOTOKENCATEGORY"] = 206] = "OP_UTXOTOKENCATEGORY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UTXOTOKENCOMMITMENT"] = 207] = "OP_UTXOTOKENCOMMITMENT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UTXOTOKENAMOUNT"] = 208] = "OP_UTXOTOKENAMOUNT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPUTTOKENCATEGORY"] = 209] = "OP_OUTPUTTOKENCATEGORY";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPUTTOKENCOMMITMENT"] = 210] = "OP_OUTPUTTOKENCOMMITMENT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_OUTPUTTOKENAMOUNT"] = 211] = "OP_OUTPUTTOKENAMOUNT";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN250"] = 250] = "OP_UNKNOWN250";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN251"] = 251] = "OP_UNKNOWN251";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN253"] = 253] = "OP_UNKNOWN253";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN254"] = 254] = "OP_UNKNOWN254";
	OpcodesBCHCHIPs[OpcodesBCHCHIPs["OP_UNKNOWN255"] = 255] = "OP_UNKNOWN255";
})(OpcodesBCHCHIPs || (OpcodesBCHCHIPs = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/key/hd-key.js
/**
* Verify that a private key is valid for the Secp256k1 curve. Returns `true`
* for success, or `false` on failure.
*
* Private keys are 256-bit numbers encoded as a 32-byte, big-endian Uint8Array.
* Nearly every 256-bit number is a valid secp256k1 private key. Specifically,
* any 256-bit number greater than `0x01` and less than
* `0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141`
* is a valid private key. This range is part of the definition of the
* secp256k1 elliptic curve parameters.
*
* This method does not require a `Secp256k1` implementation.
*
* @param privateKey - The private key to validate.
*/
var validateSecp256k1PrivateKey = (privateKey) => {
	if (privateKey.length !== 32 || privateKey.every((value) => value === 0)) return false;
	/**
	* The largest possible Secp256k1 private key – equal to the order of the
	* Secp256k1 curve minus one.
	*/
	const maximumSecp256k1PrivateKey = [
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		255,
		254,
		186,
		174,
		220,
		230,
		175,
		72,
		160,
		59,
		191,
		210,
		94,
		140,
		208,
		54,
		65,
		64
	];
	const firstDifference = privateKey.findIndex((value, i) => value !== maximumSecp256k1PrivateKey[i]);
	if (firstDifference === -1 || privateKey[firstDifference] < maximumSecp256k1PrivateKey[firstDifference]) return true;
	return false;
};
/**
* An error in the derivation of child HD public or private nodes.
*/
var HdNodeDerivationError;
(function(HdNodeDerivationError) {
	HdNodeDerivationError["childIndexExceedsMaximum"] = "HD node derivation error: child index exceeds maximum (4294967295).";
	HdNodeDerivationError["requiresZeroDepthNode"] = "HD node derivation error: absolute derivation requires an HD node with a depth of 0.";
	HdNodeDerivationError["hardenedDerivationRequiresPrivateNode"] = "HD node derivation error: derivation for hardened child indexes (indexes greater than or equal to 2147483648) requires an HD private node.";
	HdNodeDerivationError["invalidAbsoluteDerivationPath"] = "HD node derivation error: invalid absolute derivation path; path must begin with \"m\" or \"M\" and contain only positive child index numbers, separated by forward slashes (\"/\"), with zero or one apostrophe (\"'\") after each child index number.";
	HdNodeDerivationError["invalidRelativeDerivationPath"] = "HD node derivation error: invalid relative derivation path; path must contain only positive child index numbers, separated by forward slashes (\"/\"), with zero or one apostrophe (\"'\") after each child index number.";
	HdNodeDerivationError["invalidDerivedKey"] = "HD node derivation error: an astronomically rare HMAC-SHA512 result produced an invalid Secp256k1 key.";
	HdNodeDerivationError["invalidPrivateDerivationPrefix"] = "HD node derivation error: private derivation paths must begin with \"m\".";
	HdNodeDerivationError["invalidPublicDerivationPrefix"] = "HD node derivation error: public derivation paths must begin with \"M\".";
})(HdNodeDerivationError || (HdNodeDerivationError = {}));
/**
* An error in the decoding of an HD public or private key.
*/
var HdKeyDecodingError;
(function(HdKeyDecodingError) {
	HdKeyDecodingError["incorrectLength"] = "HD key decoding error: length is incorrect (must encode 82 bytes).";
	HdKeyDecodingError["invalidChecksum"] = "HD key decoding error: checksum is invalid.";
	HdKeyDecodingError["invalidPublicKey"] = "HD key decoding error: the public key for this HD public node is not a valid Secp256k1 public key.";
	HdKeyDecodingError["invalidPrivateKey"] = "HD key decoding error: the key for this HD private node is not a valid Secp256k1 private key.";
	HdKeyDecodingError["missingPrivateKeyPaddingByte"] = "HD key decoding error: version indicates a private key, but the key data is missing a padding byte.";
	HdKeyDecodingError["privateKeyExpected"] = "HD key decoding error: expected an HD private key, but encountered an HD public key.";
	HdKeyDecodingError["publicKeyExpected"] = "HD key decoding error: expected an HD public key, but encountered an HD private key.";
	HdKeyDecodingError["unknownCharacter"] = "HD key decoding error: key includes a non-base58 character.";
	HdKeyDecodingError["unknownVersion"] = "HD key decoding error: key uses an unknown version.";
	HdKeyDecodingError["zeroDepthWithNonZeroChildIndex"] = "HD key decoding error: key encodes a depth of zero with a non-zero child index.";
	HdKeyDecodingError["zeroDepthWithNonZeroParentFingerprint"] = "HD key decoding error: key encodes a depth of zero with a non-zero parent fingerprint.";
})(HdKeyDecodingError || (HdKeyDecodingError = {}));
/**
* An error in the encoding of an HD public or private key.
*/
var HdKeyEncodingError;
(function(HdKeyEncodingError) {
	HdKeyEncodingError["invalidChainCodeLength"] = "HD key encoding error: invalid chain code length. Chain code must be 32 bytes.";
	HdKeyEncodingError["invalidChildDepth"] = "HD key encoding error: invalid child depth. Child depth must be between 0 and 255 (inclusive).";
	HdKeyEncodingError["invalidChildIndex"] = "HD key encoding error: invalid child index. Child index must be between 0 and 4294967295 (inclusive).";
	HdKeyEncodingError["invalidParentFingerprintLength"] = "HD key encoding error: invalid parent fingerprint length. Parent fingerprint must be 4 bytes.";
	HdKeyEncodingError["invalidPrivateKeyLength"] = "HD key encoding error: invalid private key length. Secp256k1 private keys must be 32 bytes.";
	HdKeyEncodingError["invalidPublicKeyLength"] = "HD key encoding error: invalid public key length. Public key must be 33 bytes (compressed).";
	HdKeyEncodingError["invalidPublicKey"] = "HD key encoding error: the public key for this HD public node is not a valid Secp256k1 public key.";
	HdKeyEncodingError["zeroDepthWithNonZeroChildIndex"] = "HD key encoding error: attempted to encode a zero depth key with a non-zero child index.";
	HdKeyEncodingError["zeroDepthWithNonZeroParentFingerprint"] = "HD key encoding error: attempted to encode a zero depth key with a non-zero parent fingerprint.";
})(HdKeyEncodingError || (HdKeyEncodingError = {}));
var emptyParentFingerprint = Uint8Array.from([
	0,
	0,
	0,
	0
]);
/**
* The HMAC SHA-512 key used by BIP32, "Bitcoin seed"
* (`utf8ToBin('Bitcoin seed')`)
*/
var bip32HmacSha512Key = utf8ToBin("Bitcoin seed");
/**
* Derive an {@link HdPrivateNode} from the provided seed following the BIP32
* specification. A seed should include between 16 bytes and 64 bytes of
* entropy (recommended: 32 bytes).
*
* @param seed - the entropy from which to derive the {@link HdPrivateNode}
*/
var deriveHdPrivateNodeFromSeed = (seed, { assumeValidity, crypto = { sha512 }, hmacSha512Key = bip32HmacSha512Key, throwErrors = true } = {}) => {
	const mac = hmacSha512(hmacSha512Key, seed, crypto.sha512);
	const privateKey = mac.slice(0, 32);
	const chainCode = mac.slice(32);
	const depth = 0;
	const childIndex = 0;
	const parentFingerprint = emptyParentFingerprint.slice();
	const valid = assumeValidity ?? validateSecp256k1PrivateKey(privateKey);
	if (throwErrors && !valid) throw new Error(HdNodeDerivationError.invalidDerivedKey);
	return valid ? {
		chainCode,
		childIndex,
		depth,
		parentFingerprint,
		privateKey
	} : {
		chainCode,
		childIndex,
		depth,
		invalidMaterial: privateKey,
		parentFingerprint
	};
};
/**
* Derive the public identifier for a given {@link HdPrivateNode}. This is used
* to uniquely identify HD nodes in software. The first 4 bytes of this
* identifier are considered its "fingerprint".
*
* @param hdPrivateNode - The {@link HdPrivateNode} from which to derive the
* public identifier.
*/
var deriveHdPrivateNodeIdentifier = (hdPrivateNode, { crypto = {
	ripemd160,
	secp256k1,
	sha256
} } = {}) => {
	const publicKey = crypto.secp256k1.derivePublicKeyCompressed(hdPrivateNode.privateKey);
	if (typeof publicKey === "string") return publicKey;
	return crypto.ripemd160.hash(crypto.sha256.hash(publicKey));
};
/**
* Derive the public identifier for a given {@link HdPublicNodeValid}. This is
* used to uniquely identify HD nodes in software. The first 4 bytes of this
* identifier are considered its fingerprint.
*
* @param node - The {@link HdPublicNodeValid} from which to derive the
* public identifier.
*/
var deriveHdPublicNodeIdentifier = (node, { crypto = {
	ripemd160,
	sha256
} } = {}) => crypto.ripemd160.hash(crypto.sha256.hash(node.publicKey));
/**
* The 4-byte version indicating the network and type of an {@link HdPrivateKey}
* or {@link HdPublicKey}.
*/
var HdKeyVersion;
(function(HdKeyVersion) {
	/**
	* Version indicating the HD key is an {@link HdPrivateKey} intended for use
	* on the main network. Base58 encoding at the expected length of an HD key
	* results in a prefix of `xprv`.
	*
	* Hex: `0x0488ade4`
	*/
	HdKeyVersion[HdKeyVersion["mainnetPrivateKey"] = 76066276] = "mainnetPrivateKey";
	/**
	* Version indicating the HD key is an {@link HdPrivateKey} intended for use
	* on the main network. Base58 encoding at the expected length of an HD key
	* results in a prefix of `xpub`.
	*
	* Hex: `0x0488b21e`
	*/
	HdKeyVersion[HdKeyVersion["mainnetPublicKey"] = 76067358] = "mainnetPublicKey";
	/**
	* Version indicating the HD key is an {@link HdPrivateKey} intended for use
	* on the test network. Base58 encoding at the expected length of an HD key
	* results in a prefix of `tprv`.
	*
	* Hex: `0x04358394`
	*/
	HdKeyVersion[HdKeyVersion["testnetPrivateKey"] = 70615956] = "testnetPrivateKey";
	/**
	* Version indicating the HD key is an {@link HdPrivateKey} intended for use
	* on the test network. Base58 encoding at the expected length of an HD key
	* results in a prefix of `tpub`.
	*
	* Hex: `0x043587cf`
	*/
	HdKeyVersion[HdKeyVersion["testnetPublicKey"] = 70617039] = "testnetPublicKey";
})(HdKeyVersion || (HdKeyVersion = {}));
var hdKeyVersionIsPublicKey = (version) => version === HdKeyVersion.mainnetPublicKey || version === HdKeyVersion.testnetPublicKey;
var hdKeyVersionIsPrivateKey = (version) => version === HdKeyVersion.mainnetPrivateKey || version === HdKeyVersion.testnetPrivateKey;
/**
* Decode a string following the HD key format as defined by BIP32, returning a
* `node` and a `version`. Decoding errors are returned as strings.
*
* This is a less strict variant of {@link decodeHdKey}; most applications
* should instead use {@link decodeHdKey}, or if the type of the key is known,
* either {@link decodeHdPrivateKey} or {@link decodeHdPublicKey}.
*
* @param hdKey - A BIP32 HD private key or HD public key.
*/
var decodeHdKeyUnchecked = (hdKey, { crypto = {
	secp256k1,
	sha256
} } = {}) => {
	const decoded = base58ToBin(hdKey);
	if (typeof decoded === "string") return formatError(HdKeyDecodingError.unknownCharacter, decoded);
	if (decoded.length !== 82) return formatError(HdKeyDecodingError.incorrectLength, `Length: ${decoded.length}.`);
	const payload = decoded.slice(0, 78);
	const checksumBits = decoded.slice(78);
	const checksum = crypto.sha256.hash(crypto.sha256.hash(payload));
	if (!checksumBits.every((value, i) => value === checksum[i])) return formatError(HdKeyDecodingError.invalidChecksum, `Encoded: ${binToHex(checksumBits)}; computed: ${binToHex(checksum.slice(0, 4))}.`);
	const depthIndex = 4;
	const fingerprintIndex = 5;
	const childIndexIndex = 9;
	const chainCodeIndex = 13;
	const keyDataIndex = 45;
	const version = new DataView(decoded.buffer, decoded.byteOffset, depthIndex).getUint32(0);
	const depth = decoded[depthIndex];
	const parentFingerprint = decoded.slice(fingerprintIndex, childIndexIndex);
	const childIndex = new DataView(decoded.buffer, decoded.byteOffset + childIndexIndex, decoded.byteOffset + chainCodeIndex).getUint32(0);
	const chainCode = decoded.slice(chainCodeIndex, keyDataIndex);
	const keyData = decoded.slice(keyDataIndex, 78);
	const isPrivateKey = hdKeyVersionIsPrivateKey(version);
	if (isPrivateKey && keyData[0] !== 0) return HdKeyDecodingError.missingPrivateKeyPaddingByte;
	if (isPrivateKey) {
		const privateKey = keyData.slice(1);
		return {
			node: validateSecp256k1PrivateKey(privateKey) ? {
				chainCode,
				childIndex,
				depth,
				parentFingerprint,
				privateKey
			} : {
				chainCode,
				childIndex,
				depth,
				invalidMaterial: privateKey,
				parentFingerprint
			},
			version
		};
	}
	if (!hdKeyVersionIsPublicKey(version)) return formatError(HdKeyDecodingError.unknownVersion, `Version: ${version}`);
	const publicKey = keyData;
	return {
		node: crypto.secp256k1.validatePublicKey(publicKey) ? {
			chainCode,
			childIndex,
			depth,
			parentFingerprint,
			publicKey
		} : {
			chainCode,
			childIndex,
			depth,
			invalidMaterial: publicKey,
			parentFingerprint
		},
		version
	};
};
/**
* Decode an HD key as defined by BIP32, returning a `node` and a `network`.
* Decoding errors are returned as strings.
*
* If the type of the key is known, use {@link decodeHdPrivateKey} or
* {@link decodeHdPublicKey}. For a variant with less strict validation,
* use {@link decodeHdKeyUnchecked}.
*
* @param hdKey - A BIP32 HD private key or HD public key.
*/
var decodeHdKey = (hdKey, { crypto = {
	secp256k1,
	sha256
} } = {}) => {
	const decoded = decodeHdKeyUnchecked(hdKey, { crypto });
	if (typeof decoded === "string") return decoded;
	const { node, version } = decoded;
	if (node.depth === 0) {
		if (node.childIndex !== 0) return formatError(HdKeyDecodingError.zeroDepthWithNonZeroChildIndex, `Child index: ${node.childIndex}.`);
		if (!binsAreEqual(node.parentFingerprint, emptyParentFingerprint)) return formatError(HdKeyDecodingError.zeroDepthWithNonZeroParentFingerprint, `Parent fingerprint: ${node.parentFingerprint.join(",")}.`);
	}
	const isPublicKey = hdKeyVersionIsPublicKey(version);
	if ("invalidMaterial" in node) return isPublicKey ? formatError(HdKeyDecodingError.invalidPublicKey, `Invalid public key: ${binToHex(node.invalidMaterial)}.`) : formatError(HdKeyDecodingError.invalidPrivateKey);
	return {
		network: version === HdKeyVersion.mainnetPrivateKey || version === HdKeyVersion.mainnetPublicKey ? "mainnet" : "testnet",
		node
	};
};
/**
* Decode an HD private key as defined by BIP32.
*
* This method is similar to {@link decodeHdKey} but ensures that the result is
* a valid HD private node. Decoding error messages are returned as strings.
*
* @param hdPrivateKey - A BIP32 HD private key.
*/
var decodeHdPrivateKey = (hdPrivateKey, { crypto = {
	secp256k1,
	sha256
} } = {}) => {
	const decoded = decodeHdKey(hdPrivateKey, { crypto });
	if (typeof decoded === "string") return decoded;
	const { network, node } = decoded;
	if ("publicKey" in node) return HdKeyDecodingError.privateKeyExpected;
	return {
		network,
		node
	};
};
/**
* Decode an HD public key as defined by BIP32.
*
* This method is similar to {@link decodeHdKey} but ensures that the result is
* a valid HD public node. Decoding error messages are returned as strings.
*
* @param hdPublicKey - A BIP32 HD public key.
*/
var decodeHdPublicKey = (hdPublicKey, { crypto = {
	secp256k1,
	sha256
} } = {}) => {
	const decoded = decodeHdKey(hdPublicKey, { crypto });
	if (typeof decoded === "string") return decoded;
	const { network, node } = decoded;
	if ("privateKey" in node) return HdKeyDecodingError.publicKeyExpected;
	return {
		network,
		node
	};
};
/**
* Encode the metadata portion of an HD key payload.
*/
var encodeHdKeyPayloadMetadata = ({ version, keyParameters, throwErrors = true }) => {
	if (keyParameters.node.depth === 0) {
		if (keyParameters.node.childIndex !== 0) return formatError(HdKeyEncodingError.zeroDepthWithNonZeroChildIndex, `Child index: ${keyParameters.node.childIndex}.`, throwErrors);
		if (!binsAreEqual(keyParameters.node.parentFingerprint, emptyParentFingerprint)) return formatError(HdKeyEncodingError.zeroDepthWithNonZeroParentFingerprint, `Parent fingerprint: ${keyParameters.node.parentFingerprint.join(",")}.`, throwErrors);
	}
	if (keyParameters.node.chainCode.length !== 32) return formatError(HdKeyEncodingError.invalidChainCodeLength, `Chain code length: ${keyParameters.node.chainCode.length}.`, throwErrors);
	if (keyParameters.node.parentFingerprint.length !== 4) return formatError(HdKeyEncodingError.invalidParentFingerprintLength, `Parent fingerprint length: ${keyParameters.node.parentFingerprint.length}.`, throwErrors);
	if (keyParameters.node.depth < 0 || keyParameters.node.depth > 255) return formatError(HdKeyEncodingError.invalidChildDepth, `Depth: ${keyParameters.node.depth}.`, throwErrors);
	const depth = Uint8Array.of(keyParameters.node.depth);
	if (keyParameters.node.childIndex < 0 || keyParameters.node.childIndex > 4294967295) return formatError(HdKeyEncodingError.invalidChildIndex, `Child index: ${keyParameters.node.childIndex}.`, throwErrors);
	const childIndex = numberToBinUint32BE(keyParameters.node.childIndex);
	return flattenBinArray([
		version,
		depth,
		keyParameters.node.parentFingerprint,
		childIndex,
		keyParameters.node.chainCode
	]);
};
/**
* Encode an HD private key (as defined by BIP32) payload (without the checksum)
* given a valid {@link HdPrivateNode} and network.
*
* Note that this function defaults to throwing encoding errors. To handle
* errors in a type-safe way, set `throwErrors` to `false`.
*
* @param keyParameters - A valid HD private node and the network for which to
* encode the key.
*/
var encodeHdPrivateKeyPayload = (keyParameters, { throwErrors = true } = {}) => {
	const version = numberToBinUint32BE(keyParameters.network === "mainnet" ? HdKeyVersion.mainnetPrivateKey : HdKeyVersion.testnetPrivateKey);
	if (keyParameters.node.privateKey.length !== 32) return formatError(HdKeyEncodingError.invalidPrivateKeyLength, `Private key length: ${keyParameters.node.privateKey.length}.`, throwErrors);
	const metadata = encodeHdKeyPayloadMetadata({
		keyParameters,
		throwErrors,
		version
	});
	if (typeof metadata === "string") return metadata;
	return flattenBinArray([
		metadata,
		Uint8Array.of(0),
		keyParameters.node.privateKey
	]);
};
/**
* Encode an HD public or private key (as defined by BIP32) payload with
* a checksum.
*
* @param payload - the HD public or private key payload to encode
*/
var encodeHdKeyPayloadWithChecksum = (payload, { crypto = { sha256 } } = {}) => {
	return binToBase58(flattenBinArray([payload, crypto.sha256.hash(crypto.sha256.hash(payload)).slice(0, 4)]));
};
/**
* Encode an HD private key (as defined by BIP32) given a valid
* {@link HdPrivateNode} and network.
*
* Note that this function defaults to throwing encoding errors. To handle
* errors in a type-safe way, set `throwErrors` to `false`.
*
* @param keyParameters - A valid HD private node and the network for which to
* encode the key.
*/
var encodeHdPrivateKey = (keyParameters, { crypto = { sha256 }, throwErrors = true } = {}) => {
	const payload = encodeHdPrivateKeyPayload(keyParameters, { throwErrors });
	return typeof payload === "string" ? payload : { hdPrivateKey: encodeHdKeyPayloadWithChecksum(payload, { crypto }) };
};
/**
* Derive a child HD private node from an HD private node.
*
* To derive a child HD public node, use {@link deriveHdPublicNode} on the
* result of this method. If the child uses a non-hardened index, it's also
* possible to use {@link deriveHdPublicNodeChild}.
*
* Note that this function defaults to throwing errors. To handle errors in a
* type-safe way, set `throwErrors` to `false`.
*
* This function has a less than 1 in 2^127 probability of producing
* an invalid result (where the resulting private key is not a valid Secp256k1
* private key, see {@link validateSecp256k1PrivateKey}). While this scenario is
* unlikely to ever occur without a weakness in HMAC-SHA512, the
* `returnInvalidNodes` parameter can be set to `true` to return the resulting
* {@link HdPrivateNodeInvalid} rather than an error (defaults to `false`).
*
* @param node - The valid HD private node from which to derive the child node.
* @param index - The index at which to derive the child node - indexes greater
* than or equal to the hardened index offset (`0x80000000`/`2147483648`) are
* derived using the "hardened" derivation algorithm.
*/
var deriveHdPrivateNodeChild = (node, index, { crypto = {
	ripemd160,
	secp256k1,
	sha256,
	sha512
}, throwErrors = true, returnInvalidNodes = false } = {}) => {
	if (index > 4294967295) return formatError(HdNodeDerivationError.childIndexExceedsMaximum, `Child index: ${index}.`, throwErrors);
	const parentIdentifier = deriveHdPrivateNodeIdentifier(node, { crypto });
	const parentFingerprint = parentIdentifier.slice(0, 4);
	const depth = node.depth + 1;
	const useHardenedAlgorithm = index >= 2147483648;
	const keyMaterial = useHardenedAlgorithm ? node.privateKey : crypto.secp256k1.derivePublicKeyCompressed(node.privateKey);
	const serialization = Uint8Array.from([
		...useHardenedAlgorithm ? [0] : [],
		...keyMaterial,
		...numberToBinUint32BE(index)
	]);
	const derivation = hmacSha512(node.chainCode, serialization, crypto.sha512);
	const tweakValueLength = 32;
	const tweakValue = derivation.slice(0, tweakValueLength);
	const nextChainCode = derivation.slice(tweakValueLength);
	const nextPrivateKey = crypto.secp256k1.addTweakPrivateKey(node.privateKey, tweakValue);
	if (typeof nextPrivateKey === "string") {
		const error = formatError(HdNodeDerivationError.invalidDerivedKey, `Invalid child index: ${index}.`, throwErrors);
		if (returnInvalidNodes) return {
			chainCode: nextChainCode,
			childIndex: index,
			depth,
			invalidMaterial: tweakValue,
			parentFingerprint,
			parentIdentifier
		};
		return error;
	}
	return {
		chainCode: nextChainCode,
		childIndex: index,
		depth,
		parentFingerprint,
		parentIdentifier,
		privateKey: nextPrivateKey
	};
};
/**
* Derive a non-hardened, child HD public node from an HD public node.
*
* Because hardened derivation also requires knowledge of the parent private
* node, it's not possible to use an HD public node to derive a hardened child
* HD public node. (See {@link deriveHdPath} or {@link deriveHdPublicNode}.)
*
* Though private keys cannot be derived from HD public keys, sharing HD public
* keys still carries risk. Along with allowing an attacker to associate wallet
* addresses together (breaking privacy), should an attacker gain knowledge of a
* single child private key, **it's possible to derive all parent HD private
* keys**. See {@link crackHdPrivateNodeFromHdPublicNodeAndChildPrivateNode}
* for details.
*
* This function has a less than 1 in 2^127 probability of producing
* an invalid result (where the resulting public key is not a valid Secp256k1
* public key). While this scenario is unlikely to ever occur without a weakness
* in HMAC-SHA512, the `returnInvalidNodes` parameter can be set to `true` to
* return the resulting {@link HdPrivateNodeInvalid} rather than an error
* (defaults to `false`).
*
* @param node - The valid HD public node from which to derive the child
* public node.
* @param index - The index at which to derive the child node.
*/
var deriveHdPublicNodeChild = (node, index, { crypto = {
	ripemd160,
	secp256k1,
	sha256,
	sha512
}, returnInvalidNodes = false, throwErrors = true } = {}) => {
	if (index >= 2147483648) return formatError(HdNodeDerivationError.hardenedDerivationRequiresPrivateNode, `Requested index: ${index}.`, throwErrors);
	const parentIdentifier = deriveHdPublicNodeIdentifier(node, { crypto });
	const parentFingerprint = parentIdentifier.slice(0, 4);
	const depth = node.depth + 1;
	const serialization = Uint8Array.from([...node.publicKey, ...numberToBinUint32BE(index)]);
	const derivation = hmacSha512(node.chainCode, serialization, crypto.sha512);
	const tweakValueLength = 32;
	const tweakValue = derivation.slice(0, tweakValueLength);
	const nextChainCode = derivation.slice(tweakValueLength);
	const nextPublicKey = crypto.secp256k1.addTweakPublicKeyCompressed(node.publicKey, tweakValue);
	if (typeof nextPublicKey === "string") {
		const error = formatError(HdNodeDerivationError.invalidDerivedKey, `Invalid child index: ${index}.`, throwErrors);
		if (returnInvalidNodes) return {
			chainCode: nextChainCode,
			childIndex: index,
			depth,
			invalidMaterial: tweakValue,
			parentFingerprint,
			parentIdentifier
		};
		return error;
	}
	return {
		chainCode: nextChainCode,
		childIndex: index,
		depth,
		parentFingerprint,
		parentIdentifier,
		publicKey: nextPublicKey
	};
};
/**
* Derive a child HD node from a parent node given a relative derivation path.
* The resulting node is the same type as the parent node – private nodes return
* private nodes, public nodes return public nodes. (To prevent implementation
* errors, this function will not internally derive a public node from any
* private node; for public derivation, use {@link deriveHdPublicNode} at the
* desired BIP32 account level and provide the HD public key to this function.)
*
* Where possible, consider instead using {@link deriveHdPath} to reduce the
* likelihood of implementation errors.
*
* By default, this function throws an `Error` rather than returning the error
* as string when the provided path is invalid or cannot be derived from the
* provided HD node (e.g. the path requests an excessive child index, a hardened
* path is requested from a public node, or an astronomically rare HMAC-SHA512
* result produces and invalid node).
*
* While the throwing behavior is reasonable for the common case of deriving
* known, fixed paths (e.g. the BCH account as standardized by SLIP44 at
* `m/44'/145'/0'`), **it is recommended that `throwErrors` be set to `false`
* for use cases where dynamic or user-specified paths might be derived**. In
* these cases, deliberate error handling is recommended, e.g. saving any data
* and safely shutting down, displaying troubleshooting information to the
* user, etc.
*
* The derivation path uses the notation specified in BIP32; see
* {@link deriveHdPath} for details.
*
* @param node - The HD node from which to begin the derivation – for private
* derivation, an {@link HdPrivateNodeValid}; for public derivation,
* an {@link HdPublicNodeValid}.
* @param path - The relative BIP32 derivation path, e.g. `1'/2` or `3/4/5`.
*/
var deriveHdPathRelative = (node, path, { crypto = {
	ripemd160,
	secp256k1,
	sha256,
	sha512
}, throwErrors = true } = {}) => {
	if (path === "") return node;
	if (!/^(?:[0-9]+'?)(?:\/[0-9]+'?)*$/u.test(path)) return formatError(HdNodeDerivationError.invalidRelativeDerivationPath, `Invalid path: "${path}".`, throwErrors);
	const parsed = path.split("/");
	const isPrivateDerivation = "privateKey" in node;
	const base = 10;
	const hardenedIndexOffset = 2147483648;
	const indexes = parsed.map((index) => index.endsWith("'") ? parseInt(index.slice(0, -1), base) + hardenedIndexOffset : parseInt(index, base));
	return isPrivateDerivation ? indexes.reduce((result, nextIndex) => typeof result === "string" ? result : deriveHdPrivateNodeChild(result, nextIndex, {
		crypto,
		throwErrors
	}), node) : indexes.reduce((result, nextIndex) => typeof result === "string" ? result : deriveHdPublicNodeChild(result, nextIndex, {
		crypto,
		throwErrors
	}), node);
};
/**
* Derive a child HD node from a master node given an absolute derivation path.
* The resulting node is the same type as the parent node – private nodes return
* private nodes, public nodes return public nodes. (To prevent implementation
* errors, this function will not internally derive a public node from any
* private node; for public derivation, use {@link deriveHdPublicNode} at the
* desired BIP32 account level and provide the HD public key to this function.)
*
* The derivation path uses the notation specified in BIP32: the first character
* must be either `m` for private derivation or `M` for public derivation,
* followed by sets of `/` and a number representing the child index used in the
* derivation at that depth. Hardened derivation is represented by a trailing
* `'`, and may only appear in private derivation paths (hardened derivation
* requires knowledge of the private key). Hardened child indexes are
* represented with the hardened index offset (`2147483648`) subtracted.
*
* For example, `m/0/1'/2` uses private derivation (`m`), with child indexes in
* the following order:
*
* `derivePrivate(derivePrivate(derivePrivate(node, 0), 2147483648 + 1), 2)`
*
* Likewise, `M/3/4/5` uses public derivation (`M`), with child indexes in the
* following order:
*
* `derivePublic(derivePublic(derivePublic(node, 3), 4), 5)`
*
* Because hardened derivation requires a private node, paths that specify
* public derivation (`M`) using hardened derivation (`'`) will return an error.
* To derive the public node associated with a child private node that requires
* hardened derivation, begin with private derivation, then provide the result
* to {@link deriveHdPublicNode} or {@link deriveHdPathRelative}.
*
* By default, this function throws an `Error` rather than returning the error
* as string when the provided path is invalid or cannot be derived from the
* provided HD node (e.g. the path requests an excessive child index, a hardened
* path is requested from a public node, or an astronomically rare HMAC-SHA512
* result produces and invalid node).
*
* While the throwing behavior is reasonable for the common case of deriving
* known, fixed paths (e.g. the BCH account as standardized by SLIP44 at
* `m/44'/145'/0'`), **it is recommended that `throwErrors` be set to `false`
* for use cases where dynamic or user-specified paths might be derived**. In
* these cases, deliberate error handling is recommended, e.g. saving any data
* and safely shutting down, displaying troubleshooting information to the
* user, etc.
*
* @param node - The HD node from which to begin the derivation – for paths
* beginning with `m`, an {@link HdPrivateNodeValid}; for paths beginning with
* `M`, an {@link HdPublicNodeValid}.
* @param path - The BIP32 derivation path, e.g. `m/0/1'/2` or `M/3/4/5`.
*/
var deriveHdPath = (node, path, { crypto = {
	ripemd160,
	secp256k1,
	sha256,
	sha512
}, throwErrors = true } = {}) => {
	if (node.depth !== 0) return formatError(HdNodeDerivationError.requiresZeroDepthNode, `Depth of provided HD node: ${node.depth}.`, throwErrors);
	if (!/^[mM](?:\/[0-9]+'?)*$/u.test(path)) return formatError(HdNodeDerivationError.invalidAbsoluteDerivationPath, `Invalid path: "${path}".`, throwErrors);
	const parsed = path.split("/");
	const isPrivateDerivation = "privateKey" in node;
	if (isPrivateDerivation && parsed[0] !== "m") return formatError(HdNodeDerivationError.invalidPrivateDerivationPrefix, `Invalid path: "${path}".`, throwErrors);
	if (!isPrivateDerivation && parsed[0] !== "M") return formatError(HdNodeDerivationError.invalidPublicDerivationPrefix, `Invalid path: "${path}".`, throwErrors);
	if (parsed.length === 1) return node;
	return deriveHdPathRelative(node, parsed.slice(1).join("/"), {
		crypto,
		throwErrors
	});
};
var HdNodeCrackingError;
(function(HdNodeCrackingError) {
	HdNodeCrackingError["cannotCrackHardenedDerivation"] = "HD node cracking error: cannot crack an HD parent node using hardened child node.";
})(HdNodeCrackingError || (HdNodeCrackingError = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/language-types.js
var IdentifierResolutionType;
(function(IdentifierResolutionType) {
	IdentifierResolutionType["opcode"] = "opcode";
	IdentifierResolutionType["variable"] = "variable";
	IdentifierResolutionType["script"] = "script";
})(IdentifierResolutionType || (IdentifierResolutionType = {}));
var IdentifierResolutionErrorType;
(function(IdentifierResolutionErrorType) {
	IdentifierResolutionErrorType["unknown"] = "unknown";
	IdentifierResolutionErrorType["variable"] = "variable";
	IdentifierResolutionErrorType["script"] = "script";
})(IdentifierResolutionErrorType || (IdentifierResolutionErrorType = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/language-utils.js
var pluckStartPosition = (range) => ({
	startColumn: range.startColumn,
	startLineNumber: range.startLineNumber
});
var pluckEndPosition = (range) => ({
	endColumn: range.endColumn,
	endLineNumber: range.endLineNumber
});
/**
* Combine an array of `Range`s into a single larger `Range`.
*
* @param ranges - an array of `Range`s
* @param parentRange - the range to assume if `ranges` is an empty array
*/
var mergeRanges = (ranges, parentRange = {
	endColumn: 0,
	endLineNumber: 0,
	startColumn: 0,
	startLineNumber: 0
}) => {
	const unsortedMerged = ranges.length < 2 ? ranges.length === 1 ? ranges[0] : parentRange : ranges.reduce((merged, range) => ({
		...range.endLineNumber > merged.endLineNumber ? pluckEndPosition(range) : range.endLineNumber === merged.endLineNumber && range.endColumn > merged.endColumn ? pluckEndPosition(range) : pluckEndPosition(merged),
		...range.startLineNumber < merged.startLineNumber ? pluckStartPosition(range) : range.startLineNumber === merged.startLineNumber && range.startColumn < merged.startColumn ? pluckStartPosition(range) : pluckStartPosition(merged)
	}), ranges[0]);
	return {
		...pluckEndPosition(unsortedMerged),
		...pluckStartPosition(unsortedMerged)
	};
};
/**
* Extract a list of the errors that occurred while resolving a script.
*
* @param resolvedScript - the result of {@link resolveScript} from which to
* extract errors
*/
var getResolutionErrors = (resolvedScript) => resolvedScript.reduce((errors, segment) => {
	switch (segment.type) {
		case "error": return [...errors, {
			error: segment.value,
			...segment.missingIdentifier === void 0 ? {} : {
				missingIdentifier: segment.missingIdentifier,
				owningEntity: segment.owningEntity
			},
			range: segment.range
		}];
		case "push":
		case "evaluation": return [...errors, ...getResolutionErrors(segment.value)];
		default: return errors;
	}
}, []);
/**
* Format a list of {@link CompilationError}s into a single string, with an
* error start position following each error. E.g. for line 1, column 2:
* `The error message. [1, 2]`
*
* Errors are separated with the `separator`, which defaults to `; `, e.g.:
* `The first error message. [1, 2]; The second error message. [3, 4]`
*
* @param errors - an array of compilation errors
* @param separator - the characters with which to join the formatted errors.
*/
var stringifyErrors = (errors, separator = "; ") => errors.map((error) => `[${error.range.startLineNumber}, ${error.range.startColumn}] ${error.error}`).join(separator);
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/parsimmon.js
/**
* This file is derived from https://github.com/jneen/parsimmon and
* https://github.com/DefinitelyTyped/DefinitelyTyped.
*/
function Parsimmon(action) {
	if (!(this instanceof Parsimmon)) return new Parsimmon(action);
	this._ = action;
}
var _ = Parsimmon.prototype;
function makeSuccess(index, value) {
	return {
		expected: [],
		furthest: -1,
		index,
		status: true,
		value
	};
}
function makeFailure(index, expected) {
	expected = [expected];
	return {
		expected,
		furthest: index,
		index: -1,
		status: false,
		value: null
	};
}
function mergeReplies(result, last) {
	if (!last) return result;
	if (result.furthest > last.furthest) return result;
	return {
		expected: result.furthest === last.furthest ? union(result.expected, last.expected) : last.expected,
		furthest: last.furthest,
		index: result.index,
		status: result.status,
		value: result.value
	};
}
function makeLineColumnIndex(input, i) {
	const lines = input.slice(0, i).split("\n");
	const lineWeAreUpTo = lines.length;
	return {
		column: lines[lines.length - 1].length + 1,
		line: lineWeAreUpTo,
		offset: i
	};
}
function union(xs, ys) {
	const obj = {};
	for (let i = 0; i < xs.length; i++) obj[xs[i]] = true;
	for (let j = 0; j < ys.length; j++) obj[ys[j]] = true;
	const keys = [];
	for (const k in obj) keys.push(k);
	keys.sort();
	return keys;
}
function flags(re) {
	const s = String(re);
	return s.slice(s.lastIndexOf("/") + 1);
}
function anchoredRegexp(re) {
	return RegExp(`^(?:${re.source})`, flags(re));
}
function seq(...params) {
	const parsers = [].slice.call(params);
	const numParsers = parsers.length;
	return Parsimmon(function(input, i) {
		let result;
		const accum = new Array(numParsers);
		for (let j = 0; j < numParsers; j += 1) {
			result = mergeReplies(parsers[j]._(input, i), result);
			if (!result.status) return result;
			accum[j] = result.value;
			i = result.index;
		}
		return mergeReplies(makeSuccess(i, accum), result);
	});
}
function seqMap(...params) {
	const args = [].slice.call(params);
	const mapper = args.pop();
	return seq.apply(null, args).map(function(results) {
		return mapper.apply(null, results);
	});
}
function createLanguage(parsers) {
	const language = {};
	for (const key in parsers) (function(rule) {
		const func = function() {
			return parsers[rule](language);
		};
		language[rule] = lazy(func);
	})(key);
	return language;
}
function alt(...params) {
	const parsers = [].slice.call(params);
	return Parsimmon(function(input, i) {
		let result;
		for (let j = 0; j < parsers.length; j += 1) {
			result = mergeReplies(parsers[j]._(input, i), result);
			if (result.status) return result;
		}
		return result;
	});
}
function sepBy(parser, separator) {
	return sepBy1(parser, separator).or(succeed([]));
}
function sepBy1(parser, separator) {
	return seqMap(parser, separator.then(parser).many(), function(r, rs) {
		return [r].concat(rs);
	});
}
_.parse = function(input) {
	const result = this.skip(eof)._(input, 0);
	if (result.status) return {
		status: true,
		value: result.value
	};
	return {
		expected: result.expected,
		index: makeLineColumnIndex(input, result.furthest),
		status: false
	};
};
_.or = function(alternative) {
	return alt(this, alternative);
};
_.then = function(next) {
	return seq(this, next).map(function(results) {
		return results[1];
	});
};
_.many = function() {
	const self = this;
	return Parsimmon(function(input, i) {
		const accum = [];
		let result;
		for (;;) {
			result = mergeReplies(self._(input, i), result);
			if (result.status) {
				/* c8 ignore next 6 */
				if (i === result.index) throw new Error("infinite loop detected in .many() parser --- calling .many() on a parser that can accept zero characters is usually the cause");
				i = result.index;
				accum.push(result.value);
			} else return mergeReplies(makeSuccess(i, accum), result);
		}
	});
};
_.map = function(fn) {
	const self = this;
	return Parsimmon(function(input, i) {
		const result = self._(input, i);
		if (!result.status) return result;
		return mergeReplies(makeSuccess(result.index, fn(result.value)), result);
	});
};
_.skip = function(next) {
	return seq(this, next).map(function(results) {
		return results[0];
	});
};
_.node = function(name) {
	return seqMap(index, this, index, function(start, value, end) {
		return {
			end,
			name,
			start,
			value
		};
	});
};
_.sepBy = function(separator) {
	return sepBy(this, separator);
};
_.desc = function(expected) {
	expected = [expected];
	const self = this;
	return Parsimmon(function(input, i) {
		const reply = self._(input, i);
		if (!reply.status) reply.expected = expected;
		return reply;
	});
};
function string(str) {
	const expected = `'${str}'`;
	return Parsimmon(function(input, i) {
		const j = i + str.length;
		const head = input.slice(i, j);
		if (head === str) return makeSuccess(j, head);
		return makeFailure(i, expected);
	});
}
function regexp(re, group = 0) {
	const anchored = anchoredRegexp(re);
	const expected = String(re);
	return Parsimmon(function(input, i) {
		const match = anchored.exec(input.slice(i));
		if (match) {
			const fullMatch = match[0];
			const groupMatch = match[group];
			return makeSuccess(i + fullMatch.length, groupMatch);
		}
		return makeFailure(i, expected);
	});
}
function succeed(value) {
	return Parsimmon(function(__, i) {
		return makeSuccess(i, value);
	});
}
function lazy(f) {
	const parser = Parsimmon(function(input, i) {
		parser._ = f()._;
		return parser._(input, i);
	});
	return parser;
}
var index = Parsimmon(function(input, i) {
	return makeSuccess(i, makeLineColumnIndex(input, i));
});
var eof = Parsimmon(function(input, i) {
	if (i < input.length) return makeFailure(i, "EOF");
	return makeSuccess(i, null);
});
var P = {
	alt,
	createLanguage,
	index,
	lazy,
	makeFailure,
	makeSuccess,
	of: succeed,
	optWhitespace: regexp(/\s*/u).desc("optional whitespace"),
	regexp,
	sepBy,
	sepBy1,
	seq,
	seqMap,
	string,
	succeed,
	whitespace: regexp(/\s+/u).desc("whitespace")
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/parse.js
var cashAssemblyParser = P.createLanguage({
	script: (r) => P.seqMap(P.optWhitespace, r.expression.sepBy(P.optWhitespace), P.optWhitespace, (_, expressions) => expressions).node("Script"),
	expression: (r) => P.alt(r.comment, r.push, r.evaluation, r.utf8, r.binary, r.hex, r.bigint, r.identifier),
	comment: (r) => P.alt(r.singleLineComment, r.multiLineComment).node("Comment"),
	singleLineComment: () => P.seqMap(P.string("//").desc("the start of a single-line comment ('//')"), P.regexp(/[^\n]*/u), (__, comment) => comment.trim()),
	multiLineComment: () => P.seqMap(P.string("/*").desc("the start of a multi-line comment ('/*')"), P.regexp(/[\s\S]*?\*\//u).desc("the end of this multi-line comment ('*/')"), (__, comment) => comment.slice(0, -2).trim()),
	push: (r) => P.seqMap(P.string("<").desc("the start of a push statement ('<')"), r.script, P.string(">").desc("the end of this push statement ('>')"), (_, push) => push).node("Push"),
	evaluation: (r) => P.seqMap(P.string("$").desc("the start of an evaluation ('$')"), P.string("(").desc("the opening parenthesis of this evaluation ('(')"), r.script, P.string(")").desc("the closing parenthesis of this evaluation (')')"), (_, __, evaluation) => evaluation).node("Evaluation"),
	identifier: () => P.regexp(/[a-zA-Z_][.a-zA-Z0-9_-]*/u).desc("a valid identifier").node("Identifier"),
	utf8: () => P.alt(P.seqMap(P.string("\"").desc("a double quote (\")"), P.regexp(/[^"]*/u), P.string("\"").desc("a closing double quote (\")"), (__, literal) => literal), P.seqMap(P.string("'").desc("a single quote (')"), P.regexp(/[^']*/u), P.string("'").desc("a closing single quote (')"), (__, literal) => literal)).node("UTF8Literal"),
	hex: () => P.seqMap(P.string("0x").desc("a hex literal ('0x...')"), P.regexp(/[0-9a-f]_*(?:_*[0-9a-f]_*[0-9a-f]_*)*[0-9a-f]/iu).desc("a valid hexadecimal string"), (__, literal) => literal).node("HexLiteral"),
	binary: () => P.seqMap(P.string("0b").desc("a binary literal ('0b...')"), P.regexp(/[01]+(?:[01_]*[01]+)*/iu).desc("a string of binary digits"), (__, literal) => literal).node("BinaryLiteral"),
	bigint: () => P.regexp(/-?[0-9]+(?:[0-9_]*[0-9]+)*/u).desc("an integer literal").node("BigIntLiteral")
});
var parseScript = (script) => cashAssemblyParser.script.parse(lossyNormalize(script));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/reduce.js
var emptyReductionTraceNode = (range) => ({
	bytecode: Uint8Array.of(),
	range
});
/**
* Perform the standard verification of CashAssembly evaluation results. This
* ensures that evaluations complete as expected: if an error occurs while
* computing an evaluation, script compilation should fail.
*
* Three requirements are enforced:
* - the evaluation may not produce an `error`
* - the resulting stack must contain exactly 1 item
* - the resulting execution stack must be empty (no missing `OP_ENDIF`s)
*
* This differs from the virtual machine's built-in `vm.verify` in that it is
* often more lenient, for example, evaluations can succeed with a non-truthy
* value on top of the stack.
*
* @param state - the final program state to verify
*/
var verifyCashAssemblyEvaluationState = (state) => {
	if (state.error !== void 0) return state.error;
	if (state.controlStack.length !== 0) return AuthenticationErrorCommon.nonEmptyControlStack;
	if (state.stack.length !== 1) return AuthenticationErrorCommon.requiresCleanStack;
	return true;
};
/**
* Reduce a resolved script, returning the resulting bytecode and a trace of the
* reduction process.
*
* This method will return an error if provided a {@link resolvedScript} with
* resolution errors. To check for resolution errors, use
* {@link getResolutionErrors}.
*
* @param resolvedScript - the {@link CompiledScript} to reduce
* @param vm - the {@link AuthenticationVirtualMachine} to use for evaluations
* @param createEvaluationProgram - a method which accepts the compiled bytecode
* of an evaluation and returns the authentication program used to evaluate it
*/
var reduceScript = (resolvedScript, vm, createEvaluationProgram) => {
	const script = resolvedScript.map((segment) => {
		switch (segment.type) {
			case "bytecode": return {
				bytecode: segment.value,
				range: segment.range
			};
			case "push": {
				const push = reduceScript(segment.value, vm, createEvaluationProgram);
				return {
					bytecode: encodeDataPush(push.bytecode),
					...push.errors === void 0 ? void 0 : { errors: push.errors },
					push,
					range: segment.range
				};
			}
			case "evaluation": {
				if (typeof vm === "undefined" || typeof createEvaluationProgram === "undefined") return {
					errors: [{
						error: "Both a VM and a createState method are required to reduce evaluations.",
						range: segment.range
					}],
					...emptyReductionTraceNode(segment.range)
				};
				const reductionTrace = reduceScript(segment.value, vm, createEvaluationProgram);
				if (reductionTrace.errors !== void 0) return {
					...emptyReductionTraceNode(segment.range),
					errors: reductionTrace.errors,
					source: reductionTrace,
					trace: []
				};
				const trace = vm.debug(createEvaluationProgram(reductionTrace.bytecode));
				/**
				* `vm.debug` should always return at least one state.
				*/
				const lastState = trace[trace.length - 1];
				const result = verifyCashAssemblyEvaluationState(lastState);
				const bytecode = lastState.stack[lastState.stack.length - 1];
				return {
					...typeof result === "string" ? {
						bytecode: Uint8Array.of(),
						errors: [{
							error: `Failed to reduce evaluation: ${result}`,
							range: segment.range
						}]
					} : { bytecode },
					range: segment.range,
					source: reductionTrace,
					trace
				};
			}
			case "comment": return emptyReductionTraceNode(segment.range);
			case "error": return {
				errors: [{
					error: `Tried to reduce a CashAssembly script with resolution errors: ${segment.value}`,
					range: segment.range
				}],
				...emptyReductionTraceNode(segment.range)
			};
			default: throw new Error(`"${segment.type}" is not a known segment type.`);
		}
	});
	const reduction = script.reduce((all, segment) => ({
		bytecode: [...all.bytecode, segment.bytecode],
		ranges: [...all.ranges, segment.range],
		...all.errors !== void 0 || segment.errors !== void 0 ? { errors: [...all.errors ?? [], ...segment.errors ?? []] } : void 0
	}), {
		bytecode: [],
		ranges: []
	});
	return {
		...reduction.errors === void 0 ? void 0 : { errors: reduction.errors },
		bytecode: flattenBinArray(reduction.bytecode),
		range: mergeRanges(reduction.ranges, resolvedScript.length === 0 ? void 0 : resolvedScript[0].range),
		script
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/resolve.js
var pluckRange = (node) => ({
	endColumn: node.end.column,
	endLineNumber: node.end.line,
	startColumn: node.start.column,
	startLineNumber: node.start.line
});
var removeNumericSeparators = (numericLiteral) => numericLiteral.replace(/_/gu, "");
var resolveScriptSegment = (segment, resolveIdentifiers) => {
	const resolved = segment.value.map((child) => {
		const range = pluckRange(child);
		switch (child.name) {
			case "Identifier": {
				const identifier = child.value;
				const result = resolveIdentifiers(identifier);
				return result.status ? {
					range,
					type: "bytecode",
					value: result.bytecode,
					...result.type === IdentifierResolutionType.opcode ? { opcode: identifier } : result.type === IdentifierResolutionType.variable ? {
						..."debug" in result ? { debug: result.debug } : {},
						..."signature" in result ? { signature: result.signature } : {},
						variable: identifier
					} : result.type === IdentifierResolutionType.script ? {
						script: identifier,
						source: result.source
					} : { unknown: identifier }
				} : {
					..."debug" in result ? { debug: result.debug } : {},
					..."recoverable" in result && result.recoverable ? {
						missingIdentifier: identifier,
						owningEntity: result.entityOwnership
					} : {},
					range,
					type: "error",
					value: result.error
				};
			}
			case "Push": return {
				range,
				type: "push",
				value: resolveScriptSegment(child.value, resolveIdentifiers)
			};
			case "Evaluation": return {
				range,
				type: "evaluation",
				value: resolveScriptSegment(child.value, resolveIdentifiers)
			};
			case "BigIntLiteral": return {
				literal: child.value,
				literalType: "BigIntLiteral",
				range,
				type: "bytecode",
				value: bigIntToVmNumber(BigInt(removeNumericSeparators(child.value)))
			};
			case "BinaryLiteral": return {
				literal: child.value,
				literalType: "BinaryLiteral",
				range,
				type: "bytecode",
				value: binStringToBin(removeNumericSeparators(child.value))
			};
			case "HexLiteral": return {
				literal: child.value,
				literalType: "HexLiteral",
				range,
				type: "bytecode",
				value: hexToBin(removeNumericSeparators(child.value))
			};
			case "UTF8Literal": return {
				literal: child.value,
				literalType: "UTF8Literal",
				range,
				type: "bytecode",
				value: utf8ToBin(child.value)
			};
			case "Comment": return {
				range,
				type: "comment",
				value: child.value
			};
			default: return {
				range,
				type: "error",
				value: `Unrecognized segment: ${child.name}`
			};
		}
	});
	return resolved.length === 0 ? [{
		range: pluckRange(segment),
		type: "comment",
		value: ""
	}] : resolved;
};
var BuiltInVariables;
(function(BuiltInVariables) {
	BuiltInVariables["currentBlockTime"] = "current_block_time";
	BuiltInVariables["currentBlockHeight"] = "current_block_height";
	BuiltInVariables["signingSerialization"] = "signing_serialization";
})(BuiltInVariables || (BuiltInVariables = {}));
var attemptCompilerOperation = ({ data, configuration, identifier, matchingOperations, operationExample = "operation_identifier", operationId, variableId, variableType }) => {
	if (matchingOperations === void 0) return {
		error: `The "${variableId}" variable type can not be resolved because the "${variableType}" operation has not been included in this compiler's configuration.`,
		status: "error"
	};
	if (typeof matchingOperations === "function") return matchingOperations(identifier, data, configuration);
	if (operationId === void 0) return {
		error: `This "${variableId}" variable could not be resolved because this compiler's "${variableType}" operations require an operation identifier, e.g. '${variableId}.${operationExample}'.`,
		status: "error"
	};
	const operation = matchingOperations[operationId];
	if (operation === void 0) return {
		error: `The identifier "${identifier}" could not be resolved because the "${variableId}.${operationId}" operation is not available to this compiler.`,
		status: "error"
	};
	return operation(identifier, data, configuration);
};
/**
* If the identifier can be successfully resolved as a variable, the result is
* returned as a Uint8Array. If the identifier references a known variable, but
* an error occurs in resolving it, the error is returned as a string.
* Otherwise, the identifier is not recognized as a variable, and this method
* simply returns `false`.
*
* @param identifier - The full identifier used to describe this operation, e.g.
* `owner.schnorr_signature.all_outputs`.
* @param data - The {@link CompilationData} provided to the compiler
* @param configuration - The {@link CompilerConfiguration} provided to
* the compiler
*/
var resolveVariableIdentifier = ({ data, configuration, identifier }) => {
	const [variableId, operationId] = identifier.split(".");
	switch (variableId) {
		case BuiltInVariables.currentBlockHeight: return attemptCompilerOperation({
			configuration,
			data,
			identifier,
			matchingOperations: configuration.operations?.currentBlockHeight,
			operationId,
			variableId,
			variableType: "currentBlockHeight"
		});
		case BuiltInVariables.currentBlockTime: return attemptCompilerOperation({
			configuration,
			data,
			identifier,
			matchingOperations: configuration.operations?.currentBlockTime,
			operationId,
			variableId,
			variableType: "currentBlockTime"
		});
		case BuiltInVariables.signingSerialization: return attemptCompilerOperation({
			configuration,
			data,
			identifier,
			matchingOperations: configuration.operations?.signingSerialization,
			operationExample: "version",
			operationId,
			variableId,
			variableType: "signingSerialization"
		});
		default: {
			const expectedVariable = configuration.variables?.[variableId];
			if (expectedVariable === void 0) return { status: "skip" };
			return attemptCompilerOperation({
				configuration,
				data,
				identifier,
				operationId,
				variableId,
				...{
					AddressData: {
						matchingOperations: configuration.operations?.addressData,
						variableType: "addressData"
					},
					HdKey: {
						matchingOperations: configuration.operations?.hdKey,
						operationExample: "public_key",
						variableType: "hdKey"
					},
					Key: {
						matchingOperations: configuration.operations?.key,
						operationExample: "public_key",
						variableType: "key"
					},
					WalletData: {
						matchingOperations: configuration.operations?.walletData,
						variableType: "walletData"
					}
				}[expectedVariable.type]
			});
		}
	}
};
/**
* A text-formatting method to pretty-print the list of expected inputs
* (`Encountered unexpected input while parsing script. Expected ...`). If
* present, the `EOF` expectation is always moved to the end of the list.
* @param expectedArray - the alphabetized list of expected inputs produced by
* `parseScript`
*/
var describeExpectedInput = (expectedArray) => {
	/**
	* The constant used by the parser to denote the end of the input
	*/
	const EOF = "EOF";
	const newArray = expectedArray.filter((value) => value !== EOF);
	if (newArray.length !== expectedArray.length) newArray.push("the end of the script");
	const withoutLastElement = newArray.slice(0, newArray.length - 1);
	const lastElement = newArray[newArray.length - 1];
	return `Encountered unexpected input while parsing script. Expected ${newArray.length >= 3 ? withoutLastElement.join(", ").concat(`, or ${lastElement}`) : newArray.length === 2 ? newArray.join(" or ") : lastElement}.`;
};
var createEmptyRange = () => ({
	endColumn: 0,
	endLineNumber: 0,
	startColumn: 0,
	startLineNumber: 0
});
/**
* Validate all compilation data (i.e. validate all public and private keys),
* returning an array of validation errors. If no validity issues are detected,
* an empty array is returned.
*
* The function ensures that compilation fails whenever invalid compilation data
* is provided, regardless of whether or not the offending public or private key
* material is used. This is intended to surface software defects (particularly
* in the software used by counterparties) as early as possible.
*/
var validateCompilationData = ({ configuration, data }) => [
	...data.bytecode === void 0 ? [] : Object.entries(data.bytecode).filter(([identifier]) => identifier.endsWith(".public_key")).reduce((all, [identifier, publicKey]) => all.concat(configuration.secp256k1?.validatePublicKey(publicKey) === true ? [] : [configuration.secp256k1 === void 0 ? {
		error: `Could not validate compilation data: the public key provided for "${identifier}" could not be validated because the "secp256k1" property was not provided in the compiler configuration.`,
		range: createEmptyRange()
	} : {
		error: `Invalid compilation data detected: the public key provided for "${identifier}" is not a valid Secp256k1 public key.`,
		range: createEmptyRange()
	}]), []),
	...data.keys?.privateKeys === void 0 ? [] : Object.entries(data.keys.privateKeys).reduce((all, [variableId, privateKey]) => all.concat(validateSecp256k1PrivateKey(privateKey) ? [] : [{
		error: `Invalid compilation data detected: the private key provided for the "${variableId}" variable is not a valid Secp256k1 private key.`,
		range: createEmptyRange()
	}]), []),
	...data.hdKeys?.hdPrivateKeys === void 0 ? [] : Object.entries(data.hdKeys.hdPrivateKeys).reduce((all, [entityId, hdPrivateKey]) => {
		const decoded = decodeHdPrivateKey(hdPrivateKey);
		return all.concat(typeof decoded === "string" ? [{
			error: `Invalid compilation data detected: the HD private key provided for the "${entityId}" entity is not a valid HD private key. ${decoded}`,
			range: createEmptyRange()
		}] : []);
	}, []),
	...data.hdKeys?.hdPublicKeys === void 0 ? [] : Object.entries(data.hdKeys.hdPublicKeys).reduce((all, [entityId, hdPublicKey]) => {
		const decoded = decodeHdPublicKey(hdPublicKey);
		return all.concat(typeof decoded === "string" ? [{
			error: `Invalid compilation data detected: the HD public key provided for the "${entityId}" entity is not a valid HD public key. ${decoded}`,
			range: createEmptyRange()
		}] : []);
	}, [])
];
/**
* This method is generally for internal use. The {@link compileScript} method
* is the recommended API for direct compilation.
*/
var compileScriptRaw = ({ data, configuration, scriptId }) => {
	const script = configuration.scripts[scriptId];
	if (script === void 0) return {
		errorType: "parse",
		errors: [{
			error: `No script with an ID of "${scriptId}" was provided in the compiler configuration.`,
			range: createEmptyRange()
		}],
		success: false
	};
	if (configuration.sourceScriptIds?.includes(scriptId) === true) return {
		errorType: "parse",
		errors: [{
			error: `A circular dependency was encountered: script "${scriptId}" relies on itself to be generated. (Source scripts: ${configuration.sourceScriptIds.join(" → ")})`,
			range: createEmptyRange()
		}],
		success: false
	};
	const sourceScriptIds = configuration.sourceScriptIds === void 0 ? [scriptId] : [...configuration.sourceScriptIds, scriptId];
	const dataErrors = validateCompilationData({
		configuration,
		data
	});
	if (dataErrors.length !== 0) return {
		errorType: "parse",
		errors: dataErrors,
		success: false
	};
	return compileScriptContents({
		configuration: {
			...configuration,
			sourceScriptIds
		},
		data,
		script
	});
};
/**
* Compile an internal script identifier.
*
* @remarks
* If the identifier can be successfully resolved as a script, the script is
* compiled and returned as a {@link CompilationResultSuccess}. If an error
* occurs in compiling it, the error is returned as a string.
*
* Otherwise, the identifier is not recognized as a script, and this method
* simply returns `false`.
*/
var resolveScriptIdentifier = ({ data, configuration, identifier }) => {
	if (configuration.scripts[identifier] === void 0) return false;
	const result = compileScriptRaw({
		configuration,
		data,
		scriptId: identifier
	});
	if (result.success) return result;
	return `Compilation error in resolved script "${identifier}": ${stringifyErrors(result.errors)}`;
};
/**
* Return an {@link IdentifierResolutionFunction} for use in
* {@link resolveScriptSegment}.
*
* @param scriptId - the `id` of the script for which the resulting
* `IdentifierResolutionFunction` will be used.
*/
var createIdentifierResolver = ({ data, configuration }) => (identifier) => {
	const opcodeResult = configuration.opcodes?.[identifier];
	if (opcodeResult !== void 0) return {
		bytecode: opcodeResult,
		status: true,
		type: IdentifierResolutionType.opcode
	};
	const variableResult = resolveVariableIdentifier({
		configuration,
		data,
		identifier
	});
	if (variableResult.status !== "skip") return variableResult.status === "error" ? {
		..."debug" in variableResult ? { debug: variableResult.debug } : {},
		error: variableResult.error,
		...configuration.entityOwnership === void 0 ? {} : { entityOwnership: configuration.entityOwnership[identifier.split(".")[0]] },
		recoverable: "recoverable" in variableResult,
		status: false,
		type: IdentifierResolutionErrorType.variable
	} : {
		..."debug" in variableResult ? { debug: variableResult.debug } : {},
		bytecode: variableResult.bytecode,
		..."signature" in variableResult ? { signature: variableResult.signature } : {},
		status: true,
		type: IdentifierResolutionType.variable
	};
	const scriptResult = resolveScriptIdentifier({
		configuration,
		data,
		identifier
	});
	if (scriptResult !== false) return typeof scriptResult === "string" ? {
		error: scriptResult,
		scriptId: identifier,
		status: false,
		type: IdentifierResolutionErrorType.script
	} : {
		bytecode: scriptResult.bytecode,
		source: scriptResult,
		status: true,
		type: IdentifierResolutionType.script
	};
	return {
		error: `Unknown identifier "${identifier}".`,
		status: false,
		type: IdentifierResolutionErrorType.unknown
	};
};
/**
* This method is generally for internal use. The {@link compileScript} method
* is the recommended API for direct compilation.
*/
var compileScriptContents = ({ data, configuration, script }) => {
	const parseResult = parseScript(script);
	if (!parseResult.status) return {
		errorType: "parse",
		errors: [{
			error: describeExpectedInput(parseResult.expected),
			range: {
				endColumn: parseResult.index.column,
				endLineNumber: parseResult.index.line,
				startColumn: parseResult.index.column,
				startLineNumber: parseResult.index.line
			}
		}],
		success: false
	};
	const resolver = createIdentifierResolver({
		configuration,
		data
	});
	const resolvedScript = resolveScriptSegment(parseResult.value, resolver);
	const resolutionErrors = getResolutionErrors(resolvedScript);
	if (resolutionErrors.length !== 0) return {
		errorType: "resolve",
		errors: resolutionErrors,
		parse: parseResult.value,
		resolve: resolvedScript,
		success: false
	};
	const reduction = reduceScript(resolvedScript, configuration.vm, configuration.createAuthenticationProgram);
	return {
		...reduction.errors === void 0 ? {
			bytecode: reduction.bytecode,
			success: true
		} : {
			errorType: "reduce",
			errors: reduction.errors,
			success: false
		},
		parse: parseResult.value,
		reduce: reduction,
		resolve: resolvedScript
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/language/compile.js
/**
* Parse, resolve, and reduce the selected script using the provided `data` and
* `configuration`.
*
* Note, locktime validation only occurs if `compilationContext` is provided in
* the configuration.
*/
var compileScript = (scriptId, data, configuration) => {
	const locktimeDisablingSequenceNumber = 4294967295;
	const lockTimeTypeBecomesTimestamp = 5e8;
	if (data.compilationContext?.transaction.locktime !== void 0) {
		if (configuration.unlockingScriptTimeLockTypes?.[scriptId] === "height" && data.compilationContext.transaction.locktime >= lockTimeTypeBecomesTimestamp) return {
			errorType: "parse",
			errors: [{
				error: `The script "${scriptId}" requires a height-based locktime (less than 500,000,000), but this transaction uses a timestamp-based locktime ("${data.compilationContext.transaction.locktime}").`,
				range: createEmptyRange()
			}],
			success: false
		};
		if (configuration.unlockingScriptTimeLockTypes?.[scriptId] === "timestamp" && data.compilationContext.transaction.locktime < lockTimeTypeBecomesTimestamp) return {
			errorType: "parse",
			errors: [{
				error: `The script "${scriptId}" requires a timestamp-based locktime (greater than or equal to 500,000,000), but this transaction uses a height-based locktime ("${data.compilationContext.transaction.locktime}").`,
				range: createEmptyRange()
			}],
			success: false
		};
	}
	if (data.compilationContext?.transaction.inputs[data.compilationContext.inputIndex]?.sequenceNumber !== void 0 && configuration.unlockingScriptTimeLockTypes?.[scriptId] !== void 0 && data.compilationContext.transaction.inputs[data.compilationContext.inputIndex].sequenceNumber === locktimeDisablingSequenceNumber) return {
		errorType: "parse",
		errors: [{
			error: `The script "${scriptId}" requires a locktime, but this input's sequence number is set to disable transaction locktime (0xffffffff). This will cause the OP_CHECKLOCKTIMEVERIFY operation to error when the transaction is verified. To be valid, this input must use a sequence number that does not disable locktime.`,
			range: createEmptyRange()
		}],
		success: false
	};
	const rawResult = compileScriptRaw({
		configuration,
		data,
		scriptId
	});
	if (!rawResult.success) return rawResult;
	const unlocks = configuration.unlockingScripts?.[scriptId];
	const unlockingScriptType = unlocks === void 0 ? void 0 : configuration.lockingScriptTypes?.[unlocks];
	const isP2shUnlock = unlockingScriptType === "p2sh20" || unlockingScriptType === "p2sh32";
	const lockingScriptType = configuration.lockingScriptTypes?.[scriptId];
	if (lockingScriptType === "p2sh20" || lockingScriptType === "p2sh32") {
		const transformedResult = compileScriptRaw({
			configuration: {
				...configuration,
				scripts: {
					p2sh20Locking: "OP_HASH160 <$(<lockingBytecode> OP_HASH160)> OP_EQUAL",
					p2sh32Locking: "OP_HASH256 <$(<lockingBytecode> OP_HASH256)> OP_EQUAL"
				},
				variables: { lockingBytecode: { type: "AddressData" } }
			},
			data: { bytecode: { lockingBytecode: rawResult.bytecode } },
			scriptId: lockingScriptType === "p2sh20" ? "p2sh20Locking" : "p2sh32Locking"
		});
		if (!transformedResult.success) return transformedResult;
		return {
			...rawResult,
			bytecode: transformedResult.bytecode,
			transformed: lockingScriptType === "p2sh20" ? "p2sh20-locking" : "p2sh32-locking"
		};
	}
	if (isP2shUnlock) {
		const lockingBytecodeResult = compileScriptRaw({
			configuration,
			data,
			scriptId: unlocks
		});
		if (!lockingBytecodeResult.success) return lockingBytecodeResult;
		const transformedResult = compileScriptRaw({
			configuration: {
				...configuration,
				scripts: { p2shUnlocking: "unlockingBytecode <lockingBytecode>" },
				variables: {
					lockingBytecode: { type: "AddressData" },
					unlockingBytecode: { type: "AddressData" }
				}
			},
			data: { bytecode: {
				lockingBytecode: lockingBytecodeResult.bytecode,
				unlockingBytecode: rawResult.bytecode
			} },
			scriptId: "p2shUnlocking"
		});
		return {
			...rawResult,
			bytecode: transformedResult.bytecode,
			transformed: unlockingScriptType === "p2sh20" ? "p2sh20-unlocking" : "p2sh32-unlocking"
		};
	}
	return rawResult;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/compiler-defaults.js
var CompilerDefaults;
(function(CompilerDefaults) {
	/**
	* The `addressIndex` used by the default scenario `data`.
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioAddressIndex"] = 0] = "defaultScenarioAddressIndex";
	/**
	* The value used for `["slot"]` and `["copy"]` locking or unlocking bytecode
	* when generating a scenario and no `unlockingScriptId` is provided.
	*/
	CompilerDefaults["defaultScenarioBytecode"] = "";
	/**
	*
	* The value of `currentBlockHeight` in the default wallet template
	* scenario. This is the height of the second mined block after the genesis
	* block: `000000006a625f06636b8bb6ac7b960a8d03705d1ace08b1a19da3fdcc99ddbd`.
	*
	* This default value was chosen to be low enough to simplify the debugging of
	* block height offsets while remaining differentiated from `0` and `1`, which
	* are used both as boolean return values and for control flow.
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioCurrentBlockHeight"] = 2] = "defaultScenarioCurrentBlockHeight";
	/**
	* The value of `currentBlockTime` in the default wallet template
	* scenario. This is the Median Time-Past block time (BIP113) of block `2`
	* (the block used in
	* {@link CompilerDefaults.defaultScenarioCurrentBlockHeight}).
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioCurrentBlockTime"] = 1231469665] = "defaultScenarioCurrentBlockTime";
	/**
	* The default `outpointTransactionHash` of inputs in scenarios.
	*/
	CompilerDefaults["defaultScenarioInputOutpointTransactionHash"] = "0000000000000000000000000000000000000000000000000000000000000001";
	/**
	* The default `category` of tokens in scenarios.
	*/
	CompilerDefaults["defaultScenarioOutputTokenCategory"] = "0000000000000000000000000000000000000000000000000000000000000002";
	/**
	* The default `sequenceNumber` of inputs in scenarios.
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioInputSequenceNumber"] = 0] = "defaultScenarioInputSequenceNumber";
	/**
	* The default `lockingBytecode` value for scenario outputs,
	* `OP_RETURN <"libauth">` (hex: `6a076c696261757468`).
	*/
	CompilerDefaults["defaultScenarioOutputLockingBytecode"] = "6a076c696261757468";
	/**
	* The default `valueSatoshis` of outputs in scenarios.
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioOutputValueSatoshis"] = 0] = "defaultScenarioOutputValueSatoshis";
	/**
	* The value of `transaction.locktime` in the default wallet template
	* scenario.
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioTransactionLocktime"] = 0] = "defaultScenarioTransactionLocktime";
	/**
	* The value of `transaction.version` in the default wallet template
	* scenario. Transaction version `2` enables `OP_CHECKSEQUENCEVERIFY` as
	* described in BIP68, BIP112, and BIP113.
	*/
	CompilerDefaults[CompilerDefaults["defaultScenarioTransactionVersion"] = 2] = "defaultScenarioTransactionVersion";
	/**
	*s
	* If unset, each `HdKey` uses this `addressOffset`.
	*/
	CompilerDefaults[CompilerDefaults["hdKeyAddressOffset"] = 0] = "hdKeyAddressOffset";
	/**
	* If unset, each `HdKey` uses this `hdPublicKeyDerivationPath`.
	*/
	CompilerDefaults["hdKeyHdPublicKeyDerivationPath"] = "";
	/**
	* If unset, each `HdKey` uses this `privateDerivationPath`.
	*/
	CompilerDefaults["hdKeyPrivateDerivationPath"] = "i";
	/**
	* The prefix used to refer to other scenario bytecode scripts from within a
	* bytecode script. See {@link WalletTemplateScenarioData.bytecode}
	* for details.
	*/
	CompilerDefaults["scenarioBytecodeScriptPrefix"] = "_scenario.";
})(CompilerDefaults || (CompilerDefaults = {}));
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/compiler-operation-helpers.js
/**
* Attempt a series of compiler operations, skipping to the next operation if
* the current operation returns a {@link CompilerOperationSkip} (indicating it
* failed and can be skipped). The `finalOperation` may not be skipped, and must
* either return {@link CompilerOperationSuccess} or
* {@link CompilerOperationError}.
*
* @param operations - an array of skippable operations to try
* @param finalOperation - a final, un-skippable operation
*/
var attemptCompilerOperations = (operations, finalOperation) => (identifier, data, configuration) => {
	for (const operation of operations) {
		const result = operation(identifier, data, configuration);
		if (result.status !== "skip") return result;
	}
	return finalOperation(identifier, data, configuration);
};
/**
* Modify a compiler operation to verify that certain properties exist in the
* {@link CompilationData} and {@link CompilerConfiguration} before executing
* the provided operation. If the properties don't exist, an error message
* is returned.
*
* This is useful for eliminating repetitive existence checks.
*/
var compilerOperationRequires = ({ canBeSkipped, dataProperties, configurationProperties, operation }) => (identifier, data, configuration) => {
	for (const property of configurationProperties) if (configuration[property] === void 0) return canBeSkipped ? { status: "skip" } : {
		error: `Cannot resolve "${identifier}" - the "${property}" property was not provided in the compiler configuration.`,
		status: "error"
	};
	for (const property of dataProperties) if (data[property] === void 0) return canBeSkipped ? { status: "skip" } : {
		error: `Cannot resolve "${identifier}" - the "${property}" property was not provided in the compilation data.`,
		status: "error"
	};
	return operation(identifier, data, configuration);
};
var compilerOperationAttemptBytecodeResolution = compilerOperationRequires({
	canBeSkipped: true,
	configurationProperties: [],
	dataProperties: ["bytecode"],
	operation: (identifier, data) => {
		const bytecode = data.bytecode[identifier];
		if (bytecode !== void 0) return {
			bytecode,
			status: "success"
		};
		return { status: "skip" };
	}
});
var compilerOperationHelperDeriveHdPrivateNode = ({ addressIndex, entityId, entityHdPrivateKey, configuration, hdKey, identifier }) => {
	const addressOffset = hdKey.addressOffset ?? CompilerDefaults.hdKeyAddressOffset;
	const privateDerivationPath = hdKey.privateDerivationPath ?? CompilerDefaults.hdKeyPrivateDerivationPath;
	const i = addressIndex + addressOffset;
	if (!/^(?:m|i|[0-9]+)'?(?:\/(?:[0-9]+|i)'?)*$/u.test(privateDerivationPath)) return {
		error: `Could not generate "${identifier}" - the path "${privateDerivationPath}" is not a valid "privateDerivationPath".`,
		status: "error"
	};
	/**
	* Provided keys are already verified by `validateCompilationData`.
	*/
	const masterContents = assertSuccess(decodeHdPrivateKey(entityHdPrivateKey, { crypto: configuration }));
	const instancePath = privateDerivationPath.replace("i", i.toString());
	const instanceNode = (instancePath.includes("m") ? deriveHdPath : deriveHdPathRelative)(masterContents.node, instancePath, {
		crypto: configuration,
		throwErrors: false
	});
	if (typeof instanceNode === "string") return {
		error: `Could not generate "${identifier}" - the path "${instancePath}" could not be derived for entity "${entityId}": ${instanceNode}`,
		status: "error"
	};
	return {
		bytecode: instanceNode.privateKey,
		status: "success"
	};
};
var compilerOperationHelperUnknownEntity = (identifier, variableId) => ({
	error: `Identifier "${identifier}" refers to an HdKey, but the "entityOwnership" for "${variableId}" is not available in this compiler configuration.`,
	status: "error"
});
var compilerOperationHelperAddressIndex = (identifier) => ({
	error: `Identifier "${identifier}" refers to an HdKey, but "hdKeys.addressIndex" was not provided in the compilation data.`,
	status: "error"
});
var compilerOperationHelperDeriveHdKeyPrivate = ({ configuration, hdKeys, identifier }) => {
	const { addressIndex, hdPrivateKeys } = hdKeys;
	const [variableId] = identifier.split(".");
	const entityId = configuration.entityOwnership[variableId];
	if (entityId === void 0) return compilerOperationHelperUnknownEntity(identifier, variableId);
	if (addressIndex === void 0) return compilerOperationHelperAddressIndex(identifier);
	const entityHdPrivateKey = hdPrivateKeys === void 0 ? void 0 : hdPrivateKeys[entityId];
	if (entityHdPrivateKey === void 0) return {
		error: `Identifier "${identifier}" refers to an HdKey owned by "${entityId}", but an HD private key for this entity (or an existing signature) was not provided in the compilation data.`,
		recoverable: true,
		status: "error"
	};
	/**
	* Guaranteed to be an `HdKey` if this method is reached in the compiler.
	*/
	const hdKey = configuration.variables[variableId];
	return compilerOperationHelperDeriveHdPrivateNode({
		addressIndex,
		configuration,
		entityHdPrivateKey,
		entityId,
		hdKey,
		identifier
	});
};
/**
* Returns `false` if the target script ID doesn't exist in the compiler
* configuration (allows for the caller to generate the error message).
*
* If the compilation produced errors, returns a
* {@link CompilerOperationErrorFatal}.
*
* If the compilation was successful, returns the compiled bytecode as a
* `Uint8Array`.
*/
var compilerOperationHelperCompileScript = ({ targetScriptId, data, configuration }) => {
	const signingTarget = configuration.scripts[targetScriptId];
	const compiledTarget = resolveScriptIdentifier({
		configuration,
		data,
		identifier: targetScriptId
	});
	if (signingTarget === void 0 || compiledTarget === false) return false;
	if (typeof compiledTarget === "string") return {
		error: compiledTarget,
		status: "error"
	};
	return compiledTarget.bytecode;
};
/**
* Returns either the properly generated `coveredBytecode` or a
* {@link CompilerOperationErrorFatal}.
*/
var compilerOperationHelperGenerateCoveredBytecode = ({ data, configuration, identifier, sourceScriptIds, unlockingScripts }) => {
	const currentScriptId = sourceScriptIds[sourceScriptIds.length - 1];
	if (currentScriptId === void 0) return {
		error: `Identifier "${identifier}" requires a signing serialization, but "coveredBytecode" cannot be determined because the compiler configuration's "sourceScriptIds" is empty.`,
		status: "error"
	};
	const targetLockingScriptId = unlockingScripts[currentScriptId];
	if (targetLockingScriptId === void 0) return {
		error: `Identifier "${identifier}" requires a signing serialization, but "coveredBytecode" cannot be determined because "${currentScriptId}" is not present in the compiler configuration's "unlockingScripts".`,
		status: "error"
	};
	const result = compilerOperationHelperCompileScript({
		configuration,
		data,
		targetScriptId: targetLockingScriptId
	});
	if (result === false) return {
		error: `Identifier "${identifier}" requires a signing serialization that covers an unknown locking script, "${targetLockingScriptId}".`,
		status: "error"
	};
	return result;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/compiler-operations.js
var compilerOperationAddressData = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["bytecode"],
	operation: (identifier, data) => {
		const bytecode = data.bytecode[identifier];
		if (bytecode !== void 0) return {
			bytecode,
			status: "success"
		};
		return {
			error: `Identifier "${identifier}" refers to an AddressData, but "${identifier}" was not provided in the CompilationData "bytecode".`,
			recoverable: true,
			status: "error"
		};
	}
});
var compilerOperationWalletData = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["bytecode"],
	operation: (identifier, data) => {
		const bytecode = data.bytecode[identifier];
		if (bytecode !== void 0) return {
			bytecode,
			status: "success"
		};
		return {
			error: `Identifier "${identifier}" refers to a WalletData, but "${identifier}" was not provided in the CompilationData "bytecode".`,
			recoverable: true,
			status: "error"
		};
	}
});
var compilerOperationCurrentBlockTime = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["currentBlockTime"],
	operation: (_, data) => ({
		bytecode: numberToBinUint32LE(data.currentBlockTime),
		status: "success"
	})
});
var compilerOperationCurrentBlockHeight = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["currentBlockHeight"],
	operation: (_, data) => ({
		bytecode: bigIntToVmNumber(BigInt(data.currentBlockHeight)),
		status: "success"
	})
});
var compilerOperationSigningSerializationCorrespondingOutput = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => {
		const { correspondingOutput } = generateSigningSerializationComponentsBCH(data.compilationContext);
		return correspondingOutput === void 0 ? {
			bytecode: Uint8Array.of(),
			status: "success"
		} : {
			bytecode: correspondingOutput,
			status: "success"
		};
	}
});
var compilerOperationSigningSerializationCorrespondingOutputHash = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["sha256"],
	dataProperties: ["compilationContext"],
	operation: (_, data, configuration) => {
		const { correspondingOutput } = generateSigningSerializationComponentsBCH(data.compilationContext);
		return correspondingOutput === void 0 ? {
			bytecode: Uint8Array.of(),
			status: "success"
		} : {
			bytecode: configuration.sha256.hash(configuration.sha256.hash(correspondingOutput)),
			status: "success"
		};
	}
});
var compilerOperationHelperSigningSerializationCoveredBytecode = (returnLength) => compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["sourceScriptIds", "unlockingScripts"],
	dataProperties: ["compilationContext"],
	operation: (identifier, data, configuration) => {
		const { unlockingScripts, sourceScriptIds } = configuration;
		const result = compilerOperationHelperGenerateCoveredBytecode({
			configuration,
			data,
			identifier,
			sourceScriptIds,
			unlockingScripts
		});
		if ("error" in result) return result;
		return {
			bytecode: returnLength ? bigIntToCompactUint(BigInt(result.length)) : result,
			status: "success"
		};
	}
});
var compilerOperationSigningSerializationCoveredBytecode = compilerOperationHelperSigningSerializationCoveredBytecode(false);
var compilerOperationSigningSerializationCoveredBytecodeLength = compilerOperationHelperSigningSerializationCoveredBytecode(true);
var compilerOperationSigningSerializationLocktime = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: numberToBinUint32LE(data.compilationContext.transaction.locktime),
		status: "success"
	})
});
var compilerOperationSigningSerializationOutpointIndex = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: numberToBinUint32LE(data.compilationContext.transaction.inputs[data.compilationContext.inputIndex].outpointIndex),
		status: "success"
	})
});
var compilerOperationSigningSerializationOutpointTransactionHash = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: data.compilationContext.transaction.inputs[data.compilationContext.inputIndex].outpointTransactionHash,
		status: "success"
	})
});
var compilerOperationSigningSerializationOutputValue = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: valueSatoshisToBin(data.compilationContext.sourceOutputs[data.compilationContext.inputIndex].valueSatoshis),
		status: "success"
	})
});
var compilerOperationSigningSerializationSequenceNumber = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: numberToBinUint32LE(data.compilationContext.transaction.inputs[data.compilationContext.inputIndex].sequenceNumber),
		status: "success"
	})
});
var compilerOperationSigningSerializationTransactionOutpoints = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: encodeTransactionOutpoints(data.compilationContext.transaction.inputs),
		status: "success"
	})
});
var compilerOperationSigningSerializationTransactionOutpointsHash = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["sha256"],
	dataProperties: ["compilationContext"],
	operation: (_, data, configuration) => ({
		bytecode: configuration.sha256.hash(configuration.sha256.hash(encodeTransactionOutpoints(data.compilationContext.transaction.inputs))),
		status: "success"
	})
});
var compilerOperationSigningSerializationTransactionOutputs = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: encodeTransactionOutputsForSigning(data.compilationContext.transaction.outputs),
		status: "success"
	})
});
var compilerOperationSigningSerializationTransactionOutputsHash = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["sha256"],
	dataProperties: ["compilationContext"],
	operation: (_, data, configuration) => ({
		bytecode: configuration.sha256.hash(configuration.sha256.hash(encodeTransactionOutputsForSigning(data.compilationContext.transaction.outputs))),
		status: "success"
	})
});
var compilerOperationSigningSerializationTransactionSequenceNumbers = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: encodeTransactionInputSequenceNumbersForSigning(data.compilationContext.transaction.inputs),
		status: "success"
	})
});
var compilerOperationSigningSerializationTransactionSequenceNumbersHash = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["sha256"],
	dataProperties: ["compilationContext"],
	operation: (_, data, configuration) => ({
		bytecode: configuration.sha256.hash(configuration.sha256.hash(encodeTransactionInputSequenceNumbersForSigning(data.compilationContext.transaction.inputs))),
		status: "success"
	})
});
var compilerOperationSigningSerializationVersion = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: numberToBinUint32LE(data.compilationContext.transaction.version),
		status: "success"
	})
});
var compilerOperationKeyPublicKeyCommon = attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["secp256k1"],
	dataProperties: ["keys"],
	operation: (identifier, data, configuration) => {
		const { keys } = data;
		const { secp256k1 } = configuration;
		const { privateKeys } = keys;
		const [variableId] = identifier.split(".");
		if (privateKeys?.[variableId] !== void 0) return {
			bytecode: secp256k1.derivePublicKeyCompressed(privateKeys[variableId]),
			status: "success"
		};
		return {
			error: `Identifier "${identifier}" refers to a public key, but no public or private keys for "${variableId}" were provided in the compilation data.`,
			recoverable: true,
			status: "error"
		};
	}
}));
var compilerOperationsCommon = {
	addressData: compilerOperationAddressData,
	currentBlockHeight: compilerOperationCurrentBlockHeight,
	currentBlockTime: compilerOperationCurrentBlockTime,
	hdKey: { public_key: attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
		canBeSkipped: false,
		configurationProperties: [
			"entityOwnership",
			"ripemd160",
			"secp256k1",
			"sha256",
			"sha512",
			"variables"
		],
		dataProperties: ["hdKeys"],
		operation: (identifier, data, configuration) => {
			const { hdKeys } = data;
			const { hdPrivateKeys, addressIndex, hdPublicKeys } = hdKeys;
			const [variableId] = identifier.split(".");
			const entityId = configuration.entityOwnership[variableId];
			if (entityId === void 0) return compilerOperationHelperUnknownEntity(identifier, variableId);
			if (addressIndex === void 0) return compilerOperationHelperAddressIndex(identifier);
			const entityHdPrivateKey = hdPrivateKeys === void 0 ? void 0 : hdPrivateKeys[entityId];
			/**
			* Guaranteed to be an `HdKey` if this method is reached in the compiler.
			*/
			const hdKey = configuration.variables[variableId];
			if (entityHdPrivateKey !== void 0) {
				const privateResult = compilerOperationHelperDeriveHdPrivateNode({
					addressIndex,
					configuration,
					entityHdPrivateKey,
					entityId,
					hdKey,
					identifier
				});
				if (privateResult.status === "error") return privateResult;
				return {
					bytecode: configuration.secp256k1.derivePublicKeyCompressed(privateResult.bytecode),
					status: "success"
				};
			}
			const entityHdPublicKey = hdPublicKeys === void 0 ? void 0 : hdPublicKeys[entityId];
			if (entityHdPublicKey === void 0) return {
				error: `Identifier "${identifier}" refers to an HdKey owned by "${entityId}", but an HD private key or HD public key for this entity was not provided in the compilation data.`,
				recoverable: true,
				status: "error"
			};
			const addressOffset = hdKey.addressOffset ?? CompilerDefaults.hdKeyAddressOffset;
			const privateDerivationPath = hdKey.privateDerivationPath ?? CompilerDefaults.hdKeyPrivateDerivationPath;
			const hdPublicKeyDerivationPath = hdKey.hdPublicKeyDerivationPath ?? CompilerDefaults.hdKeyHdPublicKeyDerivationPath;
			const publicDerivationPath = hdKey.publicDerivationPath ?? privateDerivationPath.replace("m/", "");
			if (hdPublicKeyDerivationPath !== "" && !/^(?:m|[0-9]+)'?(?:\/(?:[0-9]+'?))*$/u.test(hdPublicKeyDerivationPath)) return {
				error: `Could not generate "${identifier}" - "hdPublicKeyDerivationPath" ("${hdPublicKeyDerivationPath}") must be a fixed (no "i" characters), valid absolute derivation path.`,
				status: "error"
			};
			const expected = hdPublicKeyDerivationPath === "" ? publicDerivationPath : `${hdPublicKeyDerivationPath}/${publicDerivationPath}`;
			if (privateDerivationPath !== expected) return {
				error: `Could not generate "${identifier}" - "privateDerivationPath" ("${privateDerivationPath}") is expected to be the combination of "hdPublicKeyDerivationPath" and "publicDerivationPath": "${expected}".`,
				status: "error"
			};
			/**
			* Provided keys are already verified by `validateCompilationData`.
			*/
			const masterContents = assertSuccess(decodeHdPublicKey(entityHdPublicKey, { crypto: configuration }));
			const i = addressIndex + addressOffset;
			const instancePath = publicDerivationPath.replace("i", i.toString());
			const expectedDepth = hdPublicKeyDerivationPath.split("/").length - 1;
			if (hdPublicKeyDerivationPath !== "" && masterContents.node.depth !== expectedDepth) return {
				error: `Could not generate "${identifier}" - the HD public key derivation path ("${hdPublicKeyDerivationPath}") indicates an expected depth of ${expectedDepth}, but the provided HD public key has a depth of ${masterContents.node.depth}.`,
				status: "error"
			};
			const instanceNode = deriveHdPathRelative(masterContents.node, instancePath, {
				crypto: configuration,
				throwErrors: false
			});
			if (typeof instanceNode === "string") return {
				error: `Could not generate "${identifier}" - the path "${instancePath}" could not be derived for entity "${entityId}": ${instanceNode}`,
				status: "error"
			};
			return {
				bytecode: instanceNode.publicKey,
				status: "success"
			};
		}
	})) },
	key: { public_key: compilerOperationKeyPublicKeyCommon },
	signingSerialization: {
		corresponding_output: compilerOperationSigningSerializationCorrespondingOutput,
		corresponding_output_hash: compilerOperationSigningSerializationCorrespondingOutputHash,
		covered_bytecode: compilerOperationSigningSerializationCoveredBytecode,
		covered_bytecode_length: compilerOperationSigningSerializationCoveredBytecodeLength,
		locktime: compilerOperationSigningSerializationLocktime,
		outpoint_index: compilerOperationSigningSerializationOutpointIndex,
		outpoint_transaction_hash: compilerOperationSigningSerializationOutpointTransactionHash,
		output_value: compilerOperationSigningSerializationOutputValue,
		sequence_number: compilerOperationSigningSerializationSequenceNumber,
		transaction_outpoints: compilerOperationSigningSerializationTransactionOutpoints,
		transaction_outpoints_hash: compilerOperationSigningSerializationTransactionOutpointsHash,
		transaction_outputs: compilerOperationSigningSerializationTransactionOutputs,
		transaction_outputs_hash: compilerOperationSigningSerializationTransactionOutputsHash,
		transaction_sequence_numbers: compilerOperationSigningSerializationTransactionSequenceNumbers,
		transaction_sequence_numbers_hash: compilerOperationSigningSerializationTransactionSequenceNumbersHash,
		version: compilerOperationSigningSerializationVersion
	},
	walletData: compilerOperationWalletData
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/scenarios.js
/**
* Given a compiler configuration, generate the default scenario that is
* extended by all the configuration's scenarios.
*
* For details on default scenario generation, see
* {@link WalletTemplateScenario.extends}.
*
* @param configuration - the compiler configuration from which to generate the
* default scenario
*/
var generateDefaultScenarioDefinition = (configuration) => {
	const { variables, entityOwnership } = configuration;
	const keyVariableIds = variables === void 0 ? [] : Object.entries(variables).filter((entry) => entry[1].type === "Key").map(([id]) => id);
	const entityIds = entityOwnership === void 0 ? [] : Object.keys(Object.values(entityOwnership).reduce((all, entityId) => ({
		...all,
		[entityId]: true
	}), {}));
	const valueMap = [...keyVariableIds, ...entityIds].sort((idA, idB) => idA.localeCompare(idB, "en")).reduce((all, id, index) => ({
		...all,
		[id]: bigIntToBinUint256BEClamped(BigInt(index + 1))
	}), {});
	const privateKeys = variables === void 0 ? void 0 : Object.entries(variables).reduce((all, [variableId, variable]) => variable.type === "Key" ? {
		...all,
		[variableId]: binToHex(valueMap[variableId])
	} : all, {});
	const defaultScenario = {
		data: {
			currentBlockHeight: CompilerDefaults.defaultScenarioCurrentBlockHeight,
			currentBlockTime: CompilerDefaults.defaultScenarioCurrentBlockTime,
			...privateKeys === void 0 || Object.keys(privateKeys).length === 0 ? {} : { keys: { privateKeys } }
		},
		sourceOutputs: [{ lockingBytecode: ["slot"] }],
		transaction: {
			inputs: [{ unlockingBytecode: ["slot"] }],
			locktime: CompilerDefaults.defaultScenarioTransactionLocktime,
			outputs: [{ lockingBytecode: CompilerDefaults.defaultScenarioOutputLockingBytecode }],
			version: CompilerDefaults.defaultScenarioTransactionVersion
		}
	};
	if (!(variables === void 0 ? false : Object.values(variables).findIndex((variable) => variable.type === "HdKey") !== -1)) return defaultScenario;
	const { sha256, sha512 } = configuration;
	if (sha256 === void 0) return "An implementations of \"sha256\" is required to generate defaults for HD keys, but the \"sha256\" property is not included in this compiler configuration.";
	if (sha512 === void 0) return "An implementations of \"sha512\" is required to generate defaults for HD keys, but the \"sha512\" property is not included in this compiler configuration.";
	const crypto = {
		sha256,
		sha512
	};
	const hdPrivateKeys = entityIds.reduce((all, entityId) => {
		const { hdPrivateKey } = encodeHdPrivateKey({
			network: "mainnet",
			node: deriveHdPrivateNodeFromSeed(valueMap[entityId], {
				assumeValidity: true,
				crypto
			})
		}, { crypto });
		return {
			...all,
			[entityId]: hdPrivateKey
		};
	}, {});
	return {
		...defaultScenario,
		data: {
			...defaultScenario.data,
			hdKeys: {
				addressIndex: CompilerDefaults.defaultScenarioAddressIndex,
				hdPrivateKeys
			}
		}
	};
};
/**
* Extend the `data` property of a scenario definition with values from a parent
* scenario definition. Returns the extended value for `data`.
*
* @param parentData - the scenario `data` that is extended by the child
* scenario
* @param childData - the scenario `data` that may override values from the
* parent scenario
*/
var extendScenarioDefinitionData = (parentData, childData) => ({
	...parentData,
	...childData,
	...parentData.bytecode === void 0 && childData.bytecode === void 0 ? {} : { bytecode: {
		...parentData.bytecode,
		...childData.bytecode
	} },
	...parentData.hdKeys === void 0 && childData.hdKeys === void 0 ? {} : { hdKeys: {
		...parentData.hdKeys,
		...childData.hdKeys,
		...parentData.hdKeys?.hdPrivateKeys === void 0 && childData.hdKeys?.hdPrivateKeys === void 0 ? {} : { hdPrivateKeys: {
			...parentData.hdKeys?.hdPrivateKeys,
			...childData.hdKeys?.hdPrivateKeys
		} },
		...parentData.hdKeys?.hdPublicKeys === void 0 && childData.hdKeys?.hdPublicKeys === void 0 ? {} : { hdPublicKeys: {
			...parentData.hdKeys?.hdPublicKeys,
			...childData.hdKeys?.hdPublicKeys
		} }
	} },
	...parentData.keys === void 0 && childData.keys === void 0 ? {} : { keys: { privateKeys: {
		...parentData.keys?.privateKeys,
		...childData.keys?.privateKeys
	} } }
});
/**
* Extend a child scenario definition with values from a parent scenario
* definition. Returns the extended values for `data`, `transaction`, and
* `value`.
*
* @param parentScenario - the scenario that is extended by the child scenario
* @param childScenario - the scenario that may override values from the parent
* scenario
*/
var extendScenarioDefinition = (parentScenario, childScenario) => ({
	...parentScenario.data === void 0 && childScenario.data === void 0 ? {} : { data: extendScenarioDefinitionData(parentScenario.data ?? {}, childScenario.data ?? {}) },
	...parentScenario.transaction === void 0 && childScenario.transaction === void 0 ? {} : { transaction: {
		...parentScenario.transaction,
		...childScenario.transaction
	} },
	...parentScenario.sourceOutputs === void 0 && childScenario.sourceOutputs === void 0 ? {} : { sourceOutputs: childScenario.sourceOutputs ?? parentScenario.sourceOutputs }
});
/**
* Generate the full scenario that is extended by the provided scenario
* identifier. Scenarios for which `extends` is `undefined` extend the default
* scenario for the provided compiler configuration.
*/
var generateExtendedScenario = ({ configuration, scenarioId, sourceScenarioIds = [] }) => {
	if (scenarioId === void 0) return generateDefaultScenarioDefinition(configuration);
	if (sourceScenarioIds.includes(scenarioId)) return `Cannot extend scenario "${scenarioId}": scenario "${scenarioId}" extends itself. Scenario inheritance path: ${sourceScenarioIds.join(" → ")}`;
	const scenario = configuration.scenarios?.[scenarioId];
	if (scenario === void 0) return `Cannot extend scenario "${scenarioId}": a scenario with the identifier ${scenarioId} is not included in this compiler configuration.`;
	const parentScenario = scenario.extends === void 0 ? generateDefaultScenarioDefinition(configuration) : generateExtendedScenario({
		configuration,
		scenarioId: scenario.extends,
		sourceScenarioIds: [...sourceScenarioIds, scenarioId]
	});
	if (typeof parentScenario === "string") return parentScenario;
	return extendScenarioDefinition(parentScenario, scenario);
};
/**
* Derive standard {@link CompilationData} properties from an extended scenario
* definition.
*
* @param definition - a scenario definition that has been extended by the
* default scenario definition
*/
var extendedScenarioDefinitionToCompilationData = (definition) => ({
	...definition.data.currentBlockHeight === void 0 ? {} : { currentBlockHeight: definition.data.currentBlockHeight },
	...definition.data.currentBlockTime === void 0 ? {} : { currentBlockTime: definition.data.currentBlockTime },
	...definition.data.hdKeys === void 0 ? {} : { hdKeys: {
		...definition.data.hdKeys.addressIndex === void 0 ? {} : { addressIndex: definition.data.hdKeys.addressIndex },
		...definition.data.hdKeys.hdPrivateKeys !== void 0 && Object.keys(definition.data.hdKeys.hdPrivateKeys).length > 0 ? { hdPrivateKeys: definition.data.hdKeys.hdPrivateKeys } : {},
		...definition.data.hdKeys.hdPublicKeys === void 0 ? {} : { hdPublicKeys: definition.data.hdKeys.hdPublicKeys }
	} },
	...definition.data.keys?.privateKeys !== void 0 && Object.keys(definition.data.keys.privateKeys).length > 0 ? { keys: { privateKeys: Object.entries(definition.data.keys.privateKeys).reduce((all, [id, hex]) => ({
		...all,
		[id]: hexToBin(hex)
	}), {}) } } : {}
});
/**
* Extend a {@link CompilationData} object with the compiled result of the
* bytecode scripts provided by an {@link WalletTemplateScenarioData}.
*/
var extendCompilationDataWithScenarioBytecode = ({ compilationData, configuration, scenarioDataBytecodeScripts }) => {
	const prefixBytecodeScriptId = (id) => `${CompilerDefaults.scenarioBytecodeScriptPrefix}${id}`;
	const bytecodeScripts = Object.entries(scenarioDataBytecodeScripts).reduce((all, [id, script]) => ({
		...all,
		[prefixBytecodeScriptId(id)]: script
	}), {});
	const bytecodeScriptExtendedConfiguration = {
		...configuration,
		scripts: {
			...configuration.scripts,
			...bytecodeScripts
		}
	};
	const bytecodeCompilations = Object.keys(scenarioDataBytecodeScripts).map((id) => {
		const result = compileScriptRaw({
			configuration: bytecodeScriptExtendedConfiguration,
			data: compilationData,
			scriptId: prefixBytecodeScriptId(id)
		});
		if (result.success) return {
			bytecode: result.bytecode,
			id
		};
		return {
			errors: result.errors,
			id
		};
	});
	const failedResults = bytecodeCompilations.filter((result) => "errors" in result);
	if (failedResults.length > 0) return failedResults.map((result) => `Compilation error while generating bytecode for "${result.id}": ${stringifyErrors(result.errors)}`).join("; ");
	const compiledBytecode = bytecodeCompilations.reduce((all, result) => ({
		...all,
		[result.id]: result.bytecode
	}), {});
	return {
		...Object.keys(compiledBytecode).length > 0 ? { bytecode: compiledBytecode } : {},
		...compilationData
	};
};
/**
* Compile a {@link WalletTemplateScenarioOutput.valueSatoshis},
* returning the `Uint8Array` result.
*/
var compileWalletTemplateScenarioValueSatoshis = (valueSatoshisDefinition = CompilerDefaults.defaultScenarioOutputValueSatoshis) => typeof valueSatoshisDefinition === "string" ? binToValueSatoshis(hexToBin(valueSatoshisDefinition)) : BigInt(valueSatoshisDefinition);
/**
* Compile an {@link WalletTemplateScenarioBytecode} definition for an
* {@link WalletTemplateScenario}, returning either a
* simple `Uint8Array` result or a full CashAssembly {@link CompilationResult}.
*/
var compileWalletTemplateScenarioBytecode = ({ bytecodeDefinition, compilationContext, configuration, defaultOverride, extendedScenario, generateBytecode, lockingOrUnlockingScriptIdUnderTest }) => {
	if (typeof bytecodeDefinition === "string") return hexToBin(bytecodeDefinition);
	const scriptId = bytecodeDefinition.script === void 0 || Array.isArray(bytecodeDefinition.script) ? lockingOrUnlockingScriptIdUnderTest : bytecodeDefinition.script;
	/**
	* The script ID to compile. If `undefined`, we are attempting to "copy" the
	* script ID in a scenario generation that does not define a locking or
	* unlocking script under test (e.g. the scenario is only used for debugging
	* values in an editor) - in these cases, simply return an empty `Uint8Array`.
	*/
	if (scriptId === void 0) return hexToBin("");
	const overrides = bytecodeDefinition.overrides ?? defaultOverride;
	const overriddenDataDefinition = extendScenarioDefinitionData(extendedScenario.data, overrides);
	const data = extendCompilationDataWithScenarioBytecode({
		compilationData: extendedScenarioDefinitionToCompilationData({ data: overriddenDataDefinition }),
		configuration,
		scenarioDataBytecodeScripts: overriddenDataDefinition.bytecode ?? {}
	});
	if (typeof data === "string") return {
		errors: [{ error: `Could not compile scenario "data.bytecode": ${data}` }],
		success: false
	};
	return generateBytecode({
		data: {
			...data,
			compilationContext
		},
		debug: true,
		scriptId
	});
};
/**
* Compile a {@link WalletTemplateScenarioOutput.token},
* returning the {@link Output.token} result.
*/
var compileScenarioOutputTokenData = (output) => output.token === void 0 ? {} : { token: {
	amount: BigInt(output.token.amount ?? 0),
	category: hexToBin(output.token.category ?? CompilerDefaults.defaultScenarioOutputTokenCategory),
	...output.token.nft === void 0 ? {} : { nft: {
		capability: output.token.nft.capability ?? "none",
		commitment: hexToBin(output.token.nft.commitment ?? "")
	} }
} };
/**
* Generate a scenario given a compiler configuration. If neither `scenarioId`
* or `unlockingScriptId` are provided, the default scenario for the compiler
* configuration will be generated.
*
* Returns either the full `CompilationData` for the selected scenario or an
* error message (as a `string`).
*
* Note, this method should typically not be used directly, use
* {@link Compiler.generateScenario} instead.
*/
var generateScenarioBCH = ({ configuration, generateBytecode, scenarioId, unlockingScriptId, lockingScriptId: providedLockingScriptId }, debug) => {
	const { scenarioDefinition, scenarioName } = scenarioId === void 0 ? {
		scenarioDefinition: {},
		scenarioName: `the default scenario`
	} : {
		scenarioDefinition: configuration.scenarios?.[scenarioId],
		scenarioName: `scenario "${scenarioId}"`
	};
	if (scenarioDefinition === void 0) return `Cannot generate ${scenarioName}: a scenario definition with the identifier ${scenarioId} is not included in this compiler configuration.`;
	const parentScenario = generateExtendedScenario({
		configuration,
		scenarioId
	});
	if (typeof parentScenario === "string") return `Cannot generate ${scenarioName}: ${parentScenario}`;
	const extendedScenario = extendScenarioDefinition(parentScenario, scenarioDefinition);
	const fullCompilationData = extendCompilationDataWithScenarioBytecode({
		compilationData: extendedScenarioDefinitionToCompilationData(extendedScenario),
		configuration,
		scenarioDataBytecodeScripts: extendedScenario.data.bytecode ?? {}
	});
	if (typeof fullCompilationData === "string") return `Cannot generate ${scenarioName}. ${fullCompilationData}`;
	if (extendedScenario.transaction.inputs.length !== extendedScenario.sourceOutputs.length) return `Cannot generate ${scenarioName}: could not match source outputs with inputs - "sourceOutputs" must be the same length as "transaction.inputs".`;
	if (extendedScenario.transaction.inputs.filter((input) => Array.isArray(input.unlockingBytecode)).length !== 1) return `Cannot generate ${scenarioName}: the specific input under test in this scenario is ambiguous - "transaction.inputs" must include exactly one input that has "unlockingBytecode" set to ["slot"].`;
	const testedInputIndex = extendedScenario.transaction.inputs.findIndex((input) => Array.isArray(input.unlockingBytecode));
	if (extendedScenario.sourceOutputs.filter((output) => Array.isArray(output.lockingBytecode)).length !== 1) return `Cannot generate ${scenarioName}: the source output unlocked by the input under test in this scenario is ambiguous - "sourceOutputs" must include exactly one output that has "lockingBytecode" set to ["slot"].`;
	if (!Array.isArray(extendedScenario.sourceOutputs[testedInputIndex]?.lockingBytecode)) return `Cannot generate ${scenarioName}: the source output unlocked by the input under test in this scenario is ambiguous - the ["slot"] in "transaction.inputs" and "sourceOutputs" must be at the same index.`;
	if (unlockingScriptId !== void 0 && providedLockingScriptId !== void 0) return `Cannot generate ${scenarioName}: a scenario cannot be generated with both unlocking and locking script IDs defined. If an unlocking script is provided, the associated locking script ID must be read from the template.`;
	const lockingScriptId = providedLockingScriptId ?? (unlockingScriptId === void 0 ? void 0 : configuration.unlockingScripts?.[unlockingScriptId]);
	if (unlockingScriptId !== void 0 && lockingScriptId === void 0) return `Cannot generate ${scenarioName} using unlocking script "${unlockingScriptId}": the locking script unlocked by "${unlockingScriptId}" is not provided in this compiler configuration.`;
	const sourceOutputCompilations = extendedScenario.sourceOutputs.map((sourceOutput, index) => {
		const slot = Array.isArray(sourceOutput.lockingBytecode);
		return {
			compiled: {
				lockingBytecode: compileWalletTemplateScenarioBytecode({
					bytecodeDefinition: slot ? lockingScriptId === void 0 ? CompilerDefaults.defaultScenarioBytecode : { script: lockingScriptId } : sourceOutput.lockingBytecode ?? {},
					configuration,
					defaultOverride: {},
					extendedScenario,
					generateBytecode,
					lockingOrUnlockingScriptIdUnderTest: lockingScriptId
				}),
				valueSatoshis: compileWalletTemplateScenarioValueSatoshis(sourceOutput.valueSatoshis),
				...compileScenarioOutputTokenData(sourceOutput)
			},
			index,
			slot,
			type: "source output"
		};
	});
	const lockingCompilation = sourceOutputCompilations.find((compilation) => compilation.slot)?.compiled.lockingBytecode;
	const transactionOutputCompilations = extendedScenario.transaction.outputs.map((transactionOutput, index) => {
		return {
			compiled: {
				lockingBytecode: compileWalletTemplateScenarioBytecode({
					bytecodeDefinition: transactionOutput.lockingBytecode ?? {},
					configuration,
					defaultOverride: { hdKeys: { addressIndex: 1 } },
					extendedScenario,
					generateBytecode,
					lockingOrUnlockingScriptIdUnderTest: lockingScriptId
				}),
				valueSatoshis: compileWalletTemplateScenarioValueSatoshis(transactionOutput.valueSatoshis),
				...compileScenarioOutputTokenData(transactionOutput)
			},
			index,
			type: "transaction output"
		};
	});
	const outputCompilationErrors = [...sourceOutputCompilations, ...transactionOutputCompilations].reduce((accumulated, result) => {
		if ("errors" in result.compiled.lockingBytecode) return [...accumulated, ...result.compiled.lockingBytecode.errors.map((errorObject) => `Failed compilation of ${result.type} at index ${result.index}: ${errorObject.error}`)];
		return accumulated;
	}, []);
	if (outputCompilationErrors.length > 0) {
		const error = `Cannot generate ${scenarioName}: ${outputCompilationErrors.join(" ")}`;
		if (debug === true) return {
			lockingCompilation,
			scenario: error
		};
		return error;
	}
	const sourceOutputCompilationsSuccess = sourceOutputCompilations;
	const transactionOutputCompilationsSuccess = transactionOutputCompilations;
	const extractOutput = (compilation) => {
		const { lockingBytecode, valueSatoshis, token } = compilation.compiled;
		return {
			lockingBytecode: "bytecode" in lockingBytecode ? lockingBytecode.bytecode : lockingBytecode,
			valueSatoshis,
			...token === void 0 ? {} : { token }
		};
	};
	const sourceOutputs = sourceOutputCompilationsSuccess.map(extractOutput);
	const outputs = transactionOutputCompilationsSuccess.map(extractOutput);
	const inputsContext = extendedScenario.transaction.inputs.map((input, inputIndex) => ({
		outpointIndex: input.outpointIndex ?? inputIndex,
		outpointTransactionHash: hexToBin(input.outpointTransactionHash ?? CompilerDefaults.defaultScenarioInputOutpointTransactionHash),
		sequenceNumber: input.sequenceNumber ?? CompilerDefaults.defaultScenarioInputSequenceNumber,
		unlockingBytecode: void 0
	}));
	const transactionInputCompilations = extendedScenario.transaction.inputs.map((input, index) => {
		const slot = Array.isArray(input.unlockingBytecode);
		const bytecodeDefinition = Array.isArray(input.unlockingBytecode) ? unlockingScriptId === void 0 ? CompilerDefaults.defaultScenarioBytecode : { script: unlockingScriptId } : input.unlockingBytecode ?? {};
		return {
			compiled: {
				outpointIndex: inputsContext[index].outpointIndex,
				outpointTransactionHash: inputsContext[index].outpointTransactionHash,
				sequenceNumber: inputsContext[index].sequenceNumber,
				unlockingBytecode: compileWalletTemplateScenarioBytecode({
					bytecodeDefinition,
					compilationContext: {
						inputIndex: index,
						sourceOutputs,
						transaction: {
							inputs: inputsContext,
							locktime: extendedScenario.transaction.locktime,
							outputs,
							version: extendedScenario.transaction.version
						}
					},
					configuration,
					defaultOverride: {},
					extendedScenario,
					generateBytecode,
					lockingOrUnlockingScriptIdUnderTest: unlockingScriptId
				})
			},
			index,
			slot
		};
	});
	const unlockingCompilation = transactionInputCompilations.find((compilation) => compilation.slot)?.compiled.unlockingBytecode;
	const inputCompilationErrors = transactionInputCompilations.reduce((accumulated, result) => {
		if ("errors" in result.compiled.unlockingBytecode) return [...accumulated, ...result.compiled.unlockingBytecode.errors.map((errorObject) => `Failed compilation of input at index ${result.index}: ${errorObject.error}`)];
		return accumulated;
	}, []);
	if (inputCompilationErrors.length > 0) {
		const error = `Cannot generate ${scenarioName}: ${inputCompilationErrors.join(" ")}`;
		if (debug === true) return {
			lockingCompilation,
			scenario: error,
			unlockingCompilation
		};
		return error;
	}
	const scenario = {
		data: fullCompilationData,
		program: {
			inputIndex: testedInputIndex,
			sourceOutputs,
			transaction: {
				inputs: transactionInputCompilations.map((compilation) => {
					const { outpointIndex, outpointTransactionHash, sequenceNumber, unlockingBytecode } = compilation.compiled;
					return {
						outpointIndex,
						outpointTransactionHash,
						sequenceNumber,
						unlockingBytecode: "bytecode" in unlockingBytecode ? unlockingBytecode.bytecode : unlockingBytecode
					};
				}),
				locktime: extendedScenario.transaction.locktime,
				outputs,
				version: extendedScenario.transaction.version
			}
		}
	};
	return debug === true ? {
		lockingCompilation,
		scenario,
		unlockingCompilation
	} : scenario;
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/compiler-utils.js
/**
* Create a {@link Compiler.generateBytecode} method given a compiler
* configuration.
*/
var createCompilerGenerateBytecodeFunction = (compilerConfiguration) => ({ data, debug, scriptId }) => {
	const result = compileScript(scriptId, data, compilerConfiguration);
	return debug === true ? result : result.success ? {
		bytecode: result.bytecode,
		success: true
	} : {
		errorType: result.errorType,
		errors: result.errors,
		success: false
	};
};
/**
* Create a {@link Compiler} from the provided compiler configuration. This
* method requires a full {@link CompilerConfiguration} and does not provide any
* crypto or VM implementations.
*
* @param configuration - the configuration from which to create the compiler
*/
var compilerConfigurationToCompilerBCH = (configuration) => {
	const generateBytecode = createCompilerGenerateBytecodeFunction(configuration);
	return {
		configuration,
		generateBytecode,
		generateScenario: ({ lockingScriptId, unlockingScriptId, scenarioId, debug }) => generateScenarioBCH({
			configuration,
			generateBytecode,
			lockingScriptId,
			scenarioId,
			unlockingScriptId
		}, debug)
	};
};
var nullHashLength = 32;
/**
* A common {@link createAuthenticationProgram} implementation for
* most compilers.
*
* Accepts the compiled contents of an evaluation and produces a
* {@link AuthenticationProgramCommon} that can be evaluated to produce the
* resulting program state.
*
* The precise shape of the authentication program produced by this method is
* critical to the determinism of CashAssembly evaluations for the compiler in
* which it is used, it therefore must be standardized between compiler
* implementations.
*
* @param evaluationBytecode - the compiled bytecode to incorporate in the
* created authentication program
*/
var createAuthenticationProgramEvaluationCommon = (evaluationBytecode) => ({
	inputIndex: 0,
	sourceOutputs: [{
		lockingBytecode: evaluationBytecode,
		valueSatoshis: 0n
	}],
	transaction: {
		inputs: [{
			outpointIndex: 0,
			outpointTransactionHash: new Uint8Array(nullHashLength),
			sequenceNumber: 0,
			unlockingBytecode: Uint8Array.of()
		}],
		locktime: 0,
		outputs: [{
			lockingBytecode: Uint8Array.of(),
			valueSatoshis: 0n
		}],
		version: 0
	}
});
/**
* Create a compiler using the default common compiler configuration. Because
* this compiler has no access to a VM, it cannot compile evaluations.
*
* @param scriptsAndOverrides - a compiler configuration from which properties
* will be used to override properties of the default common compiler
* configuration – must include the `scripts` property
*/
var createCompilerCommon = (scriptsAndOverrides) => compilerConfigurationToCompilerBCH({
	createAuthenticationProgram: createAuthenticationProgramEvaluationCommon,
	opcodes: generateBytecodeMap(Opcodes),
	operations: compilerOperationsCommon,
	ripemd160,
	secp256k1,
	sha256,
	sha512,
	...scriptsAndOverrides
});
/**
* Re-assemble a string of disassembled bytecode
* (see {@link disassembleBytecode}).
*
* @param opcodes - a mapping of opcodes to their respective Uint8Array
* representation
* @param disassembledBytecode - the disassembled bytecode to re-assemble
*/
var assembleBytecode = (opcodes, disassembledBytecode) => {
	return createCompilerCommon({
		opcodes,
		scripts: { asm: disassembledBytecode }
	}).generateBytecode({
		data: {},
		scriptId: "asm"
	});
};
/**
* Re-assemble a string of disassembled BCH bytecode; see
* {@link disassembleBytecodeBCH}.
*
* Note, this method performs automatic minimization of push instructions.
*
* @param disassembledBytecode - the disassembled BCH bytecode to re-assemble
*/
var assembleBytecodeBCH = (disassembledBytecode) => assembleBytecode(generateBytecodeMap(OpcodesBCH), disassembledBytecode);
/**
* A convenience method to compile CashAssembly (using
* {@link assembleBytecodeBCH}) to bytecode. If compilation fails, errors are
* returned as a string.
*/
var cashAssemblyToBin = (cashAssemblyScript) => {
	const result = assembleBytecodeBCH(cashAssemblyScript);
	return result.success ? result.bytecode : `CashAssembly compilation ${result.errorType} error: ${result.errors.map((err) => err.error).join(" ")}`;
};
/**
* Create a partial {@link CompilerConfiguration} from an
* {@link WalletTemplate} by extracting and formatting the `scripts` and
* `variables` properties.
*
* Note, if this {@link WalletTemplate} might be malformed, first
* validate it with {@link importWalletTemplate}.
*
* @param template - the {@link WalletTemplate} from which to extract
* the compiler configuration
*/
var walletTemplateToCompilerConfiguration = (template) => {
	/**
	* Template scripts including virtualized test scripts.
	*/
	const virtualizedScripts = Object.entries(template.scripts).reduce((all, [scriptId, script]) => {
		if ("tests" in script) return {
			...all,
			...Object.entries(script.tests).reduce((tests, [testId, test]) => {
				const pushTestedScript = script.pushed === true;
				const checkScriptId = `${scriptId}.${testId}.check`;
				const virtualizedLockingScriptId = `${scriptId}.${testId}.lock`;
				const virtualizedUnlockingScriptId = `${scriptId}.${testId}.unlock`;
				return {
					...tests,
					[checkScriptId]: { script: test.check },
					[virtualizedLockingScriptId]: {
						lockingType: "p2sh20",
						script: pushTestedScript ? `<${scriptId}> ${checkScriptId}` : `${scriptId} ${checkScriptId}`
					},
					[virtualizedUnlockingScriptId]: {
						script: test.setup ?? "",
						unlocks: virtualizedLockingScriptId
					}
				};
			}, {})
		};
		return all;
	}, {});
	const allScripts = {
		...template.scripts,
		...virtualizedScripts
	};
	const scripts = Object.entries(allScripts).reduce((all, [id, def]) => ({
		...all,
		[id]: def.script
	}), {});
	const variables = Object.values(template.entities).reduce((all, entity) => ({
		...all,
		...entity.variables
	}), {});
	const entityOwnership = Object.entries(template.entities).reduce((all, [entityId, entity]) => ({
		...all,
		...Object.keys(entity.variables ?? {}).reduce((entityVariables, variableId) => ({
			...entityVariables,
			[variableId]: entityId
		}), {})
	}), {});
	const unlockingScripts = Object.entries(allScripts).reduce((all, [id, def]) => "unlocks" in def && def.unlocks !== void 0 ? {
		...all,
		[id]: def.unlocks
	} : all, {});
	const unlockingScriptTimeLockTypes = Object.entries(allScripts).reduce((all, [id, def]) => "timeLockType" in def && def.timeLockType !== void 0 ? {
		...all,
		[id]: def.timeLockType
	} : all, {});
	const lockingScriptTypes = Object.entries(allScripts).reduce((all, [id, def]) => "lockingType" in def && def.lockingType !== void 0 ? {
		...all,
		[id]: def.lockingType
	} : all, {});
	const scenarios = template.scenarios === void 0 ? void 0 : Object.entries(template.scenarios).reduce((all, [id, def]) => ({
		...all,
		[id]: def
	}), {});
	return {
		entityOwnership,
		lockingScriptTypes,
		...scenarios === void 0 ? {} : { scenarios },
		scripts,
		unlockingScriptTimeLockTypes,
		unlockingScripts,
		variables
	};
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/compiler-bch/compiler-bch.js
var SigningSerializationAlgorithmIdentifier;
(function(SigningSerializationAlgorithmIdentifier) {
	/**
	* A.K.A. `SIGHASH_ALL|SIGHASH_FORKID`
	*/
	SigningSerializationAlgorithmIdentifier["allOutputs"] = "all_outputs";
	/**
	* A.K.A. `SIGHASH_ALL|SIGHASH_UTXOS|SIGHASH_FORKID`
	*/
	SigningSerializationAlgorithmIdentifier["allOutputsAllUtxos"] = "all_outputs_all_utxos";
	/**
	* A.K.A. `SIGHASH_ALL|SIGHASH_FORKID|ANYONECANPAY`
	*/
	SigningSerializationAlgorithmIdentifier["allOutputsSingleInput"] = "all_outputs_single_input";
	/**
	* A.K.A. `SIGHASH_ALL|SIGHASH_UTXOS|SIGHASH_FORKID|ANYONECANPAY`
	*/
	SigningSerializationAlgorithmIdentifier["allOutputsSingleInputInvalidAllUtxos"] = "all_outputs_single_input_INVALID_all_utxos";
	/**
	* A.K.A. `SIGHASH_SINGLE|SIGHASH_FORKID`
	*/
	SigningSerializationAlgorithmIdentifier["correspondingOutput"] = "corresponding_output";
	/**
	* A.K.A. `SIGHASH_SINGLE|SIGHASH_UTXOS|SIGHASH_FORKID`
	*/
	SigningSerializationAlgorithmIdentifier["correspondingOutputAllUtxos"] = "corresponding_output_all_utxos";
	/**
	* A.K.A. `SIGHASH_SINGLE|SIGHASH_FORKID|ANYONECANPAY`
	*/
	SigningSerializationAlgorithmIdentifier["correspondingOutputSingleInput"] = "corresponding_output_single_input";
	/**
	* A.K.A. `SIGHASH_SINGLE|SIGHASH_UTXOS|SIGHASH_FORKID|ANYONECANPAY`
	*/
	SigningSerializationAlgorithmIdentifier["correspondingOutputSingleInputInvalidAllUtxos"] = "corresponding_output_single_input_INVALID_all_utxos";
	/**
	* An alias for `all_outputs_all_utxos`
	* (A.K.A. `SIGHASH_ALL|SIGHASH_UTXOS|SIGHASH_FORKID`),
	* the most secure signing serialization algorithm.
	*
	* Note that as of 2022, `all_outputs` (A.K.A. `SIGHASH_ALL|SIGHASH_FORKID`)
	* is more commonly used and is therefore a better choice for privacy in
	* common, existing contract types.
	*/
	SigningSerializationAlgorithmIdentifier["default"] = "default";
	/**
	* A.K.A `SIGHASH_NONE|SIGHASH_FORKID`
	*/
	SigningSerializationAlgorithmIdentifier["noOutputs"] = "no_outputs";
	/**
	* A.K.A `SIGHASH_NONE|SIGHASH_UTXOS|SIGHASH_FORKID`
	*/
	SigningSerializationAlgorithmIdentifier["noOutputsAllUtxos"] = "no_outputs_all_utxos";
	/**
	* A.K.A `SIGHASH_NONE|SIGHASH_FORKID|ANYONECANPAY`
	*/
	SigningSerializationAlgorithmIdentifier["noOutputsSingleInput"] = "no_outputs_single_input";
	/**
	* A.K.A. `SIGHASH_NONE|SIGHASH_UTXOS|SIGHASH_FORKID|ANYONECANPAY`
	*/
	SigningSerializationAlgorithmIdentifier["noOutputsSingleInputInvalidAllUtxos"] = "no_outputs_single_input_INVALID_all_utxos";
})(SigningSerializationAlgorithmIdentifier || (SigningSerializationAlgorithmIdentifier = {}));
var getSigningSerializationType = (algorithmIdentifier, prefix = "") => {
	switch (algorithmIdentifier) {
		case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputs}`: return Uint8Array.of(SigningSerializationTypeBCH.allOutputs);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsAllUtxos}`:
		case `${prefix}${SigningSerializationAlgorithmIdentifier.default}`: return Uint8Array.of(SigningSerializationTypeBCH.allOutputsAllUtxos);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsSingleInput}`: return Uint8Array.of(SigningSerializationTypeBCH.allOutputsSingleInput);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsSingleInputInvalidAllUtxos}`: return Uint8Array.of(SigningSerializationFlag.allOutputs | SigningSerializationFlag.singleInput | SigningSerializationFlag.utxos | SigningSerializationFlag.forkId);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutput}`: return Uint8Array.of(SigningSerializationTypeBCH.correspondingOutput);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputAllUtxos}`: return Uint8Array.of(SigningSerializationTypeBCH.correspondingOutputAllUtxos);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputSingleInput}`: return Uint8Array.of(SigningSerializationTypeBCH.correspondingOutputSingleInput);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputSingleInputInvalidAllUtxos}`: return Uint8Array.of(SigningSerializationFlag.correspondingOutput | SigningSerializationFlag.singleInput | SigningSerializationFlag.utxos | SigningSerializationFlag.forkId);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputs}`: return Uint8Array.of(SigningSerializationTypeBCH.noOutputs);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsAllUtxos}`: return Uint8Array.of(SigningSerializationTypeBCH.noOutputsAllUtxos);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsSingleInput}`: return Uint8Array.of(SigningSerializationTypeBCH.noOutputsSingleInput);
		case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsSingleInputInvalidAllUtxos}`: return Uint8Array.of(SigningSerializationFlag.noOutputs | SigningSerializationFlag.singleInput | SigningSerializationFlag.utxos | SigningSerializationFlag.forkId);
		default: return;
	}
};
var compilerOperationHelperComputeSignatureBCH = ({ coveredBytecode, identifier, compilationContext, operationName, privateKey, sha256, sign }) => {
	const [, , algorithm, unknown] = identifier.split(".");
	if (unknown !== void 0) return {
		error: `Unknown component in "${identifier}" - the fragment "${unknown}" is not recognized.`,
		status: "error"
	};
	if (algorithm === void 0) return {
		error: `Invalid signature identifier. Signatures must be of the form: "[variable_id].${operationName}.[signing_serialization_type]".`,
		status: "error"
	};
	const signingSerializationType = getSigningSerializationType(algorithm);
	if (signingSerializationType === void 0) return {
		error: `Unknown signing serialization algorithm, "${algorithm}".`,
		status: "error"
	};
	const serialization = generateSigningSerializationBCH(compilationContext, {
		coveredBytecode,
		signingSerializationType
	}, sha256);
	const digest = hash256(serialization, sha256);
	return {
		bytecode: Uint8Array.from([...sign(privateKey, digest), ...signingSerializationType]),
		signature: { serialization },
		status: "success"
	};
};
var compilerOperationHelperHdKeySignatureBCH = ({ operationName, secp256k1Method }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [
		"entityOwnership",
		"ripemd160",
		"secp256k1",
		"sha256",
		"sha512",
		"variables",
		"sourceScriptIds",
		"unlockingScripts"
	],
	dataProperties: ["hdKeys", "compilationContext"],
	operation: (identifier, data, configuration) => {
		const { hdKeys, compilationContext } = data;
		const { secp256k1, sha256, sourceScriptIds, unlockingScripts } = configuration;
		const derivationResult = compilerOperationHelperDeriveHdKeyPrivate({
			configuration,
			hdKeys,
			identifier
		});
		if (derivationResult.status === "error") return derivationResult;
		const result = compilerOperationHelperGenerateCoveredBytecode({
			configuration,
			data,
			identifier,
			sourceScriptIds,
			unlockingScripts
		});
		if ("error" in result) return result;
		return compilerOperationHelperComputeSignatureBCH({
			compilationContext,
			coveredBytecode: result,
			identifier,
			operationName,
			privateKey: derivationResult.bytecode,
			sha256,
			sign: secp256k1[secp256k1Method]
		});
	}
}));
var compilerOperationHdKeyEcdsaSignatureBCH = compilerOperationHelperHdKeySignatureBCH({
	operationName: "ecdsa_signature",
	secp256k1Method: "signMessageHashDER"
});
var compilerOperationHdKeySchnorrSignatureBCH = compilerOperationHelperHdKeySignatureBCH({
	operationName: "schnorr_signature",
	secp256k1Method: "signMessageHashSchnorr"
});
var compilerOperationHelperKeySignatureBCH = ({ operationName, secp256k1Method }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [
		"sha256",
		"secp256k1",
		"unlockingScripts",
		"sourceScriptIds"
	],
	dataProperties: ["keys", "compilationContext"],
	operation: (identifier, data, configuration) => {
		const { keys, compilationContext } = data;
		const { secp256k1, sha256, unlockingScripts, sourceScriptIds } = configuration;
		const { privateKeys } = keys;
		const [variableId] = identifier.split(".");
		const privateKey = privateKeys === void 0 ? void 0 : privateKeys[variableId];
		if (privateKey === void 0) return {
			error: `Identifier "${identifier}" refers to a Key, but a private key for "${variableId}" (or an existing signature) was not provided in the compilation data.`,
			recoverable: true,
			status: "error"
		};
		const result = compilerOperationHelperGenerateCoveredBytecode({
			configuration,
			data,
			identifier,
			sourceScriptIds,
			unlockingScripts
		});
		if ("error" in result) return result;
		return compilerOperationHelperComputeSignatureBCH({
			compilationContext,
			coveredBytecode: result,
			identifier,
			operationName,
			privateKey,
			sha256,
			sign: secp256k1[secp256k1Method]
		});
	}
}));
var compilerOperationKeyEcdsaSignatureBCH = compilerOperationHelperKeySignatureBCH({
	operationName: "ecdsa_signature",
	secp256k1Method: "signMessageHashDER"
});
var compilerOperationKeySchnorrSignatureBCH = compilerOperationHelperKeySignatureBCH({
	operationName: "schnorr_signature",
	secp256k1Method: "signMessageHashSchnorr"
});
var compilerOperationHelperComputeDataSignatureBCH = ({ data, configuration, identifier, operationName, privateKey, sha256, sign }) => {
	const [, , scriptId, unknown] = identifier.split(".");
	if (unknown !== void 0) return {
		error: `Unknown component in "${identifier}" - the fragment "${unknown}" is not recognized.`,
		status: "error"
	};
	if (scriptId === void 0) return {
		error: `Invalid data signature identifier. Data signatures must be of the form: "[variable_id].${operationName}.[target_script_id]".`,
		status: "error"
	};
	const result = compilerOperationHelperCompileScript({
		configuration,
		data,
		targetScriptId: scriptId
	});
	if (result === false) return {
		error: `Data signature tried to sign an unknown target script, "${scriptId}".`,
		status: "error"
	};
	if ("error" in result) return result;
	const digest = sha256.hash(result);
	return {
		bytecode: sign(privateKey, digest),
		signature: {
			digest,
			message: result
		},
		status: "success"
	};
};
var compilerOperationHelperKeyDataSignatureBCH = ({ operationName, secp256k1Method }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: ["sha256", "secp256k1"],
	dataProperties: ["keys"],
	operation: (identifier, data, configuration) => {
		const { keys } = data;
		const { secp256k1, sha256 } = configuration;
		const { privateKeys } = keys;
		const [variableId] = identifier.split(".");
		const privateKey = privateKeys === void 0 ? void 0 : privateKeys[variableId];
		if (privateKey === void 0) return {
			error: `Identifier "${identifier}" refers to a Key, but a private key for "${variableId}" (or an existing signature) was not provided in the compilation data.`,
			recoverable: true,
			status: "error"
		};
		return compilerOperationHelperComputeDataSignatureBCH({
			configuration,
			data,
			identifier,
			operationName,
			privateKey,
			sha256,
			sign: secp256k1[secp256k1Method]
		});
	}
}));
var compilerOperationKeyEcdsaDataSignatureBCH = compilerOperationHelperKeyDataSignatureBCH({
	operationName: "ecdsa_data_signature",
	secp256k1Method: "signMessageHashDER"
});
var compilerOperationKeySchnorrDataSignatureBCH = compilerOperationHelperKeyDataSignatureBCH({
	operationName: "schnorr_data_signature",
	secp256k1Method: "signMessageHashSchnorr"
});
var compilerOperationHelperHdKeyDataSignatureBCH = ({ operationName, secp256k1Method }) => attemptCompilerOperations([compilerOperationAttemptBytecodeResolution], compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [
		"entityOwnership",
		"ripemd160",
		"secp256k1",
		"sha256",
		"sha512",
		"variables"
	],
	dataProperties: ["hdKeys"],
	operation: (identifier, data, configuration) => {
		const { hdKeys } = data;
		const { secp256k1, sha256 } = configuration;
		const derivationResult = compilerOperationHelperDeriveHdKeyPrivate({
			configuration,
			hdKeys,
			identifier
		});
		if (derivationResult.status === "error") return derivationResult;
		return compilerOperationHelperComputeDataSignatureBCH({
			configuration,
			data,
			identifier,
			operationName,
			privateKey: derivationResult.bytecode,
			sha256,
			sign: secp256k1[secp256k1Method]
		});
	}
}));
var compilerOperationHdKeyEcdsaDataSignatureBCH = compilerOperationHelperHdKeyDataSignatureBCH({
	operationName: "ecdsa_data_signature",
	secp256k1Method: "signMessageHashDER"
});
var compilerOperationHdKeySchnorrDataSignatureBCH = compilerOperationHelperHdKeyDataSignatureBCH({
	operationName: "schnorr_data_signature",
	secp256k1Method: "signMessageHashSchnorr"
});
var compilerOperationSigningSerializationTokenPrefix = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [],
	dataProperties: ["compilationContext"],
	operation: (_, data) => ({
		bytecode: encodeTokenPrefix(data.compilationContext.sourceOutputs[data.compilationContext.inputIndex].token),
		status: "success"
	})
});
var compilerOperationSignatureRenamed = (identifier) => ({
	error: `The "signature" compiler operation was renamed to "ecdsa_signature". Consider fixing this error by changing "${identifier}" to "${identifier.replace("signature", "schnorr_signature")}" (schnorr signatures reduce transaction sizes and enable multi-party signature aggregation).`,
	status: "error"
});
var compilerOperationDataSignatureRenamed = (identifier) => ({
	error: `The "data_signature" compiler operation was renamed to "ecdsa_data_signature". Consider fixing this error by changing "${identifier}" to "${identifier.replace("data_signature", "schnorr_data_signature")}" (schnorr signatures reduce transaction sizes and enable multi-party signature aggregation).`,
	status: "error"
});
var compilerOperationSigningSerializationFullBCH = compilerOperationRequires({
	canBeSkipped: false,
	configurationProperties: [
		"sha256",
		"sourceScriptIds",
		"unlockingScripts"
	],
	dataProperties: ["compilationContext"],
	operation: (identifier, data, configuration) => {
		const [, algorithmOrComponent, unknownPart] = identifier.split(".");
		if (algorithmOrComponent === void 0) return {
			error: `Invalid signing serialization operation. Include the desired component or algorithm, e.g. "signing_serialization.version".`,
			status: "error"
		};
		if (unknownPart !== void 0) return {
			error: `Unknown component in "${identifier}" - the fragment "${unknownPart}" is not recognized.`,
			status: "error"
		};
		const signingSerializationType = getSigningSerializationType(algorithmOrComponent, "full_");
		if (signingSerializationType === void 0) return {
			error: `Unknown signing serialization algorithm, "${algorithmOrComponent}".`,
			status: "error"
		};
		const { sha256, sourceScriptIds, unlockingScripts } = configuration;
		const result = compilerOperationHelperGenerateCoveredBytecode({
			configuration,
			data,
			identifier,
			sourceScriptIds,
			unlockingScripts
		});
		if ("error" in result) return result;
		const { compilationContext } = data;
		return {
			bytecode: generateSigningSerializationBCH(compilationContext, {
				coveredBytecode: result,
				signingSerializationType
			}, sha256),
			status: "success"
		};
	}
});
var compilerOperationsBCH = {
	...compilerOperationsCommon,
	hdKey: {
		data_signature: compilerOperationDataSignatureRenamed,
		ecdsa_data_signature: compilerOperationHdKeyEcdsaDataSignatureBCH,
		ecdsa_signature: compilerOperationHdKeyEcdsaSignatureBCH,
		public_key: compilerOperationsCommon.hdKey.public_key,
		schnorr_data_signature: compilerOperationHdKeySchnorrDataSignatureBCH,
		schnorr_signature: compilerOperationHdKeySchnorrSignatureBCH,
		signature: compilerOperationSignatureRenamed
	},
	key: {
		data_signature: compilerOperationDataSignatureRenamed,
		ecdsa_data_signature: compilerOperationKeyEcdsaDataSignatureBCH,
		ecdsa_signature: compilerOperationKeyEcdsaSignatureBCH,
		public_key: compilerOperationsCommon.key.public_key,
		schnorr_data_signature: compilerOperationKeySchnorrDataSignatureBCH,
		schnorr_signature: compilerOperationKeySchnorrSignatureBCH,
		signature: compilerOperationSignatureRenamed
	},
	signingSerialization: {
		...compilerOperationsCommon.signingSerialization,
		full_all_outputs: compilerOperationSigningSerializationFullBCH,
		full_all_outputs_all_utxos: compilerOperationSigningSerializationFullBCH,
		full_all_outputs_single_input: compilerOperationSigningSerializationFullBCH,
		full_all_outputs_single_input_INVALID_all_utxos: compilerOperationSigningSerializationFullBCH,
		full_corresponding_output: compilerOperationSigningSerializationFullBCH,
		full_corresponding_output_all_utxos: compilerOperationSigningSerializationFullBCH,
		full_corresponding_output_single_input: compilerOperationSigningSerializationFullBCH,
		full_corresponding_output_single_input_INVALID_all_utxos: compilerOperationSigningSerializationFullBCH,
		full_default: compilerOperationSigningSerializationFullBCH,
		full_no_outputs: compilerOperationSigningSerializationFullBCH,
		full_no_outputs_all_utxos: compilerOperationSigningSerializationFullBCH,
		full_no_outputs_single_input: compilerOperationSigningSerializationFullBCH,
		full_no_outputs_single_input_INVALID_all_utxos: compilerOperationSigningSerializationFullBCH,
		token_prefix: compilerOperationSigningSerializationTokenPrefix
	}
};
/**
* Create a compiler using the default BCH compiler configuration.
*
* Internally instantiates the necessary crypto and VM implementations – use
* {@link compilerConfigurationToCompilerBCH} for more control.
*
* @param configuration - a compiler configuration from which properties
* will be used to override properties of the default BCH configuration – must
* include the `scripts` property
*/
var createCompilerBCH = (configuration) => compilerConfigurationToCompilerBCH({
	createAuthenticationProgram: createAuthenticationProgramEvaluationCommon,
	opcodes: generateBytecodeMap(OpcodesBCHCHIPs),
	operations: compilerOperationsBCH,
	ripemd160,
	secp256k1,
	sha256,
	sha512,
	vm: configuration.vm ?? createVirtualMachineBCH(),
	...configuration
});
/**
* Create a BCH `Compiler` from an `WalletTemplate` and an optional set
* of overrides.
* @param template - the `WalletTemplate` from which to create the BCH
* compiler
* @param overrides - a compiler configuration from which properties will be
* used to override properties of the default BCH configuration
*/
var walletTemplateToCompilerBCH = (template, overrides) => createCompilerBCH({
	...overrides,
	...walletTemplateToCompilerConfiguration(template)
});
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/standard/p2pkh.js
/**
* A standard single-factor wallet template that uses
* Pay-to-Public-Key-Hash (P2PKH), the most common authentication scheme in use
* on the network.
*
* This P2PKH template uses BCH Schnorr signatures, reducing the size of
* transactions.
*
* Note, this wallet template uses only a single `Key`. For HD key
* support, see {@link walletTemplateP2pkhHd}.
*/
var walletTemplateP2pkhNonHd = {
	$schema: "https://libauth.org/schemas/wallet-template-v0.schema.json",
	description: "A standard single-factor wallet template that uses Pay-to-Public-Key-Hash (P2PKH), the most common authentication scheme in use on the network.\n\nThis P2PKH template uses BCH Schnorr signatures, reducing the size of transactions.",
	entities: { owner: {
		description: "The individual who can spend from this wallet.",
		name: "Owner",
		scripts: ["lock", "unlock"],
		variables: { key: {
			description: "The private key that controls this wallet.",
			name: "Key",
			type: "Key"
		} }
	} },
	name: "Single Signature (P2PKH)",
	scripts: {
		lock: {
			lockingType: "standard",
			name: "P2PKH Lock",
			script: "OP_DUP\nOP_HASH160 <$(<key.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG"
		},
		unlock: {
			name: "Unlock",
			script: "<key.schnorr_signature.all_outputs>\n<key.public_key>",
			unlocks: "lock"
		}
	},
	supported: [
		"BCH_2020_05",
		"BCH_2021_05",
		"BCH_2022_05"
	],
	version: 0
};
//#endregion
//#region node_modules/@bitauth/libauth/build/lib/compiler/p2pkh-utils.js
var P2pkhUtilityError;
(function(P2pkhUtilityError) {
	P2pkhUtilityError["hdPrivateKeyToP2pkhLockingBytecodeCompilation"] = "P2PKH utility error: could not derive P2PKH locking bytecode from the provided HD private key.";
	P2pkhUtilityError["hdPublicKeyToP2pkhLockingBytecodeCompilation"] = "P2PKH utility error: could not derive P2PKH locking bytecode from the provided HD public key.";
	P2pkhUtilityError["privateKeyToP2pkhLockingBytecodeCompilation"] = "P2PKH utility error: could not derive P2PKH locking bytecode from the provided private key.";
	P2pkhUtilityError["publicKeyToP2pkhLockingBytecodeCompilation"] = "P2PKH utility error: could not derive P2PKH locking bytecode from the provided public key.";
})(P2pkhUtilityError || (P2pkhUtilityError = {}));
/**
* Derive the P2PKH locking bytecode of the provided public key.
*
* Note that this function defaults to throwing an error if provided with an
* invalid public key. To handle errors in a type-safe way, set `throwErrors`
* to `false`.
*
* To derive the resulting CashAddress, use {@link publicKeyToP2pkhCashAddress}.
* For HD public keys, use {@link hdPublicKeyToP2pkhLockingBytecode}. For the
* private key equivalent, see {@link privateKeyToP2pkhLockingBytecode}.
*/
var publicKeyToP2pkhLockingBytecode = ({ publicKey, throwErrors = true }) => {
	const lockingBytecode = walletTemplateToCompilerBCH(walletTemplateP2pkhNonHd).generateBytecode({
		data: { bytecode: { "key.public_key": publicKey } },
		scriptId: "lock"
	});
	if (!lockingBytecode.success) return formatError(P2pkhUtilityError.publicKeyToP2pkhLockingBytecodeCompilation, stringifyErrors(lockingBytecode.errors), throwErrors);
	return lockingBytecode.bytecode;
};
/**
* Derive the P2PKH address of the provided public key.
*
* Note that this function defaults to throwing an error if provided with an
* invalid public key. To handle errors in a type-safe way, set `throwErrors`
* to `false`.
*
* To derive only the locking bytecode, use
* {@link publicKeyToP2pkhLockingBytecode}. For HD public keys, use
* {@link hdPublicKeyToP2pkhCashAddress}. For the private key equivalent,
* see {@link privateKeyToP2pkhCashAddress}.
*/
var publicKeyToP2pkhCashAddress = ({ publicKey, prefix = "bitcoincash", throwErrors = true, tokenSupport = false }) => {
	const bytecode = publicKeyToP2pkhLockingBytecode({
		publicKey,
		throwErrors
	});
	if (typeof bytecode === "string") return formatError(bytecode, void 0, throwErrors);
	return lockingBytecodeToCashAddress({
		bytecode,
		prefix,
		tokenSupport
	});
};
//#endregion
export { binToBase64 as S, bigIntToCompactUint as _, SigningSerializationTypeBCH as a, hexToBin as b, encodeTransaction as c, encodeLockingBytecodeP2sh32 as d, lockingBytecodeToCashAddress as f, utf8ToBin as g, sha256 as h, encodeDataPush as i, hashTransactionUiOrder as l, secp256k1 as m, cashAssemblyToBin as n, generateSigningSerializationBCH as o, hash256 as p, createVirtualMachineBCH as r, decodeTransaction as s, publicKeyToP2pkhCashAddress as t, cashAddressToLockingBytecode as u, binToHex as v, base64ToBin as x, flattenBinArray as y };
