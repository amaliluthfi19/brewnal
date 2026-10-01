const messages = {
  id: {
    'auth.invalid_credentials': 'Email atau password salah',
    'auth.email_taken': 'Email sudah digunakan',
    'auth.username_taken': 'Username sudah digunakan',
    'auth.user_not_found': 'User tidak ditemukan',
    'auth.register_success': 'Registrasi berhasil',
    'auth.logout_success': 'Berhasil logout',
    'auth.unauthorized': 'Tidak memiliki akses',
    'beans.not_found': 'Data biji kopi tidak ditemukan',
    'beans.created': 'Biji kopi berhasil ditambahkan',
    'beans.updated': 'Data biji kopi berhasil diperbarui',
    'beans.deleted': 'Biji kopi berhasil dihapus',
    'beans.photo_updated': 'Foto biji kopi berhasil disimpan',
    'beans.photo_deleted': 'Foto biji kopi berhasil dihapus',
    'beans.photo_not_found': 'Foto biji kopi tidak ditemukan',
    'beans.photo_invalid': 'Foto harus berupa JPEG, PNG, atau WebP',
    'beans.photo_too_large': 'Ukuran foto maksimal 5 MB',
    'error.storage_unavailable': 'Penyimpanan foto belum tersedia',
    'brew.not_found': 'Jurnal brew tidak ditemukan',
    'brew.created': 'Jurnal brew berhasil disimpan',
    'brew.updated': 'Jurnal brew berhasil diperbarui',
    'brew.deleted': 'Jurnal brew berhasil dihapus',
    'ai.scan_failed': 'Gagal membaca kemasan, coba foto yang lebih jelas',
    'ai.scan_success': 'Kemasan berhasil dipindai',
    'profile.identity_updated': 'Brewer identity berhasil diperbarui',
    'error.server': 'Terjadi kesalahan, coba lagi',
    'error.validation': 'Data yang dikirim tidak valid',
    'error.not_found': 'Data tidak ditemukan',
  },
  en: {
    'auth.invalid_credentials': 'Invalid email or password',
    'auth.email_taken': 'Email is already taken',
    'auth.username_taken': 'Username is already taken',
    'auth.user_not_found': 'User not found',
    'auth.register_success': 'Registration successful',
    'auth.logout_success': 'Logged out successfully',
    'auth.unauthorized': 'Unauthorized',
    'beans.not_found': 'Coffee bean not found',
    'beans.created': 'Coffee bean added successfully',
    'beans.updated': 'Coffee bean updated successfully',
    'beans.deleted': 'Coffee bean deleted',
    'beans.photo_updated': 'Bean photo saved',
    'beans.photo_deleted': 'Bean photo deleted',
    'beans.photo_not_found': 'Bean photo not found',
    'beans.photo_invalid': 'The photo must be a JPEG, PNG, or WebP',
    'beans.photo_too_large': 'The photo must be 5 MB or smaller',
    'error.storage_unavailable': 'Photo storage is not available yet',
    'brew.not_found': 'Brew journal not found',
    'brew.created': 'Brew journal saved successfully',
    'brew.updated': 'Brew journal updated successfully',
    'brew.deleted': 'Brew journal deleted',
    'ai.scan_failed': 'Could not read the packaging, try a clearer photo',
    'ai.scan_success': 'Packaging scanned successfully',
    'profile.identity_updated': 'Brewer identity updated successfully',
    'error.server': 'Something went wrong, please try again',
    'error.validation': 'Invalid request data',
    'error.not_found': 'Not found',
  },
}

type MessageKey = keyof typeof messages.id
type Lang = 'id' | 'en'

export function t(key: MessageKey, lang: Lang = 'id'): string {
  return messages[lang]?.[key] ?? messages['id'][key] ?? key
}

export function getLang(acceptLanguage?: string): Lang {
  return acceptLanguage?.startsWith('en') ? 'en' : 'id'
}
