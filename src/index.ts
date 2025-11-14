/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
        if (request.method !== "GET") {
            return new Response("Method Not Allowed", { status: 405 });
        }
        const url = new URL(request.url);
        if (url.pathname !== '/' && url.pathname !== '/json') {
            return new Response("Not Found", { status: 404 });
        }
        const info = {
            'userAgent': request.headers.get('User-Agent'),
            'ip': request.headers.get('CF-Connecting-IP'),
            'asn': request?.cf?.asn,
            'asOrganization': request?.cf?.asOrganization,
            'colo': request?.cf?.colo,
            'country': request?.cf?.country,
            'isEUCountry': request?.cf?.isEUCountry,
            'httpProtocol': request?.cf?.httpProtocol,
            'tlsCipher': request?.cf?.tlsCipher,
            'tlsVersion': request?.cf?.tlsVersion,
            'city': request?.cf?.city,
            'continent': request?.cf?.continent,
            'latitude': request?.cf?.latitude,
            'longitude': request?.cf?.longitude,
            'postalCode': request?.cf?.postalCode,
            'metroCode': request?.cf?.metroCode,
            'region': request?.cf?.region,
            'regionCode': request?.cf?.regionCode,
            'timezone': request?.cf?.timezone,
        }
        if (url.pathname === '/json' || request.headers.get('Accept') === 'application/json') {
            return new Response(JSON.stringify(info, null, 2), {
                headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            });
        }
        return new Response(generateHTML(info), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
	},
} satisfies ExportedHandler<Env>;


