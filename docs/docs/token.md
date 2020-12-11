---
id: token
title: Token Contract
---

## Simple Assets Non-Fungible Tokens (NFTs)
- Each vaccine represented by token , lots can be represented as NFT containing NFT.
- Tokens are issued upon completing initialization according to number of doses in container, and product brand / name
- Tokens are offered / claimed between accounts whenever there is a change of custody
- Token are transfered to an end user account when administered 

## Testing 

1 - Create 10,000 new tokens

2 - Attach in 10 containers of 1,000

3 - Transfer 10 containers to 1 distribution center account

4 - Transfer 1 container to 10 vaccination center accounts

5 - Detach NFT 

6 - Transfer to 1000 recipient accounts    


### Initialize

`create (author, category, owner, idata, mdata, requireсlaim) // create NFT`

```c++
name author = get_self();
name category = "vaccine"_n;
name owner = "custodian1"_n;
string idata = '{
    "product_name": "BNT162b2",
    "brand_name": "BioNTech",
    "manufacturer": "Pfizer",
    "expiry_date": "6/13/2021",
    "lot_number": "HJ123QJL",
    "dose_volume": "200cc",
    "method": "Injection", 
}';

string mdata = '{
    "temperature": "-60",
    "location": "-7.12321312, 110.43323123123", 
    "status": "In Transit",
    "patient_id": "1-222-1213"
}';
```

### Update
`update (author, owner, assetid, mdata) // update an NFT’s mdata`

### Transfer

`transfer (from, to , [assetid1,..,assetidn], memo) // transfer the NFT to a different account`

This could also be done using two steps using  `claim / offer` actions in order to obtain both parties signatures. 

#### Claim
`claim (claimer, [assetid1,..,assetidn]) // a “claim” will use the recipient’s RAM`

#### Offer
`offer (owner, newowner, [assetid1,..,assetidn], memo) // as an alternative to transferring an NFT, an owner can “offer” it for another another account to claim.`

#### Cancel Offer
`canceloffer (owner, [assetid1,..,assetidn]) // cancels an offer`


### Lot NFT and Dose NFT

Unique NFT fot lots and doses


#### Attach 
 This allows all the assets to be transferred together.

`attach (owner, assetidc, [assetid1,..,assetidn]) // puts an array of NFT inside another NFT. This is only callable by the author (ie. the game).`

#### Detach 
`detach (owner, assetidc, [assetid1,..,assetidn]) // removes an array of NFTs from another NFT. This is callable by the OWNER and the AUTHOR.`


### Burn
`burn (owner, [assetid1,..,assetidn], memo) // burn the NFT`


## Simple Assets For Non-Transferable Tokens (NTTs)

# Token Created when vaccine is administered
`createntt (author, category, owner, idata, mdata, requireсlaim)`

`updatentt (author, owner, assetid, mdata)`

`burnntt (owner, [assetid1,..,assetidn], memo)`
