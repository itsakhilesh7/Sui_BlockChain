import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { isValidSuiObjectId } from '@mysten/sui.js/utils';
import { Box, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import { Counter } from './Counter';
import Dashboard from './Dashboard';
import { useNetworkVariable } from './networkConfig';

function App() {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable('counterPackageId');
  const [counterId, setCounterId] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const newCounterId = isValidSuiObjectId(hash) ? hash : null;
      console.log('Hash changed:', hash, 'Valid ID:', newCounterId);
      setCounterId(newCounterId);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: '1px solid var(--gray-a2)',
        }}
      >
        <Box>
          <Heading>Distributed Counter dApp</Heading>
          <Text size="1" color="gray">
            Package ID: {counterPackageId}
          </Text>
          {counterId && (
            <Text size="1" color="blue">
              Current Counter: {counterId}
            </Text>
          )}
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: 'var(--gray-a2)', minHeight: 500 }}
        >
          {currentAccount ? (
            counterId ? (
              <Counter id={counterId} />
            ) : (
              <Dashboard />
            )
          ) : (
            <Heading>Please connect your wallet</Heading>
          )}
        </Container>
      </Container>
    </>
  );
}

export default App;
