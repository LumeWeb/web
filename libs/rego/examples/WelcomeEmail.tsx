/**
 * Example: Welcome Email Template
 *
 * This demonstrates how to use the React-to-Go Template DSL
 * to create an email that can be rendered by Go at runtime.
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
  Text,
} from "@react-email/components";
import { GoElse, GoIf, GoRange, GoVar, goVar } from "../src";

export const WelcomeEmail: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo or branding */}
          <Text style={logo}>Welcome to Our App!</Text>

          <Heading as="h1" style={h1}>
            Hello, <GoVar name="UserName" />!
          </Heading>

          <Text style={text}>
            Thank you for signing up. We're excited to have you on board.
          </Text>

          {/* Conditional content based on user type */}
          <GoIf condition="IsPremium">
            <Text style={premiumText}>
              🎉 You're a premium member! Enjoy all the exclusive features.
            </Text>
            <GoElse>
              <Text style={text}>
                Upgrade to premium to unlock all features.
              </Text>
            </GoElse>
          </GoIf>

          {/* Show recent activity if available */}
          <GoIf condition="HasRecentActivity">
            <Hr style={hr} />
            <Heading as="h2" style={h2}>
              Recent Activity
            </Heading>
            <GoRange
              items="RecentItems"
              elementName="item"
              indexName="idx"
              empty={<Text style={text}>No recent activity</Text>}>
              <Text style={itemText}>
                <GoVar name="$idx" />. <GoVar name="$item.Title" /> -{" "}
                <GoVar name="$item.Date" />
              </Text>
            </GoRange>
          </GoIf>

          <Hr style={hr} />

          {/* Action button */}
          <Button style={button} href={goVar("DashboardURL")}>
            Go to Dashboard
          </Button>

          <Text style={footer}>
            If you have any questions, just reply to this email.
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

const logo = {
  margin: "0 auto",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#333",
};

const h1 = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
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
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const premiumText = {
  ...text,
  backgroundColor: "#fff3cd",
  padding: "12px",
  borderRadius: "4px",
  margin: "16px 0",
};

const itemText = {
  ...text,
  fontSize: "14px",
  margin: "8px 0",
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
  width: "100%",
  padding: "12px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "12px",
  lineHeight: "16px",
};
