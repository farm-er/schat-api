const TestSequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends TestSequencer {
  async sort(tests) {
    return tests.sort((a, b) => {
      if (a.path.includes("register.test.ts")) return -1; // Register runs first
      if (b.path.includes("register.test.ts")) return 1;
      return a.path.localeCompare(b.path); // Keep other tests in order
    });
  }
}

module.exports = CustomSequencer;


