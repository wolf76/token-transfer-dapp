<template>
  <div id="app">
    <h2>Polygon Token Transfer DApp PoC (Testnet)</h2>
    <ShadowContainer />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ShadowContainer from "./components/ShadowContainer.vue";
import Web3 from "web3";

export default {
  name: "App",
  components: {
    ShadowContainer,
  },

  async mounted() {
    if (JSON.parse(localStorage.getItem("isWalletConnected")) === true) {
      await this.initWeb3Modal();
      await this.initPosClient();
      this.getTokenBalance();
    }

    window.addEventListener("load", () => {
      if (window.ethereum) {
        // detect Metamask account change
        window.ethereum.on("accountsChanged", (accounts) => {
          this.setCurrentAddress(accounts[0]);
        });

        // detect Network account change
        window.ethereum.on("chainChanged", (networkId) => {
          let chainId = Web3.utils.toDecimal(networkId);
          this.setChainId(chainId);
        });
      }
    });
  },

  methods: {
    ...mapActions(["initWeb3Modal", "initPosClient", "setChainId", "setCurrentAddress", "getTokenBalance"]),
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

body {
  background: #e6e6e6;
  text-align: center;
}
</style>
