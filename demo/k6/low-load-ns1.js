import http from 'k6/http';
import { sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const GCPCounter = new Counter('GCP Success Counter');
const CoxCounter = new Counter('Cox Success Counter');
const FailCounter = new Counter('Fail Counter');

const CoxTime = new Trend('Cox Time to First Byte');
const GCPTime = new Trend('GCP Time to First Byte');

const CoxIP = '98.190.75.21';

export const options = {
    vus: 300,
    duration: '1h',
    dns: {
        ttl: '0',
        //select: 'first',
        policy: 'any',
      },
      noConnectionReuse: true,
      noVUConnectionReuse: true,
      //httpDebug: 'full',
}

export default function () {
    const res = http.get('http://ns1.wmar.io:30081/');
    
    if (res.status != 200) {
        FailCounter.add(1);
    } else {
        if (res.remote_ip == CoxIP) {
            CoxCounter.add(1);
            CoxTime.add(res.timings.waiting);
        } else {
            GCPCounter.add(1);
            GCPTime.add(res.timings.waiting);
        }
    }

    sleep(0.5);
}

