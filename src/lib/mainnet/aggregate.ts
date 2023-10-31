import { State, cacheLienStates } from "../prisma/store.js";
import { CompositeOp, retrieveMostRecentLiensState } from "../prisma/retrieve.js";


export function computeNextState(currentState: State | null, op: CompositeOp): State {
  if (currentState === null) {
    if (op.event_type !== 'CREATE') {
      throw new Error('Invalid lien Data, lien must be CREATE first');
    }

    const initialState: State = {
      lienId: op.lienId,
      block: op.block,
      time: op.time,
      collection: op.collection,
      borrower: op.borrower!,
      lender: op.lender!,
      tokenId: op.tokenId!,
      amount: op.amount!,
      rate: op.rate!,
      auctionDuration: op.auctionDuration!,
      startTime: op.startTime!,
      auctionStartBlock: op.auctionStartBlock!,
    }

    return initialState;
  }


  const invariances = {
    lienId: currentState.lienId,
    tokenId: currentState.tokenId,
    borrower: currentState.borrower,
    collection: currentState.collection
  };

  let {
    amount: currentAmount, rate: currentRate, lender: currentLender,
    startTime: currentStartTime, auctionDuration: currentAuctionDuration,
    auctionStartBlock: currentAuctionStartBlock
  } = currentState;

  const newState = {
    block: op.block,
    time: op.time,
    ...invariances,

    lender: op.lender ?? currentLender,

    amount: op.amount ?? currentAmount,
    rate: op.rate ?? currentRate,
    startTime: op.startTime ?? currentStartTime,
    auctionDuration: op.auctionDuration ?? currentAuctionDuration,
    auctionStartBlock: op.auctionStartBlock ?? currentAuctionStartBlock
  }

  switch (op.event_type) {
    case 'DELETE':
      return {
        block: op.block,
        time: op.time,
        ...invariances,

        // keep last lender
        lender: currentLender,
        // nullified data
        amount: "0",
        rate: 0,
        startTime: 0,
        auctionDuration: 0,
        auctionStartBlock: 0
      }
    default:
      return newState
  }
}

/** 
 * Construct all historical states of a lien (unique `lienId`) 
 * @param lienOps - operations of a lien in CORRECT HISTORICAL ORDER. MUST BELONG TO THE SAME lienId.
 * */
export function constructLien(lienOps: CompositeOp[]): State[] {
  if (lienOps.length == 0) {
    return [];
  }

  const states = [];
  let previousState = null;
  for (const op of lienOps) {
    const newState = computeNextState(previousState, op);
    previousState = newState;
    states.push(newState);
  }

  return states
}

/**
* Update lien state given newly fetched lien operations
* @dev Database MUST BE UP TO DATE
* @param newLienOps lien operations that are JUST COLLECTED
* */
export async function updateLiens(newLienOps: CompositeOp[]) {
  if (newLienOps.length == 0) {
    return;
  }
  newLienOps.sort((o1, o2) => o1.block - o2.block);

  const dirtyLienIds = [...new Set(newLienOps.map((op) => op.lienId))];

  let currentStates = await retrieveMostRecentLiensState(dirtyLienIds);

  const newLienStates = [];
  for (const op of newLienOps) {
    const { lienId } = op;
    const currentState = currentStates[lienId];
    const newState = computeNextState(currentState, op);
    newLienStates.push(newState);
  }

  await cacheLienStates(newLienStates);
  return newLienStates;
}
