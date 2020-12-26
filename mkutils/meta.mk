-include .env

VERSION ?= $(shell git rev-parse --short HEAD)
CURRENT_BRANCH ?= $(git rev-parse --abbrev-ref HEAD)
NAMESPACE ?= "inmutrust"

ifeq ($(CURRENT_BRANCH),main)
	REACT_APP_HASURA_URL := https://graphql.inmutrust.com/v1/graphql
else ifeq ($(CURRENT_BRANCH),dev)
	REACT_APP_HASURA_URL := https://dev-graphql.inmutrust.com/v1/graphql
else
	REACT_APP_HASURA_URL := http://localhost:8585/v1/graphql
endif

IMAGE_NAME_WEBAPP=inmutrust-webapp
IMAGE_NAME_HAPI=inmutrust-hapi
IMAGE_NAME_HASURA=inmutrust-hasura
IMAGE_NAME_WALLET=inmutrust-wallet

DOCKER_REGISTRY=eoscostarica506
SUBDIRS=hasura webapp hapi wallet

MAKE_ENV += DOCKER_REGISTRY VERSION IMAGE_NAME_WEBAPP IMAGE_NAME_HAPI IMAGE_NAME_HASURA IMAGE_NAME_WALLET

SHELL_EXPORT := $(foreach v,$(MAKE_ENV),$(v)='$($(v))')

ifneq ("$(wildcard .env)", "")
	export $(shell sed 's/=.*//' .env)
endif

