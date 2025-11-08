import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.public.appProxy(request);
  
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    const shop = session?.shop || "";
    
    // Get wishlist items with product details
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        customerId,
        shop
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get product details from Shopify
    const productIds = wishlistItems.map(item => `gid://shopify/Product/${item.productId}`);
    
    if (productIds.length === 0) {
      return json({ products: [], count: 0 });
    }

    const productsResponse = await admin.graphql(
      `#graphql
      query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            handle
            description
            vendor
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }`,
      { variables: { ids: productIds } }
    );

    const productsData = await productsResponse.json();
    const products = productsData.data?.nodes || [];

    // Combine with wishlist timestamps
    const enrichedProducts = products.map((product: any) => {
      const wishlistItem = wishlistItems.find(
        item => `gid://shopify/Product/${item.productId}` === product.id
      );
      return {
        ...product,
        addedAt: wishlistItem?.createdAt
      };
    });

    return json({ 
      products: enrichedProducts,
      count: wishlistItems.length
    });
  } catch (error) {
    console.error("Error fetching wishlist page:", error);
    return json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}