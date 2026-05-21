export async function readVaultGate(path: string): Promise<
  { available: true; content: unknown } | { available: false; reason: string }
> {
  const url = process.env.VAULT_GATE_URL;
  const token = process.env.VAULT_GATE_TOKEN;
  if (!url || !token) return { available: false, reason: 'VAULT_GATE_URL or VAULT_GATE_TOKEN is not configured' };

  const endpoint = new URL('/read', url);
  endpoint.searchParams.set('path', path);
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return { available: false, reason: `Vault gate returned ${response.status}` };
  return { available: true, content: await response.json() };
}
