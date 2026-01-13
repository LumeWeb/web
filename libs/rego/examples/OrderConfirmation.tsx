/**
 * Example: Order Confirmation Email Template
 *
 * Demonstrates more advanced usage including:
 * - GoWith for context switching
 * - Nested conditionals and loops
 * - Complex data structures
 */

import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Text,
} from "@react-email/components";
import { GoIf, GoRange, GoVar, GoWith } from "../src";

export const OrderConfirmationEmail: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            Order Confirmation
          </Heading>

          <Text style={text}>
            Thank you for your order, <GoVar name="CustomerName" />!
          </Text>

          <Text style={text}>
            Order #: <GoVar name="OrderNumber" />
          </Text>

          <Text style={text}>
            Order Date: <GoVar name="OrderDate" />
          </Text>

          <Hr style={hr} />

          {/* Use GoWith to switch to order context */}
          <GoWith value="Order" fallback="Order details not available">
            <Heading as="h2" style={h2}>
              Order Details
            </Heading>

            {/* Shipping address */}
            <Text style={label}>Shipping Address:</Text>
            <GoWith value="ShippingAddress">
              <Text style={address}>
                <GoVar name="Name" />
                <br />
                <GoVar name="Street" />
                <br />
                <GoVar name="City" />, <GoVar name="State" />{" "}
                <GoVar name="Zip" />
              </Text>
            </GoWith>

            <Hr style={hr} />

            {/* Order items */}
            <Heading as="h2" style={h2}>
              Items
            </Heading>

            <GoRange items="Items" elementName="item">
              <div style={itemRow}>
                <Text style={itemQty}>
                  x<GoVar name="$item.Quantity" />
                </Text>
                <Text style={itemDetails}>
                  <GoVar name="$item.ProductName" />
                  <GoIf condition="$item.Variant">
                    <Text style={itemVariant}>
                      {" "}
                      (<GoVar name="$item.Variant" />)
                    </Text>
                  </GoIf>
                </Text>
                <Text style={itemPrice}>
                  $<GoVar name="$item.Price" />
                </Text>
              </div>
            </GoRange>

            <Hr style={hr} />

            {/* Order totals */}
            <div style={totals}>
              <Text style={totalRow}>
                Subtotal: <GoVar name="Subtotal" />
              </Text>
              <GoIf condition="HasDiscount">
                <Text style={totalRow}>
                  Discount: <GoVar name="Discount" />
                </Text>
              </GoIf>
              <Text style={totalRow}>
                Shipping: <GoVar name="Shipping" />
              </Text>
              <Text style={totalRow}>
                Tax: <GoVar name="Tax" />
              </Text>
              <Text style={totalRow}>
                <strong>
                  Total: <GoVar name="Total" />
                </strong>
              </Text>
            </div>
          </GoWith>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions about your order, please contact our
            support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "8px 0",
};

const label = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "8px 0",
};

const address = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #e6ebf1",
};

const itemQty = {
  color: "#666",
  fontSize: "14px",
  minWidth: "40px",
};

const itemDetails = {
  color: "#333",
  fontSize: "14px",
  flex: 1,
  padding: "0 16px",
};

const itemVariant = {
  color: "#666",
  fontSize: "12px",
};

const itemPrice = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "bold",
  minWidth: "80px",
  textAlign: "right" as const,
};

const totals = {
  marginTop: "20px",
};

const totalRow = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "right" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "32px",
};
