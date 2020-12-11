#!/usr/bin/env bash
set -e

RPC_URL="${RPC_URL:-https://b-0khpzsg0bsew9jhi.baas-staging.b1ops.net}"

if [ -f "last.nft" ]; then
    nft=$(cat last.nft)
else
    nft=0
fi

unlock_wallet() {
    cleos wallet unlock -n nft --password $(cat ./secrets/wallet_password.txt) ||
        echo "Wallet has already been unlocked..."
}

create_wallet() {
    mkdir -p ./secrets
    cleos wallet create -n nft --to-console |
        awk 'FNR > 3 { print $1 }' |
        tr -d '"' \
            >./secrets/wallet_password.txt
    cleos wallet open
    unlock_wallet
    cleos wallet import -n nft --private-key $EOSIO_PRIV_KEY
}

create_accounts() {
    mkdir -p ./secrets
    system_accounts=(
        "simpleassets"
        "admin"
        "freight"
        "distribution"
        "clinic1"
        "patient1"
        "patient2"
    )

    for account in "${system_accounts[@]}"; do
        echo "Creating $account account..."

        keys=($(cleos create key --to-console))
        pub=${keys[5]}
        priv=${keys[2]}
        cleos wallet import -n nft --private-key $priv
        echo $priv >./secrets/$account.key

        cleos -u $RPC_URL create account blockonebaas $account $pub
    done
}

deploy_simpleassets() {
    cleos -u $RPC_URL set contract simpleassets ./simpleassets/
    cleos -u $RPC_URL set account permission simpleassets active \
    '{
        "threshold": 1,
        "keys": [{
            "key": "'${SIMPLE_ASSETS_PUB_KEY}''",
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

create_primary_container_nft() {
    echo 'Creating Two Primary Container NFT'
    cmd="cleos -u $RPC_URL push action -j simpleassets create nft-definitions/primary-container.json -p admin@active"
    # TODO Add both actions in a single transaction
    $cmd
    $cmd
    nft=$((nft + 2))
    echo $nft >last.nft
    echo "Primary Containers Created"
}

create_secondary_container_nft() {
    echo 'Creating 1 Secondary Container NFT'
    cmd="cleos -u $RPC_URL push action -j simpleassets create nft-definitions/secondary-container.json -p admin@active"
    $cmd
    nft=$((nft + 1))
    echo $nft >last.nft
    echo 'Secondary Container Created'
}

create_vaccine_nft() {
    cleos -u $RPC_URL push action -j simpleassets create nft-definitions/pfizer-vaccine.json -p admin@active
    # TODO Add several actions in a single transaction
}

create_vaccine_nfts() {
    echo 'Creating a batch of '$1' vaccine NFTs'
    if [[ $(($1 % 2)) -eq 1 ]]; then
        echo >&2 "Error: lot size needs to be an even number."
        return 1
    fi
    
    echo "$nft initial asset id"
    lot_size=$1
    x=$1
    while [ $x -gt 0 ]; do
        create_vaccine_nft
        x=$(($x - 1))
    done

    nft=$((nft + $1))
    echo $nft >last.nft
    echo "$x Vaccines Created"
    echo "$nft is the last assetid created"
    create_primary_container_nft
    create_secondary_container_nft
}

transfer_to_freight() {
    echo 'Container Ground Transportation'
    cleos -u $RPC_URL push action simpleassets claim \
        '[
        freight,
        ["'$nft'"]
    ]' -p freight@active
}

attach_nfts() {
    echo "Attaching Vaccine NFTs to Container NFTs"
    secondary_container=$((nft))
    primary_container_1=$((nft - 1))
    primary_container_2=$((nft - 2))
    vaccines_per_container=$((lot_size / 2))
    container_1_start=$((nft - lot_size - 2))
    container_1_end=$((nft - vaccines_per_container - 2))
    container_2_start=$((nft - vaccines_per_container - 2))
    container_2_end=$((nft - 2))

    echo "Lot Size $lot_size"
    echo "Secondary container id $secondary_container"
    echo "Primary container 1 id $primary_container_1"
    echo "Primary container 2 id $primary_container_2"
    echo "Vaccines per primary container $vaccines_per_container"

    declare -a secondary_container_array=()
    declare -a primary_container_1_array=()
    declare -a primary_container_2_array=()

    secondary_container_array+=($primary_container_1)
    secondary_container_array+=($primary_container_2)

    counterA=$container_1_start
    until [ $counterA -eq $container_1_end ]; do
        primary_container_1_array+=($counterA)
        counterA=$((counterA + 1))
    done

    counterB=$container_2_start
    until [ $counterB -eq $container_2_end ]; do
        primary_container_2_array+=($counterB)
        counterB=$((counterB + 1))
    done

    echo "Bundle Vaccines in Primary Container"
    container1_vaccines=$(echo $(echo ${primary_container_1_array[@]}) | tr ' ' ',')
    cleos -u $RPC_URL push action simpleassets attach \
        '["freight", "'${primary_container_1}'", ['${container1_vaccines}'] ]' -p admin@active

    echo "Bundle Vaccines in Primary Container"
    container2_vaccines=$(echo $(echo ${primary_container_2_array[@]}) | tr ' ' ',')
    cleos -u $RPC_URL push action simpleassets attach \
        '["freight", "'${primary_container_2}'", ['${container2_vaccines}'] ]' -p admin@active

    echo "Bundle Primary and Secondary Containers"
    primary_container_ids=$(echo $(echo ${secondary_container_array[@]}) | tr ' ' ',')
    cleos -u $RPC_URL push action simpleassets attach \
        '["freight", '${secondary_container}', ['${primary_container_ids}'] ]' -p admin@active
}

freight_update() {
    echo 'Update Temperature and Location while in Transit'
    cleos -u $RPC_URL push action simpleassets update \
    '{
        "author": "admin",
        "owner": "freight",
        "assetid": "'$secondary_container'",
        "mdata": "{ \
            \"temperature\": \"-50\", \
            \"location\": \"-7.12321312, 110.43323123123\", \
            \"status\": \"In Transit\" \
        }"
    }' -p admin@active
}

deliver_to_distribution() {
    echo 'Container Drop Off at Distribution Center'
    cleos -u $RPC_URL push action simpleassets offer \
    '[
        freight,
        distribution,
        ["'$secondary_container'"],
        "Transfer container to distribution center"
    ]' -p freight@active
}

