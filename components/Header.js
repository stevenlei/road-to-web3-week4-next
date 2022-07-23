const Header = () => {
  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap">
        <h1 className="text-5xl font-bold text-white w-full md:flex-1">Road to Web3 - Week 4</h1>
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
        This is a practice project to learn Web3 and ethers.js. The fourth week is to &quot;Create an NFT Gallery&quot;
        using Alchemy API.
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
    </>
  );
};

export default Header;
