<template>
  <div class="shadow-container">
    <div v-if="isMetamaskNotInstalled" class="metamask-container">
      <div>
        Metamask not installed. Please visit the docs for guidance in installing and creating a Metamask wallet. <br />
        If metamask is already installed, please ensure plugin is enabled.
      </div>
    </div>

    <div v-else class="token-transfer">
      <div class="account-details">
        <div class="account-details__header">Account Details</div>
        <div class="account-details__chain">
          <div class="account-details__chain__head">Chain ID:</div>
          <div class="account-details__chain__value">{{ chainId }}</div>
        </div>
        <div class="account-details__address">
          <div class="account-details__address__head">Wallet Address:</div>
          <div class="account-details__address__value">
            {{ currentAddress }}
          </div>
        </div>
      </div>

      <div class="token-details">
        <div class="token-details__header">Token Details</div>
        <div class="token-details__name">
          <div class="token-details__name__head">Token Name:</div>
          <div class="token-details__name__value">{{ tokenName }}</div>
        </div>
        <div class="token-details__address">
          <div class="token-details__address__head">Token Address:</div>
          <div class="token-details__address__value">{{ tokenAddress }}</div>
        </div>
        <div class="token-details__balance">
          <div class="token-details__balance__head">Balance:</div>
          <div class="token-details__balance__value">
            {{ formatTokenBalance }}
          </div>
        </div>
      </div>

      <div v-if="txHash" class="tx-details">
        <div class="tx-details__header">Tx Details</div>
        <div class="tx-details__hash">
          <div class="tx-details__hash__head">Tx Hash:</div>
          <div class="tx-details__hash__value">{{ txHash }}</div>
        </div>

        <div v-if="txReceipt" class="tx-details__receipt">
          <div class="tx-details__receipt__head">Block Hash:</div>
          <div class="tx-details__receipt__value">{{ txReceipt.blockHash }}</div>
        </div>

        <div v-if="txReceipt" class="tx-details__receipt">
          <div class="tx-details__receipt__head">Receipt TxHash:</div>
          <div class="tx-details__receipt__value">{{ txReceipt.transactionHash }}</div>
        </div>

        <div v-if="txReceipt" class="tx-details__receipt">
          <div class="tx-details__receipt__head">Block Number:</div>
          <div class="tx-details__receipt__value">{{ txReceipt.blockNumber }}</div>
        </div>
      </div>

      <div class="transfer-actions">
        <div v-if="!currentAddress" class="primary-btn connect-wallet" @click="connectWallet">Connect Wallet</div>

        <div v-else-if="currentAddress && !isValidTestnet" class="network-warning">
          <div class="network-warning__msg">Switch to Mumbai Testnet (Polygon's) to execute the transfer.</div>
        </div>

        <div v-else class="primary-btn transfer-button" @click="transferToken">Transfer Token</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { isValidTestnetChain } from "../helpers/is_valid_testnet_chain";
import BigNumber from "bignumber.js";

const BIG_TEN = new BigNumber(10);
const amount = 0.1;
const tokenDecimals = 18;

export default {
  computed: {
    ...mapGetters(["isConnected", "currentAddress", "chainId", "tokenAddress", "tokenName", "tokenBalance", "receiverAddress", "posClient"]),

    isValidTestnet() {
      return isValidTestnetChain(this.chainId);
    },

    formatTokenBalance() {
      return this.tokenBalance ? new BigNumber(this.tokenBalance).div(BIG_TEN.pow(new BigNumber(tokenDecimals))).toString() : 0;
    },
  },

  data() {
    return {
      isMetamaskNotInstalled: false,
      txHash: "",
      txReceipt: "",
    };
  },

  methods: {
    ...mapActions(["initWeb3Modal", "disconnectWallet"]),

    async connectWallet() {
      let initError = await this.initWeb3Modal();
      this.isMetamaskNotInstalled = initError === "No Web3 Provider found";
    },

    async transferToken() {
      try {
        const amountBig = new BigNumber(amount).times(BIG_TEN.pow(new BigNumber(tokenDecimals))).toString();
        const erc20Token = await this.posClient.erc20(this.tokenAddress);
        const result = await erc20Token.transfer(amountBig, this.receiverAddress);
        console.log("result:", result);

        const txHash = await result.getTransactionHash();
        console.log("txHash:", txHash);
        this.txHash = txHash;

        const txReceipt = await result.getReceipt();
        console.log("txReceipt:", txReceipt);
        this.txReceipt = txReceipt;
      } catch (error) {
        console.log("Error: ", error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.shadow-container {
  height: 36rem;
  width: 36rem;

  border-radius: 36px;
  background: #e6e6e6;
  box-shadow: -6px -6px 14px rgba(255, 255, 255, 0.7), -6px -6px 10px rgba(255, 255, 255, 0.5), 6px 6px 8px rgba(255, 255, 255, 0.075), 6px 6px 10px rgba(0, 0, 0, 0.15);

  margin: 4rem auto 0;
  padding: 2rem;
  text-align: left;

  .connect-wallet {
    font-size: 1.125rem;
    font-weight: 700;
  }

  .token-transfer {
    height: 100%;
    position: relative;

    .account-details {
      margin-top: 2rem;

      &__header {
        font-size: 20px;
        line-height: 28px;
        font-weight: 700;
        padding-bottom: 0.5rem;
      }

      &__chain {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }
      }

      &__address {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }
      }
    }

    .token-details {
      margin-top: 2rem;

      &__header {
        font-size: 20px;
        line-height: 28px;
        font-weight: 700;
        padding-bottom: 0.5rem;
      }

      &__name {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }
      }

      &__address {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }
      }

      &__balance {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }
      }
    }

    .tx-details {
      margin-top: 2rem;

      &__header {
        font-size: 20px;
        line-height: 28px;
        font-weight: 700;
        padding-bottom: 0.5rem;
      }

      &__hash {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }

        &__value {
          font-size: 12px;
        }
      }

      &__receipt {
        display: flex;
        justify-content: space-between;

        &__head {
          font-weight: 600;
        }

        &__value {
          font-size: 12px;
        }
      }
    }

    .transfer-actions {
      position: absolute;
      bottom: 0;
      padding-bottom: 2rem;
      text-align: center;
      width: 100%;

      .network-warning {
        color: rgb(210, 63, 63);
        font-size: 14px;
        font-weight: 600;
      }

      .transfer-button {
        font-size: 1.125rem;
        font-weight: 700;
      }
    }
  }
}
</style>
