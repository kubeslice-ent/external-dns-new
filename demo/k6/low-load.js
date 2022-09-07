import http from 'k6/http';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';

const GCPCounter = new Counter('GCP Success Counter');
const CoxCounter = new Counter('Cox Success Counter');
const FailCounter = new Counter('Fail Counter');

const CoxIP = '98.190.75.21';

export const options = {
    vus: 400,
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
    const res = http.get('http://stackpath.wmar1.com:30080/');
    
    if (res.status != 200) {
        FailCounter.add(1);
    } else {
        if (res.remote_ip == CoxIP) {
            CoxCounter.add(1);
        } else {
            GCPCounter.add(1);
        }
    }

    sleep(0.5);
}

