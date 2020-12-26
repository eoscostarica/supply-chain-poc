-include .env

VERSION ?= $(shell git rev-parse --short HEAD)
NAMESPACE ?= "inmutrust"
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

