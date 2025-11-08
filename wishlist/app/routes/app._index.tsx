import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { Page, Layout } from "@shopify/polaris";
import { RealtimeWishlistStats } from "../components/RealtimeWishlistStats";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session?.shop || "";

  try {
    // Get actual counts from database
    const totalItems = await prisma.wishlistItem.count({
      where: { shop }
    });

    const totalCustomers = await prisma.wishlistItem.groupBy({
      by: ['customerId'],
      where: { shop }
    }).then(groups => groups.length);

    return json({
      totalCustomers,
      totalWishlistItems: totalItems,
      topProducts: [],
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return json({
      totalCustomers: 0,
      totalWishlistItems: 0,
      topProducts: [],
    });
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page title="Wishlist Dashboard">
      <Layout>
        <Layout.Section>
          <RealtimeWishlistStats 
            totalItems={data.totalWishlistItems} 
            totalCustomers={data.totalCustomers} 
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
