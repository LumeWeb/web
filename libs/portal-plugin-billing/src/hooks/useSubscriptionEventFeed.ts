import {
  BillingSSEEventType,
  type BillingSSEEventDataMap,
  type PaymentCompletedEventData,
  type SubscriptionActiveEventData,
  type SubscriptionCreatedEventData,
  type SubscriptionUpdatedEventData,
  type SubscriptionCancelledEventData,
  type PlanChangedEventData,
  type PlanChangeCreditOnlyEventData,
  type PlanChangeZeroAmountEventData,
} from "@/types/subscription";
import { assertNever } from "@/types/subscription";
import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useCapability } from "@lumeweb/portal-framework-core";
import type { Capability } from "@/capabilities/refineConfig";
import { getAuthHeaders } from "./useSubscriptionStatus";
import { createNanoEvents, type Emitter } from "nanoevents";

type SubscriptionEventFeedEvents = {
  [K in BillingSSEEventType]: (data: BillingSSEEventDataMap[K]) => void;
};

export type SubscriptionEventEmitter = Emitter<SubscriptionEventFeedEvents>;

function dispatchSubscriptionEvent(
  emitter: SubscriptionEventEmitter,
  type: BillingSSEEventType,
  data: unknown,
): void {
  switch (type) {
    case BillingSSEEventType.PaymentCompleted:
      emitter.emit(type, data as PaymentCompletedEventData);
      break;
    case BillingSSEEventType.SubscriptionActive:
      emitter.emit(type, data as SubscriptionActiveEventData);
      break;
    case BillingSSEEventType.SubscriptionCreated:
      emitter.emit(type, data as SubscriptionCreatedEventData);
      break;
    case BillingSSEEventType.SubscriptionUpdated:
      emitter.emit(type, data as SubscriptionUpdatedEventData);
      break;
    case BillingSSEEventType.SubscriptionCancelled:
      emitter.emit(type, data as SubscriptionCancelledEventData);
      break;
    case BillingSSEEventType.PlanChanged:
      emitter.emit(type, data as PlanChangedEventData);
      break;
    case BillingSSEEventType.PlanChangedCreditOnly:
      emitter.emit(type, data as PlanChangeCreditOnlyEventData);
      break;
    case BillingSSEEventType.PlanChangedZeroAmount:
      emitter.emit(type, data as PlanChangeZeroAmountEventData);
      break;
    default:
      assertNever(type);
  }
}

export function useSubscriptionEventFeed(): SubscriptionEventEmitter {
  const emitterRef = useRef<SubscriptionEventEmitter>(createNanoEvents<SubscriptionEventFeedEvents>());
  const { data: capability } = useCapability<Capability>("billing:refine-config");

  useEffect(() => {
    const token = capability?.getAuthToken();
    if (!token) return;

    const abortController = new AbortController();

    const baseUrl = capability.getApiUrl();
    if (!baseUrl) return;

    const url = `${baseUrl}/account/billing/subscription/events`;

    fetchEventSource(url, {
      method: "GET",
      headers: {
        ...getAuthHeaders(capability!.getAuthToken()),
        Accept: "text/event-stream",
      },
      signal: abortController.signal,
      async fetch(input, init) {
        const freshHeaders = getAuthHeaders(capability!.getAuthToken());
        init = init || {};
        init.headers = {
          ...init.headers,
          ...freshHeaders,
          Accept: "text/event-stream",
        };
        return fetch(input, init);
      },
      async onopen(response) {
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`SSE auth/client error: ${response.status}`);
        }
        if (!response.ok) {
          console.warn(`SSE server error: ${response.status}, will retry`);
        }
      },
      onmessage(event) {
        // Skip empty events dispatched by SSE comment lines (e.g. ": connected\n\n", ": hb\n\n")
        if (!event.data && !event.event && !event.id) {
          return;
        }
        let parsed: unknown;
        try {
          parsed = event.data ? JSON.parse(event.data) : undefined;
        } catch {
          console.warn("SSE: skipping malformed JSON in event data");
          return;
        }

        const eventType = event.event as BillingSSEEventType;
        if (Object.values(BillingSSEEventType).includes(eventType)) {
          dispatchSubscriptionEvent(emitterRef.current, eventType, parsed);
        }
      },
      onerror(err) {
        if (err instanceof Response || (err && "status" in err)) {
          const status = (err as any).status;
          if (status === 401 || status === 403) {
            throw err;
          }
        }
        console.warn("SSE connection error, will retry:", err);
      },
    }).catch(() => {
      // Connection closed or aborted — expected on unmount
    });

    return () => {
      abortController.abort();
    };
  }, [capability]);

  return emitterRef.current;
}
