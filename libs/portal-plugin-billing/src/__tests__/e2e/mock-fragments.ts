// Dummy Script/HTML/Fragment Generators for Billing E2E Tests
// Self-contained inline JS fragments that simulate Stripe and Atlos payment UIs

import type { CheckoutUIFragment } from "@/types/subscription";

// ============================================================================
// Dummy SVG for Gateway Logos
// ============================================================================

export const DUMMY_GATEWAY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect width="40" height="40" fill="#6366f1" rx="4"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">GW</text>
</svg>`;

// ============================================================================
// Stripe Checkout Fragments
// ============================================================================

/**
 * Creates Stripe-style checkout fragments with iframe + script
 * The dummy script renders a fake payment form inside the iframe
 */
export function createStripeCheckoutFragments(sessionId: string): CheckoutUIFragment[] {
  const css = `
    .stripe-dummy-container { padding: 20px; font-family: -apple-system, sans-serif; }
    .stripe-dummy-card { border: 1px solid #e0e0e0; padding: 12px; margin: 10px 0; border-radius: 4px; }
    .stripe-dummy-input { width: 100%; padding: 8px; margin: 4px 0; border: 1px solid #ccc; border-radius: 4px; }
    .stripe-dummy-button { background: #635bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 12px; }
    .stripe-dummy-button:hover { background: #4f49c8; }
    .stripe-dummy-error { color: #ff5252; margin-top: 8px; display: none; }
  `;

  const html = `
    <div class="stripe-dummy-container">
      <h3>Stripe Checkout (Test)</h3>
      <div class="stripe-dummy-card">
        <label>Card Number</label>
        <input type="text" class="stripe-dummy-input" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242" readonly />
        <div style="display: flex; gap: 10px;">
          <div style="flex: 1;">
            <label>Expiry</label>
            <input type="text" class="stripe-dummy-input" placeholder="12/30" value="12/30" readonly style="width: 100%;" />
          </div>
          <div style="flex: 1;">
            <label>CVC</label>
            <input type="text" class="stripe-dummy-input" placeholder="123" value="123" readonly style="width: 100%;" />
          </div>
        </div>
      </div>
      <button class="stripe-dummy-button" id="stripe-pay-btn">Pay Now</button>
      <div class="stripe-dummy-error" id="stripe-error"></div>
    </div>
  `;

  const script = `
    (function() {
      const sessionId = "${sessionId}";
      const payBtn = document.getElementById('stripe-pay-btn');
      const errorDiv = document.getElementById('stripe-error');

      if (!payBtn) {
        console.error('[Stripe Dummy] Pay button not found');
        return;
      }

      payBtn.addEventListener('click', function() {
        // Simulate processing
        payBtn.textContent = 'Processing...';
        payBtn.disabled = true;

        // Simulate async processing
        setTimeout(function() {
          // Dispatch paymentCompleted event to parent window
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'checkout_complete', sessionId: sessionId }, '*');
          }

          // Also dispatch window event for components listening on window
          window.dispatchEvent(new CustomEvent('paymentCompleted', {
            bubbles: true,
            detail: null  // Per spec: sessionId comes from checkout data, not event
          }));

          // Success UI
          payBtn.textContent = 'Payment Complete!';
          payBtn.style.background = '#00c853';
        }, 500);
      });

      // Handle cancel/close
      const keydownHandler = function(e) {
        if (e.key === 'Escape') {
          window.dispatchEvent(new CustomEvent('paymentCanceled', { bubbles: true }));
        }
      };
      document.addEventListener('keydown', keydownHandler);

      // Register cleanup for event listener
      if (!window.__PAYMENT_CLEANUP) window.__PAYMENT_CLEANUP = [];
      window.__PAYMENT_CLEANUP.push(function() {
        document.removeEventListener('keydown', keydownHandler);
      });
    })();
  `;

  return [
    { type: "css", css },
    { type: "html", html },
    { type: "script", script },
  ];
}

/**
 * Creates Stripe 3DS redirect checkout fragments
 * Simulates the redirect flow for 3D Secure authentication
 */
export function createStripe3DSFragments(sessionId: string, redirectUrl: string): CheckoutUIFragment[] {
  const script = `
    (function() {
      const sessionId = "${sessionId}";
      const redirectUrl = "${redirectUrl}";

      // Show 3DS challenge UI
      const container = document.createElement('div');
      container.id = '3ds-challenge-container';
      container.innerHTML = \`
        <div style="padding: 20px; font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h3>3D Secure Authentication (Test)</h3>
          <p>Simulating 3DS authentication flow...</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
            <p>🔒 Secure authentication required</p>
            <button id="auth-btn" style="background: #635bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">
              Authenticate
            </button>
          </div>
        </div>
      \`;
      document.body.appendChild(container);

      // Register cleanup so test isolation removes injected DOM
      if (!window.__PAYMENT_CLEANUP) window.__PAYMENT_CLEANUP = [];
      window.__PAYMENT_CLEANUP.push(function() {
        var el = document.getElementById('3ds-challenge-container');
        if (el) el.remove();
      });

      document.getElementById('auth-btn').addEventListener('click', function() {
        const authBtn = document.getElementById('auth-btn');
        authBtn.textContent = 'Authenticating...';
        authBtn.disabled = true;

        // Simulate 3DS completion — navigate back via history.push
        // (not window.location redirect, which would destroy the SPA)
        setTimeout(function() {
          // Dispatch a redirect event that the test setup listens for
          // to perform an in-app navigation via React Router's history
          window.dispatchEvent(new CustomEvent('checkout3DSRedirect', {
            bubbles: true,
            detail: {
              sessionId: sessionId,
              redirectUrl: redirectUrl
            }
          }));

          authBtn.textContent = 'Authenticated!';
          authBtn.style.background = '#00c853';
        }, 500);
      });
    })();
  `;

  return [{ type: "script", script }];
}

/**
 * Creates Stripe Customer Portal redirect fragment
 */
export function createStripePortalRedirectFragment(portalUrl: string): CheckoutUIFragment[] {
  return [
    {
      type: "link",
      link: portalUrl,
    },
    {
      type: "script",
      script: `
        (function() {
          // Auto-redirect to customer portal after short delay
          setTimeout(function() {
            window.open("${portalUrl}", "_blank");
          }, 100);
        })();
      `,
    },
  ];
}

// ============================================================================
// Atlos Checkout Fragments
// ============================================================================

/**
 * Creates Atlos-style checkout fragments with HTML + script
 * The dummy script simulates the Atlos popup widget behavior
 */
export function createAtlosCheckoutFragments(sessionId: string): CheckoutUIFragment[] {
  const css = `
    .atlos-dummy-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .atlos-dummy-modal { background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%; font-family: system-ui, sans-serif; }
    .atlos-dummy-header { margin-bottom: 16px; }
    .atlos-dummy-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
    .atlos-dummy-button { background: #0066ff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 16px; }
    .atlos-dummy-button.cancel { background: #f0f0f0; color: #333; margin-top: 8px; }
    .atlos-dummy-button:hover { opacity: 0.9; }
  `;

  const html = `
    <div class="atlos-dummy-overlay" id="atlos-overlay">
      <div class="atlos-dummy-modal">
        <div class="atlos-dummy-header">
          <h3>Atlos Payment (Test)</h3>
          <p>Complete your payment through Atlos</p>
        </div>
        <div class="atlos-dummy-row">
          <span>Amount</span>
          <strong>$10.00 USD</strong>
        </div>
        <button class="atlos-dummy-button" id="atlos-pay-btn">Pay with Atlos</button>
        <button class="atlos-dummy-button cancel" id="atlos-cancel-btn">Cancel</button>
      </div>
    </div>
  `;

  const script = `
    (function() {
      const sessionId = "${sessionId}";

      function closeModal() {
        const overlay = document.getElementById('atlos-overlay');
        if (overlay) {
          overlay.remove();
        }
      }

      // Register cleanup so test isolation removes injected DOM
      if (!window.__PAYMENT_CLEANUP) window.__PAYMENT_CLEANUP = [];
      window.__PAYMENT_CLEANUP.push(function() {
        var el = document.getElementById('atlos-overlay');
        if (el) el.remove();
      });

      const payBtn = document.getElementById('atlos-pay-btn');
      const cancelBtn = document.getElementById('atlos-cancel-btn');

      if (payBtn) {
        payBtn.addEventListener('click', function() {
          payBtn.textContent = 'Processing...';
          payBtn.disabled = true;

          setTimeout(function() {
            closeModal();

            // Dispatch events
            if (window.parent !== window) {
              window.parent.postMessage({ type: 'checkout_complete', sessionId: sessionId }, '*');
            }

            window.dispatchEvent(new CustomEvent('paymentCompleted', {
              bubbles: true,
              detail: null
            }));
          }, 500);
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
          closeModal();
          window.dispatchEvent(new CustomEvent('paymentCanceled', { bubbles: true }));
        });
      }

      // Close on overlay click
      const overlay = document.getElementById('atlos-overlay');
      if (overlay) {
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) {
            closeModal();
            window.dispatchEvent(new CustomEvent('paymentCanceled', { bubbles: true }));
          }
        });
      }
    })();
  `;

  return [
    { type: "css", css },
    { type: "html", html },
    { type: "script", script },
  ];
}

// ============================================================================
// Generic Fragment Generators
// ============================================================================

/**
 * Creates a simple redirect fragment
 */
export function createRedirectFragment(url: string, label: string = "Continue"): CheckoutUIFragment[] {
  const html = `
    <div style="padding: 20px; text-align: center;">
      <p>You will be redirected to complete this action.</p>
      <a href="${url}" id="redirect-link" style="display: inline-block; background: #635bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 12px;">${label}</a>
    </div>
  `;

  const script = `
    (function() {
      // Auto-click after short delay for testing
      setTimeout(function() {
        const link = document.getElementById('redirect-link');
        if (link && window.__autoRedirect !== false) {
          link.click();
        }
      }, 100);
    })();
  `;

  return [
    { type: "html", html },
    { type: "script", script },
  ];
}

/**
 * Creates a form fragment for POST-based checkout flows
 */
export function createFormFragment(
  action: string,
  fields: Array<{ name: string; value: string; type?: string }>,
  submitLabel: string = "Submit",
): CheckoutUIFragment[] {
  const fieldInputs = fields
    .map((f) => `<input type="${f.type || "hidden"}" name="${f.name}" value="${f.value}" />`)
    .join("\n");

  const html = `
    <form id="checkout-form" action="${action}" method="POST" style="padding: 20px;">
      ${fieldInputs}
      <button type="submit" style="background: #635bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">${submitLabel}</button>
    </form>
  `;

  return [{ type: "form", html }];
}

/**
 * Creates an iframe fragment for embedded checkout
 */
export function createIframeFragment(src: string): CheckoutUIFragment[] {
  return [
    {
      type: "iframe",
      link: src,
    },
  ];
}

/**
 * Creates a button fragment
 */
export function createButtonFragment(
  label: string,
  onClickHandler: string,
  style?: Record<string, string>,
): CheckoutUIFragment[] {
  const defaultStyle = {
    background: "#635bff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    ...style,
  };

  const styleString = Object.entries(defaultStyle)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v}`)
    .join("; ");

  const script = `
    (function() {
      const handler = ${onClickHandler};
      document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'dummy-button') {
          handler();
        }
      });
    })();
  `;

  const html = `<button id="dummy-button" style="${styleString}">${label}</button>`;

  return [
    { type: "html", html },
    { type: "script", script },
  ];
}

// ============================================================================
// Error Fragments
// ============================================================================

/**
 * Creates an error display fragment
 */
export function createErrorFragment(message: string): CheckoutUIFragment[] {
  const html = `
    <div style="padding: 20px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; color: #c53030;">
      <h4 style="margin-top: 0;">Error</h4>
      <p>${message}</p>
    </div>
  `;

  const script = `
    (function() {
      window.dispatchEvent(new CustomEvent('paymentError', {
        bubbles: true,
        detail: { error: "${message.replace(/"/g, '\\"')}" }
      }));
    })();
  `;

  return [
    { type: "html", html },
    { type: "script", script },
  ];
}

// ============================================================================
// Test Helper Fragments
// ============================================================================

/**
 * Creates a fragment that dispatches a specific event after a delay
 * Useful for testing async payment flows
 */
export function createDelayedEventFragment(
  eventType: "paymentCompleted" | "paymentCanceled" | "paymentError",
  delayMs: number = 1000,
  detail?: Record<string, unknown>,
): CheckoutUIFragment[] {
  const detailJson = detail ? JSON.stringify(detail) : "null";

  const script = `
    (function() {
      setTimeout(function() {
        window.dispatchEvent(new CustomEvent("${eventType}", {
          bubbles: true,
          detail: ${detailJson}
        }));
      }, ${delayMs});
    })();
  `;

  return [{ type: "script", script }];
}

/**
 * Creates a fragment sequence (for testing fragment queue)
 */
export function createFragmentQueueTest(sequence: string[]): CheckoutUIFragment[] {
  return sequence.map((content, index) => ({
    type: "html" as const,
    html: `<div id="fragment-${index}" data-sequence="${content}">Fragment ${index}: ${content}</div>`,
  }));
}
