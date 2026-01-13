/**
 * Example: Template Composition
 *
 * Demonstrates how to use GoDefine, GoUseTemplate, and GoBlock
 * to create reusable email components and layouts.
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
import {
  GoBlock,
  GoDate,
  GoDefine,
  GoRange,
  GoUseTemplate,
  GoVar,
} from "../src";

export const TemplateCompositionExample: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body>
        {/* Define reusable components */}
        <GoDefine name="email-header">
          <Container style={headerContainer}>
            <Heading as="h2" style={headerHeading}>
              <GoVar name="CompanyName" />
            </Heading>
            <Text style={headerText}>Your trusted partner</Text>
          </Container>
        </GoDefine>

        <GoDefine name="email-footer">
          <Container style={footerContainer}>
            <Hr style={hr} />
            <Text style={footerText}>
              © <GoDate var="now" format="2006" /> <GoVar name="CompanyName" />.
              All rights reserved.
            </Text>
            <Text style={footerText}>
              <GoVar name="SupportEmail" />
            </Text>
          </Container>
        </GoDefine>

        {/* Main email content */}
        <Container style={mainContainer}>
          {/* Use the header template */}
          <GoUseTemplate name="email-header" />

          <Heading as="h1" style={h1}>
            Welcome!
          </Heading>

          <Text style={text}>
            Hello <GoVar name="UserName" />,
          </Text>

          <Text style={text}>
            Thank you for joining us. We're excited to have you on board.
          </Text>

          {/* Block that can be overridden in child templates */}
          <GoBlock name="main-content">
            <Text style={text}>
              This is the default content. You can override this in child
              templates.
            </Text>
          </GoBlock>

          {/* Show recent items if available */}
          <GoRange
            items="RecentItems"
            elementName="item"
            indexName="idx"
            empty={<Text style={text}>No recent items</Text>}>
            <Text style={itemText}>
              <GoVar name="$idx" />. <GoVar name="$item.Title" />
            </Text>
          </GoRange>

          {/* Use the footer template */}
          <GoUseTemplate name="email-footer" />
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const mainContainer = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const headerContainer = {
  padding: "20px",
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  marginBottom: "20px",
};

const headerHeading = {
  margin: "0",
  fontSize: "20px",
  fontWeight: "bold",
  color: "#333",
};

const headerText = {
  margin: "8px 0 0",
  fontSize: "14px",
  color: "#666",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  color: "#333",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
  color: "#333",
};

const itemText = {
  fontSize: "14px",
  margin: "8px 0",
  color: "#666",
};

const footerContainer = {
  marginTop: "40px",
  padding: "20px",
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  margin: "4px 0",
};
