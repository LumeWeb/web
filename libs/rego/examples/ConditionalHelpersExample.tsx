/**
 * Example: Conditional Helpers
 *
 * Demonstrates how to use GoEqual and GoEmpty
 * to create conditional content in email templates.
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
import { GoDate, GoElse, GoEmpty, GoEqual, GoRange, GoVar } from "../src";

export const ConditionalHelpersExample: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            Account Status
          </Heading>

          {/* Check if user is premium */}
          <GoEqual var1="subscriptionType" var2="premium">
            <Text style={premiumText}>
              🎉 You're a Premium member! Enjoy all exclusive features.
            </Text>
            <GoElse>
              <Text style={standardText}>
                You're on the Standard plan. Upgrade to unlock all features!
              </Text>
            </GoElse>
          </GoEqual>

          <Hr style={hr} />

          {/* Check account status */}
          <GoEqual var1="status" var2="active">
            <Text style={activeText}>
              ✓ Your account is active and in good standing.
            </Text>
            <GoElse>
              <GoEqual var1="status" var2="suspended">
                <Text style={warningText}>
                  ⚠ Your account is suspended. Please contact support.
                </Text>
                <GoElse>
                  <Text style={errorText}>
                    ✗ Your account is inactive. Please reactivate your account.
                  </Text>
                </GoElse>
              </GoEqual>
            </GoElse>
          </GoEqual>

          <Hr style={hr} />

          {/* Check if user has notifications */}
          <GoEqual var1="hasNotifications" var2="true">
            <Heading as="h2" style={h2}>
              Notifications
            </Heading>
            <GoRange items="notifications" elementName="notif">
              <Text style={notificationText}>
                • <GoVar name="$notif.message" />
              </Text>
            </GoRange>
            <GoElse>
              <Text style={text}>No new notifications</Text>
            </GoElse>
          </GoEqual>

          <Hr style={hr} />

          {/* Check if cart is empty */}
          <GoEqual var1="cartItemCount" var2="0">
            <Text style={text}>Your shopping cart is empty.</Text>
            <GoElse>
              <Text style={text}>
                You have <GoVar name="cartItemCount" /> items in your cart.
              </Text>
            </GoElse>
          </GoEqual>

          <Hr style={hr} />

          {/* Check if recent activity exists */}
          <GoEmpty var="recentActivity">
            <Text style={text}>No recent activity to show.</Text>
            <GoElse>
              <Heading as="h2" style={h2}>
                Recent Activity
              </Heading>
              <GoRange items="recentActivity" elementName="activity">
                <Text style={activityText}>
                  <GoDate var="$activity.date" format="Jan 2" />:{" "}
                  <GoVar name="$activity.description" />
                </Text>
              </GoRange>
            </GoElse>
          </GoEmpty>

          <Hr style={hr} />

          {/* Check if user has a profile picture */}
          <GoEmpty var="profilePicture">
            <Text style={text}>
              You haven't uploaded a profile picture yet.
            </Text>
            <GoElse>
              <Text style={text}>Your profile picture looks great!</Text>
            </GoElse>
          </GoEmpty>

          <Hr style={hr} />

          {/* Check if user has completed onboarding */}
          <GoEqual var1="onboardingComplete" var2="true">
            <Text style={successText}>
              ✓ You've completed onboarding. Start exploring!
            </Text>
            <GoElse>
              <Text style={infoText}>
                Complete your onboarding to get the most out of your account.
              </Text>
            </GoElse>
          </GoEqual>
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

const premiumText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "12px 0",
  padding: "12px",
  backgroundColor: "#d4edda",
  color: "#155724",
  borderRadius: "4px",
};

const standardText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "12px 0",
  padding: "12px",
  backgroundColor: "#fff3cd",
  color: "#856404",
  borderRadius: "4px",
};

const activeText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  padding: "8px",
  backgroundColor: "#d4edda",
  color: "#155724",
  borderRadius: "4px",
};

const warningText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  padding: "8px",
  backgroundColor: "#fff3cd",
  color: "#856404",
  borderRadius: "4px",
};

const errorText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  padding: "8px",
  backgroundColor: "#f8d7da",
  color: "#721c24",
  borderRadius: "4px",
};

const notificationText = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
  color: "#666",
};

const activityText = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "6px 0",
  color: "#666",
};

const successText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  padding: "8px",
  backgroundColor: "#d4edda",
  color: "#155724",
  borderRadius: "4px",
};

const infoText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  padding: "8px",
  backgroundColor: "#d1ecf1",
  color: "#0c5460",
  borderRadius: "4px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};
