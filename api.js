// =====================================
// Lightning Checker API
// Version 1.1 Final
// =====================================

const API_BASE = "https://api.sparkscan.io/v1";

/**
 * Ambil data wallet
 */
async function getWallet(address) {

    const response = await fetch(
        `${API_BASE}/address/${address}`
    );

    if (!response.ok) {
        throw new Error("Wallet API Error");
    }

    return await response.json();

}

/**
 * Ambil transaksi terakhir
 */
async function getTransactions(address) {

    const response = await fetch(
        `${API_BASE}/address/${address}/transactions?limit=1`
    );

    if (!response.ok) {
        return [];
    }

    const json = await response.json();

    return json.data || [];

}

/**
 * Check Address
 */
async function checkAddress(address) {

    try {

        const wallet = await getWallet(address);

        const tx = await getTransactions(address);

        const usd = Number(wallet.totalValueUsd || 0);

        return {

            success: true,

            address: wallet.sparkAddress || address,

            status: usd > 0 ? "ACTIVE" : "EMPTY",

            usd: usd,

            lastActivity:
                tx.length > 0
                    ? tx[0].createdAt
                    : null

        };

    } catch (error) {

        console.error(error);

        return {

            success: false,

            address,

            status: "ERROR",

            usd: 0,

            lastActivity: null

        };

    }

}