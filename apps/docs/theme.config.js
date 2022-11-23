// theme.config.js
export default {
  projectLink: "https://github.com/loccy/loccy-app", // GitHub link in the navbar
  docsRepositoryBase:
    "https://github.com/loccy-app/loccy/blob/master/apps/docs", // base URL for the docs repository
  titleSuffix: " – Loccy",
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: false,
  logo: (
    <>
      <span className="mr-2 font-extrabold hidden md:inline">Loccy</span>
      <span className="text-gray-600 font-normal hidden md:inline">
        The next-gen localization tool
      </span>
    </>
  ),
  head: (
    <>
      <script></script>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Loccy: the LMS you will love" />
      <meta name="og:title" content="Nextra: the LMS you will love" />
    </>
  ),
};
