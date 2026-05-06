FROM ubuntu:22.04

RUN apt update && apt install -y --no-install-recommends \
    git curl wget python3 python3-pip openjdk-17-jdk netcat-openbsd tmux screen \
    && pip3 install flask flask-cors \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash omnius && mkdir -p /opt/c2 /data /output
USER omnius
WORKDIR /data
