# Wishlist App for Shopify

A private custom Shopify app with real-time wishlist tracking using metafields (no external database).

## Features

✅ **Metafield-based storage** - No external database needed  
✅ **Theme App Extension** - ❤️ "Add to Wishlist" button on product pages  
✅ **Real-time dashboard** - Live updates with Socket.io  
✅ **Admin API integration** - Full Shopify API access  
✅ **Private custom app** - For your store only  

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Select your store** when prompted

4. **Install the app** via the provided URL

## Project Structure

```
wishlist/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx          # Dashboard with real-time stats
│   │   ├── api.wishlist.add.tsx    # Add to wishlist API
│   │   ├── api.wishlist.remove.tsx # Remove from wishlist API
│   │   └── api.wishlist.get.tsx    # Get wishlist API
│   ├── components/
│   │   └── RealtimeWishlistStats.tsx # Real-time stats component
│   └── socket.server.ts             # Socket.io server setup
├── extensions/
│   └── wishlist-button/
│       └── blocks/
│           └── wishlist_button.liquid # ❤️ button for product pages
└── shopify.app.toml                 # App configuration
```

## How It Works

### Data Storage
- Wishlist data is stored in customer metafields (`custom.wishlist`)
- No external database required
- Data format: JSON array of product IDs

### Theme Extension
- Adds a ❤️ button to product pages
- Only visible to logged-in customers
- Toggles between "Add to Wishlist" and "In Wishlist"

### Real-time Updates
- Socket.io provides live dashboard updates
- See wishlist changes instantly
- Track top wishlisted products

## API Endpoints

- `POST /api/wishlist/add` - Add product to wishlist
- `POST /api/wishlist/remove` - Remove product from wishlist
- `GET /api/wishlist/get?customerId=X` - Get customer's wishlist

## Configuration

### Required Scopes
- `read_customers`
- `write_customers`
- `read_products`
- `write_products`

### Environment Variables
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_ACCESS_TOKEN=your_access_token
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- VPS (Ubuntu/Debian)
- Vercel
- Other hosting platforms

## Frontend Setup

### Quick Setup (3 steps):
1. **Add wishlist button** to product pages (Theme Customizer)
2. **Create wishlist page** (Pages → Add page)
3. **Add to navigation** (Navigation → Add menu item)

📖 **[QUICK_START.md](./QUICK_START.md)** - Get started in 10 minutes

📖 **[ADD_TO_PRODUCT_CARDS.md](./ADD_TO_PRODUCT_CARDS.md)** - Add ❤️ to every product card

📖 **[THEME_EXAMPLES.md](./THEME_EXAMPLES.md)** - Theme-specific code examples

📖 **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Complete customization guide

### What Customers Get:
- ❤️ Floating wishlist button on every product card (collections, search, etc.)
- ❤️ "Add to Wishlist" button on product pages
- Full wishlist page at `/pages/wishlist`
- Wishlist icon in header with count badge
- Add to cart directly from wishlist
- Toast notifications
- Real-time count updates

## Development

### Add New Features
- API routes go in `app/routes/api.*.tsx`
- Dashboard components in `app/components/`
- Theme blocks in `extensions/wishlist-button/blocks/`

### Testing
```bash
# Run in dev mode
npm run dev

# Build for production
npm run build

# Deploy
npm run deploy
```

## Troubleshooting

**Button not showing:**
- Ensure customer is logged in
- Check theme extension is enabled in theme editor

**API errors:**
- Verify API credentials in `.env`
- Check scopes in `shopify.app.toml`

**Real-time not working:**
- Check browser console for Socket.io errors
- Verify WebSocket support on hosting platform

## Support

For issues or questions, check:
- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Remix Documentation](https://remix.run/docs)
- [Socket.io Documentation](https://socket.io/docs/)
