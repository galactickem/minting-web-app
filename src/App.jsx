import React, {useEffect, useState} from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers";
import myEpicNftABI from './utils/MyEpicNFT.json';


const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const chainID = 137; // Rinkeby

import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");

    const checkIfWalletIsConnected = async () => {
        const {ethereum} = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            toast.warn('Make sure you have metamask!');
            return;
        } else {
            console.log("We have the ethereum object");
        }

        const accounts = await ethereum.request({method: 'eth_accounts'});
        const chainId = await ethereum.request({method: 'eth_chainId'});
        console.log('Chain id', Number(chainId))

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:" + account);
            if (Number(chainId) === chainID) {
                setCurrentAccount(account)
                if (currentAccount) {
                    toast.success('Connected account' + accounts[0]);
                }
            }
        } else {
            toast.error('Not connected account');
            console.log("No authorized account found");
        }
    }

    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                toast.warn('Please install metamask');
                return;
            }

            const accounts = await ethereum.request({method: "eth_requestAccounts"});
            const chainId = await ethereum.request({method: 'eth_chainId'});
            console.log('Chain id', Number(chainId))

            console.log("Connected", accounts[0]);
            if (Number(chainId) === chainID) {
                setCurrentAccount(accounts[0])
                if (currentAccount) {
                    toast.success('Connected account' + accounts[0]);
                }
            } else {
                toast.error('Please connect to the network ' + chainID);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const askContractToMintNft = async () => {
        const CONTRACT_ADDRESS = "0x0F2BeF32B332617404908629756B6F3Bae38f763";

        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNftABI, signer);

                console.log("Going to pop wallet now to pay gas...")
                toast.info("Going to sign the transaction...");
                await connectedContract.makeAnEpicNFT().then(async (nftTxn) => {
                        console.log("Mining...please wait.")
                        toast.info("Making your nft...");
                        await nftTxn.wait();

                        toast.success(`Minted, see your transactions`);
                        console.log(`Minted, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
                    }
                ).catch(e => {
                    if (e.code === 4001) {
                        toast.error("Making sure to confirm the transaction");
                    }
                });

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error)
        }
    }


    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    );

    useEffect(() => {
        checkIfWalletIsConnected();
    }, [currentAccount])


    return (
        <div className="App">
            <ToastContainer toastStyle={{backgroundColor: "#131820"}}/>
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text">NFT Collection for MAKERs</p>
                    <p className="sub-text">
                        Mint your luck!
                    </p>
                    {currentAccount === "" ? (
                        renderNotConnectedContainer()
                    ) : (
                        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                            Mint NFT
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default App;
