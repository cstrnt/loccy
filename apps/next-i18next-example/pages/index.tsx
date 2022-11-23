import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "../next-i18next.config";

const Home: NextPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <pre>{t("home:title")}</pre>
      <pre>{t("home:description")}</pre>
      <pre>{t("name", { name: "tim" })}</pre>
    </>
  );
};

export const getServerSideProps = async () => {
  return {
    props: {
      ...(await serverSideTranslations(
        "en",
        ["common", "home"],
        nextI18NextConfig
      )),
    },
  };
};

export default Home;
