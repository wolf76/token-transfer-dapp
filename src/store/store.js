import Vue from "vue";
import Vuex from "vuex";
import Web3Modal from "web3modal";
import Web3 from "web3";
import { POSClient, use } from "@maticnetwork/maticjs";
import { Web3ClientPlugin } from "@maticnetwork/maticjs-web3";

use(Web3ClientPlugin);

Vue.use(Vuex);

const networkName = "testnet";
const networkVersion = "mumbai";

const state = {
  web3Modal: null,
  isConnectedToWallet: false,
  currentAddress: null,
  chainId: null,
  web3Provider: null,
  tokenAddress: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
  tokenName: "Dummy ERC20",
  tokenBalance: "",
  receiverAddress: "0xC1fB16F0b3A29F7A62C871eAA627F8a42E149589",
  posClient: null,
};

const getters = {
  isConnected(state) {
    return state.isConnectedToWallet;
  },

  currentAddress(state) {
    return state.currentAddress;
  },

  chainId(state) {
    return state.chainId;
  },

  tokenAddress(state) {
    return state.tokenAddress;
  },

  tokenName(state) {
    return state.tokenName;
  },

  tokenBalance(state) {
    return state.tokenBalance;
  },

  receiverAddress(state) {
    return state.receiverAddress;
  },

  posClient(state) {
    return state.posClient;
  },
};

const mutations = {
  SET_WEB3_MODAL_INSTANCE(state, payload) {
    state.web3Modal = payload;
  },

  SET_IS_CONNECTED_TO_WALLET(state, payload) {
    state.isConnectedToWallet = payload;
  },

  SET_CURRENT_ADDRESS(state, payload) {
    state.currentAddress = payload;
  },

  SET_CHAIN_ID(state, payload) {
    state.chainId = payload;
  },

  SET_WEB3_PROVIDER(state, provider) {
    state.web3Provider = provider;
  },

  SET_TOKEN_BALANCE(state, balance) {
    state.tokenBalance = balance;
  },

  SET_POS_CLIENT(state, posClient) {
    state.posClient = posClient;
  },
};

const actions = {
  async initWeb3Modal({ dispatch, commit }) {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });

      commit("SET_WEB3_MODAL_INSTANCE", web3Modal);

      const provider = await web3Modal.connect();
      if (!provider) throw "Wallet not exist.";

      commit("SET_WEB3_PROVIDER", provider);
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      dispatch("setCurrentAddress", accounts[0]);
      dispatch("setChainId", Web3.utils.toDecimal(window.ethereum.chainId));

      localStorage.setItem("isWalletConnected", true);
      commit("SET_IS_CONNECTED_TO_WALLET", true);

      dispatch("getTokenBalance");
    } catch (error) {
      return error.message;
    }
  },

  setCurrentAddress({ commit }, address) {
    commit("SET_CURRENT_ADDRESS", address);
  },

  async setChainId({ commit }, network) {
    commit("SET_CHAIN_ID", network);
  },

  async getTokenBalance({ state, commit }) {
    let url =
      "https://open-api-testnet.polygon.technology/api/v1/balance/user/tokens?" +
      new URLSearchParams({
        userAddress: state.currentAddress,
        tokenAddresses: state.tokenAddress,
        chainId: state.chainId,
      });

    let response = await fetch(url, {
      method: "GET",
      headers: Object.assign({
        "x-access-token": "407a0211-6139-4a78-9450-f9733e35335f",
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    })
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        console.log("Error: ", error);
      });

    if (response.success) {
      let allKeys = Object.keys(response.result);
      let balance = response.result[allKeys[0]].balance;
      commit("SET_TOKEN_BALANCE", balance);
    }
  },

  async disconnectWallet({ commit }) {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      localStorage.setItem("isWalletConnected", false);
      commit("SET_IS_CONNECTED_TO_WALLET", false);
    }
  },

  async initPosClient({ state, commit }) {
    const posClient = new POSClient();

    var mainProvider = new Web3(window.ethereum);
    var maticProvider = new Web3(window.ethereum);

    await posClient.init({
      network: networkName,
      version: networkVersion,
      parent: {
        provider: mainProvider,
        defaultConfig: {
          from: state.currentAddress,
        },
      },
      child: {
        provider: maticProvider,
        defaultConfig: {
          from: state.currentAddress,
        },
      },
    });

    commit("SET_POS_CLIENT", posClient);
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
