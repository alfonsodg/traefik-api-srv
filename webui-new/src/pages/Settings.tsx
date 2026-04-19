import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Settings, ChevronRight } from 'lucide-react'
import { StaticConfigForm } from './forms'
import { Modal } from '@/components/Modal'

const SECTIONS = [
  { id: 'acme', title: 'ACME / Let\'s Encrypt', fields: [
    { key: 'email', label: 'Email', placeholder: 'admin@example.com' },
    { key: 'storage', label: 'Storage Path', placeholder: '/certificates/acme.json' },
    { key: 'dnsProvider', label: 'DNS Provider', options: ['cloudflare', 'route53', 'digitalocean', 'godaddy', 'namecheap', 'gcloud'] },
    { key: 'dnsResolvers', label: 'DNS Resolvers', placeholder: '1.1.1.1:53,8.8.8.8:53' },
  ]},
  { id: 'entrypoints', title: 'Entrypoints', fields: [
    { key: 'httpAddress', label: 'HTTP Address', placeholder: ':80' },
    { key: 'httpsAddress', label: 'HTTPS Address', placeholder: ':443' },
    { key: 'dashboardAddress', label: 'Dashboard Address', placeholder: ':8099' },
  ]},
  { id: 'providers', title: 'Providers', fields: [
    { key: 'docker', label: 'Docker/Swarm', options: ['disabled', 'docker', 'swarm'] },
    { key: 'fileFilename', label: 'File Provider Path', placeholder: '/etc/traefik/dynamic.yml' },
    { key: 'consulEndpoint', label: 'Consul Endpoint (optional)', placeholder: 'http://consul:8500' },
    { key: 'etcdEndpoints', label: 'etcd Endpoints (optional)', placeholder: 'http://etcd:2379' },
  ]},
  { id: 'observability', title: 'Observability', fields: [
    { key: 'metricsPrometheus', label: 'Prometheus Metrics', options: ['disabled', 'enabled'] },
    { key: 'metricsEntryPoint', label: 'Metrics EntryPoint', placeholder: 'traefik' },
    { key: 'tracingEndpoint', label: 'Tracing OTLP Endpoint (optional)', placeholder: 'http://jaeger:4318' },
    { key: 'accessLog', label: 'Access Log', options: ['disabled', 'enabled'] },
    { key: 'accessLogPath', label: 'Access Log Path', placeholder: '/var/log/traefik/access.log' },
  ]},
  { id: 'ai', title: 'AI Providers', fields: [
    { key: 'defaultProvider', label: 'Default Provider', options: ['openai', 'anthropic', 'ollama', 'azure', 'mistral'] },
    { key: 'openaiEndpoint', label: 'OpenAI Endpoint', placeholder: 'https://api.openai.com/v1' },
    { key: 'openaiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' },
    { key: 'anthropicEndpoint', label: 'Anthropic Endpoint', placeholder: 'https://api.anthropic.com/v1' },
    { key: 'anthropicKey', label: 'Anthropic API Key', type: 'password', placeholder: 'sk-ant-...' },
    { key: 'ollamaEndpoint', label: 'Ollama Endpoint', placeholder: 'http://localhost:11434/v1' },
  ]},
  { id: 'mcp', title: 'MCP Servers', fields: [
    { key: 'server1Name', label: 'Server 1 Name', placeholder: 'filesystem' },
    { key: 'server1Endpoint', label: 'Server 1 Endpoint', placeholder: 'http://mcp-fs:3000' },
    { key: 'server1Protocol', label: 'Server 1 Protocol', options: ['stdio', 'http', 'sse'] },
    { key: 'server2Name', label: 'Server 2 Name', placeholder: 'database' },
    { key: 'server2Endpoint', label: 'Server 2 Endpoint', placeholder: 'http://mcp-db:3100' },
    { key: 'server2Protocol', label: 'Server 2 Protocol', options: ['stdio', 'http', 'sse'] },
  ]},
]

const SECTION_COLORS: Record<string, string> = { acme: '#10b981', entrypoints: '#3b82f6', providers: '#a855f7', observability: '#f59e0b', ai: '#06b6d4', mcp: '#f97316' }

export function SettingsPage() {
  const [active, setActive] = useState<string | null>(null)
  const sec = SECTIONS.find(s => s.id === active)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-zinc-500 hover:text-white"><ArrowLeft size={20} /></Link>
        <Settings size={24} className="text-brand" />
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>
      <p className="text-sm text-zinc-500">Configure static settings. Changes require a reload to take effect.</p>

      {sec && (
        <Modal open={true} onClose={() => setActive(null)} color={SECTION_COLORS[sec.id]}>
          <StaticConfigForm section={sec.id} title={sec.title} fields={sec.fields} onDone={() => setActive(null)} />
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left group transition-all hover:border-zinc-600 hover:shadow-lg cursor-pointer" style={{ borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: SECTION_COLORS[s.id] || '#71717a' }}>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">{s.title}</h3>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </div>
            <p className="text-xs mt-2"><span style={{ backgroundColor: SECTION_COLORS[s.id] + '18', color: SECTION_COLORS[s.id], borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>{s.fields.length} settings</span></p>
          </button>
        ))}
      </div>
    </div>
  )
}
