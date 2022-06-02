import React from "react";
import { useMoralis } from "react-moralis";
import Market from './Marketplace.json'
import abi from './ERC721NFTBase.json';
import { createJSONForOtherFormats, findTransactionDataObj, getLastTokenId, uploadFileToIPFS } from "./helpers";
import dummy_image from "./images/dummy_image.jpg";

export const WalletFunctions = () => {

  const { authenticate, isAuthenticated, user, logout, enableWeb3, Moralis } = useMoralis();

  const marketplaceContractaddress = "0x27777CBDff08090dd6f772f5a868c8129740c6a9";
  const collectionId = "0x52ba179456ee5751ced7539ecdf552df6f2fdc5c";

  const basicMarketOptions = {
    contractAddress: marketplaceContractaddress,
    abi: Market,
    functionName: ""
  }

  const signout = async () => {
    logout();
    window.localStorage.removeItem('walletconnect');
  }

  const login = async () => {
    if (!isAuthenticated) {
      console.log(isAuthenticated)
      authenticate({
        onSuccess: () => {
          enableWeb3({ provider: "walletconnect" });
          console.log("connected...")
        },
        onError: (erorr) => {
          alert(erorr)
        },
        provider: "walletconnect",
        signingMessage: "Mintzilla Platform"
      })
        .then(function (user) {
          console.log(user?.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const setPermissionToMarketplace = async (collection, tokenId) => {
    const approveOptions = {
      contractAddress: collection,
      functionName: "approve",
      abi,
      params: {
        to: marketplaceContractaddress,
        tokenId: tokenId
      },
    };
    const transaction = await Moralis.executeFunction(approveOptions);
    return transaction.wait();
  };

  const setForSale = async (tokenId, tokenAddress) => {
    //0.0001AVX
    const wei = {
      "type": "BigNumber",
      "hex": "0x5af3107a4000"
    };
    const options = {
      ...basicMarketOptions,
      functionName: "addItem",
      params: {
        tokenId,
        tokenAddress,
        price: wei,
        eligibleBuyer: "0x0000000000000000000000000000000000000000"
      },
    };
    const transaction = await Moralis.executeFunction(options);
    const transactionReciept = await transaction.wait();
    const transactionDataObj = findTransactionDataObj(transactionReciept.events, "ItemAdded");
    return transactionDataObj;
  }

  const mintItem = async (receiver, tokenUri, collection) => {
    const mintOptions = {
      contractAddress: collection,
      functionName: "mintNFT",
      abi,
      params: {
        receiver,
        tokenUri
      },
    };
    const transaction = await Moralis.executeFunction(mintOptions);
    const transactionReciept = await transaction.wait();
    const transactionDataObj = findTransactionDataObj(transactionReciept.events, "Transfer");
    return transactionDataObj;
  };

  const handleSubmit = async () => {
    var uploadFileToIPFSRes = await uploadFileToIPFS(dummy_image);
    if (uploadFileToIPFSRes.path) {
      const metaData = createJSONForOtherFormats(uploadFileToIPFSRes);
      const finalJSONFileUploadIPFSRes = await uploadFileToIPFS(metaData);
      const itemUrl = "ipfs://" + finalJSONFileUploadIPFSRes.path;
      mintItem(user.attributes.ethAddress, itemUrl, collectionId)
        .then(async (mintRes) => {
          console.log(mintRes);
          const tokenId = await getLastTokenId(collectionId);
          setPermissionToMarketplace(collectionId, tokenId)
            .then((res) => {
              console.log(res);
              setForSale(tokenId, collectionId)
                .then((response) => {
                  console.log(response);
                })
            })
        })
    }
  }

  return (
    <div>
      <div>
        <button onClick={login}>Sign in with WalletConect</button>
        <button onClick={signout}>log out</button>
        <button onClick={() => handleSubmit()}>set sale Item</button>
      </div>
    </div>
  );
};