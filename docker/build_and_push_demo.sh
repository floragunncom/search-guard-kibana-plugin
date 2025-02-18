docker context create tls-environment
docker buildx create --name esxbuilder  --use tls-environment || true
docker buildx use esxbuilder
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64 --build-arg ELASTIC_VERSION=$1 --build-arg SG_VERSION=$2 -f Dockerfile-demo -t floragunncom/search-guard-flx-demo:pctest -t floragunncom/search-guard-flx-demo:$1-$2-flx --push .