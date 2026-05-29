import { describe, expect, it } from "vitest";
import { haversineKm } from "@/lib/continuity/distance";

describe("haversineKm", () => {
  it("calculates an approximate distance between Ciudad de Mexico and Tokio", () => {
    const distance = haversineKm(
      { latitude: 19.4326, longitude: -99.1332 },
      { latitude: 35.6762, longitude: 139.6503 },
    );

    expect(Math.round(distance)).toBeGreaterThan(11000);
    expect(Math.round(distance)).toBeLessThan(11600);
  });
});
