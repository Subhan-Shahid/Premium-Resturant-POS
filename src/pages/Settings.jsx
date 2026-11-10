import { useState, useRef } from 'react'
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  UtensilsCrossed,
  Printer,
  Percent,
  Wifi,
  Building,
  Phone,
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  Trash2
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Settings() {
  const {
    settings,
    updateSettings,
    menuItems,
    tables,
    sales,
    inventory,
    reservations,
    expenses,
    users,
    clearTestData,
  } = useStore()

  const [companyName, setCompanyName] = useState(settings.companyName || 'Bella Vista Bistro')
  const [tagline, setTagline] = useState(settings.tagline || 'Artisanal Italian & Gourmet Grill')
  const [phone, setPhone] = useState(settings.phone || '+1 (555) 382-9012')
  const [address, setAddress] = useState(settings.address || '450 Gourmet Avenue, Suite 10, Downtown')
  const [currency, setCurrency] = useState(settings.currency || '$')
  const [salesTaxPercent, setSalesTaxPercent] = useState(settings.salesTaxPercent ?? 8)
  const [serviceChargePercent, setServiceChargePercent] = useState(settings.serviceChargePercent ?? 10)
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || 'GST-US-99214A')
  const [wifiPassword, setWifiPassword] = useState(settings.wifiPassword || 'bellavistaguest')
  const [logoDataUrl, setLogoDataUrl] = useState(settings.logoDataUrl || '')

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [backupMsg, setBackupMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleSave = (e) => {
    e.preventDefault()
    updateSettings({
      companyName,
      tagline,
      phone,
      address,
      currency,
      salesTaxPercent: Number(salesTaxPercent) || 0,
      serviceChargePercent: Number(serviceChargePercent) || 0,
      gstNumber,
      wifiPassword,
      logoDataUrl,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be smaller than 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoDataUrl(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoDataUrl('')
  }
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      restaurant: companyName,
      settings: {
        companyName,
        tagline,
        phone,
        address,
        currency,
        salesTaxPercent,
        serviceChargePercent,
        gstNumber,
        wifiPassword,
        logoDataUrl,
      },
      menuItems,
      tables,
      sales,
      inventory,
      reservations,
      expenses,
      users: users.map(u => ({ ...u, password: '***' })), // mask passwords in export
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute(
      'download',
      `dineflow-backup-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`
    )
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()

    setBackupMsg('Backup downloaded securely!')
    setTimeout(() => setBackupMsg(''), 4000)
  }

  // Import JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (!parsed.menuItems || !parsed.tables) {
          alert('Invalid DineFlow backup file format.')
          return
        }

        if (window.confirm('Are you sure you want to restore this backup? Current data will be replaced with the backup file.')) {
          useStore.setState({
            settings: { ...useStore.getState().settings, ...(parsed.settings || {}) },
            menuItems: parsed.menuItems || [],
            tables: parsed.tables || [],
            sales: parsed.sales || [],
            inventory: parsed.inventory || [],
            reservations: parsed.reservations || [],
            expenses: parsed.expenses || [],
          })
          setBackupMsg('Backup restored successfully!')
          setTimeout(() => setBackupMsg(''), 4000)
        }
      } catch (err) {
        alert('Failed to parse backup JSON file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-500">
            <SettingsIcon size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Restaurant Configuration
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Company profile, tax rates, currency, service charges & thermal receipt parameters
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Building size={16} className="text-orange-500" />
            <span>Business Profile & Contact</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Restaurant Name:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Tagline / Concept:
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Official Phone Number:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Tax Registration / GST ID:
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Address:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Restaurant Logo Upload */}
            <div className="sm:col-span-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-orange-500" />
                <span>Restaurant Logo (Used in App Header & Thermal Bill Receipts):</span>
              </label>

              <div className="flex flex-wrap items-center gap-4">
                {logoDataUrl ? (
                  <div className="relative group p-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 flex items-center gap-3">
                    <img
                      src={logoDataUrl}
                      alt="Restaurant Logo"
                      className="h-12 w-auto max-w-[140px] object-contain rounded-lg"
                    />
                    <div className="pr-2">
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Logo Uploaded</p>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 mt-0.5"
                      >
                        <Trash2 size={12} />
                        <span>Remove Logo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-orange-500 cursor-pointer bg-gray-50 dark:bg-white/[0.02] text-xs font-bold text-gray-700 dark:text-slate-300 transition-all">
                    <Upload size={15} className="text-orange-500" />
                    <span>Upload Logo Image (PNG / JPEG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                {logoDataUrl && (
                  <label className="text-xs font-semibold text-orange-500 hover:underline cursor-pointer">
                    <span>Change Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Taxes & Currency Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Percent size={16} className="text-orange-500" />
            <span>Billing, Taxes & Currency</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Currency Symbol:
              </label>
              <input
                type="text"
                placeholder="$"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Sales Tax / VAT (%):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={salesTaxPercent}
                onChange={(e) => setSalesTaxPercent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Dine-In Service Charge (%):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={serviceChargePercent}
                onChange={(e) => setServiceChargePercent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Guest Wi-Fi Password (Printed on Customer Bill):
              </label>
              <input
                type="text"
                placeholder="e.g. bellavistaguest"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* ─── DATA SECURITY & BACKUP CARD ─── */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Data Security, Persistence & Backups</span>
          </h2>

          <p className="text-xs text-gray-500 dark:text-slate-400">
            Your restaurant data is stored securely in browser local storage. Download an offline backup file regularly to ensure business continuity.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-bold text-gray-800 dark:text-white transition-colors"
            >
              <Download size={15} />
              <span>Export Offline Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-bold text-gray-800 dark:text-white transition-colors"
            >
              <Upload size={15} />
              <span>Restore from Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all active orders, KOTs, sales history, reservations, and expenses? This cannot be undone.')) {
                  clearTestData()
                  setBackupMsg('All testing & transactional data cleared successfully!')
                  setTimeout(() => setBackupMsg(''), 4000)
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-500 transition-colors"
            >
              <RotateCcw size={15} />
              <span>Wipe Testing / Transaction Data</span>
            </button>

            {backupMsg && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {backupMsg}
              </span>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          {savedSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Settings saved successfully!</span>
            </span>
          ) : <div />}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <Save size={16} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  )
}
