# Wishlist App - Deployment Guide

## Overview
This is a private Shopify custom app that uses:
- **Metafields** for data storage (no external database)
- **Theme App Extension** with ❤️ button on product pages
- **Real-time dashboard** with Socket.io
- **Admin API** for wishlist management

## Prerequisites
- Node.js 18+ installed
- Shopify Partner account
- Access to your Shopify store admin

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   - Select your store when prompted
   - The app will open in your browser

3. **Install the app:**
   - Follow the installation URL provided by the CLI
   - Approve the required permissions

## Deploy to VPS

### Option 1: Traditional VPS (Ubuntu/Debian)

1. **Setup server:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd wishlist
   npm install
   npm run build
   ```

3. **Configure environment:**
   ```bash
   # Create .env file
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_ACCESS_TOKEN=your_access_token
   SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
   SHOPIFY_APP_URL=https://your-domain.com
   ```

4. **Start with PM2:**
   ```bash
   pm2 start npm --name "wishlist-app" -- start
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

6. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - SHOPIFY_API_KEY
   - SHOPIFY_API_SECRET
   - SHOPIFY_ACCESS_TOKEN
   - SHOPIFY_SHOP_DOMAIN
   - SHOPIFY_APP_URL

**Note:** Socket.io real-time features may have limitations on Vercel's serverless platform. Consider using Vercel's Edge Functions or a separate WebSocket service.

## Update App URLs in Shopify Partner Dashboard

After deployment, update these URLs in your app settings:

1. **App URL:** `https://your-domain.com`
2. **Allowed redirection URL(s):** `https://your-domain.com/auth/callback`

## Enable Theme App Extension

1. Go to your Shopify admin
2. Navigate to Online Store > Themes
3. Click "Customize" on your active theme
4. In the theme editor, add the "Wishlist Button" block to product pages
5. Save and publish

## Testing

1. **Test wishlist functionality:**
   - Visit a product page
   - Click the ❤️ "Add to Wishlist" button
   - Verify it appears in the dashboard

2. **Test real-time updates:**
   - Open the dashboard in one browser
   - Add/remove wishlist items in another
   - Dashboard should update in real-time

## Monitoring

- Check PM2 logs: `pm2 logs wishlist-app`
- Monitor Socket.io connections in the dashboard
- Review Shopify API usage in Partner Dashboard

## Troubleshooting

**Wishlist button not appearing:**
- Ensure customer is logged in
- Check theme app extension is enabled
- Verify app proxy routes are configured

**Real-time updates not working:**
- Check Socket.io connection in browser console
- Verify WebSocket support on your hosting
- Ensure firewall allows WebSocket connections

**API errors:**
- Verify API credentials in .env
- Check API scopes include: read_customers, write_customers, read_products, write_products
- Review Shopify API rate limits
