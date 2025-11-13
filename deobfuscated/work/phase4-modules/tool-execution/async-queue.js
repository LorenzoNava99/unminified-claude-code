/**
 * AsyncQueue - Async Iterator Implementation
 *
 * A queue that implements the async iterator protocol, allowing
 * values to be enqueued and consumed asynchronously.
 *
 * This is used by the tool execution engine to stream results
 * from async tool operations.
 *
 * Original location: line 357541
 * Original name: AsyncQueue (already well-named)
 */

/**
 * AsyncQueue class - implements async iterator for streaming tool execution results
 *
 * Features:
 * - Implements Symbol.asyncIterator for for-await-of loops
 * - Supports enqueueing values that may arrive before or after consumption
 * - Handles completion with done()
 * - Supports error propagation with error()
 * - One-time iteration (can only be iterated once)
 *
 * @example
 * const queue = new AsyncQueue();
 *
 * // Producer
 * setTimeout(() => {
 *   queue.enqueue("value1");
 *   queue.enqueue("value2");
 *   queue.done();
 * }, 100);
 *
 * // Consumer
 * for await (const value of queue) {
 *   console.log(value); // "value1", "value2"
 * }
 */
class AsyncQueue {
  /**
   * Optional callback to invoke when return() is called
   * @type {Function|undefined}
   */
  returned;

  /**
   * Internal queue for values that arrive before consumers are ready
   * @type {Array}
   */
  queue = [];

  /**
   * Resolver function for pending read promise
   * @type {Function|undefined}
   */
  readResolve;

  /**
   * Rejector function for pending read promise
   * @type {Function|undefined}
   */
  readReject;

  /**
   * Whether the queue has been marked as done
   * @type {boolean}
   */
  isDone = false;

  /**
   * Error to be thrown on next iteration
   * @type {Error|undefined}
   */
  hasError;

  /**
   * Whether iteration has started (enforces single iteration)
   * @type {boolean}
   */
  started = false;

  /**
   * Creates a new AsyncQueue
   *
   * @param {Function} [returnedCallback] - Optional callback invoked when return() is called
   */
  constructor(returnedCallback) {
    this.returned = returnedCallback;
  }

  /**
   * Implements async iterator protocol
   *
   * @returns {AsyncQueue} - Returns itself as the iterator
   * @throws {Error} - If the queue has already been iterated
   */
  [Symbol.asyncIterator]() {
    if (this.started) {
      throw Error("Stream can only be iterated once");
    }
    this.started = true;
    return this;
  }

  /**
   * Gets the next value from the queue
   *
   * Returns immediately if values are queued, otherwise waits for enqueue/done/error.
   *
   * @returns {Promise<IteratorResult>} - Promise resolving to {done, value}
   */
  next() {
    // If values are queued, return immediately
    if (this.queue.length > 0) {
      return Promise.resolve({
        done: false,
        value: this.queue.shift()
      });
    }

    // If marked as done, signal completion
    if (this.isDone) {
      return Promise.resolve({
        done: true,
        value: undefined
      });
    }

    // If error occurred, reject
    if (this.hasError) {
      return Promise.reject(this.hasError);
    }

    // Wait for next enqueue/done/error
    return new Promise((resolve, reject) => {
      this.readResolve = resolve;
      this.readReject = reject;
    });
  }

  /**
   * Adds a value to the queue
   *
   * If a consumer is waiting (readResolve exists), fulfills the promise immediately.
   * Otherwise, queues the value for later consumption.
   *
   * @param {*} value - The value to enqueue
   */
  enqueue(value) {
    if (this.readResolve) {
      // Consumer is waiting, fulfill immediately
      const resolve = this.readResolve;
      this.readResolve = undefined;
      this.readReject = undefined;
      resolve({
        done: false,
        value: value
      });
    } else {
      // No consumer waiting, queue the value
      this.queue.push(value);
    }
  }

  /**
   * Marks the queue as done (no more values will be enqueued)
   *
   * If a consumer is waiting, signals completion immediately.
   */
  done() {
    this.isDone = true;
    if (this.readResolve) {
      const resolve = this.readResolve;
      this.readResolve = undefined;
      this.readReject = undefined;
      resolve({
        done: true,
        value: undefined
      });
    }
  }

  /**
   * Signals an error occurred during production
   *
   * If a consumer is waiting, rejects the promise immediately.
   * Otherwise, stores the error to be thrown on next iteration.
   *
   * @param {Error} err - The error that occurred
   */
  error(err) {
    this.hasError = err;
    if (this.readReject) {
      const reject = this.readReject;
      this.readResolve = undefined;
      this.readReject = undefined;
      reject(err);
    }
  }

  /**
   * Implements async iterator return() method
   *
   * Called when iteration is terminated early (e.g., break, return, throw).
   * Invokes the optional returned callback if provided.
   *
   * @returns {Promise<IteratorResult>} - Promise resolving to done state
   */
  return() {
    this.isDone = true;
    if (this.returned) {
      this.returned();
    }
    return Promise.resolve({
      done: true,
      value: undefined
    });
  }
}

module.exports = {
  AsyncQueue
};
