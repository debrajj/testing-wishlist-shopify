# Testing Live Wishlist Clicks

## Issue: Dashboard Not Updating

The dashboard might not update because:

### 1. You're Not Logged In as a Customer

If you're testing on your store without being logged in as a customer:
- `{{ customer.id }}` will be `null`
- The wishlist will use localStorage instead
- **No data will be sent to the backend**
- Dashboard won't update

**Solution**: Log in as a customer on your store before testing

### 2. App Proxy Not Configured

If the app proxy isn't set up in Shopify Partners:
- Requests to `/apps/wishlist/api/wishlist/add` will fail
- You'll see 404 errors in browser console
- No data reaches the backend

**Solution**: Configure app proxy (see APP_PROXY_SETUP.md)

### 3. Check Browser Console

Open browser DevTools (F12) and check:

**If you see this** - Working! ✅
```
Toggle wishlist clicked: 7891234567890
Sending to: /apps/wishlist/api/wishlist/add Customer: 123456
Response status: 200
Response: {success: true, wishlist: [...]}
```

**If you see this** - Not logged in ⚠️
```
Toggle wishlist clicked: 7891234567890
(no "Sending to" message - using localStorage)
```

**If you see this** - App proxy not configured ❌
```
Toggle wishlist clicked: 7891234567890
Sending to: /apps/wishlist/api/wishlist/add Customer: 123456
Response status: 404
Error: Failed to fetch
```

## How to Test Properly

### Option 1: Test with Direct API (Recommended for Now)

Use the test page:
```bash
open wishlist/TEST_API_DIRECTLY.html
```

This bypasses the app proxy and tests the API directly.

### Option 2: Test as Logged-In Customer

1. Go to your Shopify admin
2. Customers → Create customer (or use existing)
3. Copy the customer's ID from the URL
4. Open your store in incognito mode
5. Log in as that customer
6. Click wishlist buttons
7. Check dashboard for updates

### Option 3: Temporary Development Mode

For testing, you can temporarily modify the JavaScript to use a test customer ID:

In `card-product-FINAL.liquid`, change:
```javascript
const customerId = {{ customer.id | json }};
```

To:
```javascript
const customerId = {{ customer.id | json }} || 'test-customer-123';
```

**⚠️ IMPORTANT**: Remove this before going to production!

## Check Dashboard Updates

After clicking wishlist:

1. **Wait 30 seconds** - Dashboard auto-refreshes every 30 seconds
2. **Or manually refresh** - Reload the page
3. **Check database**:
   ```bash
   cd wishlist
   sqlite3 prisma/dev.sqlite "SELECT COUNT(*) FROM WishlistItem WHERE shop = 'wishlist-track-new.myshopify.com';"
   ```

## Current Status

Database has **4 items** from API testing:
```
customer456 → product789
customer999 → product999
test123 → 7891234567890
liveTest → liveProduct123
```

These were added via direct API calls, not through the frontend.

## Next Steps

1. **Configure App Proxy** in Shopify Partners (see APP_PROXY_SETUP.md)
2. **Log in as a customer** on your store
3. **Click wishlist button** on a product
4. **Check browser console** for success message
5. **Wait 30 seconds** and check dashboard

## Debugging Commands

```bash
# Check if data is being saved
cd wishlist
sqlite3 prisma/dev.sqlite "SELECT * FROM WishlistItem ORDER BY createdAt DESC LIMIT 5;"

# Check stats
sqlite3 prisma/dev.sqlite "SELECT * FROM WishlistStats;"

# Test API directly
curl -X POST "http://localhost:63723/api/wishlist/add" \
  -d "customerId=debugTest&productId=debugProduct"
```

## Why It's Not Increasing Live

Most likely reasons:
1. ❌ Not logged in as customer → Using localStorage instead of API
2. ❌ App proxy not configured → API calls failing
3. ❌ CORS errors → Check browser console
4. ❌ Wrong shop domain → Check session shop matches

The API itself is working (we tested it), so the issue is in how the frontend is calling it.
