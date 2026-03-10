const messages = {
  id: {
    'auth.invalid_credentials': 'Email atau password salah',
    'auth.email_taken': 'Email sudah digunakan',
    'auth.username_taken': 'Username sudah digunakan',
    'auth.user_not_found': 'User tidak ditemukan',
    'auth.register_success': 'Registrasi berhasil',
    'auth.unauthorized': 'Tidak memiliki akses',
    'beans.not_found': 'Data biji kopi tidak ditemukan',
    'beans.created': 'Biji kopi berhasil ditambahkan ☕',
    'beans.updated': 'Data biji kopi berhasil diperbarui',
    'beans.deleted': 'Biji kopi berhasil dihapus',
    'brew.not_found': 'Jurnal brew tidak ditemukan',
    'brew.created': 'Jurnal brew berhasil disimpan 🎉',
    'brew.updated': 'Jurnal brew berhasil diperbarui',
    'brew.deleted': 'Jurnal brew berhasil dihapus',
    'ai.scan_failed': 'Gagal membaca kemasan, coba foto yang lebih jelas',
    'ai.scan_success': 'Kemasan berhasil dipindai ✨',
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
    'auth.unauthorized': 'Unauthorized',
    'beans.not_found': 'Coffee bean not found',
    'beans.created': 'Coffee bean added successfully ☕',
    'beans.updated': 'Coffee bean updated successfully',
    'beans.deleted': 'Coffee bean deleted',
    'brew.not_found': 'Brew journal not found',
    'brew.created': 'Brew journal saved successfully 🎉',
    'brew.updated': 'Brew journal updated successfully',
    'brew.deleted': 'Brew journal deleted',
    'ai.scan_failed': 'Could not read the packaging, try a clearer photo',
    'ai.scan_success': 'Packaging scanned successfully ✨',
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
