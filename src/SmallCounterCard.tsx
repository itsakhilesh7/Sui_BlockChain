import React from 'react';
import { Box, Heading, Text, Flex, Button } from '@radix-ui/themes';
import { useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { getCounterFields } from './utilsCounterHelpers';
import { StoredCounter } from './localCounters';

function shortId(id: string) {
  return `${id.slice(0, 6)}...${id.slice(-6)}`;
}

export default function SmallCounterCard({
  counter,
  counterPackageId,
  address,
}: {
  counter: StoredCounter;
  counterPackageId: string;
  address?: string;
}) {
  const { data, refetch } = useSuiClientQuery('getObject', {
    id: counter.id,
    options: { showContent: true, showOwner: true },
  });

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const fields = getCounterFields(data?.data);
  const value = fields?.value ?? '—';
  const isOwner = fields?.owner === address;

  const doIncrement = () => {
    const txb = new Transaction();
    txb.moveCall({
      arguments: [txb.object(counter.id)],
      target: `${counterPackageId}::counter::increment`,
    });
    signAndExecute({ transaction: txb }, { onSuccess: () => refetch() });
  };

  const doReset = () => {
    const txb = new Transaction();
    txb.moveCall({
      arguments: [txb.object(counter.id), txb.pure.u64(0)],
      target: `${counterPackageId}::counter::set_value`,
    });
    signAndExecute({ transaction: txb }, { onSuccess: () => refetch() });
  };

  return (
    <Box
      style={{
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        background: 'white',
      }}
    >
      <Flex justify="between" align="center">
        <Box>
          <Heading size="2">{counter.name ?? 'Unnamed Counter'}</Heading>
          <Text size="1" color="gray">{shortId(counter.id)}</Text>
        </Box>
        <Flex direction="column" gap="2" align="end">
          <Text size="2">Value: {value}</Text>
          <Flex gap="2">
            <Button size="2" onClick={() => (window.location.hash = counter.id)}>
              Open
            </Button>
            <Button size="2" onClick={doIncrement}>+1</Button>
            {isOwner && <Button size="2" color="red" onClick={doReset}>Reset</Button>}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
