FROM --platform=linux/amd64 rockylinux:9

ARG CLI_TAR_FILE
COPY $CLI_TAR_FILE /tmp/

RUN mkdir -p /tmp/utilities \
    && tar -xvf /tmp/$CLI_TAR_FILE -C /tmp/utilities \
    && mv /tmp/utilities/sas-viya /usr/local/bin \
    && rm -Rf /tmp/utilities \
    && rm -f /tmp/$CLI_TAR_FILE \
    && chmod +x /usr/local/bin/sas-viya

RUN adduser sas

USER sas