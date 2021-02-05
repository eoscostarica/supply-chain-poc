
# Vaccine Distribution Traceability using EOSIO NFTs
<p align="center">
  <img width="25%" src="https://github.com/eoscostarica/vaccine-traceability-poc/blob/main/docs/diagrams/logo.png?raw=true" align="center" />
</p>



## About This Project:
Amid the COVID-19 pandemic, pharmaceutical companies have been advancing to develop a vaccine against the SARS-CoV-2 virus outbreak. Governments and institutions are also leading a global effort to vaccinate the totality of the world population and end the pandemic. 

As of December 2020, three companies have developed vaccines that have demonstrated their efficacy upon continuous studies. Each of these vaccines has different requirements in terms of storage temperatures, expiration times, and handling, requiring precise traceability across logistics operations to safeguard its integrity. 

The team at [LACChain](https://www.lacchain.net/home), a program from the [IDB Lab](https://bidlab.org/en) that works to accelerate the blockchain ecosystem in Latin America, is currently leading a project to create and promote a solution that deploys blockchain technology to guarantee full traceability of the vaccines, regardless of their origin. This solution will help track each vaccine from the manufacturer to its application, certifying that it did not have any irregularities during its supply chain process. 

A blockchain can register transactions immutably and securely, meaning the data of each vaccine cannot be altered or hacked. The team of EOS Costa Rica is currently developing a solution deploying the EOSIO blockchain protocol. This technology will guarantee reliable and near-real-time traceability of the vaccines. Moreover, EOSIO technology is highly scalable and enables improved efficiency when storing data, ideal for executing millions of transactions in a safe environment. 

## NFT Proof Of Concept

This script test the basic functionality required by creating Non-Fungible Tokens to represent vaccines from different manufacturers and to represent the containers used for transporting the vaccines.

Vaccines are packaged in a primary containers containing 100 doses. Two primary containers are then packaged together in secondary containers. This is represented by bundling NFTs using the `attach` action provided by the Simple Assets Contract.

NFTs can be update periodically with data such as temperature and location.

In order to transfer a token between accounts an owner must `offer` it for another another account to `claim`.

Please see [SimpleAssets.hpp](https://github.com/CryptoLions/SimpleAssets/blob/master/include/SimpleAssets.hpp) in Github for a detailed description of each of these actions and their parameters.


### Before you start
Some things you need before getting started:

- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/es/)
- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)
- [EOSIO](https://github.com/EOSIO/eos)

Basic knowledge about [Simple Assets](https://github.com/CryptoLions/SimpleAssets ), [EOSIO](https://eos.io), and Shell Script is required.

### First time run

1.  Clone this repo using `git clone --depth=1 https://github.com/eoscostarica/vaccine-traceability-poc.git <YOUR_PROJECT_NAME>`
2.  Move to the appropriate directory: `cd <YOUR_PROJECT_NAME>`.
3.  Set the environment variables:  rename `.env.example` to `.env` and update accordingly
4.  Copy wallet seeds files to `wallet_data` folder.
5.  Enter command: `make run`
6.  Access the backend console: http://localhost:8080/console
7.  Manually import SQL files found in `hasura/seeds` 
8.  Navigate to http://localhost:3000/inventory/active
9.  Create a new batch of vaccines

## File Structure

Within the repo you'll find the following directories:

```
.
├── contracts ..................... Simple Assets Smart Contract
├── docs .......................... Docusaurus Documentation Generator
├── hasura ........................ Hasura GraphQL Engine
├── hapi .......................... HTTP API 
├── wallet ........................ EOSIO Wallet Service
└── webapp ........................ ReactJS Web Application
```

## Documentation

Documentation built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator. Installed in  `/docs` folder.

Topics Covered : 

 - Project Background
 - System Architecture
 - User Experience Design 
 - Smart Contracts
 - Accounts and Identity

### Documentation Installation

```console
yarn install
```

### Documentation Local Development

```console
yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## License

 © [EOS Costa Rica](https://eoscostarica.io)

## About EOS Costa Rica

<p align="center">
  <a href="https://eoscostarica.io">
    <img src="https://github.com/eoscostarica/eos-rate/raw/master/docs/eoscostarica-logo-black.png" width="300">
  </a>
</p>
<br/>

EOS Costa Rica is an independently-owned, self-funded, bare-metal Genesis EOS block producer that develops solution using EOSIO and provides infrastructure for EOSIO blockchains. We support open source software for our community while offering enterprise solutions and custom blockchain development for our clients.

[eoscostarica.io](https://eoscostarica.io) 