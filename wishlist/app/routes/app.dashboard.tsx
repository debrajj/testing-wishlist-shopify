import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import { RealtimeWishlistStats } from "../components/RealtimeWishlistStats";

const prisma = new PrismaClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Get wishlist statistics
    const stats = await prisma.wishlistStats.findUnique({
      where: { shop }
    });

    // Get most wishlisted products
    const topProducts = await prisma.wishlistItem.groupBy({
      by: ['productId'],
      where: { shop },
      _count: {
        productId: true
      },
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: 10
    });

    // Get product details for top products
    const productIds = topProducts.map(p => `gid://shopify/Product/${p.productId}`);
    let productsWithDetails = [];

    if (productIds.length > 0) {
      const productsResponse = await admin.graphql(
        `#graphql
        query getProducts($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
            }
          }
        }`,
        { variables: { ids: productIds } }
      );

      const productsData = await productsResponse.json();
      const products = productsData.data?.nodes || [];

      productsWithDetails = topProducts.map(tp => {
        const product = products.find((p: any) => p.id === `gid://shopify/Product/${tp.productId}`);
        return {
          productId: tp.productId,
          count: tp._count.productId,
          title: product?.title || 'Unknown Product',
          handle: product?.handle || '',
          image: product?.featuredImage?.url || ''
        };
      });
    }

    // Get recent wishlist activity
    const recentActivity = await prisma.wishlistItem.findMany({
      where: { shop },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return json({
      stats: stats || { totalItems: 0, totalCustomers: 0 },
      topProducts: productsWithDetails,
      recentActivity: recentActivity.length,
      shop
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return json({
      stats: { totalItems: 0, totalCustomers: 0 },
      topProducts: [],
      recentActivity: 0,
      shop
    });
  }
};

export default function Dashboard() {
  const { stats, topProducts, recentActivity, shop } = useLoaderData<typeof loader>();

  const tableRows = topProducts.map((product, index) => [
    index + 1,
    product.title,
    product.count,
    <Badge key={product.productId} tone={product.count > 10 ? 'success' : 'info'}>
      {product.count > 10 ? 'Popular' : 'Growing'}
    </Badge>
  ]);

  return (
    <Page>
      <TitleBar title="Wishlist Analytics Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              <InlineStack gap="400">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Total Wishlist Items
                    </Text>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1.2' }}>
                      {stats.totalItems.toLocaleString()}
                    </div>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Active Customers
                    </Text>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1.2' }}>
                      {stats.totalCustomers.toLocaleString()}
                    </div>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Recent Activity
                    </Text>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1.2' }}>
                      {recentActivity}
                    </div>
                  </BlockStack>
                </Card>
              </InlineStack>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Most Wishlisted Products
                  </Text>
                  {topProducts.length > 0 ? (
                    <DataTable
                      columnContentTypes={['numeric', 'text', 'numeric', 'text']}
                      headings={['Rank', 'Product', 'Wishlist Count', 'Status']}
                      rows={tableRows}
                    />
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No wishlist data available yet. Products will appear here once customers start adding items to their wishlists.
                    </Text>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <RealtimeWishlistStats shop={shop} />
              
              <Card>
                <InlineStack align="end">
                  <Button
                    url="https://debrajroy.in/"
                    target="_blank"
                    variant="primary"
                  >
                    New Link
                  </Button>
                </InlineStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Wishlist Features
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        ✅ Product Cards
                      </Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        ✅ Customer Wishlist Page
                      </Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        ✅ Real-time Sync
                      </Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        ✅ Analytics Dashboard
                      </Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}