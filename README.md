# Tracking Blur data

## Start 

1. Install pnpm or use npm

    ```
    pnpm install 
    ```

2. Create `.env` and copy `.env.example` into it, change the configs.

    Only `MAINNET_RPC` and `DATABASE_URL` required

## DB set up

1. Copy `.env.example`, if no change in `DATABASE_URL` => create a local dev.db at `./prisma/dev.db`

2. Update .env
    ```
    pnpm prisma deploy 
    ```

    ```
    pnpm prisma generate 
    ```

3. Inspect the db:

    ```
    pnpm prisma studio
    ```

See: [Prisma guides](https://www.prisma.io/docs/guides)

## Tasks 

+ Run the on-chain watcher:

    ```
    pnpm ts-node-esm src/scripts/watcher/lien_state.ts
    ```

+ Run the viem collector to fetch historical on-chain operation:

    ```
    pnpm ts-node-esm src/scripts/viem_collector/get_lien_ops.ts --from <FROM_BLOCK> --to <TO_BLOCK>
    ```

    _replace <FROM_BLOCK> and <TO_BLOCK> with corresponding number_

+ Constructing lien state from cached operation

## Misc

Check out: [dashboard by beetle](https://dune.com/beetle/blur-loans)

