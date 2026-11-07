import { useState } from 'react'
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
  MapPin
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Settings() {
  const { settings, updateSettings } = useStore()

  const [companyName, setCompanyName] = useState(settings.companyName || 'Bella Vista Bistro')
  const [tagline, setTagline] = useState(settings.tagline || 'Artisanal Italian & Gourmet Grill')
  const [phone, setPhone] = useState(settings.phone || '+1 (555) 382-9012')
  const [address, setAddress] = useState(settings.address || '450 Gourmet Avenue, Suite 10, Downtown')
  const [currency, setCurrency] = useState(settings.currency || '$')
  const [salesTaxPercent, setSalesTaxPercent] = useState(settings.salesTaxPercent ?? 8)
  const [serviceChargePercent, setServiceChargePercent] = useState(settings.serviceChargePercent ?? 10)
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || 'GST-US-99214A')
  const [wifiPassword, setWifiPassword] = useState(settings.wifiPassword || 'bellavistaguest')

  const [savedSuccess, setSavedSuccess] = useState(false)

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
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
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
