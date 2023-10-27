import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const API_KEY = process.env.ETHERSCAN_API_KEY;

interface EtherscanLogsResponse {
  status: string;
  message: string;
  result: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    blockHash: string;
    timeStamp: string;
    gasPrice: string;
    gasUsed: string;
    logIndex: string;
    transactionHash: string;
    transactionIndex: string;
  }[];
}

