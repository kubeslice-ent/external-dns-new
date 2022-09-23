import http from 'k6/http';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const GCPCounter = new Counter('GCP DNS Counter');
const CoxCounter = new Counter('Cox DNS Counter');
const FailCounter = new Counter('Fail Counter');

const CoxIP = '98.190.75.78';

export const options = {
    vus: 200,
    duration: '120s',
    dns: {
        ttl: '0',
        policy: 'any',
    },
    noConnectionReuse: true,
    noVUConnectionReuse: true,
}

const params = {
    headers: { 'accept': 'application/dns-json' },
};

export default function () {
    const res = http.get('https://cloudflare-dns.com/dns-query?name=ns1.wmar.io&type=A', params);

    if (res.status != 200) {
        FailCounter.add(1);
    } else {
        const resBody = JSON.parse(res.body);
        if (resBody.Answer[0].data == CoxIP) {
            //console.log('Cox IP');
            CoxCounter.add(1);
        } else {
            GCPCounter.add(1);
        }
    }
    
    sleep(.1);
}

export function handleSummary(data) {

    if (("GCP DNS Counter" in data.metrics) && ("Cox DNS Counter" in data.metrics) == true) {
        data.metrics = {
            'GCP DNS Counter': data.metrics['GCP DNS Counter'],
            'Cox DNS Counter': data.metrics['Cox DNS Counter'],
        };
    } else if (("GCP DNS Counter" in data.metrics) == true) {
        data.metrics = {
            'GCP DNS Counter': data.metrics['GCP DNS Counter'],
        };
    } else if (("Cox DNS Counter" in data.metrics) == true) {
        data.metrics = {
            'Cox DNS Counter': data.metrics['Cox DNS Counter'],
        };
    } else {
        data.metrics = {};
    }

    return { 'stdout': textSummary(data, { indent: ' ', enableColors: true }) };
}
