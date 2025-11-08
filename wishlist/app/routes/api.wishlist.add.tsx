import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
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
  
  const formData = await request.formData();
  const customerId = formData.get("customerId") as string;
  const productId = formData.get("productId") as string;

  if (!customerId || !productId) {
    return json({ error: "Missing customerId or productId" }, { status: 400 });
  }

  console.log("Adding to wishlist:", { customerId, productId, shop });

  try {
    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        customerId_productId_shop: {
          customerId,
          productId,
          shop
        }
      }
    });

    // Only add if it doesn't exist
    if (!existingItem) {
      await prisma.wishlistItem.create({
        data: {
          customerId,
          productId,
          shop
        }
      });

      // Check if this is a new customer
      const customerItemCount = await prisma.wishlistItem.count({
        where: { customerId, shop }
      });
      const isNewCustomer = customerItemCount === 1;

      // Update stats
      await prisma.wishlistStats.upsert({
        where: { shop },
        update: {
          totalItems: { increment: 1 },
          totalCustomers: isNewCustomer ? { increment: 1 } : undefined,
          updatedAt: new Date()
        },
        create: {
          shop,
          totalItems: 1,
          totalCustomers: 1
        }
      });
      
      console.log("Item added successfully");
    } else {
      console.log("Item already exists in wishlist");
    }

    // Get updated wishlist
    const wishlist = await prisma.wishlistItem.findMany({
      where: { customerId, shop },
      select: { productId: true }
    });

    return json({ 
      success: true, 
      wishlist: wishlist.map(item => item.productId)
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return json({ error: "Failed to add to wishlist", details: String(error) }, { status: 500 });
  }
}
