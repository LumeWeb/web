/** Shared-access denial must come from the expected metadata request, not a transport failure. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isSharedObjectDenial } from "./denial.ts";

const endpoint = "https://indexer.example.invalid/api/";
const objectId = "a".repeat(64);
const url = `${endpoint}shared/objects/${objectId}`;

for (const status of [401, 403, 404]) {
  await test(`HTTP ${status} for the private shared-object request proves denial`, () => {
    assert.equal(
      isSharedObjectDenial({ method: "GET", status, url }, endpoint, objectId),
      true,
    );
  });
}

for (const { name, response } of [
  {
    name: "a missing HTTP response",
    response: { method: "GET", status: 0, url },
  },
  {
    name: "successful metadata",
    response: { method: "GET", status: 200, url },
  },
  { name: "a server failure", response: { method: "GET", status: 500, url } },
  { name: "a non-GET request", response: { method: "POST", status: 404, url } },
  {
    name: "another origin",
    response: {
      method: "GET",
      status: 404,
      url: `https://other.example.invalid/api/shared/objects/${objectId}`,
    },
  },
  {
    name: "another object",
    response: {
      method: "GET",
      status: 404,
      url: `${endpoint}shared/objects/${"b".repeat(64)}`,
    },
  },
  {
    name: "the wrong API path",
    response: {
      method: "GET",
      status: 404,
      url: `https://indexer.example.invalid/wrong/shared/objects/${objectId}`,
    },
  },
  {
    name: "a malformed URL",
    response: { method: "GET", status: 404, url: "private-value" },
  },
]) {
  await test(`${name} does not prove denied shared access`, () => {
    assert.equal(isSharedObjectDenial(response, endpoint, objectId), false);
  });
}
