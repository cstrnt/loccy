class LoccyBackend {
  type = "backend";
  init(services, backendOptions, i18nextOptions) {
    /* use services and options */
    this.options = backendOptions;
    this.services = services;
  }
  async read(language, namespace, callback) {
    let branchName;
    if (typeof window === "undefined") {
      const cp = require("child_process");
      branchName = cp.execSync("git branch --show-current").toString();
    }

    const test = await fetch(
      `
      ${this.options.loccyRemoteUrl}/api/locales/${
        this.options.projectId
      }/${language}${branchName ? `?branchName=${branchName}` : ""}`
    );

    if (test.status === 200) {
      callback(null, await test.json());
      return;
    }
    /* return resources */
    callback("error", null);
  }

  // only used in backends acting as cache layer
  save(language, namespace, data) {
    // store the translations
  }

  create(languages, namespace, key, fallbackValue) {
    /* save the missing translation */
  }
}

LoccyBackend.type = "backend";

module.exports = LoccyBackend;
