import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isAdminUnlocked,
  setAdminUnlocked,
  clearAdminUnlock,
} from "./adminSession.js";

describe("adminSession", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("returns false when not unlocked", () => {
    expect(isAdminUnlocked()).toBe(false);
  });

  it("returns true after setAdminUnlocked", () => {
    setAdminUnlocked(60);
    expect(isAdminUnlocked()).toBe(true);
  });

  it("clears unlock state", () => {
    setAdminUnlocked(60);
    clearAdminUnlock();
    expect(isAdminUnlocked()).toBe(false);
  });
});
