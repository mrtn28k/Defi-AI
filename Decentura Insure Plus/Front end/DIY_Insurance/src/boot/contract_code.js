export default async ({ Vue }) => {
  Vue.prototype.$agent_contract_code = `
  
contract MiddleAgents =

    record state = {
        agent: map(address, agent_record),
        agent_by_id: map(int, address),
        total_agents: int,
        agents: list(address)
        }

    record agent_record = {
        id : int,
        name: string,
        email : string,
        mobile : string,
        agent_address: address}
    
    stateful entrypoint init() = {
        agent = {},
        agent_by_id = {},
        total_agents = 0,
        agents = []
      }


    stateful entrypoint register_for_agent(_name: string, _email: string, _mobile: string) : bool =
        require(String.length(_name) >= 5, "Require name with length greater than 4")
        require(String.length(_email) >= 4, "Require email with length greater than 3")
        require(String.length(_mobile) >= 8, "Require mobile with length greater than 7")

        put(state{total_agents = state.total_agents + 1})
        put(state{agent[Call.caller] = {id = state.total_agents, name = _name, email = _email, mobile = _mobile, agent_address = Call.caller}})
        put(state{agent_by_id[state.total_agents] = Call.caller})
        put(state{agents @ a = (Call.caller) :: a})
        true

    stateful entrypoint registered_agents() : list(address) =
        state.agents
    
    stateful entrypoint agent_record(_address: address) : option(agent_record) =
        Map.lookup(_address, state.agent)

    stateful entrypoint total_agents () : int =
        state.total_agents

    stateful entrypoint contract_address() : address =
        Contract.address

  `
  Vue.prototype.$client_contract_code = `
  
contract DigitalInsuranceClient =

        record state = {
            clients : map(address, client_info),
            all_clients: list(address)
         }
        record client_info = { // individual record
            name : string, // User name
            email : string, // User documents
            other_docs : string, // User documents
            description: string // User statements
            }
        stateful entrypoint init() = {
            clients = {},
            all_clients = []
         }
        stateful entrypoint create_new_client(_name: string, _email: string, _other_docs: string, _description: string) : bool = 
            let ci : client_info = {
                name = _name,
                email = _email,
                other_docs = _other_docs,
                description = _description
             }
            put(state{clients[Call.caller] = ci})
            put(state{all_clients @ ac = (Call.caller) :: ac})
            true

        stateful entrypoint getClientInfo(_address: address) : option(client_info) =
            Map.lookup(_address, state.clients)
        
        stateful entrypoint getAllRegisteredClients(): list(address) =
          state.all_clients

  `

  Vue.prototype.$agent_contract_address = 'ct_2s2HCciiggoND6VrUnCiqhneZCv87bes3BZurpFgUECMVhSmGo'
  Vue.prototype.$client_contract_address = 'ct_xNVk7UPC1TZUzra1VanQDCd251bgBH6S4TKLRXnaRm7KBKSu3'
  Vue.prototype.$contract_code = `contract DecentralizedInsurancePolicy =

    record policy_info = { // global record
        name: string, // Like Life Insurance 121
        risk_coverage: string,
        min_coverage: int, // When added minimum coverage then users starts to pay premium
        max_coverage: int, // When added maximum then nobody can invest more
        premium_amount: int, // How much percent premium from investment
        premium_times: int, // How much time premium needs to be paid
        coverage_time: int // How much time it will cover for, Later all investors get back their money
        }

    entrypoint getPolicyDetails : (string) => option(policy_info)
    entrypoint getMinCoverage : (string) => int
    entrypoint getMaxCoverage : (string) => int
    entrypoint getPremiumAmount : (string) => int
    entrypoint getPremiumTimes : (string) => int
    entrypoint getCoverageTime : (string) => int

contract MiddleAgents =
    record agent_record = {
        id : int,
        name: string,
        email : string,
        mobile : string,
        agent_address: address}

    entrypoint agent_record : (address) => option(agent_record)

contract DigitalInsuranceClient =
    record client_info = { // individual record
            name : string, // User name
            email : string, // User documents
            other_docs : string, // User documents
            description: string // User statements
            }
    entrypoint getClientInfo : (address) => option(client_info)

contract PolicyMaker =

    record state = {
        policy_holder : map(address, bought_policy),
        _policy_contract: DecentralizedInsurancePolicy,
        _middle_agent_contract: MiddleAgents,
        _client_contract: DigitalInsuranceClient
       }
    

    record bought_policy = {
        id_of_policy_taken: string, // policy id
        premium: int, // reflect current premium to pay
        investors: map(address, int), // address => amount
        invested_amount: int,
        middle_agent: address,
        parameters: string, // Any more strings to add
        status: string, //  e.g. Applied, Underwritten, Claimed, Paid out, etc.
        expire_in: int // Expire if not achieved minimum payout to this time
     }

    stateful entrypoint init() = 
        { policy_holder = {},
         _policy_contract = ct_2Xk7jsceECraLpBAnXaqJjrk96WGwU6Jqro9He6mtLDwdpYKHb,
         _middle_agent_contract = ct_2s2HCciiggoND6VrUnCiqhneZCv87bes3BZurpFgUECMVhSmGo,
         _client_contract = ct_xNVk7UPC1TZUzra1VanQDCd251bgBH6S4TKLRXnaRm7KBKSu3
         }

    stateful entrypoint buy_policy(_policy_id: string, _selected_middle_agent: address) =
        require(state._client_contract.getClientInfo(Call.caller) != None, "Please register yourself as client first!")
        require(state._policy_contract.getPolicyDetails(_policy_id) != None, "The policy you try to have doesn't exist")
        require(state._middle_agent_contract.agent_record(_selected_middle_agent) != None, "Agent not found!")

        require(Map.lookup(Call.caller, state.policy_holder) == None || state.policy_holder[Call.caller].status == "PAID_OUT", "You are not eligible for now.")// one policy per address for now

        let bought_policy : bought_policy = {
            id_of_policy_taken = _policy_id,
            premium = 0,
            investors = {},
            invested_amount = 0,
            middle_agent = _selected_middle_agent,
            parameters = "",
            status = "APPLIED",
            expire_in = Chain.timestamp + (1000 * 86400) // Current time + 86400 seconds (A day)
         }
        put(state {
            policy_holder[Call.caller] = bought_policy
         })
    
    stateful entrypoint remove_expired_policy() =
        require(Map.member(Call.caller, state.policy_holder), "Not have any policy")
        let holding : bought_policy = state.policy_holder[Call.caller]
        require(holding.expire_in > Chain.timestamp, "It's not expired yet!")
        Map.delete(Call.caller, state.policy_holder)
    

    payable stateful entrypoint investing_in_policy(_user_policy: address) : bool =
        require(Call.value >= 10000000000000000, "Minimum 0.1AE to invest")
        require(Map.member(_user_policy, state.policy_holder), "The policy you try to invest not exist")
        require(state.policy_holder[_user_policy].status == "UNDERWRITTEN", "Not eligible to invest")

        let _bought_policy : bought_policy = state.policy_holder[_user_policy]
        let _min_coverage = state._policy_contract.getMinCoverage(_bought_policy.id_of_policy_taken)
        let _premium_amount = state._policy_contract.getPremiumAmount(_bought_policy.id_of_policy_taken)
        
        let invested_amount = _bought_policy.invested_amount + Call.value

        // Upto first premium for now...
        
        if(_min_coverage =< invested_amount)
            put(state{policy_holder[_user_policy] = {
                id_of_policy_taken = _bought_policy.id_of_policy_taken,
                premium =_premium_amount,
                investors ={[Call.caller] = _bought_policy.investors[Call.caller] + Call.value},
                invested_amount = _bought_policy.invested_amount + Call.value,
                middle_agent =_bought_policy.middle_agent,
                parameters =_bought_policy.parameters,
                status = "UNDERWRITTEN",
                expire_in = 0 // If zero means it won't expire and hold this policy
             }})
        else
            put(state{policy_holder[_user_policy] = {
                id_of_policy_taken = _bought_policy.id_of_policy_taken,
                premium =_bought_policy.premium,
                investors ={[Call.caller] = _bought_policy.investors[Call.caller] + Call.value},
                invested_amount =_bought_policy.invested_amount + Call.value,
                middle_agent =_bought_policy.middle_agent,
                parameters =_bought_policy.parameters,
                status =_bought_policy.status,
                expire_in =_bought_policy.expire_in
             }})
        true
    
    stateful entrypoint get_policy_details_of(user: address) : option(bought_policy) =
        Map.lookup(user, state.policy_holder)
    





        









  `
  Vue.prototype.$contract_address = 'ct_2ksWUzmeBXSCN5WVaKL8TWuywiwCi3ryt6rRynQyJfG5VjqtRK'
}
