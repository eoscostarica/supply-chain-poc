include mkutils/meta.mk mkutils/help.mk 

run:
	make -B postgres
	make -B wallet
	make -B hapi
	make -B hasura
	make -B -j 3 hapi-logs hasura-cli webapp

postgres:
	@docker-compose stop postgres
	@docker-compose up -d --build postgres
	@echo "done postgres"

wallet:
	@docker-compose stop wallet
	@docker-compose up -d --build wallet
	@echo "done wallet"

hapi:
	@docker-compose stop hapi
	@docker-compose up -d --build hapi
	@echo "done hapi"

hapi-logs:
	@docker-compose logs -f hapi

hasura:
	$(eval -include .env)
	@until \
		docker-compose exec -T postgres pg_isready; \
		do echo "$(BLUE)$(STAGE)-$(APP_NAME)-hasura |$(RESET) waiting for postgres service"; \
		sleep 5; done;
	@until \
		curl http://localhost:9090/healthz; \
		do echo "$(BLUE)$(STAGE)-$(APP_NAME)-hasura |$(RESET) waiting for hapi service"; \
		sleep 5; done;
	@echo "..."
	@docker-compose stop hasura
	@docker-compose up -d --build hasura
	@echo "done hasura"

hasura-cli:
	$(eval -include .env)
	@until \
		curl http://localhost:8080/healthz; \
		do echo "$(BLUE)$(STAGE)-$(APP_NAME)-hasura |$(RESET) ..."; \
		sleep 5; done;
	@echo "..."
	@cd hasura && hasura seeds apply --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET);
	@cd hasura && hasura console --endpoint http://localhost:8080 --skip-update-check --no-browser --admin-secret $(HASURA_GRAPHQL_ADMIN_SECRET);

webapp:
	$(eval -include .env)
	@until \
		curl http://localhost:8080/healthz; \
		do echo "$(BLUE)$(STAGE)-$(APP_NAME)-webapp |$(RESET) waiting for hasura service"; \
		sleep 5; done;
	@echo "..."
	@cd webapp && yarn && yarn start:local | cat
	@echo "done webapp"

stop:
	@docker-compose stop

K8S_BUILD_DIR ?= ./build_k8s
K8S_FILES := $(shell find ./kubernetes -name '*.yaml' | sed 's:./kubernetes/::g')

build-kubernetes: ##@devops Generate proper k8s files based on the templates
build-kubernetes: ./kubernetes
	@echo "Build kubernetes files..."
	@rm -Rf $(K8S_BUILD_DIR) && mkdir -p $(K8S_BUILD_DIR)
	@for file in $(K8S_FILES); do \
		mkdir -p `dirname "$(K8S_BUILD_DIR)/$$file"`; \
		$(SHELL_EXPORT) envsubst <./kubernetes/$$file >$(K8S_BUILD_DIR)/$$file; \
	done

deploy-kubernetes: ##@devops Publish the build k8s files
deploy-kubernetes: $(K8S_BUILD_DIR)
	@echo "Applying kubernetes files..."
	@kubectl create ns inmutrust || echo "Namespace 'inmutrust' already exists.";
	@kubectl create secret docker-registry regcred \
		--docker-server=$(DOCKER_SERVER) \
		--docker-username=$(DOCKER_REGISTRY) \
		--docker-password=$(DOCKER_PASSWORD) \
		--docker-email=$(DOCKER_EMAIL) \
		-n $(NAMESPACE) || echo "Docker Registry already configured.";
	@for file in $(shell find $(K8S_BUILD_DIR) -name '*.yaml' | sed 's:$(K8S_BUILD_DIR)/::g'); do \
        	kubectl apply -f $(K8S_BUILD_DIR)/$$file -n $(NAMESPACE) || echo "${file} Cannot be updated."; \
	done

build-all:
	@echo "Building docker images..."
	@echo "Version" $(VERSION)
	for dir in $(SUBDIRS); do \
		$(MAKE) build-docker -C $$dir; \
	done

push-images:
	@echo "Publishing docker images..."
	@echo "Version" $(VERSION)
	for dir in $(SUBDIRS); do \
        	$(MAKE) push-image -C $$dir; \
	done