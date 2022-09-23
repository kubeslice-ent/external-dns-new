import http from 'k6/http';
import { sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const GCPCounter = new Counter('GCP DNS Counter');
const CoxCounter = new Counter('Cox DNS Counter');
const FailCounter = new Counter('Fail Counter');

const CoxIP = '98.190.75.77';

export const options = {
    vus: 200,
    duration: '10s',
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
    const res = http.get('https://cloudflare-dns.com/dns-query?name=stackpath.wmar1.com&type=A', params);

    if (res.status != 200) {
        FailCounter.add(1);
    } else {
        const resBody = JSON.parse(res.body);
        if (resBody.Answer[0].data == CoxIP) {
            CoxCounter.add(1);
        } else {
            GCPCounter.add(1);
        }
    }
    
    //console.log(JSON.stringify(res));

    sleep(.1);
}

export function handleSummary(data) {

    data.metrics = {
        'GCP DNS Counter': data.metrics['GCP DNS Counter'],
        'Cox DNS Counter': data.metrics['Cox DNS Counter'],
    };

    //return { 'raw-data.json': JSON.stringify(data)};

    return { 'stdout': textSummary(data, { indent: ' ', enableColors: true }) };
}
