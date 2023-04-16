# 이진 트리를 통한 빠른 팩토리얼 구현 모델 분석

## 서론

백준 문제 중 모든 브론즈5 문제를 풀고 딱 하나, [27434번 팩토리얼 3](https://www.acmicpc.net/problem/27434) 문제가 남아있었다.
이전 문제였던 [27433번 팩토리얼 2](https://www.acmicpc.net/problem/27433) 문제와 비슷해서 *아 이거 BigInt면 끝나겠네*라고 간과하며 풀었으나 **시간 초과**로 퇴짜맞았다!

![시간초과!](https://velog.velcdn.com/images/sharlotte_04/post/01ab18a1-aeab-4b0b-9f68-c685ae5ae1a7/image.png)

왜그런지 문제를 다시 읽어보니 10만 팩토리얼을 4초 안에 계산해야 하는 문제였던 것이다.
주변인들에게 물어봐도 *어 팩토리얼? big integer면 되겠네* 라는 답변만 들을 수 있었다.
왜냐하면 이 문제는 실제로 **pypy3로 쉽게 풀 수 있기 때문이다**.

| ![팩토리얼함수로](https://velog.velcdn.com/images/sharlotte_04/post/855284a5-3287-478d-b2b4-33c6b30401ba/image.png) | ![for문으로](https://velog.velcdn.com/images/sharlotte_04/post/a3ff938b-de89-4af0-a30c-9a9a0978153e/image.png) |
|--|--|
| 팩토리얼 함수를 쓰든 | 직접 for문으로 하든 |

상관없이 모두 시간초과 없이 정답 처리가 된다. 놀랍게도 **pypy3은 정답 언어의 높은 비율을 차지하고 있다**.

정답 799개 중

* 710개가 pypy3로 구성된 코드다. (**88.8%**)
* 10개가 cpp로 구성된 코드다. (1.2%)
* 29개가 java/kotlin로 구성된 코드다. (3.6%)
* 20개가 go로 구성된 코드다. (2.5%)
* 18개가 rust로 구성된 코드다. (2.2%, 그런데 2명이 여러번 제출했다)
* 6개가 ruby로 구성된 코드다. (0.7%)
* 1개가 swift 구성된 코드다. (0.1%)
* 1개가 node.js로 구성된 코드다. (**0.1%**)

이러한 기형적인 비율엔 이유가 있으니...

![백준인터뷰](https://velog.velcdn.com/images/sharlotte_04/post/7ce5a3fb-55c8-4fa6-83d1-7f32de1d7ce3/image.png)

**애당초 의도된 일**이였던 것이다!

그래서 pypy3에 굴복하고 끝내도 되지만 node.js로 끝까지 밀어붙여놓고 포기하는건 너무 억울했다. 그래서 가장 최근의 자바 제출을 보니 **PriorityQueue**를 사용하고 있던 것이다. ~~언어 치트라니~~

> **처음에 이 글의 목적은 PriorityQueue의 이해였으나 후술할 PriorityQueue가 보여주는 기형적인 성능을 탐구하면서 주제가 바뀌었다.**
>
> PriorityQueue에 대한 설명은 그대로 두겠지만 글 전체의 흐름을 재구성할 생각이다.
가설이 성립되고 파괴될 때마다 글을 편집하면서 전체적인 흐름을 망가트렸기 때문이다. 그래서 과감히 재구성하는 결정을 내렸다.

## 왜 더 빠른가

를 알기 전에 몇가지 정리가 필요하다.

1. **개념 정리** - 아래의 벤치마킹에서 사용할 함수는 총 5개이므로 이를 설명하고 시간복잡도와 함께 설명할 예정이다.
2. **벤치마킹** - 벤치마킹은 일종의 성능 테스트 실험이다. 그러므로 몇가지 변인을 설정해야 한다.
  a. 통제변인: 입출력
  b. 조작변인: 자료구조

## 개념 정리

벤치마킹에서 사용할 방법을 알기 전에 이해해야 할 것이 있다.
팩토리얼 벤치마킹에서 사용할 방법은 총 다섯개로, **반복문**, **배열**, **반전된 배열**, **최소 힙**, **최대 힙**이 있다. 순서대로 설명하겠다.

### BigInt: JS의 BigInt 폴리필 분석 - JSBI

BigInt는 일반적으로 number 자료형이 담을 수 있는 상한선을 넘겨버린 **매우 큰 수**를 처리하기 위한 자료형이다. 자바스크립트에서 BigInt가 어떻게 동작하는지 알기 위하여 몇가지 조사와 분석을 해보았다.

그러기 위해서 JSBI를 접했는데, [JSBI](https://github.com/GoogleChromeLabs/jsbi/)는 **J**ava**S**cript **B**ig**I**nteger의 Polyfill이다. JSBI의 설명을 보면 자신들이 만든 `JSBI` 클래스가 ES2020에 있는 BigInt 내용이라고 설명한다.
> JSBI is a pure-JavaScript implementation of the [ECMAScript BigInt proposal](https://tc39.es/proposal-bigint/), which officially became a part of the JavaScript language in ES2020.   
JSBI는 ES2020에서 공식적으로 자바스크립트 언어의 일부가 된 ECMAScript BigInt 제안을 순수 자바스크립트로 구현한 것입니다.

JSBI 클래스를 처음 보면 바로 알 수 있는 점은 **배열이다!** 추가적으로 조사해보면 정말 많은 곳에서 Big Integer를 **자릿수 단위의 배열로 구현**하는걸 적지않게 볼 수 있다.

|![](https://velog.velcdn.com/images/sharlotte_04/post/ed99be3e-eed0-49fe-bdb0-9b41c24d9313/image.png)|
|-|

JSBI의 곱셈 구현 코드는 아래와 같은데 ~~전문가~~의 도움으로 이것이 다항식의 곱 구현방식인 FFT와 카라추바 중 카라추바 알고리즘을 사용했단 사실을 알 수 있었다.

|![](https://velog.velcdn.com/images/sharlotte_04/post/9cfdb736-cc77-48c4-9e30-2c3457fd228e/image.png)|![](https://velog.velcdn.com/images/sharlotte_04/post/170ee179-5b7a-446b-a8e7-5f6914081788/image.png)|
|--|--|

더 자세한 확답을 받기 위해 ChatGPT에게 물어보면 카라추바 알고리즘이나 톰-쿡 알고리즘을 사용한다고 말한다.
![](https://velog.velcdn.com/images/sharlotte_04/post/f41e9f70-d8ff-4674-a050-6e7565f480a9/image.png)

또한 [톰 쿡 알고리즘 wikipidia](https://www.wikiwand.com/ko/%ED%86%B0-%EC%BF%A1_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)와 [카라슈바 알고리즘 wikipidia](https://www.wikiwand.com/ko/%EC%B9%B4%EB%9D%BC%EC%8A%88%EB%B0%94_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98) 위키피디아 문서와, [medium - A fast BigInt.js in an evening, compiling C++ to JavaScript](https://medium.com/leaningtech/a-fast-bigint-js-in-an-evening-compiling-c-to-javascript-db61ae733512) 블로그의 `Test & benchmark` 문단 끝자리에서 카라슈바와 톰-쿡 알고리즘이 언급되고 그 특성을 설명한다.

> [톰 쿡 알고리즘 wikipidia](https://www.wikiwand.com/ko/%ED%86%B0-%EC%BF%A1_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)
이런 부가적인 연산 때문에 톰-쿡 알고리즘은 *작은 정수의 곱셈에 적용하면 일반 곱셈법보다 느려지기에* 이 알고리즘은 적당히 큰 정수에 사용되며, 정수 크기가 훨씬 더 커질 경우는 시간복잡도가 Θ(n log n log log n)인 쇤하게-슈트라센 알고리즘이 더 빠르게 된다.
> [카라슈바 알고리즘 wikipidia](https://www.wikiwand.com/ko/%EC%B9%B4%EB%9D%BC%EC%8A%88%EB%B0%94_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)
충분히 큰 n에 대해, 카라추바 알고리즘은 고전적인 곱셈법보다 적은 횟수의 시프트 연산과 한 자리 곱셈을 행한다. *하지만 작은 n에 대하여는 추가적인 덧셈과 시프트 연산 때문에 고전적인 곱셈법보다 속도가 느려진다.* 그 경계는 컴퓨터의 플랫폼에 따라 달라진다. 대략적으로 곱하는 수가 2320 ≈ 2×1096 이상일 때 카라추바 알고리즘이 더 빠르다.
> [medium - A fast BigInt.js in an evening, compiling C++ to JavaScript](https://medium.com/leaningtech/a-fast-bigint-js-in-an-evening-compiling-c-to-javascript-db61ae733512)
The results is a 5771 line of generated JavaScript code, comprising Karatsuba’s and Toom-Cook’s algorithm for fast multiplications, usable freely for any (not) so serious scope.
그 결과 5771줄의 자바스크립트 코드가 생성되며, 이 코드에는 Karatsuba와 Toom-Cook의 빠른 곱셈을 위한 알고리즘이 포함되어 있으며, 그다지 심각하지 않은 범위에서 자유롭게 사용할 수 있습니다.

이를 통해 얻은 정보를 정리하자면 아래와 같다.

* **JavaScript의 BigInt는 자릿수 배열을 가지고 큰 수를 표현하도록 구현됐으며 큰 수의 곱셈에 카라슈바와 톰-쿡 알고리즘이 사용되었다.**
* **BigInt의 곱셈은 작은 수에 사용할수록 비효율적이다.**

> 자릿수 배열을 통해 어떻게 큰 수를 표현했을까?
단순히 12345678910 숫자를 [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] 과 같이 자릿수 단위로 배열에 나눠담은 것이다. 이를 숫자로 되돌린다면 예전 초중학교에서 했듯이 [1, 2]를 1 \* 10 + 2하는 과정이 필요하므로 정리하자면 Σ(index \* 10 ^ length-index-1) 인걸 알 수 있다.
문제는 이렇게 숫자로 표현할 수 없어서 배열을 통해 다항식처럼 표현한 상태에서 곱셈을 한다면 우리가 직접 다항식의 곱을

### 시간 복잡도

### 반복문

가장 처음에 백준에 제출한 문제의 핵심 함수다.

```js
function factorialByLoop(number) {
  let num = 1n;
  for (let i = 0; i < number; i++) {
    num *= BigInt(number - i);
  }
  return num;
}
```

정석대로 n \* ... \* (n - i) 의 형태인 단순 반복문의 흐름이다.

## PriorityQueue는 무엇인가?

PriorityQueue는 Heap에 기반한 **우선순위 큐**다. 일반적인 선입선출 구조인 Queue와 달리 Priority Queue는 아이템이 들어오고 나갈 때마다 우선순위에 따라 재배치되는 특징이 있다. 그래서 큐에 값들을 넣고 최솟값 또는 최댓값을 빠르게 꺼내고 싶을 때 유용하다.

### min-heap/max-heap이란?

min-heap/max-heap는 heap의 일종이며 완전 이진 트리의 일종이다. 경우에 따라 불완전이 있지만 이번껀 완전하다. min-heap는 우선순위가 낮은 순서로, max-heap는 높은 순서로 가지가 뻗어나간다. [최소 값과 최대 값을 빠르게 찾을 수 있게 도와주는 힙(Heap) - evan-moon](https://evan-moon.github.io/2019/10/12/introduction-data-structure-heap/)

## PriorityQueue는 왜 factorial 연산에서 이점을 취하는가?

PriorityQueue가 factorial 연산에서 반복문에 비해 이점을 취할 땐 Heap로 구현되었을 때밖에 없다. [[주의] 왜 우선순위 큐는 배열이나 연결리스트로 구현하지 않을까?](https://chanhuiseok.github.io/posts/ds-4/) 이런 이유에서 아래에선 Heap에 대해서만 이야기할 예정인데, Heap로 PriorityQueue를 구현할 수 있던 방법은 Heap가 인덱스 규칙성을 가지기 때문이다.
![](https://velog.velcdn.com/images/sharlotte_04/post/752cece1-8cbf-4576-a1f2-4b67a9ab56c9/image.png)

[출처: https://develop-dream.tistory.com/91](https://develop-dream.tistory.com/91)

### PriorityQueue를 사용한 연산은 어떻게 이뤄지는가?

새 코드는 아래와 같다.

```js
function factorial(number) {
  const heap = new PriorityQueue();
  for (let i = 0; i <= number; i++) heap.enqueue(BigInt(i == 0 ? 1 : i));
  while (heap.heap.length > 1) {
    heap.enqueue(heap.dequeue().data * heap.dequeue().data);
  }
  return heap.dequeue().data;
}
```

PriorityQueue는 직접 javascript에서 구현한 Heap로 구현한 클래스다.

이 함수는 **0부터 n까지의 모든 숫자를 BigInt로 만들어 힙에 넣고 힙의 내용물이 하나가 될 때까지 최솟값을 두번 꺼내어 서로 곱하고 넣기**를 수행한다.

### PriorityQueue가 이 문제에서 시사하는 점

### 배열의 개형

![](https://velog.velcdn.com/images/sharlotte_04/post/665b3896-a7de-4cff-8664-5f19c0c8361f/image.png)

배열은 일반적으로  정렬 여부에 따라 삽입과 삭제에 대한 시간복잡도가 제각각이다.
![](https://velog.velcdn.com/images/sharlotte_04/post/ed607d4d-6346-4dd8-a4f3-1c201cee6ab0/image.png)
그러나 O(n)이 O(n)인 이유는 대개 중간 삽입 및 삭제를 worst case로 상정해두고 생각해서인데, 위 개형에 따르면 그런 일이 일어나지 않고 **끝부분에서만 작업이 이뤄**지므로 삽입과 삭제가 O(1)임을 알 수 있다.

> ???: 반복문 꺼내놓고 갑자기 웬 배열?
사실 배열이나 반복문이나 결과적으로 O(n)인건 맞으나 자료구조 관점에서 비교할려면 배열이 적절했기에 대체한 것이다. 실제로 벤치마킹 비교를 보면 0.2ms로 별차이 없긴 했었다.

### min-heap의 개형

![](https://velog.velcdn.com/images/sharlotte_04/post/4bfe2aa1-fb09-4fe6-995b-0d985ece5017/image.png)

PriorityQueue를 사용한 `factorial` 함수에서 `number`에 10을 넣었다고 쳤을 때 while 반목문이 한번 동작할 때의 min-heap 흐름은 위 사진과 같다.

첫번째와 두번째 회색 그룹에서, 함수 `dequeue`가 호출되어 가장 위에 있는 **최솟값**이 뽑혀나가고 마지막에 있던 값이 최솟값의 자리로 대체된 다음 **min-heap의 규칙에 따라 재조정**된다. 이땐 자신 아래에 자신보다 적은 수가 없어야 하므로 재조정 과정에선 자신보다 낮은 수를 찾아 자기 자리(index)와 바꿔치는 작업을 보이는 낮은 수가 없을 때까지 한다.

세번째 회색 그룹에서, 함수 `enqueue`가 호출되어 주어진 값이 트리의 가장 아래에 주입되고 다시 **min-heap의 규칙에 따라 재조정**된다. 이땐 자신 위에 자신보다 큰 수가 없어야 하므로 큰 수가 없을 때까지 부모와 자리(index)를 교체한다.

두 함수에서 흥미로운 점은 초록색 박스, 즉 **탐색된 아이템이 한 가지(branch)** 에 불과하단 점이다. 즉, **모든 아이템이 탐색되는게 아님** 이 이 Heap가 취할 수 있는 최대 장점이다. 그럼 BigO를 알아봐야 하는데...

### min-heap는 왜 O(log N)일까?

시간 복잡도엔 [여러 측정법](https://www.geeksforgeeks.org/types-of-asymptotic-notations-in-complexity-analysis-of-algorithms/)이 있지만 한가질 뽑자면 worst case, 즉 최악의 가정에서의 시간 복잡도를 기준으로 삼는 Big-O가 있다. 이러한 빅-오 기준에 따르면 위 min-heap의 `dequeue` 함수에서 최악은 첫번째 회색 그룹, 최악이 아님은 두번째 회색 그룹이라 볼 수 있겠다. 아무튼 최악의 개형을 보자면 **최악의 경우인 트리의 끝에 도달**하는건, 즉 **트리의 높이가 곧 시간복잡도**임을 알 수 있다. 그러므로 O(높이)이라 단정지을 수 있으나 BigO 표기법에선 N 하나만 유효하므로 높이를 N으로 계산해야 한다.

이때 logN이 등장한다.
> 참고: 컴퓨터 과학에서의 logN은 **대개 밑이 2인 로그**를 뜻한다.
이진적인게 많아서 밑을 2로 두고 사용하는 경향이 생긴 듯 하다. 햇갈릴 여지가 있어서 `lb`를 대신 쓰기도 한다.
BigO 표기법의 log는 밑이 2이므로 유의하자.

층마다 2개씩 갈려나가고 거기서 각 끝부분이 2배로 늘어나는 모습은 2^(높이) 인걸 추측하게 만들어준다. (2 -> 4 -> 8 -> 16) `총량 = 2^높이`임을 알았으니 높이가 `log2총량`임을 알 수 있다. 팩토리얼 함수에서 트리의 총량은 트리의 최댓값이며 최댓값은 곧 주어진 수와 같으니 높이는 `log2N`이다. 이걸 BigO에 맞춰 바꾸면 `logN`이니 결론적으로 **min-heap의 BigO 시간복잡도는 `O(logN)`**이라 말할 수 있다.

### 벤치마킹: 각 함수의 시간복잡도

<details>
<summary>벤치마킹 소스코드 열람하기</summary>

  <img src="https://velog.velcdn.com/images/sharlotte_04/post/838098fe-2b6f-4a4b-b44b-b07a32871154/image.png" />

</details>

결과는 아래와 같다.
![](https://velog.velcdn.com/images/sharlotte_04/post/e03ad322-5584-444b-8f44-25f90eb56612/image.png)

`factorial` 함수는 PriorityQueue(Min-Heap)를 사용한 방법이고 `factorial2`는 배열을 사용한 방법이다. 이게 얼마나 큰 차이인지 계산해보면...
![](https://velog.velcdn.com/images/sharlotte_04/post/71c1cb24-9c5c-4153-b79b-b085bf3c2d24/image.png)
효율이 거의 **1750%** 이나 차이나는걸 볼 수 있다. 왜 시간초과 문제가 확실히 해결되었는지 납득이 가는 부분이다.

참고로 두 함수의 시간복잡도는 N번 순회했으니 `O(N)` vs `O(logN)`이다...?

## 결론

1. 일반적인 반복문보다 Heap가 더 빠르다.
2. 왜냐하면 반복문은 O(N)인 것에 비해 Heap는 O(logN)이기 때문이다.
3. 왜 Heap가 O(logN)이냐면 최악의 경우가 트리의 끝에 도달했을 때, 즉 트리의 높이, 즉 총량인 N의 로그이기 때문이다.

## 짜잔! 사실 속으신 거에요

![](https://velog.velcdn.com/images/sharlotte_04/post/d253c935-bd99-40ba-ac75-6a607313f5a8/image.png)

Heap의 개념과 PriorityQueue의 놀라움에 빠져들어 가장 중요했던 팩토리얼 함수를 빼먹었다. 다시 그 함수를 꺼내서 앞서 학습한 개념을 대입해보자.

```js
function factorialByArray(number) {
  const arr = new Array();
  for (let i = 0; i <= number; i++) arr.push(BigInt(i == 0 ? 1 : i));
  while (arr.length > 1) {
    arr.push(arr.pop() * arr.pop());
  }
  return arr.pop();
}

function factorialByHeap(number) {
  const queue = new PriorityQueue();
  for (let i = 0; i <= number; i++) queue.enqueue(BigInt(i == 0 ? 1 : i));
  while (queue.heap.length > 1) {
    queue.enqueue(queue.dequeue() * queue.dequeue());
  }
  return queue.dequeue();
}
```

위와 같이 팩토리얼의 알고리즘 단계는 총 4가지로 분류할 수 있다.

1. 선언
2. 초기화 (0~n 담기)
3. 연산 (둘 꺼내서 곱하고 하나 넣기)
4. 반환 (나머지 하나 넘기기)

이를 BigO에 맞춰 말하자면

||`factorialByArray`|`factorialByHeap`|
|-----|:--:|:-------:|
|선언  |O(1)|O(1)     |
|초기화|O(N)|O(NlogN) |
|연산  |O(3N)|O(3NlogN)|
|반환  |O(1)|O(1)     |

선언 - 단순히 만드는거니 둘 다 상수 복잡도다.
초기화 - 배열에 `push`하는건 O(1)이니 N번 반복하여 O(N), 그리고 앞서 말했듯이 Heap의 insert는 logN이니 N번 반복하여 O(NlogN).
연산 - 두번 꺼내어서 한번 넣는거니 3 \* O(1), 그걸 N번 반복하면 O(3N). Heap도 똑같이 3 \* O(logN)를 N번하니 O(3NlogN)이다.
반환 - 단순히 넘기는거니 역시나 상수 복잡도다.

이를 정리해서 말하자면 `factorialByArray` vs `factorialByHeap` 두 함수의 시간복잡도는
**`O(N)` vs `O(NlogN)`**.
그러므로 `factorialByArray`가 응당 더 빨라야 한다.

그러니 윗 문단에서 말한

> 참고로 두 함수의 시간복잡도는 N번 순회했으니 `O(N)` vs `O(logN)`이다...?

는 **틀렸다.**  `O(logN)`가 아니라 `O(NlogN)` 이여야 한다.

![](https://velog.velcdn.com/images/sharlotte_04/post/8831ba65-e248-42f5-a362-cdf587da1d60/image.png)
Big-O 표기법의 그래프를 보면 O(NlogN)과 O(N)는 무시할 수 없는 차이를 지닌걸 볼 수 있다. 그러나 실제 밴치마킹을 보자면
![](https://velog.velcdn.com/images/sharlotte_04/post/cf995155-92f8-42a3-86cd-b6b041f1c3a9/image.png)
도저히 납득할 수 없는 차이다. **대혼돈이다!**

### 의심: 사실 자바스크립트의 배열은 근본 배열이 아니다?

[자바스크립트 배열은 배열이 아니다](https://poiemaweb.com/js-array-is-not-arrray), [StackOverflow 답변](https://stackoverflow.com/a/9338040/19561566)에선 자바스크립트의 배열은 C와 같은 dense array(메모리가 연속적인)가 아닌 **spharse array**(메모리가 연속적이지 않은)로써 **hash table를 기반**으로 두고 있다고 한다.
![](https://velog.velcdn.com/images/sharlotte_04/post/78beadb2-87ea-42ea-a4f0-25d2248e62a7/image.png)

실제로 ChatGPT에게 물어보면 이와 같이 답변하며 첫번째 링크의 블로그 끝부분 테스트에서도 `[]`와 `{}`에서 배열 인덱스를 키로 두고 제어했을 때의 속도 차이를 설명하고 있다.

### 의심: 사실 배열이 느린거다?

![](https://velog.velcdn.com/images/sharlotte_04/post/80383267-9c7b-405f-b5e6-e563b2622b08/image.png)
위 의문에 따르면 자바스크립트의 배열은 hash table이란 소린데 hash table 자체의 공간 복잡도는 전부 O(n)이므로 개발자가 기대했던 성능의 n의 곱절은 더 느려져버리는 것이다. 그래서 엔진과 런타임에서 이러한 구조적인 문제를 해결하여 O(1)로 만든 것 같다.

[StackOverflow 답변](https://stackoverflow.com/a/22615787/19561566), [medium - Time Complexities Of Common Array Operations In JavaScript](https://medium.com/@ashfaqueahsan61/time-complexities-of-common-array-operations-in-javascript-c11a6a65a168) 그리고 [dev - Time complexity Big 0 for Javascript Array methods and examples](https://dev.to/lukocastillo/time-complexity-big-0-for-javascript-array-methods-and-examples-mlg) 와 같은 여러 개발 블로그 및 커뮤니티에서 공통적으로 **array의 `push`와 `pop`은 `O(1)`의 시간 복잡도**를 가지고 있다고 말한다.

자바스크립트의 배열이 근본은 아니지만 시간복잡도 관점에선 피차일반으로 별 상관이 없음을 알 수 있다.

### 반전: 애초에 문제는 힙이다

만약 배열이 문제가 아니라면? 단순히 반복문으로 밴치마킹을 다시 실험해보자. 반복문은 명실상부 직관적이고 확실한 O(N)이다.

```js
function factorialByLoop(number) {
  let num = 1n;
  for (let i = 0; i < number; i++) {
    num *= BigInt(number - i);
  }
  return num;
}
```

위 코드의 결과는 아래와 같다.
![](https://velog.velcdn.com/images/sharlotte_04/post/a8f39455-336d-4d8d-8d42-d1b44674063c/image.png)

놀랍다. 0.3s정도의 차이가 있지만 5초대라는 점은 배열과 별 차이가 없어보인다. 결국 핵심 맥락인 O(N) VS 힙은 여전히 유효하단 것이다. 그러므로 문제는 *힙이 왜이리 빠른가*, 정확힌 **PriorityQueue가 비정상적으로 빠른 이유는 무엇인가?** 이다.

#### side note: 다른 언어도 똑같다

서론에 언급된 질문글들을 다시 자세히 보자면...
![](https://velog.velcdn.com/images/sharlotte_04/post/d40aeed8-6681-4406-ba95-152082c73e2c/image.png)
놀랍게도 C#에서 비슷한 시간을 소비한 것을 알 수 있다.

![](https://velog.velcdn.com/images/sharlotte_04/post/44bfd68f-3466-4987-a111-0ff35ef23394/image.png)
자바도 똑같다. BigInt를 써도 근본적으로 O(N = 100,000)이 4초를 초과한 바람에 시간초과가 터져버린거다.

## 다시, 그래서 왜 더 빠른가?

앞선 과정을 통해 PriorityQueue의 구조를 이해했고 그것이 Heap로 구현됐을 때 logN의 시간복잡도를 가져 O(N)보다 빠른것을 이해했을 것이다. 그러나 이것의 비교군은 O(N)이 아닌 O(1)인게 문제다. 이걸 N번 반복하여 PQ(PriorityQueue)가 O(NlogN)이 되어도 비교군 역시 O(N)이 되기 때문에 통제변인인 반복은 무관하다. 조작변인인 PQ가 원인이고 핵심이다. 늘 그래왔으나 다시 재자리로 돌아온 셈이다.

### 원인 발견: 반복문과 PQ의 효율비는 일정하지 않다

![](https://velog.velcdn.com/images/sharlotte_04/post/f1374003-d321-435a-bfd8-3bfb4b919535/image.png)

우연히 테스트를 하다가 발견한 놀라운 사실. N이 100일땐 오히려 heap으로 했을 때가 **단순 반복문보다 더 느렸다!** 10000을 기점으로 반전 그래프가 그려질 것 같아 1, 10, 100, 1000, 1000, 10000, 20000 ~ 100000 까지의 데이터를 추합하여 선 그래프를 그려보니 아래와 같았다.

![](https://velog.velcdn.com/images/sharlotte_04/post/99fa1c92-15f0-4c7e-971b-7875e2dbb103/image.png)

그래프를 보아하니 **처음엔 Heap의 효율이 좋지 않다가 어느순간을 넘으니 효율이 눈에 띄게 좋아진걸** 볼 수 있다.

### 원인 추측: BigInt의 곱연산 비용은 유의미할지도 모른다

반례로, 비교적 비용이 싼 BigInt의 합연산은 비싸지 않으므로 해당 함수에 \* 대신 \+를 사용하면 가속화 현상이 일어나지 않아 시간복잡도에 따라 반복문 또는 배열이 항상 빠를 것이다.

그리고 실제로 실험을 해보면 덧셈에선 Heap 연산이 반복문보다 항상 더 느린것을 볼 수 있다.

그렇다면 작은 수들끼리 곱하면 효율이 높은 이유는 BigInt인 두 수 A, B를 곱한 연산에서 O(N)의 둘중 뭐가 더 짧든 긴 놈이 *최악의 케이스*니깐 N은 max(logA, logB) 일 것이기 때문이다. 이에 따르면 수가 클수록 시간이 더 오래걸리니 차라리 작은 수들끼리 따로 곱하여 효율을 높이는게 옳다는 결론으로 도달한다. **이건 NlogN 복잡도를 가진 PQ 팩토리얼이 N 복잡도를 가진 단순 반복문을 압도할 수 있었던 이유다.**

그러나 이에 덧붙여 **작은 수들끼리 *먼저* 곱하여 cpu 가속화를 유도한다**라는 주장도 있었는데 이에 대한 반례 실험을 할 필요가 있다. 그냥 단순히 min-heap가 아닌 max-heap를 구현하여 벤치마킹을 실험해보면 알 수 있을것이다.

## 결론

BigInt 분석에서 각 팩토리얼 함수들에 사용된 BigInt의 곱이 카라슈바와 톰-쿡 알고리즘으로 구성되어 단기적으로 더 느리고 장기적으로 더 빠르단것을 알 수 있었고 첫번째 추측과의 연관성을 밝혀냈다. 알고리즘에 따라 작은 수들끼리 곱하는게 효율이 높다는 점을 추론해냈다.

**PriorityQueue가 큰 수의 팩토리얼 연산에 유리한 이유는 작은 수들끼리 먼저 곱함으로써 연산 비용을 최소화했고 Heap를 사용함으로써 탐색 비용을 최소화했기 때문**이라 할 수 있겠다.

## 소감

* 최하위 등급의 문제에서 이러한 개념을 깨달은건 굉장히 드문 경험이다.
* 솔직히 이런 노가다 하면서 자료구조를 익힐 줄은 몰랐고 꽤나 놀라웠다.
* 이진트리는 내 생각 이상으로 놀라운 효율성을 지니고 있었다. 혁신적이다.
* 성능보고 벤치마킹해야지 하고 안하는 일이 부지기수했는데 실제로 해보니 재밌었고 흥미로웠다. 추상이 아닌 실체를 보고 본질을 이해하는 과정은 절대 이상적인게 아니였다. 실현 가능한 일이다.
* 팩토리얼 해결법에 subfactorial이나 다른 방법들도 있어보이는데 나중에 여유가 생기면 이것도 다시 봐야겠다.
* 주변인에 따르면 이정도면 플레티넘에 갈법한 것이라 하던데 체감상 골드 내지 실버감인 것 같다. 그런데 다시보니깐 플레티넘이 맞는것 같다.
* 하루종일 여러 사람들과 토론해가며 쓴 글이다. 이를 통해 커피 약 2.5L가 증발했으며 시간 약 18시간이 소요되었다.
* 안타깝지만 정답을 찾지는 못했다. 정답을 찾을려면 BigInt의 구현 원리를 분석해야 하는데 체력의 한계로 불가능할 것 같아 아쉽다. 그래도 가장 가깝고 신빙성있는 이론을 얻어서 기쁘다. 많이
* 아래 출처 및 참고 문단은 이 글을 쓰면서 이해 및 인용 목적으로 조회한 글들의 목록이다. 직접 가서 읽어보는것도 나쁘지 않다고 생각한다.

## 출처 & 참고

[27434번 팩토리얼 3](https://www.acmicpc.net/problem/27434)
[[주의] 왜 우선순위 큐는 배열이나 연결리스트로 구현하지 않을까?](https://chanhuiseok.github.io/posts/ds-4/)
[Priority Queue(우선 순위 큐), Heap(Max Heap, Min Heap)](https://develop-dream.tistory.com/91)
[최소 값과 최대 값을 빠르게 찾을 수 있게 도와주는 힙(Heap) - evan-moon](https://evan-moon.github.io/2019/10/12/introduction-data-structure-heap/)
[시간 복잡도 BigO](https://velog.io/@iberis/%EC%8B%9C%EA%B0%84-%EB%B3%B5%EC%9E%A1%EB%8F%84-BigO)
[직접 만든 분석 다이어그램](https://drive.google.com/file/d/19gqGbSttMrG3fNNEsaLeXv8iUL90O2Ro/view?usp=sharing)
[자바스크립트 배열은 배열이 아니다](https://poiemaweb.com/js-array-is-not-arrray)
[StackOverflow - Are JavaScript Arrays actually implemented as arrays?](https://stackoverflow.com/a/9338040/19561566)
[geeks for geeks - Types of Asymptotic Notations in Complexity Analysis of Algorithms](https://www.geeksforgeeks.org/types-of-asymptotic-notations-in-complexity-analysis-of-algorithms/)
[StackOverflow - JavaScript runtime complexity of Array functions](https://stackoverflow.com/a/22615787/19561566)
[medium - Time Complexities Of Common Array Operations In JavaScript](https://medium.com/@ashfaqueahsan61/time-complexities-of-common-array-operations-in-javascript-c11a6a65a168)
[dev - Time complexity Big 0 for Javascript Array methods and examples](https://dev.to/lukocastillo/time-complexity-big-0-for-javascript-array-methods-and-examples-mlg)
[Hash Table wikiwand](https://www.wikiwand.com/en/Hash_table)
[StackOverflow - Hashmaps and Time Complexity [closed]](https://stackoverflow.com/questions/65941724/hashmaps-and-time-complexity)
[medium - A fast BigInt.js in an evening, compiling C++ to JavaScript](https://medium.com/leaningtech/a-fast-bigint-js-in-an-evening-compiling-c-to-javascript-db61ae733512)
[톰 쿡 알고리즘 wikipidia](https://www.wikiwand.com/ko/%ED%86%B0-%EC%BF%A1_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)
[카라슈바 알고리즘 wikipidia](https://www.wikiwand.com/ko/%EC%B9%B4%EB%9D%BC%EC%8A%88%EB%B0%94_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)
[JSBI](https://github.com/GoogleChromeLabs/jsbi/)
[ECMAScript BigInt proposal](https://tc39.es/proposal-bigint/)
