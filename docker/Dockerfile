ARG SG_KIBANA_VERSION
ARG ELK_VERSION


# https://github.com/elastic/kibana-docker
FROM docker.elastic.co/kibana/kibana:${ELK_VERSION} as base

# Search Guard plugin
ARG SG_KIBANA_VERSION
ARG ELK_VERSION
ENV FULL_SG_VERSION=${SG_KIBANA_VERSION}-es-${ELK_VERSION}

FROM base as flx
ARG TARGETARCH
COPY build_arm64_node.sh /tmp/
ENV FULL_SG_VERSION=${SG_KIBANA_VERSION}-es-${ELK_VERSION}
ARG SG_URL=https://maven.search-guard.com/search-guard-flx-release/com/floragunn/search-guard-flx-kibana-plugin/${FULL_SG_VERSION}/search-guard-flx-kibana-plugin-${FULL_SG_VERSION}.zip
RUN if [ "$TARGETARCH" = "arm64" ]; then \
      kibana-plugin install $SG_URL || { exit_code=$?; [ $exit_code -eq 255 ] && /tmp/build_arm64_node.sh $SG_URL || exit $exit_code; } ;\
      else \
      kibana-plugin install $SG_URL; \
    fi
