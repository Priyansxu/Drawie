import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="title" content="Drawie" />
        <meta name="description" content="Drawie" />
        <meta name="generator" content="Next.js" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="keywords" content="draw, drawing, app" />
        <meta name="google-site-verification" content="pZ1d-eYCjWFhS07_e1SoS8myfd9oLiHbidf1AdR3t38" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
