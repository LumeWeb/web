/**
 * Example: Pipeline Chaining and Variable Assignment
 *
 * Demonstrates how to use GoPipe, GoLet, GoFormat, and GoFunc
 * to create complex data transformations and variable assignments.
 *
 * Also demonstrates using helper functions (goVar, goUrl, etc.)
 * in JSX attributes where components can't be used.
 */

import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Text,
} from "@react-email/components";
import {
  GoComment,
  GoFormat,
  GoFunc,
  GoLet,
  GoLowerCase,
  GoPipe,
  GoRange,
  GoTrim,
  GoTruncate,
  GoUpperCase,
  GoUrl,
  GoVar,
  goCurrency,
  goDate,
  goFunc,
  goLocalVar,
  goUrl,
  goVar,
} from "../src";

export const PipelineExample: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            User Dashboard
          </Heading>

          <GoComment>
            This section displays user information with formatted data
          </GoComment>

          {/* Assign display name using format */}
          <GoLet name="displayName">
            <GoFormat format="%s %s">
              <GoVar name="user.firstName" />
              <GoVar name="user.lastName" />
            </GoFormat>
          </GoLet>

          <Text style={text}>
            Welcome back, <GoVar name="$displayName" />!
          </Text>

          <Hr style={hr} />

          {/* Process user bio with pipeline */}
          <GoComment>User bio is truncated and trimmed</GoComment>
          <GoLet name="shortBio">
            <GoPipe>
              <GoVar name="user.bio" />
              <GoTruncate length="150" />
              <GoTrim />
            </GoPipe>
          </GoLet>

          <Text style={text}>
            <strong>About:</strong> <GoVar name="$shortBio" />
          </Text>

          <Hr style={hr} />

          {/* Format email with lowercase */}
          <GoLet name="normalizedEmail">
            <GoPipe>
              <GoVar name="user.email" />
              <GoLowerCase />
            </GoPipe>
          </GoLet>

          <Text style={text}>
            Email: <GoVar name="$normalizedEmail" />
          </Text>

          <Hr style={hr} />

          {/* Use custom function for subscription status */}
          <GoComment>Custom function to format subscription status</GoComment>
          <Text style={text}>
            Subscription:{" "}
            <GoFunc name="formatSubscription" var="user.subscriptionType" />
          </Text>

          <Hr style={hr} />

          {/* Process recent items with complex transformations */}
          <Heading as="h2" style={h2}>
            Recent Items
          </Heading>

          <GoRange items="recentItems" elementName="item" indexName="idx">
            <div style={itemRow}>
              <Text style={itemNumber}>
                <GoVar name="$idx" />.
              </Text>

              <div style={itemContent}>
                {/* Title: uppercase and truncated */}
                <GoLet name="itemTitle">
                  <GoPipe>
                    <GoVar name="$item.title" />
                    <GoUpperCase />
                  </GoPipe>
                </GoLet>

                <Text style={itemTitle}>
                  <GoVar name="$itemTitle" />
                </Text>

                {/* Description: truncated */}
                <GoLet name="itemDesc">
                  <GoPipe>
                    <GoVar name="$item.description" />
                    <GoTruncate length="80" />
                  </GoPipe>
                </GoLet>

                <Text style={itemDescription}>
                  <GoVar name="$itemDesc" />
                </Text>
              </div>

              {/* Price formatted with custom function */}
              <Text style={itemPrice}>
                <GoFunc
                  name="formatCurrency"
                  var="$item.price"
                  args={["USD"]}
                />
              </Text>
            </div>
          </GoRange>

          <Hr style={hr} />

          {/* Use pluralize function */}
          <Text style={text}>
            You have{" "}
            <GoFunc name="pluralize" var="itemCount" args={["item", "items"]} />{" "}
            in your cart.
          </Text>

          <Hr style={hr} />

          {/* Format date with custom function */}
          <Text style={text}>
            Last login:{" "}
            <GoFunc
              name="formatDateTime"
              vars={["lastLogin"]}
              args={["Jan 2, 2006", "3:04 PM"]}
            />
          </Text>

          <Hr style={hr} />

          {/* Simple variable reference */}
          <GoLet name="settingsUrl" value="settingsUrl">
            <Text style={text}>
              <Link href={goLocalVar("settingsUrl")} style={linkStyle}>
                Manage your settings
              </Link>
            </Text>
          </GoLet>

          <Hr style={hr} />

          <GoComment>
            Helper functions allow using Go template syntax in JSX attributes
          </GoComment>

          {/* URL generation with query parameters */}
          <GoComment>Generate URLs with query parameters</GoComment>

          <Text style={text}>
            <Link href={goUrl("/dashboard")} style={linkStyle}>
              Go to Dashboard
            </Link>
          </Text>

          <Text style={text}>
            <Link
              href={goUrl({ path: "/verify", params: ["token", "email"] })}
              style={linkStyle}>
              Verify Email
            </Link>
          </Text>

          <Text style={text}>
            <Link
              href={goUrl({ var: "profileUrl", params: ["id", "tab"] })}
              style={linkStyle}>
              View Profile
            </Link>
          </Text>

          <Text style={text}>
            <Link
              href={
                goUrl({
                  path: "/search",
                  params: ["q", "page"],
                  literalValues: ["", "1"]
                })
              }
              style={linkStyle}>
              Search Results
            </Link>
          </Text>

          <Hr style={hr} />

          <GoComment>
            Using helper functions for inline template syntax in text
          </GoComment>

          <Text style={text}>
            Profile: {goVar("userName")}
          </Text>

          <Text style={text}>
            Due date: {goDate("dueDate", "Jan 2, 2006")}
          </Text>

          <Text style={text}>
            Total: {goCurrency("total", "USD")}
          </Text>

          <Text style={text}>
            Items: {goFunc("pluralize", { var: "itemCount", args: ["item", "items"] })}
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
  margin: "20px 0 10px",
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
  gap: "12px",
  padding: "12px 0",
  borderBottom: "1px solid #e6ebf1",
};

const itemNumber = {
  fontSize: "14px",
  color: "#666",
  minWidth: "30px",
};

const itemContent = {
  flex: 1,
};

const itemTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px",
  color: "#333",
};

const itemDescription = {
  fontSize: "12px",
  color: "#666",
  margin: "0",
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333",
  minWidth: "80px",
  textAlign: "right" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const linkStyle = {
  color: "#5469d4",
  textDecoration: "underline",
};
