"""Start Bravios met Python 3, zonder extra pakketten."""
import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent / "public_html"


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".mjs": "text/javascript; charset=utf-8"}

    def send_head(self):
        # Python voert geen PHP uit. Geef ook nooit PHP-broncode terug.
        if unquote(urlsplit(self.path).path).lower().endswith(".php"):
            data = json.dumps({"error": "Samenspel vereist PHP. Start php server/server.php."}).encode()
            self.send_response(503)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)
            return None
        return super().send_head()


if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", "8080"))
        if not 1 <= port <= 65535:
            raise ValueError("PORT moet tussen 1 en 65535 liggen.")
        with ThreadingHTTPServer(("0.0.0.0", port), partial(Handler, directory=str(ROOT))) as server:
            print(f"Bravios draait op http://localhost:{port} (stop met Ctrl+C)", flush=True)
            print("Samenspel vereist de PHP-server.", flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer gestopt.")
    except (OSError, ValueError) as error:
        raise SystemExit(f"Server kon niet starten: {error}")
