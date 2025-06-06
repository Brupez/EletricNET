import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let res = http.get('http://deti-tqs-05.ua.pt:8081/api/slots');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}