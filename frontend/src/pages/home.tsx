import { useState } from "react";
import { Container, Box, Text, Tabs } from "@chakra-ui/react";
import { LuUser, LuLogIn } from "react-icons/lu";
import Login from "@/components/authentication/login";
import Signup from "@/components/authentication/signup";

const Home = () => {
  const [tabValue, setTabValue] = useState("login");

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          fontSize="4xl"
          textAlign="center"
          fontFamily="work sans"
          color="black"
        >
          Real time chat app
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs.Root
          value={tabValue}
          onValueChange={(details) => setTabValue(details.value)}
          variant="plain"
          fitted
        >
          <Tabs.List bg="bg.muted" rounded="l3" p="1">
            <Tabs.Trigger value="login">
              <LuLogIn />
              Login
            </Tabs.Trigger>
            <Tabs.Trigger value="signup">
              <LuUser />
              Sign Up
            </Tabs.Trigger>
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>

          <Tabs.Content value="login">
            <Login />
          </Tabs.Content>
          <Tabs.Content value="signup">
            <Signup />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
};

export default Home;
