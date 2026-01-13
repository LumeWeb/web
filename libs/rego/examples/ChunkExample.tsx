/**
 * Example: Array Chunking
 *
 * Demonstrates how to use GoChunk to create grid layouts
 * by splitting arrays into chunks of specified sizes.
 */

import React from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { GoChunk, GoComment, GoRange, GoVar } from "../src";

export const ChunkExample: React.FC = () => {
  return (
    <Html>
      <Head />
      <Body>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            Product Gallery
          </Heading>

          <GoComment>Display products in a 3-column grid layout</GoComment>

          <GoChunk items="products" size="3" elementName="productRow">
            <Section style={rowSection}>
              <GoRange items="$productRow" elementName="product">
                <Column style={columnStyle}>
                  <div style={productCard}>
                    <Heading as="h3" style={productTitle}>
                      <GoVar name="$product.name" />
                    </Heading>
                    <Text style={productPrice}>
                      <GoVar name="$product.price" />
                    </Text>
                  </div>
                </Column>
              </GoRange>
            </Section>
          </GoChunk>

          <Hr style={hr} />

          <Heading as="h1" style={h1}>
            Team Members
          </Heading>

          <GoComment>Display team members in pairs (2 per row)</GoComment>

          <GoChunk items="teamMembers" size="2" elementName="memberPair">
            <Section style={rowSection}>
              <GoRange items="$memberPair" elementName="member">
                <Column style={columnStyle}>
                  <div style={memberCard}>
                    <Text style={memberName}>
                      <GoVar name="$member.name" />
                    </Text>
                    <Text style={memberRole}>
                      <GoVar name="$member.role" />
                    </Text>
                  </div>
                </Column>
              </GoRange>
            </Section>
          </GoChunk>

          <Hr style={hr} />

          <Heading as="h1" style={h1}>
            Feature List
          </Heading>

          <GoComment>Display features in a 4-column grid</GoComment>

          <GoChunk
            items="features"
            size="4"
            elementName="featureRow"
            indexName="rowIndex">
            <Section style={rowSection}>
              <Text style={rowLabel}>
                Row <GoVar name="$rowIndex" />
              </Text>
              <Row>
                <GoRange items="$featureRow" elementName="feature">
                  <Column style={columnStyle}>
                    <Text style={featureText}>
                      <GoVar name="$feature.name" />
                    </Text>
                  </Column>
                </GoRange>
              </Row>
            </Section>
          </GoChunk>

          <Hr style={hr} />

          <Heading as="h1" style={h1}>
            Categories with Items
          </Heading>

          <GoComment>Nested chunking: categories with chunked items</GoComment>

          <GoRange items="categories" elementName="category">
            <Section style={categorySection}>
              <Heading as="h2" style={h2}>
                <GoVar name="$category.name" />
              </Heading>

              <GoChunk items="$category.items" size="3" elementName="itemChunk">
                <Row>
                  <GoRange items="$itemChunk" elementName="item">
                    <Column style={columnStyle}>
                      <Text style={itemText}>
                        <GoVar name="$item.name" />
                      </Text>
                    </Column>
                  </GoRange>
                </Row>
              </GoChunk>
            </Section>
          </GoRange>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const container = {
  maxWidth: "800px",
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

const rowSection = {
  marginBottom: "20px",
};

const columnStyle = {
  padding: "8px",
};

const productCard = {
  padding: "16px",
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const productTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px",
  color: "#333",
};

const productPrice = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
};

const memberCard = {
  padding: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
};

const memberName = {
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px",
  color: "#333",
};

const memberRole = {
  fontSize: "12px",
  color: "#666",
  margin: "0",
};

const rowLabel = {
  fontSize: "12px",
  color: "#8898aa",
  margin: "0 0 8px",
};

const featureText = {
  fontSize: "14px",
  color: "#333",
  padding: "8px",
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  textAlign: "center" as const,
};

const categorySection = {
  marginBottom: "30px",
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
};

const itemText = {
  fontSize: "13px",
  color: "#666",
  padding: "6px",
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
};
