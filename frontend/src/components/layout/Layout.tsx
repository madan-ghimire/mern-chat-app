import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box as="main" flex={1} bg={bgColor}>
        <Outlet />
      </Box>
    </Flex>
  );
};

export default Layout;
