import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseNmapXml, quickPortScan, aggressiveScan } from "./nmap";

describe("Nmap Tool Wrapper", () => {
  describe("parseNmapXml", () => {
    it("should parse valid Nmap XML output", () => {
      const xmlOutput = `<?xml version="1.0"?>
        <nmaprun scanner="nmap" args="nmap -p 80,443 127.0.0.1" start="1234567890" version="7.92">
          <host starttime="1234567890" endtime="1234567900">
            <status state="up" reason="localhost-response"/>
            <address addr="127.0.0.1" addrtype="ipv4"/>
            <hostnames>
              <hostname name="localhost" type="PTR"/>
            </hostnames>
            <ports>
              <port protocol="tcp" portid="80">
                <state state="open" reason="syn-ack"/>
                <service name="http" product="Apache httpd" version="2.4.41"/>
              </port>
              <port protocol="tcp" portid="443">
                <state state="open" reason="syn-ack"/>
                <service name="https" product="Apache httpd" version="2.4.41"/>
              </port>
            </ports>
            <os>
              <osmatch name="Linux 5.4 - 5.10" accuracy="95"/>
            </os>
          </host>
        </nmaprun>`;

      const result = parseNmapXml(xmlOutput);

      expect(result.hosts).toHaveLength(1);
      expect(result.hosts[0].ip).toBe("127.0.0.1");
      expect(result.hosts[0].ports).toHaveLength(2);
      expect(result.hosts[0].ports[0].port).toBe(80);
      expect(result.hosts[0].ports[0].state).toBe("open");
      expect(result.hosts[0].ports[0].service).toBe("http");
      expect(result.hosts[0].os).toContain("Linux");
    });

    it("should handle empty port list", () => {
      const xmlOutput = `<?xml version="1.0"?>
        <nmaprun scanner="nmap" version="7.92">
          <host starttime="1234567890" endtime="1234567900">
            <status state="up" reason="localhost-response"/>
            <address addr="192.168.1.1" addrtype="ipv4"/>
            <ports/>
          </host>
        </nmaprun>`;

      const result = parseNmapXml(xmlOutput);

      expect(result.hosts).toHaveLength(1);
      expect(result.hosts[0].ports).toHaveLength(0);
    });

    it("should handle multiple hosts", () => {
      const xmlOutput = `<?xml version="1.0"?>
        <nmaprun scanner="nmap" version="7.92">
          <host>
            <status state="up"/>
            <address addr="192.168.1.1" addrtype="ipv4"/>
            <ports>
              <port protocol="tcp" portid="22">
                <state state="open"/>
                <service name="ssh"/>
              </port>
            </ports>
          </host>
          <host>
            <status state="up"/>
            <address addr="192.168.1.2" addrtype="ipv4"/>
            <ports>
              <port protocol="tcp" portid="80">
                <state state="open"/>
                <service name="http"/>
              </port>
            </ports>
          </host>
        </nmaprun>`;

      const result = parseNmapXml(xmlOutput);

      expect(result.hosts).toHaveLength(2);
      expect(result.hosts[0].ip).toBe("192.168.1.1");
      expect(result.hosts[1].ip).toBe("192.168.1.2");
    });

    it("should extract service version information", () => {
      const xmlOutput = `<?xml version="1.0"?>
        <nmaprun scanner="nmap" version="7.92">
          <host>
            <status state="up"/>
            <address addr="10.0.0.1" addrtype="ipv4"/>
            <ports>
              <port protocol="tcp" portid="3306">
                <state state="open"/>
                <service name="mysql" product="MySQL" version="5.7.32"/>
              </port>
            </ports>
          </host>
        </nmaprun>`;

      const result = parseNmapXml(xmlOutput);

      expect(result.hosts[0].ports[0].service).toBe("mysql");
      expect(result.hosts[0].ports[0].version).toBe("5.7.32");
    });

    it("should handle filtered ports", () => {
      const xmlOutput = `<?xml version="1.0"?>
        <nmaprun scanner="nmap" version="7.92">
          <host>
            <status state="up"/>
            <address addr="10.0.0.1" addrtype="ipv4"/>
            <ports>
              <port protocol="tcp" portid="445">
                <state state="filtered" reason="no-response"/>
              </port>
              <port protocol="tcp" portid="139">
                <state state="closed" reason="reset"/>
              </port>
            </ports>
          </host>
        </nmaprun>`;

      const result = parseNmapXml(xmlOutput);

      expect(result.hosts[0].ports).toHaveLength(2);
      expect(result.hosts[0].ports[0].state).toBe("filtered");
      expect(result.hosts[0].ports[1].state).toBe("closed");
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed XML gracefully", () => {
      const malformedXml = "<invalid>xml</invalid>";

      // Should return empty result for non-nmap XML
      const result = parseNmapXml(malformedXml);
      expect(result.hosts).toHaveLength(0);
    });

    it("should handle empty XML", () => {
      const emptyXml = "";

      expect(() => parseNmapXml(emptyXml)).toThrow();
    });
  });
});
