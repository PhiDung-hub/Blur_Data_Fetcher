WITH 
----- LIEN CREATION EVENTS -----
--------------------------------
lien_creates AS (
  SELECT
    -- book keepings
    evt_tx_hash as hash,
    evt_block_number as block,
    evt_block_time as time,
    'CREATE' as event_type,
    -- lien info
    lienId,
    collection,
    -- lien params
    lender,
    borrower,
    tokenId,
    loanAmount as amount,
    rate,
    auctionDuration,
    to_unixtime(evt_block_time) as startTime,
    0 as auctionStartBlock
  
  FROM blur_ethereum.Blend_evt_LoanOfferTaken

  WHERE 

  evt_tx_hash NOT IN (
    SELECT l.evt_tx_hash
    FROM 
    blur_ethereum.Blend_evt_LoanOfferTaken l 
    JOIN blur_ethereum.Blend_evt_Refinance r ON l.evt_block_number = r.evt_block_number
  )
),
--- END LIEN CREATION EVENTS ---
--------------------------------

----- LIEN DELETION EVENTS -----
--------------------------------
lien_deletes AS (
  SELECT 
    -- book keepings
    evt_tx_hash as hash,
    evt_block_number as block,
    evt_block_time as time,
    'DELETE' as event_type,
    -- lien info
    lienId,
    collection,
    -- lien params
    NULL AS lender,
    NULL AS borrower,
    NULL AS tokenId,
    NULL AS amount,
    NULL AS rate,
    NULL AS auctionDuration,
    NULL AS startTime,
    NULL AS auctionStartBlock
  
  FROM (
    SELECT * FROM blur_ethereum.Blend_evt_Seize 
    UNION ALL 
    SELECT * FROM blur_ethereum.Blend_evt_Repay
  )
),
--- END LIEN DELETION EVENTS ---
--------------------------------

----- LIEN MUTATION EVENTS -----
--------------------------------
refinances AS (
  SELECT 
    -- book keepings
    evt_tx_hash as hash,
    evt_block_number as block,
    evt_block_time as time,
    -- lien info
    lienId,
    collection,
    -- updated lien params
    newLender,
    newAmount,
    newRate,
    newAuctionDuration,
    0 as newAuctionStartBlock,
    evt_block_time as newStartTime
    -- `borrower`, `collection`, `tokenId` REMAIN THE SAME.
  
  FROM blur_ethereum.Blend_evt_Refinance
),

auctions AS (
  SELECT
    -- book keepings
    evt_tx_hash as hash,
    evt_block_number as block,
    evt_block_time as time,
    -- lien info
    lienId,
    collection,
    -- updated params
    evt_block_number AS newAuctionStartBlock

  FROM blur_ethereum.Blend_evt_StartAuction
),

lien_updates AS (
  SELECT 
    -- book keepings
    hash,
    block,
    time,
    'UPDATE' as event_type,
    -- lien info
    lienId,
    collection,
    -- lien params
    lender,
    NULL as borrower,
    NULL as tokenId,
    amount,
    rate,
    auctionDuration,
    startTime,
    auctionStartBlock
  FROM (
    SELECT 
      -- book keepings
      evt_tx_hash as hash,
      evt_block_number as block,
      evt_block_time as time,
      -- lien info
      lienId,
      collection,
      -- updated lien params
      newLender as lender,
      newAmount as amount,
      newRate as rate,
      newAuctionDuration as auctionDuration,
      0 as auctionStartBlock,
      to_unixtime(evt_block_time) as startTime
      -- `borrower`, `collection`, `tokenId` REMAIN THE SAME.
    FROM blur_ethereum.Blend_evt_Refinance

    UNION ALL

    SELECT
      -- book keepings
      evt_tx_hash as hash,
      evt_block_number as block,
      evt_block_time as time,
      -- lien info
      lienId,
      collection,
      -- updated params
      NULL AS lender,
      NULL AS amount,
      NULL AS rate,
      NULL AS auctionDuration,
      evt_block_number AS auctionStartBlock,
      NULL AS startTime

    FROM blur_ethereum.Blend_evt_StartAuction
  )
)
--- END LIEN MUTATION EVENTS ---
--------------------------------

SELECT 
  * 
FROM (
  SELECT * FROM lien_creates 
  UNION ALL 
  SELECT * FROM lien_updates
  UNION ALL 
  SELECT * FROM lien_deletes
)
ORDER BY block
--- Parameterized by DuneSQL, sub default value
OFFSET 0 -- {{skip}}
LIMIT 20000 -- {{result_size}}

