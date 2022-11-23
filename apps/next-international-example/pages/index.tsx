import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { getLocaleProps, useI18n } from "../lib/locales";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { t } = useI18n();
  return <h1>{t("landing.title")}</h1>;
};

export const getStaticProps = getLocaleProps();

export default Home;
