FROM alpine

RUN apk update \
    && apk --no-cache add ca-certificates wget libc6-compat

ARG CLI_TAR_FILE
COPY $CLI_TAR_FILE /tmp/

RUN mkdir -p /tmp/utilities \
    && tar -xvf /tmp/$CLI_TAR_FILE -C /tmp/utilities \
    && mv /tmp/utilities/bin/sas-admin /usr/local/bin \
    && rm -Rf /tmp/utilities \
    && rm -f /tmp/$CLI_TAR_FILE \
    && chmod +x /usr/local/bin/sas-admin

RUN addgroup -S sas --gid 1001 && adduser -S sas -G sas --uid 1000

USER sas