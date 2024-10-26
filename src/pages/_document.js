import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="title" content="Aakriti" />
        <meta name="description" content="Aakriti" />
        <meta name="generator" content="Next.js" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="keywords" content="nextjs, next14, pwa, next-pwa" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
