import { WebSocketProvider } from '~/contexts/websocket-context'
import '~/pages/_app.scss'

function MyApp ({ Component, pageProps }) {
  return (
    <WebSocketProvider>
      <Component {...pageProps} />
    </WebSocketProvider>
  )
}

export default MyApp
