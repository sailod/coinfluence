let addresses = [];
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const content = document.getElementById('content');
const refreshButton = document.getElementById('refreshBalances');


async function fetchMarketCap(coinId) {
    try {
        // example of returned result
        // {
            //     "data": [
                //       {
        //         "id": "90",
        //         "symbol": "BTC",
        //         "name": "Bitcoin",
        //         "nameid": "bitcoin",
        //         "rank": 1,
        //         "price_usd": "99584.59",
        //         "percent_change_24h": "1.25",
        //         "percent_change_1h": "0.13",
        //         "percent_change_7d": "2.39",
        //         "price_btc": "1.00",
        //         "market_cap_usd": "1967874549929.50",
        //         "volume24": 60985129577.58225,
        //         "volume24a": 88750734120.79686,
        //         "csupply": "19760834.00",
        //         "tsupply": "19760834",
        //         "msupply": "21000000"
        //       },
        //       {
            //         "id": "80",
        //         "symbol": "ETH",
        //         "name": "Ethereum",
        //         "nameid": "ethereum",
        //         "rank": 2,
        //         "price_usd": "3992.98",
        //         "percent_change_24h": "2.96",
        //         "percent_change_1h": "0.20",
        //         "percent_change_7d": "11.35",
        //         "price_btc": "0.040095",
        //         "market_cap_usd": "480068899829.40",
        //         "volume24": 33547453794.48112,
        //         "volume24a": 36792209972.45373,
        //         "csupply": "120228315.00",
        //         "tsupply": "122375302",
        //         "msupply": ""
        //       },
        //     ]
        // }
        const response = await fetch(`https://api.coinlore.net/api/tickers/`);
        return (await response.json()).data;
    } catch (error) {
        console.error('Error fetching market cap:', error);
        return null;
    }
}
const marketCapMap = await fetchMarketCap();

console.log("fetched market caps");
// Calculate market cap percentages for provided symbols
function calculatePercentages(symbols) {
    // Check if all symbols exist in marketCapMap
    const missingSymbols = symbols.filter(symbol => !marketCapMap.find(coin => coin.symbol === symbol));
    if (missingSymbols.length > 0) {
        throw new Error(`Missing market cap data for symbols: ${missingSymbols.join(', ')}`);
    }
    try {
        const totalMarketCap = symbols.reduce((sum, symbol) => sum + (Number(marketCapMap.find(coin => coin.symbol === symbol).market_cap_usd) || 0), 0);
        return new Map(
            symbols.map(symbol => [
                symbol,
                (Number(marketCapMap.find(coin => coin.symbol === symbol).market_cap_usd) / totalMarketCap) * 100
            ])
        );
    } catch (error) {
        console.error('Error calculating market cap percentages:', error);
        return new Map();
    }
}



function detectAddressType(token) {
    const tokenLower = token.toLowerCase();
    if (tokenLower === 'btc') return 'BTC';
    const erc20Tokens = ['eth', 'usdt', 'usdc', 'aave', 'link', 'uni', 'pol', 'fet', 'arb', 'grt', 'weth','matic', 'op', 'mkr', 'ldo', 'render', 'gala'];
    if (erc20Tokens.includes(tokenLower)) return 'ERC20';
    if (tokenLower === 'bnb') return 'BEP20';
    if (tokenLower === 'trx') return 'TRC20';
    if (tokenLower === 'ada') return 'ADA';
    if (tokenLower === 'sol' || tokenLower === 'ray') return 'SPL';
    if (tokenLower === 'near') return 'NEAR';
    if (tokenLower === 'theta') return 'THETA';
    if (tokenLower === 'dot') return 'DOT';
    if (tokenLower === 'avax') return 'AVAX';
    if (tokenLower === 'xrp') return 'XRP';
    if (tokenLower === 'ton') return 'TON';
    if (tokenLower === 'xlm') return 'XLM';
    if (tokenLower === 'sui') return 'SUI';
    if (tokenLower === 'hnt') return 'HNT';
    return 'Unknown';
}

