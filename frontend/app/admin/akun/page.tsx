'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import Pagination from '@/components/Pagination';
import { UNIT_PETUGAS, FAKULTAS_UNDIP, PRODI_UNDIP } from '@/config/site';
import { backendListProdi, backendDownloadAkunExport } from '@/lib/api';

function DownwardSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[] | string[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
  const selectedLabel = normalizedOptions.find((o) => o.value === value)?.label || value;
  const required = label.endsWith(' *');

  return (
    <div className="fgroup" ref={dropdownRef} style={{ position: 'relative' }}>
      <label>
        {required ? label.slice(0, -2) : label}
        {required && <> <span className="required-asterisk">*</span></>}
      </label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 6,
          border: open ? '1.5px solid #b59876' : '1px solid #D5D0C7',
          background: '#FFFFFF',
          color: '#181D24',
          fontSize: 14,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(181, 152, 118, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            color: '#6B7280',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #D5D0C7',
            borderRadius: 6,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: 13,
                  color: isSelected ? '#181D24' : '#4B5563',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  borderBottom: '1px solid #F3F0EB',
                  background: isSelected ? '#FAF8F5' : '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <span style={{ color: '#b59876', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function KelolaAkunPage() {
  const {
    pendingAccounts,
    registeredAccounts,
    registerAccountDirectly,
    toggleAccountStatus,
    verifyPendingAccount,
    deleteAccount,
    refreshAccounts,
    refreshPendingAccounts,
    currentUser,
  } = useAppData();

  useEffect(() => {
    refreshAccounts();
    refreshPendingAccounts();
  }, [refreshAccounts, refreshPendingAccounts]);

  const [tab, setTab] = useState<'daftar' | 'verifikasi'>('daftar');
  const [targetTipe, setTargetTipe] = useState<'petugas' | 'pengguna'>('petugas');
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Auto-dismiss floating popup banner setelah 5 detik
  useEffect(() => {
    if (!bannerNotice) return;
    const timer = setTimeout(() => {
      setBannerNotice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [bannerNotice]);

  // Form Fields
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [peran, setPeran] = useState('Petugas');
  const [unit, setUnit] = useState<string>(UNIT_PETUGAS[0]);
  const [fakultas, setFakultas] = useState<string>(FAKULTAS_UNDIP[0]);
  const [prodiOptions, setProdiOptions] = useState<string[]>([...PRODI_UNDIP]);
  const [prodi, setProdi] = useState<string>(PRODI_UNDIP[0]);
  const [angkatan, setAngkatan] = useState('2024');
  const [password, setPassword] = useState('Sipinjam2026!');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    backendListProdi().then((res) => {
      if (res.ok && res.data && res.data.length > 0) {
        setProdiOptions(res.data.map((p) => p.nama_prodi));
      }
    });
  }, []);

  // Search & Filter for Registered Accounts Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'semua' | 'pengguna' | 'mahasiswa' | 'dosen' | 'staf' | 'petugas' | 'admin'>('semua');
  const [userPage, setUserPage] = useState(1);
  const USER_PAGE_SIZE = 10;

  useEffect(() => {
    setUserPage(1);
  }, [searchQuery, filterRole, tab]);

  const [isExporting, setIsExporting] = useState(false);

  async function handleExportExcel() {
    const roleParam: string =
      filterRole === 'semua' || filterRole === 'pengguna' || filterRole === 'petugas' || filterRole === 'admin'
        ? filterRole
        : 'pengguna';
    setIsExporting(true);
    try {
      await backendDownloadAkunExport('excel', roleParam, searchQuery, 'rekap-akun-undip.xls');
    } finally {
      setIsExporting(false);
    }
  }

  // Modal State
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  function handleDeleteAccount(id: number, username: string, role: string) {
    const isSelf = Boolean(
      currentUser &&
      ((currentUser.id && (String(currentUser.id) === String(id) || currentUser.id === `backend-${id}` || currentUser.id.replace(/^backend-/, '') === String(id))) ||
       (currentUser.nama && currentUser.nama.toLowerCase().startsWith(username.toLowerCase())))
    );
    if (isSelf) {
      setBannerNotice({
        type: 'error',
        title: 'Aksi Ditolak',
        message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      subtitle: `Apakah Anda yakin ingin menghapus akun @${username} (Peran: ${role.toUpperCase()}) secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Akun',
      confirmVariant: 'danger',
      showInput: false,
      onConfirm: async () => {
        const res = await deleteAccount(id);
        if (res.ok) {
          setBannerNotice({
            type: 'success',
            title: 'Akun Berhasil Dihapus',
            message: res.message || `Akun @${username} berhasil dihapus dari sistem.`,
          });
        } else {
          setBannerNotice({
            type: 'error',
            title: 'Gagal Menghapus Akun',
            message: res.message || 'Terjadi kesalahan saat menghapus akun.',
          });
        }
      },
    });
  }

  function handleToggleStatus(id: number, username: string, currentStatus?: 'aktif' | 'nonaktif') {
    const isSelf = Boolean(
      currentUser &&
      ((currentUser.id && (String(currentUser.id) === String(id) || currentUser.id === `backend-${id}` || currentUser.id.replace(/^backend-/, '') === String(id))) ||
       (currentUser.nama && currentUser.nama.toLowerCase().startsWith(username.toLowerCase())))
    );
    if (isSelf) {
      setBannerNotice({
        type: 'error',
        title: 'Aksi Ditolak',
        message: 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.',
      });
      return;
    }

    const isCurrentlyActive = currentStatus !== 'nonaktif';
    setModalConfig({
      isOpen: true,
      title: isCurrentlyActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun',
      subtitle: `Apakah Anda yakin ingin ${isCurrentlyActive ? 'menonaktifkan' : 'mengaktifkan kembali'} akses akun @${username}?`,
      confirmText: isCurrentlyActive ? 'Nonaktifkan' : 'Aktifkan',
      confirmVariant: isCurrentlyActive ? 'warning' : 'success',
      showInput: false,
      onConfirm: async () => {
        const res = await toggleAccountStatus(id);
        if (res.ok) {
          setBannerNotice({
            type: 'success',
            title: 'Status Akun Diperbarui',
            message: res.message || `Status akun @${username} berhasil diubah.`,
          });
        }
      },
    });
  }

  // Credential Card after successful registration
  const [createdCredential, setCreatedCredential] = useState<{
    nama: string;
    username: string;
    email: string;
    nip: string;
    peran: string;
    unit: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function isPasswordValidBackend(p: string): boolean {
    return p.length >= 5 && /[A-Z]/.test(p) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
  }

  function handleGeneratePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Undip!';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '26';
    setPassword(pass);
  }

  function handleDaftar(e: React.FormEvent) {
    e.preventDefault();
    void doDaftar();
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function doDaftar() {
    if (isSubmitting) return;
    if (!nama.trim() || !email.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Data Belum Lengkap',
        subtitle: 'Silakan lengkapi nama lengkap dan email akun yang ingin didaftarkan.',
        confirmText: 'Lengkapi Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    if (username.trim().length < 5) {
      setModalConfig({
        isOpen: true,
        title: 'Username Tidak Valid',
        subtitle: 'Username akun harus berukuran minimal 5 karakter.',
        confirmText: 'Perbaiki',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    if (!isPasswordValidBackend(password.trim())) {
      setModalConfig({
        isOpen: true,
        title: 'Kata Sandi Belum Memenuhi Syarat',
        subtitle: 'Kata sandi harus minimal 5 karakter, serta wajib mengandung minimal 1 huruf kapital (A-Z) dan 1 simbol (@, !, #, dll).',
        confirmText: 'Perbaiki Sandi',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    if (targetTipe === 'pengguna') {
      if (peran === 'Dosen' && nip.trim().length !== 10) {
        setModalConfig({
          isOpen: true,
          title: 'NIDN Dosen Tidak Valid',
          subtitle: 'NIDN Dosen wajib tepat 10 digit karakter angka (contoh: 0012058001).',
          confirmText: 'Perbaiki',
          confirmVariant: 'warning',
          showInput: false,
          onConfirm: () => {},
        });
        return;
      }
      if (peran === 'Mahasiswa') {
        const yr = Number(angkatan.trim());
        if (!yr || yr < 2000 || yr > 2030) {
          setModalConfig({
            isOpen: true,
            title: 'Angkatan Mahasiswa Tidak Valid',
            subtitle: 'Tahun angkatan harus berupa angka 4 digit yang valid (contoh: 2024).',
            confirmText: 'Perbaiki',
            confirmVariant: 'warning',
            showInput: false,
            onConfirm: () => {},
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    let res: { ok: boolean; message?: string };
    try {
      res = await registerAccountDirectly({
        nama: nama.trim(),
        username: username.trim(),
        email: email.trim(),
        peran,
        nip: peran === 'Staf' || targetTipe === 'petugas' ? nip.trim() : undefined,
        nim: peran === 'Mahasiswa' ? nip.trim() : undefined,
        nidn: peran === 'Dosen' ? nip.trim() : undefined,
        angkatan: peran === 'Mahasiswa' ? Number(angkatan) || 2024 : undefined,
        prodi: (peran === 'Mahasiswa' || peran === 'Dosen') ? prodi : undefined,
        phone: phone.trim(),
        unit: targetTipe === 'petugas' ? unit : (peran === 'Staf' ? fakultas : prodi),
        password: password.trim() || 'Sipinjam2026!',
      });
    } finally {
      setIsSubmitting(false);
    }

    if (!res.ok) {
      setModalConfig({
        isOpen: true,
        title: 'Pendaftaran Gagal',
        subtitle: res.message || 'Akun dengan email tersebut sudah terdaftar.',
        confirmText: 'Mengerti',
        confirmVariant: 'danger',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    // Save for credential card display
    setCreatedCredential({
      nama: nama.trim(),
      username: username.trim(),
      email: email.trim(),
      nip: nip.trim() || '-',
      peran,
      unit: targetTipe === 'petugas' ? unit : (peran === 'Staf' ? fakultas : prodi),
      password: password.trim() || 'Sipinjam2026!',
    });
    setCopied(false);

    // Reset Form
    setUsername('');
    setNama('');
    setNip('');
    setEmail('');
    setPhone('');
    setPassword('Sipinjam2026!');
  }

  function handleCopyCredentials() {
    if (!createdCredential) return;
    const text = `KREDENSIAL AKUN SIPINJAM UNDIP\nNama: ${createdCredential.nama}\nUsername: ${createdCredential.username}\nNIP/NIM/NIDN: ${createdCredential.nip}\nEmail: ${createdCredential.email}\nPeran: ${createdCredential.peran}\nUnit/Prodi: ${createdCredential.unit}\nKata Sandi: ${createdCredential.password}\nPortal: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // Filter registered accounts (ikut GET /admin/show_user: id/username/email/role).
  const filteredAccounts = registeredAccounts.filter((acc) => {
    if (filterRole !== 'semua' && filterRole !== 'mahasiswa' && filterRole !== 'dosen' && filterRole !== 'staf') {
      if (acc.role !== filterRole) return false;
    } else if (filterRole !== 'semua') {
      // show_user tak membedakan sub-peran pengguna -> tampilkan semua pengguna.
      if (acc.role !== 'pengguna') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = acc.username.toLowerCase().includes(q);
      const matchEmail = acc.email.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const totalUserPages = Math.max(1, Math.ceil(filteredAccounts.length / USER_PAGE_SIZE));
  const paginatedAccounts = useMemo(() => {
    return filteredAccounts.slice((userPage - 1) * USER_PAGE_SIZE, userPage * USER_PAGE_SIZE);
  }, [filteredAccounts, userPage]);

  return (
    <div>
      <div className="content-head">
        <h2>Kelola akun</h2>
        <p>Pendaftaran akun resmi petugas sarpras, serta verifikasi pengajuan registrasi mandiri civitas akademika.</p>
      </div>

      {/* Prominent Feedback Banner */}
      {bannerNotice && (
        <div className={`status-banner ${bannerNotice.type}`}>
          <div>
            <div className="status-banner-badge">
              {bannerNotice.type === 'success' ? '✓ SUCCESS • BERHASIL' : '✕ FAILED • GAGAL'}
            </div>
            <div className="status-banner-title">{bannerNotice.title}</div>
            <div className="status-banner-desc">{bannerNotice.message}</div>
          </div>
          <button
            type="button"
            className="status-banner-close"
            onClick={() => setBannerNotice(null)}
          >
            ✕ Tutup
          </button>
        </div>
      )}

      <div className="subtabs">
        <button className={`subtab${tab === 'daftar' ? ' active' : ''}`} onClick={() => setTab('daftar')}>
          Daftarkan Akun (Petugas &amp; Pengguna)
        </button>
        <button className={`subtab${tab === 'verifikasi' ? ' active' : ''}`} onClick={() => setTab('verifikasi')}>
          Verifikasi Registrasi Mandiri ({pendingAccounts.filter((a) => a.status === 'menunggu').length})
        </button>
      </div>

      {tab === 'daftar' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card Notifikasi Kredensial Baru */}
          {createdCredential && (
            <div
              style={{
                background: '#FBF8F4',
                border: '1.5px solid #b59876',
                borderRadius: 8,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span style={{ fontWeight: 700, color: '#181D24', fontSize: 14 }}>
                    Akun Baru Berhasil Didaftarkan &amp; Langsung Aktif
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatedCredential(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 13 }}
                >
                  ✕ Tutup
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '1px solid #E5E0D8',
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13.5, fontWeight: 600 }}>NAMA LENGKAP</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.nama}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13.5, fontWeight: 600 }}>USERNAME</div>
                  <div style={{ fontWeight: 600, color: '#b59876' }}>@{createdCredential.username}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13.5, fontWeight: 600 }}>IDENTITAS (NIM/NIDN/NIP)</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.nip}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13.5, fontWeight: 600 }}>EMAIL LOGIN</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.email}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13.5, fontWeight: 600 }}>PERAN &amp; UNIT/PRODI</div>
                  <div style={{ fontWeight: 600, color: '#b59876' }}>
                    {createdCredential.peran} • {createdCredential.unit}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13.5, fontWeight: 600 }}>KATA SANDI SEMENTARA</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#181D24', fontSize: 14 }}>
                    {createdCredential.password}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  style={{
                    padding: '7px 14px',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 4,
                    border: '1px solid #b59876',
                    background: copied ? '#15171a' : '#FFFFFF',
                    color: copied ? '#b59876' : '#181D24',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copied ? 'Kredensial Tersalin!' : 'Salin Kredensial Akun'}</span>
                </button>
                <span style={{ fontSize: 14, color: '#6B7280' }}>
                  Bagikan informasi ini kepada staf/petugas terkait agar dapat segera login ke portal.
                </span>
              </div>
            </div>
          )}

          {/* Form Pendaftaran Akun */}
          <div className="panel" id="form-daftar">
            {/* Mode Switcher Buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setTargetTipe('petugas');
                  setPeran('Petugas');
                  setUnit(UNIT_PETUGAS[0]);
                  setUsername('');
                  setNama('');
                  setNip('');
                  setEmail('');
                  setPhone('');
                  setPassword('Sipinjam2026!');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: targetTipe === 'petugas' ? '1.5px solid #b59876' : '1px solid #D5D0C7',
                  background: targetTipe === 'petugas' ? '#15171a' : '#FFFFFF',
                  color: targetTipe === 'petugas' ? '#b59876' : '#6B7280',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>+ Tambah Akun Petugas &amp; Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetTipe('pengguna');
                  setPeran('Mahasiswa');
                  setFakultas(FAKULTAS_UNDIP[0]);
                  setProdi(PRODI_UNDIP[0]);
                  setAngkatan('2024');
                  setUsername('');
                  setNama('');
                  setNip('');
                  setEmail('');
                  setPhone('');
                  setPassword('Sipinjam2026!');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: targetTipe === 'pengguna' ? '1.5px solid #b59876' : '1px solid #D5D0C7',
                  background: targetTipe === 'pengguna' ? '#15171a' : '#FFFFFF',
                  color: targetTipe === 'pengguna' ? '#b59876' : '#6B7280',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>+ Tambah Akun Pengguna (Mhs / Dosen / Staf)</span>
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#181D24', margin: 0 }}>
                {targetTipe === 'petugas'
                  ? 'Formulir Pendaftaran Akun Petugas / Admin Baru'
                  : 'Formulir Pendaftaran Akun Pengguna Langsung Aktif'}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {targetTipe === 'petugas'
                  ? 'Daftarkan akun resmi Petugas atau Admin pengelola sarana prasarana Undip.'
                  : 'Daftarkan akun Mahasiswa, Dosen, atau Staf langsung terverifikasi dengan data akademik resmi.'}
              </p>
            </div>

            <form onSubmit={handleDaftar}>
              <div className="form-grid">
                {/* Username Akun (Wajib di semua endpoint backend) */}
                <div className="fgroup">
                  <label>Username Akun <span className="required-asterisk">*</span></label>
                  <input
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'Contoh: agus_petugas atau admin_sarpras'
                        : peran === 'Dosen'
                        ? 'Contoh: budi_dosen'
                        : peran === 'Staf'
                        ? 'Contoh: staf_sarpras01'
                        : 'Contoh: sinta2024'
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={5}
                  />
                  <span style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
                    Minimal 5 karakter alfanumerik.
                  </span>
                </div>

                {/* Nama Lengkap */}
                <div className="fgroup">
                  <label>Nama Lengkap <span className="required-asterisk">*</span></label>
                  <input
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'Contoh: Agus Supriyono, S.Kom.'
                        : peran === 'Dosen'
                        ? 'Contoh: Dr. Ir. Budi Santoso, M.T.'
                        : peran === 'Staf'
                        ? 'Contoh: Dewi Lestari, S.Kom.'
                        : 'Contoh: Sinta Rahmawati'
                    }
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>

                {/* Email Resmi */}
                <div className="fgroup">
                  <label>Email Resmi Undip <span className="required-asterisk">*</span></label>
                  <input
                    type="email"
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'nama.petugas@undip.ac.id'
                        : peran === 'Dosen'
                        ? 'nama.dosen@lecturer.undip.ac.id'
                        : peran === 'Staf'
                        ? 'nama.staf@staff.undip.ac.id'
                        : 'nama.mhs@students.undip.ac.id'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Peran Sistem */}
                <DownwardSelect
                  label={targetTipe === 'petugas' ? 'Peran Hak Akses *' : 'Kategori Pengguna *'}
                  value={peran}
                  onChange={(val) => {
                    setPeran(val);
                    setNip('');
                  }}
                  options={
                    targetTipe === 'petugas'
                      ? [
                          { value: 'Petugas', label: 'Petugas' },
                          { value: 'Admin', label: 'Admin' },
                        ]
                      : [
                          { value: 'Mahasiswa', label: 'Mahasiswa' },
                          { value: 'Dosen', label: 'Dosen' },
                          { value: 'Staf', label: 'Staf' },
                        ]
                  }
                />

                {/* Conditional fields based on role */}
                {targetTipe === 'petugas' ? (
                  <>
                    {/* Unit Kerja Petugas */}
                    <DownwardSelect
                      label="Unit Kerja / Lokasi Penugasan *"
                      value={unit}
                      onChange={setUnit}
                      options={UNIT_PETUGAS as unknown as string[]}
                    />

                    {/* NIP Petugas (Opsional) */}
                    <div className="fgroup">
                      <label>NIP Petugas / Pegawai</label>
                      <input
                        placeholder="Contoh: 198604152010121002"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                    </div>
                  </>
                ) : peran === 'Mahasiswa' ? (
                  <>
                    {/* NIM */}
                    <div className="fgroup">
                      <label>NIM (Nomor Induk Mahasiswa) <span className="required-asterisk">*</span></label>
                      <input
                        placeholder="Contoh: 24060122140123"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        required
                      />
                    </div>

                    {/* Angkatan */}
                    <div className="fgroup">
                      <label>Tahun Angkatan <span className="required-asterisk">*</span></label>
                      <input
                        type="number"
                        placeholder="Contoh: 2024"
                        value={angkatan}
                        onChange={(e) => setAngkatan(e.target.value)}
                        required
                      />
                    </div>

                    {/* Program Studi */}
                    <DownwardSelect
                      label="Program Studi *"
                      value={prodi}
                      onChange={setProdi}
                      options={prodiOptions}
                    />

                    {/* Fakultas */}
                    <DownwardSelect
                      label="Fakultas *"
                      value={fakultas}
                      onChange={setFakultas}
                      options={FAKULTAS_UNDIP as unknown as string[]}
                    />
                  </>
                ) : peran === 'Dosen' ? (
                  <>
                    {/* NIDN */}
                    <div className="fgroup">
                      <label>NIDN (Nomor Induk Dosen Nasional) <span className="required-asterisk">*</span></label>
                      <input
                        placeholder="Contoh: 0012058001 (10 digit)"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        maxLength={10}
                        required
                      />
                      <span style={{ fontSize: 13.5, color: '#6B7280', marginTop: 3 }}>
                        Tepat 10 digit angka NIDN dosen.
                      </span>
                    </div>

                    {/* Program Studi */}
                    <DownwardSelect
                      label="Homebase Program Studi *"
                      value={prodi}
                      onChange={setProdi}
                      options={prodiOptions}
                    />

                    {/* Fakultas */}
                    <DownwardSelect
                      label="Fakultas *"
                      value={fakultas}
                      onChange={setFakultas}
                      options={FAKULTAS_UNDIP as unknown as string[]}
                    />
                  </>
                ) : (
                  <>
                    {/* NIP Staf */}
                    <div className="fgroup">
                      <label>NIP (Nomor Induk Pegawai) <span className="required-asterisk">*</span></label>
                      <input
                        placeholder="Contoh: 198001012345"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        required
                      />
                    </div>

                    {/* Unit / Fakultas Staf */}
                    <DownwardSelect
                      label="Unit Kerja / Fakultas *"
                      value={fakultas}
                      onChange={setFakultas}
                      options={FAKULTAS_UNDIP as unknown as string[]}
                    />
                  </>
                )}

                {/* No. Telepon */}
                <div className="fgroup">
                  <label>No. HP / WhatsApp Aktif</label>
                  <input
                    placeholder="Contoh: 0812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Kata Sandi */}
                <div className="fgroup full">
                  <label>Kata Sandi <span className="required-asterisk">*</span></label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 240px' }}>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', fontFamily: showPass ? 'inherit' : 'monospace' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          color: '#6B7280',
                        }}
                      >
                        {showPass ? 'Sembunyikan' : 'Lihat'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      style={{
                        padding: '9px 14px',
                        fontSize: 14,
                        fontWeight: 600,
                        border: '1px solid #D5D0C7',
                        background: '#FAF8F5',
                        borderRadius: 6,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Acak Sandi Otomatis
                    </button>
                  </div>
                  <div style={{ fontSize: 13.5, color: '#6B7280', marginTop: 4 }}>
                    Kata sandi default: <code>Sipinjam2026!</code> (minimal 5 karakter, 1 huruf besar, dan 1 simbol).
                  </div>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 20 }}>
                <button type="submit" className="btn primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Mendaftarkan…'
                    : targetTipe === 'petugas'
                      ? 'Daftarkan Akun Petugas / Admin'
                      : 'Daftarkan Akun Pengguna'}
                </button>
              </div>
            </form>
          </div>

          {/* Section: Tabel Daftar Akun Terdaftar (Staf & Pengguna Aktif) */}
          <div className="panel table-scroll" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E0D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#181D24', margin: 0 }}>
                    Daftar Pengguna &amp; Petugas Terdaftar
                  </h3>
                  <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                    Seluruh akun aktif yang memiliki kredensial resmi pada platform SiPinjam Undip.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Cari nama, email, NIP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: 13, padding: '7px 14px', minWidth: 220, borderRadius: 6, border: '1px solid #D5D0C7' }}
                  />

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="btn secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {isExporting ? 'Mengunduh...' : 'Ekspor Excel'}
                  </button>
                </div>
              </div>

              {/* Role Filter Chips (ikut show_user: hanya role backend) */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {[
                  { key: 'semua', label: `Semua (${registeredAccounts.length})` },
                  { key: 'pengguna', label: `Pengguna (${registeredAccounts.filter((a) => a.role === 'pengguna').length})` },
                  { key: 'petugas', label: `Petugas (${registeredAccounts.filter((a) => a.role === 'petugas').length})` },
                  { key: 'admin', label: `Admin (${registeredAccounts.filter((a) => a.role === 'admin').length})` },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setFilterRole(chip.key as any)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 14,
                      fontWeight: 600,
                      borderRadius: 4,
                      border: filterRole === chip.key ? '1px solid #b59876' : '1px solid #E5E0D8',
                      background: filterRole === chip.key ? '#15171a' : '#FFFFFF',
                      color: filterRole === chip.key ? '#b59876' : '#6B7280',
                      cursor: 'pointer',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: 170 }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                      Tidak ditemukan akun yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedAccounts.map((acc) => {
                    const aktif = acc.isVerified !== false;
                    const isSelf = Boolean(
                      currentUser &&
                      ((acc.email && currentUser.email && acc.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
                       (acc.id && currentUser.id && (String(currentUser.id) === String(acc.id) || currentUser.id === `backend-${acc.id}` || currentUser.id.replace(/^backend-/, '') === String(acc.id))) ||
                       (acc.username && currentUser.nama && (currentUser.nama.toLowerCase() === acc.username.toLowerCase() || currentUser.nama.toLowerCase().startsWith(acc.username.toLowerCase()))))
                    );

                    return (
                    <tr key={acc.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{acc.id}</td>
                      <td style={{ fontWeight: 600, color: '#181D24' }}>@{acc.username}</td>
                      <td style={{ fontSize: 13 }}>{acc.email}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="pill avail" style={{ fontSize: 13.5 }}>
                          {acc.role === 'admin' ? 'Admin' : acc.role === 'petugas' ? 'Petugas' : 'Pengguna'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`pill ${aktif ? 'avail' : 'danger'}`} style={{ fontSize: 13.5 }}>
                          {aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {isSelf ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 12px',
                              fontSize: 12.5,
                              fontWeight: 600,
                              borderRadius: 4,
                              color: '#6B7280',
                              background: '#F3F4F6',
                              border: '1px solid #E5E7EB',
                            }}
                            title="Akun Anda sendiri yang sedang aktif digunakan, tidak dapat dinonaktifkan atau dihapus."
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            Akun Anda
                          </span>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(acc.id, acc.username, aktif ? 'aktif' : 'nonaktif')}
                              style={{
                                padding: '5px 10px',
                                fontSize: 13.5,
                                fontWeight: 600,
                                borderRadius: 4,
                                cursor: 'pointer',
                                border: aktif ? '1px solid #FECACA' : '1px solid #86EFAC',
                                background: aktif ? '#FEF2F2' : '#F0FDF4',
                                color: aktif ? '#DC2626' : '#166534',
                              }}
                            >
                              {aktif ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id, acc.username, acc.role)}
                              style={{
                                padding: '5px 10px',
                                fontSize: 13.5,
                                fontWeight: 600,
                                borderRadius: 4,
                                cursor: 'pointer',
                                border: '1px solid #DC2626',
                                background: '#DC2626',
                                color: '#FFFFFF',
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={userPage}
            totalPages={totalUserPages}
            totalItems={filteredAccounts.length}
            itemsPerPage={USER_PAGE_SIZE}
            onPageChange={setUserPage}
          />
        </div>
      ) : (
        /* Tab 2: Verifikasi Registrasi Mandiri */
        <div className="panel table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama &amp; Username</th>
                <th>Email &amp; Kontak</th>
                <th>Identitas Resmi</th>
                <th>Peran</th>
                <th>Program Studi / Unit</th>
                <th>Status</th>
                <th style={{ textAlign: 'left' }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                    Tidak ada akun menunggu verifikasi.
                  </td>
                </tr>
              )}
              {pendingAccounts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#181D24' }}>{a.nama}</div>
                    {a.username && (
                      <div style={{ fontSize: 13.5, color: '#b59876', fontFamily: 'monospace' }}>
                        @{a.username}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    <div>{a.email}</div>
                    <div style={{ fontSize: 13.5, color: '#6B7280' }}>{a.phone || '-'}</div>
                  </td>
                  <td>
                    {a.peran === 'Mahasiswa' ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>
                          NIM: {a.nim || '-'}
                        </div>
                        {a.angkatan && (
                          <div style={{ fontSize: 13.5, color: '#6B7280' }}>
                            Angkatan {a.angkatan}
                          </div>
                        )}
                      </div>
                    ) : a.peran === 'Dosen' ? (
                      <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>
                        NIDN: {a.nidn || a.nim || '-'}
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>
                        NIP: {a.nip || a.nim || '-'}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#b59876', fontSize: 14 }}>{a.peran}</span>
                  </td>
                  <td style={{ color: '#4B5563', fontSize: 13 }}>
                    {a.prodi
                      ? `Prodi ${a.prodi}`
                      : a.fakultas ||
                        (a.peran === 'Dosen'
                          ? 'Fakultas Teknik (FT)'
                          : 'Fakultas Sains dan Matematika (FSM)')}
                  </td>
                  <td>
                    {a.status === 'menunggu' && <span className="pill busy">Menunggu</span>}
                    {a.status === 'diverifikasi' && <span className="pill avail">Diverifikasi</span>}
                    {a.status === 'ditolak' && <span className="pill danger">Ditolak</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {a.status === 'menunggu' ? (
                      // Setujui + Tolak wired ke backend (tolak_mhs/dosen/staff).
                      <select
                        className="table-select-action"
                        value="menunggu"
                        onChange={(e) => {
                          const val = e.target.value;
                          e.target.value = 'menunggu';
                          if (val === 'setuju' || val === 'tolak') {
                            const approve = val === 'setuju';
                            void verifyPendingAccount(a.id, approve).then((res) => {
                              if (!res.ok) {
                                setModalConfig({
                                  isOpen: true,
                                  title: approve ? 'Verifikasi Gagal' : 'Penolakan Gagal',
                                  subtitle:
                                    res.message || 'Status verifikasi tidak dapat diproses.',
                                  confirmText: 'Mengerti',
                                  confirmVariant: 'danger',
                                  showInput: false,
                                  onConfirm: () => {},
                                });
                              }
                            });
                          }
                        }}
                      >
                        <option value="menunggu">Menunggu</option>
                        <option value="setuju">Setuju</option>
                        <option value="tolak">Tolak</option>
                      </select>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: 14 }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
