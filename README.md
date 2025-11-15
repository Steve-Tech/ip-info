# IP-Info

A simple Cloudflare Worker that shows both your IPv4 and IPv6 address, along with your ISP and approximate location. It will also detect ECN and HTTP/3, as well as warn if your clock is out of sync by more than 15 seconds.

You can test it out here: [ip.stevetech.au](https://ip.stevetech.au)

## Privacy

Everything is kept on Cloudflare's network. No data is kept beyond what Cloudflare automatically logs.

### Dependencies

* All assets (CSS, JS) are served from the Worker's Assets.
* Cloudflare's [1.1.1.1/cdn-cgi/trace](https://1.1.1.1/cdn-cgi/trace) is used for IPv4 and IPv6 discovery.
* Undocumented Cloudflare map tiles are used for the map display, (same tiles used by [speed.cloudflare.com](https://speed.cloudflare.com/)).
* IP information is provided by Cloudflare's Workers API ([IncomingRequestCfProperties](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties)).

## JSON API

A JSON API is available at [`/json`](https://ip.stevetech.au/json) which returns some extra information in addition to that shown on the webpage, although it cannot show browser-detected IPv4/IPv6 addresses. The site will also respond with JSON if the `Accept: application/json` header is sent with the request.
