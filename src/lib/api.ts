export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const isDemo = localStorage.getItem('demoMode') === 'true';
  const newInit = init || {};
  if (isDemo) {
    newInit.headers = {
      ...newInit.headers,
      'x-demo-mode': 'true'
    };
  }
  return fetch(input, newInit);
};
