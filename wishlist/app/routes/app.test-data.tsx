import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Page, Card, Button, Text, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Add test wishlist items
    const testItems = [
      { customerId: "123", productId: "456" },
      { customerId: "123", productId: "789" },
      { customerId: "456", productId: "456" },
      { customerId: "789", productId: "123" },
    ];

    for (const item of testItems) {
      await prisma.wishlistItem.upsert({
        where: {
          customerId_productId_shop: {
            customerId: item.customerId,
            productId: item.productId,
            shop
          }
        },
        update: {},
        create: {
          customerId: item.customerId,
          productId: item.productId,
          shop
        }
      });
    }

    // Update stats
    const totalItems = await prisma.wishlistItem.count({ where: { shop } });
    const totalCustomers = await prisma.wishlistItem.groupBy({
      by: ['customerId'],
      where: { shop }
    }).then(groups => groups.length);

    await prisma.wishlistStats.upsert({
      where: { shop },
      update: {
        totalItems,
        totalCustomers,
        updatedAt: new Date()
      },
      create: {
        shop,
        totalItems,
        totalCustomers
      }
    });

    return json({ success: true, message: "Test data added successfully!" });
  } catch (error) {
    console.error("Error adding test data:", error);
    return json({ error: "Failed to add test data" }, { status: 500 });
  }
}

export default function TestData() {
  const actionData = useActionData<typeof action>();

  return (
    <Page>
      <TitleBar title="Add Test Data" />
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Add Test Wishlist Data
          </Text>
          <Text variant="bodyMd">
            Click the button below to add some test wishlist items to see the dashboard in action.
          </Text>
          
          <Form method="post">
            <Button submit>Add Test Data</Button>
          </Form>

          {actionData?.success && (
            <Text tone="success">{actionData.message}</Text>
          )}
          
          {actionData?.error && (
            <Text tone="critical">{actionData.error}</Text>
          )}
        </BlockStack>
      </Card>
    </Page>
  );
}