import Head from "next/head";
import { useState, useEffect } from "react";

import Header from "../components/Header";

const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
let copiedTimeoutHandler;

const populars = [
  {
    name: "CryptoPunks",
    address: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  },
  {
    name: "Bored Ape",
    address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  },
  {
    name: "Moonbirds",
    address: "0x23581767a106ae21c074b2276d25e5c3e136a68b",
  },
  {
    name: "Otherdeed",
    address: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
  },
  {
    name: "Doodles",
    address: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
  },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialised, setIsInitialised] = useState(false);

  const [collection, setCollection] = useState("");
  const [wallet, setWallet] = useState("");
  const [nfts, setNfts] = useState([]);

  const [copied, setCopied] = useState([]);

  useEffect(() => {
    checkIfWalletIsConnected();
    walletChangeListener();

    fetchNfts();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const { ethereum } = window;

        const accounts = await ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    } catch (err) {
      console.error("Please install metamask");
    }
  };

  const connectWallet = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (window.ethereum) {
          const { ethereum } = window;

          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });

          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);

            resolve(accounts[0]);
          } else {
            alert("No address found");
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const walletChangeListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        ethereum.on("accountsChanged", async (accounts) => {
          if (accounts.length === 0) {
            // Disconnected
            setWalletAddress(null);
          } else {
            setWalletAddress(accounts[0]);
          }
        });
      }
    } catch (err) {}
  };

  const loadingIcon = (color = "text-white") => (
    <svg
      className={`animate-spin -mt-1 h-6 w-6 ${color} inline-block`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const fetchNfts = async () => {
    if (collection.length === 0 && wallet.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const method = collection.length > 0 && wallet.length === 0 ? "getNFTsForCollection" : "getNFTs";
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${API_KEY}/${method}/`;
      let requestOptions = {
        method: "GET",
      };

      let fetchURL;

      if (collection.length > 0 && wallet.length === 0) {
        fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=true`;
      } else if (!collection.length) {
        fetchURL = `${baseURL}?owner=${wallet}`;
      } else {
        fetchURL = `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}`;
      }

      if (fetchURL) {
        nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());
      }

      if (nfts) {
        console.log("nfts:", nfts);
        if (nfts.nfts) {
          setNfts(nfts.nfts);
        } else if (nfts.ownedNfts) {
          setNfts(nfts.ownedNfts);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsInitialised(true);
    }
  };

  const getThumbnail = (item) => {
    if (item.media.length > 0 && item.media[0].thumbnail) {
      return item.media[0].thumbnail;
    } else if (item.media.length > 0 && item.media[0].raw.includes("svg+xml")) {
      let source = item.media[0].raw;

      if (source.includes("svg+xml;utf8,")) {
        let raw = source.split("utf8,")[1];
        source = `data:image/svg+xml;base64,${btoa(raw)}`;
      }

      return source;
    } else if (item.metadata.image) {
      let image = item.metadata.image;

      if (image.includes("ipfs://")) {
        image = image.replace("ipfs://", "https://ipfs.infura.io/ipfs/");
      }

      return image;
    } else {
      return "/images/NFT.png";
    }
  };

  const getTitle = (item) => {
    let tokenId = Number(item.id.tokenId);

    if (item.title && !item.title.includes("#")) {
      return `${item.title} #${tokenId}`;
    } else if (item.title) {
      return item.title;
    } else if (!item.title) {
      return `#${tokenId}`;
    } else {
      // unlikely
      return "Untitled NFT";
    }
  };

  const shortenAddress = (address) => {
    if (address.length === 0) {
      return "";
    }

    return `${address.substr(0, 6)}...${address.substr(address.length - 6, 6)}`;
  };

  const getFilterTitle = () => {
    if (collection.length > 0 && wallet.length > 0) {
      return "Filter Collection by Address";
    } else if (collection.length > 0 && wallet.length === 0) {
      return "Search Collection";
    } else if (collection.length === 0 && wallet.length > 0) {
      return "NFTs owned by Wallet";
    } else {
      return "Search";
    }
  };

  const setMyAddress = async () => {
    if (!walletAddress) {
      setWallet(await connectWallet());
    } else {
      setWallet(walletAddress);
    }
  };

  const copy = (address, index) => {
    if (copiedTimeoutHandler) {
      clearTimeout(copiedTimeoutHandler);
      setCopied([]);
    }

    navigator.clipboard.writeText(address);

    let copied = [];
    copied[index] = true;

    setCopied(copied);

    copiedTimeoutHandler = setTimeout(() => {
      setCopied([]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Head>
        <title>Road to Web3 - Week 4</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="px-6 py-12 md:p-20">
        <Header />

        <div className="bg-slate-50 p-8 mt-8 rounded-xl shadow-xl shadow-slate-900 flex gap-x-8 flex-wrap lg:flex-nowrap">
          <div className="w-full lg:flex-1 flex flex-col text-lg text-slate-600">
            Collection Contract Address
            <input
              type="text"
              value={collection}
              disabled={isLoading}
              onChange={(e) => setCollection(e.target.value)}
              className="ring-2 ring-slate-200 focus:ring-slate-300 rounded-lg p-2 my-2 text-xl outline-none disabled:bg-slate-100 disabled:text-slate-400"
            />
            <div className="text-sm flex">
              <span className="mr-2">Popular:</span>
              <ul className="flex gap-x-2 flex-wrap gap-y-1">
                {populars.map((popular) => (
                  <li
                    key={popular.name}
                    onClick={() => setCollection(popular.address)}
                    className="cursor-pointer bg-slate-200 px-1 rounded hover:bg-slate-300 self-start"
                  >
                    {popular.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full mt-6 lg:mt-0 lg:flex-1 flex flex-col text-lg text-slate-600">
            Wallet Address
            <input
              type="text"
              value={wallet}
              disabled={isLoading}
              onChange={(e) => setWallet(e.target.value)}
              className="ring-2 ring-slate-200 focus:ring-slate-300 rounded-lg p-2 my-2 text-xl outline-none disabled:bg-slate-100 disabled:text-slate-400"
            />
            <div className="text-sm flex">
              <ul className="flex gap-x-2">
                <li onClick={setMyAddress} className="cursor-pointer bg-slate-200 px-1 rounded hover:bg-slate-300">
                  Get my address with MetaMask
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full lg:w-72">
            <button
              onClick={fetchNfts}
              disabled={isLoading || (collection.length === 0 && wallet.length === 0)}
              className="bg-slate-800 disabled:text-slate-400 text-white w-full px-4 py-2 text-xl rounded-md shadow-lg mt-8 relative top-1"
            >
              {isLoading ? loadingIcon() : getFilterTitle()}
            </button>
          </div>
        </div>

        {isInitialised && (
          <div className="p-4 md:p-6 lg:p-8 xl:p-12 bg-slate-100 rounded-xl mt-8">
            <div className="flex gap-y-8 flex-wrap">
              {nfts.length === 0 && (
                <div className="text-center text-xl flex-1 text-slate-600">
                  {isLoading ? loadingIcon("text-slate-600") : "No results"}
                </div>
              )}

              {nfts.map((item, index) => (
                <div key={index} className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2">
                  <a
                    href={`/${item.contract.address}/${Number(item.id.tokenId)}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="group"
                  >
                    <div className="block transition overflow-hidden rounded-md bg-white">
                      <img src={getThumbnail(item)} className="w-full group-hover:scale-125 transition duration-400" />
                    </div>
                    <h4 className="mt-2 text-lg text-slate-700 font-bold group-hover:text-slate-900">
                      {getTitle(item)}
                    </h4>
                  </a>
                  <h5 className="text-md text-slate-500 group-hover:text-slate-600">
                    {shortenAddress(item.contract.address)}

                    {!copied[index] && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block ml-2 relative cursor-pointer text-slate-500"
                        height="18"
                        viewBox="0 0 24 24"
                        width="18"
                        onClick={() => copy(item.contract.address, index)}
                      >
                        <path d="M0 0h24v24H0V0z" fill="none"></path>
                        <path
                          fill="currentColor"
                          d="M15 1H4c-1.1 0-2 .9-2 2v13c0 .55.45 1 1 1s1-.45 1-1V4c0-.55.45-1 1-1h10c.55 0 1-.45 1-1s-.45-1-1-1zm4 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h9c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"
                        ></path>
                      </svg>
                    )}

                    {copied[index] && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block ml-2 relative cursor-pointer text-slate-500"
                      >
                        <path fill="none" d="M0 0h24v24H0V0Z" />
                        <path
                          fill="currentColor"
                          d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0 -.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41 -.39-.39-1.02-.39-1.41 0L9 16.17Z"
                        />
                      </svg>
                    )}
                  </h5>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
