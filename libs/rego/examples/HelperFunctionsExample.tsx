/**
 * Example: Helper Functions in JSX Attributes
 *
 * This example demonstrates how to use helper functions (goVar, goUrl, goDate, etc.)
 * to embed Go template syntax in JSX attributes where React components can't be used.
 *
 * Helper functions return strings containing Go template syntax, which is perfect
 * for use in attributes like href, src, alt, title, data-attributes, etc.
 */

import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Image,
  Link,
  Section,
  Text,
} from "@react-email/components";
import {
  GoRange,
  goCurrency,
  goDate,
  goFieldVar,
  goFunc,
  goLocalVar,
  goUrl,
  goVar,
} from "../src";

export const HelperFunctionsExample: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            Helper Functions Demo
          </Heading>

          <Text style={text}>
            Helper functions allow you to use Go template syntax in JSX
            attributes where components can't be used.
          </Text>

          <Hr style={hr} />

          {/* goVar - Variable interpolation in attributes */}
          <Heading as="h2" style={h2}>
            goVar() - Variable Interpolation
          </Heading>

          <Text style={text}>
            Profile image from user's avatar URL:
          </Text>

          <Section style={imageSection}>
            <Image
              src={goVar("user.avatarUrl")}
              alt="User avatar"
              width="80"
              height="80"
              style={avatarImage}
            />
          </Section>

          <Text style={text}>
            <Button style={button} href={goVar("dashboardUrl")}>
              Go to Dashboard
            </Button>
          </Text>

          <Hr style={hr} />

          {/* goLocalVar - Local variables in attributes */}
          <Heading as="h2" style={h2}>
            goLocalVar() - Local Variables
          </Heading>

          <Text style={text}>
            Product links using loop variables:
          </Text>

          <GoRange items="products" elementName="product">
            <Section style={productSection}>
              <Text style={productName}>
                {goLocalVar("product.name")}
              </Text>
              <Text style={text}>
                <Link href={goLocalVar("product.url")} style={linkStyle}>
                  View Product
                </Link>
              </Text>
              <Text style={priceText}>
                {goCurrency("$product.price", "USD")}
              </Text>
            </Section>
          </GoRange>

          <Hr style={hr} />

          {/* goUrl - URL generation with query parameters */}
          <Heading as="h2" style={h2}>
            goUrl() - URL Generation
          </Heading>

          <Text style={text}>
            Simple path:
          </Text>
          <Text style={text}>
            <Link href={goUrl("/dashboard")} style={linkStyle}>
              Dashboard
            </Link>
          </Text>

          <Text style={text}>
            Variable path with query params:
          </Text>
          <Text style={text}>
            <Link
              href={goUrl({
                var: "profileUrl",
                params: ["ref", "source"],
              })}
              style={linkStyle}>
              Profile
            </Link>
          </Text>

          <Text style={text}>
            Path with literal values:
          </Text>
          <Text style={text}>
            <Link
              href={goUrl({
                path: "/reset-password",
                params: ["token", "email"],
                literalValues: ["resetToken", ""],
              })}
              style={linkStyle}>
              Reset Password
            </Link>
          </Text>

          <Hr style={hr} />

          {/* goDate - Date formatting */}
          <Heading as="h2" style={h2}>
            goDate() - Date Formatting
          </Heading>

          <Text style={text}>
            Order placed: {goDate("orderDate", "Jan 2, 2006")}
          </Text>

          <Text style={text}>
            Due by: {goDate("dueDate", "Jan 2, 2006 at 3:04 PM")}
          </Text>

          <Text style={text}>
            Expires: {goDate("expiresAt", "2006-01-02")}
          </Text>

          <Hr style={hr} />

          {/* goCurrency - Currency formatting */}
          <Heading as="h2" style={h2}>
            goCurrency() - Currency Formatting
          </Heading>

          <Text style={text}>
            Subtotal: {goCurrency("subtotal", "USD")}
          </Text>

          <Text style={text}>
            Tax: {goCurrency("tax", "USD")}
          </Text>

          <Text style={text}>
            Total: {goCurrency("total", "USD")}
          </Text>

          <Text style={text}>
            EUR Total: {goCurrency("totalEur", "EUR")}
          </Text>

          <Hr style={hr} />

          {/* goFunc - Custom function calls */}
          <Heading as="h2" style={h2}>
            goFunc() - Custom Functions
          </Heading>

          <Text style={text}>
            Item count:{" "}
            {goFunc("pluralize", {
              var: "itemCount",
              args: ["item", "items"],
            })}
          </Text>

          <Text style={text}>
            Subscription status:{" "}
            {goFunc("formatSubscription", {
              var: "subscriptionType",
            })}
          </Text>

          <Text style={text}>
            Full name:{" "}
            {goFunc("formatFullName", {
              vars: ["firstName", "lastName"],
            })}
          </Text>

          <Hr style={hr} />

          {/* goFieldVar - Field access helper */}
          <Heading as="h2" style={h2}>
            goFieldVar() - Field Access
          </Heading>

          <Text style={text}>
            Always uses field access (with dot prefix):
          </Text>

          <Text style={text}>
            <Link href={goFieldVar("settingsUrl")} style={linkStyle}>
              Settings
            </Link>
          </Text>

          <Text style={text}>
            <Link href={goFieldVar("helpUrl")} style={linkStyle}>
              Help
            </Link>
          </Text>

          <Hr style={hr} />

          {/* Combined usage */}
          <Heading as="h2" style={h2}>
            Combined Usage
          </Heading>

          <Text style={text}>
            Product cards with multiple helper functions:
          </Text>

          <GoRange items="featuredProducts" elementName="product">
            <Section style={productCard}>
              <Image
                src={goLocalVar("product.imageUrl")}
                alt={goLocalVar("product.name")}
                width="200"
                height="150"
                style={productImage}
              />
              <Text style={productName}>
                {goLocalVar("product.name")}
              </Text>
              <Text style={text}>
                {goLocalVar("product.description")}
              </Text>
              <Text style={priceText}>
                {goCurrency("$product.price", "USD")}
              </Text>
              <Button
                style={button}
                href={goLocalVar("product.url")}
                width="100%">
                Buy Now
              </Button>
            </Section>
          </GoRange>
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
  margin: "20px 0 10px",
  color: "#333",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  color: "#333",
};

const imageSection = {
  padding: "20px",
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  marginBottom: "16px",
};

const avatarImage = {
  borderRadius: "50%",
  border: "3px solid #5469d4",
};

const productSection = {
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  marginBottom: "12px",
};

const productName = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px",
  color: "#333",
};

const priceText = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#5469d4",
  margin: "8px 0",
};

const linkStyle = {
  color: "#5469d4",
  textDecoration: "underline",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "4px",
  color: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const productCard = {
  padding: "20px",
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  marginBottom: "20px",
  textAlign: "center" as const,
};

const productImage = {
  borderRadius: "8px",
  marginBottom: "12px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
};
