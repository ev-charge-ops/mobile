function getStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export async function getSecureItem(key: string) {
  return getStorage()?.getItem(key) ?? null;
}

export async function setSecureItem(key: string, value: string) {
  getStorage()?.setItem(key, value);
}

export async function deleteSecureItem(key: string) {
  getStorage()?.removeItem(key);
}
