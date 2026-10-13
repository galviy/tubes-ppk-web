// lib/validation.ts
// Aturan validasi yang dipakai lintas halaman (register dan form admin).
// Mesen pesan nomor induk: minus di depan dikenali sebagai angka negatif,
// bukan kelas "bukan angka".

export function pesanNomorInduk(
  value: string,
  label: string,
  minDigit: number,
  maxDigit?: number
): string {
  const v = value.trim();
  if (v.length === 0) return '';
  if (v.startsWith('-')) return `${label} tidak boleh negatif.`;
  if (!/^\d+$/.test(v)) return `${label} hanya boleh berisi angka.`;
  if (maxDigit !== undefined) {
    if (v.length < minDigit || v.length > maxDigit) {
      return `${label} harus ${minDigit} sampai ${maxDigit} digit angka.`;
    }
  } else if (v.length !== minDigit) {
    return `${label} harus tepat ${minDigit} digit angka.`;
  }
  if (Number(v) <= 0) return `${label} tidak boleh negatif.`;
  return '';
}

export function pesanAngkatan(value: string): string {
  const v = value.trim();
  if (v.length === 0) return '';
  if (v.startsWith('-')) return 'Tahun angkatan tidak boleh negatif.';
  if (!/^\d+$/.test(v)) return 'Tahun angkatan harus berupa angka.';
  if (Number(v) > 2030) return 'Tahun angkatan maksimal 2030.';
  if (Number(v) < 2015) return 'Tahun angkatan minimal 2015.';
  return '';
}

export function pesanKataSandi(value: string): string {
  if (value.length < 5) return 'Kata sandi minimal 5 karakter.';
  if (!/[A-Z]/.test(value)) return 'Kata sandi wajib mengandung minimal 1 huruf besar (A-Z).';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    return 'Kata sandi wajib mengandung minimal 1 karakter simbol (contoh: @, #, !, $).';
  }
  return '';
}
