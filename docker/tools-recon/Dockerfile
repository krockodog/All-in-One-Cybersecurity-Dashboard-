FROM kalilinux/kali-rolling

RUN apt update && apt install -y --no-install-recommends \
    kali-linux-headless theharvester amass subfinder spiderfoot shodan recon-ng \
    sublist3r dnsrecon dnsenum fierce dmitry whois nmap masscan rustscan naabu nikto \
    wpscan gobuster dirb ffuf wfuzz whatweb wappalyzer gowitness eyewitness httpx \
    gospider hakrawler waybackurls gau katana trufflehog gitleaks enum4linux \
    enum4linux-ng smbmap smbclient ldapsearch hydra medusa ncrack john hashcat \
    sqlmap commix wafw00f dirsearch nuclei \
    && pip install --break-system-packages maigret holehe socialscan social-analyzer photon \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash omnius && mkdir -p /output /input /data
USER omnius
WORKDIR /data
