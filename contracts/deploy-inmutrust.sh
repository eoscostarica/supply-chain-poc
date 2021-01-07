#!/usr/bin/env bash
set -e

RPC_URL="${RPC_URL:-https://b-0khpzsg0bsew9jhi.baas-staging.b1ops.net}"

unlock_wallet() {
  echo "Unlocking wallet for $1"
  cleos wallet unlock -n $1 --password $(cat "./secrets/$1-password.txt") ||
    echo "Wallet has already been unlocked..."
}

create_wallet() {
  cleos wallet create -n $EOSIO_ACCOUNT --to-console |
    awk 'FNR > 3 { print $1 }' |
    tr -d '"' \
      >./secrets/$EOSIO_ACCOUNT-password.txt

  cleos wallet open -n $EOSIO_ACCOUNT
  unlock_wallet $EOSIO_ACCOUNT

  cleos wallet import -n $EOSIO_ACCOUNT --private-key $EOSIO_PRIV_KEY
}

create_accounts() {
  echo "Creating system accounts..."
  mkdir -p ./secrets
  system_accounts=(
    "mscrorg11111"
    "admin1111111"
    "hracgcr11111"
    "reviewer1111"
    "vaccinator11"
    "hebbcr111111"
    "reviewer2222"
    "vaccinator22"
  )

  for account in "${system_accounts[@]}"; do

    keys=($(cleos create key --to-console))
    pub=${keys[5]}
    priv=${keys[2]}

    echo "Creating $account wallet..."
    echo $priv >./secrets/$account.key
    cleos wallet create -n $account --to-console |
      awk 'FNR > 3 { print $1 }' |
      tr -d '"' \
        >./secrets/$account-password.txt
    cleos wallet open -n $account
    unlock_wallet $account
    cleos wallet import -n $account --private-key $priv || "Key already exists"

    echo "Creating $account account..."

    cleos -u $RPC_URL create account $EOSIO_ACCOUNT $account $pub
  done

}

deploy_simpleassets() {
  unlock_wallet "simpleassets"
  cleos -u $RPC_URL set contract simpleassets ./simpleassets/
  cleos -u $RPC_URL set account permission simpleassets active \
    '{
        "threshold": 1,
        "keys": [{
            "key": "'${SIMPLE_ASSETS_PUB_KEY}'",
            "weight": 1
        }],
        "accounts": [{
            "permission": {
                "actor": "simpleassets",
                "permission": "eosio.code"
            },
            "weight": 1
        }]
    }'
}

run_nft() {
  echo -e 'Installling Simple Assets Contract for Inmutrust !'
  #create_wallet
  #create_accounts
  deploy_simpleassets
  echo 'Deploy Complete!'
  exit 0
}

run_nft
