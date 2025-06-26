import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const NotFound = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      textAlign="center"
      bg="white" // or gray.50 if you prefer
      zIndex={9999}
    >
      <VStack spaceY={6}>
        <Heading as="h1" size="4xl" color="red.500">
          404
        </Heading>
        <Text fontSize={{ base: "lg", md: "2xl" }} color="gray.600">
          Page Not Found
        </Text>
      </VStack>
    </Box>
  );
};

export default NotFound;
