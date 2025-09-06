// src/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getCountersForAddress } from './localCounters';
import { Counter } from './Counter';
import { CreateCounter } from './CreateCounter';

export default function Dashboard() {
  const currentAccount = useCurrentAccount();
  const [counters, setCounters] = useState<any[]>([]);

  useEffect(() => {
    if (currentAccount?.address) {
      const stored = getCountersForAddress(currentAccount.address);
      setCounters(stored);
    }
  }, [currentAccount]);

  return (
    <Box
      style={{
        background: '#f9faff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <Heading
        size="4"
        mb="4"
        style={{
          color: '#2b3a67',
          borderBottom: '2px solid #e0e4f7',
          paddingBottom: 8,
        }}
      >
        Your Counters
      </Heading>

      <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
        Create and manage counters linked to your wallet.
      </Text>

      <CreateCounter
        onCreated={(id) => {
          if (currentAccount?.address) {
            const updated = getCountersForAddress(currentAccount.address);
            setCounters(updated);
          }
        }}
      />

      <Box mt="5">
        {counters.length === 0 ? (
          <Text size="2" color="gray">
            No counters yet — create one!
          </Text>
        ) : (
          <Flex gap="4" wrap="wrap">
            {counters.map((counter) => (
              <Box
                key={counter.id}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 16,
                  width: 240,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = 'scale(1.02)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <Heading size="3" style={{ color: '#34497c' }}>
                  {counter.name}
                </Heading>
                <Text size="1" color="gray">
                  ID: {counter.id.slice(0, 6)}...{counter.id.slice(-4)}
                </Text>

                <Flex mt="3" gap="2">
                  <Button
                    size="2"
                    onClick={() => (window.location.hash = counter.id)}
                  >
                    Open
                  </Button>
                  <Button
                    size="2"
                    variant="soft"
                    color="blue"
                    onClick={() => (window.location.hash = counter.id)}
                  >
                    +1
                  </Button>
                </Flex>
              </Box>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
