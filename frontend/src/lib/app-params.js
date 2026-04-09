const isNode = typeof window === 'undefined';

const windowObj = isNode
  ? { localStorage: new Map(), location: { search: "", pathname: "", hash: "" } }
  : window;

const storage = {
  getItem: (key) =>
    isNode ? windowObj.localStorage.get(key) : window.localStorage.getItem(key),
  setItem: (key, value) =>
    isNode ? windowObj.localStorage.set(key, value) : window.localStorage.setItem(key, value),
  removeItem: (key) =>
    isNode ? windowObj.localStorage.delete(key) : window.localStorage.removeItem(key),
};

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const getAppParamValue = (
  paramName,
  { defaultValue = undefined, removeFromUrl = false } = {}
) => {
  if (isNode) return defaultValue;

  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);

  if (removeFromUrl && searchParam) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }

  if (defaultValue !== undefined && defaultValue !== null) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }

  const storedValue = storage.getItem(storageKey);
  if (storedValue) return storedValue;

  return null;
};

const getAppParams = () => {
  if (!isNode && getAppParamValue("clear_access_token") === 'true') {
    storage.removeItem('base44_access_token');
    storage.removeItem('token');
  }

  return {
    appId: getAppParamValue("app_id", {
      defaultValue: import.meta.env.VITE_BASE44_APP_ID,
    }),
    token: getAppParamValue("access_token", {
      removeFromUrl: true,
    }),
    fromUrl: !isNode ? window.location.href : "",
    functionsVersion: getAppParamValue("functions_version", {
      defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || "v1",
    }),
    appBaseUrl: getAppParamValue("app_base_url", {
      defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL || "",
    }),
  };
};

export const appParams = {
  ...getAppParams(),
};