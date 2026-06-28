import { X } from 'lucide-react'
import './Drawer.css'

export default function Drawer({ open, onClose, title, children, footer }) {
  return (
    <>
      <div className={`drawer-overlay ${open ? 'is-open' : ''}`} onClick={onClose} />
      <div className={`drawer ${open ? 'is-open' : ''}`}>
        <div className="drawer__header">
          <h3>{title}</h3>
          <button className="drawer__close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </>
  )
}
