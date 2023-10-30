SELECT number, time FROM ethereum.blocks

WHERE number >= <START_BLOCK>
ORDER BY number
LIMIT <RESULT_SIZE>
