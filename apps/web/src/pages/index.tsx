import { Flex } from "@chakra-ui/react";
import { LandingHero } from "~/components/LandingHero";
import { PricingTable } from "~/components/PricingTable";
import { LandingLayout } from "~/layouts/LandingLayout";

const Home = () => {
  return (
    <Flex direction="column">
      <LandingHero />
      <PricingTable />
    </Flex>
  );
};

Home.getLayout = (page: React.ReactNode) => (
  <LandingLayout>{page}</LandingLayout>
);

export default Home;
