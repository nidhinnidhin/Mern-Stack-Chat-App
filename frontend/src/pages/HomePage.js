import React, { useEffect } from "react";
import { Box, Container, Tab, TabList, TabPanels, TabPanel, Tabs, Text } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useNavigate } from "react-router-dom";

const HomePage = () => {

  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if(user) navigate("/chats")
  },[navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={0}
        bg={"white"}
        w="100%"
        m="10px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="work sans" align="center">
          Lets Talk
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs variant="soft-rounded" >
          <TabList mb="1em">
            <Tab w="50%">Login</Tab>
            <Tab w="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login/>
            </TabPanel>
            <TabPanel>
              <Signup/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
