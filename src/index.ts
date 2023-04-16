import BenchMark from "benchmark";
import {
  factorialByLoop,
  factorialByLoopWithOptionalBigInt,
  factorialByArray,
  factorialByArrayWithOptionalBigInt,
  factorialByReversedArray,
  factorialByReversedArrayWithOptionalBigInt,
  factorialByMinHeap,
  factorialByMinHeapWithOptionalBigInt,
  factorialByMaxHeap,
  factorialByMaxHeapWithOptionalBigInt,
  factorialMix,
} from "./functions";

function test(N: number) {
  return new Promise((resolve) => {
    console.log(`\n\nrunning N=${N}`);
    const suite = new BenchMark.Suite();
    suite
      .add("loop", () => factorialByLoop(N))
      .add("loop & optional bigint", () => factorialByLoopWithOptionalBigInt(N))
      .add("array", () => factorialByArray(N))
      .add("array & optional bigint", () =>
        factorialByArrayWithOptionalBigInt(N)
      )
      .add("reversed-array", () => factorialByReversedArray(N))
      .add("reversed-array & optional bigint", () =>
        factorialByReversedArrayWithOptionalBigInt(N)
      )
      .add("min-heap", () => factorialByMinHeap(N))
      .add("min-heap & optional bigint", () =>
        factorialByMinHeapWithOptionalBigInt(N)
      )
      .add("max-heap", () => factorialByMaxHeap(N))
      .add("max-heap & optional bigint", () =>
        factorialByMaxHeapWithOptionalBigInt(N)
      )
      .add("mix", () => factorialMix(N))
      .on("cycle", function (event: Event) {
        console.log(String(event.target));
      })
      .on("complete", resolve)
      .run({ async: true });
  });
}
(async () => {
  for (let i = 0; i < 5; i++) {
    await test(Math.pow(10, i));
  }

  for (let i = 2; i <= 10; i++) {
    await test(i * 10000);
  }
})();
