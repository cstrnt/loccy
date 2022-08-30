import React from "react";
import { GetStaticProps } from "next";
import { getLocaleProps, useChangeLocale, useI18n } from "../locales";

const Home = () => {
  const { t, scopedT } = useI18n();
  const changeLocale = useChangeLocale();

  return (
    <div>
      <h1>SSG</h1>
      <p>{t("landing.title", { name: "test" })}</p>
      <p>{t("myNameIs", { name: t("myName") })}</p>
      <button type="button" onClick={() => changeLocale("en")}>
        EN
      </button>
      <button type="button" onClick={() => changeLocale("de")}>
        DE
      </button>
    </div>
  );
};

// Comment this to disable SSR of initial locale
export const getStaticProps: GetStaticProps = getLocaleProps();

export default Home;
