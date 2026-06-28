import { describe, it, expect } from "vitest";
import {
  pickAutoLayout,
  resolveLayout,
  LAYOUT_INLINE_MAX,
  LAYOUT_SINGLE_MAX
} from "../src/layout";

describe("pickAutoLayout", () => {
  it("uses width for the bar orientation", () => {
    expect(pickAutoLayout("bar", LAYOUT_INLINE_MAX - 1, 9999)).toBe("inline");
    expect(pickAutoLayout("bar", LAYOUT_INLINE_MAX, 9999)).toBe("single");
    expect(pickAutoLayout("bar", LAYOUT_SINGLE_MAX - 1, 9999)).toBe("single");
    expect(pickAutoLayout("bar", LAYOUT_SINGLE_MAX, 9999)).toBe("multi");
  });

  it("uses height for the column orientation", () => {
    expect(pickAutoLayout("column", 9999, LAYOUT_INLINE_MAX - 1)).toBe("inline");
    expect(pickAutoLayout("column", 9999, LAYOUT_SINGLE_MAX - 1)).toBe("single");
    expect(pickAutoLayout("column", 9999, LAYOUT_SINGLE_MAX)).toBe("multi");
  });
});

describe("resolveLayout", () => {
  it("falls back to auto when mode is undefined or auto", () => {
    expect(resolveLayout(undefined, "bar", 200, 200)).toBe("inline");
    expect(resolveLayout("auto", "bar", 800, 600)).toBe("multi");
  });

  it("honours explicit modes regardless of size", () => {
    expect(resolveLayout("inline", "bar", 9999, 9999)).toBe("inline");
    expect(resolveLayout("single", "bar", 9999, 9999)).toBe("single");
    expect(resolveLayout("multi", "bar", 10, 10)).toBe("multi");
  });
});
