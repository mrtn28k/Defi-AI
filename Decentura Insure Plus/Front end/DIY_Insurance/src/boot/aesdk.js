// import something here
// const { Universal: Ae, Node } = require('@aeternity/aepp-sdk')
import { RpcAepp, Node } from '@aeternity/aepp-sdk/es'
import BrowserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message'
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector'
// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async ({ Vue }) => {
  // something to do
  // Vue.prototype.$node = Node({ url: 'https://testnet.aeternity.io', internalUrl: 'https://testnet.aeternity.io' })
  // Vue.prototype.$ae = Aepp
  // Vue.prototype.$browser_message = BrowserWindowMessageConnection
  Vue.prototype.$browser_message = BrowserWindowMessageConnection
  Vue.prototype.$detector = Detector
  Vue.prototype.$rpc_aepp = RpcAepp
  Vue.prototype.$node = Node
}
