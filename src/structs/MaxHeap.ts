class MaxHeap {
  heap: Array<{ data: number | bigint }> = [];

  getLeftChildIndex = (parentIndex: number) => parentIndex * 2 + 1;
  getRightChildIndex = (parentIndex: number) => parentIndex * 2 + 2;
  getParentIndex = (childIndex: number) => Math.floor((childIndex - 1) / 2);

  peek = () => this.heap[0];

  insert = (data: typeof this.heap[0]["data"]) => {
    const node = { data };
    this.heap.push(node);
    this.heapifyUp();
  };

  heapifyUp = () => {
    let index = this.heap.length - 1;
    const lastInsertedNode = this.heap[index];

    // 루트노드가 되기 전까지
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);

      if (this.heap[parentIndex].data < lastInsertedNode.data) {
        this.heap[index] = this.heap[parentIndex];
        index = parentIndex;
      } else break;
    }

    this.heap[index] = lastInsertedNode;
  };

  remove = () => {
    const count = this.heap.length;
    const rootNode = this.heap[0];

    if (count <= 0) return 0;
    if (count === 1) this.heap = [];
    else {
      this.heap[0] = this.heap.pop() as typeof this.heap[0];
      this.heapifyDown();
    }

    return rootNode.data;
  };

  heapifyDown = () => {
    let index = 0;
    const count = this.heap.length;
    const rootNode = this.heap[index];

    while (this.getLeftChildIndex(index) < count) {
      const leftChildIndex = this.getLeftChildIndex(index);
      const rightChildIndex = this.getRightChildIndex(index);

      const smallerChildIndex =
        rightChildIndex < count &&
        this.heap[rightChildIndex].data > this.heap[leftChildIndex].data
          ? rightChildIndex
          : leftChildIndex;

      // 자식 노드의 키 값이 루트노드보다 크다면 위로 끌어올린다.
      if (this.heap[smallerChildIndex].data >= rootNode.data) {
        this.heap[index] = this.heap[smallerChildIndex];
        index = smallerChildIndex;
      } else break;
    }

    this.heap[index] = rootNode;
  };
}

export default MaxHeap;
