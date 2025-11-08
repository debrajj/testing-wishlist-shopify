# 🧪 Complete Wishlist Test Guide

## Current Status
✅ Database cleared - Starting from ZERO
✅ Backend API working
✅ Button click fixed (should not open product page)

## Why Incognito/Different Browser Doesn't Increase Dashboard

### The Issue
When you test in incognito or a different browser:
- ❌ You're NOT logged in as a Shopify customer
- ❌ `customer.id` is `null`
- ❌ Wishlist uses **localStorage** instead of API
- ❌ Data is NOT sent to backend
- ❌ Dashboard does NOT increase

### The Solution
You need to either:
1. **Log in as a customer** before testing
2. **Configure app proxy** so the API works
3. **Use the test page** to bypass the frontend

## Test Methods

### Method 1: Direct API Test (RECOMMENDED - Works Now!)

This bypasses the frontend and tests the backend directly:

```bash
# Test 1: Add item
curl -X POST "http://localhost:63723/api/wishlist/add" \
  -d "customerId=testCustomer1&productId=product123"

# Test 2: Add another item
curl -X POST "http://localhost:63723/api/wishlist/add" \
  -d "customerId=testCustomer2&productId=product456"

# Test 3: Check database
cd wishlist
sqlite3 prisma/dev.sqlite "SELECT COUNT(*) FROM WishlistItem;"
```

**Expected Result**: Dashboard should show 2 items, 2 customers

### Method 2: Test with Logged-In Customer

1. **Create a test customer in Shopify Admin**:
   - Go to Shopify Admin → Customers
   - Click "Add customer"
   - Email: test@example.com
   - Password: TestPassword123
   - Save

2. **Log in on your store**:
   - Open your store in incognito
   - Go to `/account/login`
   - Log in with test@example.com / TestPassword123

3. **Click wishlist button**:
   - Browse products
   - Click heart icon
   - Check browser console (F12)

4. **Check console output**:
   ```
   Wishlist initialized. Customer ID: 7234567890123
   🔥 WISHLIST BUTTON CLICKED - Blocking all navigation
   🎯 Toggle wishlist clicked: 7891234567890
   📡 Sending to: /apps/wishlist/api/wishlist/add Customer: 7234567890123
   ✅ Response status: 200
   ✅ Response: {success: true, wishlist: [...]}
   ```

5. **Refresh dashboard** - Should increase!

### Method 3: Temporary Test Mode (Quick Fix)

For testing only, you can force a customer ID. 

**⚠️ WARNING: Remove this before production!**

In `card-product-FINAL.liquid`, find this line:
```javascript
const customerId = {{ customer.id | json }};
```

Change it to:
```javascript
const customerId = {{ customer.id | json }} || 'test-customer-' + Math.random().toString(36).substr(2, 9);
```

This will:
- Use real customer ID if logged in
- Generate a fake ID if not logged in
- Send data to backend even in incognito

**Remember to remove this after testing!**

## Check What's Happening

### Open Browser Console (F12)

When you click the wishlist button, you should see:

**If Logged In** ✅:
```
Wishlist initialized. Customer ID: 7234567890123
Found 12 wishlist buttons
🔥 WISHLIST BUTTON CLICKED - Blocking all navigation
🎯 Toggle wishlist clicked: 7891234567890
📡 Sending to: /apps/wishlist/api/wishlist/add Customer: 7234567890123
✅ Response status: 200
✅ Response: {success: true, wishlist: ["7891234567890"]}
```

**If NOT Logged In** ⚠️:
```
Wishlist initialized. Customer ID: Not logged in
Found 12 wishlist buttons
🔥 WISHLIST BUTTON CLICKED - Blocking all navigation
🎯 Toggle wishlist clicked: 7891234567890
💾 Using localStorage (not logged in)
💾 Saved to localStorage: [7891234567890]
```

The second one means data is saved locally only, NOT to the backend!

## Verify Dashboard Updates

After adding items via API or logged-in customer:

1. **Go to dashboard**: http://localhost:63723
2. **Wait 30 seconds** (auto-refresh)
3. **Or manually refresh** the page
4. **Should see**:
   - Total Items: [number]
   - Active Customers: [number]

## Check Database Directly

```bash
cd wishlist

# Count items
sqlite3 prisma/dev.sqlite "SELECT COUNT(*) FROM WishlistItem;"

# See all items
sqlite3 prisma/dev.sqlite "SELECT customerId, productId FROM WishlistItem;"

# Check stats
sqlite3 prisma/dev.sqlite "SELECT totalItems, totalCustomers FROM WishlistStats;"
```

## Common Issues

### Issue 1: Console shows "Not logged in"
**Problem**: You're not logged in as a customer
**Solution**: Log in as a customer or use Method 1 (Direct API)

### Issue 2: Console shows 404 error
**Problem**: App proxy not configured
**Solution**: 
- For local testing: Use Direct API method
- For production: Configure app proxy (see APP_PROXY_SETUP.md)

### Issue 3: Button opens product page
**Problem**: Event handling not working
**Solution**: 
- Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check console for JavaScript errors

### Issue 4: Dashboard shows 0
**Problem**: Wrong shop domain or not refreshed
**Solution**:
- Wait 30 seconds for auto-refresh
- Manually refresh the page
- Check database directly

## Quick Test Right Now

Run these commands to test the backend:

```bash
# Add 3 test items
curl -X POST "http://localhost:63723/api/wishlist/add" -d "customerId=alice&productId=prod1"
curl -X POST "http://localhost:63723/api/wishlist/add" -d "customerId=bob&productId=prod2"
curl -X POST "http://localhost:63723/api/wishlist/add" -d "customerId=charlie&productId=prod3"

# Check database
cd wishlist
sqlite3 prisma/dev.sqlite "SELECT COUNT(*) FROM WishlistItem;"
```

**Expected**: Should return `3`

Then refresh your dashboard - should show:
- Total Items: 3
- Active Customers: 3

## Summary

✅ **Backend works** - Tested with curl
✅ **Database works** - Data is saved
✅ **Dashboard works** - Shows real counts
✅ **Button click fixed** - Should not open product page

⚠️ **Frontend needs**:
- Customer to be logged in, OR
- App proxy configured, OR
- Temporary test mode enabled

The system is working! The issue is just that incognito mode = not logged in = localStorage only.
