class PriorityQueue {
    constructor(compare) {
        this.compare = compare;
        this.heapArray = [];
        this._limit = 0;
    }
    push(element) {
        this._sortNodeUp(this.heapArray.push(element) - 1);
        return true;
    }
    length() {
        return this.heapArray.length;
    }
    peek() {
        return this.heapArray[0];
    }
    pop() {
        const element = this.heapArray.pop();
        return this.length() > 0 && undefined !== element ? this.replace(element) : element;
    }
    replace(e) {
        const top = this.heapArray[0];
        this.heapArray[0] = e; this._sortNodeDown(0);
        return top;
    }
    size() {
        return this.length();
    }
    _moveNode(from, to) {
        [this.heapArray[from], this.heapArray[to]] = [this.heapArray[to], this.heapArray[from]];
    }
    _sortNodeDown(index) {
        for (let hasChildren = index < this.heapArray.length - 1, current = this.heapArray[index]; hasChildren;) {
            let indices = PriorityQueue.getChildrenIndexOf(index),
                smallestIndex = indices.reduce((e, t) => {
                    if (this.heapArray.length > t && 0 > this.compare(this.heapArray[t], this.heapArray[e])) e = t;
                    return e;
                }, indices[0]),
                smallest = this.heapArray[smallestIndex];
            if (smallest !== undefined && this.compare(current, smallest) > 0) {
                this._moveNode(index, smallestIndex);
                index = smallestIndex;
            } else hasChildren = false;
        }
    }
    _sortNodeUp(index) {
        for (let hasParent = index > 0; hasParent;) {
            let parentIndex = PriorityQueue.getParentIndexOf(index);
            if (parentIndex >= 0 && this.compare(this.heapArray[parentIndex], this.heapArray[index]) > 0) {
                this._moveNode(index, parentIndex);
                index = parentIndex
            } else hasParent = false;
        }
    }
    static getChildrenIndexOf(index) {
        return [2 * index + 1, 2 * index + 2];
    }
    static getParentIndexOf(index) {
        return index <= 0 ? -1 : Math.floor((index - (index % 2 ? 1 : 2)) / 2);
    }
}

export default class Queue {
    constructor(e, t) {
        this.maxConcurrent = e || 1;
        this.minCycle = t || 0;
        this.queueRunning = new Map;
        this.queueWaiting = new PriorityQueue((e, t) => (e.prio - t.prio || e.counter - t.counter));
        this.lastRun = 0;
        this.nextTimer = null;
        this.counter = 0;
    }
    tryRun() {
        for (; this.queueWaiting.size() > 0 && this.queueRunning.size < this.maxConcurrent;) {
            var t = (() => {
                if (Date.now() - this.lastRun < this.minCycle) {
                    if (this.nextTimer === null) this.nextTimer = new Promise((resolve) => setTimeout(() => {
                        this.nextTimer = null;
                        this.tryRun();
                        resolve()
                    }, this.minCycle - Date.now() + this.lastRun))
                    return { v: undefined };
                }
                var t = this.queueWaiting.pop();
                if (t) {
                    let r;
                    if (this.queueRunning.has(t.hash)) throw Error("async-await-queue: duplicate hash " + t.hash);
                    this.queueRunning.set(t.hash, {
                        hash: t.hash,
                        prio: t.prio,
                        finish: {
                            wait: new Promise(e => r = e),
                            signal: r
                        }
                    });
                    this.lastRun = Date.now();
                    t.start.signal();
                }
            })();
            if ("object" === typeof t) return t.v;
        }
    }
    end(e) {
        var t = this.queueRunning.get(e);
        if (!t) throw Error("async-await-queue: queue desync for " + e);
        this.queueRunning.delete(e);
        t.finish.signal();
        this.tryRun();
    }
    async wait(t, r) {
        let signal, wait = new Promise(r => signal = r);
        this.queueWaiting.push({
            hash: t,
            prio: r != null ? r : 0,
            start: { signal, wait },
            counter: this.counter++
        });
        this.tryRun();
        await wait;
        this.lastRun = Date.now();
    }
    run(e, t) {
        let symbol = Symbol();
        return this.wait(symbol, t != null ? t : 0).then(e).finally(() => this.end(symbol));
    }
    stat() {
        return {
            running: this.queueRunning.size,
            waiting: this.queueWaiting.size(),
            last: this.lastRun
        }
    }
    flush(t) {
        return async e => {
            for (; ;) {
                if (this.queueRunning.size > 0 || this.queueWaiting.size() > 0) {
                    const r = this.queueWaiting.peek();
                    if (!(e.t0 = r)) {
                        if (t && this.queueWaiting.size() < t) return;
                        if (!this.queueRunning.size > 0) await this.queueRunning.values().next().value.finish.wait;
                    }
                } else break;
            }
        }
    }
}