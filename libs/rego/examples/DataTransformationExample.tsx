/**
 * Example: Data Transformation Helpers
 *
 * Demonstrates how to use GoDate, GoCurrency, and GoTruncate
 * to format data in email templates.
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
import { GoCurrency, GoDate, GoRange, GoTruncate, GoVar } from "../src";

export const DataTransformationExample: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            Order Summary
          </Heading>

          <Text style={text}>
            Order #<GoVar name="OrderNumber" />
          </Text>

          <Text style={text}>
            Placed on: <GoDate var="orderDate" format="Jan 2, 2006" />
          </Text>

          <Hr style={hr} />

          {/* Order items with formatted prices */}
          <Heading as="h2" style={h2}>
            Items
          </Heading>

          <GoRange items="Items" elementName="item">
            <div style={itemRow}>
              <div>
                <Text style={itemName}>
                  <GoVar name="$item.Name" />
                </Text>
                <Text style={itemDescription}>
                  <GoTruncate var="$item.Description" length="60" />
                </Text>
              </div>
              <Text style={itemPrice}>
                <GoCurrency var="$item.Price" currency="USD" />
              </Text>
            </div>
          </GoRange>

          <Hr style={hr} />

          {/* Order totals with formatted currency */}
          <div style={totals}>
            <Text style={totalRow}>
              Subtotal: <GoCurrency var="subtotal" currency="USD" />
            </Text>
            <Text style={totalRow}>
              Tax: <GoCurrency var="tax" currency="USD" />
            </Text>
            <Text style={totalRow}>
              Shipping: <GoCurrency var="shipping" currency="USD" />
            </Text>
            <Text style={totalRow}>
              <strong>
                Total: <GoCurrency var="total" currency="USD" />
              </strong>
            </Text>
          </div>

          <Hr style={hr} />

          {/* Additional dates */}
          <Text style={text}>
            Estimated delivery:{" "}
            <GoDate var="estimatedDelivery" format="Jan 2, 2006" />
          </Text>

          <Text style={text}>
            Order expires:{" "}
            <GoDate var="expiresAt" format="Jan 2, 2006 at 3:04 PM" />
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  color: "#333",
};

const h2 = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0",
  color: "#333",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  color: "#333",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "12px 0",
  borderBottom: "1px solid #e6ebf1",
};

const itemName = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 4px",
  color: "#333",
};

const itemDescription = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
};

const itemPrice = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
  minWidth: "100px",
  textAlign: "right" as const,
};

const totals = {
  marginTop: "20px",
};

const totalRow = {
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "right" as const,
  margin: "4px 0",
  color: "#333",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};
