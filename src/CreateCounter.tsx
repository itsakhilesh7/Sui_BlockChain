// src/CreateCounter.tsx
import React, { useState } from 'react';
import { Box, Button, Flex, Text, TextField, Heading } from '@radix-ui/themes';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useNetworkVariable } from './networkConfig';
import { addCounterForAddress } from './localCounters';

export function CreateCounter({ onCreated }: { onCreated: (id: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable('counterPackageId');

  async function fetchTransactionWithRetry(digest: string, maxRetries = 5): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await suiClient.getTransactionBlock({
          digest,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showInput: true,
          },
        });
      } catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
    // Unreachable, but TS likes a return
    return null;
  }

  const handleCreate = () => {
    if (!currentAccount?.address) {
      alert('Connect your wallet first.');
      return;
    }
    setLoading(true);

    const txb = new Transaction();
    txb.moveCall({
      target: `${counterPackageId}::counter::create`,
      arguments: [],
    });

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: async (result) => {
          try {
            const txDetails = await fetchTransactionWithRetry(result.digest);

            // Try to find the created Counter objectId robustly
            let objectId: string | undefined;

            if (txDetails?.objectChanges) {
              const createdCounter = txDetails.objectChanges.find(
                (change: any) =>
                  change.type === 'created' &&
                  change.objectType &&
                  (change.objectType.includes('Counter') ||
                    change.objectType.includes(`${counterPackageId}::counter::Counter`))
              );
              if (createdCounter) {
                objectId = createdCounter.objectId;
              }
            }

            if (!objectId && txDetails?.effects?.created) {
              for (const c of txDetails.effects.created) {
                if (c.reference?.objectId) {
                  objectId = c.reference.objectId;
                  break;
                }
              }
            }

            if (objectId) {
              addCounterForAddress(currentAccount.address, {
                id: objectId,
                name: name || 'My Counter',
                isPublic: true,
                createdAt: new Date().toISOString(),
              });
              onCreated(objectId);
              setName('');
            } else {
              console.warn('Counter created but objectId not found in tx details:', txDetails);
              alert('Counter created. If it does not appear, refresh in a few seconds.');
            }
          } catch (e) {
            console.error('Failed to fetch tx details:', e);
            alert('Counter created. If it does not appear, refresh in a few seconds.');
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error('Create counter failed:', err);
          setLoading(false);
        },
      }
    );
  };

  return (
    <Box
      style={{
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 20,
        background: 'white',
      }}
    >
      <Heading size="3" mb="3">
        Create a New Counter
      </Heading>
      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Enter counter name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Flex gap="3">
          <Button onClick={handleCreate} disabled={loading} size="3">
            {loading ? 'Creating…' : 'Create Counter'}
          </Button>
          <Button
            variant="soft"
            color="gray"
            size="3"
            onClick={() => setName('')}
            disabled={!name || loading}
          >
            Clear
          </Button>
        </Flex>
        <Text size="1" color="gray">
          Counters are shared objects on Sui. New counters will appear in your dashboard and can be opened or incremented.
        </Text>
      </Flex>
    </Box>
  );
}
