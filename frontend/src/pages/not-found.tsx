import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => {
  return (
    <Flex
      height="100vh"
      width="100%"
      align="center"
      justify="center"
      bg="gray.50"
      px={6}
    >
      <Box textAlign="center">
        <VStack spacing={4}>
          <Heading
            as="h1"
            size="4xl"
            fontWeight="bold"
            color="red.500"
          >
            404
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            Sorry, the page you’re looking for doesn’t exist.
          </Text>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="blue"
            size="md"
            mt={2}
          >
            Go to Home
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default NotFound;
