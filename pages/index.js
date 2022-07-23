import Head from "next/head";
import { useState, useEffect } from "react";

const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

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
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
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
      const method =
        collection.length > 0 && wallet.length === 0
          ? "getNFTsForCollection"
          : "getNFTs";
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
        nfts = await fetch(fetchURL, requestOptions).then((data) =>
          data.json()
        );
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

    return `${address.substr(0, 4)}...${address.substr(address.length - 4, 4)}`;
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Head>
        <title>Road to Web3 - Week 4</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="px-6 py-12 md:p-20">
        <div className="flex flex-wrap md:flex-nowrap">
          <h1 className="text-5xl font-bold text-white w-full md:flex-1">
            Road to Web3 - Week 4
          </h1>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://twitter.com/stevenkin"
            className="mt-4 md:mt-0 bg-slate-800 text-slate-300 rounded-full text-sm self-start py-2 px-4 hover:bg-slate-700"
          >
            Follow me @stevenkin
          </a>
        </div>
        <p className="mt-4 text-lg text-slate-500">
          This is a practice project to learn Web3 and ethers.js. Fourth week is
          to &quot;Create an NFT Gallery)&quot; using Alchemy API.
          <br />
          <a
            href="https://docs.alchemy.com/alchemy/road-to-web3/weekly-learning-challenges/4.-how-to-create-an-nft-gallery"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-slate-800 rounded-md text-slate-300 mt-4 p-1 px-2 hover:bg-slate-700"
          >
            ➡️ Amazing tutorial here
          </a>
        </p>

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
                <li
                  onClick={setMyAddress}
                  className="cursor-pointer bg-slate-200 px-1 rounded hover:bg-slate-300"
                >
                  Get my address with MetaMask
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full lg:w-72">
            <button
              onClick={fetchNfts}
              disabled={
                isLoading || (collection.length === 0 && wallet.length === 0)
              }
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
                <div
                  key={index}
                  className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2"
                >
                  <a href="#" className="group">
                    <div className="block transition overflow-hidden rounded-md bg-white">
                      <img
                        src={getThumbnail(item)}
                        className="w-full group-hover:scale-125 transition duration-400"
                      />
                    </div>
                    <h4 className="mt-2 text-lg text-slate-700 font-bold group-hover:text-slate-900">
                      {getTitle(item)}
                    </h4>
                    <h5 className="text-md text-slate-500 group-hover:text-slate-600">
                      {shortenAddress(item.contract.address)}
                    </h5>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* <div className="text-center mt-12">
          {!walletAddress && (
            <button
              className="mt-12 py-3 px-8 bg-purple-800 shadow-lg hover:bg-purple-900 rounded-full text-white text-2xl"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div> */}
      </main>
    </div>
  );
}
