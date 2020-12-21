include ../mkutils/meta.mk ../mkutils/help.mk

LATEST_TAG ?= latest

build-docker: ##@devops Build the docker image
build-docker: ./Dockerfile
	@docker pull $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(VERSION) || true
	@docker build \
		--cache-from $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(VERSION) \
		--target run-stage \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(VERSION) \
		.

pull-image: ##@devops Pull the latest image from registry for caching
pull-image:
	@docker pull $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(LATEST_TAG) || true

build-docker-cached: ##@devops Build the docker image using cached layers
build-docker-cached: ./Dockerfile
	@docker build \
		--target prod-stage \
		--cache-from $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(LATEST_TAG) \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(VERSION) \
		-t $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(LATEST_TAG) \
		.

push-image: ##@devops Push the freshly built image and tag with release or latest tag
push-image:
	@docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME_WALLET):$(VERSION)