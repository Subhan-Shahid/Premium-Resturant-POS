import { useState } from 'react'
import {
  CalendarDays,
  Plus,
  Users,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Reservations() {
  const {
    reservations,
    tables,
    addReservation,
    cancelReservation,
    seatReservation,
  } = useStore()

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
  const [modalOpen, setModalOpen] = useState(false)

  // Form
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [resDate, setResDate] = useState(new Date().toISOString().slice(0, 10))
  const [resTime, setResTime] = useState('19:30')
  const [tableId, setTableId] = useState(tables[0]?.id || '')
  const [specialRequest, setSpecialRequest] = useState('')

  const filteredReservations = reservations.filter((r) => r.date === dateFilter)

  const totalGuests = filteredReservations.reduce((acc, r) => acc + Number(r.partySize || 0), 0)
  const confirmedCount = filteredReservations.filter((r) => r.status === 'confirmed').length
  const seatedCount = filteredReservations.filter((r) => r.status === 'seated').length

  const handleCreateReservation = (e) => {
    e.preventDefault()
    if (!guestName.trim() || !phone.trim()) return

    const selectedTable = tables.find((t) => t.id === tableId)

    addReservation({
      guestName: guestName.trim(),
      phone: phone.trim(),
      partySize: Number(partySize) || 2,
      date: resDate,
      time: resTime,
      tableId,
      tableName: selectedTable?.name || 'T-1',
      specialRequest: specialRequest.trim(),
    })

    setGuestName('')
    setPhone('')
    setSpecialRequest('')
    setModalOpen(false)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
            <CalendarDays size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Table Bookings & Reservations
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Manage guest seating, dining schedules, and VIP requests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <Plus size={16} />
            <span>Book Table</span>
          </button>
        </div>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Bookings</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {filteredReservations.length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Guests Expected</p>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{totalGuests}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Confirmed (Awaiting)</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{confirmedCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Seated Guests</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {seatedCount}
          </p>
        </div>
      </div>

      {/* ─── RESERVATIONS LIST ─── */}
      <div className="bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500">
            <CalendarDays size={36} className="mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-sm">No reservations for {dateFilter}</p>
            <p className="text-xs mt-1">Click "Book Table" above to schedule a guest arrival.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {filteredReservations.map((res) => {
              const isConfirmed = res.status === 'confirmed'
              const isSeated = res.status === 'seated'
              const isCancelled = res.status === 'cancelled'

              return (
                <div
                  key={res.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Left: Guest Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {res.guestName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isSeated
                            ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : isConfirmed
                            ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        <strong>{res.time}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        <span>{res.partySize} Guests</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                        <span>Table: {res.tableName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={13} />
                        <span>{res.phone}</span>
                      </span>
                    </div>

                    {res.specialRequest && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic pt-1">
                        "{res.specialRequest}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {isConfirmed && (
                      <button
                        onClick={() => seatReservation(res.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <CheckCircle2 size={15} />
                        <span>Seat Guests</span>
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => cancelReservation(res.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Cancel reservation"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL: NEW RESERVATION ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateReservation}
            className="w-full max-w-md bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="text-orange-500" size={18} />
                <span>Book Guest Reservation</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Guest Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    Phone Number:
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    Party Size (Guests):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    Time:
                  </label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Assign Table:
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-slate-900">
                      {t.name} ({t.section}) - {t.capacity} seats ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Special Occasion / Request:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday candles, quiet corner, window view"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
              >
                Save Reservation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

