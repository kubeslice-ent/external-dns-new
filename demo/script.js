import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 5,
    duration: '1h',
    dns: {
        ttl: '0',
        //select: 'first',
        policy: 'any',
      },
      noConnectionReuse: true,
};

export default function () {
    http.get('http://ns1.wmar.io:30081');
    //sleep(0.1);
}

