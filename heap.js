class MaxHeap {
    constructor() {
        this.heap = [];
    }

    insert(note) {
        this.heap.push(note);
        this.bubbleUp(this.heap.length - 1);
    }

    bubbleUp(index) {
        if(index === 0) return;
        const parent = Math.floor((index - 1) / 2);
        if(this.heap[index].priority > this.heap[parent].priority) {
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            this.bubbleUp(parent);
        }
    }

    extractMax() {
        if(this.heap.length === 0) return null;
        const max = this.heap[0];
        const end = this.heap.pop();
        if(this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return max;
    }

    sinkDown(index) {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let largest = index;

        if(left < this.heap.length && this.heap[left].priority > this.heap[largest].priority)
            largest = left;
        if(right < this.heap.length && this.heap[right].priority > this.heap[largest].priority)
            largest = right;

        if(largest !== index) {
            [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
            this.sinkDown(largest);
        }
    }
}
