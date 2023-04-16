console.time("1 * 10000000000000 done");
for (let i = 0; i < 1000000; i++) 1 * 10000000000000;
console.timeEnd("1 * 10000000000000 done");
console.time("1n * 10000000000000n done");
for (let i = 0; i < 1000000; i++) 1n * 10000000000000n;
console.timeEnd("1n * 10000000000000n done");
console.time("10000000000000n * 10000000000000n done");
for (let i = 0; i < 1000000; i++) 10000000000000n * 10000000000000n;
console.timeEnd("10000000000000n * 10000000000000n done");
console.time("1 * 1 done");
for (let i = 0; i < 1000000; i++) 1 * 1;
console.timeEnd("1 * 1 done");
console.time("1n * 1n done");
for (let i = 0; i < 1000000; i++) 1n * 1n;
console.timeEnd("1n * 1n done");
console.time("1812841821959n * 1812841821958n done");
for (let i = 0; i < 1000000; i++) 1812841821959n * 1812841821958n;
console.timeEnd("1812841821959n * 1812841821958n done");
console.time("1812841821959 * 1812841821958 done");
for (let i = 0; i < 1000000; i++) 1812841821959 * 1812841821958;
console.timeEnd("1812841821959 * 1812841821958 done");

function test(N: bigint, ii: number) {
  console.time(`${N}n * ${BigInt(N) + BigInt(Math.pow(10, ii))}n done`);
  for (let i = 0; i < 100000; i++) N * (BigInt(N) + BigInt(Math.pow(10, ii)));
  console.timeEnd(`${N}n * ${BigInt(N) + BigInt(Math.pow(10, ii))}n done`);
}

for (let i = 0; i < 5; i++) test(1000n, i);
