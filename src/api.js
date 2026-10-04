let apiUrlPromise;

function getApiUrl() {
  if (!apiUrlPromise) {
    apiUrlPromise = fetch("/config.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Липсва config.json");
        }
        return response.json();
      })
      .then((config) => String(config.apiUrl || "").replace(/\/$/, ""))
      .then((url) => {
        if (!url) {
          throw new Error("В config.json липсва apiUrl");
        }
        return url;
      });
  }
  return apiUrlPromise;
}

async function request(path, options) {
  const apiUrl = await getApiUrl();
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Заявката не мина (${response.status})`);
  }
  return response.json();
}

export function fetchCategories() {
  return request("/api/categories/get-categories");
}

export function fetchItems() {
  return request("/api/items/get-item");
}

export function sendKitchenOrder(items) {
  return request("/api/kitchen/send-order", {
    method: "POST",
    body: JSON.stringify({
      tableName: "КИОСК",
      waiterName: "Киоск",
      items,
    }),
  });
}
