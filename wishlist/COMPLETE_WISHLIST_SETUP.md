# Complete Wishlist App Setup Guide

## ✅ What's Been Created

### Backend Features:
- **Database Storage**: Wishlist items stored in SQLite with Prisma
- **API Routes**: Add, remove, get wishlist items + analytics
- **Admin Dashboard**: Real-time analytics and most wishlisted products
- **Statistics Tracking**: Customer counts and item counts

### Frontend Features:
- **Product Card Integration**: Heart icon on all product cards
- **Wishlist Page Template**: Complete customer wishlist page
- **Real-time Updates**: Live statistics in admin dashboard
- **Guest Handling**: Hides wishlist for non-logged-in users

## 🚀 Setup Steps

### 1. Install Dependencies & Setup Database
```bash
cd /Users/debrajroy/Desktop/testing-wishlist-shopify/wishlist
npm install @prisma/client
npx prisma generate
npx prisma db push
```

### 2. Start Development Server
```bash
npm install -g @shopify/cli
npm run dev
```

### 3. Configure App Proxy in Partner Dashboard
- Go to your app in Shopify Partner Dashboard
- Navigate to **App setup** → **App proxy**
- Set **Proxy URL**: Your ngrok URL (e.g., `https://abc123.ngrok.io`)
- Set **Subpath**: `wishlist`
- Set **Prefix**: `apps`

### 4. Add Wishlist Button to Product Cards
Replace the `<script>` section in your theme's `snippets/card-product.liquid` with:

```liquid
<script>
(function() {
  const customerId = {{ customer.id | json }};
  
  if (!customerId) {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.style.display = 'none';
    });
    return;
  }

  function initWishlist() {
    const buttons = document.querySelectorAll('.wishlist-btn:not([data-init])');
    
    buttons.forEach(btn => {
      btn.setAttribute('data-init', '1');
      const productId = btn.getAttribute('data-product-id');
      
      fetch('/apps/wishlist/api/wishlist/get?customerId=' + customerId)
        .then(r => r.json())
        .then(d => {
          if (d.wishlist && d.wishlist.includes(productId)) {
            btn.classList.add('active');
            btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Add', 'Remove'));
          }
        })
        .catch(err => console.error('Wishlist check error:', err));
    });
  }
  
  window.toggleWishlist = function(btn, productId) {
    const isActive = btn.classList.contains('active');
    const endpoint = isActive 
      ? '/apps/wishlist/api/wishlist/remove' 
      : '/apps/wishlist/api/wishlist/add';
    
    btn.classList.toggle('active');
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('customerId', customerId);
    formData.append('productId', productId);
    
    fetch(endpoint, { method: 'POST', body: formData })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          if (btn.classList.contains('active')) {
            btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Add', 'Remove'));
          } else {
            btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Remove', 'Add'));
          }
        } else {
          btn.classList.toggle('active');
        }
        btn.disabled = false;
      })
      .catch(err => {
        console.error('Wishlist error:', err);
        btn.classList.toggle('active');
        btn.disabled = false;
      });
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWishlist);
  } else {
    initWishlist();
  }
  
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function() {
      initWishlist();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
</script>
```

### 5. Create Wishlist Page in Theme
1. In your Shopify admin, go to **Online Store** → **Themes** → **Actions** → **Edit code**
2. Create new template: `templates/page.wishlist.liquid`
3. Copy content from `WISHLIST_PAGE_TEMPLATE.liquid`
4. Create a new page: **Online Store** → **Pages** → **Add page**
   - Title: "My Wishlist"
   - Template: "page.wishlist"
   - URL: `/pages/wishlist`

### 6. Add Wishlist Link to Navigation
Add this to your theme's navigation:
```liquid
{% if customer %}
  <a href="/pages/wishlist">My Wishlist</a>
{% endif %}
```

## 📊 Admin Dashboard Access

Visit your app's admin dashboard at: `/app/dashboard`

**Features:**
- Total wishlist items count
- Active customers with wishlists
- Most wishlisted products table
- Real-time statistics updates

## 🔧 API Endpoints

All endpoints work through Shopify's app proxy:

- **GET** `/apps/wishlist/api/wishlist/get?customerId=123` - Get customer's wishlist
- **POST** `/apps/wishlist/api/wishlist/add` - Add product to wishlist
- **POST** `/apps/wishlist/api/wishlist/remove` - Remove product from wishlist
- **GET** `/apps/wishlist/api/wishlist/page?customerId=123` - Get wishlist page data
- **GET** `/apps/wishlist/api/wishlist/stats` - Get real-time statistics

## 🎨 Customization

### Wishlist Button Styles
The wishlist button styles are in your `card-product.liquid`. Customize:
- Colors: Change `#e11d48` for active state
- Size: Modify `width: 2.5rem; height: 2.5rem`
- Position: Adjust `top` and `right` values

### Wishlist Page Styling
Modify the `<style>` section in `WISHLIST_PAGE_TEMPLATE.liquid` to match your theme.

## 🔄 Real-time Features

- **Live Dashboard**: Updates every 30 seconds
- **Instant UI Updates**: Optimistic updates for better UX
- **Cross-device Sync**: Wishlist syncs across customer's devices

## 🛠 Troubleshooting

1. **Wishlist button not working**: Check app proxy configuration
2. **Database errors**: Run `npx prisma db push`
3. **API not responding**: Ensure development server is running
4. **Styles not loading**: Check if CSS is properly included in card template

## 📱 Mobile Responsive

The wishlist page template includes responsive design for mobile devices. Test on various screen sizes.

## 🚀 Production Deployment

1. Deploy your app to a hosting service (Railway, Heroku, etc.)
2. Update app proxy URL in Partner Dashboard to production URL
3. Update database to PostgreSQL for production
4. Set up proper environment variables

Your complete wishlist app is now ready! 🎉