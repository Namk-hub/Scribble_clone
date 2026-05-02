export function getOrCreateClientId() {
  let clientId = sessionStorage.getItem("clientId");
  if (!clientId) {
    clientId = Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("clientId", clientId);
  }
  return clientId;
}
