import { describe, it, expect } from "vitest";
import { validateUrl, ValidationError } from "../validation";

describe("validateUrl", () => {
  describe("valid URLs", () => {
    it("should allow valid HTTP URLs", () => {
      expect(() => validateUrl("http://example.com")).not.toThrow();
      expect(() => validateUrl("http://example.com/path")).not.toThrow();
      expect(() => validateUrl("http://example.com/path?query=value")).not.toThrow();
    });

    it("should allow valid HTTPS URLs", () => {
      expect(() => validateUrl("https://example.com")).not.toThrow();
      expect(() => validateUrl("https://example.com/path")).not.toThrow();
      expect(() => validateUrl("https://example.com/path?query=value")).not.toThrow();
    });

    it("should allow URLs with subdomains", () => {
      expect(() => validateUrl("https://api.example.com")).not.toThrow();
      expect(() => validateUrl("https://sub.domain.example.com")).not.toThrow();
    });

    it("should allow URLs with ports", () => {
      expect(() => validateUrl("https://example.com:443")).not.toThrow();
      expect(() => validateUrl("http://example.com:8080")).not.toThrow();
    });
  });

  describe("invalid protocols", () => {
    it("should reject FTP URLs", () => {
      expect(() => validateUrl("ftp://example.com")).toThrow(ValidationError);
    });

    it("should reject file:// URLs", () => {
      expect(() => validateUrl("file:///etc/passwd")).toThrow(ValidationError);
    });

    it("should reject data: URLs", () => {
      expect(() => validateUrl("data:text/plain,hello")).toThrow(ValidationError);
    });

    it("should reject javascript: URLs", () => {
      expect(() => validateUrl("javascript:alert(1)")).toThrow(ValidationError);
    });

    it("should reject mailto: URLs", () => {
      expect(() => validateUrl("mailto:test@example.com")).toThrow(ValidationError);
    });
  });

  describe("SSRF protection - localhost", () => {
    it("should reject localhost hostname", () => {
      expect(() => validateUrl("http://localhost")).toThrow(ValidationError);
      expect(() => validateUrl("https://localhost")).toThrow(ValidationError);
    });

    it("should reject 127.0.0.1", () => {
      expect(() => validateUrl("http://127.0.0.1")).toThrow(ValidationError);
      expect(() => validateUrl("https://127.0.0.1")).toThrow(ValidationError);
    });

    it("should reject 127.x.x.x addresses", () => {
      expect(() => validateUrl("http://127.0.0.2")).toThrow(ValidationError);
      expect(() => validateUrl("http://127.1.1.1")).toThrow(ValidationError);
    });

    it("should reject IPv6 localhost", () => {
      expect(() => validateUrl("http://[::1]")).toThrow(ValidationError);
    });
  });

  describe("SSRF protection - private IP ranges", () => {
    it("should reject 10.0.0.0/8 range", () => {
      expect(() => validateUrl("http://10.0.0.1")).toThrow(ValidationError);
      expect(() => validateUrl("http://10.255.255.255")).toThrow(ValidationError);
    });

    it("should reject 172.16.0.0/12 range", () => {
      expect(() => validateUrl("http://172.16.0.1")).toThrow(ValidationError);
      expect(() => validateUrl("http://172.31.255.255")).toThrow(ValidationError);
    });

    it("should reject 192.168.0.0/16 range", () => {
      expect(() => validateUrl("http://192.168.0.1")).toThrow(ValidationError);
      expect(() => validateUrl("http://192.168.255.255")).toThrow(ValidationError);
    });

    it("should reject link-local 169.254.0.0/16 range", () => {
      expect(() => validateUrl("http://169.254.1.1")).toThrow(ValidationError);
    });

    it("should reject 0.0.0.0/8 range", () => {
      expect(() => validateUrl("http://0.0.0.0")).toThrow(ValidationError);
      expect(() => validateUrl("http://0.1.2.3")).toThrow(ValidationError);
    });
  });

  describe("invalid URL format", () => {
    it("should reject malformed URLs", () => {
      expect(() => validateUrl("not-a-url")).toThrow(ValidationError);
      expect(() => validateUrl("://example.com")).toThrow(ValidationError);
      expect(() => validateUrl("http://")).toThrow(ValidationError);
    });

    it("should reject URLs with invalid characters", () => {
      expect(() => validateUrl("http://exa mple.com")).toThrow(ValidationError);
    });
  });

  describe("error messages", () => {
    it("should include the protocol in error message for invalid protocol", () => {
      expect.assertions(2);
      try {
        validateUrl("ftp://example.com");
        throw new Error("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("ftp:");
      }
    });

    it("should include the hostname in error message for localhost", () => {
      expect.assertions(2);
      try {
        validateUrl("http://localhost");
        throw new Error("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("localhost");
      }
    });

    it("should include the URL in error message for invalid format", () => {
      expect.assertions(2);
      try {
        validateUrl("not-a-url");
        throw new Error("Should have thrown ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain("not-a-url");
      }
    });
  });
});
