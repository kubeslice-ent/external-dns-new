import http from 'k6/http';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';

const GCPCounter = new Counter('GCPCounter');
const CoxCounter = new Counter('CoxCounter');
const FailCounter = new Counter('FailCounter');

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
    sleep(1);
    if (res.status != 200) {
        FailCounter.add(1);

    } else {
        if (res.remote_ip == '98.190.75.21') {
            CoxCounter.add(1);
        } else {
            GCPCounter.add(1);
        }
    }
}