async function fetchCurrentBalance(address, token) {
    try {
        const type = detectAddressType(token);
        
        if (type === 'BTC') {
            const response = await fetch(`https://blockstream.info/api/address/${address}`);
            const data = await response.json();
            return (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
        }
        
        if (type === 'ERC20') {
            let web3 = new Web3('https://rpc.ankr.com/eth');
            
            if (token === 'ETH') {
                const balance = await web3.eth.getBalance(address);
                return web3.utils.fromWei(balance, 'ether');
            }
            else if (token === 'POL') {
                web3 = new Web3('https://rpc.ankr.com/polygon');
                const balance = await web3.eth.getBalance(address);
                return web3.utils.fromWei(balance, 'ether');
            }
            else{
                const tokenContracts = {
                    'USDT': {
                        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        decimals: 6
                    },
                    'USDC': {
                        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        decimals: 6
                    },
                    'AAVE': {
                        address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
                        decimals: 18
                    },
                    'LINK': {
                        address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                        decimals: 18
                    },
                    'UNI': {
                        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
                        decimals: 18
                    },
                    'POL': {
                        address: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
                        decimals: 18
                    },
                    'FET': {
                        address: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
                        decimals: 18
                    },
                    'ARB': {
                        address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1',
                        decimals: 18
                    },
                    'GRT': {
                        address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
                        decimals: 18
                    },
                    'WETH': {
                        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        decimals: 18
                    },
                    'OP': {
                        address: '0x4200000000000000000000000000000000000042',
                        decimals: 18
                    },
                    'MKR': {
                        address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
                        decimals: 18
                    },
                    'LDO': {
                        address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
                        decimals: 18
                    },
                    'RENDER': {
                        address: '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24',
                        decimals: 18
                    },
                    'GALA': {
                        address: '0xd1d2Eb1B1e90B638588728b4130137D262C87cae',
                        decimals: 8
                    }
                };
                
                const tokenInfo = tokenContracts[token];
                if (!tokenInfo) return 'Unsupported Token';
                
                const contract = new web3.eth.Contract([
                    {
                        "constant": true,
                        "inputs": [{"name": "_owner", "type": "address"}],
                        "name": "balanceOf",
                        "outputs": [{"name": "balance", "type": "uint256"}],
                        "type": "function"
                    }
                ], tokenInfo.address);
                
                try {
                    const balance = await contract.methods.balanceOf(address).call();
                    return balance / Math.pow(10, tokenInfo.decimals);
                } catch (error) {
                    console.error('Error fetching ERC20 token balance:', error);
                    return 'API Error';
                }
            }
        }

        if (type === 'BEP20') {
            const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
            const balance = await web3.eth.getBalance(address);
            return web3.utils.fromWei(balance, 'ether');
        }

        if (type === 'TRC20') {
            const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
            const data = await response.json();

            if (token === 'TRX') {
                return data.data[0].balance / 1000000;
            } else if (token === 'USDT') {
                const trc20Tokens = data.data[0].trc20 || [];
                const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
                const usdtBalance = trc20Tokens[usdtContract];
                return usdtBalance ? usdtBalance / 1000000 : 0;
            }
        }

        if (type === 'ADA') {
            try {
                const response = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`, {
                    headers: {
                        'project_id': 'mainnetFLAREBASE01'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.amount || data.amount.length === 0) {
                    return 0;
                }
                
                const lovelaceEntry = data.amount.find(entry => !entry.unit || entry.unit === 'lovelace');
                if (!lovelaceEntry) {
                    return 0;
                }
                
                return lovelaceEntry.quantity / 1000000;
            } catch (cardanoError) {
                console.error('Cardano balance fetch error:', cardanoError);
                return 'API Error';
            }
        }

        if (type === 'SPL') {
            try {
                const payload = JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getBalance",
                    "params": [address]
                })
                const response = await fetch('https://api.mainnet-beta.solana.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'solana-client/1.0.0',
                        'Cache-Control': 'no-cache'
                    },
                    body: payload
                });
        
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error.message);
                }
                
                // Convert lamports to SOL
                return data.result.value / 1e9;
        
                } catch (solanaError) {
                console.error('Solana balance fetch error:', solanaError);
                return 'API Error';
            }
        }
        

        if (type === 'NEAR') {
            try {
                const response = await fetch('https://rpc.mainnet.near.org', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "jsonrpc": "2.0",
                        "id": "dontcare",
                        "method": "query",
                        "params": {
                            "request_type": "view_account",
                            "finality": "final",
                            "account_id": address
                        }
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.result && data.result.amount) {
                    return data.result.amount / 1e24;
                }
                return 'Error';
            } catch (nearError) {
                console.error('NEAR balance fetch error:', nearError);
                return 'API Error';
            }
        }

        if (type === 'THETA') {
            try {
                const response = await fetch(`https://explorer.thetatoken.org:8443/api/account/${address}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.body && data.body.balance !== undefined) {
                    const balances = {
                        THETA: Number(data.body.balance.thetawei) / 1e18,
                        TFUEL: Number(data.body.balance.tfuelwei) / 1e18
                    }
                    return balances[token];
                }
                return 'Error';
            } catch (thetaError) {
                console.error('Theta balance fetch error:', thetaError);
                return 'API Error';
            }
        }

        if (type === 'DOT') {
            
            try {
                   // Create an instance of the API
                   const api = await polkadot.ApiPromise.create({
                    provider: new polkadot.WsProvider('wss://rpc.polkadot.io')
                });

                // Retrieve the balance of the specified address
                const { data: { free: balance } } = await api.query.system.account(address);

             console.log(balance);
            } catch (polkadotError) {
                console.error('Polkadot balance fetch error:', polkadotError);
                return 'API Error';
            }
        }

        if (type === 'AVAX') {
            try {
                const web3 = new Web3('https://api.avax.network/ext/bc/C/rpc');
                const balance = await web3.eth.getBalance(address);
                return web3.utils.fromWei(balance, 'ether');
            } catch (avaxError) {
                console.error('Avalanche balance fetch error:', avaxError);
                return 'API Error';
            }
        }

        if (type === 'XRP') {
            try {
                const client = new xrpl.Client('wss://s1.ripple.com');
                await client.connect();
                
                const response = await client.request({
                    command: 'account_info',
                    account: address,
                    ledger_index: 'validated'
                });

                await client.disconnect();

                if (response.result && response.result.account_data && response.result.account_data.Balance) {
                    return Number(response.result.account_data.Balance) / 1000000; // Convert from drops to XRP
                }
                return 'Error';
            } catch (xrpError) {
                console.error('XRP balance fetch error:', xrpError);
                return 'API Error';
            }
        }

        if (type === 'TON') {
            try {
                const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.ok && data.result) {
                    return Number(data.result) / 1e9; // Convert from nanoTON to TON
                }
                return 'Error';
            } catch (tonError) {
                console.error('TON balance fetch error:', tonError);
                return 'API Error';
            }
        }

        if (type === 'XLM') {
            try {
                const response = await fetch(`https://horizon.stellar.org/accounts/${address}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const xlmBalance = data.balances.find(b => b.asset_type === 'native');
                if (xlmBalance) {
                    return Number(xlmBalance.balance);
                }
                return 0;
            } catch (xlmError) {
                console.error('Stellar balance fetch error:', xlmError);
                return 'API Error';
            }
        }

        if (type === 'SUI') {
            try {
                const response = await fetch('https://fullnode.mainnet.sui.io:443', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'suix_getBalance',
                        params: [address, '0x2::sui::SUI']
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.result && data.result.totalBalance) {
                    return Number(data.result.totalBalance) / 1e9; // Convert from MIST to SUI
                }
                return 'Error';
            } catch (suiError) {
                console.error('SUI balance fetch error:', suiError);
                return 'API Error';
            }
        }

        if (type === 'HNT') {
            try {
                const response = await fetch(`https://api.helium.io/v1/accounts/${address}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.data && data.data.balance) {
                    return Number(data.data.balance) / 1e8; // Convert from bones to HNT
                }
                return 'Error';
            } catch (hntError) {
                console.error('Helium balance fetch error:', hntError);
                return 'API Error';
            }
        }
        
        return 'Unsupported';
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 'Error';
    }
}

