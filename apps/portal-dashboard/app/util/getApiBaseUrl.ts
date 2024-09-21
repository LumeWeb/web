const IPLoopbackRegex =
  /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

export default function getApiBaseUrl() {
  const currentUrl = window.location.href;
  const urlObject = new URL(currentUrl);

  // Check if we're on localhost or a local IP address
  if (
    urlObject.hostname === "localhost" ||
    urlObject.hostname.match(IPLoopbackRegex)
  ) {
    // For localhost, return false because we don't actually want to access any api's with the bundler server
    return false;
  }

  // Check if we're using an IP address (not localhost)
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(urlObject.hostname)) {
    // For IP addresses, assume the API is at the root
    return `${urlObject.protocol}//${urlObject.hostname}`;
  }

  // For FQDNs, extract the root domain
  const hostParts = urlObject.hostname.split(".");
  if (hostParts.length > 2) {
    const left = hostParts.length - 1;
    // Get the last two parts of the domain (e.g., 'example.com' from 'subdomain.example.com')
    const rootDomain = hostParts.slice(-left).join(".");
    return `${urlObject.protocol}//${rootDomain}`;
  }

  // If it's already a root domain (e.g., 'example.com')
  return `${urlObject.protocol}//${urlObject.hostname}`;
}
