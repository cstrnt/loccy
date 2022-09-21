import { Flex } from "@chakra-ui/react";
import { LandingHero } from "~/components/LandingHero";
import { LandingLayout } from "~/layouts/LandingLayout";

const Home = () => {
  return (
    <Flex>
      <LandingHero />
    </Flex>
  );
};

Home.getLayout = (page: React.ReactNode) => (
  <LandingLayout>{page}</LandingLayout>
);

export default Home;
