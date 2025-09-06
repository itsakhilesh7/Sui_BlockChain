import { Transaction } from '@mysten/sui/transactions';
import { Button, Flex, Text, Heading } from '@radix-ui/themes';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { useNetworkVariable } from './networkConfig';
import { getCounterFields } from './utilsCounterHelpers';


export function Counter({ id }: { id: string }) {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable('counterPackageId');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data, isPending, error, refetch } = useSuiClientQuery('getObject', {
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  const executeMoveCall = (target: string) => {
    const txb = new Transaction();

    if (target.endsWith('set_value')) {
      txb.moveCall({
        arguments: [txb.object(id), txb.pure.u64(0)],
        target,
      });
    } else {
      txb.moveCall({
        arguments: [txb.object(id)],
        target,
      });
    }

    signAndExecute(
      {
        transaction: txb,
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  if (isPending) return <Text>Loading...</Text>;

  if (error) return <Text>Error: {error.message}</Text>;

  if (!data.data) return <Text>Not found</Text>;

  const ownedByCurrentAccount = getCounterFields(data.data)?.owner === currentAccount?.address;

  return (
    <>
      <Heading size="3">Counter {id}</Heading>

      <Flex direction="column" gap="2">
        <Text>Count: {getCounterFields(data.data)?.value}</Text>
        <Flex direction="row" gap="2">
          <Button onClick={() => executeMoveCall(`${counterPackageId}::counter::increment`)}>
            Increment
          </Button>
          {ownedByCurrentAccount ? (
            <Button onClick={() => executeMoveCall(`${counterPackageId}::counter::set_value`)}>
              Reset
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </>
  );
}


