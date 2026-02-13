export async function fetchWithRetries(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    // Just try again
  }
  try {
    return await fetch(url);
  } catch {
    // Just try again
  }
  try {
    return await fetch(url);
  } catch {
    // Just try again
  }
  // Throws this time
  return await fetch(url);
}