function parseAddressFile(text) {
    const lines = text.split('\n');
    const parsedAddresses = [];
    
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
            const [address, token, ...commentParts] = line.split(/\s+/);
            const comment = commentParts.join(' ');
            
            if (address && token) {
                parsedAddresses.push({
                    address: address.trim(),
                    token: token.trim(),
                    comment: comment.trim(),
                    type: detectAddressType(token.trim()),
                    currentBalance: '...'
                });
            } else {
                console.warn('Skipping invalid line:', line);
            }
        }
    }
    
    return parsedAddresses;
}

async function updateBalances() {
    const tbody = document.querySelector('#addressTable tbody');
    tbody.classList.add('loading');
    refreshButton.disabled = true;

    for (const addr of addresses) {
        addr.currentBalance = await fetchCurrentBalance(addr.address, addr.token);
        updateTable(filterAddresses());
    }

    tbody.classList.remove('loading');
    refreshButton.disabled = false;
}

function updateStats() {
    const stats = document.getElementById('stats');
    const typeCount = _.countBy(addresses, 'type');
    const tokenCount = _.countBy(addresses, 'token');
    
    stats.innerHTML = `
        <div class="stat-card">
            <div class="stat-title">Total Entries</div>
            <div class="stat-value">${addresses.length}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Unique Addresses</div>
            <div class="stat-value">${new Set(addresses.map(a => a.address)).size}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Token Types</div>
            <div class="stat-value">${Object.keys(tokenCount).length}</div>
        </div>
        ${Object.entries(typeCount).map(([type, count]) => `
            <div class="stat-card">
                <div class="stat-title">${type}</div>
                <div class="stat-value">${count}</div>
            </div>
        `).join('')}
    `;
}

function updateFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const tokenFilter = document.getElementById('tokenFilter');
    
    const types = _.uniq(addresses.map(addr => addr.type));
    const tokens = _.uniq(addresses.map(addr => addr.token));
    
    typeFilter.innerHTML = '<option value="">All Protocols</option>' + 
        types.map(type => `<option value="${type}">${type}</option>`).join('');

    tokenFilter.innerHTML = '<option value="">All Tokens</option>' + 
        tokens.map(token => `<option value="${token}">${token}</option>`).join('');
}

function updateTable(filtered = addresses) {
    const tbody = document.querySelector('#addressTable tbody');
    const symbols = filtered.map(addr => addr.token.toUpperCase());
    const percentages = calculatePercentages(symbols);

    tbody.innerHTML = filtered.map(addr => {
        const marketCap = marketCapMap.find(coin => coin.symbol === addr.token.toUpperCase()).market_cap_usd || 'N/A';
        const percentage = percentages.get(addr.token.toUpperCase()) || 'N/A';
        return `
            <tr>
                <td ><span class="address-type type-${addr.type.toLowerCase().replace(/\s+/g, '-')}">${addr.type}</span></td>
                <td class="address">${addr.address}</td>
                <td class="token-name">${addr.token}</td>
                <td>${addr.comment}</td>
                <td class="balance">${addr.currentBalance}</td>
                <td class="market-cap">${marketCap}</td>
                <td class="market-cap-percentage">${percentage.toFixed(2)}%</td>
            </tr>
        `;
    }).join('');
}

function filterAddresses() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const selectedType = document.getElementById('typeFilter').value;
    const selectedToken = document.getElementById('tokenFilter').value;
    
    return addresses.filter(addr => {
        const matchesSearch = !searchTerm || 
            addr.address.toLowerCase().includes(searchTerm) ||
            addr.comment.toLowerCase().includes(searchTerm);
        const matchesType = !selectedType || addr.type === selectedType;
        const matchesToken = !selectedToken || addr.token === selectedToken;
        
        return matchesSearch && matchesType && matchesToken;
    });
}

// Event Listeners
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            addresses = parseAddressFile(event.target.result);
            content.style.display = 'block';
            updateStats();
            updateFilters();
            updateTable();
            updateBalances();
        };
        reader.readAsText(file);
    }
});

// Add drag and drop support
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.style.borderColor = '#007bff';
});

dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.style.borderColor = '#ddd';
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.style.borderColor = '#ddd';
    
    const file = e.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            addresses = parseAddressFile(event.target.result);
            content.style.display = 'block';
            updateStats();
            updateFilters();
            updateTable();
            updateBalances();
        };
        reader.readAsText(file);
    }
});

// Add filter event listeners
document.getElementById('search').addEventListener('input', () => updateTable(filterAddresses()));
document.getElementById('typeFilter').addEventListener('change', () => updateTable(filterAddresses()));
document.getElementById('tokenFilter').addEventListener('change', () => updateTable(filterAddresses()));

// Add refresh button listener
refreshButton.addEventListener('click', updateBalances);
