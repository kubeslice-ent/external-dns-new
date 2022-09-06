import http from 'k6/http';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';

const GCPCounter = new Counter('GCP Success Counter');
const CoxCounter = new Counter('Cox Success Counter');
const GCPFailCounter = new Counter('GCP Fail Counter');
const CoxFailCounter = new Counter('Cox Fail Counter');

export const options = {
    vus: 100,
    duration: '1h',
    dns: {
        ttl: '0',
        policy: 'any',
      },
      noConnectionReuse: true,
      noVUConnectionReuse: true,
      //httpDebug: 'full',
};

export default function () {
    const res = http.get('http://stackpath.wmar1.com:30080/index.html');
    
    if (res.status != 200) {
        if (res.remote_ip == '98.190.75.21') {
            CoxFailCounter.add(1);
        } else {
            GCPFailCounter.add(1);
        }
    } else {
        if (res.remote_ip == '98.190.75.21') {
            CoxCounter.add(1);
        } else {
            GCPCounter.add(1);
        }
    }

    sleep(0.25);
}

