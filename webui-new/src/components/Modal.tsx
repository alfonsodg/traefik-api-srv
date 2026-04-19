import { X } from 'lucide-react'

export function Modal({ open, onClose, color, children }: { open: boolean; onClose: () => void; color?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 800, maxHeight: '85vh', overflow: 'auto', margin: 16,
        borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: color || '#2AA2C1',
        background: `linear-gradient(135deg, rgba(24,24,27,0.95) 0%, rgba(9,9,11,0.98) 100%)`,
        backdropFilter: 'blur(20px)',
        borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 28,
        boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), 0 0 40px ${(color || '#2AA2C1')}15`,
      }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={16} /></button>
        {children}
      </div>
    </div>
  )
}
