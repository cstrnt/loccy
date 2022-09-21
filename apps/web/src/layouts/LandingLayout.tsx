import { Box } from "@chakra-ui/react";
import React from "react";
import { Header } from "~/components/LandingLayout/Header";

export const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <Box>{children}</Box>
    </>
  );
};
