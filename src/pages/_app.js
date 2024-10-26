import '@/styles/globals.css'
import { Provider } from 'react-redux'
import {store} from '../store'





export const metadata = {
  title: "Aakriti",
  description: "Aakriti",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "next14", "pwa", "next-pwa"],
};



export default function App({ Component, pageProps }) {
  return (
<Provider store={store}>
<Component {...pageProps} />
</Provider>
  )
  
}
