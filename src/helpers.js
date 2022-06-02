import { create } from "ipfs-http-client";
import { ethers } from 'ethers';
import NFT from './ERC721NFTBase.json';

export const createJSONForOtherFormats = (uploadFileToIPFSRes) => {
    let metaData = {
        name: "Test NFT 001",
        description: "Description",
        background_color: '#73bda8',
        attributes: [],
        short_description: "",
        image: `ipfs://${uploadFileToIPFSRes.path}`,
        preview_image_url: `https://ipfs.io/ipfs/${uploadFileToIPFSRes.path}`,
    }

    return metaData;
};

export const uploadFileToIPFS = async (file) => {
    try {
        const client = create('https://ipfs.infura.io:5001/api/v0');
        const uploadFileToIPFSRes = await client.add(JSON.stringify(file));
        console.log(uploadFileToIPFSRes);
        return uploadFileToIPFSRes;
    } catch (error) {
        console.log(error)
    }
}

export const findTransactionDataObj = (originalArray, transactionEventType) => {
    return originalArray.find((value) => (value.event !== undefined && value.event === transactionEventType));
};

const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc")

export const getNFTContract = (contractAddress) => {
    const contract = new ethers.Contract(contractAddress, NFT, provider)
    return contract;
}

export const getLastTokenId = async (address) => {
    const tokenContract = getNFTContract(address);
    const lastTokenId = await tokenContract.getLastToken();
    return lastTokenId.add(1).toString();
}