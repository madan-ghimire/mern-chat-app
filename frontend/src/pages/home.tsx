import { useState } from "react";
import { Container, Box, Text, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { LuUser, LuLogIn } from "react-icons/lu";
import Login from "@/components/authentication/login";
import Signup from "@/components/authentication/signup";

const Home = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Container maxW="xl" centerContent>
      <Box
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
        <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed">
          <TabList>
            <Tab>
              <LuLogIn />
              Login
            </Tab>
            <Tab>
              <LuUser />
              Sign Up
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Home;
