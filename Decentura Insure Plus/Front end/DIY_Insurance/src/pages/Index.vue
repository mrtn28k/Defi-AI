<template>
  <q-page style="background-color: #21222C">
    <div class="row justify-center q-pt-md">
      <q-tabs
        v-model="tab"
        class="text-grey-2"
        indicator-color="teal-9"
      >
        <q-tab name="policy_maker" label="Buy" />
        <q-tab name="agent" label="Middlemen" />
        <q-tab name="clients" label="Users" />
      </q-tabs>

    </div>
    <div class="row justify-center text-center q-pt-md">
      <q-card dark flat class="my-card" style="min-width: 300px; max-width: 90vw; background-color: #292B35;">
        <q-tab-panels v-model="tab" animated style="background-color: #292B35; color: #55565D">
        <q-tab-panel name="policy_maker" >
        <q-card-section>
          <div class="row justify-center text-grey-2 text-h5">Policy Maker</div>
          <div class="row justify-center">
            Get policy details
          </div>
        </q-card-section>
        <q-card-section>
          <q-input label-color="grey-2" input-style="color:#F5F5F5" color="teal-9" filled v-model="policy_id" label="User address">
            <template v-if="policy_id" v-slot:append>
              <q-icon name="cancel" @click.stop="policy_id = null" class="text-grey-2 cursor-pointer" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section>
          <q-btn color="teal-6" label="Query" @click="queryPolicy"/>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <q-card class="my-card text-grey-2 q-ma-sm" style="background-color: #383b49; width: 120px">
              <q-card-section>
                <div class="text-subtitle2" style="color: #7e849e;">Policy Id</div>
                <div class="text-caption">{{policy_uid}}</div>
              </q-card-section>
            </q-card>
             <q-card class="my-card text-grey-2 q-ma-sm" style="background-color: #383b49; width: 120px">
              <q-card-section>
                <div class="text-subtitle2" style="color: #7e849e;">Premium</div>
                <div class="text-caption">{{premium}}</div>
              </q-card-section>
            </q-card>
          </div>

           <div class="row">
            <q-card class="my-card text-grey-2 q-ma-sm" style="background-color: #383b49; width: 120px">
              <q-card-section>
                <div class="text-subtitle2" style="color: #7e849e;">Investment</div>
                <div class="text-caption">{{investment}}</div>
              </q-card-section>
            </q-card>
             <q-card class="my-card text-grey-2 q-ma-sm" style="background-color: #383b49; width: 120px">
              <q-card-section>
                <div class="text-subtitle2" style="color: #7e849e;">Agent</div>
                <div class="text-caption ellipsis">{{agent}}</div>
              </q-card-section>
            </q-card>
          </div>

           <div class="row">
            <q-card class="my-card text-grey-2 q-ma-sm" style="background-color: #383b49; width: 120px">
              <q-card-section>
                <div class="text-subtitle2" style="color: #7e849e;">Status</div>
                <div class="text-caption">{{status}}</div>
              </q-card-section>
            </q-card>
             <q-card class="my-card text-grey-2 q-ma-sm" style="background-color: #383b49; width: 120px">
              <q-card-section>
                <div class="text-subtitle2" style="color: #7e849e;">Expire In</div>
                <div class="text-caption">{{expires_in}}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="row">
            <q-page-sticky position="bottom" :offset="[0, 80]">
              <q-btn fab icon="add" color="teal-5">
                <q-tooltip>
                   Create New Policy
                </q-tooltip>
              </q-btn>
            </q-page-sticky>
          </div>
        </q-card-section>

          </q-tab-panel>
            <q-tab-panel name="agent">
              <q-card-section>
              <div class="text-h6 text-grey-2">Middlemen</div>
                Listing all agents ({{total_aganets}})
              </q-card-section>
              <q-card-section>
               <q-list>
                  <q-item class="text-left text-grey-3" v-for="agent in all_agents" :key="agent">
                    <q-item-section>
                      <q-item-label>{{agent}}</q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                      <q-icon name="star" color="yellow" />
                    </q-item-section>
                  </q-item>
               </q-list>
              </q-card-section>
            </q-tab-panel>

            <q-tab-panel name="clients">
              <q-card-section>

              <div class="text-h6 text-grey-2">Clients</div>
              Listing All Registered Clients
              </q-card-section>
              <q-card-section>
               <q-list>
                  <q-item class="text-left text-grey-3" v-for="client in all_clients" :key="client">
                    <q-item-section>
                      <q-item-label>{{client}}</q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                      <q-icon name="money" color="green" />
                    </q-item-section>
                  </q-item>
               </q-list>
              </q-card-section>
            </q-tab-panel>
          </q-tab-panels>
    </q-card>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      client: null,
      testnet_url: 'https://testnet.aeternity.io',
      mainnet_url: 'https://mainnet.aeternity.io',
      compiler_url: 'https://compiler.aepps.com',
      rpc_client: null,
      network_id: null,
      contract: null,
      contract_agent: null,
      contract_client: null,
      tab: 'policy_maker',
      policy_id: null,
      policy_uid: null,
      premium: null,
      investment: null,
      agent: null,
      status: null,
      expires_in: null,
      all_agents: null,
      total_aganets: null,
      all_clients: null
    }
  },
  methods: {
    async getAllAgents () {
      this.all_agents = (await this.contract_agent.methods.registered_agents.get()).decodedResult
      this.total_aganets = this.all_agents.length
    },
    async getAllClients () {
      this.all_clients = (await this.contract_client.methods.getAllRegisteredClients.get()).decodedResult
    },
    async queryPolicy () {
      if (this.policy_id === null) {
        this.$q.notify('Please add policy id first')
        return
      }
      try {
        const details = await this.contract.methods.get_policy_details_of.get(this.policy_id)
        const decodedDetails = details.decodedResult
        console.log(decodedDetails)
        this.policy_uid = decodedDetails.id_of_policy_taken
        this.premium = decodedDetails.premium
        this.investment = decodedDetails.invested_amount
        this.agent = decodedDetails.middle_agent
        this.status = decodedDetails.status
        this.expires_in = decodedDetails.expire_in
      } catch (e) {
        console.log('hi')
      }
    },
    async initProvider () {
      try {
        const networkId = (await this.client.getNodeInfo()).nodeNetworkId
        this.network_id = networkId
        console.log(this.network_id)
        this.contract = await this.client.getContractInstance(this.$contract_code, { contractAddress: this.$contract_address })
        this.contract_agent = await this.client.getContractInstance(this.$agent_contract_code, { contractAddress: this.$agent_contract_address })
        this.contract_client = await this.client.getContractInstance(this.$client_contract_code, { contractAddress: this.$client_contract_address })

        this.getAllAgents()
        this.getAllClients()
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    async scanForWallets () {
      const scannerConnection = await this.$browser_message({
        connectionInfo: { id: 'spy' }
      })
      const detector = await this.$detector({ connection: scannerConnection })
      const handleWallets = async ({ wallets, newWallet }) => {
        await detector.stopScan()
        const connected = await this.rpc_client.connectToWallet(await wallets[Object.keys(wallets)[0]].getConnection())
        await this.rpc_client.selectNode(connected.networkId) // connected.networkId needs to be defined as node in RpcAepp
        await this.rpc_client.subscribeAddress('subscribe', 'current')
        this.client = this.rpc_client
        await this.initProvider()
      }
      detector.scan(handleWallets)
    }
  },
  async mounted () {
    console.log('-----------------')
    this.rpc_client = await this.$rpc_aepp({
      name: 'AEPP',
      nodes: [
        { name: 'ae_mainnet', instance: await this.$node({ url: this.mainnet_url }) },
        { name: 'ae_uat', instance: await this.$node({ url: this.testnet_url }) }
      ],
      compilerUrl: this.compiler_url,
      onNetworkChange (params) {
        console.log(params)
        // aeternity.initProvider();
      },
      onAddressChange (addresses) {
        // if (!addresses.current[aeternity.address]) {
        //   console.log('address changed')
        // }
      }
    })
    this.scanForWallets()
  }
}
</script>
