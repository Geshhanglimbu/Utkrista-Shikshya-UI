import { useState } from 'react'
import { toast } from 'react-toastify'
import { Save } from 'lucide-react'
import './Settings.css'

export default function Settings() {
  const [siteName, setSiteName] = useState('Utkrista Shikshya')

  return (
    <div className="settings-page">
      <div className="page-head">
        <div>
          <h1>Platform Settings</h1>
          <p>Manage global configuration for Utkrista Shikshya.</p>
        </div>
      </div>

      <div className="card settings-card">
        <h4>General</h4>
        <label>Platform Name
          <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        </label>
        <label>Support Email
          <input type="email" placeholder="support@utkristashikshya.com" />
        </label>
        <button className="btn btn-primary" onClick={() => toast.success('Settings saved')}>
          <Save size={15} /> Save Changes
        </button>
      </div>
    </div>
  )
}
