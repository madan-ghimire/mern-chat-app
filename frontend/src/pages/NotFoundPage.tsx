import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Box>
          <Heading as="h1" size="2xl" mb={4}>
            404
          </Heading>
          <Text fontSize="xl" color="gray.600" mb={8}>
            Oops! Page not found
          </Text>
          <Text mb={8}>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Button as={RouterLink} to="/" colorScheme="blue" size="lg">
            Go to Home
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default NotFoundPage;
