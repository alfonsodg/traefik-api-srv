const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Auth
  apikey: { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b40' },
  basicauth: { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b40' },
  digestauth: { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b40' },
  // Security
  waf: { bg: '#ef444415', text: '#f87171', border: '#ef444440' },
  // Identity
  jwt: { bg: '#a855f715', text: '#c084fc', border: '#a855f740' },
  jwtauth: { bg: '#a855f715', text: '#c084fc', border: '#a855f740' },
  oidc: { bg: '#a855f715', text: '#c084fc', border: '#a855f740' },
  hmac: { bg: '#a855f715', text: '#c084fc', border: '#a855f740' },
  ldap: { bg: '#a855f715', text: '#c084fc', border: '#a855f740' },
  forwardauth: { bg: '#a855f715', text: '#c084fc', border: '#a855f740' },
  // Traffic
  ratelimit: { bg: '#3b82f615', text: '#60a5fa', border: '#3b82f640' },
  distributedratelimit: { bg: '#3b82f615', text: '#60a5fa', border: '#3b82f640' },
  inflightreq: { bg: '#3b82f615', text: '#60a5fa', border: '#3b82f640' },
  // Resilience
  circuitbreaker: { bg: '#f9731615', text: '#fb923c', border: '#f9731640' },
  retry: { bg: '#f9731615', text: '#fb923c', border: '#f9731640' },
  // Cache
  httpcache: { bg: '#06b6d415', text: '#22d3ee', border: '#06b6d440' },
  // Network
  ipallowlist: { bg: '#10b98115', text: '#34d399', border: '#10b98140' },
  passtlsclientcert: { bg: '#10b98115', text: '#34d399', border: '#10b98140' },
  // Redirect
  redirectregex: { bg: '#0ea5e915', text: '#38bdf8', border: '#0ea5e940' },
  redirectscheme: { bg: '#0ea5e915', text: '#38bdf8', border: '#0ea5e940' },
  // Mock
  apimock: { bg: '#ec489915', text: '#f472b6', border: '#ec489940' },
  // Utility
  stripprefix: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  addprefix: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  replacepath: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  compress: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  headers: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  buffering: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  chain: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  stripprefixregex: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  contenttype: { bg: '#71717a15', text: '#a1a1aa', border: '#71717a40' },
  // Status
  enabled: { bg: '#10b98115', text: '#34d399', border: '#10b98140' },
  healthy: { bg: '#10b98115', text: '#34d399', border: '#10b98140' },
  active: { bg: '#10b98115', text: '#34d399', border: '#10b98140' },
  disabled: { bg: '#ef444415', text: '#f87171', border: '#ef444440' },
  unhealthy: { bg: '#ef444415', text: '#f87171', border: '#ef444440' },
  error: { bg: '#ef444415', text: '#f87171', border: '#ef444440' },
  warning: { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b40' },
}

const DEFAULT = { bg: '#71717a10', text: '#a1a1aa', border: '#71717a30' }

export function Badge({ type, label }: { type: string; label?: string }) {
  const c = COLORS[type.toLowerCase()] || DEFAULT
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.text,
      borderColor: c.border,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 9999,
      padding: '2px 10px',
      fontSize: 10,
      fontWeight: 600,
      display: 'inline-block',
    }}>
      {label || type}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge type={status} label={status} />
}

export function TypeBadge({ type }: { type: string }) {
  return <Badge type={type} />
}

// For middleware wizard cards
export function getTypeColor(type: string): string {
  const c = COLORS[type.toLowerCase()]
  return c ? c.border : '#71717a40'
}
