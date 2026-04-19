import { ArrowRight, Globe, GitBranch, Layers, Server } from 'lucide-react'
import { TypeBadge, StatusBadge } from '@/components/Badge'

type FlowProps = {
  router: any
}

function FlowBox({ icon, label, items, color }: { icon: React.ReactNode; label: string; items: string[]; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[120px] max-w-[200px]">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + '15', color }}>
        {icon}
      </div>
      <span className="text-[10px] text-zinc-500 uppercase font-semibold">{label}</span>
      <div className="flex flex-col gap-0.5 items-center">
        {items.map((item, i) => (
          <span key={i} className="text-xs text-zinc-300 text-center break-all" style={{ backgroundColor: color + '10', borderRadius: 6, padding: '2px 8px', borderWidth: 1, borderStyle: 'solid', borderColor: color + '25' }}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function Arrow() {
  return <ArrowRight size={20} className="text-zinc-600 shrink-0 mx-1" />
}

export function FlowDiagram({ router }: FlowProps) {
  const eps = router.entryPoints || []
  const mws = router.middlewares || []
  const svc = router.service || '—'

  return (
    <div className="flex items-start justify-center gap-2 py-4 overflow-x-auto">
      <FlowBox icon={<Globe size={18} />} label="Entrypoints" items={eps.length ? eps : ['default']} color="#3b82f6" />
      <Arrow />
      <FlowBox icon={<GitBranch size={18} />} label="Router" items={[router.rule?.substring(0, 50) || router.name]} color="#2AA2C1" />
      {mws.length > 0 && <>
        <Arrow />
        <FlowBox icon={<Layers size={18} />} label={`Middlewares (${mws.length})`} items={mws} color="#f97316" />
      </>}
      <Arrow />
      <FlowBox icon={<Server size={18} />} label="Service" items={[svc]} color="#10b981" />
      {router.tls && (
        <div className="absolute top-2 right-2">
          <span style={{ backgroundColor: '#10b98118', color: '#34d399', borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>TLS</span>
        </div>
      )}
    </div>
  )
}
