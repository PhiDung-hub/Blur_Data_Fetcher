export function tokenIdToBytes32(tokenId: number): `0x${string}` {
  const hexValue = parseInt(tokenId.toString()).toString(16).padStart(64, "0");
  return `0x${hexValue}`
}

export function bytes32ToInt24(hexString: string) {
  const int24HexString = hexString.slice(-6);
  return (parseInt(int24HexString, 16) << 8) >> 8
}

export function bytes32ToAddress(bytes32: string): `0x${string}` {
  return `0x${bytes32.slice(24)}`
}

/**
 * @warn WARNING: overflow can happen, use `bytes32ToBigint` for guaranteed safety.
 * */
export function bytes32ToNumber(bytes32: string): number | null {
  const bigInteger = BigInt(`0x${bytes32}`);
  const numberValue = Number(bigInteger);

  return Number.isSafeInteger(numberValue) ? numberValue : null
}

export function bytes32ToBigint(bytes32: string): bigint {
  return BigInt(`0x${bytes32}`)
}

export function toBytes32(s: string): `0x${string}` {
  return `0x${s.padStart(64, '0')}`
}

export async function assertWrapper(resolve: Promise<any>, errMsg: string) {
  return resolve.then((data) => {
    if (data === null || data === undefined) {
      throw new Error(errMsg)
    }
    return data;
  });
}

export function formatISOString(isoString: string) {
  return isoString.replace('T', ' ').replace('Z', ' UTC');
}
