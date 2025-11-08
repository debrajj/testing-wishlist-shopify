import { useEffect, useState } from "react";
import { Card, Text, BlockStack, Badge, InlineStack } from "@shopify/polaris";

interface RealtimeWishlistStatsProps {
  totalItems: number;
  totalCustomers: number;
}

export function RealtimeWishlistStats({ totalItems, totalCustomers }: RealtimeWishlistStatsProps) {
  const [stats, setStats] = useState({ 
    totalItems, 
    totalCustomers, 
    lastUpdate: new Date() 
  });
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Update stats when props change
    setStats({
      totalItems,
      totalCustomers,
      lastUpdate: new Date()
    });
  }, [totalItems, totalCustomers]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <Text as="h2" variant="headingMd">
            Real-time Stats
          </Text>
          <Badge tone={isConnected ? "success" : "critical"}>
            {isConnected ? "Live" : "Offline"}
          </Badge>
        </InlineStack>
        
        <BlockStack gap="300">
          <BlockStack gap="100">
            <div style={{ fontSize: '18px', fontWeight: '500' }}>Total Items:</div>
            <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1.2' }}>
              {stats.totalItems.toLocaleString()}
            </div>
          </BlockStack>
          
          <BlockStack gap="100">
            <div style={{ fontSize: '18px', fontWeight: '500' }}>Active Customers:</div>
            <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1.2' }}>
              {stats.totalCustomers.toLocaleString()}
            </div>
          </BlockStack>
          
          <div style={{ fontSize: '14px', color: '#6d7175' }}>
            Last updated: {stats.lastUpdate.toLocaleTimeString()}
          </div>
          
          <a 
            href="https://debrajroy.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              padding: '16px 24px',
              backgroundColor: '#008060',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              marginTop: '12px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#006e52'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#008060'}
          >
            New Link
          </a>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
