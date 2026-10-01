import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Railway buckets are private and S3-compatible. Objects are only ever read
// through the API (never by public URL), so every read stays scoped to its owner.
const REQUIRED_ENV = ['S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const

export function isStorageConfigured() {
  return REQUIRED_ENV.every((name) => !!process.env[name])
}

let client: S3Client | undefined

function getClient() {
  if (!isStorageConfigured()) throw new Error('Storage is not configured (S3_* variables are missing)')
  client ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'auto',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    // Only send checksums when an operation requires them; the SDK's newer
    // always-on default is rejected by some S3-compatible providers
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
  return client
}

const hasBytes = (buf: Buffer, bytes: number[], offset = 0) => bytes.every((b, i) => buf[offset + i] === b)

// Decide the type from the file's own bytes; the client-sent mimetype and
// filename are attacker-controlled and never trusted
export function detectImageType(buf: Buffer): string | null {
  if (hasBytes(buf, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (hasBytes(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  // RIFF....WEBP
  if (hasBytes(buf, [0x52, 0x49, 0x46, 0x46]) && hasBytes(buf, [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp'
  return null
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await getClient().send(
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: contentType }),
  )
}

export async function getObject(key: string) {
  try {
    const res = await getClient().send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
    if (!res.Body) return null
    return { body: Buffer.from(await res.Body.transformToByteArray()), contentType: res.ContentType }
  } catch (err) {
    if ((err as Error).name === 'NoSuchKey') return null
    throw err
  }
}

// Deleting a key that does not exist succeeds, so this is safe to call blindly
export async function deleteObject(key: string) {
  await getClient().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
}
