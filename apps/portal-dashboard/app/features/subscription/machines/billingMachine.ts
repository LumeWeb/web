import { createMachine, state, transition, reduce, Transition } from "robot3";
import { createUseMachine } from "robot-hooks";
import { useEffect, useState } from "react";

import { BillingInfo, BillingErrors } from "../types/billing.types";

// Context just holds the data
export interface BillingContext {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
}

// Events define allowed transitions
export type BillingEvent =
  | { type: "EDIT" }
  | { type: "VALIDATE"; billing: BillingInfo }
  | { type: "VALIDATED" }
  | { type: "INVALID"; errors: BillingErrors }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "FAILED"; error: Error };

// States define the machine structure
export interface BillingStates {
  idle: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  editing: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  validating: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  saving: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  complete: {
    final: true;
    transitions: Map<string, Array<Transition<string>>>;
  };
  error: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
}

const createTransitionMap = (transitions: Record<string, string[]>) => {
  const map = new Map<string, Array<Transition<string>>>();
  Object.entries(transitions).forEach(([event, states]) => {
    map.set(
      event,
      states.map((state) => ({
        from: "", // Will be set by Robot3
        to: state,
        guards: [],
        reducers: [(ctx: BillingContext) => ctx],
      })),
    );
  });
  return map;
};

export const billingMachine = createMachine<
  BillingStates,
  BillingContext,
  string
>(
  {
    idle: {
      final: false,
      transitions: createTransitionMap({
        EDIT: ["editing"],
      }),
    },

    editing: {
      final: false,
      transitions: createTransitionMap({
        VALIDATE: ["validating"],
      }),
    },

    validating: {
      final: false,
      transitions: createTransitionMap({
        VALIDATED: ["saving"],
        INVALID: ["editing"],
      }),
    },

    saving: {
      final: false,
      transitions: createTransitionMap({
        SAVED: ["complete"],
        FAILED: ["error"],
      }),
    },

    complete: {
      final: true,
      transitions: createTransitionMap({
        EDIT: ["editing"],
      }),
    },

    error: {
      final: false,
      transitions: createTransitionMap({
        EDIT: ["editing"],
      }),
    },
  },
  () => ({
    billing: null,
    errors: null,
    error: null,
  }),
);
