import MinHeap from "./structs/MinHeap.js";
import MaxHeap from "./structs/MaxHeap.js";

export function factorialByLoop(number: number) {
  let num = 1n;
  for (let i = 0; i < number; i++) {
    num *= BigInt(number - i);
  }
  return num;
}

export function factorialByReversedArray(number: number) {
  const arr = new Array();
  for (let i = number; i >= 0; i--) arr.push(BigInt(i == 0 ? 1 : i));
  while (arr.length > 1) {
    arr.push(arr.pop() * arr.pop());
  }
  return arr.pop();
}

export function factorialByArray(number: number) {
  const arr = new Array();
  for (let i = 0; i <= number; i++) arr.push(BigInt(i == 0 ? 1 : i));
  while (arr.length > 1) {
    arr.push(arr.pop() * arr.pop());
  }
  return arr.pop();
}

export function factorialByMinHeap(number: number) {
  const heap = new MinHeap();
  for (let i = 0; i <= number; i++) heap.insert(BigInt(i == 0 ? 1 : i));
  while (heap.heap.length > 1) {
    /** @ts-ignore */
    heap.insert(heap.remove() * heap.remove());
  }
  return heap.remove();
}

export function factorialByMaxHeap(number: number) {
  const heap = new MaxHeap();
  for (let i = 0; i <= number; i++) heap.insert(BigInt(i == 0 ? 1 : i));
  while (heap.heap.length > 1) {
    /** @ts-ignore */
    heap.insert(heap.remove() * heap.remove());
  }
  return heap.remove();
}

export function factorialByLoopWithOptionalBigInt(number: number) {
  let num: number | bigint = 1;
  for (let i = 1; i <= number; i++) {
    num =
      typeof num === "bigint"
        ? num * BigInt(i)
        : num * i < Number.MAX_SAFE_INTEGER
        ? num * i
        : BigInt(num) * BigInt(i);
  }
  return num;
}

export function factorialByReversedArrayWithOptionalBigInt(number: number) {
  const arr = new Array();
  for (let i = number; i > 0; i--) arr.push(i);
  arr.push(1);
  while (arr.length > 1) {
    const a = arr.pop();
    const b = arr.pop();
    const a1 = typeof a === "bigint" || typeof b !== "bigint" ? a : BigInt(a);
    const b1 = typeof b === "bigint" || typeof a !== "bigint" ? b : BigInt(b);
    const res = a1 * b1;

    if (typeof res == "bigint") arr.push(res);
    else if (res < Number.MAX_SAFE_INTEGER) arr.push(res);
    else arr.push(BigInt(a1) * BigInt(b1));
  }
  return arr.pop();
}

export function factorialByArrayWithOptionalBigInt(number: number) {
  const arr = new Array();
  arr.push(1);
  for (let i = 0; i <= number; i++) arr.push(i);
  while (arr.length > 1) {
    const a = arr.pop();
    const b = arr.pop();
    const a1 = typeof a === "bigint" || typeof b !== "bigint" ? a : BigInt(a);
    const b1 = typeof b === "bigint" || typeof a !== "bigint" ? b : BigInt(b);
    const res = a1 * b1;

    if (typeof res == "bigint") arr.push(res);
    else if (res < Number.MAX_SAFE_INTEGER) arr.push(res);
    else arr.push(BigInt(a1) * BigInt(b1));
  }
  return arr.pop();
}
export function factorialByMinHeapWithOptionalBigInt(number: number) {
  const heap = new MinHeap();
  heap.insert(1);
  for (let i = 1; i <= number; i++) heap.insert(i);
  while (heap.heap.length > 1) {
    const a = heap.remove();
    const b = heap.remove();
    const a1 = typeof a === "bigint" || typeof b !== "bigint" ? a : BigInt(a);
    const b1 = typeof b === "bigint" || typeof a !== "bigint" ? b : BigInt(b);

    /** @ts-ignore */
    const res = a1 * b1;

    if (typeof res == "bigint") heap.insert(res);
    else if (res < Number.MAX_SAFE_INTEGER) heap.insert(res);
    else heap.insert(BigInt(a1) * BigInt(b1));
  }
  return heap.remove();
}

export function factorialByMaxHeapWithOptionalBigInt(number: number) {
  const heap = new MaxHeap();
  heap.insert(1);
  for (let i = 1; i <= number; i++) heap.insert(i);
  while (heap.heap.length > 1) {
    const a = heap.remove();
    const b = heap.remove();
    const a1 = typeof a === "bigint" || typeof b !== "bigint" ? a : BigInt(a);
    const b1 = typeof b === "bigint" || typeof a !== "bigint" ? b : BigInt(b);

    /** @ts-ignore */
    const res = a1 * b1;

    if (typeof res == "bigint") heap.insert(res);
    else if (res < Number.MAX_SAFE_INTEGER) heap.insert(res);
    else heap.insert(BigInt(a1) * BigInt(b1));
  }
  return heap.remove();
}

const lut = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
export function factorialMix(number: number) {
  if (number <= 10) return lut[number];
  else if (number < 500) return factorialByLoopWithOptionalBigInt(number);
  else if (number < 1000) return factorialByReversedArray(number);
  else if (number < 10000)
    return factorialByReversedArrayWithOptionalBigInt(number);
  else return factorialByMinHeapWithOptionalBigInt(number);
}
