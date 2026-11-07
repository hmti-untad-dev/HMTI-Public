import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Formulir layanan mengunggah surat (maks. 5 MB, divalidasi di actions/letter.ts); bawaan server action 1 MB.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
