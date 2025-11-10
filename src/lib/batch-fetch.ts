/**
 * Batch multiple API requests into a single request
 * Reduces network overhead and improves performance
 */

interface BatchRequest {
  endpoint: string;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}

class BatchFetcher {
  private queue: BatchRequest[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private readonly delay = 50; // ms to wait before batching

  /**
   * Add a request to the batch queue
   */
  fetch<T>(endpoint: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ endpoint, resolve, reject });
      this.scheduleBatch();
    });
  }

  /**
   * Schedule batch execution
   */
  private scheduleBatch() {
    if (this.timeout) return;

    this.timeout = setTimeout(() => {
      this.executeBatch();
      this.timeout = null;
    }, this.delay);
  }

  /**
   * Execute the batched requests
   */
  private async executeBatch() {
    if (this.queue.length === 0) return;

    const requests = [...this.queue];
    this.queue = [];

    // Group by base URL for efficiency
    const grouped = new Map<string, BatchRequest[]>();
    
    requests.forEach(req => {
      const base = req.endpoint.split('?')[0];
      if (!grouped.has(base)) {
        grouped.set(base, []);
      }
      grouped.get(base)!.push(req);
    });

    // Execute each group
    for (const [base, reqs] of grouped.entries()) {
      try {
        // For now, execute them in parallel
        // In a real implementation, you might want to use a batch API endpoint
        const results = await Promise.all(
          reqs.map(req => fetch(req.endpoint).then(r => r.json()))
        );

        reqs.forEach((req, i) => {
          req.resolve(results[i]);
        });
      } catch (error) {
        reqs.forEach(req => req.reject(error));
      }
    }
  }
}

// Singleton instance
export const batchFetcher = new BatchFetcher();

/**
 * Prefetch multiple resources in parallel
 */
export async function prefetchResources(urls: string[]): Promise<void> {
  await Promise.allSettled(
    urls.map(url => 
      fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }).catch(() => null)
    )
  );
}
