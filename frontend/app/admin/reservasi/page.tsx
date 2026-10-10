'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { ReservationStatus } from '@/models/reservation';
import { dateKeyInJakarta, formatDateIndo, formatDateTimeIndo } from '@/lib/slots';
import Pagination from '@/components/Pagination';
import DateRangeFilter from '@/components/DateRangeFilter';
import {
  isAlatReservation,
  isRuanganFacility,
  isAlatFacility,
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
} from '@/models/facilities-data';

const STATUS_CONFIG: Record<ReservationStatus, { pillClass: string; label: string }> = {
  menunggu: { pillClass: 'busy', label: 'Menunggu' },
  disetujui: { pillClass: 'avail', label: 'Disetujui' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
  dibatalkan: { pillClass: 'neutral', label: 'Dibatalkan' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
};

function AdminReservasiContent() {
  const { reservations, facilities, facilityById } = useAppData();
  const searchParams = useSearchParams();
  const tipeParam = searchParams.get('tipe');

  const [tabType, setTabType] = useState<'semua' | 'ruangan' | 'alat'>(() => {
    if (tipeParam === 'alat') return 'alat';
    if (tipeParam === 'ruangan') return 'ruangan';
    return 'semua';
  });
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [filterFacility, setFilterFacility] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const countRuangan = reservations.filter((r) => !isAlatReservation(r, facilityById(r.facilityId))).length;
  const countAlat = reservations.filter((r) => isAlatReservation(r, facilityById(r.facilityId))).length;

  // Filtered facilities for dropdown based on active tab
  const availableFacilities = useMemo(() => {
    if (tabType === 'ruangan') {
      return facilities.filter(isRuanganFacility);
    } else if (tabType === 'alat') {
      return facilities.filter(isAlatFacility);
    }
    return facilities;
  }, [facilities, tabType]);

  // Category options based on active tab
  const categoryOptions = useMemo(() => {
    const dynamicRuangan = Array.from(
      new Set(facilities.filter(isRuanganFacility).map((f) => f.type))
    ).filter(Boolean);
    const dynamicAlat = Array.from(
      new Set(facilities.filter(isAlatFacility).map((f) => f.type))
    ).filter(Boolean);
    const roomCats = Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...dynamicRuangan]));

    if (tabType === 'ruangan') {
      return [{ value: 'semua', label: 'Semua Kategori Ruangan' }, ...roomCats.map((c) => ({ value: c, label: c }))];
    } else if (tabType === 'alat') {
      return [{ value: 'semua', label: 'Semua Kategori Alat' }, ...dynamicAlat.map((c) => ({ value: c, label: c }))];
    }
    const all = Array.from(new Set([...roomCats, ...dynamicAlat]));
    return [{ value: 'semua', label: 'Semua Kategori' }, ...all.map((c) => ({ value: c, label: c }))];
  }, [facilities, tabType]);

  // Filtered reservations
  const filtered = reservations.filter((r) => {
    const fac = facilityById(r.facilityId);
    const isAlat = isAlatReservation(r, fac);

    if (tabType === 'ruangan' && isAlat) return false;
    if (tabType === 'alat' && !isAlat) return false;

    if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
    if (filterCategory !== 'semua' && fac?.type !== filterCategory) return false;
    if (filterFacility !== 'semua' && r.facilityId !== filterFacility) return false;
    const submittedDate = dateKeyInJakarta(r.createdAt);
    if (dateFrom && submittedDate < dateFrom) return false;
    if (dateTo && submittedDate > dateTo) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFac = fac?.name.toLowerCase().includes(q);
      const matchPemohon = r.pemohon.toLowerCase().includes(q);
      const matchTujuan = r.tujuan.toLowerCase().includes(q);
      return matchFac || matchPemohon || matchTujuan;
    }
    return true;
  });

  // Paginasi: 10 data per halaman
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset ke halaman 1 saat filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [tabType, filterStatus, filterCategory, filterFacility, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedReservations = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="content-head">
        <h2>Semua Reservasi Fasilitas</h2>
        <p>Log audit seluruh pengajuan reservasi ruangan dan alat kampus Universitas Diponegoro beserta status persetujuannya.</p>
      </div>

      {/* Sub-tab Switcher: Semua, Ruangan, Alat */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: '1px solid #E5E0D8',
          paddingBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setTabType('semua');
            setFilterCategory('semua');
            setFilterFacility('semua');
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: tabType === 'semua' ? '1px solid #181D24' : '1px solid #D5D0C7',
            background: tabType === 'semua' ? '#181D24' : '#FFFFFF',
            color: tabType === 'semua' ? '#FFFFFF' : '#4B5563',
            transition: 'all 0.15s ease',
          }}
        >
          Semua Reservasi ({reservations.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setTabType('ruangan');
            setFilterCategory('semua');
            setFilterFacility('semua');
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: tabType === 'ruangan' ? '1px solid #181D24' : '1px solid #D5D0C7',
            background: tabType === 'ruangan' ? '#181D24' : '#FFFFFF',
            color: tabType === 'ruangan' ? '#FFFFFF' : '#4B5563',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          Reservasi Ruangan ({countRuangan})
        </button>
        <button
          type="button"
          onClick={() => {
            setTabType('alat');
            setFilterCategory('semua');
            setFilterFacility('semua');
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: tabType === 'alat' ? '1px solid #181D24' : '1px solid #D5D0C7',
            background: tabType === 'alat' ? '#181D24' : '#FFFFFF',
            color: tabType === 'alat' ? '#FFFFFF' : '#4B5563',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          Reservasi Alat ({countAlat})
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'semua', label: 'Semua Status' },
            { key: 'menunggu', label: 'Menunggu' },
            { key: 'disetujui', label: 'Disetujui' },
            { key: 'ditolak', label: 'Ditolak' },
            { key: 'dibatalkan', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 4,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                border: filterStatus === tab.key ? '1px solid #b59876' : '1px solid #E5E0D8',
                background: filterStatus === tab.key ? '#15171a' : '#FFFFFF',
                color: filterStatus === tab.key ? '#b59876' : '#6B7280',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Side: Category, Facility Dropdown & Search */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {tabType !== 'semua' && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', background: '#FFFFFF' }}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', background: '#FFFFFF', maxWidth: 200 }}
          >
            <option value="semua">
              {tabType === 'ruangan' ? 'Semua Ruangan' : tabType === 'alat' ? 'Semua Alat' : 'Semua Fasilitas'}
            </option>
            {availableFacilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cari pemohon / fasilitas / tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', minWidth: 200 }}
          />
        </div>
      </div>

      <DateRangeFilter
        contextLabel="pengajuan reservasi"
        from={dateFrom}
        to={dateTo}
        onChange={({ from, to }) => {
          setDateFrom(from);
          setDateTo(to);
        }}
      />

      {/* Table Reservasi */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '7%' }}>Tipe</th>
                <th style={{ width: '23%' }}>Fasilitas &amp; Lokasi</th>
                <th style={{ width: '13%' }}>Waktu Reservasi</th>
                <th style={{ width: '15%' }}>Pemohon</th>
                <th style={{ width: '13%' }}>Jadwal Reservasi</th>
                <th style={{ width: '14%' }}>Keperluan Kegiatan</th>
                <th style={{ width: '9%' }}>Status</th>
                <th style={{ width: '6%' }}>Batal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#6B7280', padding: 28 }}>
                    Tidak ada data reservasi {tabType === 'ruangan' ? 'ruangan' : tabType === 'alat' ? 'alat' : 'fasilitas'} yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedReservations.map((r) => {
                  const fac = facilityById(r.facilityId);
                  const isAlat = isAlatReservation(r, fac);
                  const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* TIPE BADGE */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: isAlat ? '#FEF3C7' : '#EFF6FF',
                            color: isAlat ? '#92400E' : '#1E40AF',
                            border: isAlat ? '1px solid #FDE68A' : '1px solid #DBEAFE',
                          }}
                        >
                          {isAlat ? 'Alat' : 'Ruangan'}
                        </span>
                        {!isAlat && r.alat && r.alat.length > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontWeight: 700,
                              background: '#15171a',
                              color: '#b59876',
                              border: '1px solid #b59876',
                            }}
                          >
                            + {r.alat.length} Alat
                          </span>
                        )}
                      </div>
                    </td>

                    {/* FASILITAS */}
                    <td style={{ maxWidth: 280, minWidth: 170 }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>
                        {fac?.name || r.ruanganNama || `Fasilitas #${r.facilityId}`}
                      </div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2, wordBreak: 'break-word' }}>
                        {fac?.type || '-'} • {fac?.loc || '-'}
                      </div>
                      {!isAlat && r.alat && r.alat.length > 0 && (
                        <div
                          style={{
                            marginTop: 5,
                            padding: '4px 8px',
                            background: '#FAF8F5',
                            border: '1px solid #D5D0C7',
                            borderRadius: 4,
                            fontSize: 12,
                            color: '#181D24',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            flexWrap: 'wrap',
                            maxWidth: 320,
                            whiteSpace: 'normal',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#937654' }}>Alat dipinjam:</span>
                          <span style={{ fontWeight: 600 }}>
                            {r.alat.map((a) => `${a.nama} (${a.jumlah} unit)`).join(', ')}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* WAKTU RESERVASI */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13.5, color: '#4B5563' }}>
                      {formatDateTimeIndo(r.createdAt)}
                    </td>

                    {/* PEMOHON */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>{r.pemohon}</div>
                      {r.peserta && (
                        <div style={{ fontSize: 13, color: '#6B7280' }}>
                          {isAlat ? `Jumlah: ${r.peserta} unit` : `Estimasi: ${r.peserta} orang`}
                        </div>
                      )}
                      {!isAlat && r.alat && r.alat.length > 0 && (
                        <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>
                          ({r.alat.reduce((sum, a) => sum + a.jumlah, 0)} unit alat pendukung)
                        </div>
                      )}
                    </td>

                    {/* JADWAL */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>{formatDateIndo(r.tanggal)}</div>
                      <div style={{ fontSize: 13.5, color: '#b59876', fontWeight: 500 }}>
                        {r.start} - {r.end} WIB
                      </div>
                    </td>

                    {/* KEPERLUAN & CATATAN */}
                    <td style={{ maxWidth: 280, fontSize: 13, color: '#4B5563' }}>
                      <div>{r.tujuan}</div>
                      {r.catatanBatal && (
                        <div style={{ marginTop: 4, fontSize: 13, color: '#991B1B', fontStyle: 'italic' }}>
                          Alasan penolakan/batal: {r.catatanBatal}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 13 }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* WAKTU PEMBATALAN */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13.5, color: '#6B7280' }}>
                      {r.status === 'dibatalkan' ? formatDateTimeIndo(r.cancelledAt) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Paginasi Data */}
        <div style={{ padding: '0 20px 16px 20px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminSemuaReservasiPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: '#6B7280' }}>Memuat data reservasi...</div>}>
      <AdminReservasiContent />
    </Suspense>
  );
}
