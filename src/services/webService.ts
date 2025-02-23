/* eslint-disable @typescript-eslint/indent */
import { pathsEu, pathsGlobal } from "../constants/paths";
import { ZendureSolarflow } from "../main";
import axios, { AxiosRequestConfig } from "axios";
import { ISolarFlowDeviceDetails } from "../models/ISolarFlowDeviceDetails";

const config: AxiosRequestConfig = {
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "de-DE",
    appVersion: "4.3.1",
    "User-Agent": "Zendure/4.3.1 (iPhone; iOS 14.4.2; Scale/3.00)",
    Accept: "*/*",
    Authorization: "Basic Q29uc3VtZXJBcHA6NX4qUmRuTnJATWg0WjEyMw==",
    "Blade-Auth": "bearer (null)",
  },
  timeout: 10000,
};

/* eslint-disable @typescript-eslint/indent */
export const login = (adapter: ZendureSolarflow): Promise<string> => {
  if (adapter.accessToken) {
    return new Promise((resolve) => {
      if (adapter.accessToken) {
        resolve(adapter.accessToken);
      }
    });
  }

  const auth = Buffer.from(
    `${adapter.config.userName}:${adapter.config.password}`,
  ).toString("base64");

  if (!config || !config.headers) {
    return Promise.reject("No axios config!");
  }

  config.headers.Authorization = "Basic " + auth;

  const authBody = {
    password: adapter.config.password,
    account: adapter.config.userName,
    appId: "121c83f761305d6cf7b",
    appType: "iOS",
    grantType: "password",
    tenantId: "",
  };

  if (adapter.paths && adapter.paths.solarFlowTokenUrl) {
    return axios
      .post(adapter.paths.solarFlowTokenUrl, authBody, config)
      .then(function (response) {
        if (response.data.success) {
          adapter.log.info("Login to Rest API successful!");

          if (response.data?.data?.accessToken) {
            return response.data.data.accessToken;
          }
        }
      })
      .catch(function (error) {
        adapter.log.error(error);
        return Promise.reject("Failed to login to Zendure REST API!");
      });
  } else return Promise.reject("Path error!");
};

export const getDeviceList = (
  adapter: ZendureSolarflow,
): Promise<ISolarFlowDeviceDetails[]> => {
  //adapter.setState("errorMessage", "no_error");
  adapter.log.debug("Getting device list from Zendure Rest API!");

  if (adapter.accessToken && config && config.headers) {
    config.headers["Blade-Auth"] = "bearer " + adapter.accessToken;

    const body = {};

    let paths = undefined;

    if (adapter.config.server == "eu") {
      paths = pathsEu;
    } else {
      paths = pathsGlobal;
    }

    return axios
      .post(paths.solarFlowQueryDeviceListUrl, JSON.stringify(body), config)
      .then(function (response) {
        if (response.data.data && response.data.data.length > 0) {
          return response.data.data as ISolarFlowDeviceDetails[];
        } else {
          return [];
        }
      });
  } else {
    adapter.log.error("No Access Token found!");
    return Promise.reject("No Access Token found!");
  }
};

/* export const createDeveloperAccount = (adapter: ZendureSolarflow) => {
  adapter.log.info("Function createDeveloperAccount");

  adapter.setState("errorMessage", "");

  const body = {
    snNumber: adapter.snNumber,
    account: adapter.config.userName,
  };

  let paths = undefined;

  if (adapter.config.server == "eu") {
    paths = pathsEu;
  } else {
    paths = pathsGlobal;
  }

  return axios
    .post(paths.solarFlowDevRegisterUrl, JSON.stringify(body), config)
    .then(function (response) {
      adapter.log.info("Successfully created Developer Account!");

      if (response.data && response.data.success == true) {
        return response.data.data;
      } else {
        console.warn("No Response Data!");
        return undefined;
      }
    })
    .catch(function (error) {
      adapter.setObjectNotExists("errorMessage", {
        type: "state",
        common: {
          name: "errorMessage",
          type: "string",
          role: "indicator",
          read: true,
          write: true,
        },
        native: {},
      });
      adapter.setState(
        "errorMessage",
        error.response?.data?.code + " - " + error.response.data.msg,
      );

      if (error.response?.data?.code && error.response?.data?.msg) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        adapter.log.error(
          "Failed to created Zendure Developer Account: " +
            error.response?.data?.code +
            " - " +
            error.response.data.msg,
        );
      }

      return Promise.reject("Failed to created Zendure Developer Account!");
    });
};*/
