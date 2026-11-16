// @ts-check

/**
 * Cadence Frontend API Client.
 */
export const apiClient = {
  /**
   * Get active schedule metadata.
   */
  async getActivePlan() {
    const res = await fetch("/api/plan");
    if (!res.ok) throw new Error("Failed to fetch active plan");
    return res.json();
  },

  /**
   * Request schedule re-solve.
   * @param {Object} payload
   */
  async solveSchedule(payload) {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to solve schedule");
    return res.json();
  },

  /**
   * Send a natural language What-If inquiry.
   * @param {string} query
   */
  async evaluateWhatIf(query) {
    const res = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("Failed to evaluate what-if scenario");
    return res.json();
  },
};
