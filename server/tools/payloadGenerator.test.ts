import { describe, it, expect } from "vitest";
import {
  generateReverseShell,
  generateWebShell,
  generatePayloadEncoder,
  generatePayload,
  PayloadConfig,
  GeneratedPayload,
} from "./payloadGenerator";

const baseConfig: PayloadConfig = {
  type: "reverse_shell",
  language: "bash",
  lhost: "192.168.1.100",
  lport: 4444,
  obfuscate: false,
};

describe("payloadGenerator", () => {
  describe("generateReverseShell", () => {
    it("should return a GeneratedPayload object", () => {
      const result = generateReverseShell(baseConfig);
      expect(result).toHaveProperty("payload");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("language");
      expect(result).toHaveProperty("obfuscated");
      expect(result).toHaveProperty("size");
    });

    it("should include lhost in bash payload", () => {
      const result = generateReverseShell(baseConfig);
      expect(result.payload).toContain("192.168.1.100");
    });

    it("should include lport in bash payload", () => {
      const result = generateReverseShell(baseConfig);
      expect(result.payload).toContain("4444");
    });

    it("should generate bash reverse shell correctly", () => {
      const result = generateReverseShell({ ...baseConfig, language: "bash" });
      expect(result.payload).toContain("bash -i");
      expect(result.payload).toContain("/dev/tcp/");
    });

    it("should generate python reverse shell correctly", () => {
      const result = generateReverseShell({ ...baseConfig, language: "python" });
      expect(result.payload).toContain("python");
      expect(result.payload).toContain("socket");
      expect(result.payload).toContain("192.168.1.100");
    });

    it("should generate powershell reverse shell correctly", () => {
      const result = generateReverseShell({ ...baseConfig, language: "powershell" });
      expect(result.payload).toContain("powershell");
      expect(result.payload).toContain("192.168.1.100");
      expect(result.payload).toContain("4444");
    });

    it("should generate php reverse shell correctly", () => {
      const result = generateReverseShell({ ...baseConfig, language: "php" });
      expect(result.payload).toContain("php");
      expect(result.payload).toContain("fsockopen");
      expect(result.payload).toContain("192.168.1.100");
    });

    it("should default to bash for unknown language", () => {
      const result = generateReverseShell({ ...baseConfig, language: "javascript" });
      expect(result.payload).toContain("bash -i");
    });

    it("should set language field on result", () => {
      const result = generateReverseShell({ ...baseConfig, language: "python" });
      expect(result.language).toBe("python");
    });

    it("should set obfuscated to false when not obfuscating", () => {
      const result = generateReverseShell({ ...baseConfig, obfuscate: false });
      expect(result.obfuscated).toBe(false);
    });

    it("should set obfuscated to true when obfuscating", () => {
      const result = generateReverseShell({ ...baseConfig, obfuscate: true });
      expect(result.obfuscated).toBe(true);
    });

    it("should obfuscate payload when obfuscate is true", () => {
      const plain = generateReverseShell({ ...baseConfig, obfuscate: false });
      const obfuscated = generateReverseShell({ ...baseConfig, obfuscate: true });
      // Obfuscated payload should not contain raw bash command
      expect(obfuscated.payload).not.toBe(plain.payload);
      expect(obfuscated.payload).toContain("base64");
    });

    it("should have positive size for non-empty payload", () => {
      const result = generateReverseShell(baseConfig);
      expect(result.size).toBeGreaterThan(0);
    });

    it("should report accurate byte size", () => {
      const result = generateReverseShell(baseConfig);
      expect(result.size).toBe(Buffer.byteLength(result.payload));
    });
  });

  describe("generateWebShell", () => {
    it("should return a GeneratedPayload object", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "php" });
      expect(result).toHaveProperty("payload");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("language");
      expect(result).toHaveProperty("obfuscated");
      expect(result).toHaveProperty("size");
    });

    it("should generate php web shell correctly", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "php" });
      expect(result.payload).toContain("<?php");
      expect(result.payload).toContain("system(");
    });

    it("should generate javascript web shell correctly", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "javascript" });
      expect(result.payload).toContain("express");
      expect(result.payload).toContain("child_process");
    });

    it("should include lport in javascript web shell", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "javascript" });
      expect(result.payload).toContain("4444");
    });

    it("should default to php for unknown language", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "bash" });
      expect(result.payload).toContain("<?php");
    });

    it("should set type to web_shell on result", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "php" });
      expect(result.type).toBe("web_shell");
    });

    it("should obfuscate when obfuscate is true", () => {
      const plain = generateWebShell({ ...baseConfig, type: "web_shell", language: "php", obfuscate: false });
      const obfuscated = generateWebShell({ ...baseConfig, type: "web_shell", language: "php", obfuscate: true });
      expect(obfuscated.obfuscated).toBe(true);
      expect(obfuscated.payload).not.toBe(plain.payload);
    });

    it("should have positive size for non-empty payload", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "php" });
      expect(result.size).toBeGreaterThan(0);
    });

    it("should report accurate byte size", () => {
      const result = generateWebShell({ ...baseConfig, type: "web_shell", language: "php" });
      expect(result.size).toBe(Buffer.byteLength(result.payload));
    });
  });

  describe("generatePayloadEncoder", () => {
    it("should return a GeneratedPayload object", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      expect(result).toHaveProperty("payload");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("language");
      expect(result).toHaveProperty("obfuscated");
      expect(result).toHaveProperty("size");
    });

    it("should set type to payload_encoder", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      expect(result.type).toBe("payload_encoder");
    });

    it("should use bash as language", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      expect(result.language).toBe("bash");
    });

    it("should set obfuscated to false", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      expect(result.obfuscated).toBe(false);
    });

    it("should include at least one encoding method in payload", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      const encodingMethods = ["base64", "hex", "rot13", "xor"];
      const hasMethod = encodingMethods.some((m) => result.payload.includes(m));
      expect(hasMethod).toBe(true);
    });

    it("should include case statement structure", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      expect(result.payload).toContain("case");
      expect(result.payload).toContain("esac");
    });

    it("should have positive size", () => {
      const result = generatePayloadEncoder({ ...baseConfig, type: "payload_encoder" });
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe("generatePayload", () => {
    it("should dispatch to generateReverseShell for reverse_shell type", () => {
      const config: PayloadConfig = { ...baseConfig, type: "reverse_shell" };
      const result = generatePayload(config);
      expect(result.payload).toContain("bash -i");
    });

    it("should dispatch to generateWebShell for web_shell type", () => {
      const config: PayloadConfig = { ...baseConfig, type: "web_shell", language: "php" };
      const result = generatePayload(config);
      expect(result.payload).toContain("<?php");
    });

    it("should dispatch to generatePayloadEncoder for payload_encoder type", () => {
      const config: PayloadConfig = { ...baseConfig, type: "payload_encoder" };
      const result = generatePayload(config);
      expect(result.type).toBe("payload_encoder");
    });

    it("should handle meterpreter type", () => {
      const config: PayloadConfig = { ...baseConfig, type: "meterpreter" };
      const result = generatePayload(config);
      expect(result.type).toBe("meterpreter");
      expect(result.payload).toContain("msfvenom");
      expect(result.payload).toContain("192.168.1.100");
      expect(result.payload).toContain("4444");
    });

    it("should set meterpreter size to 0", () => {
      const config: PayloadConfig = { ...baseConfig, type: "meterpreter" };
      const result = generatePayload(config);
      expect(result.size).toBe(0);
    });

    it("should default to reverse_shell for unknown type", () => {
      // Since TypeScript enforces types, test the default branch via a cast
      const config = { ...baseConfig, type: "unknown" as any };
      const result = generatePayload(config);
      expect(result.payload).toContain("bash -i");
    });

    it("should return an object with all required fields", () => {
      const result = generatePayload(baseConfig);
      expect(result).toHaveProperty("payload");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("language");
      expect(result).toHaveProperty("obfuscated");
      expect(result).toHaveProperty("size");
    });
  });
});