distribution_claim() {
    echo 'Distribution Center Confirms Delivery'
    cleos -u $RPC_URL push action simpleassets claim \
    '[
        distribution,
        ["'$secondary_container'"]
    ]' -p distribution@active
}

distribution_update() {
    echo 'Update Temperature and Location while in Storage'
    cleos -u $RPC_URL push action simpleassets update \
    '{
        "author": "admin",
        "owner": "distribution",
        "assetid": "'$secondary_container'",
        "mdata": "{ \
            \"temperature\": \"-60\", \
            \"location\": \"-7.12312312, 111.43323123123\", \
            \"status\": \"Cold Storage\" \
        }"
    }' -p admin@active
}

deliver_to_clinic() {
    echo 'Container Drop Off at Vaccination Clinic'
    cleos -u $RPC_URL push action simpleassets offer \
    '[
        distribution,
        clinic,
        ["'$secondary_container'"],
        "Deliver container to vaccination clinic"
    ]' -p distribution@active
}

clinic_claim() {
    echo 'Clinic Confirms Delivery'
    cleos -u $RPC_URL push action simpleassets claim \
    '[
        clinic,
        ["'$secondary_container'"]
    ]' -p clinic@active
}

detach_containers() {
    echo 'Remove Primary Container from Secondary Container'
    cleos -u $RPC_URL push action simpleassets detach \
    '[
        clinic,
        '$secondary_container',
        ["'$primary_container_1'"]
    ]' -p admin@active
}

detach_vaccines() {
    echo 'Remove 2 Vaccines from Primary Container'
    cleos -u $RPC_URL push action simpleassets detach \
    '[
        clinic,
        "'$primary_container_1'",
        ["'$container_1_start'","'$((container_1_start + 1))'"]
    ]' -p admin@active
}

administer_vaccine1() {
    echo 'Administer Vaccine to Patient #1'
    cleos -u $RPC_URL push action simpleassets transfer \
    '[
        clinic,
        patient1,
        ["'$container_1_start'"],
        "Vaccine Administered to patient 1"
    ]' -p clinic@active
}

administer_vaccine2() {
    echo 'Administer Vaccine to Patient #2'
    cleos -u $RPC_URL push action simpleassets transfer \
    '[
        clinic,
        patient2,
        ["'$((container_1_start + 1))'"],
        "Vaccine Administered to patient #2"
    ]' -p clinic@active
}

run_nft() {
    echo -e 'Initializing NFT test !'
    #  create_wallet
    unlock_wallet
    #  create_accounts
    #  deploy_simpleassets
    create_vaccine_nfts 4 # Set Number of Vaccines to create
    transfer_to_freight
    attach_nfts
    freight_update
    deliver_to_distribution
    distribution_claim
    distribution_update
    deliver_to_clinic
    clinic_claim
    detach_containers
    detach_vaccines
    administer_vaccine1
    administer_vaccine2
    echo 'Test Complete!'
    exit 0
}

run_nft