function generateHTML(info: {[key: string]: any}): string {
return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP Info</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/cosmo/bootstrap.min.css" integrity="sha512-ZtH2WUkjnGtgiEQaq0c5Xht1VXlvGauf7mc1sEF6gi64bJAIfwyP+Jjh2AQppTVaA13EBZhrrnGckbVewXC5yQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script type="text/javascript" src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/protomaps-leaflet@5.0.0/dist/protomaps-leaflet.js"></script>
    <script>
        const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (darkMode)
            document.querySelector('html').dataset.bsTheme = 'dark';
    </script>
</head>
<body>
    <main class="container my-4">
        <h1 class="text-center">Your IP</h1>
        <noscript>
            <div class="alert alert-danger">
                <strong>Some elements on this page require JavaScript!</strong>
            </div>
        </noscript>
        <div id="time-sync" class="d-none alert alert-warning">
            <strong>Your clock is <span id="time-difference"></span> out of sync!</strong>
            This can cause issues with modern security features.
            <a href="https://mytime.stevetech.au" target="_blank" rel="noopener">Verify your time here.</a>
        </div>
        <div class="row">
            <div class="col-md-6 d-flex flex-column">
                <div class="card h-100 mt-4">
                    <div class="card-header"><h5 class="text-center mb-0">IPv4</h5></div>
                    <div class="card-body">
                        <p class="card-text text-center fs-1"><code id="ipv4">${info.ip?.includes('.') ? info.ip : 'Loading...'}</code></p>
                        <div id="ipv4-different" class="d-none alert alert-warning">
                            <strong>Your browser used different IPs!</strong>
                            This might cause issues with some websites.
                        </div>
                    </div>
                </div>
                <div class="card h-100 mt-4">
                    <div class="card-header"><h5 class="text-center mb-0">IPv6</h5></div>
                    <div class="card-body">
                        <p class="card-text text-center fs-3"><code id="ipv6">${info.ip?.includes(':') ? info.ip : 'Loading...'}</code></p>
                        <div id="ipv6-preferred" class="d-none alert alert-success">
                            <strong>Hooray!</strong> Your browser supports and prefers IPv6.
                        </div>
                        <div id="ipv6-avoided" class="d-none alert alert-danger">
                            <strong>Your browser is avoiding IPv6!</strong>
                            This is often due to a configuration issue.
                        </div>
                        <div id="ipv6-different" class="d-none alert alert-warning">
                            <strong>Your browser used different IPs!</strong>
                            This might cause issues with some websites.
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex flex-column">
                <div class="card h-100 mt-4">
                    <div class="card-header"><h5 class="text-center mb-0">IP Info</h5></div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">User-Agent: <code id="user-agent">${info.userAgent ?? "N/A"}</code></li>
                        <li class="list-group-item">Request IP: <code id="connecting-ip">${info.ip ?? "N/A"}</code>${info.isEUCountry ? ' <abbr title="EU/GDPR Protected">🇪🇺</abbr>' : ''}</li>
                        <li class="list-group-item">Protocol: <code id="protocol">${info.httpProtocol ?? "N/A"}</code>${info.tlsVersion ? " & <code>" + info.tlsVersion + "</code>" : ""}</li>
                        <li class="list-group-item">ASN: <code id="asn">${info.asn ?? "N/A"}</code></li>
                        <li class="list-group-item">ISP: <code id="organization">${info.asOrganization ?? "N/A"}</code></li>
                        <li class="list-group-item">City: <code id="city">${info.city ?? "N/A"}</code></li>
                        <li class="list-group-item">Region: <code id="region">${info.region ?? "N/A"}</code></li>
                        <li class="list-group-item">Country: <code id="country">${info.country ?? "N/A"}</code></li>
                        <li class="list-group-item">Postal Code: <code id="postal-code">${info.postalCode ?? "N/A"}</code></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="card h-100 mt-4">
            <div class="card-header"><h5 class="text-center mb-0">Estimated Location</h5></div>
            <div class="card-body">
                <div id="map" class="w-100" style="height: 40vh;"></div>
            </div>
        </div>
    </main>
    <footer class="container text-center mb-4">
        <p class="m-0">Locations are approximate and may not reflect your actual location.</p>
        <p class="m-0">Built with Cloudflare Workers - <a href="https://github.com/Steve-Tech/ip-info" target="_blank" rel="noopener">View Source Code</a></p>
        <div class="d-flex justify-content-center my-3 text-center">
            <span class="py-2 px-4 badge rounded-pill bg-primary">© Stephen Horvath 2025</span>
        </div>
    </footer>
    <script>
        function parseCDNTrace(data) {
            const info = {};
            data.split('\\n').forEach(line => {
                const [key, value] = line.split('=');
                info[key] = value;
            });
            return info;
        }
        const requestIP = document.getElementById('connecting-ip').textContent;
        // Get IPv4
        fetch('https://1.1.1.1/cdn-cgi/trace')
            .then(response => response.text())
            .then(data => parseCDNTrace(data))
            .then(info => {
                document.getElementById('ipv4').textContent = info['ip'];
                if (requestIP.includes('.') && requestIP !== info['ip']) {
                    document.getElementById('ipv4-different').classList.remove('d-none');
                }
            }).catch(() => {
                document.getElementById('ipv4').textContent = 'N/A';
            });
        // Get IPv6
        fetch('https://[2606:4700:4700::1111]/cdn-cgi/trace')
            .then(response => response.text())
            .then(data => parseCDNTrace(data))
            .then(info => {
                document.getElementById('ipv6').textContent = info['ip'];
                if (requestIP !== info['ip']) {
                    if (requestIP.includes(':')) {
                        document.getElementById('ipv6-different').classList.remove('d-none');
                    } else {
                        document.getElementById('ipv6-avoided').classList.remove('d-none');
                    }
                } else {
                    if (requestIP.includes(':')) {
                        document.getElementById('ipv6-preferred').classList.remove('d-none');
                    }
                }
            }).catch(() => {
                document.getElementById('ipv6').textContent = 'N/A';
            });
        // Check SNI and Time
        // The Workers API doesn't expose SNI info?
        fetch('/cdn-cgi/trace')
            .then(response => response.text())
            .then(data => parseCDNTrace(data))
            .then(info => {
                if (info['sni'] === "encrypted") {
                    document.getElementById('protocol').parentElement.innerHTML += ' with <abbr title="Encrypted Client Hello">ECH</abbr>';
                }
                if (info['ts']) {
                    const serverTime = new Date(parseInt(info['ts']) * 1000);
                    const localTime = new Date();
                    const timeDiff = Math.abs(localTime - serverTime) / 1000; // in seconds
                    if (timeDiff > 15) {
                        const timeDiffMinutes = Math.floor(timeDiff / 60);
                        const timeDiffSeconds = Math.floor(timeDiff % 60);
                        let displayDiff = '';
                        if (timeDiffMinutes > 0) {
                            displayDiff += timeDiffMinutes + ' minute' + (timeDiffMinutes > 1 ? 's' : '');
                        }
                        if (timeDiffSeconds > 0) {
                            if (displayDiff.length > 0) displayDiff += ' and ';
                            displayDiff += timeDiffSeconds + ' second' + (timeDiffSeconds > 1 ? 's' : '');
                        }
                        document.getElementById('time-difference').textContent = displayDiff;
                        document.getElementById('time-sync').classList.remove('d-none');
                    }

                }
            }).catch(() => {});
        const map = L.map('map', {minZoom: 0, maxZoom: 8}).setView([${info.latitude}, ${info.longitude}], 7);
        L.marker([${info.latitude}, ${info.longitude}]).addTo(map);
        protomapsL.leafletLayer({url:'https://platform.dash.cloudflare.com/map-tiles/planet_z7/{z}/{x}/{y}.mvt', flavor: darkMode ? 'black' : 'white', lang: 'en'}).addTo(map);
    </script>
</body>
</html>`
};
