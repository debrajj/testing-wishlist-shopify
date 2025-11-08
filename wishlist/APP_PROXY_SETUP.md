# 🔧 App Proxy Setup Guide

## What is App Proxy?

App Proxy allows your Shopify store's frontend to communicate with your app's backend. When a customer clicks the wishlist button, the request goes through Shopify's app proxy to reach your app.

## Current Configuration

In `shopify.app.toml`:
```toml
[app_proxy]
url = "https://localhost:3000"
subpath = "wishlist"
prefix = "apps"
```

This creates the route: `https://your-store.myshopify.com/apps/wishlist/*`

## Setup Steps

### Step 1: Find Your App URL

When running `shopify app dev`, check the terminal output for:
```
Preview URL: https://xxx-xxx-xxx.trycloudflare.com
```

This is your temporary development URL.

### Step 2: Configure in Shopify Partners

1. Go to https://partners.shopify.com
2. Click on your app
3. Navigate to **Configuration** → **App setup**
4. Scroll to **App proxy** section
5. Click **Set up app proxy**

### Step 3: Enter Configuration

Fill in these values:

| Field | Value |
|-------|-------|
| **Subpath prefix** | `apps` |
| **Subpath** | `wishlist` |
| **Proxy URL** | `https://your-tunnel-url.trycloudflare.com/api/wishlist` |

**Important**: 
- Don't include `/apps/wishlist` in the Proxy URL
- The Proxy URL should end with `/api/wishlist`
- Use the tunnel URL from `shopify app dev` terminal

### Step 4: Save and Test

1. Click **Save**
2. Wait 1-2 minutes for changes to propagate
3. Test by clicking wishlist on your store
4. Check dashboard for real-time updates

## How It Works

```
Customer clicks wishlist
         ↓
https://your-store.myshopify.com/apps/wishlist/api/wishlist/add
         ↓
Shopify App Proxy
         ↓
https://your-app.com/api/wishlist/add
         ↓
Your app saves to database
         ↓
Dashboard updates ✅
```

## For Production Deployment

When you deploy to production (not using `shopify app dev`):

1. Deploy your app to a hosting service
2. Get your production URL (e.g., `https://your-app.herokuapp.com`)
3. Update app proxy in Shopify Partners:
   - Proxy URL: `https://your-app.herokuapp.com/api/wishlist`
4. Update `shopify.app.toml`:
   ```toml
   [app_proxy]
   url = "https://your-app.herokuapp.com"
   subpath = "wishlist"
   prefix = "apps"
   ```

## Troubleshooting

### Issue: 404 Not Found
**Solution**: Check that Proxy URL ends with `/api/wishlist` (not `/apps/wishlist`)

### Issue: 401 Unauthorized
**Solution**: Make sure app proxy is saved in Shopify Partners and wait 1-2 minutes

### Issue: CORS Error
**Solution**: The app proxy handles CORS automatically. If you see CORS errors, the proxy isn't configured correctly.

### Issue: Still Not Working
**Check**:
1. App is running (`shopify app dev`)
2. Tunnel URL is correct in app proxy settings
3. Subpath prefix is `apps` and subpath is `wishlist`
4. Wait 2-3 minutes after saving changes
5. Clear browser cache and try again

## Verify It's Working

### Test 1: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click wishlist button
4. Look for request to `/apps/wishlist/api/wishlist/add`
5. Should return `{success: true, wishlist: [...]}`

### Test 2: Check Server Logs
In terminal where `shopify app dev` runs:
```
Adding to wishlist: { customerId: '123', productId: '456', shop: 'your-store.myshopify.com' }
Item added successfully
```

### Test 3: Check Dashboard
1. Go to app admin
2. Should see real-time stats updating
3. Total items should increase when you click wishlist

## Quick Reference

| Environment | Proxy URL |
|-------------|-----------|
| Development | `https://xxx.trycloudflare.com/api/wishlist` |
| Production | `https://your-app.com/api/wishlist` |

| Setting | Value |
|---------|-------|
| Subpath prefix | `apps` |
| Subpath | `wishlist` |
| Full path | `/apps/wishlist/*` |

## Need Help?

If you're still having issues:
1. Check `FINAL_STATUS.md` for testing steps
2. Use `TEST_API_DIRECTLY.html` to test API directly
3. Check server logs for error messages
4. Verify database is receiving data with:
   ```bash
   sqlite3 prisma/dev.sqlite "SELECT * FROM WishlistItem;"
   ```
