import { expect, test } from "vitest";
import { toDotNotationObject } from "../helpers";

test("toDotNotationObject", () => {
  expect(toDotNotationObject({ a: { b: { c: 1 } } })).toEqual({
    "a.b.c": 1,
  });
});
