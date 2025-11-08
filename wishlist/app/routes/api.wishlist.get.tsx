import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  let shop = "";
  
  try {
    // Try app proxy authentication first
    const { session } = await authenticate.public.appProxy(request);
    shop = session?.shop || "";
  } catch (error) {
    // If app proxy fails, get the actual shop from the database
    try {
      const latestSession = await prisma.session.findFirst({
        select: { shop: true },
        orderBy: { id: 'desc' }
      });
      shop = latestSession?.shop || "development.myshopify.com";
    } catch (dbError) {
      shop = "development.myshopify.com";
    }
    
    console.log("App proxy auth failed, using shop:", shop);
  }
  
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json({ error: "Missing customerId" }, { status: 400 });
  }

  console.log("Getting wishlist for:", { customerId, shop });

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        customerId,
        shop
      },
      select: {
        productId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("Found items:", wishlistItems.length);

    return json({ 
      wishlist: wishlistItems.map(item => item.productId),
      items: wishlistItems
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return json({ error: "Failed to fetch wishlist", details: String(error) }, { status: 500 });
  }
}
